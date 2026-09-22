/* Lernwerk Games – Kern: Server-Aufrufe, Belohnungen, gemeinsame Bausteine, Game-Hub, Sammlung & Booster.
   Alle Belohnungen entstehen auf dem Server (supabase/2026-09-22-games.sql). Der Browser zeigt nur an. */
(function(){
"use strict";
const L = window.LW, G = window.GGFX, $ = (s, r=document) => r.querySelector(s);
const esc = L.esc, md = L.md;
const sync = () => window.LW_SYNC, sb = () => sync() && sync().sb();
const ich = () => sync() && sync().ich() && sync().ich().id;
let konto = null, katalog = null, kanal = null;

/* ---------- Server ---------- */
function fehlerText(e){
  const m = (e && e.message) || String(e || '');
  if (/Could not find the function|does not exist|schema cache|PGRST202/i.test(m)) return 'Die Games sind auf dem Server noch nicht eingerichtet.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Keine Verbindung zum Server.';
  return m || 'Das hat nicht geklappt.';
}
async function rpc(name, args){
  const {data, error} = await sb().rpc(name, args || {});
  if (error) throw new Error(fehlerText(error));
  return data;
}
// Serverzeit (für Timer, die der Server prüft)
let versatz = 0;
const serverZeit = jetzt => { if (jetzt) versatz = Date.parse(jetzt) - Date.now(); };
const jetzt = () => Date.now() + versatz;

async function katalogLaden(){
  if (!katalog){ try { katalog = JSON.parse(localStorage.getItem('lernwerk.karten') || 'null'); } catch(e){} }
  const {data, error} = await sb().from('karten').select('*').order('nr');
  if (!error && data && data.length){ katalog = Object.fromEntries(data.map(k => [k.id, k])); try { localStorage.setItem('lernwerk.karten', JSON.stringify(katalog)); } catch(e){} }
  if (!katalog) throw new Error(fehlerText(error));
  return katalog;
}
async function kontoLaden(){
  konto = await rpc('spiel_konto');
  spiegeln();
  await xpAbholen();
  return konto;
}
// Vom Server vergebene Spiel-XP in den Lernstand buchen (Level, Tages-XP, Rangliste)
async function xpAbholen(){
  try { const n = await rpc('spiel_xp_abholen'); if (n > 0){ L.addXP(n); if (konto) konto.xp_offen = 0; } } catch(e){}
}
// Kennzahlen für Abzeichen in den Lernstand spiegeln
function spiegeln(){
  if (!konto) return;
  const S = L.stand(), s = konto.statistik || {};
  S.spiele = {karten: Object.keys(konto.sammlung || {}).length, stufe: (s.karten || {}).stufe || 0, mio: (s.mio || {}).beste || 0,
              bombe: (s.bombe || {}).gewonnen || 0, arena: konto.arena_siege || 0, rang: konto.rang_punkte || 0};
  L.save(); L.abzeichenPruefen();
}
// Nach jedem Spiel: Konto neu laden, XP buchen, Aktivität eintragen
async function nachSpiel(logText){
  if (logText) L.logEintrag('spiel', logText);
  try { await kontoLaden(); } catch(e){}
}

/* ---------- Ränge ---------- */
const RAENGE = [['bronze','Bronze',0],['silber','Silber',100],['gold','Gold',250],['platin','Platin',450],['diamant','Diamant',700],['meister','Meister',1000]];
function rang(rp = 0){
  let i = RAENGE.length - 1; while (i > 0 && rp < RAENGE[i][2]) i--;
  const r = RAENGE[i], n = RAENGE[i + 1];
  return {id: r[0], name: r[1], ab: r[2], rp, naechster: n ? {name: n[1], ab: n[2]} : null, prozent: n ? Math.round((rp - r[2]) / (n[2] - r[2]) * 100) : 100};
}
const rangBadge = (rp, gr = 40) => { const r = rang(rp); return `<span class="rang-badge r-${r.id}" title="${r.name} · ${rp} Rangpunkte">${G.rangAbzeichen(r.id, gr)}</span>`; };

/* ---------- Bausteine ---------- */
const SELT = {common: ['Gewöhnlich', 1], rare: ['Selten', 2], epic: ['Episch', 3], legendary: ['Legendär', 4]};
// Karte (CardComponent). o: {a, v} aktuelle Werte, klasse, attr
function karte(id, o = {}){
  const k = katalog && katalog[id]; if (!k) return `<div class="lwk leer ${o.klasse || ''}"></div>`;
  const f = G.FACH[k.fach] || {}, a = o.a ?? k.angriff, v = o.v ?? k.verteidigung, s = SELT[k.seltenheit];
  return `<div class="lwk ${k.seltenheit} ${o.klasse || ''}" data-karte="${id}" style="--fc:${f.farbe}" ${o.attr || ''}>
    <div class="lwk-kopf"><span class="lwk-sterne" title="${s[0]}">${'★'.repeat(s[1])}</span><span class="lwk-fach">${f.name}</span></div>
    <div class="lwk-bild">${G.kartenBild(k)}</div>
    <div class="lwk-name">${esc(k.name)}</div>
    <div class="lwk-werte"><span class="lwk-atk ${a > k.angriff ? 'hoch' : ''}" title="Angriff">${G.ico.schwert}<b>${a}</b></span><span class="lwk-def ${v > k.verteidigung ? 'hoch' : v < k.verteidigung ? 'runter' : ''}" title="Verteidigung">${G.ico.schild}<b>${v}</b></span></div>
    <div class="lwk-text">${k.faehigkeit_name ? `<b>„${esc(k.faehigkeit_name)}“</b><span>${esc(k.faehigkeit_text)}</span>` : '<span class="lwk-ohne">Keine Fähigkeit</span>'}</div>
    <div class="lwk-fuss"><span class="lwk-kosten" title="Kosten (Fokus)">${k.kosten}</span><span class="lwk-nr">#${String(k.nr).padStart(2, '0')}</span></div>
  </div>`;
}
const kartenRueck = (klasse = '') => `<div class="lwk rueck ${klasse}"><div class="lwk-rueck-in">${window.GFX ? GFX.logo() : ''}<span>Lernwerk</span></div></div>`;

// Frage (QuestionCard): Text aus fragen.js, Antworten gemischt, geprüft wird auf dem Server
function frageHtml(id, o = {}){
  const e = L.D.einheiten.find(x => x.id === id);
  if (!e) return `<div class="gfrage"><p class="muted">Diese Frage kennt deine Lernwerk-Version noch nicht – bitte die Seite neu laden.</p></div>`;
  const t = L.themaOf(e.thema) || {}, f = L.fachOf(t.fach) || {};
  const reihe = L.shuffle(e.optionen.map((_, i) => i));
  return `<div class="gfrage ${o.klasse || ''}" data-frage="${id}">
    <div class="gf-kopf"><span class="tag"><span class="dot" style="background:var(--${f.farbe})"></span>${esc(f.name || '')} · ${esc(t.name || '')}</span>${o.extra || ''}</div>
    <div class="gf-text">${md(e.frage)}</div>
    <div class="gf-opts">${reihe.map((oi, k) => `<button class="opt round gopt" data-o="${oi}" style="--k:${k}" ${o.gesperrt ? 'disabled' : ''}><span class="box">${'ABCD'[k]}</span><span>${md(e.optionen[oi][0])}</span></button>`).join('')}</div>
    <div class="gf-fb"></div></div>`;
}
let tasten = null;
document.addEventListener('keydown', ev => {
  if (!tasten) return; const tag = (ev.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea') return;
  if (/^[1-4]$/.test(ev.key)){ const b = tasten.querySelectorAll('.gopt')[+ev.key - 1]; if (b && !b.disabled){ ev.preventDefault(); b.click(); } }
});
function frageBinden(root, beiWahl){
  if (!root) return; tasten = root;
  root.querySelectorAll('.gopt').forEach(b => b.onclick = () => {
    if (root.dataset.gesperrt) return; root.dataset.gesperrt = '1';
    root.querySelectorAll('.gopt').forEach(x => x.disabled = true); b.classList.add('sel');
    beiWahl(+b.dataset.o, b);
  });
}
function frageFrei(root){ if (!root) return; delete root.dataset.gesperrt; root.querySelectorAll('.gopt').forEach(x => { x.disabled = false; x.classList.remove('sel'); }); }
// Ergebnis zeigen und für Karteikasten/Statistik verbuchen
function frageAufloesen(root, gewaehlt, richtig, o = {}){
  if (!root) return;
  const id = root.dataset.frage, ok = gewaehlt === richtig, e = L.D.einheiten.find(x => x.id === id);
  root.querySelectorAll('.gopt').forEach(b => { const i = +b.dataset.o; b.disabled = true; b.classList.remove('sel');
    if (i === richtig) b.classList.add(i === gewaehlt ? 'right' : 'miss'); else if (i === gewaehlt) b.classList.add('wrong'); });
  if (o.warum && e && !ok && e.optionen[richtig] && e.optionen[richtig][2]){
    const fb = root.querySelector('.gf-fb'); if (fb) fb.innerHTML = `<p class="small muted gf-warum">${md(e.optionen[richtig][2])}</p>`;
  }
  if (!o.nurZeigen){ L.antwortVerbuchen(id, ok); if (window.FX){ if (ok){ FX.ton('ok'); FX.stoss(root.querySelector('.gopt.right'), 20); } else { FX.ton('bad'); FX.wackeln(root); } } }
  if (tasten === root) tasten = null;
}

// Lebensbalken (HealthBar)
function hpBar(hp, max, o = {}){
  const p = Math.max(0, Math.min(100, Math.round(hp / max * 100)));
  return `<div class="hpbar ${p <= 25 ? 'kritisch' : p <= 50 ? 'mittel' : ''} ${o.klasse || ''}" ${o.id ? `id="${o.id}"` : ''} data-hp="${hp}" data-max="${max}">
    <div class="hp-spur"><i class="hp-fuell" style="width:${p}%"></i></div><span class="hp-zahl">${G.ico.herz}<b>${Math.max(0, hp)}</b><small>/${max}</small></span></div>`;
}
function hpSetzen(el, hp){
  if (!el) return; const max = +el.dataset.max, alt = +el.dataset.hp, p = Math.max(0, Math.min(100, Math.round(hp / max * 100)));
  el.dataset.hp = hp; el.querySelector('.hp-fuell').style.width = p + '%'; el.querySelector('.hp-zahl b').textContent = Math.max(0, hp);
  el.classList.toggle('kritisch', p <= 25); el.classList.toggle('mittel', p > 25 && p <= 50);
  if (hp < alt){ el.classList.remove('treffer'); void el.offsetWidth; el.classList.add('treffer'); schadenZahl(el, alt - hp); }
  else if (hp > alt) schadenZahl(el, hp - alt, true);
}
// fliegende Schadens- oder Heilzahl
function schadenZahl(el, n, heil){
  if (!el || !n) return; const r = el.getBoundingClientRect(), z = document.createElement('div');
  z.className = 'schaden-zahl' + (heil ? ' heil' : ''); z.textContent = (heil ? '+' : '−') + n;
  z.style.left = (r.left + r.width / 2) + 'px'; z.style.top = (r.top + window.scrollY) + 'px';
  document.body.appendChild(z); setTimeout(() => z.remove(), 1100);
}
const coins = n => `<span class="coins">${G.muenze(18)}<b>${(n || 0).toLocaleString('de-DE')}</b></span>`;

// Ergebnis-Panel (GameResult) mit Belohnungen (RewardPopup inline)
function ergebnisHtml(o){
  const b = o.belohnung || {}, erg = o.ergebnis || 'remis';
  const kopf = {sieg: ['sieg', 'SIEG', G.ico.pokal], niederlage: ['niederlage', 'NIEDERLAGE', G.ico.schild], remis: ['remis', 'UNENTSCHIEDEN', G.ico.schild]}[erg] || ['remis', erg, G.ico.pokal];
  return `<div class="panel g-ergebnis ${kopf[0]} pop-in">
    <div class="ge-symbol">${o.symbol || kopf[2]}</div>
    <div class="eyebrow">${esc(o.eyebrow || '')}</div>
    <h2 class="ge-titel">${o.titel || kopf[1]}</h2>
    ${o.sub ? `<p class="muted">${o.sub}</p>` : ''}
    <div class="ge-beloh">${o.belohnung ? belohnungListe(b, o) : ''}</div>
    ${b.titel ? `<p class="ge-titel-neu">Neuer Titel: <b>${esc(b.titel)}</b></p>` : ''}
    ${o.extra || ''}
    <div class="row ge-knoepfe">${o.knoepfe || ''}</div>
  </div>`;
}
// Belohnungen (RewardPopup): XP, Coins, Booster, Rangpunkte
function belohnungListe(b, o = {}){
  return `<div class="beloh-liste">
    <div class="beloh" style="--k:0">${G.ico.xp}<b>+<span data-hoch="${b.xp || 0}">0</span></b><span>XP</span></div>
    <div class="beloh" style="--k:1">${G.muenze(24)}<b>+<span data-hoch="${b.coins || 0}">0</span></b><span>Coins</span></div>
    ${b.booster ? `<div class="beloh booster" style="--k:2">${G.ico.booster}<b>+${b.booster}</b><span>Booster</span></div>` : ''}
    ${o.rp != null ? `<div class="beloh rp ${o.rp < 0 ? 'minus' : ''}" style="--k:3">${rangBadge(o.rpNeu || 0, 26)}<b>${o.rp >= 0 ? '+' : ''}${o.rp}</b><span>Rangpunkte</span></div>` : ''}
  </div>`;
}
// Belohnung nachträglich einsetzen (Mehrspieler: der Server bucht erst am Spielende)
function belohnungEinsetzen(root, spiel, o = {}){
  const x = konto && (konto.letzte || []).find(e => e.spiel === spiel), el = root && root.querySelector('.ge-beloh');
  if (!x || !el) return;
  el.innerHTML = belohnungListe({xp: x.xp, coins: x.coins}, o);
  el.querySelectorAll('[data-hoch]').forEach(z => window.FX && FX.hochzaehlen(z, +z.dataset.hoch, 900));
}
function ergebnisAn(root, erg){
  root.querySelectorAll('[data-hoch]').forEach(el => window.FX && FX.hochzaehlen(el, +el.dataset.hoch, 900));
  if (!window.FX) return;
  if (erg === 'sieg'){ FX.ton('level'); FX.konfetti(180); } else if (erg === 'niederlage') FX.ton('ende'); else FX.ton('combo');
}

// Kurze Klänge, die spiel.js nicht hat (WebAudio, abschaltbar über den Ton-Knopf)
let ac = null;
function klang(art){
  if (!window.FX || !FX.tonAn()) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const t = ac.currentTime, dauer = {boom: 1.1, flip: .12, treffer: .18, wusch: .3}[art] || .2;
    const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dauer), ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, art === 'boom' ? 2.2 : 3);
    const q = ac.createBufferSource(); q.buffer = buf;
    const fl = ac.createBiquadFilter(); fl.type = art === 'flip' || art === 'wusch' ? 'bandpass' : 'lowpass';
    fl.frequency.value = {boom: 420, flip: 2600, treffer: 900, wusch: 1400}[art] || 800;
    const g = ac.createGain(); g.gain.value = art === 'boom' ? .9 : .35;
    q.connect(fl).connect(g).connect(ac.destination); q.start(t);
    if (art === 'boom'){ const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + .8); og.gain.setValueAtTime(.5, t); og.gain.exponentialRampToValueAtTime(.001, t + .9); o.connect(og).connect(ac.destination); o.start(t); o.stop(t + .9); }
  } catch(e){}
}

