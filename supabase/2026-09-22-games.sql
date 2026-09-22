-- Nachtrag 22.09.2026: Lernwerk Games (Karten-Kampf, Bomben-Quiz, Quiz-Millionär, Wissens-Arena)
-- Einmal komplett im SQL Editor ausführen. Danach supabase/spiel-fragen.sql ausführen (Lösungen der Spielfragen).
-- Grundsatz: Alles, was Belohnungen bringt (Coins, Karten, Booster, Rangpunkte, Spiel-XP, Ergebnisse), entsteht nur hier auf dem Server.
-- Der Browser darf diese Tabellen nicht selbst schreiben, nur die Funktionen unten aufrufen.
-- Kann gefahrlos erneut ausgeführt werden (Tabellen bleiben, Funktionen und Karten werden aktualisiert).

-- ============ Tabellen ============
-- Zentrales Spielerkonto: gilt für alle Spiele
create table if not exists public.spieler_konto (
  user_id             uuid primary key references auth.users on delete cascade,
  coins               integer not null default 0 check (coins >= 0),
  booster             integer not null default 0 check (booster >= 0),     -- ungeöffnete Booster
  booster_fortschritt integer not null default 0,                           -- richtige Spielantworten bis zum nächsten Booster (10)
  spiel_xp            integer not null default 0,                           -- alle je in Spielen verdienten XP
  xp_offen            integer not null default 0,                           -- noch nicht in den Lernstand gebuchte XP
  rang_punkte         integer not null default 0 check (rang_punkte >= 0),
  arena_siege         integer not null default 0,
  arena_niederlagen   integer not null default 0,
  arena_remis         integer not null default 0,
  arena_serie         integer not null default 0,
  arena_serie_best    integer not null default 0,
  statistik           jsonb not null default '{}',                          -- je Spiel: gespielt, gewonnen, richtige, Bestwerte
  titel               text[] not null default '{}',                         -- kosmetische Titel
  aktualisiert        timestamptz not null default now()
);

-- Lösungen der Spielfragen (Texte stehen in fragen.js). Für niemanden direkt lesbar.
create table if not exists public.spiel_fragen (
  id      text primary key,
  fach    text not null,
  schwer  integer not null default 2,
  anzahl  integer not null,        -- Zahl der Antwortmöglichkeiten
  richtig integer not null          -- Index der richtigen Antwort in fragen.js
);

-- Karten-Katalog (öffentlich lesbar)
create table if not exists public.karten (
  id              text primary key,
  nr              integer not null unique,
  name            text not null,
  fach            text not null,
  seltenheit      text not null check (seltenheit in ('common','rare','epic','legendary')),
  angriff         integer not null,
  verteidigung    integer not null,
  kosten          integer not null,
  faehigkeit      text,
  wert            integer not null default 0,
  faehigkeit_name text,
  faehigkeit_text text,
  bild            text not null
);

create table if not exists public.karten_sammlung (
  user_id   uuid not null references auth.users on delete cascade,
  karte_id  text not null references public.karten on delete cascade,
  anzahl    integer not null default 1 check (anzahl between 1 and 2),
  erhalten  timestamptz not null default now(),
  primary key (user_id, karte_id)
);

create table if not exists public.decks (
  user_id   uuid primary key references auth.users on delete cascade,
  karten    text[] not null,
  geaendert timestamptz not null default now()
);

create table if not exists public.spiel_ergebnisse (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users on delete cascade,
  spiel    text not null,
  ergebnis text not null,
  xp       integer not null default 0,
  coins    integer not null default 0,
  details  jsonb not null default '{}',
  erstellt timestamptz not null default now()
);
create index if not exists spiel_ergebnisse_user on public.spiel_ergebnisse (user_id, erstellt desc);

-- Einzelspieler-Sitzungen (Quiz-Millionär): Zustand nur auf dem Server
create table if not exists public.spiel_sitzungen (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users on delete cascade,
  spiel     text not null,
  status    text not null default 'laeuft',
  st        jsonb not null,
  erstellt  timestamptz not null default now(),
  geaendert timestamptz not null default now()
);

-- Karten-Kampf: sichtbare Kopfzeile (für Liste und Live-Benachrichtigung) + geheimer Zustand (Hände, Decks)
create table if not exists public.kaempfe (
  id        uuid primary key default gen_random_uuid(),
  klasse_id uuid references public.klassen on delete cascade,
  spieler_a uuid not null references auth.users on delete cascade,
  spieler_b uuid references auth.users on delete cascade,        -- leer = gegen den Computer
  stufe     integer,                                               -- Computer-Gegner 1–5
  status    text not null default 'laeuft' check (status in ('laeuft','fertig')),
  am_zug    uuid,
  sieger    uuid,
  ergebnis  text,                                                  -- a, b, remis, abgebrochen
  version   integer not null default 0,
  erstellt  timestamptz not null default now(),
  geaendert timestamptz not null default now()
);
create index if not exists kaempfe_a on public.kaempfe (spieler_a);
create index if not exists kaempfe_b on public.kaempfe (spieler_b);
create table if not exists public.kampf_zustand (
  kampf_id uuid primary key references public.kaempfe on delete cascade,
  st       jsonb not null
);

-- Bomben-Quiz: Raum sichtbar für die Mitspieler, Explosionszeit geheim
create table if not exists public.bomben_raeume (
  id           uuid primary key default gen_random_uuid(),
  code         text not null,
  klasse_id    uuid not null references public.klassen on delete cascade,
  host         uuid not null,
  spieler      uuid[] not null,
  leben        jsonb not null default '{}',
  richtige     jsonb not null default '{}',
  bombe_bei    uuid,
  frage_id     text,
  frage_nr     integer not null default 0,
  runde        integer not null default 0,
  status       text not null default 'lobby' check (status in ('lobby','laeuft','boom','fertig')),
  letzte       jsonb,
  zuendung     timestamptz,
  gesperrt_bis timestamptz,
  sieger       uuid,
  raus         uuid[] not null default '{}',
  erstellt     timestamptz not null default now(),
  geaendert    timestamptz not null default now()
);
create index if not exists bomben_code on public.bomben_raeume (code);
create table if not exists public.bomben_geheim (
  raum_id       uuid primary key references public.bomben_raeume on delete cascade,
  explodiert_um timestamptz,
  gesehen       text[] not null default '{}'
);

-- Wissens-Arena: Live-Duell, Fragen und Antworten geheim bis zur Auflösung der Runde
create table if not exists public.arena_matches (
  id         uuid primary key default gen_random_uuid(),
  klasse_id  uuid not null references public.klassen on delete cascade,
  spieler_a  uuid not null references auth.users on delete cascade,
  spieler_b  uuid not null references auth.users on delete cascade,
  status     text not null default 'angefragt' check (status in ('angefragt','laeuft','fertig','abgelehnt','abgebrochen')),
  runde      integer not null default 0,
  runden     integer not null default 5,
  hp_a       integer not null default 50,
  hp_b       integer not null default 50,
  frage_id   text,
  runde_start timestamptz,
  runde_ende  timestamptz,
  a_fertig   boolean not null default false,
  b_fertig   boolean not null default false,
  verlauf    jsonb not null default '[]',
  sieger     uuid,
  ergebnis   text,
  rp_a       integer,
  rp_b       integer,
  erstellt   timestamptz not null default now(),
  geaendert  timestamptz not null default now(),
  check (spieler_a <> spieler_b)
);
create index if not exists arena_a on public.arena_matches (spieler_a);
create index if not exists arena_b on public.arena_matches (spieler_b);
create table if not exists public.arena_geheim (
  match_id  uuid primary key references public.arena_matches on delete cascade,
  fragen    text[] not null,
  antworten jsonb not null default '{}'
);
create table if not exists public.arena_warteschlange (
  user_id   uuid primary key references auth.users on delete cascade,
  klasse_id uuid not null,
  seit      timestamptz not null default now()
);

