// Test der Games-SQL gegen PGlite mit nachgebautem Supabase
const {PGlite} = require('@electric-sql/pglite');
const fs = require('fs');
const R = require('path').join(__dirname, '..', '..', 'supabase') + '/';
const A = '00000000-0000-0000-0000-00000000000a', B = '00000000-0000-0000-0000-00000000000b', C = '00000000-0000-0000-0000-00000000000c';
let fehler = 0;
const ok = (b, t) => { if (b) console.log('  ✓ ' + t); else { fehler++; console.log('  ✗ ' + t); } };

(async () => {
  const db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth; create schema extensions;
    create table auth.users (id uuid primary key, last_sign_in_at timestamptz, banned_until timestamptz, encrypted_password text, updated_at timestamptz);
    create table auth.sessions (user_id uuid);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    create publication supabase_realtime;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated;
  `);
  for (const f of ['schema.sql', '2026-09-22-admin.sql', '2026-09-22-games.sql', '2026-09-23-ki.sql', '2026-09-23-karten-v2.sql', '2026-09-24-bombe-anzeige.sql', '2026-09-24-karten-feinschliff.sql', 'spiel-fragen.sql']) {
    try { await db.exec(fs.readFileSync(R + f, 'utf8')); console.log('geladen: ' + f); }
    catch (e) { console.log('FEHLER in ' + f + ': ' + e.message); process.exit(1); }
  }
  await db.exec(`insert into auth.users (id) values ('${A}'),('${B}'),('${C}');
    insert into profile (id, spitzname, klasse_id) select '${A}', 'Anna', id from klassen;
    insert into profile (id, spitzname, klasse_id) select '${B}', 'Ben', id from klassen;
    insert into klassen (name, code) values ('Andere', 'X-1');
    insert into profile (id, spitzname, klasse_id) select '${C}', 'Cem', id from klassen where code = 'X-1';`);

  // als Nutzer ausführen (Rolle authenticated, auth.uid() gesetzt)
  const als = async (uid, sql, p = []) => db.transaction(async tx => {
    await tx.exec(`set local role ${uid ? 'authenticated' : 'anon'}`);
    await tx.query(`select set_config('test.uid', $1, true)`, [uid || '']);
    return (await tx.query(sql, p)).rows;
  });
  const rpc = async (uid, fn, args = []) => { const r = await als(uid, `select public.${fn}(${args.map((_, i) => '$' + (i + 1)).join(',')}) as r`, args); return r[0].r; };
  const darfNicht = async (uid, sql, t) => { try { await als(uid, sql); ok(false, t + ' (ging durch!)'); } catch (e) { ok(true, t + ' → ' + e.message.slice(0, 60)); } };
  const loesung = async id => (await db.query('select richtig from spiel_fragen where id = $1', [id])).rows[0].richtig;
  const su = (sql, p) => db.query(sql, p);
  // Kampf-Zugfrage: Spielfrage (ID) oder Rechenfrage (Objekt, Lösung nur im Zustand)
  const loesungK = async v => typeof v.frage === 'object' ? +(await su("select st->'frage'->>'richtig' r from kampf_zustand where kampf_id = $1", [v.id])).rows[0].r : loesung(v.frage);

  console.log('\n== Konto & Rechte');
  const k = await rpc(A, 'spiel_konto');
  ok(k.deck.length === 20 && Object.keys(k.sammlung).length === 20 && k.booster === 3 && k.staub === 0, 'Starter: 20 Karten, Deck, 3 Booster, 0 Staub');
  await darfNicht(A, 'select * from spiel_fragen', 'Lösungen nicht lesbar');
  await darfNicht(A, "update spieler_konto set coins = 9999", 'Coins nicht direkt änderbar');
  await darfNicht(A, "update spieler_konto set staub = 9999", 'Staub nicht direkt änderbar');
  await darfNicht(A, "insert into karten_sammlung values ('" + A + "', 'its-drache', 1)", 'Karten nicht direkt einfügbar');
  await darfNicht(A, "select _belohnen('" + A + "', 'x', 'sieg', 999, 999, 0)", 'Belohnungsfunktion nicht aufrufbar');
  await darfNicht(A, "select _k2_simulation(_k2_starter(), _k2_starter(), 1, 0)", 'Engine-Hilfsfunktionen nicht aufrufbar');
  await darfNicht(A, "select * from kampf_zustand", 'Kampf-Zustand geheim');
  await darfNicht(A, "select * from bomben_geheim", 'Bombenzeit geheim');
  await darfNicht(A, "select * from arena_geheim", 'Arena-Fragen geheim');
  await darfNicht(A, "update kaempfe set sieger = '" + A + "'", 'Kampf-Kopf nicht schreibbar');
  await darfNicht(null, "select spiel_konto()", 'anon darf nicht');
  ok((await als(A, "select count(*)::int n from karten where seltenheit <> 'token'"))[0].n === 45, '45 Karten im Katalog lesbar (+ Spielmarken)');
  const verteilung = (await su("select fach, seltenheit, count(*)::int n from karten where seltenheit <> 'token' group by 1, 2 order by 1, 2")).rows;
  ok(['wbl', 'its1', 'aew'].every(f => ['common', 'rare', 'epic', 'legendary'].map(s => (verteilung.find(v => v.fach === f && v.seltenheit === s) || {}).n).join() === '7,4,3,1'), 'Je Fach 7 gewöhnlich, 4 selten, 3 episch, 1 legendär');

  console.log('\n== Deck');
  await darfNicht(A, "select deck_speichern(array_fill('wbl-wichtel'::text, array[20]))", 'Zu viele Kopien abgelehnt');
  await darfNicht(A, "select deck_speichern(array['wbl-wichtel'])", 'Falsche Deckgröße abgelehnt');
  await darfNicht(A, "select deck_speichern(array['tok-bug'] || (_k2_starter())[1:19])", 'Spielmarken nicht im Deck');

  console.log('\n== Booster, Pity, Herstellen');
  const bo = await rpc(A, 'booster_oeffnen', ['its1']);
  ok(bo.karten.length === 5 && bo.karten.every(x => !x.id.startsWith('tok-')), 'Booster liefert 5 Karten: ' + bo.karten.map(x => x.id).join(', '));
  const sel = (await su("select seltenheit from karten where id = $1", [bo.karten[4].id])).rows[0].seltenheit;
  ok(sel !== 'common', 'Karte 5 mindestens selten (' + sel + ')');
  await su("update spieler_konto set booster = 1, pity = 14 where user_id = $1", [A]);
  const bp = await rpc(A, 'booster_oeffnen', ['mix']);
  const legs = (await su("select count(*)::int n from karten where id = any($1) and seltenheit = 'legendary'", [bp.karten.map(x => x.id)])).rows[0].n;
  ok(legs >= 1 && bp.konto.pity === 0, 'Pity: 15. Booster ohne Legendäre bringt eine garantiert, Zähler zurück auf 0');
  await darfNicht(A, "select booster_oeffnen('its1')", 'Ohne Booster kein Öffnen');
  await darfNicht(A, "select booster_kaufen()", 'Kaufen ohne 100 Coins abgelehnt');
  await darfNicht(A, "select karte_herstellen('aew-drache')", 'Herstellen ohne Staub abgelehnt');
  await su("update spieler_konto set staub = 2000 where user_id = $1", [A]);
  const hk = await rpc(A, 'karte_herstellen', ['its-sphinx']);
  ok(hk.sammlung['its-sphinx'] >= 1 && hk.staub === 1600, 'Epische Karte für 400 Staub hergestellt');
  await darfNicht(A, "select karte_herstellen('tok-bug')", 'Spielmarken nicht herstellbar');
  await su("update spieler_konto set booster = 20 where user_id = $1", [A]);
  let staubVor = (await rpc(A, 'spiel_konto')).staub, staubBo = 0;
  for (let i = 0; i < 20; i++) staubBo += (await rpc(A, 'booster_oeffnen', ['wbl'])).staub;
  const nachher = await rpc(A, 'spiel_konto');
  ok(nachher.staub === staubVor + staubBo && Object.values(nachher.sammlung).every(n => n <= 2), '20 WBL-Booster: Überzählige werden zu Staub (+' + staubBo + '), nie mehr als 2 Exemplare');

  console.log('\n== Engine-Regeln');
  const E = async (sql, p = []) => (await su(sql, p)).rows[0].r;
  // leeres Grundgerüst: beide mit leerem Deck/Feld, Spieler 0 dran, Phase spielen
  const leer = `jsonb_build_object('s', jsonb_build_array(_k2_spieler(null, '{}', 25), _k2_spieler(null, '{}', 25)), 'am', 0, 'phase', 'spielen', 'runde', 1, 'log', '[]'::jsonb, 'logn', 0, 'mn', 0)`;
  const mit = (p, platz, kid, extra = '{}') => `jsonb_set(%s, array['s','${p}','feld','${platz}'], _k2_neu_monster('{}', '${kid}') || '${extra}'::jsonb)`;
  const bau = teile => teile.reduce((s, t) => t.replace('%s', s), leer);
  let st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'wbl-greif', '{"bereit":true}'), mit(1, 1, 'wbl-stechuhr')])}, 0, 0, -1) r`).catch(e => e.message);
  ok(/Wächter/.test(st), 'Wächter muss zuerst angegriffen werden');
  st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'wbl-greif', '{"bereit":true}'), mit(1, 1, 'its-trojaner')])}, 0, 0, 1) r`).catch(e => e.message);
  ok(/Getarnte/.test(st), 'Getarnte Monster sind nicht angreifbar');
  st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'wbl-greif', '{"bereit":true}'), mit(1, 1, 'its-passwort')])}, 0, 0, 1) r`);
  ok(st.s[1].feld[1] && st.s[1].feld[1].v === 3 && !st.s[1].feld[1].schild && st.s[0].feld[0].v === 3, 'Schild fängt den ersten Treffer ab (Gegenschlag trifft trotzdem)');
  st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'its-rabe', '{"bereit":true}'), mit(1, 1, 'wbl-titan', '{"tarn":false}')])}, 0, 0, 1) r`);
  ok(st.s[1].feld[1] === null, 'Gift vernichtet auch einen 5/7-Titan');
  st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'wbl-greif', '{"bereit":true}')])}, 0, 0, -1) r`);
  ok(st.s[1].hp === 21 && st.log.some(e => e.art === 'angriff' && e.ziel === -1), 'Direkter Angriff auf den Helden: 25 → 21');
  st = await E(`select _k2_angreifen(${bau([mit(0, 0, 'wbl-greif', '{"bereit":false}')])}, 0, 0, -1) r`).catch(e => e.message);
  ok(/kann gerade nicht/.test(st), 'Frisch gelegtes Monster ohne Ansturm greift nicht an');
  st = await E(`select _k2_angreifen(jsonb_set(${bau([mit(0, 0, 'wbl-greif', '{"bereit":true}')])}, '{s,1,fallen,0}', '{"k":"aew-breakpoint"}'), 0, 0, -1) r`);
  ok(st.s[1].hp === 25 && st.s[0].feld[0].bet === true && st.s[1].fallen[0] === null, 'Falle „Breakpoint“: Angriff abgebrochen, Angreifer betäubt, Falle verbraucht');
  st = await E(`select _k2_antwort(jsonb_set(jsonb_set(${bau([mit(0, 0, 'wbl-wichtel'), mit(0, 1, 'wbl-salamander')])}, '{s,0,serie}', '2'), '{s,0,hp}', '20') || '{"phase":"frage"}', 0, true) r`);
  ok(st.s[0].feld[0].a === 2 && st.s[0].feld[0].v === 3 && st.s[0].hp === 21 && st.s[0].aufstieg === true && st.s[0].fokus === 1, 'Richtige Antwort: Erleuchtet (+1/+1, Heilung 2, Karte ziehen bei leerem Deck = 1 Ermüdung), +1 Fokus, 3er-Serie → Aufstieg');
  st = await E(`select _k2_aufstieg(${bau([mit(0, 0, 'its-aal')])} || '{}'::jsonb, 0, 0) r`).catch(e => e.message);
  ok(/3 richtige/.test(st), 'Aufstieg nur nach 3 richtigen in Folge');
  st = await E(`select _k2_aufstieg(jsonb_set(${bau([mit(0, 0, 'its-aal')])}, '{s,0,aufstieg}', 'true'), 0, 0) r`);
  ok(st.s[0].feld[0].a === 5 && st.s[0].feld[0].v === 4 && st.s[0].feld[0].sch.includes('gift') && st.s[0].feld[0].auf, 'Aufstieg: +3/+3 und Gift (ITS)');
  st = await E(`select _k2_spielen(jsonb_set(jsonb_set(${leer}, '{s,0,hand}', '["its-drache"]'), '{s,0,fokus}', '9'), 0, 0, null, null) r`).catch(e => e.message);
  ok(/Legendäre/.test(st), 'Legendäre Karte ohne richtige Antwort gesperrt');
  st = await E(`select _k2_spielen(jsonb_set(jsonb_set(jsonb_set(${bau([mit(1, 0, 'wbl-stechuhr'), mit(1, 2, 'wbl-greif')])}, '{s,0,hand}', '["its-drache"]'), '{s,0,fokus}', '9'), '{s,0,bonus}', 'true'), 0, 0, null, null) r`);
  ok(st.s[0].feld[0].k === 'its-drache' && st.s[1].feld[0] === null && st.s[1].feld[2].v === 1, 'Firewall-Drache mit richtiger Antwort: 3 Schaden an allen Gegnern');
  st = await E(`select _k2_spielen(jsonb_set(jsonb_set(jsonb_set(${leer}, '{s,0,hand}', '["aew-kaefer"]'), '{s,0,fokus}', '1'), '{s,1,fallen,1}', '{"k":"its-honeypot"}'), 0, 0, null, null) r`);
  ok(st.s[0].feld[0] === null && st.s[0].feld[1] && st.s[0].feld[1].k === 'tok-bug' && st.s[1].fallen[1] === null, 'Honeypot trifft das ausgespielte Monster, der beschworene Bug bleibt');
  st = await E(`select _k2_spielen(jsonb_set(jsonb_set(${bau([mit(1, 3, 'wbl-greif')])}, '{s,0,hand}', '["its-patchday"]'), '{s,0,fokus}', '2'), 0, 0, null, 'g3') r`);
  ok(st.s[1].feld[3].v === 1 && st.s[0].fokus === 0, 'Zauber mit Ziel: Patch-Day 3 Schaden an g3');
  st = await E(`select _k2_ziehen(${leer}, 0, 3) r`);
  ok(st.s[0].hp === 19 && st.s[0].muede === 3, 'Leeres Deck: Ermüdung 1 + 2 + 3 Schaden');
  const sims = (await su("select _k2_simulation(_k2_starter(), array(select jsonb_array_elements_text(_k2_boss(6)->'deck')), 0.7, 0.9) r from generate_series(1, 30)")).rows.map(x => x.r);
  ok(sims.every(x => x.sieger !== undefined && x.runden > 3 && x.runden < 60), '30 KI-gegen-KI-Partien ohne Fehler, Ø ' + (sims.reduce((s, x) => s + x.runden, 0) / 30).toFixed(1) + ' Züge');

  console.log('\n== Karten-Kampf gegen Computer (Boss 1)');
  await darfNicht(A, "select kampf_starten(3)", 'Boss 3 gesperrt');
  await rpc(A, 'deck_speichern', [(await su('select _k2_starter() d')).rows[0].d]);
  let v = await rpc(A, 'kampf_starten', [1]);
  ok(v.phase === 'frage' && v.frage && v.du.hand.length === 4 && v.gegner.hand === 4 && typeof v.gegner.deck === 'number' && v.du.feld.length === 4, 'Start: Frage offen, 4 Handkarten, 4 Plätze, gegnerische Hand verdeckt');
  await darfNicht(A, `select kampf_zug_beenden('${v.id}')`, 'Zug beenden vor Antwort abgelehnt');
  const katalog = Object.fromEntries((await su('select * from karten')).rows.map(x => [x.id, x]));
  let zuege = 0;
  while (v.status === 'laeuft' && zuege < 60) {
    zuege++;
    if (v.phase === 'frage') {
      const w = (await loesungK(v)) + (zuege % 4 === 0 ? 1 : 0);   // jede 4. falsch
      v = await rpc(A, 'kampf_antwort', [v.id, w]);
      if (zuege === 1) ok(v.antwort && v.antwort.ok === true && v.du.fokus === 2 && v.du.hand.length === 5, 'Richtige Antwort: +1 Fokus (2), +1 Karte (5)');
    }
    for (let n = 0; n < 8 && v.status === 'laeuft'; n++) {
      const h = v.du.hand.map((id, i) => [i, katalog[id]]).filter(([, c]) => c.kosten <= v.du.fokus && c.typ === 'monster' && (c.seltenheit !== 'legendary' || v.du.bonus) && v.du.feld.some(f => !f)).sort((a, b) => b[1].kosten - a[1].kosten)[0];
      if (!h) break;
      v = await rpc(A, 'kampf_spielen', [v.id, h[0], null, null]);
    }
    for (let i = 0; i < 4 && v.status === 'laeuft'; i++) {
      const m = v.du.feld[i]; if (!m || !m.bereit || m.bet || m.a <= 0) continue;
      const waechter = v.gegner.feld.findIndex(g => g && g.sch.includes('waechter') && !g.tarn);
      try { v = await rpc(A, 'kampf_angreifen', [v.id, i, waechter >= 0 ? waechter : -1]); } catch (e) {}
    }
    if (v.status === 'laeuft') v = await rpc(A, 'kampf_zug_beenden', [v.id]);
  }
  ok(v.status === 'fertig' && v.ergebnis, `Kampf beendet nach ${zuege} Zügen: ${v.ergebnis} (${v.du.hp}:${v.gegner.hp})`);
  ok(v.belohnung && v.belohnung.xp > 0, 'Belohnung: ' + JSON.stringify(v.belohnung));
  ok(v.log.some(e => e.art === 'angriff') && !v.log.some(e => e.art === 'verbrannt' && e.p !== v.ich), 'Log enthält Angriffe, keine verdeckten Gegnerkarten');
  await darfNicht(A, `select kampf_zug_beenden('${v.id}')`, 'Nach Ende keine Züge mehr');
  const fr = await rpc(A, 'kampf_starten', [null, null, 'schwer']);
  ok(fr.frei === 'schwer' && fr.gegner_name === 'Meister-Bot' && fr.gegner.hp === 28, 'Freies Spiel gegen die KI (schwer)');

  console.log('\n== Karten-Kampf PvP');
  await rpc(B, 'spiel_konto');
  await darfNicht(A, `select kampf_starten(null, '${C}')`, 'Gegner aus fremder Klasse abgelehnt');
  let p = await rpc(A, 'kampf_starten', [null, B]);
  await darfNicht(B, `select kampf_antwort('${p.id}', 0)`, 'B darf in A\'s Zug nicht antworten');
  const vb = await rpc(B, 'kampf_ansicht', [p.id]);
  ok(vb.dran === false && vb.frage === null && typeof vb.gegner.hand === 'number' && Array.isArray(vb.gegner.fallen) && !('deck' in vb.du && Array.isArray(vb.du.deck)), 'B sieht A\'s Hand, Deck, Fallen und Frage nicht');
  await darfNicht(C, `select kampf_ansicht('${p.id}')`, 'Fremde sehen den Kampf nicht');
  p = await rpc(A, 'kampf_antwort', [p.id, await loesungK(p)]);
  const falle = p.du.hand.findIndex(id => katalog[id].typ === 'falle' && katalog[id].kosten <= p.du.fokus);
  if (falle >= 0) { p = await rpc(A, 'kampf_spielen', [p.id, falle, null, null]); const vb2 = await rpc(B, 'kampf_ansicht', [p.id]); ok(vb2.gegner.fallen.includes(true) && !JSON.stringify(vb2.log).includes(p.du.fallen.find(Boolean).k), 'Gelegte Falle für B nur als verdeckt sichtbar'); }
  p = await rpc(A, 'kampf_zug_beenden', [p.id]);
  ok(p.dran === false, 'Nach Zugende ist A nicht mehr dran');
  const kopf = (await als(B, `select am_zug from kaempfe where id = '${p.id}'`))[0];
  ok(kopf.am_zug === B, 'Kopfzeile (Realtime) zeigt: B ist dran');
  let pb = await rpc(B, 'kampf_ansicht', [p.id]);
  ok(pb.dran && pb.frage, 'B hat eine Frage');
  pb = await rpc(B, 'kampf_aufgeben', [p.id]);
  ok(pb.ergebnis === 'niederlage' && pb.belohnung.xp === 0, 'Aufgeben: B verliert ohne Belohnung');
  const pa = await rpc(A, 'kampf_ansicht', [p.id]);
  ok(pa.ergebnis === 'sieg' && pa.belohnung.xp === 50, 'A gewinnt: ' + JSON.stringify(pa.belohnung));

  console.log('\n== Zugfrage: Timer, Rechenfragen, Wiederholungen');
  const rech = (await su('select _frage_rechnen() f from generate_series(1, 300)')).rows.map(r => r.f);
  const bitsVon = tk => parseInt(tk.replace(/\s/g, ''), 2);
  const rechnetRichtig = f => { const [, art, x] = f.id.split('-'), n = +x, l = f.optionen[f.richtig];
    return art === 'bin2dez' ? +l === n : art === 'dez2bin' ? bitsVon(l) === n : art === 'hex2dez' ? +l === n : art === 'dez2hex' ? parseInt(l, 16) === n
      : art === 'zk2bin' ? bitsVon(l) === 256 - n : art === 'zk2dez' ? +l === n - 256 : false; };
  ok(rech.every(f => f.optionen.length === 4 && new Set(f.optionen).size === 4 && f.richtig >= 0 && f.richtig < 4), 'Rechenfragen: immer 4 verschiedene Optionen');
  ok(rech.every(rechnetRichtig), 'Rechenfragen: markierte Lösung stimmt nachgerechnet (300 Stück)');
  ok(new Set(rech.map(f => f.id.split('-')[1])).size === 6, 'Rechenfragen: alle 6 Arten kommen vor');
  let tk = fr;
  ok(await rpc(A, 'kampf_frage_start', [tk.id]) === 20, 'Timer startet mit 20 s');
  ok((await rpc(A, 'kampf_ansicht', [tk.id])).frage_rest === 20, 'Ansicht nennt die Restzeit');
  await su("update kampf_zustand set st = st || jsonb_build_object('frage_ab', extract(epoch from now()) - 30) where kampf_id = $1", [tk.id]);
  tk = await rpc(A, 'kampf_antwort', [tk.id, await loesungK(tk)]);
  ok(tk.antwort.ok === false && tk.antwort.zu_spaet === true && tk.phase === 'spielen', 'Richtige Antwort nach 30 s zählt als falsch');
  tk = await rpc(A, 'kampf_zug_beenden', [tk.id]);
  if (tk.status === 'laeuft') {
    tk = await rpc(A, 'kampf_antwort', [tk.id, -1]);
    ok(tk.antwort.ok === false && tk.antwort.zu_spaet === true, 'Zeit abgelaufen (Wahl −1) zählt als falsch');
    tk = await rpc(A, 'kampf_zug_beenden', [tk.id]);
  }
  if (tk.status === 'laeuft') {
    await su("update kampf_zustand set st = st || jsonb_build_object('frage', _frage_rechnen()) where kampf_id = $1", [tk.id]);
    tk = await rpc(A, 'kampf_ansicht', [tk.id]);
    ok(typeof tk.frage === 'object' && tk.frage.text && tk.frage.optionen.length === 4 && !('richtig' in tk.frage) && !('erklaerung' in tk.frage), 'Rechenfrage in der Ansicht ohne Lösung');
    await rpc(A, 'kampf_frage_start', [tk.id]);
    tk = await rpc(A, 'kampf_antwort', [tk.id, await loesungK(tk)]);
    ok(tk.antwort.ok === true && typeof tk.antwort.richtig === 'number' && tk.antwort.erklaerung, 'Rechenfrage richtig beantwortet, Erklärung kommt mit');
  }
  const zl = (await su('select zuletzt_fragen z from spieler_konto where user_id = $1', [A])).rows[0].z;
  ok(zl.length > 5 && zl.length <= 80, 'Zuletzt gestellte Fragen werden gemerkt (' + zl.length + ')');
  await su("update spieler_konto set zuletzt_fragen = (select array_agg(id) from spiel_fragen where id <> (select min(id) from spiel_fragen)) where user_id = $1", [A]);
  const wz = await rpc(A, 'kampf_starten', [null, null, 'leicht']);
  ok(typeof wz.frage === 'object' || wz.frage === (await su('select min(id) m from spiel_fragen')).rows[0].m, 'Neue Zugfrage meidet die zuletzt gestellten');
  console.log('\n== Quiz-Millionär');
  let m = await rpc(A, 'mio_starten');
  const j = await rpc(A, 'mio_joker', [m.id, 'fifty']);
  ok(Array.isArray(j.weg) && j.weg.length >= 1 && !j.weg.includes(await loesung(m.frage)), '50/50 entfernt nur falsche: ' + JSON.stringify(j.weg));
  await darfNicht(A, `select mio_joker('${m.id}', 'fifty')`, '50/50 nur einmal');
  const ex = await rpc(A, 'mio_joker', [m.id, 'experte']);
  ok(typeof ex.vorschlag === 'number' && ex.sicher >= 70, 'Expertenhilfe: ' + JSON.stringify(ex));
  const we = await rpc(A, 'mio_joker', [m.id, 'wechsel']);
  ok(we.frage && we.frage !== m.frage, 'Frage wechseln'); m.frage = we.frage;
  await darfNicht(B, `select mio_antwort('${m.id}', 0)`, 'Fremde Sitzung nicht spielbar');
  for (let i = 0; i < 9; i++) { m = Object.assign(m, await rpc(A, 'mio_antwort', [m.id, await loesung(m.frage)])); }
  ok(m.beendet && m.gewinn === 300 && m.belohnung.titel === 'Quiz-Millionär', 'Alle 9 richtig: 300 XP + Titel');
  m = await rpc(A, 'mio_starten');
  for (let i = 0; i < 4; i++) m = Object.assign(m, await rpc(A, 'mio_antwort', [m.id, await loesung(m.frage)]));
  const falsch = await rpc(A, 'mio_antwort', [m.id, ((await loesung(m.frage)) + 1) % 2]);
  ok(falsch.ok === false && falsch.gewinn === 30, 'Falsch in Stufe 5 → Sicherheitsstufe 30 XP (' + falsch.gewinn + ')');
  m = await rpc(A, 'mio_starten'); m = Object.assign(m, await rpc(A, 'mio_antwort', [m.id, await loesung(m.frage)]));
  const aus = await rpc(A, 'mio_aussteigen', [m.id]);
  ok(aus.gewinn === 10, 'Aussteigen nach 1 richtig: 10 XP');

  console.log('\n== Bomben-Quiz');
  let r = await rpc(A, 'bombe_erstellen');
  ok(r.code.length === 4 && r.status === 'lobby', 'Raum ' + r.code);
  await darfNicht(C, `select bombe_beitreten('${r.code}')`, 'Fremde Klasse kann nicht beitreten');
  await darfNicht(B, `select bombe_pruefen('${r.id}')`, 'Nicht-Mitglied sieht Raum nicht');
  await rpc(B, 'bombe_beitreten', [r.code.toLowerCase()]);
  await darfNicht(B, `select bombe_starten('${r.id}')`, 'Nur Host startet');
  r = await rpc(A, 'bombe_starten', [r.id]);
  ok(r.status === 'laeuft' && r.bombe_bei && r.frage_id && !('explodiert_um' in r), 'Läuft, Explosionszeit nicht in der Ansicht');
  const t = (await su('select extract(epoch from explodiert_um - now()) s from bomben_geheim where raum_id = $1', [r.id])).rows[0].s;
  ok(t >= 20 && t <= 45, 'Explosion in ' + Math.round(t) + ' s (20–45)');
  const halter = r.bombe_bei, anderer = halter === A ? B : A;
  await darfNicht(anderer, `select bombe_antwort('${r.id}', ${r.frage_nr}, 0)`, 'Nur wer die Bombe hat, antwortet');
  r = await rpc(halter, 'bombe_antwort', [r.id, r.frage_nr, await loesung(r.frage_id)]);
  ok(r.bombe_bei === anderer && r.antwort.ok, 'Richtig → Bombe weitergegeben');
  r = await rpc(anderer, 'bombe_antwort', [r.id, r.frage_nr, ((await loesung(r.frage_id)) + 1) % 2]);
  ok(r.bombe_bei === anderer && r.gesperrt_bis, 'Falsch → Bombe bleibt, 2 s Sperre');
  await darfNicht(anderer, `select bombe_antwort('${r.id}', ${r.frage_nr}, 0)`, 'Sperre greift');
  let runden = 0;
  while (r.status !== 'fertig' && runden < 10) {
    runden++;
    await su("update bomben_geheim set explodiert_um = now() - interval '1 second' where raum_id = $1", [r.id]);
    r = await rpc(A, 'bombe_pruefen', [r.id]);
    if (r.status === 'boom') {
      ok(r.letzte.art === 'boom', 'Boom bei ' + (r.letzte.opfer === A ? 'A' : 'B') + ', Leben ' + JSON.stringify(r.leben));
      const zu = await rpc(B, 'bombe_weiter', [r.id]);
      if (runden === 1) ok(zu.status === 'boom', 'Weiter erst nach 3,5 s Pause');
      await su("update bomben_raeume set letzte = jsonb_set(letzte, '{zeit}', to_jsonb(now() - interval '5 seconds')) where id = $1", [r.id]);
      r = await rpc(B, 'bombe_weiter', [r.id]);
    }
  }
  ok(r.status === 'fertig' && r.sieger, 'Spiel vorbei, Sieger ' + (r.sieger === A ? 'A' : 'B'));
  const erg = (await su("select user_id, ergebnis, xp from spiel_ergebnisse where spiel = 'bombe'")).rows;
  ok(erg.length === 2, 'Beide bekommen ein Ergebnis: ' + erg.map(e => e.ergebnis + ' ' + e.xp).join(', '));

  console.log('\n== Wissens-Arena');
  let a = await rpc(A, 'arena_herausfordern', [B]);
  await darfNicht(A, `select arena_herausfordern('${B}')`, 'Doppelte Herausforderung abgelehnt');
  await darfNicht(A, `select arena_annehmen('${a.id}')`, 'Herausforderer kann nicht selbst annehmen');
  a = await rpc(B, 'arena_annehmen', [a.id]);
  ok(a.status === 'laeuft' && a.runde === 1 && a.frage_id, 'Angenommen, Runde 1');
  await darfNicht(A, `select arena_antwort('${a.id}', 1, 0)`, 'Antwort vor Rundenstart abgelehnt');
  for (let rd = 1; rd <= 5 && a.status === 'laeuft'; rd++) {
    await su("update arena_matches set runde_start = now() - interval '2 seconds', runde_ende = now() + interval '18 seconds' where id = $1", [a.id]);
    const l = await loesung(a.frage_id);
    const x = await rpc(A, 'arena_antwort', [a.id, a.runde, l]);
    if (rd === 1) ok(x.antwort.ok && x.antwort.schaden === 14 && x.hp_b === 50, 'A schnell richtig: 14 Schaden (noch nicht angewendet)');
    a = await rpc(B, 'arena_antwort', [a.id, a.runde, rd % 2 ? (l + 1) % 2 : l]);
    if (rd === 1) ok(a.runde === 2 && a.hp_b === 36 && a.hp_a === 50 && a.verlauf.length === 1, 'Runde aufgelöst: B 36, A 50');
  }
  ok(a.status === 'fertig' && a.ergebnis === 'a', `Arena vorbei: ${a.hp_a}:${a.hp_b}, Rangpunkte A ${a.rp_a}, B ${a.rp_b}`);
  const rl = await rpc(A, 'arena_rangliste').catch(() => null);
  const rl2 = await als(A, 'select * from arena_rangliste()');
  ok(rl2.find(x => x.spitzname === 'Anna').rang_punkte === 25 && rl2.find(x => x.spitzname === 'Ben').rang_punkte === 0, 'Rangliste: Anna 25, Ben 0 (nicht negativ)');
  ok(!rl2.some(x => x.spitzname === 'Cem'), 'Rangliste nur eigene Klasse');
  // Zeitüberschreitung
  a = await rpc(A, 'arena_herausfordern', [B]); a = await rpc(B, 'arena_annehmen', [a.id]);
  await su("update arena_matches set runde_start = now() - interval '30 seconds', runde_ende = now() - interval '5 seconds' where id = $1", [a.id]);
  a = await rpc(A, 'arena_pruefen', [a.id]);
  ok(a.runde === 2 && a.verlauf[0].a.ok === false, 'Keine Antwort bis Rundenende → Runde zählt als falsch');
  // Warteschlange
  ok(await rpc(A, 'arena_suchen') === null, 'Suchen: A wartet');
  const q = await rpc(B, 'arena_suchen');
  ok(q && q.status === 'laeuft' && q.spieler_a === A, 'Suchen: B trifft auf A');
  ok(await rpc(C, 'arena_suchen') === null, 'C (andere Klasse) findet A/B nicht');

  console.log('\n== XP abholen');
  const x1 = await rpc(A, 'spiel_xp_abholen'), x2 = await rpc(A, 'spiel_xp_abholen');
  ok(x1 > 0 && x2 === 0, 'XP einmalig abholbar: ' + x1);
  const ka = await rpc(A, 'spiel_konto');
  ok(ka.letzte.length === 7 && ka.coins > 0, 'Konto: ' + ka.coins + ' Coins, ' + ka.booster + ' Booster, letzte Spiele: ' + ka.letzte.length);

  console.log('\n== Arena gegen KI');
  const rpA = (await rpc(A, 'spiel_konto')).rang_punkte;
  let ak = await rpc(A, 'arena_gegen_ki', ['schwer']);
  ok(ak.status === 'laeuft' && ak.spieler_b === null && ak.ki.name && !('ki_plan' in ak), 'KI-Match läuft, Plan geheim: ' + ak.ki.name);
  await darfNicht(B, `select arena_pruefen('${ak.id}')`, 'Fremde sehen das KI-Match nicht');
  await darfNicht(A, `select _arena_ki('${ak.id}')`, 'KI-Zug nicht direkt aufrufbar');
  for (let rd = 1; rd <= 5 && ak.status === 'laeuft'; rd++) {
    await su("update arena_matches set runde_start = now() - interval '20 seconds', runde_ende = now() + interval '1 second' where id = $1", [ak.id]);
    ak = await rpc(A, 'arena_antwort', [ak.id, ak.runde, await loesung(ak.frage_id)]);
    ak = await rpc(A, 'arena_pruefen', [ak.id]);
  }
  ok(ak.status === 'fertig' && ak.verlauf.every(v => v.b && v.b.ms != null), 'KI hat jede Runde geantwortet, Ergebnis ' + ak.ergebnis + ' (' + ak.hp_a + ':' + ak.hp_b + ')');
  const kk = await rpc(A, 'spiel_konto');
  ok(kk.rang_punkte === rpA && ak.rp_a === 0, 'Keine Rangpunkte gegen KI');
  const ek = (await su("select xp, details from spiel_ergebnisse where user_id = $1 and spiel = 'arena' order by erstellt desc limit 1", [A])).rows[0];
  ok(ek.details.ki === true && ek.xp <= 30, 'Halbe Belohnung gegen KI: ' + ek.xp + ' XP');

  console.log('\n== Bomben-Quiz mit KI');
  let rb = await rpc(A, 'bombe_erstellen');
  await darfNicht(A, `select bombe_starten('${rb.id}')`, 'Allein ohne Bots nicht startbar');
  rb = await rpc(A, 'bombe_bot_hinzu', [rb.id]); rb = await rpc(A, 'bombe_bot_hinzu', [rb.id]);
  ok(rb.spieler.length === 3 && rb.bots.length === 2 && rb.namen[rb.bots[0].id].ki, 'Zwei KI-Mitspieler: ' + rb.bots.map(b => b.n).join(', '));
  rb = await rpc(A, 'bombe_bot_weg', [rb.id]); rb = await rpc(A, 'bombe_bot_hinzu', [rb.id]);
  rb = await rpc(A, 'bombe_starten', [rb.id]);
  let schritte = 0, botLetzte = null;
  while (rb.status !== 'fertig' && schritte++ < 400) {
    if (rb.status === 'boom') { await su("update bomben_raeume set letzte = jsonb_set(letzte, '{zeit}', to_jsonb(now() - interval '5 seconds')) where id = $1", [rb.id]); rb = await rpc(A, 'bombe_weiter', [rb.id]); continue; }
    if (rb.bombe_bei === A) {
      await su("update bomben_raeume set gesperrt_bis = null where id = $1", [rb.id]);
      rb = await rpc(A, 'bombe_antwort', [rb.id, rb.frage_nr, await loesung(rb.frage_id)]);
    } else {
      await su("update bomben_geheim set bot_bis = now() - interval '1 second' where raum_id = $1 and bot_bis is not null", [rb.id]);
      if (schritte % 6 === 0) await su("update bomben_geheim set explodiert_um = now() - interval '1 second' where raum_id = $1", [rb.id]);
      rb = await rpc(A, 'bombe_pruefen', [rb.id]);
      if (rb.letzte && rb.letzte.wahl != null && rb.letzte.von !== A && rb.letzte.wer !== A) botLetzte = rb.letzte;
    }
  }
  const botZug = botLetzte;
  ok(botZug && botZug.wahl != null && botZug.richtig != null && botZug.frage, 'Bot-Antwort sichtbar: letzte enthält frage, wahl, richtig (' + JSON.stringify(botZug && {wahl: botZug.wahl, richtig: botZug.richtig, ok: botZug.ok}) + ')');
  ok(rb.status === 'fertig' && rb.sieger, 'Spiel mit Bots endet (' + schritte + ' Schritte), Sieger: ' + (rb.namen[rb.sieger] || {}).n);
  const eb = (await su("select user_id, xp, details from spiel_ergebnisse where spiel = 'bombe' and (details->>'ki')::boolean")).rows;
  ok(eb.length === 1 && eb[0].user_id === A && eb[0].xp <= 20, 'Nur der Mensch wird belohnt, halbiert: ' + (eb[0] || {}).xp + ' XP');
  let rv = await rpc(A, 'bombe_erstellen'); rv = await rpc(A, 'bombe_bot_hinzu', [rv.id]);
  await rpc(A, 'bombe_verlassen', [rv.id]);
  ok((await su("select count(*)::int n from bomben_raeume where id = $1", [rv.id])).rows[0].n === 0, 'Raum nur mit Bots wird beim Verlassen gelöscht');

  console.log('\n== Admin-Reset');
  await su("update profile set admin = true where id = $1", [A]);
  await rpc(A, 'admin_reset_nutzer', [B]);
  ok((await su("select count(*)::int n from spieler_konto where user_id = $1", [B])).rows[0].n === 0, 'Reset löscht Spieldaten von B');
  await rpc(A, 'admin_reset_alle');
  ok((await su("select count(*)::int n from spiel_ergebnisse")).rows[0].n === 0, 'Reset aller löscht Ergebnisse');

  console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle Tests bestanden');
  process.exit(fehler ? 1 : 0);
})().catch(e => { console.error('ABBRUCH:', e.message, e.where || ''); process.exit(1); });
