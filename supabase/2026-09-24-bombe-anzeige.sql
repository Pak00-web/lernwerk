-- Lernwerk: Bomben-Quiz zeigt, was geantwortet wurde (auch von KI-Mitspielern) – Nachtrag 24.09.2026, nach 2026-09-23-ki.sql ausführen.
-- "letzte" enthält jetzt zusätzlich frage, wahl und richtig der beantworteten Frage (die Frage ist danach ohnehin vorbei).

drop function if exists public._bombe_antworten(uuid, uuid, boolean);
create or replace function public._bombe_antworten(p_raum uuid, p_wer uuid, p_ok boolean, p_wahl integer default null) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; f text; an uuid; info jsonb;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  info := jsonb_build_object('frage', r.frage_id, 'wahl', p_wahl, 'richtig', _frage_richtig(r.frage_id), 'ok', p_ok);
  if p_ok then
    an := _bombe_naechster(r, p_wer);
    update bomben_raeume set richtige = richtige || jsonb_build_object(p_wer::text, coalesce((richtige->>p_wer::text)::int, 0) + 1),
      bombe_bei = an, letzte = jsonb_build_object('art','weiter','von',p_wer,'an',an) || info, gesperrt_bis = null where id = p_raum;
  else
    update bomben_raeume set letzte = jsonb_build_object('art','falsch','wer',p_wer) || info, gesperrt_bis = now() + interval '2 seconds' where id = p_raum;
  end if;
  f := _frage_neu((select gesehen from bomben_geheim where raum_id = p_raum));
  update bomben_raeume set frage_id = f, frage_nr = frage_nr + 1, geaendert = now() where id = p_raum;
  update bomben_geheim set gesehen = (case when coalesce(array_length(gesehen, 1), 0) > 40 then gesehen[2:] else gesehen end) || f where raum_id = p_raum;
end $$;

create or replace function public.bombe_antwort(p_raum uuid, p_nr integer, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r bomben_raeume; ok boolean; f text;
begin
  perform _bombe_mitglied(p_raum);
  perform _bombe_check(p_raum);
  select * into r from bomben_raeume where id = p_raum for update;
  if r.status <> 'laeuft' or r.frage_nr <> p_nr then return _bombe_ansicht(p_raum); end if;
  if r.bombe_bei <> me then raise exception 'Die Bombe ist nicht bei dir.'; end if;
  if r.gesperrt_bis is not null and now() < r.gesperrt_bis then raise exception 'Kurz warten …'; end if;
  f := r.frage_id; ok := _frage_ok(f, p_wahl);
  perform _bombe_antworten(p_raum, me, ok, p_wahl);
  return _bombe_ansicht(p_raum) || jsonb_build_object('antwort', jsonb_build_object('ok', ok, 'richtig', _frage_richtig(f), 'frage', f));
end $$;

-- Bot wählt eine konkrete Antwort: richtig oder eine zufällige falsche
create or replace function public._bombe_bot(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; g bomben_geheim; q float; wahl integer; n integer;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  if r.status <> 'laeuft' or r.bombe_bei is null or not _bombe_ist_bot(r, r.bombe_bei) then return; end if;
  select * into g from bomben_geheim where raum_id = p_raum for update;
  if g.bot_nr is distinct from r.frage_nr then
    q := coalesce((select (b->>'q')::float from jsonb_array_elements(r.bots) b where b->>'id' = r.bombe_bei::text), 0.7);
    update bomben_geheim set bot_nr = r.frage_nr, bot_ok = random() < q,
      bot_bis = greatest(now(), coalesce(r.gesperrt_bis, now())) + make_interval(secs => 2 + random() * 4) where raum_id = p_raum;
  elsif now() >= g.bot_bis then
    wahl := _frage_richtig(r.frage_id);
    if not g.bot_ok then
      select anzahl into n from spiel_fragen where id = r.frage_id;
      wahl := (wahl + 1 + floor(random() * greatest(coalesce(n, 2) - 1, 1))::int) % greatest(coalesce(n, 2), 2);
    end if;
    perform _bombe_antworten(p_raum, r.bombe_bei, g.bot_ok, wahl);
  end if;
end $$;

do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname in ('_bombe_antworten', '_bombe_bot', 'bombe_antwort') loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    if f.proname like '\_%' then execute format('revoke execute on function %s from authenticated', f.sig);
    else execute format('grant execute on function %s to authenticated', f.sig); end if;
  end loop;
end $$;

select 'Bomben-Quiz: Antworten werden jetzt angezeigt' as ergebnis;
