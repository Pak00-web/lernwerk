-- Lernwerk – Datenbank für Supabase
-- Einmal komplett im Supabase-Dashboard unter "SQL Editor" ausführen.
-- Grundsatz: so wenig Daten wie möglich. Kein Klarname, keine E-Mail – nur Spitzname, Passwort (bei Supabase gehasht) und Lernstand.

-- ============ Tabellen ============
create table if not exists public.klassen (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  code  text not null unique            -- Beitrittscode, den der Klassen-Admin verteilt
);

create table if not exists public.profile (
  id          uuid primary key references auth.users on delete cascade,
  spitzname   text not null unique check (char_length(spitzname) between 3 and 20),
  klasse_id   uuid not null references public.klassen on delete restrict,
  farbe       text not null default 'aew',
  xp          integer not null default 0,
  level       integer not null default 1,
  abzeichen   integer not null default 0,
  erstellt    timestamptz not null default now()
);

create table if not exists public.lernstand (
  user_id     uuid primary key references auth.users on delete cascade,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists public.tages_xp (
  user_id  uuid not null references auth.users on delete cascade,
  tag      date not null,
  xp       integer not null default 0,
  primary key (user_id, tag)
);

create table if not exists public.duelle (
  id          uuid primary key default gen_random_uuid(),
  klasse_id   uuid not null references public.klassen on delete cascade,
  spieler_a   uuid not null references auth.users on delete cascade,
  spieler_b   uuid not null references auth.users on delete cascade,
  am_zug      uuid,
  status      text not null default 'laeuft' check (status in ('laeuft','fertig','abgelehnt')),
  runden      jsonb not null default '[]',
  punkte_a    integer not null default 0,
  punkte_b    integer not null default 0,
  erstellt    timestamptz not null default now(),
  geaendert   timestamptz not null default now(),
  check (spieler_a <> spieler_b)
);
create index if not exists duelle_a on public.duelle (spieler_a);
create index if not exists duelle_b on public.duelle (spieler_b);

-- ============ Hilfsfunktionen ============
create or replace function public.meine_klasse() returns uuid
language sql stable security definer set search_path = public as $$
  select klasse_id from profile where id = auth.uid()
$$;

-- Registrierung abschließen: Klasse über den Code finden und Profil anlegen
create or replace function public.klasse_beitreten(p_code text, p_spitzname text, p_farbe text)
returns text language plpgsql security definer set search_path = public as $$
declare k klassen;
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  select * into k from klassen where lower(code) = lower(trim(p_code));
  if not found then raise exception 'Klassencode unbekannt'; end if;
  insert into profile (id, spitzname, klasse_id, farbe) values (auth.uid(), trim(p_spitzname), k.id, coalesce(p_farbe,'aew'))
  on conflict (id) do update set klasse_id = excluded.klasse_id;
  return k.name;
end $$;

-- Klassenname des eigenen Profils (klassen selbst ist nicht direkt lesbar, sonst wären die Codes sichtbar)
create or replace function public.klasse_name() returns text
language sql stable security definer set search_path = public as $$
  select k.name from klassen k join profile p on p.klasse_id = k.id where p.id = auth.uid()
$$;

-- Rangliste der eigenen Klasse: Wochen-XP (ab Montag) und Gesamt-XP
create or replace function public.rangliste()
returns table (id uuid, spitzname text, farbe text, level integer, abzeichen integer, woche integer, gesamt integer)
language sql stable security definer set search_path = public as $$
  select p.id, p.spitzname, p.farbe, p.level, p.abzeichen,
         coalesce((select sum(t.xp) from tages_xp t where t.user_id = p.id and t.tag >= date_trunc('week', current_date)::date), 0)::int,
         p.xp
  from profile p
  where p.klasse_id = meine_klasse()
$$;

-- Rangliste für Quiz-Duelle
-- Liefert je Spieler der eigenen Klasse nur Summen (Siege, Niederlagen, Unentschieden) – einzelne Duelle bleiben privat.
create or replace function public.duell_rangliste()
returns table (id uuid, spitzname text, farbe text, siege integer, niederlagen integer, remis integer, gespielt integer, punkte integer)
language sql stable security definer set search_path = public as $
  select p.id, p.spitzname, p.farbe,
    (count(*) filter (where (d.spieler_a = p.id and d.punkte_a > d.punkte_b) or (d.spieler_b = p.id and d.punkte_b > d.punkte_a)))::int,
    (count(*) filter (where (d.spieler_a = p.id and d.punkte_a < d.punkte_b) or (d.spieler_b = p.id and d.punkte_b < d.punkte_a)))::int,
    (count(*) filter (where d.id is not null and d.punkte_a = d.punkte_b))::int,
    count(d.id)::int,
    coalesce(sum(case when d.spieler_a = p.id then d.punkte_a when d.spieler_b = p.id then d.punkte_b end), 0)::int
  from profile p
  left join duelle d on d.status = 'fertig' and (d.spieler_a = p.id or d.spieler_b = p.id)
  where p.klasse_id = meine_klasse()
  group by p.id, p.spitzname, p.farbe
$;
revoke execute on function public.duell_rangliste() from public, anon;
grant execute on function public.duell_rangliste() to authenticated;

-- Konto samt allen Daten löschen (Recht auf Löschung)
create or replace function public.konto_loeschen() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'nicht angemeldet'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke execute on function public.meine_klasse(), public.klasse_beitreten(text,text,text), public.klasse_name(), public.rangliste(), public.konto_loeschen() from public, anon;

-- ============ Rechte (unabhängig von den Projekt-Voreinstellungen) ============
revoke all on public.klassen, public.profile, public.lernstand, public.tages_xp, public.duelle from anon;
revoke all on public.klassen from authenticated;
grant select on public.profile to authenticated;
grant select, insert, update, delete on public.lernstand, public.tages_xp to authenticated;
grant select, insert, update on public.duelle to authenticated;
grant execute on function public.meine_klasse(), public.klasse_beitreten(text,text,text), public.klasse_name(), public.rangliste(), public.konto_loeschen() to authenticated;

-- ============ Zugriffsregeln (Row Level Security) ============
alter table public.klassen   enable row level security;   -- keine Policy: nur über Funktionen erreichbar
alter table public.profile   enable row level security;
alter table public.lernstand enable row level security;
alter table public.tages_xp  enable row level security;
alter table public.duelle    enable row level security;

drop policy if exists "profil klasse lesen" on public.profile;
create policy "profil klasse lesen" on public.profile for select to authenticated
  using (klasse_id = public.meine_klasse() or id = auth.uid());
drop policy if exists "profil eigenes aendern" on public.profile;
create policy "profil eigenes aendern" on public.profile for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Klasse und Spitzname lassen sich nachträglich nicht direkt ändern
revoke update on public.profile from authenticated;
grant update (farbe, xp, level, abzeichen) on public.profile to authenticated;

drop policy if exists "lernstand eigener" on public.lernstand;
create policy "lernstand eigener" on public.lernstand for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "xp eigene schreiben" on public.tages_xp;
create policy "xp eigene schreiben" on public.tages_xp for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "duell beteiligte lesen" on public.duelle;
create policy "duell beteiligte lesen" on public.duelle for select to authenticated
  using (auth.uid() in (spieler_a, spieler_b));
drop policy if exists "duell anlegen" on public.duelle;
create policy "duell anlegen" on public.duelle for insert to authenticated
  with check (spieler_a = auth.uid() and am_zug = auth.uid() and klasse_id = public.meine_klasse()
              and exists (select 1 from public.profile p where p.id = spieler_b and p.klasse_id = public.meine_klasse()));
drop policy if exists "duell spielen" on public.duelle;
create policy "duell spielen" on public.duelle for update to authenticated
  using (am_zug = auth.uid() and status = 'laeuft')   -- nur wer am Zug ist
  with check (auth.uid() in (spieler_a, spieler_b));

-- Live-Aktualisierung für Duelle
do $$ begin
  alter publication supabase_realtime add table public.duelle;
exception when duplicate_object then null; end $$;

-- ============ Erste Klasse anlegen ============
-- Der Code wird zufällig erzeugt (steht so nicht im öffentlichen Repo) und unten angezeigt.
insert into public.klassen (name, code)
select 'FIAE Berufskolleg Bocholt-West', 'FIAE-' || upper(substr(md5(random()::text), 1, 6))
where not exists (select 1 from public.klassen);
select name, code as klassencode from public.klassen;
