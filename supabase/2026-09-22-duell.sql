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
select 'Duell-Regeln aktualisiert' as ergebnis;
