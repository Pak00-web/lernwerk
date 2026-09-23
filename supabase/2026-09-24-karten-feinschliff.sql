-- Lernwerk Legends – Feinschliff
-- Zugfrage mit 20-Sekunden-Timer, Rechenfragen mit Zufallszahlen (Zahlensysteme), Wiederholungen spielübergreifend meiden.
-- Nach 2026-09-23-karten-v2.sql und 2026-09-24-bombe-anzeige.sql im SQL Editor ausführen, danach spiel-fragen.sql neu ausführen.

alter table public.spieler_konto add column if not exists zuletzt_fragen text[] not null default '{}';

-- ============ Rechenfragen ============
-- 8-Bit-Dualzahl in 4er-Gruppen, z. B. 1010 1011
create or replace function public._bits(n integer, w integer default 8) returns text language sql immutable as $$
  select regexp_replace(right(n::bit(32)::text, w), '(....)(?=.)', '\1 ', 'g')
$$;
create or replace function public._hex(n integer) returns text language sql immutable as $$ select upper(lpad(to_hex(n), 2, '0')) $$;
create or replace function public._bits_rueck(n integer) returns integer language sql immutable as $$ select reverse(right(n::bit(32)::text, 8))::bit(8)::int $$;

-- Optionen mischen: richtige Lösung + die ersten drei passenden Fehler
create or replace function public._frage_mischen(p_id text, p_text text, p_richtig text, p_falsch text[], p_erkl text) returns jsonb
language plpgsql volatile as $$
declare f text[] := '{}'; x text; o text[];
begin
  foreach x in array p_falsch loop
    if x is not null and x <> p_richtig and not (x = any(f)) and cardinality(f) < 3 then f := f || x; end if;
  end loop;
  select array_agg(v order by random()) into o from unnest(f || p_richtig) v;
  return jsonb_build_object('id', p_id, 'fach', 'aew', 'thema', 'aew-zahl', 'text', p_text, 'optionen', to_jsonb(o),
                            'richtig', array_position(o, p_richtig) - 1, 'erklaerung', p_erkl);
end $$;

