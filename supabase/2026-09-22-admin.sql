-- Nachtrag 22.09.2026: Admin-Bereich
-- Einmal komplett im SQL Editor ausführen. Ganz unten wird das Konto "Pacho" zum Admin gemacht.

-- ============ Spalten und Einstellungen ============
alter table public.profile add column if not exists admin boolean not null default false;
alter table public.profile add column if not exists reset_ab timestamptz;       -- Einzel-Reset eines Nutzers

create table if not exists public.einstellungen (
  id        integer primary key default 1 check (id = 1),                    -- genau eine Zeile
  reset_ab  timestamptz                                                     -- Reset für alle: ältere Lernstände verwerfen
);
insert into public.einstellungen (id) values (1) on conflict (id) do nothing;
alter table public.einstellungen enable row level security;                 -- nur über Funktionen erreichbar
revoke all on public.einstellungen from anon, authenticated;

-- ============ Hilfsfunktionen ============
create or replace function public.ist_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select admin from profile where id = auth.uid()), false)
$$;

-- Für alle Besucher (auch ohne Konto): ab wann gilt ein Lernstand als zurückgesetzt?
create or replace function public.reset_zeitpunkt() returns timestamptz
language sql stable security definer set search_path = public as $$
  select greatest(
    (select reset_ab from einstellungen where id = 1),
    (select reset_ab from profile where id = auth.uid())
  )
$$;

-- ============ Admin-Funktionen (prüfen alle ist_admin) ============
create or replace function public.admin_nutzer()
returns table (id uuid, spitzname text, farbe text, admin boolean, xp integer, level integer, abzeichen integer,
               erstellt timestamptz, zuletzt timestamptz, duelle integer, gesperrt boolean)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  return query
    select p.id, p.spitzname, p.farbe, p.admin, p.xp, p.level, p.abzeichen, p.erstellt,
           greatest(l.updated_at, u.last_sign_in_at),
           (select count(*)::int from duelle d where d.spieler_a = p.id or d.spieler_b = p.id),
           coalesce(u.banned_until > now(), false)
    from profile p
    left join lernstand l on l.user_id = p.id
    left join auth.users u on u.id = p.id
    where p.klasse_id = meine_klasse()
    order by p.spitzname;
end $$;

create or replace function public.admin_klasse() returns table (name text, code text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  return query select k.name, k.code from klassen k where k.id = meine_klasse();
end $$;

create or replace function public.admin_neuer_code() returns text
language plpgsql security definer set search_path = public as $$
declare neu text := 'FIAE-' || upper(substr(md5(random()::text), 1, 6));
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  update klassen set code = neu where id = meine_klasse();
  return neu;
end $$;

-- Fortschritt aller zurücksetzen (Konten bleiben)
create or replace function public.admin_reset_alle() returns void
language plpgsql security definer set search_path = public as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  delete from duelle where klasse_id = meine_klasse();
  delete from tages_xp where user_id in (select id from profile where klasse_id = meine_klasse());
  delete from lernstand where user_id in (select id from profile where klasse_id = meine_klasse());
  update profile set xp = 0, level = 1, abzeichen = 0 where klasse_id = meine_klasse();
  update einstellungen set reset_ab = now() where id = 1;
end $$;

-- Fortschritt eines Nutzers zurücksetzen
create or replace function public.admin_reset_nutzer(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if not exists (select 1 from profile where id = p_uid and klasse_id = meine_klasse()) then raise exception 'Nutzer nicht gefunden'; end if;
  delete from duelle where spieler_a = p_uid or spieler_b = p_uid;
  delete from tages_xp where user_id = p_uid;
  delete from lernstand where user_id = p_uid;
  update profile set xp = 0, level = 1, abzeichen = 0, reset_ab = now() where id = p_uid;
end $$;

-- Nutzer entfernen (Konto samt Daten löschen). Das eigene Konto ist ausgenommen.
create or replace function public.admin_kicken(p_uid uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if p_uid = auth.uid() then raise exception 'Du kannst dich nicht selbst entfernen'; end if;
  if not exists (select 1 from profile where id = p_uid and klasse_id = meine_klasse()) then raise exception 'Nutzer nicht gefunden'; end if;
  delete from auth.users where id = p_uid;
end $$;

-- Nutzer sperren / entsperren (Konto bleibt, Anmelden geht nicht mehr)
create or replace function public.admin_sperren(p_uid uuid, p_sperren boolean) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if p_uid = auth.uid() then raise exception 'Du kannst dich nicht selbst sperren'; end if;
  if not exists (select 1 from profile where id = p_uid and klasse_id = meine_klasse()) then raise exception 'Nutzer nicht gefunden'; end if;
  update auth.users set banned_until = case when p_sperren then 'infinity'::timestamptz else null end where id = p_uid;
  if p_sperren then delete from auth.sessions where user_id = p_uid; end if;
end $$;

-- Neues Passwort setzen (für "Passwort vergessen")
create or replace function public.admin_passwort(p_uid uuid, p_passwort text) returns void
language plpgsql security definer set search_path = public, auth, extensions as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if length(p_passwort) < 8 then raise exception 'Passwort zu kurz'; end if;
  if not exists (select 1 from profile where id = p_uid and klasse_id = meine_klasse()) then raise exception 'Nutzer nicht gefunden'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_passwort, extensions.gen_salt('bf')), updated_at = now() where id = p_uid;
end $$;

-- Admin-Recht vergeben / entziehen
create or replace function public.admin_rolle(p_uid uuid, p_admin boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not ist_admin() then raise exception 'Keine Admin-Rechte'; end if;
  if p_uid = auth.uid() and not p_admin then raise exception 'Du kannst dir die Admin-Rechte nicht selbst nehmen'; end if;
  update profile set admin = p_admin where id = p_uid and klasse_id = meine_klasse();
end $$;

-- ============ Rechte ============
revoke execute on function public.ist_admin(), public.admin_nutzer(), public.admin_klasse(), public.admin_neuer_code(), public.admin_reset_alle(),
  public.admin_reset_nutzer(uuid), public.admin_kicken(uuid), public.admin_sperren(uuid, boolean), public.admin_passwort(uuid, text), public.admin_rolle(uuid, boolean) from public, anon;
grant execute on function public.ist_admin(), public.admin_nutzer(), public.admin_klasse(), public.admin_neuer_code(), public.admin_reset_alle(),
  public.admin_reset_nutzer(uuid), public.admin_kicken(uuid), public.admin_sperren(uuid, boolean), public.admin_passwort(uuid, text), public.admin_rolle(uuid, boolean) to authenticated;
grant execute on function public.reset_zeitpunkt() to anon, authenticated;

-- ============ Dich zum Admin machen ============
update public.profile set admin = true where lower(spitzname) = lower('Pacho');
select spitzname, admin from public.profile where admin;
