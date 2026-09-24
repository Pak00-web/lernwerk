-- Lernwerk Legends – keine Glanz-Karten mehr (Wunsch 24.09.: nur die Seltenheiten zählen)
-- Nach 2026-09-24-karten-feinschliff.sql im SQL Editor ausführen. Die Spalte glanz bleibt, wird aber nicht mehr gesetzt.

create or replace function public.booster_oeffnen(p_fach text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); i integer; r float; sel text; k karten; hat integer; aus jsonb := '[]'; neu_staub integer := 0; wert integer; kn spieler_konto; leg boolean := false; gl boolean; maxn integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  if p_fach not in ('wbl','its1','aew','mix') then raise exception 'Unbekannter Booster'; end if;
  perform _konto(me);
  update spieler_konto set booster = booster - 1 where user_id = me and booster >= 1 returning * into kn;
  if not found then raise exception 'Du hast keinen Booster.'; end if;
  for i in 1..5 loop
    r := random();
    sel := case when r < 0.015 then 'legendary' when r < 0.08 then 'epic' when r < 0.30 then 'rare' else 'common' end;
    if i = 5 and sel = 'common' then sel := 'rare'; end if;
    if i = 5 and not leg and kn.pity >= 14 then sel := 'legendary'; end if;
    if sel = 'legendary' then leg := true; end if;
    select * into k from karten where seltenheit = sel and (p_fach = 'mix' or fach = p_fach) order by random() limit 1;
    if not found then select * into k from karten where seltenheit = sel order by random() limit 1; end if;
    gl := false;
    maxn := case when k.seltenheit = 'legendary' then 1 else 2 end;
    select anzahl into hat from karten_sammlung where user_id = me and karte_id = k.id;
    hat := coalesce(hat, 0);
    if hat >= maxn then
      wert := case k.seltenheit when 'legendary' then 400 when 'epic' then 100 when 'rare' then 20 else 5 end;
      neu_staub := neu_staub + wert;
      if gl then update karten_sammlung set glanz = glanz + 1 where user_id = me and karte_id = k.id; end if;
      aus := aus || jsonb_build_object('id', k.id, 'neu', false, 'dublette', true, 'staub', wert, 'glanz', gl);
    else
      insert into karten_sammlung (user_id, karte_id, anzahl, glanz) values (me, k.id, 1, gl::int)
      on conflict (user_id, karte_id) do update set anzahl = karten_sammlung.anzahl + 1, glanz = karten_sammlung.glanz + gl::int;
      aus := aus || jsonb_build_object('id', k.id, 'neu', hat = 0, 'dublette', false, 'staub', 0, 'glanz', gl);
    end if;
  end loop;
  update spieler_konto set staub = staub + neu_staub, pity = case when leg then 0 else pity + 1 end where user_id = me;
  return jsonb_build_object('karten', aus, 'staub', neu_staub, 'konto', spiel_konto());
end $$;


update public.karten_sammlung set glanz = 0 where glanz > 0;