-- Eine Rechenaufgabe wie im Übungsbereich (dez2bin, bin2dez, hex2dez, dez2hex, zk2bin, zk2dez), als Multiple Choice
create or replace function public._frage_rechnen() returns jsonb language plpgsql volatile set search_path = public as $$
declare art integer := floor(random() * 6)::int; n integer := 20 + floor(random() * 236)::int; a integer; summe text;
begin
  if art = 0 then
    select string_agg((1 << (7 - i))::text, ' + ' order by i) into summe from generate_series(0, 7) i where (n >> (7 - i)) & 1 = 1;
    return _frage_mischen('r-bin2dez-' || n, 'Welche **Dezimalzahl** ist die Dualzahl **' || _bits(n) || '**?', n::text,
      array[_bits_rueck(n)::text, (n # 1)::text, (n # 16)::text, (n # 64)::text, (n + 2)::text],
      'Stellenwerte der Einsen addieren: ' || summe || ' = **' || n || '**');
  elsif art = 1 then
    return _frage_mischen('r-dez2bin-' || n, 'Welche **Dualzahl** (8 Bit) ist die Dezimalzahl **' || n || '**?', _bits(n),
      array[_bits(_bits_rueck(n)), _bits(n # 1), _bits(n # 32), _bits(n # 4), _bits(n # 128)],
      'Immer durch 2 teilen und die Reste **von unten nach oben** lesen: **' || _bits(n) || '**');
  elsif art = 2 then
    return _frage_mischen('r-hex2dez-' || n, 'Welche **Dezimalzahl** ist die Hexadezimalzahl **' || _hex(n) || '**?', n::text,
      array[((n % 16) * 16 + n / 16)::text, ((n / 16) * 10 + n % 16)::text, (n + 16)::text, (n - 16)::text, (n + 1)::text],
      _hex(n) || ' = ' || (n / 16) || ' · 16 + ' || (n % 16) || ' = **' || n || '**');
  elsif art = 3 then
    return _frage_mischen('r-dez2hex-' || n, 'Welche **Hexadezimalzahl** ist die Dezimalzahl **' || n || '**?', _hex(n),
      array[_hex((n % 16) * 16 + n / 16), _hex(n + 16), _hex(n - 16), _hex(n + 1), _hex(n - 1)],
      n || ' : 16 = ' || (n / 16) || ' Rest ' || (n % 16) || ' → **' || _hex(n) || '** (10 = A … 15 = F)');
  elsif art = 4 then
    a := 2 + floor(random() * 127)::int;
    return _frage_mischen('r-zk2bin-' || a, 'Wie lautet **−' || a || '** als 8-Bit-Zweierkomplement?', _bits(256 - a),
      array[_bits(255 - a), _bits(a), _bits(257 - a), _bits((256 - a) # 64)],
      'Betrag ' || _bits(a) || ' → alle Bits umdrehen ' || _bits(255 - a) || ' → +1 = **' || _bits(256 - a) || '**');
  else
    n := 128 + floor(random() * 128)::int;
    return _frage_mischen('r-zk2dez-' || n, 'Welche Dezimalzahl steht in der 8-Bit-Zweierkomplementzahl **' || _bits(n) || '**?', (n - 256)::text,
      array[n::text, (n - 255)::text, (-(n - 128))::text, (256 - n)::text],
      'Erstes Bit 1 → negativ. Bits umdrehen und +1: ' || _bits(256 - n) || ' = ' || (256 - n) || ' → **' || (n - 256) || '**');
  end if;
end $$;

-- ============ Zugbeginn: Frage wählen ============
-- Jede 5. Zugfrage (zufällig) ist eine Rechenaufgabe; sonst eine Spielfrage, die weder in diesem Kampf
-- noch unter den letzten 80 Fragen des Spielers (alle Kämpfe) vorkam.
create or replace function public._k2_zug_start(st jsonb, p integer) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; z integer := (pl->>'zug')::int + 1; mf integer := least(coalesce((pl->>'maxfokus')::int, 0) + 1, 8); i integer; m jsonb; f text; ges jsonb; uid uuid; zl text[];
begin
  for i in 0..3 loop
    m := pl->'feld'->i;
    if jsonb_typeof(m) = 'object' then pl := jsonb_set(pl, array['feld', i::text], m || jsonb_build_object('bereit', not (m->>'bet')::boolean, 'bet', false)); end if;
  end loop;
  st := _k_setze(st, p, pl || jsonb_build_object('zug', z, 'maxfokus', mf, 'fokus', mf, 'bonus', false));
  st := _k_log(st || jsonb_build_object('am', p, 'phase', 'frage', 'frage', null, 'frage_ab', null), jsonb_build_object('art','zug','p',p,'zug',z));
  st := _k2_ziehen(st, p, 1);
  if (st->'s'->p->>'id') is not null then
    uid := (st->'s'->p->>'id')::uuid;
    if random() < 0.2 then
      st := st || jsonb_build_object('frage', _frage_rechnen());
    else
      select coalesce(zuletzt_fragen, '{}') into zl from spieler_konto where user_id = uid;
      ges := coalesce(st->'gesehen', '[]');
      f := coalesce(_frage(array(select jsonb_array_elements_text(ges)) || coalesce(zl, '{}')),
                    _frage_neu(array(select jsonb_array_elements_text(ges))));
      ges := ges || to_jsonb(f);
      if jsonb_array_length(ges) > 40 then ges := ges - 0; end if;
      update spieler_konto set zuletzt_fragen = (array_append(zuletzt_fragen, f))[greatest(1, cardinality(zuletzt_fragen) - 78):] where user_id = uid;
      st := st || jsonb_build_object('frage', f, 'gesehen', ges);
    end if;
  end if;
  return _k2_ende(st);
end $$;

-- ============ Timer ============
-- Der Client meldet, wann er die Frage zeigt (nach den Animationen des Gegnerzugs). Rückgabe: verbleibende Sekunden.
-- Nach 20 s (+5 s Puffer für die Leitung) zählt eine Antwort als falsch.
create or replace function public.kampf_frage_start(p_id uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare r record; ab float8;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i or r.z->>'phase' <> 'frage' then raise exception 'Gerade ist keine Frage offen.'; end if;
  ab := (r.z->>'frage_ab')::float8;
  if ab is null then
    ab := extract(epoch from clock_timestamp());
    update kampf_zustand set st = r.z || jsonb_build_object('frage_ab', ab) where kampf_id = p_id;
  end if;
  return greatest(0, ceil(20 - (extract(epoch from clock_timestamp()) - ab)))::int;
end $$;

create or replace function public.kampf_antwort(p_id uuid, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; f text; ok boolean; ri integer; ab float8; zu_spaet boolean; w integer := coalesce(p_wahl, -1);
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i or r.z->>'phase' <> 'frage' then raise exception 'Gerade ist keine Frage offen.'; end if;
  if jsonb_typeof(r.z->'frage') = 'object' then
    f := r.z->'frage'->>'id'; ri := (r.z->'frage'->>'richtig')::int; ok := w = ri;
  else
    f := r.z->>'frage'; ri := _frage_richtig(f); ok := _frage_ok(f, w);
  end if;
  ab := (r.z->>'frage_ab')::float8;
  zu_spaet := ab is not null and extract(epoch from clock_timestamp()) - ab > 25;
  if w < 0 or zu_spaet then ok := false; end if;
  perform _k_speichern(p_id, _k2_antwort(r.z - 'frage_ab', r.i, ok));
  return kampf_ansicht(p_id) || jsonb_build_object('antwort', jsonb_build_object('frage', f, 'ok', ok, 'richtig', ri, 'zu_spaet', zu_spaet or w < 0,
    'erklaerung', case when jsonb_typeof(r.z->'frage') = 'object' then r.z->'frage'->'erklaerung' end));
end $$;

-- Ansicht: Rechenfrage ohne Lösung, dazu die verbleibende Zeit (falls die Frage schon gezeigt wurde)
create or replace function public.kampf_ansicht(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); m kaempfe; z jsonb; i integer; du jsonb; ge jsonb; gid uuid; g jsonb; fr jsonb;
begin
  select * into m from kaempfe where id = p_id;
  if not found or me is null or (me is distinct from m.spieler_a and me is distinct from m.spieler_b) then raise exception 'Kampf nicht gefunden'; end if;
  select k.st into z from kampf_zustand k where k.kampf_id = p_id;
  i := case when me = m.spieler_a then 0 else 1 end;
  du := z->'s'->i; ge := z->'s'->(1 - i);
  gid := case when i = 0 then m.spieler_b else m.spieler_a end;
  g := _k2_gegner(m);
  fr := case when (z->>'am')::int = i then case when jsonb_typeof(z->'frage') = 'object' then (z->'frage') - 'richtig' - 'erklaerung' else z->'frage' end end;
  return jsonb_build_object(
    'id', m.id, 'status', m.status, 'stufe', m.stufe, 'frei', m.frei, 'ich', i, 'gegner_id', gid,
    'gegner_name', coalesce(g->>'name', (select spitzname from profile where id = gid)),
    'gegner_farbe', (select farbe from profile where id = gid),
    'du', (du - 'deck' - 'id') || jsonb_build_object('deck', jsonb_array_length(du->'deck')),
    'gegner', (ge - 'deck' - 'hand' - 'id' - 'fallen') || jsonb_build_object('deck', jsonb_array_length(ge->'deck'), 'hand', jsonb_array_length(ge->'hand'),
               'fallen', (select jsonb_agg(jsonb_typeof(x) = 'object') from jsonb_array_elements(ge->'fallen') x)),
    'dran', m.status = 'laeuft' and (z->>'am')::int = i,
    'phase', z->'phase', 'runde', z->'runde', 'logn', z->'logn',
    'frage', fr,
    'frage_rest', case when fr is not null and z->>'frage_ab' is not null then greatest(0, ceil(20 - (extract(epoch from clock_timestamp()) - (z->>'frage_ab')::float8)))::int end,
    -- Log ohne verdeckte Informationen des Gegners (welche Falle gelegt wurde, welche Karte gezogen)
    'log', (select coalesce(jsonb_agg(e), '[]') from jsonb_array_elements(z->'log') e where not (e->>'art' in ('verbrannt') and (e->>'p')::int <> i)),
    'ergebnis', case when z->>'phase' = 'ende' then case when (z->>'sieger')::int = -1 then 'remis' when (z->>'sieger')::int = i then 'sieg' else 'niederlage' end end,
    'aufgegeben', z->'aufgegeben',
    'belohnung', z->'belohnung'->(i::text));
end $$;

-- ============ Rechte ============
do $$
declare f record; rpcs text[] := array['kampf_ansicht','kampf_antwort','kampf_frage_start'];
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname in ('_bits','_hex','_bits_rueck','_frage_mischen','_frage_rechnen','_k2_zug_start') or p.proname = any(rpcs)) loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    if f.proname like '\_%' then execute format('revoke execute on function %s from authenticated', f.sig);
    else execute format('grant execute on function %s to authenticated', f.sig); end if;
  end loop;
end $$;

select 'Lernwerk Legends: Feinschliff eingerichtet' as ergebnis;