/* ---------- Seitenrahmen, Zustände ---------- */
const zurueck = (ziel = '#/games', text = 'Games') => `<button class="btn ghost back" data-ziel="${ziel}">${L.ICON.back}${text}</button>`;
const laedt = (text = 'Lädt …') => `<div class="g-laedt"><span class="g-spinner"></span><span class="muted">${text}</span></div>`;
function fehlerZeigen(el, e, nochmal){
  el.innerHTML = `<div class="panel g-leer fehler"><div class="gl-ico">${L.ICON.x}</div><h3>Das hat nicht geklappt</h3><p class="muted">${esc(fehlerText(e))}</p>${nochmal ? '<button class="btn primary" data-nochmal>Nochmal versuchen</button>' : ''}</div>`;
  const b = el.querySelector('[data-nochmal]'); if (b) b.onclick = nochmal;
}
function zieleBinden(root){ root.querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => L.go(b.dataset.ziel)); }
// Games brauchen ein Konto (Belohnungen liegen auf dem Server)
function brauchtKonto(app){
  if (sync() && sync().angemeldet()) return false;
  if (sync() && sync().bereit && !sync().bereit()){ app.innerHTML = laedt('Anmeldung wird geprüft …'); return true; }
  app.innerHTML = L.seitenKopf('Lernwerk Games', 'Games', 'Lerne spielerisch. Gewinne XP. Steige im Rang.') + `
    <div class="panel g-leer"><div class="gl-ico">${G.ico.pokal}</div><h3>Für Games brauchst du ein Konto</h3>
    <p class="muted">Coins, Karten, Booster und Rangpunkte werden sicher auf dem Server gespeichert – damit niemand schummeln kann.</p>
    <button class="btn primary" data-ziel="#/konto">Anmelden oder Konto anlegen</button></div>
    <div class="gcards vorschau">${SPIELE.map(s => spielKarte(s, null)).join('')}</div>`;
  zieleBinden(app); return true;
}

