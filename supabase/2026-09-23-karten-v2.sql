-- Lernwerk Legends – Karten-Kampf neu (Nachtrag 23.09.2026, nach 2026-09-22-games.sql und 2026-09-23-ki.sql ausführen)
-- Runeterra/Hearthstone-artig: Monster, Zauber, Fallen; 4 Plätze je Seite; Fokus wächst bis 8.
-- Wissen = Vorteil: richtige Zugfrage → +1 Fokus, +1 Karte, „Erleuchtet“-Effekte; 3 richtige in Folge → Aufstieg; Legendäre nur nach richtiger Antwort.
-- ACHTUNG: ersetzt den alten Katalog. Sammlungen, Decks und laufende Kämpfe werden zurückgesetzt, jeder bekommt ein Starter-Deck + 3 Booster.

-- ============ Tabellen ============
alter table public.karten add column if not exists typ        text not null default 'monster';
alter table public.karten add column if not exists schluessel text[] not null default '{}';
alter table public.karten add column if not exists effekt     jsonb not null default '[]';   -- beim Ausspielen
alter table public.karten add column if not exists erleuchtet jsonb not null default '[]';   -- nach richtiger Zugfrage
alter table public.karten add column if not exists ausloeser  text;                          -- Fallen: angriff | beschwoerung
alter table public.karten add column if not exists text       text not null default '';
alter table public.karten add column if not exists flavor     text not null default '';
alter table public.karten add column if not exists art        text not null default 'bestie'; -- Kreaturtyp (Platzhalter-Silhouette)
alter table public.karten drop constraint if exists karten_seltenheit_check;
alter table public.karten add constraint karten_seltenheit_check check (seltenheit in ('common','rare','epic','legendary','token'));
alter table public.karten_sammlung add column if not exists glanz integer not null default 0;
alter table public.spieler_konto add column if not exists staub integer not null default 0;
alter table public.spieler_konto add column if not exists pity  integer not null default 0;
alter table public.kaempfe add column if not exists frei text;   -- Freies Spiel gegen die KI: leicht | mittel | schwer

-- Log für Animationen: längere Züge des Computers brauchen mehr Einträge
create or replace function public._k_log(st jsonb, ev jsonb) returns jsonb language plpgsql immutable as $$
declare n integer := coalesce((st->>'logn')::int, 0) + 1; l jsonb := coalesce(st->'log', '[]') || jsonb_build_array(ev || jsonb_build_object('n', n));
begin
  while jsonb_array_length(l) > 150 loop l := l - 0; end loop;
  return st || jsonb_build_object('log', l, 'logn', n);
end $$;

-- ============ Katalog ============
delete from public.kampf_zustand; delete from public.kaempfe; delete from public.karten_sammlung; delete from public.decks; delete from public.karten;

