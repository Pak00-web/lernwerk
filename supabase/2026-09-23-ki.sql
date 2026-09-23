-- Lernwerk: KI-Gegner für Wissens-Arena und Bomben-Quiz (Nachtrag 23.09.2026, nach 2026-09-22-games.sql ausführen)
-- Gegen die KI gibt es halbe XP/Coins und keine Rangpunkte; die Arena-Statistik (Siege, Serie) bleibt unberührt.
-- Wann und wie gut die KI antwortet, würfelt der Server und hält es geheim.

-- ============ Wissens-Arena gegen KI ============
alter table public.arena_matches alter column spieler_b drop not null;
alter table public.arena_matches add column if not exists ki jsonb;          -- {name, staerke, q, min, max}
alter table public.arena_geheim  add column if not exists ki_plan jsonb;     -- je Runde {ms, ok}

-- Mitglied: spieler_b kann jetzt leer sein (KI) – "not in (a, null)" wäre nie wahr, daher is distinct from
create or replace function public._arena_mitglied(p_id uuid) returns arena_matches
language plpgsql security definer set search_path = public as $$
declare m arena_matches;
begin
  select * into m from arena_matches where id = p_id;
  if not found or auth.uid() is null or (auth.uid() is distinct from m.spieler_a and auth.uid() is distinct from m.spieler_b) then raise exception 'Match nicht gefunden'; end if;
  return m;
end $$;

create or replace function public.arena_gegen_ki(p_staerke text default 'mittel') returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); mid uuid; k jsonb;
begin
  if me is null or meine_klasse() is null then raise exception 'Für die Arena brauchst du ein Konto.'; end if;
  k := case p_staerke
    when 'leicht' then '{"name":"Lern-Bot Lumi","staerke":"leicht","q":0.5,"min":6000,"max":13000}'
    when 'schwer' then '{"name":"Prüfer-Bot Primus","staerke":"schwer","q":0.87,"min":2500,"max":8000}'
    else '{"name":"Quiz-Bot Quirin","staerke":"mittel","q":0.7,"min":4500,"max":11000}' end::jsonb;
  perform _konto(me);
  update arena_matches set status = 'abgebrochen', frage_id = null, geaendert = now() where spieler_a = me and spieler_b is null and status = 'laeuft';
  delete from arena_warteschlange where user_id = me;
  insert into arena_matches (klasse_id, spieler_a, spieler_b, status, ki) values (meine_klasse(), me, null, 'laeuft', k) returning id into mid;
  insert into arena_geheim (match_id, fragen, ki_plan) values (mid, array(select id from spiel_fragen order by random() limit 5),
    (select jsonb_agg(jsonb_build_object('ms', (k->>'min')::int + floor(random() * ((k->>'max')::int - (k->>'min')::int))::int, 'ok', random() < (k->>'q')::float)) from generate_series(1, 5)));
  if (select coalesce(array_length(fragen, 1), 0) from arena_geheim where match_id = mid) < 5 then raise exception 'Es sind noch keine Spielfragen hinterlegt (spiel-fragen.sql ausführen).'; end if;
  perform _arena_runde(mid);
  return _arena_ansicht(mid);
end $$;