/* ---------- Aufräumen beim Verlassen (Timer, Abfragen) ---------- */
let aufr = [];
function aufraeumen(){ const a = aufr; aufr = []; a.forEach(f => { try { f(); } catch(e){} }); tasten = null; }
const beimVerlassen = f => aufr.push(f);
window.addEventListener('hashchange', () => { if (!(location.hash || '').startsWith('#/games')) aufraeumen(); });

/* ---------- Live-Ereignisse ---------- */
const hoerer = {};   // art → Funktion der aktuell offenen Ansicht
const aufEreignis = (art, f) => { hoerer[art] = f; beimVerlassen(() => { if (hoerer[art] === f) delete hoerer[art]; }); };
function melden(art, p){
  const neu = p.new || {};
  if (hoerer[art]) { try { hoerer[art](neu, p); } catch(e){} }
  // global: Einladungen und "du bist dran", auch außerhalb der Spiele
  if (art === 'arena' && neu.status === 'angefragt' && neu.spieler_b === ich() && p.eventType === 'INSERT' && !hoerer.arena) einladung(neu);
  if (art === 'kampf' && neu.status === 'laeuft' && neu.spieler_b && neu.am_zug === ich() && !hoerer.kampf){ L.toast('Du bist im Karten-Kampf dran!'); window.FX && FX.ton('combo'); }
}
function abonnieren(){
  if (kanal || !sb()) return;
  kanal = sb().channel('games')
    .on('postgres_changes', {event: '*', schema: 'public', table: 'kaempfe'}, p => melden('kampf', p))
    .on('postgres_changes', {event: '*', schema: 'public', table: 'bomben_raeume'}, p => melden('bombe', p))
    .on('postgres_changes', {event: '*', schema: 'public', table: 'arena_matches'}, p => melden('arena', p))
    .subscribe();
}
async function einladung(m){
  let name = 'Jemand';
  try { const {data} = await sb().from('profile').select('spitzname').eq('id', m.spieler_a).maybeSingle(); if (data) name = data.spitzname; } catch(e){}
  window.FX && FX.ton('combo');
  const w = document.createElement('div'); w.className = 'overlay';
  w.innerHTML = `<div class="overlay-box pop-in g-einladung"><div class="gl-ico arena">${G.ico.schwert}</div><div class="eyebrow">Wissens-Arena</div><h2>${esc(name)} fordert dich heraus!</h2><p class="muted">5 Runden, dieselben Fragen, Wissen und Tempo entscheiden.</p>
    <div class="row" style="justify-content:center"><button class="btn primary" data-a="ja">Annehmen</button><button class="btn" data-a="nein">Ablehnen</button></div></div>`;
  document.body.appendChild(w);
  const zu = () => w.remove();
  w.querySelector('[data-a="ja"]').onclick = () => { zu(); L.go('#/games/arena/' + m.id + '/annehmen'); };
  w.querySelector('[data-a="nein"]').onclick = async () => { zu(); try { await rpc('arena_ablehnen', {p_id: m.id}); } catch(e){} };
}
document.addEventListener('lw-konto', async e => {
  if (e.detail.profil){
    abonnieren();
    try { await katalogLaden(); await kontoLaden(); } catch(err){}
  } else { konto = null; if (kanal){ sb() && sb().removeChannel(kanal); kanal = null; } }
});