insert into public.karten (id, nr, name, fach, seltenheit, typ, kosten, angriff, verteidigung, schluessel, effekt, erleuchtet, ausloeser, text, flavor, art, bild) values
-- ---------- WBL: Recht & Arbeitswelt – Wächter, Heilung, Team ----------
('wbl-wichtel',   1, 'Azubi-Wichtel',            'wbl','common',   'monster',1,1,2,'{}','[]','[{"art":"staerken","a":1,"v":1,"ziel":"selbst"}]',null,'Erleuchtet: +1/+1.','Lernt schnell – wenn man ihm Fragen stellt.','humanoid','wbl-wichtel'),
('wbl-stechuhr',  2, 'Stechuhr-Golem',           'wbl','common',   'monster',1,0,3,'{waechter}','[]','[]',null,'','Pünktlich um 7:00 steht er da. Immer.','golem','wbl-stechuhr'),
('wbl-phantom',   3, 'Probezeit-Phantom',        'wbl','common',   'monster',2,3,1,'{tarnung}','[]','[]',null,'','In der Probezeit kann es jederzeit verschwinden.','geist','wbl-phantom'),
('wbl-salamander',4, 'Arbeitsschutz-Salamander', 'wbl','common',   'monster',2,2,3,'{}','[]','[{"art":"heilen","wert":2}]',null,'Erleuchtet: Heile deinen Helden um 2.','Trägt Helm, Handschuhe und Sicherheitsschuhe.','schlange','wbl-salamander'),
('wbl-golem',     5, 'Paragrafen-Golem',         'wbl','common',   'monster',3,2,4,'{waechter}','[]','[]',null,'','§ 1: Hier kommt keiner durch.','golem','wbl-golem'),
('wbl-unterweisung',6,'Unterweisung',            'wbl','common',   'zauber', 1,0,0,'{}','[{"art":"staerken","a":1,"v":2,"ziel":"eigen"}]','[]',null,'Ein eigenes Monster erhält +1/+2.','Einmal im Jahr, schriftlich bestätigt.','zauber','wbl-unterweisung'),
('wbl-abmahnung', 7, 'Abmahnung',                'wbl','common',   'falle',  2,0,0,'{}','[{"art":"abbrechen"},{"art":"schaden","wert":2,"ziel":"ausloeser"}]','[]','angriff','Falle – wenn ein Gegner angreift: Der Angriff wird abgebrochen, der Angreifer erleidet 2 Schaden.','Beim nächsten Mal wird es ernst.','falle','wbl-abmahnung'),
('wbl-greif',     8, 'Tarif-Greif',              'wbl','rare',     'monster',4,4,4,'{ansturm}','[]','[]',null,'','Verhandelt hart und schlägt sofort zu.','vogel','wbl-greif'),
('wbl-einhorn',   9, 'Jugendschutz-Einhorn',     'wbl','rare',     'monster',3,2,3,'{waechter,schild}','[]','[]',null,'','Unter 18? Dann nicht nach 20 Uhr.','bestie','wbl-einhorn'),
('wbl-vereinbarung',10,'Betriebsvereinbarung',   'wbl','rare',     'zauber', 3,0,0,'{}','[{"art":"staerken","a":1,"v":1,"ziel":"alle"},{"art":"heilen","wert":2}]','[]',null,'Alle eigenen Monster erhalten +1/+1. Heile deinen Helden um 2.','Gilt für alle – schwarz auf weiß.','zauber','wbl-vereinbarung'),
('wbl-kuendigungsschutz',11,'Kündigungsschutz',  'wbl','rare',     'falle',  3,0,0,'{}','[{"art":"abbrechen"},{"art":"schaden","wert":3,"ziel":"ausloeser"}]','[]','angriff','Falle – wenn ein Gegner angreift: Der Angriff wird abgebrochen, der Angreifer erleidet 3 Schaden.','So schnell wird hier niemand vor die Tür gesetzt.','falle','wbl-kuendigungsschutz'),
('wbl-mammut',   12, 'Mindestlohn-Mammut',       'wbl','epic',     'monster',4,3,4,'{waechter}','[{"art":"heilen","wert":4}]','[]',null,'Beim Ausspielen: Heile deinen Helden um 4.','Unter diese Grenze geht nichts.','bestie','wbl-mammut'),
('wbl-koloss',   13, 'IHK-Kammer-Koloss',        'wbl','epic',     'monster',5,4,6,'{}','[]','[{"art":"staerken","a":1,"v":1,"ziel":"alle"}]',null,'Erleuchtet: Alle eigenen Monster erhalten +1/+1.','Prüft, bestätigt und stempelt.','golem','wbl-koloss'),
('wbl-titan',    14, 'Betriebsrats-Titan',       'wbl','epic',     'monster',6,5,7,'{waechter}','[{"art":"schild","ziel":"alle"}]','[]',null,'Beim Ausspielen: Alle eigenen Monster erhalten Schild.','Mitbestimmung in Titanengröße.','golem','wbl-titan'),
('wbl-hydra',    15, 'Prüfungsausschuss-Hydra',  'wbl','legendary','monster',8,7,9,'{waechter}','[{"art":"betaeuben","ziel":"alle"}]','[{"art":"staerken","a":2,"v":2,"ziel":"selbst"}]',null,'Beim Ausspielen: Betäube alle gegnerischen Monster. Erleuchtet: +2/+2.','Drei Köpfe, drei Fragen, keine Gnade.','drache','wbl-hydra'),
-- ---------- ITS: IT-Sicherheit – Schaden, Gift, Tarnung ----------
('its-aal',      16, 'Phishing-Aal',             'its1','common',  'monster',1,2,1,'{}','[{"art":"schaden","wert":1,"ziel":"gegner"}]','[]',null,'Beim Ausspielen: 1 Schaden am gegnerischen Helden.','„Ihr Konto wurde gesperrt – klicken Sie hier.“','schlange','its-aal'),
('its-passwort', 17, 'Passwort-Golem',           'its1','common',  'monster',2,1,3,'{schild}','[]','[]',null,'','12 Zeichen, Sonderzeichen, kein Geburtstag.','golem','its-passwort'),
('its-spam',     18, 'Spam-Schwarm',             'its1','common',  'monster',2,2,2,'{}','[{"art":"beschwoeren","karte":"tok-spam","anzahl":1}]','[]',null,'Beim Ausspielen: Beschwöre eine 1/1-Spam-Mail.','Wo eine ist, sind hundert.','kaefer','its-spam'),
('its-trojaner', 19, 'Trojaner-Ross',            'its1','common',  'monster',3,3,3,'{tarnung}','[]','[]',null,'','Sieht aus wie ein Geschenk. Ist es nicht.','bestie','its-trojaner'),
('its-baer',     20, 'Backup-Bär',               'its1','common',  'monster',3,2,4,'{waechter}','[]','[{"art":"heilen","wert":2}]',null,'Erleuchtet: Heile deinen Helden um 2.','Täglich, wöchentlich, 3-2-1.','bestie','its-baer'),
('its-patchday', 21, 'Patch-Day',                'its1','common',  'zauber', 2,0,0,'{}','[{"art":"schaden","wert":3,"ziel":"monster"}]','[]',null,'3 Schaden an einem gegnerischen Monster.','Zweiter Dienstag im Monat.','zauber','its-patchday'),
('its-honeypot', 22, 'Honeypot',                 'its1','common',  'falle',  2,0,0,'{}','[{"art":"schaden","wert":3,"ziel":"ausloeser"}]','[]','beschwoerung','Falle – wenn der Gegner ein Monster ausspielt: Es erleidet 3 Schaden.','Süß, verlockend – und überwacht.','falle','its-honeypot'),
('its-rabe',     23, 'Ransomware-Rabe',          'its1','rare',    'monster',3,2,2,'{gift,tarnung}','[]','[]',null,'','Deine Daten gegen meine Bitcoins.','vogel','its-rabe'),
('its-hexe',     24, 'Hash-Hexe',                'its1','rare',    'monster',4,3,4,'{}','[]','[{"art":"schaden","wert":2,"ziel":"zufall"}]',null,'Erleuchtet: 2 Schaden an einem zufälligen Gegner.','Aus jedem Text wird ein Fingerabdruck.','humanoid','its-hexe'),
('its-barbar',   25, 'Brute-Force-Barbar',       'its1','rare',    'monster',5,6,4,'{ansturm}','[]','[]',null,'','aaaa, aaab, aaac, …','humanoid','its-barbar'),
('its-verschluesselung',26,'Verschlüsselung',    'its1','rare',    'zauber', 2,0,0,'{}','[{"art":"schild","ziel":"alle"},{"art":"ziehen","wert":1}]','[]',null,'Alle eigenen Monster erhalten Schild. Ziehe 1 Karte.','AES-256 – viel Spaß beim Raten.','zauber','its-verschluesselung'),
('its-zombie',   27, 'Zero-Day-Zombie',          'its1','epic',    'monster',4,4,3,'{tarnung,gift}','[]','[]',null,'','Niemand kennt die Lücke. Noch nicht.','geist','its-zombie'),
('its-sphinx',   28, 'DSGVO-Sphinx',             'its1','epic',    'monster',5,4,6,'{waechter}','[{"art":"betaeuben","ziel":"zufall"}]','[{"art":"ziehen","wert":1}]',null,'Beim Ausspielen: Betäube ein zufälliges gegnerisches Monster. Erleuchtet: Ziehe 1 Karte.','Stellt Fragen zu Zweck, Rechtsgrundlage und Löschfrist.','bestie','its-sphinx'),
('its-botnetz',  29, 'Botnetz-Königin',          'its1','epic',    'monster',6,4,5,'{}','[{"art":"beschwoeren","karte":"tok-spam","anzahl":2}]','[]',null,'Beim Ausspielen: Beschwöre zwei 1/1-Spam-Mails.','Zehntausend Rechner hören auf ihr Kommando.','kaefer','its-botnetz'),
('its-drache',   30, 'Firewall-Drache',          'its1','legendary','monster',8,7,8,'{schild}','[{"art":"schaden","wert":3,"ziel":"alle"}]','[]',null,'Beim Ausspielen: 3 Schaden an allen gegnerischen Monstern.','Deny all. Allow nothing.','drache','its-drache'),
-- ---------- AEW: Anwendungsentwicklung – Karten ziehen, Betäuben, Spielmarken ----------
('aew-kaefer',   31, 'Bug-Käfer',                'aew','common',   'monster',1,1,1,'{}','[{"art":"beschwoeren","karte":"tok-bug","anzahl":1}]','[]',null,'Beim Ausspielen: Beschwöre einen 1/1-Bug.','Kein Bug kommt allein.','kaefer','aew-kaefer'),
('aew-schleim',  32, 'Syntax-Schleim',           'aew','common',   'monster',1,1,3,'{waechter}','[]','[]',null,'','Fehlt da ein Semikolon?','schleim','aew-schleim'),
('aew-eule',     33, 'Debug-Eule',               'aew','common',   'monster',2,1,3,'{}','[{"art":"ziehen","wert":1}]','[]',null,'Beim Ausspielen: Ziehe 1 Karte.','Sieht jeden Fehler – auch nachts.','vogel','aew-eule'),
('aew-phantom',  34, 'Null-Pointer-Phantom',     'aew','common',   'monster',2,2,2,'{tarnung}','[]','[]',null,'','Zeigt ins Nichts – und trifft trotzdem.','geist','aew-phantom'),
('aew-wurm',     35, 'Endlosschleifen-Wurm',     'aew','common',   'monster',3,2,4,'{}','[]','[{"art":"staerken","a":1,"v":1,"ziel":"selbst"}]',null,'Erleuchtet: +1/+1.','while (true) { wachsen(); }','schlange','aew-wurm'),
('aew-refactoring',36,'Refactoring',             'aew','common',   'zauber', 2,0,0,'{}','[{"art":"staerken","a":2,"v":2,"ziel":"eigen"}]','[]',null,'Ein eigenes Monster erhält +2/+2.','Gleiches Verhalten, schönerer Code.','zauber','aew-refactoring'),
('aew-breakpoint',37,'Breakpoint',               'aew','common',   'falle',  2,0,0,'{}','[{"art":"abbrechen"},{"art":"betaeuben","ziel":"ausloeser"}]','[]','angriff','Falle – wenn ein Gegner angreift: Der Angriff wird abgebrochen, der Angreifer ist betäubt.','Hier hält das Programm an.','falle','aew-breakpoint'),
('aew-luchs',    38, 'Lambda-Luchs',             'aew','rare',     'monster',2,3,2,'{ansturm}','[]','[]',null,'','x -> schnell(x)','bestie','aew-luchs'),
('aew-basilisk', 39, 'Binär-Basilisk',           'aew','rare',     'monster',3,3,3,'{}','[{"art":"betaeuben","ziel":"zufall"}]','[]',null,'Beim Ausspielen: Betäube ein zufälliges gegnerisches Monster.','Ein Blick in 0 und 1 – und du erstarrst.','schlange','aew-basilisk'),
('aew-stapel',   40, 'Stapel-Golem',             'aew','rare',     'monster',4,3,5,'{waechter}','[]','[{"art":"staerken","a":0,"v":2,"ziel":"selbst"}]',null,'Erleuchtet: +0/+2.','Last in, first out.','golem','aew-stapel'),
('aew-review',   41, 'Code-Review',              'aew','rare',     'zauber', 3,0,0,'{}','[{"art":"ziehen","wert":2}]','[]',null,'Ziehe 2 Karten.','Vier Augen sehen mehr als zwei.','zauber','aew-review'),
('aew-schlange', 42, 'Rekursions-Schlange',      'aew','epic',     'monster',4,3,4,'{}','[]','[{"art":"beschwoeren","karte":"tok-rekursion","anzahl":1}]',null,'Erleuchtet: Beschwöre eine 1/1-Rekursion.','Um Rekursion zu verstehen, muss man Rekursion verstehen.','schlange','aew-schlange'),
('aew-kraken',   43, 'Compiler-Kraken',          'aew','epic',     'monster',6,5,6,'{}','[{"art":"betaeuben","ziel":"alle"}]','[]',null,'Beim Ausspielen: Betäube alle gegnerischen Monster.','Übersetzt alles – auch deine Fehler.','krake','aew-kraken'),
('aew-titan',    44, 'Stack-Overflow-Titan',     'aew','epic',     'monster',7,7,7,'{}','[{"art":"schaden","wert":2,"ziel":"alle"}]','[]',null,'Beim Ausspielen: 2 Schaden an allen gegnerischen Monstern.','Zu tief verschachtelt, zu groß für den Speicher.','golem','aew-titan'),
('aew-drache',   45, 'Algorithmus-Kristalldrache','aew','legendary','monster',8,6,8,'{schild}','[{"art":"ziehen","wert":2}]','[{"art":"staerken","a":1,"v":1,"ziel":"alle"},{"art":"schaden","wert":2,"ziel":"gegner"}]',null,'Beim Ausspielen: Ziehe 2 Karten. Erleuchtet: Alle eigenen Monster +1/+1, 2 Schaden am gegnerischen Helden.','Eingabe, Verarbeitung, Ausgabe – in Perfektion.','drache','aew-drache'),
-- ---------- Spielmarken (nicht sammelbar) ----------
('tok-bug',      91, 'Bug',                      'aew','token',    'monster',0,1,1,'{}','[]','[]',null,'','Works on my machine.','kaefer','tok-bug'),
('tok-spam',     92, 'Spam-Mail',                'its1','token',   'monster',0,1,1,'{}','[]','[]',null,'','Sie haben gewonnen!!!','kaefer','tok-spam'),
('tok-rekursion',93, 'Rekursion',                'aew','token',    'monster',0,1,1,'{}','[]','[]',null,'','f(n) = f(n-1) + …','schlange','tok-rekursion');