-- KI antwortet, sobald ihre geplante Zeit in der Runde erreicht ist (wird bei jeder Abfrage geprüft)
create or replace function public._arena_ki(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches; pl jsonb; ms integer; ok boolean; wahl integer; n integer; schaden integer;
begin
  select * into m from arena_matches where id = p_id for update;
  if not found or m.ki is null or m.status <> 'laeuft' or m.b_fertig or m.runde_start is null then return; end if;
  select g.ki_plan->(m.runde - 1) into pl from arena_geheim g where g.match_id = p_id;
  ms := coalesce((pl->>'ms')::int, 9000); ok := coalesce((pl->>'ok')::boolean, false);
  if now() < m.runde_start + make_interval(secs => ms / 1000.0) then return; end if;
  wahl := _frage_richtig(m.frage_id);
  if not ok then
    select anzahl into n from spiel_fragen where id = m.frage_id;
    wahl := (wahl + 1 + floor(random() * greatest(coalesce(n, 2) - 1, 1))::int) % greatest(coalesce(n, 2), 2);
  end if;
  schaden := case when not ok then 0 when ms <= 4000 then 14 when ms <= 9000 then 11 else 8 end;
  update arena_geheim set antworten = jsonb_set(antworten, array[m.runde::text],
    coalesce(antworten->(m.runde::text), '{}') || jsonb_build_object('b', jsonb_build_object('ok', ok, 'ms', ms, 'schaden', schaden, 'wahl', wahl)))
  where match_id = p_id;
  update arena_matches set b_fertig = true, geaendert = now() where id = p_id returning * into m;
  if m.a_fertig then perform _arena_aufloesen(p_id); end if;
end $$;

create or replace function public._arena_pruefen(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches;
begin
  perform _arena_ki(p_id);
  select * into m from arena_matches where id = p_id for update;
  if m.status = 'angefragt' and m.erstellt < now() - interval '15 minutes' then
    update arena_matches set status = 'abgebrochen', geaendert = now() where id = p_id;
  elsif m.status = 'laeuft' and m.runde_ende < now() - interval '2 minutes' then
    update arena_matches set status = 'abgebrochen', frage_id = null, geaendert = now() where id = p_id;   -- beide weg: ohne Wertung
  elsif m.status = 'laeuft' and now() > m.runde_ende + interval '1 second' then
    perform _arena_aufloesen(p_id);
  end if;
end $$;

-- Abschluss: gegen KI halbe Belohnung, keine Rangpunkte, Arena-Statistik unverändert
create or replace function public._arena_abschluss(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches; erg text; i integer; uid uuid; e text; k spieler_konto; d integer; ri integer; rp jsonb := '{}';
begin
  select * into m from arena_matches where id = p_id for update;
  erg := case when m.hp_a > m.hp_b then 'a' when m.hp_b > m.hp_a then 'b' else 'remis' end;
  if m.ki is not null then
    e := case erg when 'remis' then 'remis' when 'a' then 'sieg' else 'niederlage' end;
    ri := (select count(*) from jsonb_array_elements(m.verlauf) v where (v->'a'->>'ok')::boolean);
    perform _belohnen(m.spieler_a, 'arena', e, case e when 'sieg' then 30 when 'remis' then 18 else 10 end, case e when 'sieg' then 20 when 'remis' then 10 else 5 end, ri,
                      jsonb_build_object('rp', 0, 'ki', true, 'gegner', m.ki->>'name', 'hp', m.hp_a));
    update arena_matches set status = 'fertig', ergebnis = erg, sieger = case erg when 'a' then spieler_a end,
      rp_a = 0, rp_b = 0, frage_id = null, geaendert = now() where id = p_id;
    return;
  end if;
  for i in 0..1 loop
    uid := case when i = 0 then m.spieler_a else m.spieler_b end;
    e := case when erg = 'remis' then 'remis' when (erg = 'a') = (i = 0) then 'sieg' else 'niederlage' end;
    select * into k from spieler_konto where user_id = uid for update;
    d := case e when 'sieg' then 25 + 5 * least(k.arena_serie, 3) when 'remis' then 5 else -15 end;
    d := greatest(d, -k.rang_punkte);
    update spieler_konto set rang_punkte = rang_punkte + d,
      arena_siege = arena_siege + (e = 'sieg')::int, arena_niederlagen = arena_niederlagen + (e = 'niederlage')::int, arena_remis = arena_remis + (e = 'remis')::int,
      arena_serie = case when e = 'sieg' then arena_serie + 1 else 0 end,
      arena_serie_best = greatest(arena_serie_best, case when e = 'sieg' then arena_serie + 1 else 0 end)
    where user_id = uid;
    ri := (select count(*) from jsonb_array_elements(m.verlauf) v where (v->(case when i = 0 then 'a' else 'b' end)->>'ok')::boolean);
    perform _belohnen(uid, 'arena', e, case e when 'sieg' then 60 when 'remis' then 35 else 20 end, case e when 'sieg' then 40 when 'remis' then 20 else 10 end, ri,
                      jsonb_build_object('rp', d, 'gegner', (select spitzname from profile where id = case when i = 0 then m.spieler_b else m.spieler_a end),
                                         'hp', case when i = 0 then m.hp_a else m.hp_b end));
    rp := rp || jsonb_build_object(case when i = 0 then 'a' else 'b' end, d);
  end loop;
  update arena_matches set status = 'fertig', ergebnis = erg, sieger = case erg when 'a' then spieler_a when 'b' then spieler_b end,
    rp_a = (rp->>'a')::int, rp_b = (rp->>'b')::int, frage_id = null, geaendert = now() where id = p_id;
end $$;

-- ============ Bomben-Quiz mit KI-Mitspielern ============
-- Bots stehen mit einer eigenen Zufalls-ID in spieler[] (so gelten Reihenfolge, Leben und Weitergabe unverändert),
-- Name und Stärke in bots[]. Ist die Bombe bei einem Bot, antwortet der Server nach 2–6 s.
alter table public.bomben_raeume add column if not exists bots jsonb not null default '[]';   -- [{id, n, q}]
alter table public.bomben_geheim add column if not exists bot_nr integer;
alter table public.bomben_geheim add column if not exists bot_bis timestamptz;
alter table public.bomben_geheim add column if not exists bot_ok boolean;

create or replace function public._bombe_ist_bot(r bomben_raeume, u uuid) returns boolean language sql immutable as $$
  select exists (select 1 from jsonb_array_elements(r.bots) b where b->>'id' = u::text)
$$;
create or replace function public._bombe_menschen(r bomben_raeume) returns uuid[] language sql immutable as $$
  select coalesce(array(select u from unnest(r.spieler) u where not exists (select 1 from jsonb_array_elements(r.bots) b where b->>'id' = u::text)), '{}')
$$;

create or replace function public._bombe_ansicht(p_raum uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(r) || jsonb_build_object('jetzt', now(),
    'namen', (select coalesce(jsonb_object_agg(p.id, jsonb_build_object('n', p.spitzname, 'f', p.farbe)), '{}') from profile p where p.id = any(r.spieler))
          || (select coalesce(jsonb_object_agg(b->>'id', jsonb_build_object('n', b->>'n', 'f', 'ink-3', 'ki', true)), '{}') from jsonb_array_elements(r.bots) b))
  from bomben_raeume r where r.id = p_raum
$$;

create or replace function public.bombe_bot_hinzu(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume := _bombe_mitglied(p_raum); bid uuid := gen_random_uuid(); n text;
begin
  if r.host <> auth.uid() then raise exception 'Nur wer den Raum erstellt hat, kann KI-Mitspieler hinzufügen.'; end if;
  if r.status <> 'lobby' then raise exception 'Das Spiel läuft schon.'; end if;
  if array_length(r.spieler, 1) >= 6 then raise exception 'Der Raum ist voll (6 Spieler).'; end if;
  select x into n from unnest(array['Robo Rita','Byte-Bernd','Chip-Charlie','Pixel-Paula','Kernel-Kai','Cache-Carla']) x
    where not exists (select 1 from jsonb_array_elements(r.bots) b where b->>'n' = x) order by random() limit 1;
  update bomben_raeume set spieler = spieler || bid, leben = leben || jsonb_build_object(bid::text, 2),
    bots = bots || jsonb_build_array(jsonb_build_object('id', bid, 'n', coalesce(n, 'KI'), 'q', round((0.55 + random() * 0.3)::numeric, 2))), geaendert = now()
  where id = p_raum;
  return _bombe_ansicht(p_raum);
end $$;

create or replace function public.bombe_bot_weg(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume := _bombe_mitglied(p_raum); bid text;
begin
  if r.host <> auth.uid() then raise exception 'Nur wer den Raum erstellt hat, kann KI-Mitspieler entfernen.'; end if;
  if r.status <> 'lobby' or jsonb_array_length(r.bots) = 0 then return _bombe_ansicht(p_raum); end if;
  bid := r.bots->-1->>'id';
  update bomben_raeume set spieler = array_remove(spieler, bid::uuid), leben = leben - bid, bots = bots - (jsonb_array_length(bots) - 1), geaendert = now() where id = p_raum;
  return _bombe_ansicht(p_raum);
end $$;

-- Antwort verbuchen (Mensch oder Bot): richtig → Bombe weiter, falsch → 2 s gesperrt; danach neue Frage
create or replace function public._bombe_antworten(p_raum uuid, p_wer uuid, p_ok boolean) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; f text; an uuid;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  if p_ok then
    an := _bombe_naechster(r, p_wer);
    update bomben_raeume set richtige = richtige || jsonb_build_object(p_wer::text, coalesce((richtige->>p_wer::text)::int, 0) + 1),
      bombe_bei = an, letzte = jsonb_build_object('art','weiter','von',p_wer,'an',an), gesperrt_bis = null where id = p_raum;
  else
    update bomben_raeume set letzte = jsonb_build_object('art','falsch','wer',p_wer), gesperrt_bis = now() + interval '2 seconds' where id = p_raum;
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
  perform _bombe_antworten(p_raum, me, ok);
  return _bombe_ansicht(p_raum) || jsonb_build_object('antwort', jsonb_build_object('ok', ok, 'richtig', _frage_richtig(f), 'frage', f));
end $$;

-- Bot am Zug: beim ersten Blick auf eine neue Frage Denkzeit und Ergebnis würfeln, danach antworten
create or replace function public._bombe_bot(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; g bomben_geheim; q float;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  if r.status <> 'laeuft' or r.bombe_bei is null or not _bombe_ist_bot(r, r.bombe_bei) then return; end if;
  select * into g from bomben_geheim where raum_id = p_raum for update;
  if g.bot_nr is distinct from r.frage_nr then
    q := coalesce((select (b->>'q')::float from jsonb_array_elements(r.bots) b where b->>'id' = r.bombe_bei::text), 0.7);
    update bomben_geheim set bot_nr = r.frage_nr, bot_ok = random() < q,
      bot_bis = greatest(now(), coalesce(r.gesperrt_bis, now())) + make_interval(secs => 2 + random() * 4) where raum_id = p_raum;
  elsif now() >= g.bot_bis then
    perform _bombe_antworten(p_raum, r.bombe_bei, g.bot_ok);
  end if;
end $$;

-- Ende: nur Menschen werden belohnt; mit Bots im Raum die Hälfte
create or replace function public._bombe_fertig(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; u uuid; l uuid[]; sieg boolean; ki boolean;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  l := _bombe_lebend(r); ki := jsonb_array_length(r.bots) > 0;
  update bomben_raeume set status = 'fertig', sieger = l[1], bombe_bei = null, geaendert = now() where id = p_raum;
  foreach u in array _bombe_menschen(r) loop
    sieg := u = l[1];
    perform _belohnen(u, 'bombe', case when sieg then 'sieg' else 'niederlage' end,
                      case when sieg then 40 else 15 end / case when ki then 2 else 1 end, case when sieg then 30 else 10 end / case when ki then 2 else 1 end,
                      coalesce((r.richtige->>u::text)::int, 0), jsonb_build_object('spieler', array_length(r.spieler, 1), 'runden', r.runde, 'ki', ki));
  end loop;
end $$;

-- Explosion; ohne lebende Menschen ist das Spiel sofort vorbei
create or replace function public._bombe_check(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; t timestamptz; opfer uuid; lb integer;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  if r.status <> 'laeuft' then return; end if;
  select explodiert_um into t from bomben_geheim where raum_id = p_raum;
  if t is null or now() < t then return; end if;
  opfer := r.bombe_bei;
  lb := coalesce((r.leben->>opfer::text)::int, 1) - 1;
  update bomben_raeume set status = 'boom', leben = leben || jsonb_build_object(opfer::text, lb),
    raus = case when lb <= 0 then raus || opfer else raus end,
    letzte = jsonb_build_object('art','boom','opfer',opfer,'zeit',t,'raus',lb <= 0), geaendert = now()
  where id = p_raum returning * into r;
  if coalesce(array_length(_bombe_lebend(r), 1), 0) <= 1 or not (_bombe_lebend(r) && _bombe_menschen(r)) then perform _bombe_fertig(p_raum); end if;
end $$;

create or replace function public.bombe_pruefen(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _bombe_mitglied(p_raum);
  perform _bombe_check(p_raum);
  perform _bombe_bot(p_raum);
  return _bombe_ansicht(p_raum);
end $$;

-- Verlassen: zählt nur Menschen (ein Raum nur mit Bots wird geschlossen)
create or replace function public.bombe_verlassen(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r bomben_raeume := _bombe_mitglied(p_raum); rest uuid[];
begin
  rest := array_remove(_bombe_menschen(r), me);
  if r.status = 'lobby' then
    if coalesce(array_length(rest, 1), 0) = 0 then delete from bomben_raeume where id = p_raum; return; end if;
    update bomben_raeume set spieler = array_remove(spieler, me), leben = leben - me::text,
      host = case when host = me then rest[1] else host end, geaendert = now() where id = p_raum;
  elsif r.status in ('laeuft','boom') then
    update bomben_raeume set leben = leben || jsonb_build_object(me::text, 0), raus = case when me = any(raus) then raus else raus || me end,
      letzte = jsonb_build_object('art','verlassen','wer',me), geaendert = now() where id = p_raum returning * into r;
    if coalesce(array_length(_bombe_lebend(r), 1), 0) <= 1 or not (_bombe_lebend(r) && _bombe_menschen(r)) then perform _bombe_fertig(p_raum);
    elsif r.status = 'laeuft' and r.bombe_bei = me then perform _bombe_runde(p_raum, _bombe_naechster(r, me));
    end if;
  end if;
end $$;

-- ============ Rechte ============
do $$
declare f record; rpcs text[] := array['arena_gegen_ki','bombe_bot_hinzu','bombe_bot_weg','bombe_antwort','bombe_pruefen','bombe_verlassen'];
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like '\_%' or p.proname = any(rpcs)) loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    if f.proname like '\_%' then execute format('revoke execute on function %s from authenticated', f.sig);
    else execute format('grant execute on function %s to authenticated', f.sig); end if;
  end loop;
end $$;

select 'KI-Gegner für Arena und Bomben-Quiz eingerichtet' as ergebnis;