/* ---------- Game-Hub ---------- */
const SPIELE = [
  {id: 'karten', titel: 'Karten-Kampf', text: 'Baue dein Deck. Beantworte Fragen. Besiege deinen Gegner.', modus: 'Gegen Computer oder Klasse', beloh: 'bis 80 XP · Booster', farbe: 'lila', ico: 'deck'},
  {id: 'bombe', titel: 'Bomben-Quiz', text: 'Beantworte die Frage, bevor die Bombe explodiert.', modus: 'Party · 2–6 Spieler', beloh: 'bis 40 XP · Coins', farbe: 'rot', ico: 'flamme'},
  {id: 'millionaer', titel: 'Quiz-Millionär', text: 'Wie weit kommst du auf der Wissensleiter?', modus: 'Einzelspieler · 9 Stufen', beloh: 'bis 300 XP · Titel', farbe: 'gold', ico: 'xp'},
  {id: 'arena', titel: 'Wissens-Arena', text: 'Duell gegen andere Lernende. Wissen entscheidet.', modus: 'Live-Duell · 5 Runden', beloh: 'Rangpunkte · bis 60 XP', farbe: 'blau', ico: 'schwert'},
];
function spielStat(id){
  if (!konto) return '';
  const s = konto.statistik || {};
  if (id === 'karten') return `${G.ico.pokal}<span>${(s.karten || {}).stufe || 0} / 5 Gegner besiegt</span>`;
  if (id === 'bombe') return `${G.ico.pokal}<span>${(s.bombe || {}).gewonnen || 0} Siege</span>`;
  if (id === 'millionaer') return `${G.ico.pokal}<span>Bestwert: Stufe ${(s.mio || {}).beste || 0} / 9</span>`;
  if (id === 'arena'){ const r = rang(konto.rang_punkte); return `${rangBadge(konto.rang_punkte, 22)}<span>${r.name} · ${konto.rang_punkte} RP</span>`; }
}
function spielKarte(s, stat){
  const hinweis = konto && s.id === 'karten' && konto.kampf_offen ? `<span class="gcard-hinweis">${konto.kampf_offen} × du bist dran</span>`
    : konto && s.id === 'arena' && konto.arena_anfragen ? `<span class="gcard-hinweis">${konto.arena_anfragen} Herausforderung</span>` : '';
  return `<article class="gcard g-${s.farbe}" data-spiel="${s.id}" tabindex="0" role="link" aria-label="${s.titel} spielen">
    <div class="gcard-art">${G.ART[s.id]()}${hinweis}</div>
    <div class="gcard-body"><h3>${s.titel}</h3><p>${s.text}</p>
      <div class="gcard-chips"><span>${G.ico[s.ico]}${s.modus}</span><span>${G.ico.pokal}${s.beloh}</span></div>
      <div class="gcard-fuss"><span class="gcard-stat">${stat || ''}</span><span class="btn primary klein-btn">Spielen ${L.ICON.pfeil}</span></div>
    </div></article>`;
}
async function viewHub(){
  const app = L.app();
  if (brauchtKonto(app)) return;
  app.innerHTML = L.seitenKopf('Lernwerk Games', 'Games', 'Lerne spielerisch. Gewinne XP. Steige im Rang.') + `<div id="hub">${laedt()}</div>`;
  const hub = $('#hub');
  try { await Promise.all([katalogLaden(), kontoLaden()]); }
  catch(e){ return fehlerZeigen(hub, e, viewHub); }
  if (!document.body.contains(hub)) return;
  const S = L.stand(), Lv = L.level(), r = rang(konto.rang_punkte), pro = Math.round(Lv.rest / Lv.need * 100);
  const NAMEN = {karten: 'Karten-Kampf', bombe: 'Bomben-Quiz', mio: 'Quiz-Millionär', arena: 'Wissens-Arena'};
  const ERG = {sieg: ['Sieg', 'ok'], niederlage: ['Niederlage', 'bad'], remis: ['Unentschieden', ''], verloren: ['Ausgeschieden', 'bad'], ausgestiegen: ['Ausgestiegen', '']};
  hub.innerHTML = `
  <section class="gcards">${SPIELE.map(s => spielKarte(s, spielStat(s.id))).join('')}</section>
  <section class="section"><div class="section-head"><h2>Dein Fortschritt</h2><button class="btn ghost" data-ziel="#/games/sammlung">${G.ico.deck}Karten &amp; Deck</button></div>
    <div class="g-fortschritt">
      <div class="panel gf-kachel"><div class="ring sm" style="--p:${pro};--c:var(--akzent-2)"><div><b>${Lv.n}</b></div></div><div><b>Level ${Lv.n}</b><small>${Lv.rest} / ${Lv.need} XP</small></div></div>
      <div class="panel gf-kachel"><span class="gf-ico xp">${G.ico.xp}</span><div><b data-zahl="${S.xp}">${S.xp}</b><small>XP gesamt</small></div></div>
      <div class="panel gf-kachel"><span class="gf-ico">${G.muenze(30)}</span><div><b data-zahl="${konto.coins}">${konto.coins}</b><small>Coins</small></div></div>
      <div class="panel gf-kachel"><span class="gf-ico flamme">${G.ico.flamme}</span><div><b>${L.streak()} ${L.streak() === 1 ? 'Tag' : 'Tage'}</b><small>Serie</small></div></div>
      <div class="panel gf-kachel rang"><span class="gf-ico">${G.rangAbzeichen(r.id, 40)}</span><div><b>${r.name}</b><small>${konto.rang_punkte} RP${r.naechster ? ` · ${r.naechster.ab - konto.rang_punkte} bis ${r.naechster.name}` : ''}</small><div class="bar"><i style="width:${r.prozent}%;background:var(--verlauf)"></i></div></div></div>
      <button class="panel gf-kachel booster ${konto.booster ? 'hat' : ''}" data-ziel="#/games/sammlung/oeffnen"><span class="gf-ico">${G.booster('mix', 44)}</span><div><b>${konto.booster} ${konto.booster === 1 ? 'Booster' : 'Booster'}</b><small>${konto.booster ? 'Jetzt öffnen' : `Nächster in ${10 - konto.booster_fortschritt} richtigen Antworten`}</small><div class="bar"><i style="width:${konto.booster_fortschritt * 10}%;background:var(--mark)"></i></div></div></button>
    </div>
    ${(konto.titel || []).length ? `<p class="small muted" style="margin-top:10px">Deine Titel: ${konto.titel.map(t => `<span class="tag titel-tag">${esc(t)}</span>`).join(' ')}</p>` : ''}
  </section>
  <section class="section"><div class="section-head"><h2>Deine letzten Spiele</h2></div>
    ${konto.letzte.length ? `<div class="panel g-letzte"><table><thead><tr><th>Spiel</th><th>Ergebnis</th><th>XP</th><th>Coins</th><th>Datum</th></tr></thead><tbody>
      ${konto.letzte.map(x => { const e = ERG[x.ergebnis] || [x.ergebnis, '']; const st = x.details && x.details.stufe != null && x.spiel === 'mio' ? ` · Stufe ${x.details.stufe}` : '';
        return `<tr><td><b>${NAMEN[x.spiel] || esc(x.spiel)}</b>${x.details && x.details.gegner ? `<small>gegen ${esc(x.details.gegner)}</small>` : ''}</td><td><span class="erg ${e[1]}">${e[0]}${st}</span></td><td class="mono">+${x.xp}</td><td class="mono">+${x.coins}</td><td class="muted small">${new Date(x.erstellt).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit'})} · ${new Date(x.erstellt).toLocaleTimeString('de-DE', {hour: '2-digit', minute: '2-digit'})}</td></tr>`; }).join('')}
    </tbody></table></div>` : `<div class="panel g-leer klein"><p class="muted">Noch keine Spiele – such dir oben eins aus!</p></div>`}
  </section>`;
  hub.querySelectorAll('[data-spiel]').forEach(c => { c.onclick = () => L.go('#/games/' + c.dataset.spiel); c.onkeydown = ev => { if (ev.key === 'Enter') c.click(); }; });
  zieleBinden(hub);
  hub.querySelectorAll('[data-zahl]').forEach(b => window.FX && FX.hochzaehlen(b, +b.dataset.zahl, 900));
}