-- Starter: alle gewöhnlichen Karten außer der teuersten Falle → 20 Karten
create or replace function public._k2_starter() returns text[] language sql stable set search_path = public as $$
  select array(select id from karten where seltenheit = 'common' and id <> 'wbl-abmahnung' order by nr)
$$;

create or replace function public._konto(p_uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare n integer; starter text[] := _k2_starter();
begin
  insert into spieler_konto (user_id, booster) values (p_uid, 3) on conflict (user_id) do nothing;
  get diagnostics n = row_count;
  if n > 0 then
    insert into karten_sammlung (user_id, karte_id) select p_uid, unnest(starter) on conflict do nothing;
    insert into decks (user_id, karten) values (p_uid, starter) on conflict (user_id) do nothing;
  end if;
end $$;

-- Bestehende Konten: Starter-Sammlung, Starter-Deck, 3 Booster als Ausgleich; Karten-Fortschritt zurück auf 0
insert into public.karten_sammlung (user_id, karte_id) select k.user_id, s from public.spieler_konto k, unnest(public._k2_starter()) s on conflict do nothing;
insert into public.decks (user_id, karten) select user_id, public._k2_starter() from public.spieler_konto on conflict (user_id) do update set karten = excluded.karten, geaendert = now();
update public.spieler_konto set booster = booster + 3, statistik = statistik - 'karten';

-- ============ Sammlung, Deck, Booster ============
create or replace function public.spiel_konto() returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  return (select to_jsonb(k) - 'user_id' from spieler_konto k where k.user_id = me) || jsonb_build_object(
    'sammlung', (select coalesce(jsonb_object_agg(karte_id, anzahl), '{}') from karten_sammlung where user_id = me),
    'glanz', (select coalesce(jsonb_object_agg(karte_id, glanz), '{}') from karten_sammlung where user_id = me and glanz > 0),
    'deck', (select to_jsonb(karten) from decks where user_id = me),
    'letzte', (select coalesce(jsonb_agg(x order by x.erstellt desc), '[]') from (select spiel, ergebnis, xp, coins, details, erstellt from spiel_ergebnisse where user_id = me order by erstellt desc limit 10) x),
    'kampf_offen', (select count(*) from kaempfe where status = 'laeuft' and spieler_b is not null and am_zug = me),
    'arena_anfragen', (select count(*) from arena_matches where status = 'angefragt' and spieler_b = me and erstellt > now() - interval '15 minutes'));
end $$;

create or replace function public.deck_speichern(p_karten text[]) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  if coalesce(array_length(p_karten, 1), 0) <> 20 then raise exception 'Ein Deck hat genau 20 Karten.'; end if;
  if exists (select 1 from unnest(p_karten) x left join karten k on k.id = x where k.id is null or k.seltenheit = 'token') then raise exception 'Unbekannte Karte im Deck.'; end if;
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

-- Booster: 5 Karten, Quoten 70/22/6,5/1,5 %, Karte 5 mindestens selten. Pity: spätestens im 15. Booster ohne Legendäre eine garantiert.
-- 5 % Glanz-Karten. Mehr Exemplare als erlaubt (2, legendär 1) werden zu Wissensstaub.
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
    gl := random() < 0.05;
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

-- Herstellen aus Wissensstaub
create or replace function public.karte_herstellen(p_karte text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); k karten; preis integer; hat integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  select * into k from karten where id = p_karte and seltenheit <> 'token';
  if not found then raise exception 'Unbekannte Karte'; end if;
  preis := case k.seltenheit when 'legendary' then 1600 when 'epic' then 400 when 'rare' then 100 else 40 end;
  select coalesce((select anzahl from karten_sammlung where user_id = me and karte_id = k.id), 0) into hat;
  if hat >= (case when k.seltenheit = 'legendary' then 1 else 2 end) then raise exception 'Davon hast du schon genug.'; end if;
  update spieler_konto set staub = staub - preis where user_id = me and staub >= preis;
  if not found then raise exception 'Dafür brauchst du % Wissensstaub.', preis; end if;
  insert into karten_sammlung (user_id, karte_id, anzahl) values (me, k.id, 1)
  on conflict (user_id, karte_id) do update set anzahl = karten_sammlung.anzahl + 1;
  return spiel_konto();
end $$;

-- ============ Engine ============
-- Zustand st: s[0], s[1] = Spieler {id, hp, maxhp, fokus, maxfokus, deck, hand, feld[4], fallen[2], zug, richtig, serie, bonus, aufstieg, muede};
-- Monster auf dem Feld: {k, a, v, max, sch[], schild, tarn, bereit, bet, auf, n (laufende Nummer)}; am, phase (frage|spielen|ende), runde, log, logn.
create or replace function public._k2_leer4() returns jsonb language sql immutable as $$ select '[null,null,null,null]'::jsonb $$;

create or replace function public._k2_spieler(p_id uuid, p_deck text[], p_hp integer) returns jsonb language sql volatile as $$
  select jsonb_build_object('id', p_id, 'hp', p_hp, 'maxhp', p_hp, 'fokus', 0, 'maxfokus', 0,
    'deck', (select coalesce(jsonb_agg(x order by random()), '[]') from unnest(p_deck) x),
    'hand', '[]'::jsonb, 'feld', _k2_leer4(), 'fallen', '[null,null]'::jsonb, 'zug', 0, 'richtig', 0, 'serie', 0,
    'bonus', false, 'aufstieg', false, 'muede', 0)
$$;

create or replace function public._k2_ziehen(st jsonb, p integer, n integer) returns jsonb language plpgsql as $$
declare pl jsonb; i integer; m integer;
begin
  for i in 1..n loop
    pl := st->'s'->p;
    if jsonb_array_length(pl->'deck') = 0 then
      m := coalesce((pl->>'muede')::int, 0) + 1;
      st := _k_log(_k_setze(st, p, pl || jsonb_build_object('muede', m, 'hp', (pl->>'hp')::int - m)), jsonb_build_object('art','muede','p',p,'schaden',m));
    elsif jsonb_array_length(pl->'hand') >= 8 then
      st := _k_log(_k_setze(st, p, jsonb_set(pl, '{deck}', (pl->'deck') - 0)), jsonb_build_object('art','verbrannt','p',p,'k',pl->'deck'->0));
    else
      st := _k_log(_k_setze(st, p, jsonb_set(jsonb_set(pl, '{hand}', (pl->'hand') || jsonb_build_array(pl->'deck'->0)), '{deck}', (pl->'deck') - 0)),
                   jsonb_build_object('art','zieht','p',p));
    end if;
  end loop;
  return st;
end $$;

create or replace function public._k2_neu_monster(st jsonb, kid text) returns jsonb language plpgsql stable set search_path = public as $$
declare k karten; n integer := coalesce((st->>'mn')::int, 0) + 1;
begin
  select * into k from karten where id = kid;
  return jsonb_build_object('k', kid, 'a', k.angriff, 'v', k.verteidigung, 'max', k.verteidigung, 'sch', to_jsonb(k.schluessel),
    'schild', 'schild' = any(k.schluessel), 'tarn', 'tarnung' = any(k.schluessel), 'bereit', 'ansturm' = any(k.schluessel), 'bet', false, 'auf', false, 'n', n);
end $$;

-- Monster auf einen Platz setzen (erster freier, wenn keiner angegeben); gibt st zurück, Platz in st.letzter_platz
create or replace function public._k2_setzen(st jsonb, p integer, kid text, platz integer default null) returns jsonb language plpgsql stable set search_path = public as $$
declare f jsonb := st->'s'->p->'feld'; i integer; m jsonb;
begin
  if platz is null then
    for i in 0..3 loop if jsonb_typeof(f->i) <> 'object' then platz := i; exit; end if; end loop;
  end if;
  if platz is null or jsonb_typeof(f->platz) = 'object' then return st || jsonb_build_object('letzter_platz', null); end if;
  m := _k2_neu_monster(st, kid);
  st := jsonb_set(st, array['s', p::text, 'feld', platz::text], m) || jsonb_build_object('mn', (m->>'n')::int, 'letzter_platz', platz);
  return st;
end $$;

create or replace function public._k2_hat(m jsonb, kw text) returns boolean language sql immutable as $$ select coalesce((m->'sch') ? kw, false) $$;

-- Schaden an einem Monster (Schild fängt den ersten Treffer ab, Gift vernichtet). Gibt st zurück, st.tatsaechlich = verursachter Schaden
create or replace function public._k2_treffen(st jsonb, p integer, platz integer, n integer, gift boolean default false) returns jsonb language plpgsql as $$
declare m jsonb := st->'s'->p->'feld'->platz; echt integer := n;
begin
  if jsonb_typeof(m) <> 'object' or n <= 0 then return st || jsonb_build_object('tatsaechlich', 0); end if;
  if (m->>'schild')::boolean then
    m := m || jsonb_build_object('schild', false); echt := 0;
    st := _k_log(st, jsonb_build_object('art','schild','p',p,'platz',platz));
  else
    m := m || jsonb_build_object('v', (m->>'v')::int - n);
    if gift then m := m || jsonb_build_object('v', 0); end if;
  end if;
  if (m->>'v')::int <= 0 then
    st := jsonb_set(st, array['s', p::text, 'feld', platz::text], 'null'::jsonb);
    st := _k_log(st, jsonb_build_object('art','tod','p',p,'platz',platz,'k',m->'k'));
  else
    st := jsonb_set(st, array['s', p::text, 'feld', platz::text], m);
  end if;
  return st || jsonb_build_object('tatsaechlich', echt);
end $$;

create or replace function public._k2_held(st jsonb, p integer, n integer) returns jsonb language plpgsql as $$
declare pl jsonb := st->'s'->p;
begin
  return _k_setze(st, p, pl || jsonb_build_object('hp', least((pl->>'maxhp')::int, (pl->>'hp')::int - n)));
end $$;

-- zufälliger belegter Platz (ohne Tarnung, wenn möglich)
create or replace function public._k2_zufall(st jsonb, p integer, auch_tarn boolean default true) returns integer language sql volatile as $$
  select i from generate_series(0, 3) i where jsonb_typeof(st->'s'->p->'feld'->i) = 'object' and (auch_tarn or not (st->'s'->p->'feld'->i->>'tarn')::boolean) order by random() limit 1
$$;

-- Ziel-Text: 'g0'..'g3' gegnerisches Monster, 'e0'..'e3' eigenes Monster, 'held' gegnerischer Held
create or replace function public._k2_ziel_platz(ziel text, pref text) returns integer language sql immutable as $$
  select case when ziel ~ ('^' || pref || '[0-3]$') then substr(ziel, 2, 1)::int end
$$;

-- Einen Effekt anwenden. sp = eigener Platz (für "selbst"), au = Auslöser {p, platz} bei Fallen
create or replace function public._k2_effekt(st jsonb, p integer, e jsonb, ziel text, sp integer, au jsonb) returns jsonb language plpgsql set search_path = public as $$
declare o integer := 1 - p; art text := e->>'art'; w integer := coalesce((e->>'wert')::int, 0); z text := coalesce(e->>'ziel', ''); i integer; t integer; m jsonb; ap integer; apl integer;
begin
  ap := (au->>'p')::int; apl := (au->>'platz')::int;
  if art = 'schaden' then
    if z = 'gegner' or (z = 'wahl' and ziel = 'held') then
      st := _k_log(_k2_held(st, o, w), jsonb_build_object('art','effekt','p',p,'e','schaden','ziel','held','zs',o,'wert',w));
    elsif z = 'alle' then
      for i in 0..3 loop if jsonb_typeof(st->'s'->o->'feld'->i) = 'object' then
        st := _k_log(st, jsonb_build_object('art','effekt','p',p,'e','schaden','zs',o,'platz',i,'wert',w)); st := _k2_treffen(st, o, i, w); end if; end loop;
    elsif z = 'zufall' then
      t := _k2_zufall(st, o);
      if t is null then st := _k_log(_k2_held(st, o, w), jsonb_build_object('art','effekt','p',p,'e','schaden','ziel','held','zs',o,'wert',w));
      else st := _k_log(st, jsonb_build_object('art','effekt','p',p,'e','schaden','zs',o,'platz',t,'wert',w)); st := _k2_treffen(st, o, t, w); end if;
    elsif z = 'ausloeser' then
      if ap is not null then st := _k_log(st, jsonb_build_object('art','effekt','p',p,'e','schaden','zs',ap,'platz',apl,'wert',w)); st := _k2_treffen(st, ap, apl, w); end if;
    else   -- monster / wahl mit Monster-Ziel
      t := _k2_ziel_platz(ziel, 'g');
      if t is null or jsonb_typeof(st->'s'->o->'feld'->t) <> 'object' then raise exception 'Wähle ein gegnerisches Monster als Ziel.'; end if;
      st := _k_log(st, jsonb_build_object('art','effekt','p',p,'e','schaden','zs',o,'platz',t,'wert',w)); st := _k2_treffen(st, o, t, w);
    end if;
  elsif art = 'heilen' then
    st := _k_log(_k2_held(st, p, -w), jsonb_build_object('art','effekt','p',p,'e','heilen','ziel','held','zs',p,'wert',w));
  elsif art = 'ziehen' then
    st := _k2_ziehen(st, p, w);
  elsif art = 'fokus' then
    st := _k_setze(st, p, (st->'s'->p) || jsonb_build_object('fokus', (st->'s'->p->>'fokus')::int + w));
  elsif art in ('staerken', 'schild') then
    for i in 0..3 loop
      continue when jsonb_typeof(st->'s'->p->'feld'->i) <> 'object';
      continue when not (z = 'alle' or (z = 'selbst' and i = sp) or (z = 'eigen' and i = _k2_ziel_platz(ziel, 'e')));
      m := st->'s'->p->'feld'->i;
      if art = 'staerken' then m := m || jsonb_build_object('a', (m->>'a')::int + coalesce((e->>'a')::int, 0), 'v', (m->>'v')::int + coalesce((e->>'v')::int, 0), 'max', (m->>'max')::int + coalesce((e->>'v')::int, 0));
      else m := m || jsonb_build_object('schild', true); end if;
      st := _k_log(jsonb_set(st, array['s', p::text, 'feld', i::text], m), jsonb_build_object('art','effekt','p',p,'e',art,'zs',p,'platz',i,'a',e->'a','v',e->'v'));
    end loop;
    if z = 'eigen' and (_k2_ziel_platz(ziel, 'e') is null or jsonb_typeof(st->'s'->p->'feld'->_k2_ziel_platz(ziel, 'e')) <> 'object') then raise exception 'Wähle ein eigenes Monster als Ziel.'; end if;
  elsif art = 'betaeuben' then
    for i in 0..3 loop
      continue when jsonb_typeof(st->'s'->o->'feld'->i) <> 'object';
      continue when not (z = 'alle' or (z = 'ausloeser' and ap = o and i = apl) or (z = 'monster' and i = _k2_ziel_platz(ziel, 'g')));
      st := _k_log(jsonb_set(st, array['s', o::text, 'feld', i::text, 'bet'], 'true'), jsonb_build_object('art','effekt','p',p,'e','betaeuben','zs',o,'platz',i));
    end loop;
    if z = 'zufall' then
      t := _k2_zufall(st, o);
      if t is not null then st := _k_log(jsonb_set(st, array['s', o::text, 'feld', t::text, 'bet'], 'true'), jsonb_build_object('art','effekt','p',p,'e','betaeuben','zs',o,'platz',t)); end if;
    end if;
  elsif art = 'vernichten' then
    t := case when z = 'ausloeser' then apl else _k2_ziel_platz(ziel, 'g') end;
    if t is not null then st := _k2_treffen(st, case when z = 'ausloeser' then ap else o end, t, 999); end if;
  elsif art = 'beschwoeren' then
    for i in 1..coalesce((e->>'anzahl')::int, 1) loop
      st := _k2_setzen(st, p, e->>'karte');
      if st->>'letzter_platz' is not null then st := _k_log(st, jsonb_build_object('art','beschwoert','p',p,'k',e->>'karte','platz',(st->>'letzter_platz')::int)); end if;
    end loop;
  elsif art = 'abbrechen' then
    st := st || jsonb_build_object('abbruch', true);
  end if;
  return st;
end $$;

create or replace function public._k2_effekte(st jsonb, p integer, es jsonb, ziel text, sp integer, au jsonb) returns jsonb language plpgsql set search_path = public as $$
declare e jsonb;
begin
  for e in select * from jsonb_array_elements(coalesce(es, '[]')) loop st := _k2_effekt(st, p, e, ziel, sp, au); end loop;
  return st;
end $$;

-- Fallen des Besitzers prüfen (höchstens eine löst aus)
create or replace function public._k2_fallen(st jsonb, besitzer integer, anlass text, au jsonb) returns jsonb language plpgsql set search_path = public as $$
declare i integer; f jsonb; k karten;
begin
  for i in 0..1 loop
    f := st->'s'->besitzer->'fallen'->i;
    continue when jsonb_typeof(f) <> 'object';
    select * into k from karten where id = f->>'k';
    continue when k.ausloeser is distinct from anlass;
    st := jsonb_set(st, array['s', besitzer::text, 'fallen', i::text], 'null'::jsonb);
    st := _k_log(st, jsonb_build_object('art','falle','p',besitzer,'k',k.id,'fplatz',i,'zs',au->'p','platz',au->'platz'));
    return _k2_effekte(st, besitzer, k.effekt, null, null, au);
  end loop;
  return st;
end $$;

create or replace function public._k2_ende(st jsonb) returns jsonb language plpgsql as $$
declare h0 integer := (st->'s'->0->>'hp')::int; h1 integer := (st->'s'->1->>'hp')::int;
begin
  if st->>'phase' = 'ende' then return st; end if;
  if h0 <= 0 or h1 <= 0 or coalesce((st->>'runde')::int, 0) >= 60 then
    return st || jsonb_build_object('phase','ende','frage',null,'sieger', case when (h0 <= 0 and h1 <= 0) or h0 = h1 then -1 when h0 > h1 then 0 else 1 end);
  end if;
  return st;
end $$;

create or replace function public._k2_zug_start(st jsonb, p integer) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; z integer := (pl->>'zug')::int + 1; mf integer := least(coalesce((pl->>'maxfokus')::int, 0) + 1, 8); i integer; m jsonb; f text; ges jsonb;
begin
  for i in 0..3 loop
    m := pl->'feld'->i;
    if jsonb_typeof(m) = 'object' then pl := jsonb_set(pl, array['feld', i::text], m || jsonb_build_object('bereit', not (m->>'bet')::boolean, 'bet', false)); end if;
  end loop;
  st := _k_setze(st, p, pl || jsonb_build_object('zug', z, 'maxfokus', mf, 'fokus', mf, 'bonus', false));
  st := _k_log(st || jsonb_build_object('am', p, 'phase', 'frage', 'frage', null), jsonb_build_object('art','zug','p',p,'zug',z));
  st := _k2_ziehen(st, p, 1);
  if (st->'s'->p->>'id') is not null then
    ges := coalesce(st->'gesehen', '[]');
    f := _frage_neu(array(select jsonb_array_elements_text(ges)));
    ges := ges || to_jsonb(f);
    if jsonb_array_length(ges) > 40 then ges := ges - 0; end if;
    st := st || jsonb_build_object('frage', f, 'gesehen', ges);
  end if;
  return _k2_ende(st);
end $$;

-- Zugfrage: richtig → +1 Fokus, +1 Karte, Erleuchtet-Effekte, Serie; 3 in Folge → Aufstieg verfügbar
create or replace function public._k2_antwort(st jsonb, p integer, ok boolean) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; i integer; m jsonb; k karten; se integer;
begin
  if ok then
    se := (pl->>'serie')::int + 1;
    pl := pl || jsonb_build_object('bonus', true, 'fokus', (pl->>'fokus')::int + 1, 'richtig', (pl->>'richtig')::int + 1, 'serie', se,
                                   'aufstieg', coalesce((pl->>'aufstieg')::boolean, false) or se % 3 = 0);
    st := _k_log(_k_setze(st, p, pl) || jsonb_build_object('phase','spielen','frage',null), jsonb_build_object('art','antwort','p',p,'ok',true,'serie',se,'aufstieg',se % 3 = 0));
    st := _k2_ziehen(st, p, 1);
    for i in 0..3 loop
      m := st->'s'->p->'feld'->i;
      continue when jsonb_typeof(m) <> 'object';
      select * into k from karten where id = m->>'k';
      continue when jsonb_array_length(k.erleuchtet) = 0;
      st := _k_log(st, jsonb_build_object('art','erleuchtet','p',p,'platz',i,'k',k.id));
      st := _k2_effekte(st, p, k.erleuchtet, null, i, null);
    end loop;
  else
    st := _k_log(_k_setze(st, p, pl || jsonb_build_object('bonus', false, 'serie', 0)) || jsonb_build_object('phase','spielen','frage',null), jsonb_build_object('art','antwort','p',p,'ok',false));
  end if;
  return _k2_ende(st);
end $$;

create or replace function public._k2_spielen(st jsonb, p integer, h integer, platz integer, ziel text) returns jsonb language plpgsql set search_path = public as $$
declare pl jsonb := st->'s'->p; kid text; k karten; i integer;
begin
  if st->>'phase' <> 'spielen' then raise exception 'Beantworte zuerst die Zugfrage.'; end if;
  if h is null or h < 0 or h >= jsonb_array_length(pl->'hand') then raise exception 'Diese Karte hast du nicht auf der Hand.'; end if;
  kid := pl->'hand'->>h;
  select * into k from karten where id = kid;
  if k.kosten > (pl->>'fokus')::int then raise exception 'Nicht genug Fokus.'; end if;
  if k.seltenheit = 'legendary' and not coalesce((pl->>'bonus')::boolean, false) then raise exception 'Legendäre Karten brauchst du eine richtige Antwort in diesem Zug.'; end if;
  if k.typ = 'monster' then
    if platz is null then for i in 0..3 loop if jsonb_typeof(pl->'feld'->i) <> 'object' then platz := i; exit; end if; end loop; end if;
    if platz is null or platz < 0 or platz > 3 or jsonb_typeof(pl->'feld'->platz) = 'object' then raise exception 'Kein freier Platz.'; end if;
  elsif k.typ = 'falle' then
    if platz is null then for i in 0..1 loop if jsonb_typeof(pl->'fallen'->i) <> 'object' then platz := i; exit; end if; end loop; end if;
    if platz is null or platz < 0 or platz > 1 or jsonb_typeof(pl->'fallen'->platz) = 'object' then raise exception 'Du hast schon zwei Fallen gelegt.'; end if;
  end if;
  pl := jsonb_set(pl || jsonb_build_object('fokus', (pl->>'fokus')::int - k.kosten), '{hand}', (pl->'hand') - h);
  st := _k_setze(st, p, pl);
  if k.typ = 'monster' then
    st := _k2_setzen(st, p, kid, platz);
    st := _k_log(st, jsonb_build_object('art','spielt','p',p,'k',kid,'platz',platz,'typ','monster'));
    st := _k2_effekte(st, p, k.effekt, ziel, platz, null);
    if jsonb_typeof(st->'s'->p->'feld'->platz) = 'object' then st := _k2_fallen(st, 1 - p, 'beschwoerung', jsonb_build_object('p', p, 'platz', platz)); end if;
  elsif k.typ = 'zauber' then
    st := _k_log(st, jsonb_build_object('art','spielt','p',p,'k',kid,'typ','zauber','ziel',ziel));
    st := _k2_effekte(st, p, k.effekt, ziel, null, null);
  else
    st := jsonb_set(st, array['s', p::text, 'fallen', platz::text], jsonb_build_object('k', kid));
    st := _k_log(st, jsonb_build_object('art','falle_gelegt','p',p,'fplatz',platz));
  end if;
  return _k2_ende(st - 'abbruch');
end $$;

-- Angriff: von = eigener Platz, ziel = gegnerischer Platz 0–3 oder -1 (Held)
create or replace function public._k2_angreifen(st jsonb, p integer, von integer, ziel integer) returns jsonb language plpgsql set search_path = public as $$
declare o integer := 1 - p; a jsonb; d jsonb; i integer; w boolean := false; sa integer; sd integer; ga boolean; gd boolean;
begin
  if st->>'phase' <> 'spielen' then raise exception 'Beantworte zuerst die Zugfrage.'; end if;
  if von is null or von < 0 or von > 3 then raise exception 'Ungültiger Angreifer.'; end if;
  a := st->'s'->p->'feld'->von;
  if jsonb_typeof(a) <> 'object' then raise exception 'Dort steht kein Monster.'; end if;
  if not (a->>'bereit')::boolean or (a->>'bet')::boolean then raise exception 'Dieses Monster kann gerade nicht angreifen.'; end if;
  if (a->>'a')::int <= 0 then raise exception 'Dieses Monster hat keinen Angriff.'; end if;
  if ziel is null or ziel < -1 or ziel > 3 then raise exception 'Ungültiges Ziel.'; end if;
  for i in 0..3 loop
    d := st->'s'->o->'feld'->i;
    if jsonb_typeof(d) = 'object' and _k2_hat(d, 'waechter') and not (d->>'tarn')::boolean then w := true; end if;
  end loop;
  if ziel >= 0 then
    d := st->'s'->o->'feld'->ziel;
    if jsonb_typeof(d) <> 'object' then raise exception 'Dort steht kein Monster.'; end if;
    if (d->>'tarn')::boolean then raise exception 'Getarnte Monster können nicht angegriffen werden.'; end if;
    if w and not _k2_hat(d, 'waechter') then raise exception 'Greif zuerst einen Wächter an.'; end if;
  elsif w then raise exception 'Greif zuerst einen Wächter an.';
  end if;
  -- Angreifer verbraucht, verliert Tarnung
  st := jsonb_set(st, array['s', p::text, 'feld', von::text], a || jsonb_build_object('bereit', false, 'tarn', false));
  st := _k2_fallen(st - 'abbruch', o, 'angriff', jsonb_build_object('p', p, 'platz', von));
  if coalesce((st->>'abbruch')::boolean, false) or jsonb_typeof(st->'s'->p->'feld'->von) <> 'object' then
    st := _k_log(st - 'abbruch', jsonb_build_object('art','abgewehrt','p',p,'von',von));
    return _k2_ende(st);
  end if;
  a := st->'s'->p->'feld'->von; ga := _k2_hat(a, 'gift');
  if ziel = -1 then
    st := _k2_held(st, o, (a->>'a')::int);
    st := _k_log(st, jsonb_build_object('art','angriff','p',p,'von',von,'ziel',-1,'schaden',(a->>'a')::int));
    if _k2_hat(a, 'lebensraub') then st := _k2_held(st, p, -(a->>'a')::int); end if;
  else
    d := st->'s'->o->'feld'->ziel; gd := _k2_hat(d, 'gift');
    st := _k_log(st, jsonb_build_object('art','angriff','p',p,'von',von,'ziel',ziel,'schaden',(a->>'a')::int,'zurueck',(d->>'a')::int));
    st := _k2_treffen(st, o, ziel, (a->>'a')::int, ga); sa := (st->>'tatsaechlich')::int;
    st := _k2_treffen(st, p, von, (d->>'a')::int, gd); sd := (st->>'tatsaechlich')::int;
    if _k2_hat(a, 'lebensraub') and sa > 0 then st := _k2_held(st, p, -sa); end if;
    if _k2_hat(d, 'lebensraub') and sd > 0 then st := _k2_held(st, o, -sd); end if;
  end if;
  return _k2_ende(st - 'tatsaechlich');
end $$;

-- Aufstieg: +3/+3 und ein Schlüsselwort je Fach (WBL Wächter, ITS Gift, AEW Schild)
create or replace function public._k2_aufstieg(st jsonb, p integer, platz integer) returns jsonb language plpgsql set search_path = public as $$
declare m jsonb := st->'s'->p->'feld'->platz; f text; kw text;
begin
  if not coalesce((st->'s'->p->>'aufstieg')::boolean, false) then raise exception 'Für einen Aufstieg brauchst du 3 richtige Antworten in Folge.'; end if;
  if st->>'phase' <> 'spielen' then raise exception 'Beantworte zuerst die Zugfrage.'; end if;
  if platz is null or jsonb_typeof(m) <> 'object' then raise exception 'Wähle ein eigenes Monster.'; end if;
  if (m->>'auf')::boolean then raise exception 'Dieses Monster ist schon aufgestiegen.'; end if;
  select fach into f from karten where id = m->>'k';
  kw := case f when 'wbl' then 'waechter' when 'its1' then 'gift' else 'schild' end;
  m := m || jsonb_build_object('a', (m->>'a')::int + 3, 'v', (m->>'v')::int + 3, 'max', (m->>'max')::int + 3, 'auf', true,
    'sch', case when (m->'sch') ? kw then m->'sch' else (m->'sch') || to_jsonb(kw) end, 'schild', (m->>'schild')::boolean or kw = 'schild');
  st := jsonb_set(st, array['s', p::text, 'feld', platz::text], m);
  st := _k_setze(st, p, (st->'s'->p) || jsonb_build_object('aufstieg', false));
  return _k_log(st, jsonb_build_object('art','aufstieg','p',p,'platz',platz,'kw',kw));
end $$;

-- ============ KI ============
-- Ziel für einen Zauber wählen (null = kein sinnvolles Ziel → nicht spielen)
create or replace function public._k2_ki_ziel(st jsonb, p integer, k karten) returns text language plpgsql set search_path = public as $$
declare o integer := 1 - p; e jsonb := k.effekt->0; z text := coalesce(e->>'ziel', ''); art text := e->>'art'; i integer; best integer; bw integer := -1; m jsonb; w integer := coalesce((e->>'wert')::int, 0);
begin
  if art = 'schaden' and z in ('monster', 'wahl') then
    for i in 0..3 loop m := st->'s'->o->'feld'->i;
      continue when jsonb_typeof(m) <> 'object' or (m->>'tarn')::boolean;
      if ((m->>'v')::int <= w and not (m->>'schild')::boolean) and (m->>'a')::int * 2 + (m->>'v')::int > bw then bw := (m->>'a')::int * 2 + (m->>'v')::int; best := i; end if;
    end loop;
    if best is not null then return 'g' || best; end if;
    if z = 'wahl' then return 'held'; end if;
    for i in 0..3 loop m := st->'s'->o->'feld'->i;   -- sonst das stärkste angreifbare
      continue when jsonb_typeof(m) <> 'object';
      if (m->>'a')::int > bw then bw := (m->>'a')::int; best := i; end if;
    end loop;
    return case when best is null then null else 'g' || best end;
  elsif (art in ('staerken', 'schild') and z = 'eigen') then
    for i in 0..3 loop m := st->'s'->p->'feld'->i;
      continue when jsonb_typeof(m) <> 'object';
      if (m->>'a')::int + (m->>'v')::int > bw then bw := (m->>'a')::int + (m->>'v')::int; best := i; end if;
    end loop;
    return case when best is null then null else 'e' || best end;
  elsif art in ('staerken', 'schild') and z = 'alle' then
    return case when _k2_zufall(st, p) is null then null else '' end;
  elsif art in ('betaeuben', 'vernichten') and z = 'monster' then
    for i in 0..3 loop m := st->'s'->o->'feld'->i;
      continue when jsonb_typeof(m) <> 'object';
      if (m->>'a')::int > bw then bw := (m->>'a')::int; best := i; end if;
    end loop;
    return case when best is null then null else 'g' || best end;
  end if;
  return '';
end $$;

-- Ein kompletter Zug des Computers für Seite p (Zugbeginn ist schon erfolgt)
create or replace function public._k2_ki_zug(st jsonb, p integer, quote float) returns jsonb language plpgsql set search_path = public as $$
declare o integer := 1 - p; pl jsonb; op jsonb; k karten; i integer; j integer; bh integer; bz text; bk integer; z text; m jsonb; d jsonb;
  frei integer; w boolean; summe integer; best integer; bw integer; runde integer := 0;
begin
  if st->>'phase' = 'ende' then return st; end if;
  st := _k2_antwort(st, p, random() < quote);
  if st->>'phase' = 'ende' then return st; end if;
  -- Aufstieg auf das stärkste Monster
  if (st->'s'->p->>'aufstieg')::boolean then
    bw := -1; best := null;
    for i in 0..3 loop m := st->'s'->p->'feld'->i;
      continue when jsonb_typeof(m) <> 'object' or (m->>'auf')::boolean;
      if (m->>'a')::int + (m->>'v')::int > bw then bw := (m->>'a')::int + (m->>'v')::int; best := i; end if;
    end loop;
    if best is not null then st := _k2_aufstieg(st, p, best); end if;
  end if;
  -- Karten spielen: jeweils die teuerste sinnvolle
  loop
    runde := runde + 1; exit when runde > 12 or st->>'phase' = 'ende';
    pl := st->'s'->p; bh := null; bk := -1;
    for i in 0..jsonb_array_length(pl->'hand') - 1 loop
      select * into k from karten where id = pl->'hand'->>i;
      continue when k.kosten > (pl->>'fokus')::int or k.kosten <= bk;
      continue when k.seltenheit = 'legendary' and not (pl->>'bonus')::boolean;
      if k.typ = 'monster' then
        frei := null; for j in 0..3 loop if jsonb_typeof(pl->'feld'->j) <> 'object' then frei := j; exit; end if; end loop;
        continue when frei is null; z := '';
        if (k.effekt->0->>'ziel') in ('monster', 'wahl', 'eigen') then z := _k2_ki_ziel(st, p, k); continue when z is null; end if;
      elsif k.typ = 'zauber' then
        z := _k2_ki_ziel(st, p, k); continue when z is null;
      else
        continue when jsonb_typeof(pl->'fallen'->0) = 'object' and jsonb_typeof(pl->'fallen'->1) = 'object'; z := '';
      end if;
      bh := i; bk := k.kosten; bz := z;
    end loop;
    exit when bh is null;
    begin
      st := _k2_spielen(st, p, bh, null, nullif(bz, ''));
    exception when others then exit;
    end;
  end loop;
  -- Angreifen
  for runde in 1..4 loop
    exit when st->>'phase' = 'ende';
    pl := st->'s'->p; op := st->'s'->o;
    best := null; bw := -1;
    for i in 0..3 loop m := pl->'feld'->i;   -- stärksten bereiten Angreifer nehmen
      continue when jsonb_typeof(m) <> 'object' or not (m->>'bereit')::boolean or (m->>'bet')::boolean or (m->>'a')::int <= 0;
      if (m->>'a')::int > bw then bw := (m->>'a')::int; best := i; end if;
    end loop;
    exit when best is null;
    m := pl->'feld'->best;
    w := false; summe := 0;
    for j in 0..3 loop d := op->'feld'->j; if jsonb_typeof(d) = 'object' and _k2_hat(d, 'waechter') and not (d->>'tarn')::boolean then w := true; end if;
      d := pl->'feld'->j; if jsonb_typeof(d) = 'object' and (d->>'bereit')::boolean and not (d->>'bet')::boolean then summe := summe + (d->>'a')::int; end if; end loop;
    z := null;
    if w then   -- Wächter mit der geringsten Verteidigung
      bw := 999;
      for j in 0..3 loop d := op->'feld'->j;
        continue when jsonb_typeof(d) <> 'object' or not _k2_hat(d, 'waechter') or (d->>'tarn')::boolean;
        if (d->>'v')::int < bw then bw := (d->>'v')::int; z := j::text; end if;
      end loop;
    elsif summe >= (op->>'hp')::int then z := '-1';   -- tödlich
    else        -- guter Tausch: töten und überleben, oder Wertvolles töten
      bw := 0;
      for j in 0..3 loop d := op->'feld'->j;
        continue when jsonb_typeof(d) <> 'object' or (d->>'tarn')::boolean;
        continue when not ((m->>'a')::int >= (d->>'v')::int or _k2_hat(m, 'gift')) or (d->>'schild')::boolean;
        if ((d->>'a')::int < (m->>'v')::int or (m->>'schild')::boolean or (d->>'a')::int + (d->>'v')::int >= (m->>'a')::int + (m->>'v')::int)
           and (d->>'a')::int * 2 + (d->>'v')::int > bw then bw := (d->>'a')::int * 2 + (d->>'v')::int; z := j::text; end if;
      end loop;
      if z is null then z := '-1'; end if;
    end if;
    begin
      st := _k2_angreifen(st, p, best, z::int);
    exception when others then
      st := jsonb_set(st, array['s', p::text, 'feld', best::text, 'bereit'], 'false');
    end;
  end loop;
  return st;
end $$;

-- Computer-Gegner: 6 Bosse + Freies Spiel
create or replace function public._k2_boss(n integer) returns jsonb language sql immutable as $$
  select case n
    when 1 then '{"name":"Praktikant Paul","hp":20,"quote":0.4,"deck":["wbl-wichtel","wbl-wichtel","wbl-stechuhr","wbl-stechuhr","wbl-phantom","wbl-salamander","wbl-golem","wbl-unterweisung","its-aal","its-aal","its-passwort","its-spam","its-trojaner","its-baer","aew-kaefer","aew-kaefer","aew-schleim","aew-eule","aew-phantom","aew-wurm"]}'
    when 2 then '{"name":"Azubi-Kollegin Ayla","hp":16,"quote":0.5,"deck":["wbl-wichtel","wbl-wichtel","wbl-stechuhr","wbl-salamander","wbl-salamander","wbl-golem","wbl-golem","wbl-unterweisung","wbl-abmahnung","wbl-greif","wbl-einhorn","wbl-vereinbarung","aew-eule","aew-eule","aew-schleim","aew-wurm","aew-refactoring","its-baer","its-passwort","its-patchday"]}'
    when 3 then '{"name":"Hacker Hex","hp":22,"quote":0.65,"deck":["its-aal","its-aal","its-passwort","its-spam","its-spam","its-trojaner","its-trojaner","its-baer","its-patchday","its-patchday","its-honeypot","its-rabe","its-rabe","its-hexe","its-barbar","its-verschluesselung","its-zombie","aew-phantom","aew-phantom","aew-breakpoint"]}'
    when 4 then '{"name":"Lead-Dev Kaya","hp":24,"quote":0.72,"deck":["aew-kaefer","aew-kaefer","aew-eule","aew-eule","aew-wurm","aew-refactoring","aew-refactoring","aew-breakpoint","aew-luchs","aew-luchs","aew-basilisk","aew-basilisk","aew-stapel","aew-review","aew-schlange","aew-kraken","aew-titan","its-hexe","its-patchday","its-verschluesselung"]}'
    when 5 then '{"name":"Ausbilder Bernd","hp":20,"quote":0.62,"deck":["wbl-wichtel","wbl-stechuhr","wbl-salamander","wbl-golem","wbl-golem","wbl-unterweisung","wbl-abmahnung","wbl-greif","wbl-greif","wbl-einhorn","wbl-einhorn","wbl-vereinbarung","wbl-kuendigungsschutz","wbl-mammut","wbl-koloss","wbl-titan","its-baer","its-baer","aew-stapel","aew-review"]}'
    when 6 then '{"name":"Prüfungsausschuss","hp":42,"quote":0.9,"deck":["wbl-hydra","its-drache","aew-drache","wbl-titan","wbl-koloss","wbl-mammut","its-sphinx","its-zombie","its-botnetz","aew-kraken","aew-titan","aew-schlange","its-barbar","its-hexe","wbl-greif","aew-basilisk","its-patchday","wbl-kuendigungsschutz","aew-review","its-verschluesselung"]}'
  end::jsonb
$$;
create or replace function public._k2_frei_deck() returns text[] language sql volatile set search_path = public as $$
  select array(select id from (select id, seltenheit from karten where seltenheit <> 'token' union all select id, seltenheit from karten where seltenheit in ('common','rare')) x
               order by random() * case seltenheit when 'common' then 1 when 'rare' then 1.3 when 'epic' then 2.2 else 4 end limit 20)
$$;
create or replace function public._k2_frei(staerke text) returns jsonb language sql immutable as $$
  select case staerke when 'leicht' then '{"name":"Trainings-Bot","hp":22,"quote":0.5}' when 'schwer' then '{"name":"Meister-Bot","hp":28,"quote":0.85}' else '{"name":"Duell-Bot","hp":25,"quote":0.7}' end::jsonb
$$;

-- ============ Aufrufe ============

create or replace function public._k2_gegner(m kaempfe) returns jsonb language sql stable set search_path = public as $$
  select case when m.stufe is not null then _k2_boss(m.stufe) when m.frei is not null then _k2_frei(m.frei) end
$$;

create or replace function public.kampf_ansicht(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); m kaempfe; z jsonb; i integer; du jsonb; ge jsonb; gid uuid; g jsonb;
begin
  select * into m from kaempfe where id = p_id;
  if not found or me is null or (me is distinct from m.spieler_a and me is distinct from m.spieler_b) then raise exception 'Kampf nicht gefunden'; end if;
  select k.st into z from kampf_zustand k where k.kampf_id = p_id;
  i := case when me = m.spieler_a then 0 else 1 end;
  du := z->'s'->i; ge := z->'s'->(1 - i);
  gid := case when i = 0 then m.spieler_b else m.spieler_a end;
  g := _k2_gegner(m);
  return jsonb_build_object(
    'id', m.id, 'status', m.status, 'stufe', m.stufe, 'frei', m.frei, 'ich', i, 'gegner_id', gid,
    'gegner_name', coalesce(g->>'name', (select spitzname from profile where id = gid)),
    'gegner_farbe', (select farbe from profile where id = gid),
    'du', (du - 'deck' - 'id') || jsonb_build_object('deck', jsonb_array_length(du->'deck')),
    'gegner', (ge - 'deck' - 'hand' - 'id' - 'fallen') || jsonb_build_object('deck', jsonb_array_length(ge->'deck'), 'hand', jsonb_array_length(ge->'hand'),
               'fallen', (select jsonb_agg(jsonb_typeof(x) = 'object') from jsonb_array_elements(ge->'fallen') x)),
    'dran', m.status = 'laeuft' and (z->>'am')::int = i,
    'phase', z->'phase', 'runde', z->'runde', 'logn', z->'logn',
    'frage', case when (z->>'am')::int = i then z->'frage' else null end,
    -- Log ohne verdeckte Informationen des Gegners (welche Falle gelegt wurde, welche Karte gezogen)
    'log', (select coalesce(jsonb_agg(e), '[]') from jsonb_array_elements(z->'log') e where not (e->>'art' in ('verbrannt') and (e->>'p')::int <> i)),
    'ergebnis', case when z->>'phase' = 'ende' then case when (z->>'sieger')::int = -1 then 'remis' when (z->>'sieger')::int = i then 'sieg' else 'niederlage' end end,
    'aufgegeben', z->'aufgegeben',
    'belohnung', z->'belohnung'->(i::text));
end $$;

create or replace function public._k_abschluss(p_id uuid, z jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare m kaempfe; s integer := (z->>'sieger')::int; i integer; uid uuid; erg text; xp integer; co integer; b jsonb; bel jsonb := '{}'; auf integer := (z->>'aufgegeben')::int; stufe_alt integer; kn spieler_konto; tag text := to_char(now() at time zone 'Europe/Berlin', 'YYYY-MM-DD');
begin
  select * into m from kaempfe where id = p_id for update;
  for i in 0..1 loop
    uid := case when i = 0 then m.spieler_a else m.spieler_b end;
    continue when uid is null;
    erg := case when s = -1 then 'remis' when s = i then 'sieg' else 'niederlage' end;
    if m.stufe is not null then
      xp := case erg when 'sieg' then 20 + 8 * m.stufe when 'remis' then 12 else 8 end;
      co := case erg when 'sieg' then 10 + 6 * m.stufe when 'remis' then 6 else 4 end;
    elsif m.frei is not null then
      xp := case erg when 'sieg' then 20 when 'remis' then 10 else 6 end;
      co := case erg when 'sieg' then 12 when 'remis' then 6 else 3 end;
    else
      xp := case erg when 'sieg' then 50 when 'remis' then 25 else 15 end;
      co := case erg when 'sieg' then 40 when 'remis' then 20 else 10 end;
    end if;
    if auf = i then xp := 0; co := 0; end if;
    b := _belohnen(uid, 'karten', erg, xp, co, case when auf = i then 0 else (z->'s'->i->>'richtig')::int end,
                   jsonb_build_object('stufe', m.stufe, 'ki', m.spieler_b is null, 'gegner', coalesce(_k2_gegner(m)->>'name', (select spitzname from profile where id = case when i = 0 then m.spieler_b else m.spieler_a end))));
    select * into kn from spieler_konto where user_id = uid for update;
    if erg = 'sieg' and auf is distinct from i then
      if m.stufe is not null then
        stufe_alt := coalesce((kn.statistik->'karten'->>'stufe')::int, 0);
        if m.stufe > stufe_alt then
          update spieler_konto set booster = booster + 1, statistik = jsonb_set(statistik, '{karten,stufe}', to_jsonb(m.stufe)) where user_id = uid;
          b := b || jsonb_build_object('stufe_neu', m.stufe, 'booster', (b->>'booster')::int + 1);
        end if;
      end if;
      -- erster Sieg des Tages: +1 Booster
      if coalesce(kn.statistik->'karten'->>'tagessieg', '') <> tag then
        update spieler_konto set booster = booster + 1, statistik = jsonb_set(statistik, '{karten,tagessieg}', to_jsonb(tag)) where user_id = uid;
        b := b || jsonb_build_object('tagessieg', true, 'booster', (b->>'booster')::int + 1);
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

drop function if exists public.kampf_starten(integer, uuid);
create or replace function public.kampf_starten(p_stufe integer default null, p_gegner uuid default null, p_frei text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare me uuid := auth.uid(); deck text[]; gdeck text[]; kid uuid; z jsonb; g jsonb; frei integer;
begin
  if me is null then raise exception 'nicht angemeldet'; end if;
  perform _konto(me);
  select karten into deck from decks where user_id = me;
  if coalesce(array_length(deck, 1), 0) <> 20 then raise exception 'Dein Deck braucht 20 Karten.'; end if;
  if p_gegner is null then
    if p_frei is not null then
      if p_frei not in ('leicht','mittel','schwer') then raise exception 'Unbekannte Stärke'; end if;
      g := _k2_frei(p_frei); gdeck := _k2_frei_deck(); p_stufe := null;
    else
      if p_stufe is null or p_stufe < 1 or p_stufe > 6 then raise exception 'Unbekannte Stufe'; end if;
      select coalesce((statistik->'karten'->>'stufe')::int, 0) + 1 into frei from spieler_konto where user_id = me;
      if p_stufe > frei then raise exception 'Diese Stufe ist noch gesperrt – besiege zuerst den vorherigen Gegner.'; end if;
      g := _k2_boss(p_stufe); gdeck := array(select jsonb_array_elements_text(g->'deck'));
    end if;
    update kaempfe set status = 'fertig', ergebnis = 'abgebrochen', am_zug = null where spieler_a = me and spieler_b is null and status = 'laeuft';
    insert into kaempfe (klasse_id, spieler_a, stufe, frei, am_zug) values (meine_klasse(), me, p_stufe, p_frei, me) returning id into kid;
    z := jsonb_build_array(_k2_spieler(me, deck, 25), _k2_spieler(null, gdeck, (g->>'hp')::int));
  else
    if p_gegner = me then raise exception 'Du kannst nicht gegen dich selbst spielen.'; end if;
    if meine_klasse() is null or not exists (select 1 from profile where id = p_gegner and klasse_id = meine_klasse()) then raise exception 'Gegner nicht gefunden'; end if;
    if exists (select 1 from kaempfe where status = 'laeuft' and ((spieler_a = me and spieler_b = p_gegner) or (spieler_a = p_gegner and spieler_b = me))) then
      raise exception 'Ihr habt schon einen laufenden Karten-Kampf.';
    end if;
    perform _konto(p_gegner);
    select karten into gdeck from decks where user_id = p_gegner;
    insert into kaempfe (klasse_id, spieler_a, spieler_b, am_zug) values (meine_klasse(), me, p_gegner, me) returning id into kid;
    z := jsonb_build_array(_k2_spieler(me, deck, 25), _k2_spieler(p_gegner, gdeck, 25));
  end if;
  z := jsonb_build_object('s', z, 'am', 0, 'phase', 'frage', 'runde', 0, 'log', '[]'::jsonb, 'logn', 0, 'gesehen', '[]'::jsonb, 'mn', 0);
  z := _k2_ziehen(_k2_ziehen(z, 0, 3), 1, 4);
  z := _k2_zug_start(z, 0);
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
  perform _k_speichern(p_id, _k2_antwort(r.z, r.i, ok));
  return kampf_ansicht(p_id) || jsonb_build_object('antwort', jsonb_build_object('frage', f, 'ok', ok, 'richtig', _frage_richtig(f)));
end $$;

drop function if exists public.kampf_spielen(uuid, integer, integer);
create or replace function public.kampf_spielen(p_id uuid, p_hand integer, p_platz integer default null, p_ziel text default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  perform _k_speichern(p_id, _k2_spielen(r.z, r.i, p_hand, p_platz, p_ziel));
  return kampf_ansicht(p_id);
end $$;

create or replace function public.kampf_angreifen(p_id uuid, p_von integer, p_ziel integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  perform _k_speichern(p_id, _k2_angreifen(r.z, r.i, p_von, p_ziel));
  return kampf_ansicht(p_id);
end $$;

create or replace function public.kampf_aufstieg(p_id uuid, p_platz integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record;
begin
  select * into r from _k_laden(p_id);
  if (r.z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  perform _k_speichern(p_id, _k2_aufstieg(r.z, r.i, p_platz));
  return kampf_ansicht(p_id);
end $$;

create or replace function public.kampf_zug_beenden(p_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; z jsonb;
begin
  select * into r from _k_laden(p_id);
  z := r.z;
  if (z->>'am')::int <> r.i then raise exception 'Du bist gerade nicht dran.'; end if;
  if z->>'phase' = 'frage' then raise exception 'Beantworte zuerst die Zugfrage.'; end if;
  z := _k2_ende(z || jsonb_build_object('runde', (z->>'runde')::int + 1));
  if z->>'phase' <> 'ende' then
    if (r.m).spieler_b is null then
      z := _k2_zug_start(z, 1);
      z := _k2_ki_zug(z, 1, (_k2_gegner(r.m)->>'quote')::float);
      z := _k2_ende(z || jsonb_build_object('runde', (z->>'runde')::int + 1));
      if z->>'phase' <> 'ende' then z := _k2_zug_start(z, 0); end if;
    else
      z := _k2_zug_start(z, 1 - r.i);
    end if;
  end if;
  perform _k_speichern(p_id, z);
  return kampf_ansicht(p_id);
end $$;

-- Simulation für die Balance (nur für Tests/Admin): KI gegen KI mit zwei Decks und Trefferquoten
create or replace function public._k2_simulation(deck_a text[], deck_b text[], quote_a float, quote_b float, hp_a integer default 25, hp_b integer default 25) returns jsonb
language plpgsql set search_path = public as $$
declare z jsonb; n integer := 0;
begin
  z := jsonb_build_object('s', jsonb_build_array(_k2_spieler(null, deck_a, hp_a), _k2_spieler(null, deck_b, hp_b)), 'am', 0, 'phase', 'frage', 'runde', 0, 'log', '[]'::jsonb, 'logn', 0, 'mn', 0);
  z := _k2_ziehen(_k2_ziehen(z, 0, 3), 1, 4);
  loop
    n := n + 1;
    z := _k2_zug_start(z, (n + 1) % 2);
    z := _k2_ki_zug(z, (n + 1) % 2, case when n % 2 = 1 then quote_a else quote_b end);
    z := _k2_ende(z || jsonb_build_object('runde', n));
    exit when z->>'phase' = 'ende';
  end loop;
  return jsonb_build_object('sieger', (z->>'sieger')::int, 'runden', n, 'hp', jsonb_build_array(z->'s'->0->'hp', z->'s'->1->'hp'));
end $$;

-- ============ Rechte ============
do $$
declare f record; rpcs text[] := array['spiel_konto','deck_speichern','booster_oeffnen','karte_herstellen','kampf_ansicht','kampf_starten','kampf_antwort','kampf_spielen','kampf_angreifen','kampf_aufstieg','kampf_zug_beenden'];
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like '\_%' or p.proname = any(rpcs)) loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    if f.proname like '\_%' then execute format('revoke execute on function %s from authenticated', f.sig);
    else execute format('grant execute on function %s to authenticated', f.sig); end if;
  end loop;
end $$;

select 'Lernwerk Legends eingerichtet' as ergebnis, (select count(*) from public.karten where seltenheit <> 'token') as karten;