-- ============ Karten-Katalog ============
insert into public.karten (id, nr, name, fach, seltenheit, angriff, verteidigung, kosten, faehigkeit, wert, faehigkeit_name, faehigkeit_text, bild) values
 ('wbl-azubi',        1, 'Azubi im ersten Jahr',            'wbl',  'common',    1, 2, 1, null,      0, null, null, 'azubi'),
 ('wbl-schuh',        2, 'Sicherheitsschuh',                'wbl',  'common',    1, 3, 1, 'panzer',  1, 'Stahlkappe', 'Erleidet 1 Schaden weniger.', 'schuh'),
 ('wbl-betriebsrat',  3, 'Betriebsrat',                     'wbl',  'common',    2, 3, 2, null,      0, null, null, 'betriebsrat'),
 ('wbl-erstehilfe',   4, 'Ersthelferin',                    'wbl',  'common',    0, 2, 1, 'heilen',  3, 'Erste Hilfe', 'Beim Ausspielen: Du erhältst 3 Lebenspunkte.', 'erstehilfe'),
 ('wbl-stapler',      5, 'Gabelstapler',                    'wbl',  'common',    3, 2, 2, null,      0, null, null, 'stapler'),
 ('wbl-ausbilder',    6, 'Ausbilder',                       'wbl',  'rare',      2, 3, 3, 'team',    1, 'Unterweisung', 'Beim Ausspielen: Deine anderen Karten auf dem Feld erhalten +1 Angriff.', 'ausbilder'),
 ('wbl-sifa',         7, 'Fachkraft für Arbeitssicherheit', 'wbl',  'rare',      2, 4, 3, 'schild',  2, 'Gefährdungsbeurteilung', '+2 Verteidigung, wenn deine letzte Frage richtig war.', 'helm'),
 ('wbl-kammer',       8, 'Industrie- und Handelskammer',    'wbl',  'rare',      3, 3, 3, 'ziehen',  1, 'Ausbildungsberatung', 'Beim Ausspielen: Ziehe 1 Karte.', 'kammer'),
 ('wbl-vertrag',      9, 'Ausbildungsvertrag',              'wbl',  'rare',      1, 5, 2, 'panzer',  1, 'Schriftform', 'Erleidet 1 Schaden weniger.', 'vertrag'),
 ('wbl-jarbschg',    10, 'Jugendarbeitsschutzgesetz',       'wbl',  'epic',      3, 5, 4, 'heilen',  4, 'Pausenregel', 'Beim Ausspielen: Du erhältst 4 Lebenspunkte.', 'paragraf'),
 ('wbl-roboter',     11, 'Industrieroboter',                'wbl',  'epic',      5, 4, 4, 'angriff', 2, 'Präzisionsarm', '+2 Angriff, wenn deine letzte Frage richtig war.', 'roboter'),
 ('wbl-chefin',      12, 'Die Geschäftsführerin',           'wbl',  'legendary', 6, 6, 5, 'team',    1, 'Strategie', 'Beim Ausspielen: Deine anderen Karten auf dem Feld erhalten +1 Angriff.', 'chefin'),
 ('wbl-pruefer',     13, 'Der IHK-Prüfer',                  'wbl',  'legendary', 7, 7, 6, 'direkt',  2, 'Abschlussprüfung', 'Beim Ausspielen: 2 Schaden am Gegner.', 'pruefer'),
 ('its-schloss',     14, 'Passwort-Manager',                'its1', 'common',    1, 3, 1, null,      0, null, null, 'schloss'),
 ('its-router',      15, 'Router',                          'its1', 'common',    2, 2, 1, null,      0, null, null, 'router'),
 ('its-switch',      16, 'Switch',                          'its1', 'common',    2, 3, 2, null,      0, null, null, 'switch'),
 ('its-kabel',       17, 'Patchkabel',                      'its1', 'common',    1, 1, 1, 'direkt',  1, 'Kurzschluss', 'Beim Ausspielen: 1 Schaden am Gegner.', 'kabel'),
 ('its-backup',      18, 'Backup-Server',                   'its1', 'common',    1, 4, 2, null,      0, null, null, 'backup'),
 ('its-firewall',    19, 'Firewall',                        'its1', 'rare',      1, 6, 3, 'panzer',  1, 'Paketfilter', 'Erleidet 1 Schaden weniger.', 'firewall'),
 ('its-token',       20, '2-Faktor-Token',                  'its1', 'rare',      3, 3, 2, 'schild',  1, 'Zweiter Faktor', '+1 Verteidigung, wenn deine letzte Frage richtig war.', 'token'),
 ('its-dsb',         21, 'Datenschutzbeauftragte',          'its1', 'rare',      2, 4, 3, 'ziehen',  1, 'Auskunftsrecht', 'Beim Ausspielen: Ziehe 1 Karte.', 'dsb'),
 ('its-hash',        22, 'Hashwert',                        'its1', 'rare',      3, 2, 2, 'direkt',  2, 'Integritätsprüfung', 'Beim Ausspielen: 2 Schaden am Gegner.', 'hash'),
 ('its-server',      23, 'Webserver',                       'its1', 'rare',      3, 4, 3, 'fokus',   1, 'Lastverteilung', 'Beim Ausspielen: +1 Fokus zurück.', 'server'),
 ('its-techniker',   24, 'Der Netzwerktechniker',           'its1', 'epic',      6, 4, 4, 'schild',  2, 'Netzwerkcheck', '+2 Verteidigung, wenn deine letzte Frage richtig war.', 'techniker'),
 ('its-rz',          25, 'Rechenzentrum',                   'its1', 'epic',      3, 7, 4, 'panzer',  1, 'Redundanz', 'Erleidet 1 Schaden weniger.', 'rechenzentrum'),
 ('its-bruteforce',  26, 'Brute-Force-Bot',                 'its1', 'epic',      4, 3, 4, 'direkt',  3, 'Wörterbuchangriff', 'Beim Ausspielen: 3 Schaden am Gegner.', 'bot'),
 ('its-cia',         27, 'Das CIA-Dreieck',                 'its1', 'legendary', 5, 8, 5, 'schild',  3, 'Vertraulich · Integer · Verfügbar', '+3 Verteidigung, wenn deine letzte Frage richtig war.', 'dreieck'),
 ('aew-bit',         28, 'Bit',                             'aew',  'common',    2, 1, 1, null,      0, null, null, 'bit'),
 ('aew-byte',        29, 'Byte',                            'aew',  'common',    2, 3, 2, null,      0, null, null, 'byte'),
 ('aew-variable',    30, 'Variable int',                    'aew',  'common',    3, 1, 1, null,      0, null, null, 'variable'),
 ('aew-lastenheft',  31, 'Lastenheft',                      'aew',  'common',    1, 4, 2, null,      0, null, null, 'lastenheft'),
 ('aew-akteur',      32, 'Akteur',                          'aew',  'common',    2, 2, 1, null,      0, null, null, 'akteur'),
 ('aew-debugger',    33, 'Debugger',                        'aew',  'rare',      2, 3, 2, 'heilen',  3, 'Fehler behoben', 'Beim Ausspielen: Du erhältst 3 Lebenspunkte.', 'debugger'),
 ('aew-hex',         34, 'Hexadezimalzahl',                 'aew',  'rare',      4, 2, 2, 'angriff', 1, 'Nibble-Trick', '+1 Angriff, wenn deine letzte Frage richtig war.', 'hex'),
 ('aew-pflichtenheft',35,'Pflichtenheft',                   'aew',  'rare',      2, 5, 3, 'schild',  2, 'Wie und womit', '+2 Verteidigung, wenn deine letzte Frage richtig war.', 'pflichtenheft'),
 ('aew-compiler',    36, 'Java-Compiler',                   'aew',  'rare',      3, 3, 2, 'fokus',   1, 'Optimierung', 'Beim Ausspielen: +1 Fokus zurück.', 'compiler'),
 ('aew-zweier',      37, 'Zweierkomplement',                'aew',  'epic',      5, 5, 4, 'angriff', 2, 'Umdrehen plus eins', '+2 Angriff, wenn deine letzte Frage richtig war.', 'zweier'),
 ('aew-architektin', 38, 'Softwarearchitektin',             'aew',  'epic',      3, 5, 4, 'team',    1, 'Architektur', 'Beim Ausspielen: Deine anderen Karten auf dem Feld erhalten +1 Angriff.', 'architektin'),
 ('aew-ascii',       39, 'ASCII-Tabelle',                   'aew',  'epic',      4, 4, 3, 'ziehen',  2, 'Nachschlagen', 'Beim Ausspielen: Ziehe 2 Karten.', 'ascii'),
 ('aew-algorithmus', 40, 'Der Algorithmus',                 'aew',  'legendary', 7, 6, 6, 'ziehen',  1, 'Rekursion', 'Beim Ausspielen: Ziehe 1 Karte.', 'algorithmus')
on conflict (id) do update set nr = excluded.nr, name = excluded.name, fach = excluded.fach, seltenheit = excluded.seltenheit, angriff = excluded.angriff,
  verteidigung = excluded.verteidigung, kosten = excluded.kosten, faehigkeit = excluded.faehigkeit, wert = excluded.wert,
  faehigkeit_name = excluded.faehigkeit_name, faehigkeit_text = excluded.faehigkeit_text, bild = excluded.bild;

-- ============ Grundfunktionen ============
-- Konto anlegen (beim ersten Spiel) inkl. Starter-Karten und Starter-Deck
create or replace function public._konto(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare n integer;
  starter text[] := array['wbl-azubi','wbl-schuh','wbl-betriebsrat','wbl-erstehilfe','its-router','its-switch','its-kabel','aew-bit','aew-byte','aew-variable'];
begin
  insert into spieler_konto (user_id, booster) values (p_uid, 1) on conflict (user_id) do nothing;
  get diagnostics n = row_count;
  if n > 0 then
    insert into karten_sammlung (user_id, karte_id) select p_uid, unnest(starter) on conflict do nothing;
    insert into decks (user_id, karten) values (p_uid, starter) on conflict (user_id) do nothing;
  end if;
end $$;

-- Zentrale Belohnung: jedes Spiel bucht hierüber XP, Coins, Booster-Fortschritt, Statistik und Verlauf
create or replace function public._belohnen(p_uid uuid, p_spiel text, p_ergebnis text, p_xp integer, p_coins integer, p_richtige integer, p_details jsonb default '{}')
returns jsonb language plpgsql security definer set search_path = public as $$
declare k spieler_konto; xp integer := greatest(coalesce(p_xp,0),0); co integer := greatest(coalesce(p_coins,0),0); ri integer := greatest(coalesce(p_richtige,0),0); neu integer; alt jsonb;
begin
  perform _konto(p_uid);
  select * into k from spieler_konto where user_id = p_uid for update;
  neu := (k.booster_fortschritt + ri) / 10;
  alt := coalesce(k.statistik->p_spiel, '{}');
  update spieler_konto set
    coins = coins + co, spiel_xp = spiel_xp + xp, xp_offen = xp_offen + xp,
    booster = booster + neu, booster_fortschritt = (booster_fortschritt + ri) % 10,
    statistik = jsonb_set(statistik, array[p_spiel], alt || jsonb_build_object(
      'gespielt', coalesce((alt->>'gespielt')::int, 0) + 1,
      'gewonnen', coalesce((alt->>'gewonnen')::int, 0) + case when p_ergebnis = 'sieg' then 1 else 0 end,
      'richtige', coalesce((alt->>'richtige')::int, 0) + ri)),
    aktualisiert = now()
  where user_id = p_uid;
  insert into spiel_ergebnisse (user_id, spiel, ergebnis, xp, coins, details) values (p_uid, p_spiel, p_ergebnis, xp, co, coalesce(p_details, '{}'));
  delete from spiel_ergebnisse where user_id = p_uid and id not in (select id from spiel_ergebnisse where user_id = p_uid order by erstellt desc, id desc limit 50);
  return jsonb_build_object('xp', xp, 'coins', co, 'booster', neu, 'richtige', ri, 'ergebnis', p_ergebnis);
end $$;

-- Fragen ziehen und prüfen
create or replace function public._frage(p_aus text[], p_schwer integer default null) returns text
language sql volatile set search_path = public as $$
  select id from spiel_fragen where (p_aus is null or not (id = any(p_aus))) and (p_schwer is null or schwer = p_schwer) order by random() limit 1
$$;
create or replace function public._frage_neu(p_aus text[], p_schwer integer default null) returns text
language plpgsql volatile set search_path = public as $$
declare f text := coalesce(_frage(p_aus, p_schwer), _frage(p_aus, null), _frage(null, null));
begin
  if f is null then raise exception 'Es sind noch keine Spielfragen hinterlegt (spiel-fragen.sql ausführen).'; end if;
  return f;
end $$;
create or replace function public._frage_ok(p_id text, p_wahl integer) returns boolean
language sql stable set search_path = public as $$ select coalesce((select richtig = p_wahl from spiel_fragen where id = p_id), false) $$;
create or replace function public._frage_richtig(p_id text) returns integer
language sql stable set search_path = public as $$ select richtig from spiel_fragen where id = p_id $$;

-- Konto für die Oberfläche: Werte, Sammlung, Deck, letzte Spiele
create or replace function public.spiel_konto() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  return (select to_jsonb(k) - 'user_id' from spieler_konto k where k.user_id = me) || jsonb_build_object(
    'sammlung', (select coalesce(jsonb_object_agg(karte_id, anzahl), '{}') from karten_sammlung where user_id = me),
    'deck', (select to_jsonb(karten) from decks where user_id = me),
    'letzte', (select coalesce(jsonb_agg(x order by x.erstellt desc), '[]') from (select spiel, ergebnis, xp, coins, details, erstellt from spiel_ergebnisse where user_id = me order by erstellt desc limit 10) x),
    'kampf_offen', (select count(*) from kaempfe where status = 'laeuft' and spieler_b is not null and am_zug = me),
    'arena_anfragen', (select count(*) from arena_matches where status = 'angefragt' and spieler_b = me and erstellt > now() - interval '15 minutes'));
end $$;

-- Spiel-XP abholen: der Client bucht sie danach in den Lernstand (Level, Tages-XP)
create or replace function public.spiel_xp_abholen() returns integer
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); n integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  select xp_offen into n from spieler_konto where user_id = me for update;
  if coalesce(n, 0) = 0 then return 0; end if;
  update spieler_konto set xp_offen = 0 where user_id = me;
  return n;