/* ---------- Sammlung, Deck, Booster ---------- */
async function viewSammlung(h){
  const app = L.app();
  if (brauchtKonto(app)) return;
  app.innerHTML = zurueck() + L.seitenKopf('Lernwerk Games', 'Karten & Deck', 'Dein Deck hat 10 Karten. Neue Karten gibt es in Boostern.') + `<div id="sam">${laedt()}</div>`;
  zieleBinden(app);
  const el = $('#sam');
  try { await Promise.all([katalogLaden(), kontoLaden()]); } catch(e){ return fehlerZeigen(el, e, () => viewSammlung(h)); }
  if (!document.body.contains(el)) return;
  let deck = (konto.deck || []).slice(), filter = 'alle', geaendert = false;
  const alle = Object.values(katalog).sort((a, b) => a.nr - b.nr);
  const zeichne = () => {
    const anz = id => deck.filter(x => x === id).length;
    const kosten = deck.length ? (deck.reduce((s, id) => s + katalog[id].kosten, 0) / deck.length).toFixed(1).replace('.', ',') : '–';
    const besitz = Object.keys(konto.sammlung).length;
    el.innerHTML = `
    <div class="panel sam-leiste">
      <div class="sam-werte">${coins(konto.coins)}<span class="coins">${G.ico.booster}<b>${konto.booster}</b> Booster</span><span class="muted small">${besitz} / ${alle.length} Karten gesammelt</span></div>
      <div class="row"><button class="btn" id="kaufen" ${konto.coins < 100 ? 'disabled' : ''}>${G.muenze(18)}Booster kaufen · 100</button><button class="btn primary" id="oeffnen" ${konto.booster ? '' : 'disabled'}>${G.ico.booster}Booster öffnen</button></div>
    </div>
    <section class="section"><div class="section-head"><h2>Dein Deck <span class="muted small">${deck.length} / 10 · Ø Kosten ${kosten}</span></h2>
      <button class="btn primary" id="speichern" ${geaendert && deck.length === 10 ? '' : 'disabled'}>Deck speichern</button></div>
      <p class="small muted">Tippe eine Karte im Deck an, um sie herauszunehmen. Tippe unten eine Karte an, um sie hinzuzufügen (höchstens 2 gleiche, legendäre nur 1).</p>
      <div class="deck-reihe">${Array.from({length: 10}, (_, i) => deck[i] ? `<button class="deck-platz voll" data-raus="${i}" aria-label="${esc(katalog[deck[i]].name)} herausnehmen">${karte(deck[i], {klasse: 'mini'})}</button>` : `<div class="deck-platz"><span>${i + 1}</span></div>`).join('')}</div>
    </section>
    <section class="section"><div class="section-head"><h2>Sammlung</h2>
      <div class="seg mini">${[['alle', 'Alle'], ['wbl', 'WBL'], ['its1', 'ITS'], ['aew', 'AEW'], ['selten', 'Selten+']].map(([k, t]) => `<button aria-pressed="${filter === k}" data-f="${k}">${t}</button>`).join('')}</div></div>
      <div class="sam-grid">${alle.filter(k => filter === 'alle' || (filter === 'selten' ? k.seltenheit !== 'common' : k.fach === filter)).map(k => {
        const hat = konto.sammlung[k.id] || 0, im = anz(k.id);
        if (!hat) return `<div class="sam-karte fehlt">${kartenRueck('mini')}<span class="sam-nr">#${String(k.nr).padStart(2, '0')} · ${SELT[k.seltenheit][0]}</span></div>`;
        const voll = im >= hat || im >= (k.seltenheit === 'legendary' ? 1 : 2) || deck.length >= 10;
        return `<button class="sam-karte ${voll ? 'voll' : ''}" data-rein="${k.id}" ${voll ? 'aria-disabled="true"' : ''}>${karte(k.id)}<span class="sam-anz">×${hat}${im ? ` · ${im} im Deck` : ''}</span></button>`; }).join('')}</div>
    </section>`;
    el.querySelectorAll('[data-raus]').forEach(b => b.onclick = () => { deck.splice(+b.dataset.raus, 1); geaendert = true; zeichne(); });
    el.querySelectorAll('[data-rein]').forEach(b => b.onclick = () => {
      if (b.getAttribute('aria-disabled')){ L.toast(deck.length >= 10 ? 'Dein Deck ist voll – nimm erst eine Karte heraus.' : 'Davon ist schon die erlaubte Anzahl im Deck.'); return; }
      deck.push(b.dataset.rein); geaendert = true; window.FX && FX.ton('tick'); zeichne(); });
    el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; zeichne(); });
    $('#speichern').onclick = async () => { $('#speichern').disabled = true; try { konto = await rpc('deck_speichern', {p_karten: deck}); geaendert = false; L.toast('Deck gespeichert'); zeichne(); } catch(e){ L.toast(fehlerText(e)); $('#speichern').disabled = false; } };
    $('#kaufen').onclick = async () => { try { konto = await rpc('booster_kaufen'); window.FX && FX.ton('combo'); L.toast('Booster gekauft!'); zeichne(); } catch(e){ L.toast(fehlerText(e)); } };
    $('#oeffnen').onclick = () => boosterWahl(zeichne);
  };
  zeichne();
  if (h === '#/games/sammlung/oeffnen' && konto.booster) boosterWahl(zeichne);
}
// Booster öffnen (CardPackOpening): Fach wählen → Pack aufreißen → Karten einzeln aufdecken
function boosterWahl(fertig){
  const w = document.createElement('div'); w.className = 'bo-overlay';
  w.innerHTML = `<div class="bo-buehne"><div class="eyebrow">Booster öffnen</div><h2>Welches Fach?</h2><p class="muted">5 Karten · die fünfte ist mindestens selten.</p>
    <div class="bo-wahl">${[['wbl', 'WBL'], ['its1', 'ITS'], ['aew', 'AEW'], ['mix', 'Gemischt']].map(([f, t], k) => `<button class="bo-pack" data-f="${f}" style="--k:${k}">${G.booster(f, 150)}<span>${t}</span></button>`).join('')}</div>
    <button class="btn ghost" data-zu>Abbrechen</button></div>`;
  document.body.appendChild(w); document.body.classList.add('ohne-scroll');
  const zu = () => { w.remove(); document.body.classList.remove('ohne-scroll'); fertig && fertig(); };
  w.querySelector('[data-zu]').onclick = zu;
  w.querySelectorAll('[data-f]').forEach(b => b.onclick = async () => {
    w.querySelectorAll('[data-f]').forEach(x => x.disabled = true);
    let res; try { res = await rpc('booster_oeffnen', {p_fach: b.dataset.f}); } catch(e){ L.toast(fehlerText(e)); w.querySelectorAll('[data-f]').forEach(x => x.disabled = false); return; }
    konto = res.konto; spiegeln();
    boosterAufreissen(w, b.dataset.f, res, zu);
  });
}
function boosterAufreissen(w, fach, res, zu){
  const b = w.querySelector('.bo-buehne');
  b.innerHTML = `<div class="eyebrow">Tippe auf den Booster</div><button class="bo-gross" id="boGross" aria-label="Booster aufreißen">${G.booster(fach, 260)}</button>`;
  const g = $('#boGross');
  g.onclick = () => {
    g.onclick = null; g.classList.add('reisst'); klang('wusch'); window.FX && FX.ton('combo');
    setTimeout(() => {
      b.innerHTML = `<div class="eyebrow">Tippe die Karten an</div><div class="bo-karten">${res.karten.map((k, i) => {
        const s = katalog[k.id] ? katalog[k.id].seltenheit : 'common';
        return `<button class="bo-karte ahnung-${s}" data-i="${i}" style="--i:${i}"><div class="bo-dreh"><div class="bo-seite hinten">${kartenRueck()}</div><div class="bo-seite vorne">${karte(k.id)}${k.neu ? '<span class="bo-neu">NEU</span>' : ''}${k.dublette ? `<span class="bo-dub">+${k.coins} Coins</span>` : ''}</div></div></button>`; }).join('')}</div>
        <div class="row" style="justify-content:center"><button class="btn" id="alle">Alle aufdecken</button><button class="btn primary" id="fertig" hidden>Fertig</button></div>
        ${res.coins ? `<p class="small muted">Doppelte Karten (mehr als 2) werden zu Coins: +${res.coins}</p>` : ''}`;
      const auf = el => {
        if (el.classList.contains('offen')) return; el.classList.add('offen'); klang('flip');
        const s = katalog[res.karten[+el.dataset.i].id].seltenheit;
        if (s === 'legendary'){ window.FX && (FX.ton('level'), FX.konfetti(160)); } else if (s === 'epic'){ window.FX && FX.ton('abz'); window.FX && FX.stoss(el, 40); } else if (s === 'rare') window.FX && FX.ton('combo');
        if (b.querySelectorAll('.bo-karte:not(.offen)').length === 0){ $('#alle').hidden = true; $('#fertig').hidden = false; $('#fertig').focus(); }
      };
      b.querySelectorAll('.bo-karte').forEach(el => el.onclick = () => auf(el));
      $('#alle').onclick = () => b.querySelectorAll('.bo-karte:not(.offen)').forEach((el, i) => setTimeout(() => auf(el), i * 280));
      $('#fertig').onclick = zu;
    }, 650);
  };
}

/* ---------- Router ---------- */
const MODULE = {};   // Spiel-Module tragen sich hier ein (games-karten.js usw.)
function route(h){
  aufraeumen();
  const teil = h.split('/')[2] || '';
  if (!teil) return viewHub();
  if (teil === 'sammlung') return viewSammlung(h);
  if (MODULE[teil]){ if (brauchtKonto(L.app())) return; return MODULE[teil](h); }
  L.go('#/games');
}
Object.assign(window.LW_ROUTEN || (window.LW_ROUTEN = {}), {'#/games': route});

window.LW_GAMES = {
  get katalog(){ return katalog; },
  MODULE, rpc, fehlerText, katalogLaden, kontoLaden, konto: () => konto, nachSpiel, spiegeln, ich, sb, serverZeit, jetzt,
  rang, rangBadge, RAENGE, karte, kartenRueck, frageHtml, frageBinden, frageFrei, frageAufloesen, hpBar, hpSetzen, schadenZahl, coins,
  ergebnisHtml, ergebnisAn, belohnungListe, belohnungEinsetzen, klang, zurueck, laedt, fehlerZeigen, zieleBinden, beimVerlassen, aufEreignis, SELT,
};
})();
