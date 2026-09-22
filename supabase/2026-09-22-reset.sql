-- Nachtrag 22.09.2026: Duelle darf nur ändern, wer am Zug ist.
drop policy if exists "duell spielen" on public.duelle;
create policy "duell spielen" on public.duelle for update to authenticated
  using (am_zug = auth.uid() and status = 'laeuft')
  with check (auth.uid() in (spieler_a, spieler_b));

drop policy if exists "duell anlegen" on public.duelle;
create policy "duell anlegen" on public.duelle for insert to authenticated
  with check (spieler_a = auth.uid() and am_zug = auth.uid() and klasse_id = public.meine_klasse()
              and exists (select 1 from public.profile p where p.id = spieler_b and p.klasse_id = public.meine_klasse()));

-- Alte Test-Duelle ohne Zugregel aufräumen
delete from public.duelle where status = 'laeuft' and am_zug is null;

-- ============ Reset nach der Testphase (22.09.2026) ============
-- Konten bleiben erhalten, nur Fortschritt, XP und Duelle werden gelöscht.
delete from public.duelle;
delete from public.tages_xp;
delete from public.lernstand;
update public.profile set xp = 0, level = 1, abzeichen = 0;

select (select count(*) from public.profile) as konten_behalten,
       (select count(*) from public.lernstand) as lernstaende,
       (select count(*) from public.duelle) as duelle;