end $$;

-- ============ Sammlung, Deck, Booster ============
create or replace function public.deck_speichern(p_karten text[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  if coalesce(array_length(p_karten, 1), 0) <> 10 then raise exception 'Ein Deck hat genau 10 Karten.'; end if;
  if exists (select 1 from unnest(p_karten) x group by x
             having count(*) > least(2, coalesce((select anzahl from karten_sammlung s where s.user_id = me and s.karte_id = x), 0))) then
    raise exception 'Du kannst nur Karten aus deiner Sammlung verwenden (höchstens 2 gleiche).';
  end if;
  if exists (select 1 from unnest(p_karten) x join karten k on k.id = x where k.seltenheit = 'legendary' group by x having count(*) > 1) then
    raise exception 'Jede legendäre Karte darf nur einmal ins Deck.';
  end if;
  insert into decks (user_id, karten, geaendert) values (me, p_karten, now())
  on conflict (user_id) do update set karten = excluded.karten, geaendert = now();
  return spiel_konto();
end $$;

create or replace function public.booster_kaufen() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  update spieler_konto set coins = coins - 100, booster = booster + 1 where user_id = me and coins >= 100;
  if not found then raise exception 'Dafür brauchst du 100 Coins.'; end if;
  return spiel_konto();
end $$;

-- Booster öffnen: 5 Karten, Seltenheit wird hier auf dem Server ausgelost. Karte 5 ist mindestens selten.
-- Mehr als 2 gleiche Karten werden zu Coins.
create or replace function public.booster_oeffnen(p_fach text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); i integer; r float; sel text; k karten; hat integer; aus jsonb := '[]'; summe integer := 0; wert integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  if p_fach not in ('wbl','its1','aew','mix') then raise exception 'Unbekannter Booster'; end if;
  perform _konto(me);
  update spieler_konto set booster = booster - 1 where user_id = me and booster >= 1;
  if not found then raise exception 'Du hast keinen Booster.'; end if;
  for i in 1..5 loop
    r := random();
    sel := case when r < 0.03 then 'legendary' when r < 0.12 then 'epic' when r < 0.35 then 'rare' else 'common' end;
    if i = 5 and sel = 'common' then sel := 'rare'; end if;
    select * into k from karten where seltenheit = sel and (p_fach = 'mix' or fach = p_fach) order by random() limit 1;
    if not found then select * into k from karten where seltenheit = sel order by random() limit 1; end if;
    select anzahl into hat from karten_sammlung where user_id = me and karte_id = k.id;
    hat := coalesce(hat, 0);
    if hat >= 2 then
      wert := case k.seltenheit when 'legendary' then 100 when 'epic' then 40 when 'rare' then 15 else 5 end;
      summe := summe + wert;
      aus := aus || jsonb_build_object('id', k.id, 'neu', false, 'dublette', true, 'coins', wert);
    else
      insert into karten_sammlung (user_id, karte_id, anzahl) values (me, k.id, 1)
      on conflict (user_id, karte_id) do update set anzahl = karten_sammlung.anzahl + 1;
      aus := aus || jsonb_build_object('id', k.id, 'neu', hat = 0, 'dublette', false, 'coins', 0);
    end if;
  end loop;
  if summe > 0 then update spieler_konto set coins = coins + summe where user_id = me; end if;
  return jsonb_build_object('karten', aus, 'coins', summe, 'konto', spiel_konto());
end $$;

-- ============ Karten-Kampf: Engine ============
-- Zustand st: s[0], s[1] = Spieler {id, hp, maxhp, fokus, deck, hand, feld[3], zug, richtig, bonus}; am = wer dran ist;
-- phase = frage | spielen | ende; log = Ereignisse mit laufender Nummer n (für Animationen).
-- Regeln: Zug beginnt mit 1 Karte ziehen und einer Lernfrage. Fokus = Zugnummer (max. 5), richtige Antwort +1 Fokus und aktiviert Wissens-Fähigkeiten.
-- Am Zugende greift jede eigene Karte die gegenüberliegende an (Gegenschlag), ist das Feld leer, trifft sie den Gegner direkt.
create or replace function public._k_log(st jsonb, ev jsonb) returns jsonb language plpgsql immutable as $$
declare n integer := coalesce((st->>'logn')::int, 0) + 1; l jsonb := coalesce(st->'log', '[]') || jsonb_build_array(ev || jsonb_build_object('n', n));
begin
  if jsonb_array_length(l) > 60 then l := l - 0; end if;
  return st || jsonb_build_object('log', l, 'logn', n);
end $$;
create or replace function public._k_setze(st jsonb, p integer, pl jsonb) returns jsonb language sql immutable as $$ select jsonb_set(st, array['s', p::text], pl) $$;

create or replace function public._k_ziehen(st jsonb, p integer, n integer) returns jsonb language plpgsql as $$
declare pl jsonb; i integer;
begin
  for i in 1..n loop
    pl := st->'s'->p;
    if jsonb_array_length(pl->'deck') = 0 then
      st := _k_log(_k_setze(st, p, pl || jsonb_build_object('hp', (pl->>'hp')::int - 1)), jsonb_build_object('art','leer','p',p,'schaden',1));
    elsif jsonb_array_length(pl->'hand') >= 6 then
      st := _k_log(_k_setze(st, p, jsonb_set(pl, '{deck}', (pl->'deck') - 0)), jsonb_build_object('art','verbrannt','p',p,'k',pl->'deck'->0));
    else
      st := _k_log(_k_setze(st, p, jsonb_set(jsonb_set(pl, '{hand}', (pl->'hand') || jsonb_build_array(pl->'deck'->0)), '{deck}', (pl->'deck') - 0)),
                   jsonb_build_object('art','zieht','p',p));
    end if;
  end loop;
  return st;
end $$;

create or replace function public._k_zug_start(st jsonb, p integer) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; z integer := (pl->>'zug')::int + 1; f text; ges jsonb;
begin
  st := _k_setze(st, p, pl || jsonb_build_object('zug', z, 'fokus', least(z, 5), 'bonus', false));
  st := _k_log(st || jsonb_build_object('am', p, 'phase', 'frage', 'frage', null), jsonb_build_object('art','zug','p',p,'zug',z));
  st := _k_ziehen(st, p, 1);
  if (st->'s'->p->>'id') is not null then
    ges := coalesce(st->'gesehen', '[]');
    f := _frage_neu(array(select jsonb_array_elements_text(ges)));
    ges := ges || to_jsonb(f);
    if jsonb_array_length(ges) > 40 then ges := ges - 0; end if;
    st := st || jsonb_build_object('frage', f, 'gesehen', ges);
  end if;
  return st;
end $$;

create or replace function public._k_antwort(st jsonb, p integer, ok boolean) returns jsonb language plpgsql as $$
declare pl jsonb := st->'s'->p; plus integer := case when ok then 1 else 0 end;
begin
  pl := pl || jsonb_build_object('bonus', ok, 'fokus', (pl->>'fokus')::int + plus, 'richtig', (pl->>'richtig')::int + plus);
  return _k_log(_k_setze(st, p, pl) || jsonb_build_object('phase','spielen','frage',null), jsonb_build_object('art','antwort','p',p,'ok',ok));
end $$;

create or replace function public._k_spielen(st jsonb, p integer, h integer, f integer) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; o integer := 1 - p; op jsonb := st->'s'->(1 - p); kid text; k karten; e jsonb; i integer;
  bonus boolean := coalesce((pl->>'bonus')::boolean, false); zieh integer := 0; aktiv boolean := false;
begin
  if st->>'phase' <> 'spielen' then raise exception 'Beantworte zuerst die Frage.'; end if;
  if h is null or h < 0 or h >= jsonb_array_length(pl->'hand') then raise exception 'Diese Karte hast du nicht auf der Hand.'; end if;
  if f is null or f < 0 or f > 2 then raise exception 'Ungültiges Feld.'; end if;
  if jsonb_typeof(pl->'feld'->f) = 'object' then raise exception 'Dieses Feld ist schon belegt.'; end if;
  kid := pl->'hand'->>h;
  select * into k from karten where id = kid;
  if k.kosten > (pl->>'fokus')::int then raise exception 'Nicht genug Fokus.'; end if;
  pl := jsonb_set(pl || jsonb_build_object('fokus', (pl->>'fokus')::int - k.kosten), '{hand}', (pl->'hand') - h);
  e := jsonb_build_object('k', kid, 'a', k.angriff, 'v', k.verteidigung, 'p', coalesce(k.faehigkeit = 'panzer', false));
  case k.faehigkeit
    when 'schild'  then if bonus then e := e || jsonb_build_object('v', k.verteidigung + k.wert); aktiv := true; end if;
    when 'angriff' then if bonus then e := e || jsonb_build_object('a', k.angriff + k.wert); aktiv := true; end if;
    when 'heilen'  then pl := pl || jsonb_build_object('hp', least((pl->>'maxhp')::int, (pl->>'hp')::int + k.wert)); aktiv := true;
    when 'direkt'  then op := op || jsonb_build_object('hp', (op->>'hp')::int - k.wert); aktiv := true;
    when 'fokus'   then pl := pl || jsonb_build_object('fokus', (pl->>'fokus')::int + k.wert); aktiv := true;
    when 'team'    then
      for i in 0..2 loop
        if jsonb_typeof(pl->'feld'->i) = 'object' then pl := jsonb_set(pl, array['feld', i::text, 'a'], to_jsonb((pl->'feld'->i->>'a')::int + k.wert)); end if;
      end loop;
      aktiv := true;
    when 'ziehen'  then zieh := k.wert; aktiv := true;
    else null;
  end case;
  pl := jsonb_set(pl, array['feld', f::text], e);
  st := _k_setze(_k_setze(st, p, pl), o, op);
  st := _k_log(st, jsonb_build_object('art','spielt','p',p,'k',kid,'feld',f,'aktiv',aktiv,'faehigkeit',k.faehigkeit,'wert',k.wert));
  if zieh > 0 then st := _k_ziehen(st, p, zieh); end if;
  return st;
end $$;

create or replace function public._k_kampf(st jsonb, p integer) returns jsonb language plpgsql as $$
declare o integer := 1 - p; pl jsonb; op jsonb; a jsonb; d jsonb; i integer; sd integer; sa integer;
begin
  for i in 0..2 loop
    pl := st->'s'->p; op := st->'s'->o; a := pl->'feld'->i; d := op->'feld'->i;
    continue when jsonb_typeof(a) <> 'object' or (a->>'a')::int <= 0;
    if jsonb_typeof(d) <> 'object' then
      op := op || jsonb_build_object('hp', (op->>'hp')::int - (a->>'a')::int);
      st := _k_log(_k_setze(st, o, op), jsonb_build_object('art','treffer','p',p,'feld',i,'schaden',(a->>'a')::int));
    else
      sd := greatest(0, (a->>'a')::int - case when (d->>'p')::boolean then 1 else 0 end);
      sa := greatest(0, (d->>'a')::int - case when (a->>'p')::boolean then 1 else 0 end);
      d := d || jsonb_build_object('v', (d->>'v')::int - sd);
      a := a || jsonb_build_object('v', (a->>'v')::int - sa);
      op := jsonb_set(op, array['feld', i::text], case when (d->>'v')::int <= 0 then 'null'::jsonb else d end);
      pl := jsonb_set(pl, array['feld', i::text], case when (a->>'v')::int <= 0 then 'null'::jsonb else a end);
      st := _k_log(_k_setze(_k_setze(st, p, pl), o, op), jsonb_build_object('art','kampf','p',p,'feld',i,'schaden',sd,'zurueck',sa,
              'tot_d',(d->>'v')::int <= 0,'tot_a',(a->>'v')::int <= 0));
    end if;
  end loop;
  return st;
end $$;

create or replace function public._k_ende(st jsonb) returns jsonb language plpgsql as $$
declare h0 integer := (st->'s'->0->>'hp')::int; h1 integer := (st->'s'->1->>'hp')::int;
begin
  if st->>'phase' = 'ende' then return st; end if;
  if h0 <= 0 or h1 <= 0 or coalesce((st->>'runde')::int, 0) >= 40 then
    return st || jsonb_build_object('phase','ende','frage',null,'sieger',
      case when (h0 <= 0 and h1 <= 0) or h0 = h1 then -1 when h0 > h1 then 0 else 1 end);
  end if;
  return st;
end $$;

-- Computer-Gegner: Stufen mit Lebenspunkten, Trefferquote bei Fragen und festem Deck
create or replace function public._k_stufe(n integer) returns jsonb language sql immutable as $$
  select case n
    when 1 then '{"name":"Praktikant Paul","hp":14,"quote":0.4,"deck":["wbl-azubi","wbl-azubi","wbl-schuh","its-router","its-router","aew-bit","aew-bit","aew-akteur","aew-akteur","its-kabel"]}'
    when 2 then '{"name":"Azubi-Kollegin Ayla","hp":16,"quote":0.55,"deck":["wbl-betriebsrat","wbl-stapler","its-switch","its-backup","aew-byte","aew-byte","aew-lastenheft","aew-variable","its-token","aew-hex"]}'
    when 3 then '{"name":"Ausbilder Bernd","hp":18,"quote":0.65,"deck":["wbl-ausbilder","wbl-sifa","wbl-kammer","wbl-stapler","its-firewall","its-hash","aew-debugger","aew-compiler","aew-byte","its-switch"]}'
    when 4 then '{"name":"Abteilungsleiterin Kaya","hp":20,"quote":0.75,"deck":["wbl-jarbschg","wbl-roboter","its-techniker","its-bruteforce","aew-pflichtenheft","aew-compiler","its-token","its-hash","wbl-kammer","wbl-ausbilder"]}'
    when 5 then '{"name":"Prüfungsausschuss","hp":24,"quote":0.85,"deck":["wbl-pruefer","its-cia","aew-algorithmus","aew-zweier","its-rz","its-techniker","aew-ascii","wbl-roboter","aew-hex","its-server"]}'
  end::jsonb
$$;

create or replace function public._k_bot(st jsonb, p_quote float) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb; op jsonb; k karten; i integer; j integer; d jsonb; score integer; best_s integer; best_h integer; best_f integer;
begin
  st := _k_ende(_k_zug_start(st, 1));
  if st->>'phase' = 'ende' then return st; end if;
  st := _k_antwort(st, 1, random() < p_quote);
  loop
    pl := st->'s'->1; op := st->'s'->0; best_h := null; best_s := -1000;
    for i in 0..jsonb_array_length(pl->'hand') - 1 loop
      select * into k from karten where id = pl->'hand'->>i;
      continue when k.kosten > (pl->>'fokus')::int;
      for j in 0..2 loop
        continue when jsonb_typeof(pl->'feld'->j) = 'object';
        d := op->'feld'->j;
        score := k.kosten * 10 + case
          when jsonb_typeof(d) <> 'object' then 5 + k.angriff
          when k.angriff >= (d->>'v')::int then 8 + (d->>'a')::int
          when (d->>'a')::int >= k.verteidigung then -6
          else 2 end;
        if score > best_s then best_s := score; best_h := i; best_f := j; end if;
      end loop;
    end loop;
    exit when best_h is null;
    st := _k_spielen(st, 1, best_h, best_f);
  end loop;
  return _k_ende(_k_kampf(st, 1));
end $$;

create or replace function public._k_spieler(p_id uuid, p_deck text[], p_hp integer) returns jsonb language sql volatile as $$
  select jsonb_build_object('id', p_id, 'hp', p_hp, 'maxhp', p_hp, 'fokus', 0,
    'deck', (select coalesce(jsonb_agg(x order by random()), '[]') from unnest(p_deck) x),
    'hand', '[]'::jsonb, 'feld', '[null,null,null]'::jsonb, 'zug', 0, 'richtig', 0, 'bonus', false)
$$;

-- Ansicht für einen Spieler: eigene Hand sichtbar, vom Gegner nur Anzahlen
create or replace function public.kampf_ansicht(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); m kaempfe; z jsonb; i integer; du jsonb; ge jsonb; gid uuid;
begin
  select * into m from kaempfe where id = p_id;
  if not found or me is null or me not in (m.spieler_a, coalesce(m.spieler_b, m.spieler_a)) then raise exception 'Kampf nicht gefunden'; end if;
  select k.st into z from kampf_zustand k where k.kampf_id = p_id;
  i := case when me = m.spieler_a then 0 else 1 end;
  du := z->'s'->i; ge := z->'s'->(1 - i);
  gid := case when i = 0 then m.spieler_b else m.spieler_a end;
  return jsonb_build_object(
    'id', m.id, 'status', m.status, 'stufe', m.stufe, 'ich', i, 'gegner_id', gid,
    'gegner_name', case when m.stufe is not null then _k_stufe(m.stufe)->>'name' else (select spitzname from profile where id = gid) end,
    'gegner_farbe', (select farbe from profile where id = gid),
    'du', (du - 'deck' - 'id') || jsonb_build_object('deck', jsonb_array_length(du->'deck')),
    'gegner', (ge - 'deck' - 'hand' - 'id') || jsonb_build_object('deck', jsonb_array_length(ge->'deck'), 'hand', jsonb_array_length(ge->'hand')),
    'dran', m.status = 'laeuft' and (z->>'am')::int = i,
    'phase', z->'phase', 'runde', z->'runde', 'logn', z->'logn',
    'frage', case when (z->>'am')::int = i then z->'frage' else null end,
    'log', z->'log',
    'ergebnis', case when z->>'phase' = 'ende' then case when (z->>'sieger')::int = -1 then 'remis' when (z->>'sieger')::int = i then 'sieg' else 'niederlage' end end,
    'aufgegeben', z->'aufgegeben',
    'belohnung', z->'belohnung'->(i::text));
end $$;

-- Abschluss: Belohnungen für beide Seiten
create or replace function public._k_abschluss(p_id uuid, z jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare m kaempfe; s integer := (z->>'sieger')::int; i integer; uid uuid; erg text; xp integer; co integer; b jsonb; bel jsonb := '{}'; auf integer := (z->>'aufgegeben')::int; stufe_alt integer;
begin
  select * into m from kaempfe where id = p_id for update;
  for i in 0..1 loop
    uid := case when i = 0 then m.spieler_a else m.spieler_b end;
    continue when uid is null;
    erg := case when s = -1 then 'remis' when s = i then 'sieg' else 'niederlage' end;
    if m.stufe is not null then
      xp := case erg when 'sieg' then 30 + 10 * m.stufe when 'remis' then 15 else 10 end;
      co := case erg when 'sieg' then 15 + 10 * m.stufe when 'remis' then 10 else 5 end;
    else
      xp := case erg when 'sieg' then 50 when 'remis' then 25 else 15 end;
      co := case erg when 'sieg' then 40 when 'remis' then 20 else 10 end;
    end if;
    if auf = i then xp := 0; co := 0; end if;
    b := _belohnen(uid, 'karten', erg, xp, co, case when auf = i then 0 else (z->'s'->i->>'richtig')::int end,
                   jsonb_build_object('stufe', m.stufe, 'gegner', coalesce(_k_stufe(m.stufe)->>'name', (select spitzname from profile where id = case when i = 0 then m.spieler_b else m.spieler_a end))));
    if m.stufe is not null and erg = 'sieg' then
      select coalesce((statistik->'karten'->>'stufe')::int, 0) into stufe_alt from spieler_konto where user_id = uid;
      if m.stufe > stufe_alt then
        update spieler_konto set booster = booster + 1, statistik = jsonb_set(statistik, '{karten,stufe}', to_jsonb(m.stufe)) where user_id = uid;
        b := b || jsonb_build_object('stufe_neu', m.stufe, 'booster', (b->>'booster')::int + 1);
      end if;
    end if;
    bel := bel || jsonb_build_object(i::text, b);
  end loop;
  update kaempfe set status = 'fertig', am_zug = null, version = version + 1, geaendert = now(),
    ergebnis = case when s = -1 then 'remis' when s = 0 then 'a' else 'b' end,
    sieger = case when s = 0 then m.spieler_a when s = 1 then m.spieler_b end
  where id = p_id;
  return z || jsonb_build_object('belohnung', bel);
end $$;

create or replace function public._k_speichern(p_id uuid, z jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare m kaempfe;
begin
  select * into m from kaempfe where id = p_id for update;
  if z->>'phase' = 'ende' and m.status = 'laeuft' then z := _k_abschluss(p_id, z);
  else
    update kaempfe set am_zug = case when (z->>'am')::int = 0 then m.spieler_a else m.spieler_b end, version = version + 1, geaendert = now() where id = p_id;
  end if;
  update kampf_zustand set st = z where kampf_id = p_id;
end $$;

-- Laden mit Prüfung: gehört mir, läuft, ich bin dran
create or replace function public._k_laden(p_id uuid, out z jsonb, out i integer, out m kaempfe)
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  select * into m from kaempfe where id = p_id for update;
  if not found or me is null or me not in (m.spieler_a, coalesce(m.spieler_b, m.spieler_a)) then raise exception 'Kampf nicht gefunden'; end if;
  if m.status <> 'laeuft' then raise exception 'Der Kampf ist schon vorbei.'; end if;
  select k.st into z from kampf_zustand k where k.kampf_id = p_id for update;
  i := case when me = m.spieler_a then 0 else 1 end;
end $$;

-- ============ Karten-Kampf: Aufrufe ============
create or replace function public.kampf_starten(p_stufe integer default null, p_gegner uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); deck text[]; gdeck text[]; kid uuid; z jsonb; stf jsonb; frei integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  select karten into deck from decks where user_id = me;
  if p_gegner is null then
    if p_stufe is null or p_stufe < 1 or p_stufe > 5 then raise exception 'Unbekannte Stufe'; end if;
    select coalesce((statistik->'karten'->>'stufe')::int, 0) + 1 into frei from spieler_konto where user_id = me;
    if p_stufe > frei then raise exception 'Diese Stufe ist noch gesperrt – besiege zuerst den vorherigen Gegner.'; end if;
    stf := _k_stufe(p_stufe);
    update kaempfe set status = 'fertig', ergebnis = 'abgebrochen', am_zug = null where spieler_a = me and spieler_b is null and status = 'laeuft';
    insert into kaempfe (klasse_id, spieler_a, stufe, am_zug) values (meine_klasse(), me, p_stufe, me) returning id into kid;
    z := jsonb_build_array(_k_spieler(me, deck, 20), _k_spieler(null, array(select jsonb_array_elements_text(stf->'deck')), (stf->>'hp')::int));
  else
    if p_gegner = me then raise exception 'Du kannst nicht gegen dich selbst spielen.'; end if;
    if meine_klasse() is null or not exists (select 1 from profile where id = p_gegner and klasse_id = meine_klasse()) then raise exception 'Gegner nicht gefunden'; end if;
    if exists (select 1 from kaempfe where status = 'laeuft' and ((spieler_a = me and spieler_b = p_gegner) or (spieler_a = p_gegner and spieler_b = me))) then
      raise exception 'Ihr habt schon einen laufenden Karten-Kampf.';
    end if;
    perform _konto(p_gegner);
    select karten into gdeck from decks where user_id = p_gegner;
    insert into kaempfe (klasse_id, spieler_a, spieler_b, am_zug) values (meine_klasse(), me, p_gegner, me) returning id into kid;
    z := jsonb_build_array(_k_spieler(me, deck, 20), _k_spieler(p_gegner, gdeck, 20));
  end if;
  z := jsonb_build_object('s', z, 'am', 0, 'phase', 'frage', 'runde', 0, 'log', '[]'::jsonb, 'logn', 0, 'gesehen', '[]'::jsonb, 'stufe', p_stufe);
  z := _k_ziehen(_k_ziehen(z, 0, 3), 1, 4);
  z := _k_zug_start(z, 0);
  insert into kampf_zustand (kampf_id, st) values (kid, z);
  return kampf_ansicht(kid);
end $$;

create or replace function public.kampf_antwort(p_id uuid, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; f text; ok boolean;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i or r.z->>'phase' <> 'frage' then raise exception 'Gerade ist keine Frage offen.'; end if;
  f := r.z->>'frage'; ok := _frage_ok(f, p_wahl);
  perform _k_speichern(p_id, _k_antwort(r.z, r.i, ok));
  return kampf_ansicht(p_id) || jsonb_build_object('antwort', jsonb_build_object('frage', f, 'ok', ok, 'richtig', _frage_richtig(f)));
end $$;

create or replace function public.kampf_spielen(p_id uuid, p_hand integer, p_feld integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  perform _k_speichern(p_id, _k_ende(_k_spielen(r.z, r.i, p_hand, p_feld)));
  return kampf_ansicht(p_id);
end $$;

create or replace function public.kampf_zug_beenden(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; z jsonb;
begin
  select * into r from _k_laden(p_id);
  z := r.z;
  if (z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  if z->>'phase' = 'frage' then raise exception 'Beantworte zuerst die Frage.'; end if;
  z := _k_kampf(z, r.i);
  z := _k_ende(z || jsonb_build_object('runde', (z->>'runde')::int + 1));
  if z->>'phase' <> 'ende' then
    if (r.m).spieler_b is null then
      z := _k_bot(z, (_k_stufe((r.m).stufe)->>'quote')::float);
      z := _k_ende(z || jsonb_build_object('runde', (z->>'runde')::int + 1));
      if z->>'phase' <> 'ende' then z := _k_ende(_k_zug_start(z, 0)); end if;
    else
      z := _k_ende(_k_zug_start(z, 1 - r.i));
    end if;
  end if;
  perform _k_speichern(p_id, z);
  return kampf_ansicht(p_id);
end $$;

create or replace function public.kampf_aufgeben(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from _k_laden(p_id);
  perform _k_speichern(p_id, r.z || jsonb_build_object('phase','ende','frage',null,'sieger', 1 - r.i, 'aufgegeben', r.i));
  return kampf_ansicht(p_id);
end $$;

-- ============ Quiz-Millionär ============
-- Wissensleiter (XP): 10 · 20 · 30 · 50 · 75 · 100 · 150 · 200 · 300. Sicherheitsstufen nach Frage 3 und 6. Coins = halbe XP.
create or replace function public._mio_leiter(n integer) returns integer language sql immutable as $$
  select case when n <= 0 then 0 else (array[10,20,30,50,75,100,150,200,300])[least(n, 9)] end
$$;

create or replace function public.mio_starten() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); f text; sid uuid; j jsonb := '{"fifty":true,"hinweis":true,"wechsel":true,"experte":true}';
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  update spiel_sitzungen set status = 'abgebrochen' where user_id = me and spiel = 'mio' and status = 'laeuft';
  f := _frage_neu('{}', 1);
  insert into spiel_sitzungen (user_id, spiel, st) values (me, 'mio', jsonb_build_object('stufe', 0, 'frage', f, 'gesehen', jsonb_build_array(f), 'joker', j))
  returning id into sid;
  return jsonb_build_object('id', sid, 'stufe', 0, 'frage', f, 'joker', j, 'beendet', false);
end $$;

create or replace function public._mio_laden(p_id uuid) returns spiel_sitzungen
language plpgsql security definer set search_path = public as $$
declare s spiel_sitzungen;
begin
  select * into s from spiel_sitzungen where id = p_id and user_id = auth.uid() and spiel = 'mio' for update;
  if not found then raise exception 'Spiel nicht gefunden'; end if;
  if s.status <> 'laeuft' then raise exception 'Dieses Spiel ist schon vorbei.'; end if;
  return s;
end $$;

create or replace function public._mio_ende(s spiel_sitzungen, p_stufe integer, p_ergebnis text, p_xp integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare b jsonb; beste integer;
begin
  update spiel_sitzungen set status = 'fertig', st = st || jsonb_build_object('stufe', p_stufe), geaendert = now() where id = s.id;
  b := _belohnen(s.user_id, 'mio', p_ergebnis, p_xp, p_xp / 2, p_stufe, jsonb_build_object('stufe', p_stufe));
  select coalesce((statistik->'mio'->>'beste')::int, 0) into beste from spieler_konto where user_id = s.user_id;
  if p_stufe > beste then update spieler_konto set statistik = jsonb_set(statistik, '{mio,beste}', to_jsonb(p_stufe)) where user_id = s.user_id; end if;
  if p_stufe >= 9 then
    update spieler_konto set booster = booster + 1, titel = case when 'Quiz-Millionär' = any(titel) then titel else titel || 'Quiz-Millionär'::text end where user_id = s.user_id;
    b := b || jsonb_build_object('titel', 'Quiz-Millionär', 'booster', (b->>'booster')::int + 1);
  end if;
  return b;
end $$;

create or replace function public.mio_antwort(p_id uuid, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s spiel_sitzungen := _mio_laden(p_id); f text := s.st->>'frage'; ok boolean := _frage_ok(f, p_wahl); stu integer := (s.st->>'stufe')::int;
  neu text; ges jsonb := s.st->'gesehen'; sicher integer;
begin
  if ok then
    stu := stu + 1;
    if stu >= 9 then
      return jsonb_build_object('ok', true, 'richtig', _frage_richtig(f), 'stufe', stu, 'beendet', true, 'gewinn', _mio_leiter(9),
                                'belohnung', _mio_ende(s, 9, 'sieg', _mio_leiter(9)));
    end if;
    neu := _frage_neu(array(select jsonb_array_elements_text(ges)), case when stu < 3 then 1 else 2 end);
    update spiel_sitzungen set st = st || jsonb_build_object('stufe', stu, 'frage', neu, 'gesehen', ges || to_jsonb(neu)), geaendert = now() where id = s.id;
    return jsonb_build_object('ok', true, 'richtig', _frage_richtig(f), 'stufe', stu, 'frage', neu, 'beendet', false, 'gewinn', _mio_leiter(stu));
  end if;
  sicher := case when stu >= 6 then 6 when stu >= 3 then 3 else 0 end;
  return jsonb_build_object('ok', false, 'richtig', _frage_richtig(f), 'stufe', stu, 'beendet', true, 'gewinn', _mio_leiter(sicher),
                            'belohnung', _mio_ende(s, stu, 'verloren', _mio_leiter(sicher)));
end $$;

create or replace function public.mio_aussteigen(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s spiel_sitzungen := _mio_laden(p_id); stu integer := (s.st->>'stufe')::int;
begin
  return jsonb_build_object('stufe', stu, 'beendet', true, 'gewinn', _mio_leiter(stu), 'belohnung', _mio_ende(s, stu, 'ausgestiegen', _mio_leiter(stu)));
end $$;

create or replace function public.mio_joker(p_id uuid, p_art text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare s spiel_sitzungen := _mio_laden(p_id); f text := s.st->>'frage'; q spiel_fragen; falsche integer[]; neu text; stu integer := (s.st->>'stufe')::int;
begin
  if coalesce((s.st->'joker'->>p_art)::boolean, false) = false then raise exception 'Diesen Joker hast du schon benutzt.'; end if;
  update spiel_sitzungen set st = jsonb_set(st, array['joker', p_art], 'false'), geaendert = now() where id = s.id;
  select * into q from spiel_fragen where id = f;
  falsche := array(select x from generate_series(0, q.anzahl - 1) x where x <> q.richtig order by random());
  case p_art
    when 'fifty' then return jsonb_build_object('art', p_art, 'weg', to_jsonb(falsche[1:greatest(q.anzahl - 2, 1)]));
    when 'hinweis' then return jsonb_build_object('art', p_art, 'falsch', falsche[1]);
    when 'experte' then return jsonb_build_object('art', p_art, 'vorschlag', case when random() < 0.85 then q.richtig else falsche[1] end, 'sicher', 70 + floor(random() * 26)::int);
    when 'wechsel' then
      neu := _frage_neu(array(select jsonb_array_elements_text(s.st->'gesehen')), case when stu < 3 then 1 else 2 end);
      update spiel_sitzungen set st = st || jsonb_build_object('frage', neu, 'gesehen', (st->'gesehen') || to_jsonb(neu)) where id = s.id;
      return jsonb_build_object('art', p_art, 'frage', neu);
    else raise exception 'Unbekannter Joker';
  end case;
end $$;

-- ============ Bomben-Quiz ============
-- Die Explosionszeit (20–45 s nach Zündung) liegt nur in bomben_geheim. Die Clients fragen jede Sekunde bombe_pruefen,
-- der Server entscheidet, ob es geknallt hat.
create or replace function public._bombe_ansicht(p_raum uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(r) || jsonb_build_object('jetzt', now(),
    'namen', (select coalesce(jsonb_object_agg(p.id, jsonb_build_object('n', p.spitzname, 'f', p.farbe)), '{}') from profile p where p.id = any(r.spieler)))
  from bomben_raeume r where r.id = p_raum
$$;

create or replace function public._bombe_mitglied(p_raum uuid) returns bomben_raeume
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  if not found or auth.uid() is null or not (auth.uid() = any(r.spieler)) then raise exception 'Raum nicht gefunden'; end if;
  return r;
end $$;

create or replace function public._bombe_lebend(r bomben_raeume) returns uuid[] language sql immutable as $$
  select coalesce(array(select u from unnest(r.spieler) with ordinality t(u, n) where coalesce((r.leben->>u::text)::int, 0) > 0 order by n), '{}')
$$;

create or replace function public._bombe_naechster(r bomben_raeume, p_von uuid) returns uuid language plpgsql immutable as $$
declare l uuid[] := _bombe_lebend(r); n integer := array_length(r.spieler, 1); i integer := coalesce(array_position(r.spieler, p_von), 1); j integer; c uuid;
begin
  for j in 1..n loop
    c := r.spieler[((i - 1 + j) % n) + 1];
    if c = any(l) and c <> p_von then return c; end if;
  end loop;
  return p_von;
end $$;

create or replace function public._bombe_runde(p_raum uuid, p_bei uuid) returns void
language plpgsql security definer set search_path = public as $$
declare f text;
begin
  f := _frage_neu((select gesehen from bomben_geheim where raum_id = p_raum));
  update bomben_raeume set status = 'laeuft', runde = runde + 1, bombe_bei = p_bei, frage_id = f, frage_nr = frage_nr + 1,
    zuendung = now(), gesperrt_bis = null, letzte = jsonb_build_object('art','start','an',p_bei), geaendert = now() where id = p_raum;
  update bomben_geheim set explodiert_um = now() + make_interval(secs => 20 + random() * 25),
    gesehen = (case when coalesce(array_length(gesehen, 1), 0) > 40 then gesehen[2:] else gesehen end) || f where raum_id = p_raum;
end $$;

create or replace function public._bombe_fertig(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume; u uuid; l uuid[]; sieg boolean;
begin
  select * into r from bomben_raeume where id = p_raum for update;
  l := _bombe_lebend(r);
  update bomben_raeume set status = 'fertig', sieger = l[1], bombe_bei = null, geaendert = now() where id = p_raum;
  foreach u in array r.spieler loop
    sieg := u = l[1];
    perform _belohnen(u, 'bombe', case when sieg then 'sieg' else 'niederlage' end, case when sieg then 40 else 15 end, case when sieg then 30 else 10 end,
                      coalesce((r.richtige->>u::text)::int, 0), jsonb_build_object('spieler', array_length(r.spieler, 1), 'runden', r.runde));
  end loop;
end $$;

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
  if coalesce(array_length(_bombe_lebend(r), 1), 0) <= 1 then perform _bombe_fertig(p_raum); end if;
end $$;

create or replace function public.bombe_erstellen() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); kl uuid := meine_klasse(); c text; rid uuid; z text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
begin
  if me is null or kl is null then raise exception 'Für das Bomben-Quiz brauchst du ein Konto.'; end if;
  loop
    c := (select string_agg(substr(z, 1 + floor(random() * length(z))::int, 1), '') from generate_series(1, 4));
    exit when not exists (select 1 from bomben_raeume where code = c and status <> 'fertig' and geaendert > now() - interval '3 hours');
  end loop;
  insert into bomben_raeume (code, klasse_id, host, spieler, leben) values (c, kl, me, array[me], jsonb_build_object(me::text, 2)) returning id into rid;
  insert into bomben_geheim (raum_id) values (rid);
  return _bombe_ansicht(rid);
end $$;

create or replace function public.bombe_beitreten(p_code text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r bomben_raeume;
begin
  if me is null or meine_klasse() is null then raise exception 'Für das Bomben-Quiz brauchst du ein Konto.'; end if;
  select * into r from bomben_raeume where code = upper(trim(p_code)) and klasse_id = meine_klasse() and status = 'lobby' and geaendert > now() - interval '3 hours'
  order by erstellt desc limit 1 for update;
  if not found then raise exception 'Kein offener Raum mit diesem Code.'; end if;
  if me = any(r.spieler) then return _bombe_ansicht(r.id); end if;
  if array_length(r.spieler, 1) >= 6 then raise exception 'Der Raum ist voll (6 Spieler).'; end if;
  update bomben_raeume set spieler = spieler || me, leben = leben || jsonb_build_object(me::text, 2), geaendert = now() where id = r.id;
  return _bombe_ansicht(r.id);
end $$;

create or replace function public.bombe_starten(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume := _bombe_mitglied(p_raum);
begin
  if r.host <> auth.uid() then raise exception 'Nur wer den Raum erstellt hat, kann starten.'; end if;
  if r.status <> 'lobby' then raise exception 'Das Spiel läuft schon.'; end if;
  if array_length(r.spieler, 1) < 2 then raise exception 'Es braucht mindestens 2 Spieler.'; end if;
  update bomben_raeume set leben = (select jsonb_object_agg(u, 2) from unnest(spieler) u), richtige = '{}', raus = '{}' where id = p_raum;
  perform _bombe_runde(p_raum, r.spieler[1 + floor(random() * array_length(r.spieler, 1))::int]);
  return _bombe_ansicht(p_raum);
end $$;

create or replace function public.bombe_pruefen(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _bombe_mitglied(p_raum);
  perform _bombe_check(p_raum);
  return _bombe_ansicht(p_raum);
end $$;

create or replace function public.bombe_antwort(p_raum uuid, p_nr integer, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r bomben_raeume; ok boolean; f text; an uuid;
begin
  perform _bombe_mitglied(p_raum);
  perform _bombe_check(p_raum);
  select * into r from bomben_raeume where id = p_raum for update;
  if r.status <> 'laeuft' or r.frage_nr <> p_nr then return _bombe_ansicht(p_raum); end if;
  if r.bombe_bei <> me then raise exception 'Die Bombe ist nicht bei dir.'; end if;
  if r.gesperrt_bis is not null and now() < r.gesperrt_bis then raise exception 'Kurz warten …'; end if;
  f := r.frage_id; ok := _frage_ok(f, p_wahl);
  if ok then
    an := _bombe_naechster(r, me);
    update bomben_raeume set richtige = richtige || jsonb_build_object(me::text, coalesce((richtige->>me::text)::int, 0) + 1),
      bombe_bei = an, letzte = jsonb_build_object('art','weiter','von',me,'an',an), gesperrt_bis = null where id = p_raum;
  else
    update bomben_raeume set letzte = jsonb_build_object('art','falsch','wer',me), gesperrt_bis = now() + interval '2 seconds' where id = p_raum;
  end if;
  f := _frage_neu((select gesehen from bomben_geheim where raum_id = p_raum));
  update bomben_raeume set frage_id = f, frage_nr = frage_nr + 1, geaendert = now() where id = p_raum;
  update bomben_geheim set gesehen = (case when coalesce(array_length(gesehen, 1), 0) > 40 then gesehen[2:] else gesehen end) || f where raum_id = p_raum;
  return _bombe_ansicht(p_raum) || jsonb_build_object('antwort', jsonb_build_object('ok', ok, 'richtig', _frage_richtig(r.frage_id), 'frage', r.frage_id));
end $$;

-- Nach der Explosion (3,5 s Pause für die Animation) startet die nächste Runde. Jeder im Raum darf auslösen.
create or replace function public.bombe_weiter(p_raum uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r bomben_raeume := _bombe_mitglied(p_raum); opfer uuid;
begin
  if r.status = 'boom' and now() >= (r.letzte->>'zeit')::timestamptz + interval '3.5 seconds' then
    opfer := (r.letzte->>'opfer')::uuid;
    perform _bombe_runde(p_raum, case when opfer = any(_bombe_lebend(r)) then opfer else _bombe_naechster(r, opfer) end);
  end if;
  return _bombe_ansicht(p_raum);
end $$;

create or replace function public.bombe_verlassen(p_raum uuid) returns void
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); r bomben_raeume := _bombe_mitglied(p_raum);
begin
  if r.status = 'lobby' then
    if array_length(r.spieler, 1) <= 1 then delete from bomben_raeume where id = p_raum; return; end if;
    update bomben_raeume set spieler = array_remove(spieler, me), leben = leben - me::text,
      host = case when host = me then (array_remove(spieler, me))[1] else host end, geaendert = now() where id = p_raum;
  elsif r.status in ('laeuft','boom') then
    update bomben_raeume set leben = leben || jsonb_build_object(me::text, 0), raus = case when me = any(raus) then raus else raus || me end,
      letzte = jsonb_build_object('art','verlassen','wer',me), geaendert = now() where id = p_raum returning * into r;
    if coalesce(array_length(_bombe_lebend(r), 1), 0) <= 1 then perform _bombe_fertig(p_raum);
    elsif r.status = 'laeuft' and r.bombe_bei = me then perform _bombe_runde(p_raum, _bombe_naechster(r, me));
    end if;
  end if;
end $$;

-- ============ Wissens-Arena ============
-- 5 Runden, beide bekommen dieselbe Frage. Richtig: Schaden beim Gegner (≤ 4 s: 14, ≤ 9 s: 11, sonst 8). 50 Lebenspunkte.
create or replace function public._arena_ansicht(p_id uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(m) || jsonb_build_object('jetzt', now(), 'ich', case when m.spieler_a = auth.uid() then 'a' else 'b' end,
    'namen', (select coalesce(jsonb_object_agg(p.id, jsonb_build_object('n', p.spitzname, 'f', p.farbe)), '{}') from profile p where p.id in (m.spieler_a, m.spieler_b)),
    'rang', (select coalesce(jsonb_object_agg(k.user_id, k.rang_punkte), '{}') from spieler_konto k where k.user_id in (m.spieler_a, m.spieler_b)))
  from arena_matches m where m.id = p_id
$$;

create or replace function public._arena_runde(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update arena_matches m set runde = m.runde + 1, frage_id = (select g.fragen[m.runde + 1] from arena_geheim g where g.match_id = p_id),
    runde_start = now() + interval '3 seconds', runde_ende = now() + interval '23 seconds', a_fertig = false, b_fertig = false, geaendert = now()
  where m.id = p_id;
end $$;

create or replace function public._arena_neu(p_a uuid, p_b uuid, p_status text) returns uuid
language plpgsql security definer set search_path = public as $$
declare mid uuid;
begin
  perform _konto(p_a); perform _konto(p_b);
  insert into arena_matches (klasse_id, spieler_a, spieler_b, status) values ((select klasse_id from profile where id = p_a), p_a, p_b, p_status) returning id into mid;
  insert into arena_geheim (match_id, fragen) values (mid, array(select id from spiel_fragen order by random() limit 5));
  if (select coalesce(array_length(fragen, 1), 0) from arena_geheim where match_id = mid) < 5 then raise exception 'Es sind noch keine Spielfragen hinterlegt (spiel-fragen.sql ausführen).'; end if;
  if p_status = 'laeuft' then perform _arena_runde(mid); end if;
  return mid;
end $$;

create or replace function public._arena_abschluss(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches; erg text; i integer; uid uuid; e text; k spieler_konto; d integer; ri integer; rp jsonb := '{}';
begin
  select * into m from arena_matches where id = p_id for update;
  erg := case when m.hp_a > m.hp_b then 'a' when m.hp_b > m.hp_a then 'b' else 'remis' end;
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

create or replace function public._arena_aufloesen(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches; g arena_geheim; ra jsonb; rb jsonb; leer jsonb := '{"ok":false,"ms":null,"schaden":0}';
begin
  select * into m from arena_matches where id = p_id for update;
  if m.status <> 'laeuft' then return; end if;
  select * into g from arena_geheim where match_id = p_id;
  ra := coalesce(g.antworten->(m.runde::text)->'a', leer);
  rb := coalesce(g.antworten->(m.runde::text)->'b', leer);
  update arena_matches set hp_a = greatest(0, hp_a - (rb->>'schaden')::int), hp_b = greatest(0, hp_b - (ra->>'schaden')::int),
    verlauf = verlauf || jsonb_build_array(jsonb_build_object('runde', m.runde, 'frage', m.frage_id, 'richtig', _frage_richtig(m.frage_id), 'a', ra, 'b', rb)),
    geaendert = now()
  where id = p_id returning * into m;
  if m.hp_a <= 0 or m.hp_b <= 0 or m.runde >= m.runden then perform _arena_abschluss(p_id);
  else perform _arena_runde(p_id); end if;
end $$;

create or replace function public._arena_pruefen(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare m arena_matches;
begin
  select * into m from arena_matches where id = p_id for update;
  if m.status = 'angefragt' and m.erstellt < now() - interval '15 minutes' then
    update arena_matches set status = 'abgebrochen', geaendert = now() where id = p_id;
  elsif m.status = 'laeuft' and m.runde_ende < now() - interval '2 minutes' then
    update arena_matches set status = 'abgebrochen', frage_id = null, geaendert = now() where id = p_id;   -- beide weg: ohne Wertung
  elsif m.status = 'laeuft' and now() > m.runde_ende + interval '1 second' then
    perform _arena_aufloesen(p_id);
  end if;
end $$;

create or replace function public._arena_mitglied(p_id uuid) returns arena_matches
language plpgsql security definer set search_path = public as $$
declare m arena_matches;
begin
  select * into m from arena_matches where id = p_id;
  if not found or auth.uid() is null or auth.uid() not in (m.spieler_a, m.spieler_b) then raise exception 'Match nicht gefunden'; end if;
  return m;
end $$;

create or replace function public.arena_herausfordern(p_gegner uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); mid uuid;
begin
  if me is null or meine_klasse() is null then raise exception 'Für die Arena brauchst du ein Konto.'; end if;
  if p_gegner = me then raise exception 'Du kannst dich nicht selbst herausfordern.'; end if;
  if not exists (select 1 from profile where id = p_gegner and klasse_id = meine_klasse()) then raise exception 'Gegner nicht gefunden'; end if;
  update arena_matches set status = 'abgebrochen' where status = 'angefragt' and erstellt < now() - interval '15 minutes'
    and (spieler_a in (me, p_gegner) or spieler_b in (me, p_gegner));
  if exists (select 1 from arena_matches where ((spieler_a = me and spieler_b = p_gegner) or (spieler_a = p_gegner and spieler_b = me))
             and (status = 'angefragt' or (status = 'laeuft' and runde_ende > now() - interval '2 minutes'))) then
    raise exception 'Zwischen euch läuft schon eine Herausforderung.';
  end if;
  mid := _arena_neu(me, p_gegner, 'angefragt');
  return _arena_ansicht(mid);
end $$;

create or replace function public.arena_annehmen(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare m arena_matches := _arena_mitglied(p_id);
begin
  perform _arena_pruefen(p_id);
  select * into m from arena_matches where id = p_id for update;
  if m.spieler_b <> auth.uid() then raise exception 'Nur wer herausgefordert wurde, kann annehmen.'; end if;
  if m.status <> 'angefragt' then raise exception 'Diese Herausforderung gilt nicht mehr.'; end if;
  update arena_matches set status = 'laeuft' where id = p_id;
  perform _arena_runde(p_id);
  return _arena_ansicht(p_id);
end $$;

create or replace function public.arena_ablehnen(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform _arena_mitglied(p_id);
  update arena_matches set status = 'abgelehnt', geaendert = now() where id = p_id and status = 'angefragt';
end $$;

-- Warteschlange: trifft auf jemanden aus der Klasse, der gerade auch sucht. Der Client ruft alle paar Sekunden erneut auf.
create or replace function public.arena_suchen() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); kl uuid := meine_klasse(); g uuid; mid uuid;
begin
  if me is null or kl is null then raise exception 'Für die Arena brauchst du ein Konto.'; end if;
  -- Hat mich schon jemand aus der Warteschlange geholt? Dann dieses Match (falls die Live-Nachricht nicht ankam)
  select id into mid from arena_matches where spieler_a = me and status = 'laeuft' and runde = 1 and erstellt > now() - interval '30 seconds' order by erstellt desc limit 1;
  if found then return _arena_ansicht(mid); end if;
  delete from arena_warteschlange where seit < now() - interval '30 seconds';
  select user_id into g from arena_warteschlange where klasse_id = kl and user_id <> me order by seit limit 1 for update skip locked;
  if found then
    delete from arena_warteschlange where user_id in (me, g);
    mid := _arena_neu(g, me, 'laeuft');
    return _arena_ansicht(mid);
  end if;
  insert into arena_warteschlange (user_id, klasse_id, seit) values (me, kl, now()) on conflict (user_id) do update set seit = now(), klasse_id = kl;
  return null;
end $$;

create or replace function public.arena_suche_abbrechen() returns void
language sql security definer set search_path = public as $$ delete from arena_warteschlange where user_id = auth.uid() $$;

create or replace function public.arena_pruefen(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform _arena_mitglied(p_id);
  perform _arena_pruefen(p_id);
  return _arena_ansicht(p_id);
end $$;

create or replace function public.arena_antwort(p_id uuid, p_runde integer, p_wahl integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); m arena_matches := _arena_mitglied(p_id); seite text; ms integer; ok boolean; schaden integer; f text;
begin
  perform _arena_pruefen(p_id);
  select * into m from arena_matches where id = p_id for update;
  if m.status <> 'laeuft' or m.runde <> p_runde then return _arena_ansicht(p_id); end if;
  if now() < m.runde_start then raise exception 'Die Runde hat noch nicht begonnen.'; end if;
  seite := case when me = m.spieler_a then 'a' else 'b' end;
  if (seite = 'a' and m.a_fertig) or (seite = 'b' and m.b_fertig) then return _arena_ansicht(p_id); end if;
  f := m.frage_id;
  ms := (extract(epoch from (now() - m.runde_start)) * 1000)::int;
  ok := _frage_ok(f, p_wahl);
  schaden := case when not ok then 0 when ms <= 4000 then 14 when ms <= 9000 then 11 else 8 end;
  update arena_geheim set antworten = jsonb_set(antworten, array[m.runde::text],
    coalesce(antworten->(m.runde::text), '{}') || jsonb_build_object(seite, jsonb_build_object('ok', ok, 'ms', ms, 'schaden', schaden, 'wahl', p_wahl)))
  where match_id = p_id;
  update arena_matches set a_fertig = a_fertig or seite = 'a', b_fertig = b_fertig or seite = 'b', geaendert = now() where id = p_id returning * into m;
  if m.a_fertig and m.b_fertig then perform _arena_aufloesen(p_id); end if;
  return _arena_ansicht(p_id) || jsonb_build_object('antwort', jsonb_build_object('ok', ok, 'richtig', _frage_richtig(f), 'schaden', schaden, 'ms', ms, 'frage', f));
end $$;

-- Arena-Rangliste der eigenen Klasse (nur Summen)
create or replace function public.arena_rangliste()
returns table (id uuid, spitzname text, farbe text, rang_punkte integer, siege integer, niederlagen integer, remis integer, serie integer)
language sql stable security definer set search_path = public as $$
  select p.id, p.spitzname, p.farbe, coalesce(k.rang_punkte, 0), coalesce(k.arena_siege, 0), coalesce(k.arena_niederlagen, 0), coalesce(k.arena_remis, 0), coalesce(k.arena_serie, 0)
  from profile p left join spieler_konto k on k.user_id = p.id
  where p.klasse_id = meine_klasse()
$$;

-- ============ Admin: Reset löscht auch Spieldaten ============
create or replace function public._spiele_loeschen(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from kaempfe where spieler_a = p_uid or spieler_b = p_uid;
  delete from arena_matches where spieler_a = p_uid or spieler_b = p_uid;
  delete from arena_warteschlange where user_id = p_uid;
  delete from bomben_raeume where p_uid = any(spieler);
  delete from spiel_sitzungen where user_id = p_uid;
  delete from spiel_ergebnisse where user_id = p_uid;
  delete from karten_sammlung where user_id = p_uid;
  delete from decks where user_id = p_uid;
  delete from spieler_konto where user_id = p_uid;
end $$;

create or replace function public.admin_reset_alle() returns void
language plpgsql security definer set search_path = public as $$
declare u uuid;
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  for u in select id from profile where klasse_id = meine_klasse() loop perform _spiele_loeschen(u); end loop;
  delete from duelle where klasse_id = meine_klasse();
  delete from tages_xp where user_id in (select id from profile where klasse_id = meine_klasse());
  delete from lernstand where user_id in (select id from profile where klasse_id = meine_klasse());
  update profile set xp = 0, level = 1, abzeichen = 0 where klasse_id = meine_klasse();
  update einstellungen set reset_ab = now() where id = 1;
end $$;

create or replace function public.admin_reset_nutzer(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if not exists (select 1 from profile where id = p_uid and klasse_id = meine_klasse()) then raise exception 'Nutzer nicht gefunden'; end if;
  perform _spiele_loeschen(p_uid);
  delete from duelle where spieler_a = p_uid or spieler_b = p_uid;
  delete from tages_xp where user_id = p_uid;
  delete from lernstand where user_id = p_uid;
  update profile set xp = 0, level = 1, abzeichen = 0, reset_ab = now() where id = p_uid;
end $$;

-- ============ Rechte ============
-- Supabase gibt neuen Tabellen und Funktionen standardmäßig Rechte für anon/authenticated. Hier wird das bewusst zurückgenommen.
revoke all on public.spieler_konto, public.spiel_fragen, public.karten, public.karten_sammlung, public.decks, public.spiel_ergebnisse, public.spiel_sitzungen,
  public.kaempfe, public.kampf_zustand, public.bomben_raeume, public.bomben_geheim, public.arena_matches, public.arena_geheim, public.arena_warteschlange
  from anon, authenticated;
grant select on public.karten, public.kaempfe, public.bomben_raeume, public.arena_matches to authenticated;

alter table public.spieler_konto       enable row level security;
alter table public.spiel_fragen        enable row level security;
alter table public.karten              enable row level security;
alter table public.karten_sammlung     enable row level security;
alter table public.decks               enable row level security;
alter table public.spiel_ergebnisse    enable row level security;
alter table public.spiel_sitzungen     enable row level security;
alter table public.kaempfe             enable row level security;
alter table public.kampf_zustand       enable row level security;
alter table public.bomben_raeume       enable row level security;
alter table public.bomben_geheim       enable row level security;
alter table public.arena_matches       enable row level security;
alter table public.arena_geheim        enable row level security;
alter table public.arena_warteschlange enable row level security;

drop policy if exists "karten lesen" on public.karten;
create policy "karten lesen" on public.karten for select to authenticated using (true);
drop policy if exists "kampf beteiligte" on public.kaempfe;
create policy "kampf beteiligte" on public.kaempfe for select to authenticated using (auth.uid() in (spieler_a, spieler_b));
drop policy if exists "bombe mitspieler" on public.bomben_raeume;
create policy "bombe mitspieler" on public.bomben_raeume for select to authenticated using (auth.uid() = any(spieler));
drop policy if exists "arena beteiligte" on public.arena_matches;
create policy "arena beteiligte" on public.arena_matches for select to authenticated using (auth.uid() in (spieler_a, spieler_b));

-- Hilfsfunktionen (Unterstrich) sind nicht aufrufbar, die Spiel-Aufrufe nur mit Konto
do $$
declare f record;
  rpcs text[] := array['spiel_konto','spiel_xp_abholen','deck_speichern','booster_kaufen','booster_oeffnen',
    'kampf_ansicht','kampf_starten','kampf_antwort','kampf_spielen','kampf_zug_beenden','kampf_aufgeben',
    'mio_starten','mio_antwort','mio_aussteigen','mio_joker',
    'bombe_erstellen','bombe_beitreten','bombe_starten','bombe_pruefen','bombe_antwort','bombe_weiter','bombe_verlassen',
    'arena_herausfordern','arena_annehmen','arena_ablehnen','arena_suchen','arena_suche_abbrechen','arena_pruefen','arena_antwort','arena_rangliste',
    'admin_reset_alle','admin_reset_nutzer'];
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like '\_%' or p.proname = any(rpcs)) loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    if f.proname like '\_%' then execute format('revoke execute on function %s from authenticated', f.sig);
    else execute format('grant execute on function %s to authenticated', f.sig); end if;
  end loop;
end $$;

-- Live-Aktualisierung
do $$ begin alter publication supabase_realtime add table public.kaempfe; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.bomben_raeume; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.arena_matches; exception when duplicate_object then null; end $$;

select 'Games angelegt – jetzt spiel-fragen.sql ausführen' as ergebnis, (select count(*) from public.karten) as karten;
