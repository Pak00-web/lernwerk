/* Lernwerk Games – Lernwerk Legends (Karten-Kampf). Regeln, Zufall und Computer-Gegner laufen auf dem Server
   (_k2_* und kampf_* in supabase/2026-09-23-karten-v2.sql), hier wird nur angezeigt und abgespielt. */
(function(){
"use strict";
const L = window.LW, GM = window.LW_GAMES, G = window.GGFX, $ = (s, r=document) => r.querySelector(s), esc = L.esc;
const BOSSE = [
  {name: 'Praktikant Paul', hp: 20, text: 'Erster Tag im Betrieb – perfekt zum Reinkommen.'},
  {name: 'Azubi-Kollegin Ayla', hp: 16, text: 'Setzt auf Wächter und Unterweisungen.'},
  {name: 'Hacker Hex', hp: 22, text: 'Getarnt, giftig und voller Fallen.'},
  {name: 'Lead-Dev Kaya', hp: 24, text: 'Zieht Karten, betäubt und beschwört Bugs.'},
  {name: 'Ausbilder Bernd', hp: 20, text: 'Starke Teams, dicke Schilde, viel Heilung.'},
  {name: 'Prüfungsausschuss', hp: 42, text: 'Das Finale – mit allen drei Legendären.'},
];
const FREI = [['leicht', 'Leicht', 'Trainings-Bot · 22 LP'], ['mittel', 'Mittel', 'Duell-Bot · 25 LP'], ['schwer', 'Schwer', 'Meister-Bot · 28 LP']];
const warte = ms => new Promise(r => setTimeout(r, ms));
const kat = () => GM.katalog || {};
let vorgeladen = null;

/* ---------- Anleitung (einmalig) ---------- */
const TUTORIAL = [
  ['Zugfrage', 'Jeder Zug beginnt mit einer Frage aus eurem Unterricht. <b>Richtig</b> heißt: <b>+1 Fokus, +1 Karte</b> – und alle Monster mit <b>„Erleuchtet“</b> lösen ihren Effekt aus. Wissen ist deine stärkste Waffe.', 'fokus'],
  ['Fokus & Karten', 'Fokus bezahlt deine Karten. Er wächst jeden Zug um 1 (bis 8). <b>Monster</b> kommen auf einen der 4 Plätze, <b>Zauber</b> wirken sofort, <b>Fallen</b> liegen verdeckt und schnappen zu, wenn der Gegner angreift oder ein Monster ausspielt.', 'deck'],
  ['Angreifen', 'Tippe ein eigenes Monster an und dann das Ziel: ein gegnerisches Monster oder den Helden. Frisch gelegte Monster greifen erst im nächsten Zug an (außer mit <b>Ansturm</b>). <b>Wächter</b> müssen zuerst fallen.', 'schwert'],
  ['Serie & Aufstieg', '<b>3 richtige Antworten in Folge</b> schalten einen <b>Aufstieg</b> frei: ein Monster bekommt +3/+3 und ein Schlüsselwort. <b>Legendäre Karten</b> kannst du nur in einem Zug mit richtiger Antwort spielen.', 'pokal'],
  ['Sammeln', 'Siege bringen XP, Coins und Booster. Im Booster steckt vielleicht eine legendäre Karte – spätestens im 15. ganz sicher. Überzählige Karten werden zu <b>Wissensstaub</b>, damit stellst du gezielt Karten her.', 'booster'],
];
function anleitung(fertig){
  let i = 0;
  const w = document.createElement('div'); w.className = 'overlay';
  const zeichne = () => {
    const [t, text, ico] = TUTORIAL[i];
    w.innerHTML = `<div class="overlay-box pop-in kk-tut"><div class="kk-tut-ico">${G.ico[ico]}</div><div class="eyebrow">So funktioniert’s · ${i + 1} / ${TUTORIAL.length}</div><h2>${t}</h2><p>${text}</p>
      <div class="kk-tut-punkte">${TUTORIAL.map((_, k) => `<i class="${k === i ? 'an' : ''}"></i>`).join('')}</div>
      <div class="row" style="justify-content:center">${i ? '<button class="btn ghost" data-a="zurueck">Zurück</button>' : ''}<button class="btn primary" data-a="weiter">${i < TUTORIAL.length - 1 ? 'Weiter' : 'Los geht’s'}</button></div></div>`;
    w.querySelector('[data-a="weiter"]').onclick = () => { if (i < TUTORIAL.length - 1){ i++; zeichne(); } else { w.remove(); try { localStorage.setItem('lernwerk.kk2.tutorial', '1'); } catch(e){} fertig && fertig(); } };
    const z = w.querySelector('[data-a="zurueck"]'); if (z) z.onclick = () => { i--; zeichne(); };
  };
  document.body.appendChild(w); zeichne();
}

/* ---------- Lobby ---------- */
async function viewLobby(){
  const app = L.app();
  app.innerHTML = GM.zurueck() + L.seitenKopf('Lernwerk Legends', 'Karten-Kampf', 'Beschwöre Monster, lege Fallen – und beantworte Fragen, um die Oberhand zu gewinnen.') + `<div id="kkl">${GM.laedt()}</div>`;
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
  const deck = konto.deck || [];
  el.innerHTML = `
  <div class="kk-lobby-oben">
    <div class="panel kk-deck-kasten"><div class="section-head"><h3>Dein Deck</h3><button class="btn ghost klein" data-ziel="#/games/sammlung">${G.ico.deck}Bearbeiten</button></div>
      <div class="kk-deck-faecher">${deck.slice().sort((a, b) => (kat()[b] || {}).kosten - (kat()[a] || {}).kosten).slice(0, 5).map((id, i) => `<div style="--i:${i}">${GM.karte(id, {klasse: 'klein'})}</div>`).join('')}</div>
      <p class="small muted">${deck.length} Karten · ${konto.booster ? `<a href="#/games/sammlung/oeffnen">${konto.booster} Booster warten auf dich</a>` : 'Booster gibt es für Siege'}</p></div>
    <div class="panel kk-regel-kasten"><h3>${G.ico.hinweis} Kurz erklärt</h3><ul>
      <li><b>Richtige Zugfrage:</b> +1 Fokus, +1 Karte, „Erleuchtet“-Effekte</li><li><b>3 richtig in Folge:</b> Aufstieg (+3/+3)</li><li><b>Legendäre</b> nur nach richtiger Antwort</li></ul>
      <button class="btn ghost klein" id="tut">Anleitung ansehen</button></div>
  </div>
  ${pve ? `<div class="panel kk-fortsetzen">${pve.stufe ? G.portrait(pve.stufe, 44) : `<span class="ava ki gross-m">${G.ico.bot}</span>`}<div><b>Laufender Kampf gegen ${esc(pve.stufe ? BOSSE[pve.stufe - 1].name : 'die KI')}</b><small class="muted">Du kannst genau da weitermachen, wo du aufgehört hast.</small></div><button class="btn primary" data-oeffnen="${pve.id}">Fortsetzen</button></div>` : ''}
  <section class="section"><div class="section-head"><h2>Kampagne</h2><span class="muted small">${besiegt} / ${BOSSE.length} besiegt · erster Sieg je Gegner: +1 Booster</span></div>
    <div class="kk-stufen">${BOSSE.map((s, i) => { const n = i + 1, zu = n > besiegt + 1, weg = n <= besiegt;
      return `<div class="panel kk-stufe ${zu ? 'zu' : ''} ${weg ? 'besiegt' : ''}" style="--k:${i}">${G.portrait(n, 56)}
        <div class="kk-st-text"><b>${esc(s.name)}</b><small>Gegner ${n} · ${s.hp} Lebenspunkte${weg ? ' · besiegt' : ''}</small><p class="small muted">${esc(s.text)}</p></div>
        ${zu ? `<span class="kk-schloss" title="Besiege zuerst Gegner ${n - 1}">${L.ICON.lock}</span>` : `<button class="btn ${weg ? '' : 'primary'}" data-stufe="${n}">${weg ? 'Nochmal' : 'Kämpfen'}</button>`}</div>`; }).join('')}</div></section>
  <section class="section"><div class="section-head"><h2>${G.ico.bot} Freies Spiel gegen die KI</h2><span class="muted small">zufälliges KI-Deck · ohne Rangpunkte</span></div>
    <div class="ki-wahl">${FREI.map(([id, n, t]) => `<button class="btn" data-frei="${id}"><b>${n}</b><small>${t}</small></button>`).join('')}</div></section>
  <section class="section"><div class="section-head"><h2>Gegen deine Klasse</h2><button class="btn" id="herausfordern">${G.ico.schwert}Mitschüler herausfordern</button></div>
    ${pvp.length ? `<div class="stack">${pvp.map(k => { const g = gegner(k), dran = k.am_zug === GM.ich();
      return `<div class="panel drow ${dran ? 'dran' : ''}"><span class="ava" style="background:var(--${g.farbe})">${esc(g.spitzname[0].toUpperCase())}</span><div><b>${esc(g.spitzname)}</b><div class="small muted">${dran ? 'Du bist dran' : 'Wartet auf ' + esc(g.spitzname)}</div></div><span></span><button class="btn ${dran ? 'primary' : ''}" data-oeffnen="${k.id}">${dran ? 'Spielen' : 'Ansehen'}</button></div>`; }).join('')}</div>`
      : `<p class="muted small">Noch keine Kämpfe gegen Mitschüler. Ihr spielt abwechselnd – jeder, wann er Zeit hat.</p>`}</section>`;
  GM.zieleBinden(el);
  el.querySelectorAll('[data-stufe]').forEach(b => b.onclick = () => starten({p_stufe: +b.dataset.stufe}, b));
  el.querySelectorAll('[data-frei]').forEach(b => b.onclick = () => starten({p_frei: b.dataset.frei}, b));
  el.querySelectorAll('[data-oeffnen]').forEach(b => b.onclick = () => L.go('#/games/karten/' + b.dataset.oeffnen));
  $('#herausfordern').onclick = gegnerWaehlen;
  $('#tut').onclick = () => anleitung();
  let gesehen = false; try { gesehen = !!localStorage.getItem('lernwerk.kk2.tutorial'); } catch(e){ gesehen = true; }
  if (!gesehen) anleitung();
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

/* ---------- Kampf: Aufbau ---------- */
const merkeKey = id => 'lernwerk.kampf.' + id;
async function viewKampf(id){
  const app = L.app();
  let v = vorgeladen && vorgeladen.id === id ? vorgeladen : null; vorgeladen = null;
  if (!v) app.innerHTML = GM.laedt('Kampf wird geladen …');
  try { await GM.katalogLaden(); if (!v) v = await GM.rpc('kampf_ansicht', {p_id: id}); }
  catch(e){ return GM.fehlerZeigen(app, e, () => viewKampf(id)); }
  let gesehen = 0; try { gesehen = +localStorage.getItem(merkeKey(id)) || 0; } catch(e){}
  const K = {id, v, wahl: null, busy: false, hp: {du: v.du.hp, gegner: v.gegner.hp}, gesehen: v.logn, fertig: false, neu: new Set()};
  merken(K);
  zeichne(K);
  // Züge des Gegners seit dem letzten Besuch hervorheben
  if (gesehen && v.log) v.log.filter(e => e.n > gesehen && (e.art === 'spielt' || e.art === 'beschwoert') && e.p !== v.ich && e.platz != null).forEach(e => { const u = einheitEl(K, 'gegner', e.platz); if (u) u.classList.add('erscheint'); });
  weiterNachZeichnen(K);
  if (!v.stufe && !v.frei && v.status === 'laeuft'){
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
function weiterNachZeichnen(K){
  if (K.v.status === 'fertig') return ende(K);
  if (K.v.dran && K.v.phase === 'frage' && K.v.frage) setTimeout(() => frageZeigen(K), 350);
}

/* ---------- Kampf: Darstellung ---------- */
const seite = (K, p) => p === K.v.ich ? 'du' : 'gegner';
const platzEl = (K, s, i) => K.root && K.root.querySelector(`.kk-reihe.${s} .kk-platz[data-platz="${i}"]`);
const einheitEl = (K, s, i) => { const p = platzEl(K, s, i); return p && p.querySelector('.einheit'); };
const heldEl = (K, s) => K.root && K.root.querySelector('.kk-held.' + s);
const hpEl = (K, s) => K.root && K.root.querySelector(s === 'du' ? '#hpD' : '#hpG');
function anim(el, kl){ if (!el) return; el.classList.remove(kl); void el.offsetWidth; el.classList.add(kl); }
function blase(K, s, text, gut){
  const ziel = heldEl(K, s); if (!ziel) return;
  const b = document.createElement('div'); b.className = 'kk-blase ' + (gut ? 'gut' : gut === false ? 'schlecht' : ''); b.textContent = text;
  ziel.appendChild(b); setTimeout(() => b.remove(), 1800);
}
// Monster auf dem Brett (Runeterra-artige Marke)
function einheit(m, o = {}){
  const k = kat()[m.k] || {}, sch = m.sch || [], verletzt = m.v < m.max;
  return `<div class="einheit s-${k.seltenheit || 'common'} ${m.auf ? 'auf' : ''} ${m.schild ? 'schild' : ''} ${m.tarn ? 'tarn' : ''} ${m.bet ? 'bet' : ''} ${o.bereit ? 'bereit' : ''} ${sch.includes('waechter') ? 'waechter' : ''} ${o.klasse || ''}" style="--fc:${(G.FACH[k.fach] || {}).farbe}" title="${esc(k.name || '')}">
    <div class="eh-bild">${G.kartenBild(k)}</div>
    <div class="eh-kw">${sch.map(kw => G.kwIco(kw, 'kw-' + kw)).join('')}</div>
    <span class="eh-atk ${m.a > k.angriff ? 'hoch' : ''}">${m.a}</span><span class="eh-hp ${verletzt ? 'runter' : m.v > k.verteidigung ? 'hoch' : ''}">${m.v}</span>
    ${m.bet ? '<span class="eh-bet" title="Betäubt: kann im nächsten Zug nicht angreifen">z<small>z</small></span>' : ''}
  </div>`;
}
// Welche Ziele sind für die aktuelle Auswahl gültig? → Set aus 'g0'…'g3', 'e0'…'e3', 'held', 'leer0'…'leer3'
function ziele(K){
  const v = K.v, w = K.wahl, z = new Set(); if (!w) return z;
  const gFeld = v.gegner.feld, dFeld = v.du.feld;
  if (w.art === 'angriff'){
    const waechter = gFeld.some(m => m && (m.sch || []).includes('waechter') && !m.tarn);
    gFeld.forEach((m, i) => { if (m && !m.tarn && (!waechter || (m.sch || []).includes('waechter'))) z.add('g' + i); });
    if (!waechter) z.add('held');
  } else if (w.art === 'aufstieg'){
    dFeld.forEach((m, i) => { if (m && !m.auf) z.add('e' + i); });
  } else if (w.art === 'hand'){
    const k = kat()[v.du.hand[w.i]]; if (!k) return z;
    if (k.typ === 'monster') dFeld.forEach((m, i) => { if (!m) z.add('leer' + i); });
    else if (k.typ === 'zauber'){
      const zi = (k.effekt[0] || {}).ziel;
      if (zi === 'monster' || zi === 'wahl') gFeld.forEach((m, i) => { if (m) z.add('g' + i); });
      if (zi === 'wahl') z.add('held');
      if (zi === 'eigen') dFeld.forEach((m, i) => { if (m) z.add('e' + i); });
    }
  }
  return z;
}
const brauchtZiel = k => k && ((k.typ === 'monster') || (k.typ === 'zauber' && ['monster', 'wahl', 'eigen'].includes((k.effekt[0] || {}).ziel)));
function spielbar(K, id){
  const v = K.v, k = kat()[id];
  if (!k || !v.dran || v.phase !== 'spielen' || k.kosten > v.du.fokus) return false;
  if (k.seltenheit === 'legendary' && !v.du.bonus) return false;
  if (k.typ === 'monster') return v.du.feld.some(m => !m);
  if (k.typ === 'falle') return v.du.fallen.some(f => !f);
  if (brauchtZiel(k)){ const alt = K.wahl; K.wahl = {art: 'hand', i: v.du.hand.indexOf(id)}; const n = ziele(K).size; K.wahl = alt; return n > 0; }
  return true;
}
const kannAngreifen = (K, m) => K.v.dran && K.v.phase === 'spielen' && m && m.bereit && !m.bet && m.a > 0;

function zeichne(K){
  const v = K.v, app = L.app();
  const z = ziele(K), w = K.wahl;
  const gAva = v.stufe ? G.portrait(v.stufe, 46) : v.frei ? `<span class="ava ki gross-m">${G.ico.bot}</span>` : `<span class="ava gross-m" style="background:var(--${v.gegner_farbe || 'aew'})">${esc((v.gegner_name || '?')[0].toUpperCase())}</span>`;
  const statusText = v.status === 'fertig' ? 'Kampf vorbei' : !v.dran ? `Warte auf ${esc(v.gegner_name)} …` : v.phase === 'frage' ? 'Beantworte die Zugfrage'
    : w && w.art === 'angriff' ? 'Wähle ein Ziel für den Angriff' : w && w.art === 'aufstieg' ? 'Welches Monster steigt auf?' : w && w.art === 'hand' ? (brauchtZiel(kat()[v.du.hand[w.i]]) ? 'Wähle ein Ziel' : 'Karte ausspielen?') : 'Dein Zug – spiele Karten und greife an';
  const reihe = (s, feld) => `<div class="kk-reihe ${s}">${[0, 1, 2, 3].map(i => { const m = feld[i], key = (s === 'du' ? 'e' : 'g') + i;
    const istZiel = z.has(key) || (s === 'du' && z.has('leer' + i)), gewaehlt = s === 'du' && w && w.art === 'angriff' && w.platz === i;
    return `<div class="kk-platz ${m ? 'belegt' : ''} ${istZiel ? 'ziel' : ''} ${gewaehlt ? 'gewaehlt' : ''}" data-platz="${i}" data-seite="${s}" role="button" tabindex="0" aria-label="${m ? esc((kat()[m.k] || {}).name || '') : 'Freier Platz ' + (i + 1)}">
      ${m ? einheit(m, {bereit: s === 'du' && kannAngreifen(K, m), klasse: K.neu.has(s + i) ? 'erscheint' : ''}) : '<span class="kk-leer"></span>'}</div>`; }).join('')}</div>`;
  const fokusPips = `<span class="kk-pips" title="Fokus ${v.du.fokus} von ${v.du.maxfokus}${v.du.bonus ? ' (+1 Wissensbonus)' : ''}">${Array.from({length: Math.max(v.du.maxfokus + (v.du.bonus ? 1 : 0), v.du.fokus)}, (_, i) => `<i class="${i < v.du.fokus ? 'an' : ''} ${i >= v.du.maxfokus ? 'bonus' : ''}"></i>`).join('')}</span>`;
  const serie = `<span class="kk-serie" title="Richtige Antworten in Folge – bei 3 gibt es einen Aufstieg">${[0, 1, 2].map(i => `<i class="${i < (v.du.serie % 3 || (v.du.aufstieg && v.du.serie ? 3 : 0)) ? 'an' : ''}"></i>`).join('')}</span>`;
  app.innerHTML = `<div class="kk ${v.dran ? 'dran' : ''}" id="kk">
    <div class="kk-leiste"><button class="btn ghost" id="kkZurueck">${L.ICON.back}<span>Übersicht</span></button><span class="kk-titel">${v.stufe ? 'Gegner ' + v.stufe : v.frei ? 'Freies Spiel' : 'Gegen deine Klasse'} · Zug ${Math.max(1, v.du.zug)}</span>${v.status === 'laeuft' ? '<button class="btn ghost" id="kkAufgeben">Aufgeben</button>' : '<span></span>'}</div>
    <div class="kk-held gegner ${z.has('held') ? 'ziel' : ''}" data-held="1">${gAva}<div class="kk-held-info"><b>${esc(v.gegner_name || 'Gegner')}</b>${GM.hpBar(K.hp.gegner, v.gegner.maxhp, {id: 'hpG'})}</div>
      <div class="kk-zaehler"><span class="kk-gegner-hand" title="${v.gegner.hand} Handkarten">${Array.from({length: Math.min(v.gegner.hand, 8)}, () => '<i></i>').join('')}<b>${v.gegner.hand}</b></span>
        <span title="Verdeckte Fallen">${(v.gegner.fallen || []).map(f => `<i class="kk-falle ${f ? 'an' : ''}">${f ? '?' : ''}</i>`).join('')}</span><span title="Karten im Deck">${G.ico.deck}${v.gegner.deck}</span></div></div>
    ${reihe('gegner', v.gegner.feld)}
    <div class="kk-mitte"><span class="kk-status">${statusText}</span></div>
    ${reihe('du', v.du.feld)}
    <div class="kk-held du"><div class="kk-held-info"><b>Du</b>${GM.hpBar(K.hp.du, v.du.maxhp, {id: 'hpD'})}</div>
      <div class="kk-ressourcen"><span class="kk-fokus-zahl" title="Fokus">${G.ico.fokus}<b>${v.du.fokus}</b></span>${fokusPips}${serie}
        ${v.du.aufstieg ? `<button class="btn klein kk-aufstieg ${w && w.art === 'aufstieg' ? 'aktiv' : ''}" id="kkAufstieg" ${v.dran && v.phase === 'spielen' && v.du.feld.some(m => m && !m.auf) ? '' : 'disabled'}>${G.ico.pokal}Aufstieg</button>` : ''}
        <span class="kk-meine-fallen" title="Deine gelegten Fallen">${v.du.fallen.map(f => f ? `<i class="kk-falle an" title="${esc((kat()[f.k] || {}).name || '')}">${G.kwIco('waechter')}</i>` : '<i class="kk-falle"></i>').join('')}</span></div>
      <div class="kk-knoepfe"><span class="kk-deck" title="Karten im Deck">${G.ico.deck}${v.du.deck}</span><button class="btn primary" id="kkEnde" ${v.dran && v.phase === 'spielen' && !K.busy ? '' : 'disabled'}>Zug beenden ${L.ICON.pfeil}</button></div></div>
    <div class="kk-hand" style="--n:${v.du.hand.length}">${v.du.hand.map((id, i) => `<button class="kk-hk ${spielbar(K, id) ? 'spielbar' : ''} ${w && w.art === 'hand' && w.i === i ? 'gewaehlt' : ''}" data-h="${i}" style="--i:${i}" aria-label="${esc((kat()[id] || {}).name || id)}">${GM.karte(id, {klasse: 'klein'})}</button>`).join('') || '<p class="muted small kk-hand-leer">Keine Karten auf der Hand.</p>'}</div>
    ${w && w.art === 'hand' ? vorschau(K, v.du.hand[w.i]) : ''}
    ${w && w.art === 'info' ? infoVorschau(K) : ''}
  </div>`;
  K.root = $('#kk'); K.neu.clear();
  requestAnimationFrame(() => { if (K.hp.du !== v.du.hp){ K.hp.du = v.du.hp; GM.hpSetzen(hpEl(K, 'du'), v.du.hp); } if (K.hp.gegner !== v.gegner.hp){ K.hp.gegner = v.gegner.hp; GM.hpSetzen(hpEl(K, 'gegner'), v.gegner.hp); } });
  binden(K);
}
// große Karte der Auswahl mit Aktion
function vorschau(K, id){
  const k = kat()[id], ok = spielbar(K, id);
  const grund = !K.v.dran ? 'Du bist gerade nicht dran.' : K.v.phase !== 'spielen' ? 'Beantworte zuerst die Zugfrage.' : k.kosten > K.v.du.fokus ? `Zu teuer: ${k.kosten} Fokus, du hast ${K.v.du.fokus}.`
    : k.seltenheit === 'legendary' && !K.v.du.bonus ? 'Legendäre Karten nur in einem Zug mit richtiger Antwort.' : !ok ? (k.typ === 'monster' ? 'Alle Plätze sind belegt.' : k.typ === 'falle' ? 'Du hast schon zwei Fallen gelegt.' : 'Kein gültiges Ziel.') : '';
  const hinweis = grund || (k.typ === 'monster' ? 'Tippe einen freien Platz an.' : brauchtZiel(k) ? 'Tippe ein markiertes Ziel an.' : '');
  return `<div class="kk-vorschau pop-in"><div class="kk-vorschau-karte">${GM.karte(id)}</div><div class="kk-vorschau-akt"><p class="small ${grund ? 'kk-grund' : 'muted'}">${hinweis}</p>
    ${ok && !brauchtZiel(k) ? `<button class="btn primary" id="kkSpielen">${k.typ === 'falle' ? 'Falle legen' : 'Ausspielen'}</button>` : ''}<button class="btn ghost" id="kkAbbrechen">Abbrechen</button></div></div>`;
}
function infoVorschau(K){
  const w = K.wahl, m = (w.seite === 'du' ? K.v.du : K.v.gegner).feld[w.platz]; if (!m) return '';
  const k = kat()[m.k] || {};
  return `<div class="kk-vorschau pop-in"><div class="kk-vorschau-karte">${GM.karte(m.k)}</div><div class="kk-vorschau-akt">
    <p class="small"><b>Jetzt:</b> ${m.a} Angriff · ${m.v} / ${m.max} Leben${m.auf ? ' · aufgestiegen' : ''}</p>
    ${(m.sch || []).filter(kw => !(k.schluessel || []).includes(kw)).length ? `<p class="small">Dazu: ${GM.kwChips((m.sch || []).filter(kw => !(k.schluessel || []).includes(kw)))}</p>` : ''}
    ${m.schild ? '<p class="small">Schild aktiv</p>' : ''}${m.tarn ? '<p class="small">Getarnt</p>' : ''}${m.bet ? '<p class="small">Betäubt – greift im nächsten Zug nicht an</p>' : ''}
    <button class="btn ghost" id="kkAbbrechen">Schließen</button></div></div>`;
}
function binden(K){
  const v = K.v;
  $('#kkZurueck').onclick = () => L.go('#/games/karten');
  const auf = $('#kkAufgeben'); if (auf) auf.onclick = () => aufgeben(K);
  $('#kkEnde').onclick = () => zugBeenden(K);
  const ab = $('#kkAbbrechen'); if (ab) ab.onclick = () => { K.wahl = null; zeichne(K); };
  const sp = $('#kkSpielen'); if (sp) sp.onclick = () => spielen(K, K.wahl.i, null, null);
  const au = $('#kkAufstieg'); if (au) au.onclick = () => { K.wahl = K.wahl && K.wahl.art === 'aufstieg' ? null : {art: 'aufstieg'}; zeichne(K); };
  K.root.querySelectorAll('.kk-hk').forEach(b => b.onclick = () => {
    const i = +b.dataset.h;
    if (v.dran && v.phase === 'frage') return frageZeigen(K);
    K.wahl = K.wahl && K.wahl.art === 'hand' && K.wahl.i === i ? null : {art: 'hand', i};
    // Monster und nur ein Platz frei → direkt legen
    const k = kat()[v.du.hand[i]];
    if (K.wahl && k && k.typ === 'monster' && spielbar(K, k.id) && v.du.feld.filter(m => !m).length === 1) return spielen(K, i, v.du.feld.findIndex(m => !m), null);
    zeichne(K);
  });
  K.root.querySelectorAll('.kk-platz').forEach(p => {
    p.onclick = () => platzGetippt(K, p.dataset.seite, +p.dataset.platz);
    p.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); p.click(); } };
  });
  const held = K.root.querySelector('.kk-held.gegner');
  held.onclick = () => { if (ziele(K).has('held')) zielGewaehlt(K, 'held'); };
}
function platzGetippt(K, s, i){
  const v = K.v, w = K.wahl, z = ziele(K), key = (s === 'du' ? 'e' : 'g') + i;
  if (w && (z.has(key) || (s === 'du' && z.has('leer' + i)))) return zielGewaehlt(K, s === 'du' && !v.du.feld[i] ? 'leer' + i : key);
  const m = (s === 'du' ? v.du : v.gegner).feld[i];
  if (s === 'du' && kannAngreifen(K, m)){ K.wahl = w && w.art === 'angriff' && w.platz === i ? null : {art: 'angriff', platz: i}; return zeichne(K); }
  if (m){ K.wahl = {art: 'info', seite: s, platz: i}; return zeichne(K); }
  if (w){ K.wahl = null; zeichne(K); }
}
function zielGewaehlt(K, ziel){
  const w = K.wahl;
  if (w.art === 'angriff') return angreifen(K, w.platz, ziel === 'held' ? -1 : +ziel.slice(1));
  if (w.art === 'aufstieg') return aufsteigen(K, +ziel.slice(1));
  if (w.art === 'hand'){
    if (ziel.startsWith('leer')) return spielen(K, w.i, +ziel.slice(4), null);
    return spielen(K, w.i, null, ziel);
  }
}

/* ---------- Kampf: Aktionen ---------- */
async function aktion(K, fn, args, vorher){
  if (K.busy) return; K.busy = true;
  const alt = K.wahl; K.wahl = null;
  try {
    if (vorher) vorher();
    const neu = await GM.rpc(fn, Object.assign({p_id: K.id}, args));
    await uebernehmen(K, neu);
  } catch(e){ L.toast(GM.fehlerText(e)); K.wahl = null; zeichne(K); void alt; }
  finally { K.busy = false; if (K.root) { const b = $('#kkEnde'); if (b) b.disabled = !(K.v.dran && K.v.phase === 'spielen'); } }
}
const spielen = (K, h, platz, ziel) => aktion(K, 'kampf_spielen', {p_hand: h, p_platz: platz, p_ziel: ziel});
const angreifen = (K, von, ziel) => aktion(K, 'kampf_angreifen', {p_von: von, p_ziel: ziel});
const aufsteigen = (K, platz) => aktion(K, 'kampf_aufstieg', {p_platz: platz});
const zugBeenden = K => aktion(K, 'kampf_zug_beenden', {}, () => { const s = K.root.querySelector('.kk-status'); if (s) s.textContent = 'Zug endet …'; });
async function aufgeben(K){
  if (!confirm('Wirklich aufgeben? Dein Gegner gewinnt, du bekommst keine Belohnung.')) return;
  try { const neu = await GM.rpc('kampf_aufgeben', {p_id: K.id}); K.v = neu; zeichne(K); ende(K); } catch(e){ L.toast(GM.fehlerText(e)); }
}

/* ---------- Ereignisse abspielen ---------- */
// Neue Log-Ereignisse nacheinander auf dem bisherigen Bild zeigen, danach den neuen Stand zeichnen.
// Ein Tipp auf das Brett spult vor.
async function uebernehmen(K, neu){
  const ev = (neu.log || []).filter(e => e.n > K.gesehen);
  K.schnell = false;
  const spulen = () => { K.schnell = true; };
  if (K.root) K.root.addEventListener('pointerdown', spulen, {once: true});
  await abspielen(K, ev, neu);
  K.v = neu; K.gesehen = neu.logn; merken(K);
  if (!document.body.contains(K.root)) return;
  zeichne(K);
  weiterNachZeichnen(K);
}
const pause = (K, ms) => K.schnell ? Promise.resolve() : warte(ms);
function zahl(el, text, art){
  if (!el) return; const r = el.getBoundingClientRect(), zm = L.zoom(), d = document.createElement('div');
  d.className = 'schaden-zahl ' + (art || ''); d.textContent = text;
  d.style.left = (r.left + r.width / 2) / zm + 'px'; d.style.top = (r.top + window.scrollY + r.height * .3) / zm + 'px';
  document.body.appendChild(d); setTimeout(() => d.remove(), 1100);
}
// Karte kurz groß zeigen (Gegner spielt etwas / Falle schnappt zu)
async function karteZeigen(K, id, titel){
  if (!K.root || K.schnell) return;
  const w = document.createElement('div'); w.className = 'kk-auftritt';
  w.innerHTML = `<div class="kk-auftritt-in"><div class="eyebrow">${titel}</div>${GM.karte(id)}</div>`;
  K.root.appendChild(w);
  await pause(K, 1150);
  w.classList.add('weg'); await warte(200); w.remove();
}
function heldHp(K, s, delta){
  K.hp[s] = Math.min((s === 'du' ? K.v.du : K.v.gegner).maxhp, K.hp[s] + delta);
  GM.hpSetzen(hpEl(K, s), K.hp[s]);
  if (delta < 0){ anim(heldEl(K, s), 'bebt'); GM.klang('treffer'); }
}
function einheitSetzen(K, s, platz, kid){
  const p = platzEl(K, s, platz); const k = kat()[kid]; if (!p || !k) return;
  p.classList.add('belegt');
  p.innerHTML = einheit({k: kid, a: k.angriff, v: k.verteidigung, max: k.verteidigung, sch: k.schluessel || [], schild: (k.schluessel || []).includes('schild'), tarn: (k.schluessel || []).includes('tarnung')}, {klasse: 'erscheint'});
}
async function abspielen(K, ev, neu){
  for (const e of ev){
    if (!K.root || !document.body.contains(K.root)) return;
    const s = seite(K, e.p), o = s === 'du' ? 'gegner' : 'du';
    const ks = e.zs != null ? seite(K, e.zs) : null;
    switch (e.art){
      case 'zug':
        if (s === 'gegner'){ const st = K.root.querySelector('.kk-status'); if (st) st.textContent = `${neu.gegner_name} ist am Zug …`; await pause(K, 450); }
        break;
      case 'antwort':
        if (s === 'gegner'){ blase(K, 'gegner', e.ok ? `Frage richtig · +1 Fokus${e.aufstieg ? ' · Aufstieg!' : ''}` : 'Frage falsch', e.ok); await pause(K, 700); }
        break;
      case 'spielt':
        if (s === 'gegner'){
          await karteZeigen(K, e.k, e.typ === 'zauber' ? `${esc(neu.gegner_name)} wirkt einen Zauber` : `${esc(neu.gegner_name)} beschwört`);
          const h = K.root.querySelector('.kk-gegner-hand i'); if (h) h.remove();
        }
        if (e.typ === 'monster' && e.platz != null){ einheitSetzen(K, s, e.platz, e.k); GM.klang('flip'); await pause(K, 350); }
        break;
      case 'beschwoert':
        einheitSetzen(K, s, e.platz, e.k); await pause(K, 300); break;
      case 'falle_gelegt':
        if (s === 'gegner'){ blase(K, 'gegner', 'legt eine Falle', null); await pause(K, 500); } break;
      case 'falle':
        await karteZeigen(K, e.k, `Falle von ${s === 'du' ? 'dir' : esc(neu.gegner_name)}!`); break;
      case 'erleuchtet':
        anim(einheitEl(K, s, e.platz), 'leuchtet'); await pause(K, 350); break;
      case 'aufstieg':
        anim(einheitEl(K, s, e.platz), 'steigt-auf'); window.FX && FX.ton('abz'); blase(K, s, 'Aufstieg!', true); await pause(K, 700); break;
      case 'angriff': {
        const a = einheitEl(K, s, e.von), ziel = e.ziel === -1 ? heldEl(K, o) : einheitEl(K, o, e.ziel);
        if (a && ziel){
          const ra = a.getBoundingClientRect(), rz = ziel.getBoundingClientRect(), zm = L.zoom();
          a.style.setProperty('--dx', ((rz.left + rz.width / 2) - (ra.left + ra.width / 2)) * .7 / zm + 'px');
          a.style.setProperty('--dy', ((rz.top + rz.height / 2) - (ra.top + ra.height / 2)) * .7 / zm + 'px');
          anim(a, 'stoesst');
        }
        GM.klang('wusch'); await pause(K, 260);
        if (e.ziel === -1){ heldHp(K, o, -e.schaden); zahl(heldEl(K, o), '−' + e.schaden); }
        else { anim(ziel, 'getroffen'); zahl(ziel, '−' + e.schaden); if (e.zurueck) zahl(a, '−' + e.zurueck); GM.klang('treffer'); }
        await pause(K, 520);
        break; }
      case 'abgewehrt':
        blase(K, s, 'Angriff abgewehrt!', false); await pause(K, 500); break;
      case 'schild':
        zahl(einheitEl(K, s, e.platz), 'Schild!', 'heil'); { const u = einheitEl(K, s, e.platz); if (u) u.classList.remove('schild'); } await pause(K, 250); break;
      case 'effekt':
        if (e.e === 'schaden'){
          if (e.ziel === 'held'){ heldHp(K, ks, -e.wert); zahl(heldEl(K, ks), '−' + e.wert); }
          else { const u = einheitEl(K, ks, e.platz); anim(u, 'getroffen'); zahl(u, '−' + e.wert); GM.klang('treffer'); }
          await pause(K, 380);
        } else if (e.e === 'heilen'){ heldHp(K, ks, e.wert); zahl(heldEl(K, ks), '+' + e.wert, 'heil'); await pause(K, 350); }
        else if (e.e === 'staerken'){ const u = einheitEl(K, ks, e.platz); anim(u, 'leuchtet'); zahl(u, `+${e.a || 0}/+${e.v || 0}`, 'heil'); await pause(K, 300); }
        else if (e.e === 'schild'){ const u = einheitEl(K, ks, e.platz); if (u) u.classList.add('schild'); await pause(K, 200); }
        else if (e.e === 'betaeuben'){ const u = einheitEl(K, ks, e.platz); if (u){ u.classList.add('bet'); anim(u, 'getroffen'); } await pause(K, 300); }
        break;
      case 'tod': {
        const u = einheitEl(K, s, e.platz);
        if (u){ u.classList.add('stirbt'); await pause(K, 420); const p = u.parentElement; u.remove(); if (p){ p.classList.remove('belegt'); p.innerHTML = '<span class="kk-leer"></span>'; } }
        break; }
      case 'muede':
        heldHp(K, s, -e.schaden); blase(K, s, `Deck leer · −${e.schaden} Leben`, false); await pause(K, 600); break;
      case 'verbrannt':
        if (s === 'du') L.toast('Hand voll – die gezogene Karte ist verbrannt.'); break;
    }
  }
}

/* ---------- Zugfrage ---------- */
function frageZeigen(K){
  if (!K.root || K.root.querySelector('.kk-frage') || !K.v.frage) return;
  const serie = K.v.du.serie || 0;
  const w = document.createElement('div'); w.className = 'kk-frage';
  w.innerHTML = `<div class="kk-frage-box pop-in"><div class="kk-frage-kopf"><span class="eyebrow">Zugfrage · Zug ${K.v.du.zug}</span>
    <span class="small muted">Richtig: <b>+1 Fokus</b>, <b>+1 Karte</b>, „Erleuchtet“-Effekte${serie % 3 === 2 ? ' · <b>Aufstieg!</b>' : serie ? ` · Serie ${serie % 3} / 3` : ''}</span></div>${GM.frageHtml(K.v.frage)}<div class="kk-frage-fuss"></div></div>`;
  K.root.appendChild(w);
  const root = w.querySelector('.gfrage');
  GM.frageBinden(root, async wahl => {
    try {
      const neu = await GM.rpc('kampf_antwort', {p_id: K.id, p_wahl: wahl});
      GM.frageAufloesen(root, wahl, neu.antwort.richtig, {warum: true});
      const fuss = w.querySelector('.kk-frage-fuss');
      const auf = neu.antwort.ok && neu.du.aufstieg && !K.v.du.aufstieg;
      fuss.innerHTML = `<div class="feedback ${neu.antwort.ok ? 'ok' : 'bad'} pop">${neu.antwort.ok ? L.ICON.ok + `Richtig! +1 Fokus, +1 Karte${auf ? ' – und ein Aufstieg ist bereit!' : ''}` : L.ICON.x + 'Leider falsch – diesmal kein Bonus, die Serie beginnt neu.'}</div><button class="btn primary" id="kkWeiter">Weiter zum Zug</button>`;
      const weiter = async () => { if (!document.body.contains(w)) return; w.remove(); await uebernehmen(K, neu); };
      $('#kkWeiter').onclick = weiter; $('#kkWeiter').focus();
      if (neu.antwort.ok) setTimeout(weiter, auf ? 2200 : 1300);
    } catch(e){ L.toast(GM.fehlerText(e)); GM.frageFrei(root); }
  });
}

/* ---------- Ende ---------- */
function ende(K){
  if (K.fertig) return; K.fertig = true;
  const v = K.v, b = v.belohnung, name = v.gegner_name || 'Gegner';
  const sub = v.aufgegeben != null ? (v.aufgegeben === v.ich ? 'Du hast aufgegeben.' : `${esc(name)} hat aufgegeben.`) : `gegen ${esc(name)} · ${Math.max(0, v.du.hp)} : ${Math.max(0, v.gegner.hp)} Lebenspunkte · ${v.du.richtig} Fragen richtig`;
  const extra = (b && b.stufe_neu ? (BOSSE[b.stufe_neu] ? `<p class="ge-neu">${L.ICON.lock} Neuer Gegner freigeschaltet: <b>${esc(BOSSE[b.stufe_neu].name)}</b> · +1 Booster</p>` : `<p class="ge-neu">Alle Gegner besiegt – stark! +1 Booster</p>`) : '')
    + (b && b.tagessieg ? `<p class="ge-neu">${G.ico.booster} Erster Sieg heute: +1 Booster</p>` : '');
  const naechster = b && b.stufe_neu && b.stufe_neu < BOSSE.length;
  const knoepfe = v.stufe
    ? `${naechster ? `<button class="btn primary" data-a="naechste">Nächster Gegner ${L.ICON.pfeil}</button>` : ''}<button class="btn ${naechster ? '' : 'primary'}" data-a="nochmal">Nochmal</button>${b && b.booster ? `<button class="btn" data-a="booster">${G.ico.booster}Booster öffnen</button>` : ''}<button class="btn ghost" data-a="lobby">Übersicht</button>`
    : v.frei ? `<button class="btn primary" data-a="frei">Nochmal</button>${b && b.booster ? `<button class="btn" data-a="booster">${G.ico.booster}Booster öffnen</button>` : ''}<button class="btn ghost" data-a="lobby">Übersicht</button>`
    : `<button class="btn primary" data-a="revanche">${G.ico.schwert}Revanche</button><button class="btn ghost" data-a="lobby">Übersicht</button>`;
  const w = document.createElement('div'); w.className = 'kk-ende';
  w.innerHTML = GM.ergebnisHtml({ergebnis: v.ergebnis, eyebrow: 'Lernwerk Legends', sub, belohnung: b, extra, knoepfe});
  (K.root || L.app()).appendChild(w);
  GM.ergebnisAn(w, v.ergebnis);
  w.querySelectorAll('[data-a]').forEach(x => x.onclick = () => {
    const a = x.dataset.a;
    if (a === 'lobby') return L.go('#/games/karten');
    if (a === 'booster') return L.go('#/games/sammlung/oeffnen');
    if (a === 'nochmal') return starten({p_stufe: v.stufe}, x);
    if (a === 'frei') return starten({p_frei: v.frei}, x);
    if (a === 'naechste') return starten({p_stufe: b.stufe_neu + 1}, x);
    if (a === 'revanche') return starten({p_gegner: v.gegner_id}, x);
  });
  GM.nachSpiel(`Karten-Kampf gegen ${name}: ${{sieg: 'gewonnen', niederlage: 'verloren', remis: 'unentschieden'}[v.ergebnis] || v.ergebnis}`);
}

GM.MODULE.karten = h => { const id = h.split('/')[3]; return id ? viewKampf(id) : viewLobby(); };
})();
