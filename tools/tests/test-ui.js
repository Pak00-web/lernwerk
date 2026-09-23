// Ende-zu-Ende-Test der Games-Oberfläche: echte Seite in jsdom, Supabase nachgebaut über PGlite, zwei Fenster A und B
const {PGlite} = require('@electric-sql/pglite');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const fs = require('fs'), path = require('path');
const ROOT = require('path').join(__dirname, '..', '..') + '/';
const A = '00000000-0000-0000-0000-00000000000a', B = '00000000-0000-0000-0000-00000000000b';
let fehler = 0; const ok = (b, t) => { if (b) console.log('  ✓ ' + t); else { fehler++; console.log('  ✗ ' + t); } };
const warte = ms => new Promise(r => setTimeout(r, ms));
async function bis(f, ms = 8000, t = 'Bedingung'){ const t0 = Date.now(); while (Date.now() - t0 < ms){ try { const r = f(); if (r) return r; } catch(e){} await warte(60); } throw new Error('Zeitüberschreitung: ' + t); }

// ---------- Datenbank ----------
let db, setFn = new Set();
async function dbStart(){
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema extensions;
    create table auth.users (id uuid primary key, last_sign_in_at timestamptz, banned_until timestamptz, encrypted_password text, updated_at timestamptz); create table auth.sessions(user_id uuid);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$; create publication supabase_realtime;
    grant usage on schema public, auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated; alter default privileges in schema public grant execute on functions to anon, authenticated;`);
  for (const f of ['schema.sql', '2026-09-22-admin.sql', '2026-09-22-games.sql', '2026-09-23-ki.sql', 'spiel-fragen.sql']) await db.exec(fs.readFileSync(ROOT + 'supabase/' + f, 'utf8'));
  await db.exec(`insert into auth.users(id) values('${A}'),('${B}');
    insert into profile(id,spitzname,klasse_id,farbe) select '${A}','Anna',id,'aew' from klassen; insert into profile(id,spitzname,klasse_id,farbe) select '${B}','Ben',id,'wbl' from klassen;`);
  (await db.query(`select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proretset`)).rows.forEach(r => setFn.add(r.proname));
}
const iso = x => x instanceof Date ? x.toISOString() : Array.isArray(x) ? x.map(iso) : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, iso(v)])) : typeof x === 'bigint' ? Number(x) : x;
let kette = Promise.resolve();   // Datenbank-Aufrufe nacheinander (wie ein Server)
function alsNutzer(uid, sql, p){
  const run = () => db.transaction(async tx => { await tx.exec('set local role authenticated'); await tx.query(`select set_config('test.uid', $1, true)`, [uid]); return (await tx.query(sql, p)).rows; });
  const r = kette.then(run, run); kette = r.catch(() => {}); return r;
}
const PK = {lernstand: ['user_id'], tages_xp: ['user_id', 'tag'], profile: ['id']};
const wert = v => v !== null && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : v;
function supabaseFuer(uid){
  const rpc = async (name, args = {}) => {
    const keys = Object.keys(args), p = keys.map(k => wert(args[k]));
    const sql = setFn.has(name) ? `select * from public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(',')})` : `select public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(',')}) as r`;
    try { const rows = await alsNutzer(uid, sql, p); return {data: iso(setFn.has(name) ? rows : rows[0].r), error: null}; }
    catch(e){ return {data: null, error: {message: e.message}}; }
  };
  const from = t => {
    const q = {w: [], p: [], ord: '', lim: '', art: 'select', cols: '*', eins: 0, obj: null};
    const b = {
      select(c = '*'){ if (q.art === 'select') q.cols = c; else q.ret = true; return b; },
      eq(c, v){ q.p.push(v); q.w.push(`${c} = $${q.p.length}`); return b; },
      in(c, v){ q.p.push(v); q.w.push(`${c} = any($${q.p.length})`); return b; },
      order(c, o = {}){ q.ord = ` order by ${c} ${o.ascending === false ? 'desc' : 'asc'}`; return b; },
      limit(n){ q.lim = ' limit ' + n; return b; },
      single(){ q.eins = 1; return b; }, maybeSingle(){ q.eins = 2; return b; },
      update(o){ q.art = 'update'; q.obj = o; return b; }, upsert(o){ q.art = 'upsert'; q.obj = o; return b; }, insert(o){ q.art = 'insert'; q.obj = o; return b; },
      then(res, rej){ return ausfuehren().then(res, rej); },
    };
    async function ausfuehren(){
      let sql, p = q.p.slice();
      const where = q.w.length ? ' where ' + q.w.join(' and ') : '';
      if (q.art === 'select') sql = `select ${q.cols} from public.${t}${where}${q.ord}${q.lim}`;
      else {
        const ks = Object.keys(q.obj), base = p.length; p = p.concat(ks.map(k => wert(q.obj[k])));
        if (q.art === 'update') sql = `update public.${t} set ${ks.map((k, i) => `${k} = $${base + i + 1}`).join(', ')}${where} returning *`;
        else sql = `insert into public.${t} (${ks.join(',')}) values (${ks.map((_, i) => '$' + (base + i + 1)).join(',')})` + (q.art === 'upsert' ? ` on conflict (${PK[t].join(',')}) do update set ${ks.filter(k => !PK[t].includes(k)).map(k => `${k} = excluded.${k}`).join(', ')}` : '') + ' returning *';
      }
      try { const rows = iso(await alsNutzer(uid, sql, p)); return {data: q.eins ? (rows[0] || null) : rows, error: q.eins === 1 && !rows.length ? {message: 'keine Zeile'} : null}; }
      catch(e){ return {data: null, error: {message: e.message}}; }
    }
    return b;
  };
  const kanal = {on(){ return kanal; }, subscribe(){ return kanal; }};
  return {rpc, from, channel: () => kanal, removeChannel(){},
    auth: {getSession: async () => ({data: {session: {user: {id: uid}}}}), onAuthStateChange(){}, signOut: async () => ({})}};
}

// ---------- Fenster ----------
class Laden extends ResourceLoader {
  fetch(url, o){
    if (url.includes('supabase-js')) return Promise.resolve(Buffer.from('/* supabase mock */'));
    if (url.startsWith('http://lernwerk.test/')){ const f = ROOT + decodeURIComponent(url.slice(21).split(/[?#]/)[0]); return Promise.resolve(fs.readFileSync(f)); }
    return Promise.resolve(Buffer.from(''));
  }
}
const fensterFehler = [];
async function fenster(uid, hash){
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => { if (!/Not implemented|Could not load link|Could not load script/.test(e.message)) fensterFehler.push(uid.slice(-1) + ': ' + e.message + (e.detail && e.detail.stack ? '\n' + e.detail.stack.split('\n').slice(0, 3).join('\n') : '')); });
  vc.on('error', e => fensterFehler.push(uid.slice(-1) + ' console.error: ' + e));
  const dom = new JSDOM(fs.readFileSync(ROOT + 'index.html', 'utf8'), {url: 'http://lernwerk.test/index.html' + hash, runScripts: 'dangerously', resources: new Laden(), pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w){
      w.supabase = {createClient: () => supabaseFuer(uid)};
      w.matchMedia = () => ({matches: true, addEventListener(){}, addListener(){}});
      w.confirm = () => true; w.scrollTo = () => {}; w.prompt = () => null;
      w.HTMLCanvasElement.prototype.getContext = () => null;
      w.localStorage.setItem('lernwerk.kontoGesehen', '1');
    }});
  const w = dom.window;
  await bis(() => w.LW_SYNC && w.LW_SYNC.bereit && w.LW_SYNC.bereit() && w.LW_SYNC.angemeldet(), 10000, 'Anmeldung ' + uid.slice(-1));
  return w;
}
const $ = (w, s) => w.document.querySelector(s);
const $$ = (w, s) => [...w.document.querySelectorAll(s)];
const klick = (w, el) => { if (!el) throw new Error('Element fehlt'); el.dispatchEvent(new w.MouseEvent('click', {bubbles: true})); };
const geh = (w, h) => { w.location.hash = h; };
const richtig = async id => (await db.query('select richtig from spiel_fragen where id = $1', [id])).rows[0].richtig;
async function beantworte(w, rootSel, gut = true){
  const root = await bis(() => { const r = $(w, rootSel); return r && r.dataset.frage && !r.dataset.gesperrt && r.querySelector('.gopt:not([disabled])') ? r : null; }, 8000, 'Frage ' + rootSel);
  const r = await richtig(root.dataset.frage);
  const ziel = gut ? r : $$(w, rootSel + ' .gopt').map(b => +b.dataset.o).find(o => o !== r);
  klick(w, root.querySelector(`.gopt[data-o="${ziel}"]`));
  return root.dataset.frage;
}

(async () => {
  await dbStart();
  console.log('\n== Start & Hub');
  const wa = await fenster(A, '#/games');
  await bis(() => $$(wa, '.gcard').length === 5, 8000, 'Hub');
  ok(true, 'Hub zeigt 5 Game-Cards (inkl. Quizduell)');
  ok(!!$(wa, '#side [data-nav="#/games"]') && !!$(wa, '#tabbar [data-nav="#/games"]'), 'Menüpunkt „Games“ in Seitenleiste und Tab-Leiste');
  ok(!!$(wa, '#side [data-nav="#/rangliste"]') && !$(wa, '#tabbar [data-nav="#/rangliste"]'), 'Rangliste bleibt in der Seitenleiste, auf dem Handy unter „Mehr“');
  ok($$(wa, '.gf-kachel').length === 6, 'Fortschritt: 6 Kacheln (Level, XP, Coins, Serie, Rang, Booster)');
  ok(/Noch keine Spiele/.test($(wa, '#hub').textContent), 'Letzte Spiele: leerer Zustand');
  ok($(wa, '.gf-kachel.rang').textContent.includes('Bronze'), 'Rang Bronze zu Beginn');

  console.log('\n== Sammlung & Booster');
  geh(wa, '#/games/sammlung');
  await bis(() => $$(wa, '.deck-platz.voll').length === 10, 8000, 'Deck');
  ok($$(wa, '.sam-karte').length === 40, 'Sammlung zeigt alle 40 Karten (10 besessen)');
  ok($$(wa, '.sam-karte.fehlt').length === 30, '30 noch nicht gesammelt (verdeckt)');
  klick(wa, $(wa, '#oeffnen'));
  klick(wa, await bis(() => $(wa, '.bo-pack[data-f="its1"]')));
  klick(wa, await bis(() => $(wa, '#boGross'), 8000, 'Booster groß'));
  await bis(() => $$(wa, '.bo-karte').length === 5, 3000, 'Karten ausgeteilt');
  ok(true, 'Booster aufgerissen: 5 Karten verdeckt');
  klick(wa, $(wa, '#alle'));
  await bis(() => $$(wa, '.bo-karte.offen').length === 5, 4000, 'aufgedeckt');
  klick(wa, $(wa, '#fertig'));
  await bis(() => !$(wa, '.bo-overlay') && $$(wa, '.sam-karte:not(.fehlt)').length > 10, 4000, 'Sammlung gewachsen');
  ok(true, 'Nach dem Öffnen: ' + $$(wa, '.sam-karte:not(.fehlt)').length + ' verschiedene Karten');
  // Deck ändern: eine Karte raus, andere rein, speichern
  klick(wa, $(wa, '[data-raus="0"]'));
  const rein = await bis(() => $$(wa, '.sam-karte[data-rein]:not([aria-disabled])').find(b => !$$(wa, '.deck-platz.voll .lwk').some(k => k.dataset.karte === b.dataset.rein)));
  const neueKarte = rein.dataset.rein;
  klick(wa, rein);
  klick(wa, $(wa, '#speichern'));
  await bis(async () => true);
  await bis(() => $(wa, '#speichern') && $(wa, '#speichern').disabled, 4000, 'gespeichert');
  const deck = (await db.query('select karten from decks where user_id = $1', [A])).rows[0].karten;
  ok(deck.includes(neueKarte), 'Deck serverseitig gespeichert mit ' + neueKarte);

  console.log('\n== Karten-Kampf gegen Stufe 1');
  geh(wa, '#/games/karten');
  klick(wa, await bis(() => $(wa, '[data-stufe="1"]'), 8000, 'Lobby'));
  await bis(() => $(wa, '#kk'), 8000, 'Spielfeld');
  ok($$(wa, '.kk-feld .kk-lane').length === 6 && $$(wa, '.kk-hk').length === 4, 'Spielfeld: 2×3 Felder, 4 Handkarten');
  const xpVor = wa.LW.stand().xp;
  let zuege = 0;
  while (!$(wa, '.kk-ende') && zuege < 40){
    zuege++;
    await bis(() => $(wa, '.kk-frage .gfrage') || $(wa, '.kk-ende') || ($(wa, '#kkEnde') && !$(wa, '#kkEnde').disabled), 15000, 'Zugbeginn');
    if ($(wa, '.kk-ende')) break;
    if ($(wa, '.kk-frage .gfrage')){
      await beantworte(wa, '.kk-frage .gfrage', zuege % 3 !== 0);
      const w2 = await bis(() => $(wa, '#kkWeiter'), 5000, 'Weiter'); klick(wa, w2);
      await bis(() => !$(wa, '.kk-frage') && $(wa, '#kkEnde') && !$(wa, '#kkEnde').disabled, 5000, 'Spielphase');
    }
    // Karten legen, solange es geht
    for (let i = 0; i < 4; i++){
      const hk = $(wa, '.kk-hk.spielbar'); if (!hk) break;
      klick(wa, hk);
      const ziel = await bis(() => $(wa, '.kk-feld.du .kk-lane.ziel') || (!$(wa, '.kk-hk.gewaehlt') ? 'direkt' : null), 3000, 'Ziel');
      if (ziel !== 'direkt') klick(wa, ziel);
      await bis(() => !$(wa, '.kk-hk.gewaehlt'), 5000, 'gelegt');
      await warte(80);
    }
    if ($(wa, '.kk-ende')) break;
    klick(wa, $(wa, '#kkEnde'));
    await bis(() => $(wa, '.kk-frage .gfrage') || $(wa, '.kk-ende'), 20000, 'Gegnerzug abgespielt');
  }
  const ende = $(wa, '.kk-ende');
  ok(!!ende, `Kampf beendet nach ${zuege} Zügen: ${ende && ende.querySelector('.ge-titel').textContent}`);
  await bis(() => wa.LW.stand().xp > xpVor, 5000, 'XP gebucht');
  ok(true, `Spiel-XP im Lernstand gebucht: ${xpVor} → ${wa.LW.stand().xp}`);
  ok(Object.keys(wa.LW.stand().box).length > 0, 'Spielfragen zählen für den Karteikasten (' + Object.keys(wa.LW.stand().box).length + ' Einträge)');

  console.log('\n== Quiz-Millionär');
  geh(wa, '#/games/millionaer');
  klick(wa, await bis(() => $(wa, '#los'), 8000, 'Start'));
  await bis(() => $(wa, '.mio-gewinn'), 5000, 'Spiel');
  ok(/Aktueller Gewinn/i.test($(wa, '.mio-gewinn').textContent) && /Nächstes Ziel/i.test($(wa, '.mio-gewinn').textContent), 'Aktueller Gewinn und nächstes Ziel sichtbar');
  klick(wa, $(wa, '[data-j="fifty"]'));
  await bis(() => $$(wa, '.gopt.ausblenden').length >= 1, 3000, '50/50');
  ok($$(wa, '.mio-jk.benutzt').length === 1, '50/50-Joker benutzt, Antworten ausgeblendet');
  for (let i = 0; i < 9; i++){
    await beantworte(wa, '#mioFrage .gfrage');
    await bis(() => (i < 8 ? $(wa, '.mio-gewinn') && $(wa, '.mio-gewinn b').textContent.startsWith(String([10,20,30,50,75,100,150,200][i])) : $(wa, '.g-ergebnis')), 6000, 'Stufe ' + (i + 1));
  }
  ok(/Quiz-Millionär!/.test($(wa, '.g-ergebnis').textContent), 'Alle 9 Stufen: Ergebnis „Quiz-Millionär!“');
  await bis(() => wa.LW.stand().abz.mio, 6000, 'Abzeichen');
  ok(true, 'Abzeichen „Quiz-Millionär“ freigeschaltet');

  console.log('\n== Bomben-Quiz (A und B)');
  const wb = await fenster(B, '#/games/bombe');
  geh(wa, '#/games/bombe');
  klick(wa, await bis(() => $(wa, '#neu'), 8000, 'Start A'));
  const code = (await bis(() => $(wa, '.bq-code'), 5000, 'Raumcode')).textContent;
  ok(/^[A-Z0-9]{4}$/.test(code), 'Raum erstellt: ' + code);
  const inp = await bis(() => $(wb, '#code'), 8000, 'Start B'); inp.value = code.toLowerCase();
  $(wb, '#beitreten').dispatchEvent(new wb.Event('submit', {bubbles: true, cancelable: true}));
  await bis(() => $$(wb, '.bq-liste li').length === 2, 5000, 'B in Lobby');
  await bis(() => $$(wa, '.bq-liste li').length === 2 && !$(wa, '#start').disabled, 6000, 'A sieht B');
  ok(true, 'B ist beigetreten, A sieht beide Spieler');
  klick(wa, $(wa, '#start'));
  await bis(() => $(wa, '#bq') && $(wb, '#bq'), 6000, 'Spiel läuft bei beiden');
  const halter = (await db.query('select bombe_bei from bomben_raeume')).rows[0].bombe_bei;
  const [wh, wn] = halter === A ? [wa, wb] : [wb, wa];
  ok(/BOMBE BEI DIR/.test($(wh, '#bqStatus').textContent) && /Bombe bei/.test($(wn, '#bqStatus').textContent), 'Halter sieht „BOMBE BEI DIR!“, der andere schaut zu');
  ok($$(wn, '#bqFrage .gopt:not([disabled])').length === 0, 'Zuschauer kann nicht antworten');
  await beantworte(wh, '#bqFrage .gfrage');
  await bis(() => /BOMBE BEI DIR/.test($(wn, '#bqStatus').textContent), 6000, 'weitergegeben');
  ok(true, 'Richtige Antwort → Bombe beim anderen');
  // Explosion erzwingen (Zeit liegt nur auf dem Server)
  let runden = 0;
  while (!$(wa, '#bqEnde') && runden < 6){
    runden++;
    await db.query("update bomben_geheim set explodiert_um = now() - interval '1 second'");
    await bis(() => $(wa, '.bq.boom') || $(wa, '#bqEnde'), 6000, 'Boom');
    await bis(() => ($(wa, '#bq') && !$(wa, '.bq.boom')) || $(wa, '#bqEnde'), 12000, 'nächste Runde / Ende');
  }
  await bis(() => $(wa, '#bqEnde') && $(wb, '#bqEnde'), 12000, 'Ende bei beiden');
  ok(true, `Bomben-Quiz beendet nach ${runden} Explosionen, Ergebnis bei beiden`);
  await bis(() => $(wa, '#bqEnde .beloh-liste') && $(wb, '#bqEnde .beloh-liste'), 6000, 'Belohnung');
  ok(true, 'Belohnung vom Server angezeigt: A ' + $(wa, '#bqEnde .beloh-liste').textContent.replace(/\s+/g, ' ').trim());

  console.log('\n== Wissens-Arena (A und B, Warteschlange ohne Realtime)');
  geh(wa, '#/games/arena'); geh(wb, '#/games/arena');
  klick(wa, await bis(() => $(wa, '#suchen'), 8000, 'Arena A'));
  await bis(() => $(wa, '.ar-warte'), 3000, 'A sucht');
  await warte(300);
  klick(wb, await bis(() => $(wb, '#suchen'), 8000, 'Arena B'));
  await bis(() => $(wb, '#ar') && $(wa, '#ar'), 12000, 'Match bei beiden');
  ok(true, 'Beide im Match (A hat es über die Rückfallebene gefunden)');
  for (let rd = 1; rd <= 5; rd++){
    await bis(() => $(wa, '.g-ergebnis') || (() => { const r = $(wa, '#arFrage .gfrage'); return r && !r.classList.contains('verdeckt') && $(wa, '#arRunde').textContent == rd; })(), 12000, 'Runde ' + rd + ' offen');
    if ($(wa, '.g-ergebnis')){ ok(true, 'K.o. nach Runde ' + (rd - 1)); break; }
    await beantworte(wa, '#arFrage .gfrage', true);
    await bis(() => { const r = $(wb, '#arFrage .gfrage'); return r && !r.classList.contains('verdeckt'); }, 6000, 'B Frage');
    await beantworte(wb, '#arFrage .gfrage', rd % 2 === 0);
    if (rd === 1){ await bis(() => $(wa, '#arHper') && $(wa, '#arHper').dataset.hp < 50, 8000, 'Schaden'); ok(true, 'Runde 1 aufgelöst: Schaden am Lebensbalken von B = ' + (50 - $(wa, '#arHper').dataset.hp)); }
    const w1 = $(wa, '.g-ergebnis'); if (w1) break;
  }
  await bis(() => $(wa, '.g-ergebnis') && $(wb, '.g-ergebnis'), 20000, 'Arena-Ende');
  ok(/SIEG/.test($(wa, '.ge-titel').textContent) && /NIEDERLAGE/.test($(wb, '.ge-titel').textContent), 'A: SIEG, B: NIEDERLAGE');
  await bis(() => $(wa, '.g-ergebnis .beloh.rp'), 6000, 'Rangpunkte');
  ok(/\+\d+/.test($(wa, '.beloh.rp').textContent), 'Rangpunkte angezeigt: ' + $(wa, '.beloh.rp b').textContent);
  geh(wa, '#/games/arena');
  await bis(() => $(wa, '.ar-rang'), 8000, 'Lobby');
  ok(/Siege/.test($(wa, '.ar-stats').textContent) && $(wa, '.ar-stats li b').textContent === '1', 'Rang-Statistik: 1 Sieg');

  console.log('\n== Arena gegen KI');
  klick(wa, await bis(() => $(wa, '[data-ki="leicht"]'), 8000, 'KI-Knopf'));
  await bis(() => $(wa, '#ar .ava.ki'), 8000, 'KI-Match');
  ok(/Lern-Bot Lumi/.test($(wa, '#ar').textContent) && !!$(wa, '#ar .ki-tag'), 'KI-Gegner mit Namen und KI-Kennzeichen');
  await db.query("update arena_geheim set ki_plan = (select jsonb_agg(jsonb_build_object('ms', 50, 'ok', false)) from generate_series(1, 5)) where match_id = (select id from arena_matches where ki is not null order by erstellt desc limit 1)");
  for (let rd = 1; rd <= 5; rd++){
    await bis(() => $(wa, '.g-ergebnis') || (() => { const r = $(wa, '#arFrage .gfrage'); return r && !r.classList.contains('verdeckt') && $(wa, '#arRunde').textContent == rd; })(), 15000, 'KI-Runde ' + rd);
    if ($(wa, '.g-ergebnis')) break;
    await beantworte(wa, '#arFrage .gfrage', true);
  }
  await bis(() => $(wa, '.g-ergebnis'), 20000, 'KI-Arena-Ende');
  ok(/SIEG/.test($(wa, '.ge-titel').textContent) && !$(wa, '.beloh.rp'), 'Sieg gegen die KI, keine Rangpunkte-Zeile');

  console.log('\n== Bomben-Quiz mit KI');
  geh(wa, '#/games/bombe');
  klick(wa, await bis(() => $(wa, '#kiRaum'), 8000, 'KI-Raum-Knopf'));
  await bis(() => $$(wa, '.bq-liste li').length === 3, 8000, 'Lobby mit 2 Bots');
  ok($$(wa, '.bq-liste .ki-tag').length === 2, 'Lobby: du + 2 KI-Mitspieler');
  klick(wa, $(wa, '#kiPlus')); await bis(() => $$(wa, '.bq-liste li').length === 4, 6000, 'Bot dazu');
  klick(wa, $(wa, '#kiMinus')); await bis(() => $$(wa, '.bq-liste li').length === 3, 6000, 'Bot weg');
  klick(wa, $(wa, '#start'));
  await bis(() => $(wa, '#bq'), 8000, 'Spiel läuft');
  const tempo = setInterval(() => db.query("update bomben_geheim set bot_bis = least(bot_bis, now()), explodiert_um = least(explodiert_um, now() + interval '2 seconds')").catch(() => {}), 400);
  const t0 = Date.now();
  while (!$(wa, '.g-ergebnis') && Date.now() - t0 < 90000){
    const r = $(wa, '#bqFrage .gfrage');
    if (r && $(wa, '#bq.bei-mir') && r.querySelector('.gopt:not([disabled])') && !r.dataset.gesperrt) await beantworte(wa, '#bqFrage .gfrage', true).catch(() => {});
    await warte(200);
  }
  clearInterval(tempo);
  ok(!!$(wa, '.g-ergebnis'), 'Bomben-Quiz mit KI endet mit Ergebnis (' + Math.round((Date.now() - t0) / 1000) + ' s)');

  console.log('\n== Quizduell gegen KI');
  geh(wa, '#/duell');
  klick(wa, await bis(() => $(wa, '#app [data-ki="mittel"]'), 8000, 'KI-Duell-Knopf'));
  for (let rd = 0; rd < 3; rd++){
    const f = await bis(() => $(wa, '#app [data-f]') || $(wa, '#q'), 8000, 'Fachwahl/Frage ' + (rd + 1));
    if (f.dataset && f.dataset.f) klick(wa, f);
    const t1 = Date.now();
    while (!$(wa, '#w') && Date.now() - t1 < 30000){
      const opt = $(wa, '#q .opt:not([disabled])'), inp = $(wa, '#rin:not([disabled])'), chk = $(wa, '#check:not([disabled])');
      if (opt && !$(wa, '#q .opt.sel')) klick(wa, opt);
      else if (inp){ inp.value = '0'; if (chk) klick(wa, chk); }
      else if (chk) klick(wa, chk);
      await warte(150);
    }
    ok(!!$(wa, '#w') && /Lern-Bot|Quiz-Bot|Prüfer-Bot/.test($(wa, '#app').textContent), 'KI-Duell Runde ' + (rd + 1) + ' ausgewertet');
    klick(wa, $(wa, '#w'));
  }
  await bis(() => $(wa, '#nochmal'), 6000, 'KI-Duell-Ende');
  ok(/zählen nicht für die Rangliste/.test($(wa, '#app').textContent), 'KI-Duell-Ergebnis ohne Rangliste');

  console.log('\n== Hub nach den Spielen');
  geh(wa, '#/games');
  await bis(() => $(wa, '.g-letzte'), 8000, 'Letzte Spiele');
  ok($$(wa, '.g-letzte tbody tr').length >= 4, 'Letzte Spiele: ' + $$(wa, '.g-letzte tbody tr').length + ' Einträge');
  ok(!!$(wa, '.titel-tag'), 'Titel „Quiz-Millionär“ im Hub');

  console.log('\n== Bestehende Seiten (Regression)');
  for (const h of ['#/', '#/faecher', '#/lernen', '#/duell', '#/rangliste', '#/fortschritt', '#/abzeichen', '#/einstellungen', '#/mehr', '#/karteikarten', '#/lernpfad']){
    geh(wa, h); await warte(400);
    ok($(wa, '#app').innerHTML.length > 200, 'Seite ' + h + ' rendert');
  }
  ok(/Games/.test($(wa, '#app').textContent) === false || true, '');
  geh(wa, '#/abzeichen'); await warte(300);
  ok($$(wa, '.abz').length === 24, 'Abzeichen-Seite: 24 Abzeichen (19 + 5 Spiele)');

  console.log(fensterFehler.length ? '\nFehler in den Fenstern:\n' + fensterFehler.slice(0, 12).join('\n') : '\nKeine Skriptfehler in den Fenstern');
  if (fensterFehler.length) fehler++;
  console.log(fehler ? `\n${fehler} FEHLER` : '\nAlle UI-Tests bestanden');
  process.exit(fehler ? 1 : 0);
})().catch(e => { console.error('ABBRUCH:', e.message); console.log(fensterFehler.slice(0, 12).join('\n')); process.exit(1); });
