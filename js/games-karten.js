/* Lernwerk Games – Karten-Kampf. Regeln und Zufall laufen auf dem Server (kampf_* in 2026-09-22-games.sql),
   hier wird nur angezeigt und abgespielt. */
(function(){
"use strict";
const L = window.LW, GM = window.LW_GAMES, G = window.GGFX, $ = (s, r=document) => r.querySelector(s), esc = L.esc;
const STUFEN = [
  {name: 'Praktikant Paul', hp: 14, text: 'Erster Tag im Betrieb – perfekt zum Reinkommen.'},
  {name: 'Azubi-Kollegin Ayla', hp: 16, text: 'Kennt die Grundlagen und spielt solide.'},
  {name: 'Ausbilder Bernd', hp: 18, text: 'Setzt auf Unterweisung und starke Teams.'},
  {name: 'Abteilungsleiterin Kaya', hp: 20, text: 'Schnell, direkt und gut vorbereitet.'},
  {name: 'Prüfungsausschuss', hp: 24, text: 'Das Finale. Nur mit starkem Deck zu schaffen.'},
];
const warte = ms => new Promise(r => setTimeout(r, ms));
let vorgeladen = null;

/* ---------- Lobby ---------- */
async function viewLobby(){
  const app = L.app();
  app.innerHTML = GM.zurueck() + L.seitenKopf('Lernwerk Games', 'Karten-Kampf', 'Baue dein Deck. Beantworte Fragen. Besiege deinen Gegner.') + `<div id="kkl">${GM.laedt()}</div>`;
  GM.zieleBinden(app);
  const el = $('#kkl');
  let konto, offen, namen = {};
  try {
    await GM.katalogLaden(); konto = await GM.kontoLaden();
    const {data, error} = await GM.sb().from('kaempfe').select('*').eq('status', 'laeuft').order('geaendert', {ascending: false});
    if (error) throw error; offen = data || [];
    const ids = [...new Set(offen.filter(k => k.spieler_b).map(k => k.spieler_a === GM.ich() ? k.spieler_b : k.spieler_a))];
    if (ids.length){ const {data: p} = await GM.sb().from('profile').select('id, spitzname, farbe').in('id', ids); (p || []).forEach(x => namen[x.id] = x); }
  } catch(e){ return GM.fehlerZeigen(el, e, viewLobby); }
  if (!document.body.contains(el)) return;
  const besiegt = (konto.statistik.karten || {}).stufe || 0;
  const pve = offen.find(k => !k.spieler_b);
  const pvp = offen.filter(k => k.spieler_b);
  const gegner = k => namen[k.spieler_a === GM.ich() ? k.spieler_b : k.spieler_a] || {spitzname: 'Unbekannt', farbe: 'ink-3'};
  el.innerHTML = `
  <details class="panel kk-regeln"><summary>${G.ico.hinweis}<b>So funktioniert’s</b></summary><ol>
    <li><b>Jeder Zug beginnt mit einer Lernfrage.</b> Richtig: +1 Fokus, und Wissens-Fähigkeiten wie „+2 Verteidigung“ wirken.</li>
    <li><b>Fokus</b> bezahlt deine Karten. Du hast so viel Fokus wie deine Zugnummer (höchstens 5, mit richtiger Antwort 6).</li>
    <li><b>Lege Karten in deine 3 Felder.</b> Am Zugende greift jede Karte das gegenüberliegende Feld an und bekommt einen Gegenschlag. Ist das Feld leer, trifft sie den Gegner direkt.</li>
    <li>Wer keine Lebenspunkte mehr hat, verliert. Siege bringen XP, Coins – und der erste Sieg gegen jeden Gegner einen Booster.</li></ol></details>
  ${pve ? `<div class="panel kk-fortsetzen">${G.portrait(pve.stufe, 44)}<div><b>Laufender Kampf gegen ${esc(STUFEN[pve.stufe - 1].name)}</b><small class="muted">Du kannst genau da weitermachen, wo du aufgehört hast.</small></div><button class="btn primary" data-oeffnen="${pve.id}">Fortsetzen</button></div>` : ''}
  <section class="section"><div class="section-head"><h2>Gegen den Computer</h2><span class="muted small">${besiegt} / 5 besiegt</span></div>
    <div class="kk-stufen">${STUFEN.map((s, i) => { const n = i + 1, zu = n > besiegt + 1, weg = n <= besiegt;
      return `<div class="panel kk-stufe ${zu ? 'zu' : ''} ${weg ? 'besiegt' : ''}" style="--k:${i}">${G.portrait(n, 56)}
        <div class="kk-st-text"><b>${esc(s.name)}</b><small>Stufe ${n} · ${s.hp} Lebenspunkte${weg ? ' · besiegt' : ''}</small><p class="small muted">${esc(s.text)}</p></div>
        ${zu ? `<span class="kk-schloss" title="Besiege zuerst Stufe ${n - 1}">${L.ICON.lock}</span>` : `<button class="btn ${weg ? '' : 'primary'}" data-stufe="${n}">${weg ? 'Nochmal' : 'Kämpfen'}</button>`}</div>`; }).join('')}</div></section>
  <section class="section"><div class="section-head"><h2>Gegen deine Klasse</h2><button class="btn" id="herausfordern">${G.ico.schwert}Mitschüler herausfordern</button></div>
    ${pvp.length ? `<div class="stack">${pvp.map(k => { const g = gegner(k), dran = k.am_zug === GM.ich();
      return `<div class="panel drow ${dran ? 'dran' : ''}"><span class="ava" style="background:var(--${g.farbe})">${esc(g.spitzname[0].toUpperCase())}</span><div><b>${esc(g.spitzname)}</b><div class="small muted">${dran ? 'Du bist dran' : 'Wartet auf ' + esc(g.spitzname)}</div></div><span></span><button class="btn ${dran ? 'primary' : ''}" data-oeffnen="${k.id}">${dran ? 'Spielen' : 'Ansehen'}</button></div>`; }).join('')}</div>`
      : `<p class="muted small">Noch keine Kämpfe gegen Mitschüler. Ihr spielt abwechselnd – jeder, wann er Zeit hat.</p>`}</section>
  <section class="section"><div class="section-head"><h2>Dein Deck</h2><button class="btn ghost" data-ziel="#/games/sammlung">${G.ico.deck}Deck bearbeiten</button></div>
    <div class="deck-reihe">${(konto.deck || []).map(id => `<div class="deck-platz voll">${GM.karte(id, {klasse: 'mini'})}</div>`).join('')}</div></section>`;
  GM.zieleBinden(el);
  el.querySelectorAll('[data-stufe]').forEach(b => b.onclick = () => starten({p_stufe: +b.dataset.stufe}, b));
  el.querySelectorAll('[data-oeffnen]').forEach(b => b.onclick = () => L.go('#/games/karten/' + b.dataset.oeffnen));
  $('#herausfordern').onclick = gegnerWaehlen;
}
async function starten(args, knopf){
  if (knopf) knopf.disabled = true;
  try { const v = await GM.rpc('kampf_starten', args); vorgeladen = v; L.go('#/games/karten/' + v.id); }
  catch(e){ L.toast(GM.fehlerText(e)); if (knopf) knopf.disabled = false; }
}
async function gegnerWaehlen(){
  const w = document.createElement('div'); w.className = 'overlay';
  w.innerHTML = `<div class="overlay-box g-wahl pop-in"><div class="eyebrow">Karten-Kampf</div><h2>Wen forderst du heraus?</h2><input class="inp" id="gsuch" placeholder="Spitzname suchen"><div class="g-wahl-liste" id="gliste">${GM.laedt()}</div><button class="btn ghost" data-zu>Abbrechen</button></div>`;
  document.body.appendChild(w);
  w.querySelector('[data-zu]').onclick = () => w.remove();
  w.onclick = e => { if (e.target === w) w.remove(); };
  const {data} = await GM.sb().rpc('rangliste');
  const liste = (data || []).filter(x => x.id !== GM.ich()).sort((a, b) => a.spitzname.localeCompare(b.spitzname));
  const zeichne = q => { $('#gliste').innerHTML = liste.filter(x => x.spitzname.toLowerCase().includes(q.toLowerCase())).map(x => `<button class="drow wahl panel" data-g="${x.id}"><span class="ava" style="background:var(--${x.farbe})">${esc(x.spitzname[0].toUpperCase())}</span><div><b>${esc(x.spitzname)}</b><div class="small muted">Level ${x.level}</div></div>${G.ico.schwert}</button>`).join('') || '<p class="muted">Noch niemand sonst in deiner Klasse.</p>';
    w.querySelectorAll('[data-g]').forEach(b => b.onclick = () => { w.remove(); starten({p_gegner: b.dataset.g}); }); };
  $('#gsuch').oninput = e => zeichne(e.target.value); zeichne('');
}

/* ---------- Kampf ---------- */
const merkeKey = id => 'lernwerk.kampf.' + id;
async function viewKampf(id){
  const app = L.app();
  let v = vorgeladen && vorgeladen.id === id ? vorgeladen : null; vorgeladen = null;
  if (!v) app.innerHTML = GM.laedt('Kampf wird geladen …');
  try { await GM.katalogLaden(); if (!v) v = await GM.rpc('kampf_ansicht', {p_id: id}); }
  catch(e){ return GM.fehlerZeigen(app, e, () => viewKampf(id)); }

  let gesehen = 0; try { gesehen = +localStorage.getItem(merkeKey(id)) || 0; } catch(e){}
  const K = {id, v, wahl: null, busy: false, hp: {du: v.du.hp, gegner: v.gegner.hp}, gesehen: v.logn, fertig: false};
  merken(K);
  zeichne(K);
  // Züge des Gegners seit dem letzten Besuch: neu gelegte Karten hervorheben
  if (gesehen && v.log) v.log.filter(e => e.n > gesehen && e.art === 'spielt' && e.p !== v.ich).forEach(e => { const k = karteEl(K, 'gegner', e.feld); if (k) k.classList.add('erscheint'); });
  weiterNachZeichnen(K);
  // Mitschüler: live benachrichtigt werden, wenn der Gegner fertig ist
  if (!v.stufe && v.status === 'laeuft'){
    GM.aufEreignis('kampf', row => { if (row.id === id && !K.busy && !K.v.dran && (row.am_zug === GM.ich() || row.status === 'fertig')) aktualisieren(K); });
    const t = setInterval(() => { if (!K.busy && !K.v.dran && K.v.status === 'laeuft') aktualisieren(K); }, 15000);
    GM.beimVerlassen(() => clearInterval(t));
  }
}
function merken(K){ try { localStorage.setItem(merkeKey(K.id), K.v.logn || 0); } catch(e){} }
async function aktualisieren(K){
  K.busy = true;
  try { const neu = await GM.rpc('kampf_ansicht', {p_id: K.id}); await uebernehmen(K, neu); }
  catch(e){} finally { K.busy = false; }
}
async function uebernehmen(K, neu, ohneEigene){
  const ev = (neu.log || []).filter(e => e.n > K.gesehen && !(ohneEigene && e.p === neu.ich && e.art === 'spielt'));
  await abspielen(K, ev);
  K.v = neu; K.gesehen = neu.logn; merken(K);
  if (!document.body.contains(K.root)) return;
  zeichne(K);
  weiterNachZeichnen(K);
}
function weiterNachZeichnen(K){
  if (K.v.status === 'fertig') return ende(K);
  if (K.v.dran && K.v.phase === 'frage' && K.v.frage) setTimeout(() => frageZeigen(K), 350);
}

const feldEl = (K, s, i) => K.root && K.root.querySelector(`.kk-feld.${s} .kk-lane[data-lane="${i}"]`);
const karteEl = (K, s, i) => { const f = feldEl(K, s, i); return f && f.querySelector('.lwk'); };
const hpEl = (K, s) => K.root && K.root.querySelector(s === 'du' ? '#hpD' : '#hpG');
function anim(el, kl){ if (!el) return; el.classList.remove(kl); void el.offsetWidth; el.classList.add(kl); }
function blase(K, s, text, gut){
  const ziel = K.root && K.root.querySelector('.kk-spieler.' + s); if (!ziel) return;
  const b = document.createElement('div'); b.className = 'kk-blase ' + (gut ? 'gut' : gut === false ? 'schlecht' : ''); b.textContent = text;
  ziel.appendChild(b); setTimeout(() => b.remove(), 1800);
}
function defAendern(el, minus){ const b = el && el.querySelector('.lwk-def b'); if (b){ b.textContent = Math.max(0, +b.textContent - minus); el.querySelector('.lwk-def').classList.add('runter'); } }
// Ereignisse vom Server nacheinander auf dem alten Bild abspielen (Angriff, Schaden, Tod)
async function abspielen(K, ev){
  const seite = p => p === K.v.ich ? 'du' : 'gegner';
  for (const e of ev){
    if (!K.root || !document.body.contains(K.root)) return;
    const s = seite(e.p), o = s === 'du' ? 'gegner' : 'du';
    if (e.art === 'zug' && s === 'gegner'){ status(K, `${esc(K.v.gegner_name)} ist am Zug …`); await warte(450); }
    else if (e.art === 'antwort' && s === 'gegner'){ blase(K, 'gegner', e.ok ? 'Frage richtig · +1 Fokus' : 'Frage falsch', e.ok); await warte(650); }
    else if (e.art === 'spielt'){
      const f = feldEl(K, s, e.feld);
      if (f){ f.innerHTML = GM.karte(e.k, {klasse: 'mini erscheint'}); f.classList.add('belegt'); GM.klang('flip'); }
      if (s === 'gegner'){ const h = K.root.querySelector('.kk-gegner-hand .lwk'); if (h) h.remove(); }
      if (e.aktiv && e.faehigkeit === 'direkt'){ K.hp[o] -= e.wert; await warte(300); GM.hpSetzen(hpEl(K, o), K.hp[o]); GM.klang('treffer'); }
      if (e.aktiv && e.faehigkeit === 'heilen'){ const max = +(hpEl(K, s) || {dataset: {max: 99}}).dataset.max; K.hp[s] = Math.min(max, K.hp[s] + e.wert); GM.hpSetzen(hpEl(K, s), K.hp[s]); }
      if (e.aktiv && f) blase(K, s, fText(e), true);
      await warte(700);
    }
    else if (e.art === 'kampf'){
      const a = karteEl(K, s, e.feld), d = karteEl(K, o, e.feld);
      anim(a, s === 'du' ? 'stoss-hoch' : 'stoss-runter'); GM.klang('treffer'); await warte(230);
      if (d){ anim(d, 'getroffen'); GM.schadenZahl(d, e.schaden); defAendern(d, e.schaden); if (e.tot_d) d.classList.add('stirbt'); }
      if (a && e.zurueck){ GM.schadenZahl(a, e.zurueck); defAendern(a, e.zurueck); if (e.tot_a) a.classList.add('stirbt'); }
      await warte(560);
      [a, d].forEach(x => { if (x && x.classList.contains('stirbt')){ const l = x.parentElement; x.remove(); if (l){ l.classList.remove('belegt'); l.innerHTML = '<span class="kk-leer"></span>'; } } });
    }
    else if (e.art === 'treffer'){
      anim(karteEl(K, s, e.feld), s === 'du' ? 'stoss-hoch' : 'stoss-runter'); await warte(200);
      K.hp[o] -= e.schaden; GM.hpSetzen(hpEl(K, o), K.hp[o]); GM.klang('treffer');
      const sp = K.root.querySelector('.kk-spieler.' + o); anim(sp, 'bebt');
      await warte(480);
    }
    else if (e.art === 'leer'){ K.hp[s] -= 1; GM.hpSetzen(hpEl(K, s), K.hp[s]); blase(K, s, 'Deck leer · −1 Leben', false); await warte(500); }
    else if (e.art === 'verbrannt' && s === 'du'){ L.toast('Hand voll – die gezogene Karte ist verbrannt.'); }
  }
}
const fText = e => ({schild: `Wissensschild +${e.wert}`, angriff: `Wissensangriff +${e.wert}`, heilen: `+${e.wert} Leben`, direkt: `${e.wert} Schaden`, ziehen: `Zieht ${e.wert} Karte${e.wert > 1 ? 'n' : ''}`, fokus: `+${e.wert} Fokus`, team: `Team +${e.wert} Angriff`})[e.faehigkeit] || '';
function status(K, html){ const s = K.root && K.root.querySelector('.kk-status'); if (s) s.innerHTML = html; }

function zeichne(K){
  const v = K.v, app = L.app(), katalog = GM.katalog;
  const frei = [0, 1, 2].filter(i => !v.du.feld[i]);
  const spielbar = id => v.dran && v.phase === 'spielen' && frei.length && katalog[id] && katalog[id].kosten <= v.du.fokus;
  const lane = (e, i, meins) => `<div class="kk-lane ${e ? 'belegt' : ''} ${meins && !e && K.wahl != null ? 'ziel' : ''}" data-lane="${i}" ${meins && !e ? 'role="button" tabindex="0" aria-label="Feld ' + (i + 1) + '"' : ''}>${e ? GM.karte(e.k, {a: e.a, v: e.v, klasse: 'mini'}) : '<span class="kk-leer"></span>'}</div>`;
  const gAva = v.stufe ? G.portrait(v.stufe, 46) : `<span class="ava gross-m" style="background:var(--${v.gegner_farbe || 'aew'})">${esc((v.gegner_name || '?')[0].toUpperCase())}</span>`;
  const statusText = v.status === 'fertig' ? 'Kampf vorbei' : !v.dran ? `Warte auf ${esc(v.gegner_name)} …` : v.phase === 'frage' ? 'Beantworte die Zugfrage' : K.wahl != null ? 'Tippe ein freies Feld an' : 'Dein Zug – lege Karten und beende den Zug';
  app.innerHTML = `<div class="kk ${v.dran ? 'dran' : ''}" id="kk">
    <div class="kk-leiste"><button class="btn ghost" id="kkZurueck">${L.ICON.back}<span>Übersicht</span></button><span class="kk-titel">${v.stufe ? 'Stufe ' + v.stufe : 'Gegen deine Klasse'} · Zug ${Math.max(1, v.du.zug)}</span>${v.status === 'laeuft' ? '<button class="btn ghost" id="kkAufgeben">Aufgeben</button>' : '<span></span>'}</div>
    <div class="kk-spieler gegner">${gAva}<div class="kk-sp-info"><b>${esc(v.gegner_name || 'Gegner')}</b>${GM.hpBar(K.hp.gegner, v.gegner.maxhp, {id: 'hpG'})}</div>
      <div class="kk-zaehler"><span class="kk-gegner-hand" title="${v.gegner.hand} Handkarten">${Array.from({length: Math.min(v.gegner.hand, 6)}, () => GM.kartenRueck('winzig')).join('')}</span><span title="Karten im Deck">${G.ico.deck}${v.gegner.deck}</span></div></div>
    <div class="kk-feld gegner">${[0, 1, 2].map(i => lane(v.gegner.feld[i], i)).join('')}</div>
    <div class="kk-mitte"><span class="kk-status">${statusText}</span></div>
    <div class="kk-feld du">${[0, 1, 2].map(i => lane(v.du.feld[i], i, true)).join('')}</div>
    <div class="kk-spieler du"><div class="kk-sp-info"><b>Du</b>${GM.hpBar(K.hp.du, v.du.maxhp, {id: 'hpD'})}</div>
      <div class="kk-fokus" title="Fokus: bezahlt deine Karten"><span class="kk-fokus-zahl">${G.ico.fokus}<b>${v.du.fokus}</b></span><span class="kk-pips">${Array.from({length: 6}, (_, i) => `<i class="${i < v.du.fokus ? 'an' : ''}"></i>`).join('')}</span>${v.du.bonus ? '<span class="tag kk-bonus">Wissensbonus aktiv</span>' : ''}</div>
      <div class="kk-knoepfe"><span class="kk-deck" title="Karten im Deck">${G.ico.deck}${v.du.deck}</span><button class="btn primary" id="kkEnde" ${v.dran && v.phase === 'spielen' && !K.busy ? '' : 'disabled'}>Zug beenden ${L.ICON.pfeil}</button></div></div>
    <div class="kk-hand" style="--n:${v.du.hand.length}">${v.du.hand.map((id, i) => `<button class="kk-hk ${spielbar(id) ? 'spielbar' : ''} ${K.wahl === i ? 'gewaehlt' : ''}" data-h="${i}" style="--i:${i}" aria-label="${esc(katalog[id] ? katalog[id].name : id)}">${GM.karte(id)}</button>`).join('') || '<p class="muted small kk-hand-leer">Keine Karten auf der Hand.</p>'}</div>
  </div>`;
  K.root = $('#kk');
  // Lebensbalken auf den neuen Stand bringen (animiert)
  requestAnimationFrame(() => { if (K.hp.du !== v.du.hp){ K.hp.du = v.du.hp; GM.hpSetzen(hpEl(K, 'du'), v.du.hp); } if (K.hp.gegner !== v.gegner.hp){ K.hp.gegner = v.gegner.hp; GM.hpSetzen(hpEl(K, 'gegner'), v.gegner.hp); } });
  $('#kkZurueck').onclick = () => L.go('#/games/karten');
  const auf = $('#kkAufgeben'); if (auf) auf.onclick = aufgeben.bind(null, K);
  $('#kkEnde').onclick = () => zugBeenden(K);
  K.root.querySelectorAll('.kk-hk').forEach(b => b.onclick = () => {
    const i = +b.dataset.h, id = v.du.hand[i];
    if (!v.dran) return L.toast('Du bist gerade nicht dran.');
    if (v.phase !== 'spielen') return frageZeigen(K);
    if (!frei.length) return L.toast('Alle deine Felder sind belegt.');
    if (katalog[id].kosten > v.du.fokus) return L.toast(`Zu teuer: ${katalog[id].kosten} Fokus, du hast ${v.du.fokus}.`);
    K.wahl = K.wahl === i ? null : i; zeichne(K);
    if (K.wahl != null && frei.length === 1) spielen(K, K.wahl, frei[0]);   // nur ein Feld frei: direkt legen
  });
  K.root.querySelectorAll('.kk-feld.du .kk-lane:not(.belegt)').forEach(f => { f.onclick = () => { if (K.wahl != null) spielen(K, K.wahl, +f.dataset.lane); else L.toast('Tippe zuerst eine Karte auf deiner Hand an.'); }; f.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' ') f.click(); }; });
}
async function spielen(K, h, feld){
  if (K.busy) return; K.busy = true;
  try {
    const neu = await GM.rpc('kampf_spielen', {p_id: K.id, p_hand: h, p_feld: feld});
    K.wahl = null; GM.klang('flip');
    const ev = (neu.log || []).filter(e => e.n > K.gesehen && e.art === 'spielt' && e.p === neu.ich);
    K.v = neu; K.gesehen = neu.logn; merken(K); zeichne(K);
    const k = karteEl(K, 'du', feld); if (k) k.classList.add('erscheint');
    ev.filter(e => e.aktiv).forEach(e => blase(K, 'du', fText(e), true));
    if (neu.status === 'fertig') setTimeout(() => ende(K), 700);
  } catch(e){ L.toast(GM.fehlerText(e)); K.wahl = null; zeichne(K); }
  finally { K.busy = false; }
}
async function zugBeenden(K){
  if (K.busy) return; K.busy = true;
  const b = $('#kkEnde'); if (b) b.disabled = true;
  status(K, 'Angriff!');
  try { const neu = await GM.rpc('kampf_zug_beenden', {p_id: K.id}); await uebernehmen(K, neu); }
  catch(e){ L.toast(GM.fehlerText(e)); if (b) b.disabled = false; }
  finally { K.busy = false; }
}
async function aufgeben(K){
  if (!confirm('Wirklich aufgeben? Dein Gegner gewinnt, du bekommst keine Belohnung.')) return;
  try { const neu = await GM.rpc('kampf_aufgeben', {p_id: K.id}); K.v = neu; zeichne(K); ende(K); } catch(e){ L.toast(GM.fehlerText(e)); }
}
function frageZeigen(K){
  if (!K.root || K.root.querySelector('.kk-frage') || !K.v.frage) return;
  const w = document.createElement('div'); w.className = 'kk-frage';
  w.innerHTML = `<div class="kk-frage-box pop-in"><div class="kk-frage-kopf"><span class="eyebrow">Zugfrage · Zug ${K.v.du.zug}</span><span class="small muted">Richtig: <b>+1 Fokus</b> und Wissens-Fähigkeiten wirken</span></div>${GM.frageHtml(K.v.frage)}<div class="kk-frage-fuss"></div></div>`;
  K.root.appendChild(w);
  const root = w.querySelector('.gfrage');
  GM.frageBinden(root, async wahl => {
    try {
      const neu = await GM.rpc('kampf_antwort', {p_id: K.id, p_wahl: wahl});
      GM.frageAufloesen(root, wahl, neu.antwort.richtig, {warum: true});
      const fuss = w.querySelector('.kk-frage-fuss');
      fuss.innerHTML = `<div class="feedback ${neu.antwort.ok ? 'ok' : 'bad'} pop">${neu.antwort.ok ? L.ICON.ok + 'Richtig! +1 Fokus, Wissensbonus aktiv.' : L.ICON.x + 'Leider falsch – diesmal kein Bonus.'}</div><button class="btn primary" id="kkWeiter">Weiter zum Zug</button>`;
      const weiter = () => { w.remove(); K.v = neu; K.gesehen = neu.logn; merken(K); zeichne(K); };
      $('#kkWeiter').onclick = weiter; $('#kkWeiter').focus();
      if (neu.antwort.ok) setTimeout(() => { if (document.body.contains(w)) weiter(); }, 1300);
    } catch(e){ L.toast(GM.fehlerText(e)); GM.frageFrei(root); }
  });
}
function ende(K){
  if (K.fertig) return; K.fertig = true;
  const v = K.v, b = v.belohnung, name = v.gegner_name || 'Gegner';
  const sub = v.aufgegeben != null ? (v.aufgegeben === v.ich ? 'Du hast aufgegeben.' : `${esc(name)} hat aufgegeben.`) : `gegen ${esc(name)} · ${Math.max(0, v.du.hp)} : ${Math.max(0, v.gegner.hp)} Lebenspunkte`;
  const neuFrei = b && b.stufe_neu ? (STUFEN[b.stufe_neu] ? `<p class="ge-neu">${L.ICON.lock} Neuer Gegner freigeschaltet: <b>${esc(STUFEN[b.stufe_neu].name)}</b> · +1 Booster</p>` : `<p class="ge-neu">Alle Gegner besiegt – stark! +1 Booster</p>`) : '';
  const knoepfe = v.stufe
    ? `${b && b.stufe_neu && b.stufe_neu < 5 ? `<button class="btn primary" data-a="naechste">Nächster Gegner ${L.ICON.pfeil}</button>` : ''}<button class="btn ${b && b.stufe_neu && b.stufe_neu < 5 ? '' : 'primary'}" data-a="nochmal">Nochmal</button><button class="btn ghost" data-a="lobby">Übersicht</button>`
    : `<button class="btn primary" data-a="revanche">${G.ico.schwert}Revanche</button><button class="btn ghost" data-a="lobby">Übersicht</button>`;
  const w = document.createElement('div'); w.className = 'kk-ende';
  w.innerHTML = GM.ergebnisHtml({ergebnis: v.ergebnis, eyebrow: 'Karten-Kampf', sub, belohnung: b, extra: neuFrei, knoepfe});
  (K.root || L.app()).appendChild(w);
  GM.ergebnisAn(w, v.ergebnis);
  w.querySelectorAll('[data-a]').forEach(x => x.onclick = () => {
    const a = x.dataset.a;
    if (a === 'lobby') return L.go('#/games/karten');
    if (a === 'nochmal') return starten({p_stufe: v.stufe}, x);
    if (a === 'naechste') return starten({p_stufe: b.stufe_neu + 1}, x);
    if (a === 'revanche') return starten({p_gegner: v.gegner_id}, x);
  });
  GM.nachSpiel(`Karten-Kampf gegen ${name}: ${{sieg: 'gewonnen', niederlage: 'verloren', remis: 'unentschieden'}[v.ergebnis] || v.ergebnis}`);
}

GM.MODULE.karten = h => { const id = h.split('/')[3]; return id ? viewKampf(id) : viewLobby(); };
})();
