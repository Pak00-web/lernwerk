-- Nachtrag 22.09.2026: Rangliste für Quiz-Duelle.
-- Liefert je Spieler der eigenen Klasse nur Summen (Siege, Niederlagen, Unentschieden) – einzelne Duelle bleiben privat.
create or replace function public.duell_rangliste()
returns table (id uuid, spitzname text, farbe text, siege integer, niederlagen integer, remis integer, gespielt integer, punkte integer)
language sql stable security definer set search_path = public as $$
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
$$;
revoke execute on function public.duell_rangliste() from public, anon;
grant execute on function public.duell_rangliste() to authenticated;
select 'Duell-Rangliste angelegt' as ergebnis;
