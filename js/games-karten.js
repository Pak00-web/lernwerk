/* Lernwerk Games – Lernwerk Legends (Karten-Kampf). Regeln, Zufall und Computer-Gegner laufen auf dem Server
   (_k2_* und kampf_* in supabase/2026-09-23-karten-v2.sql + 2026-09-24-karten-feinschliff.sql), hier wird nur angezeigt und abgespielt. */
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
const FRAGE_SEK = 20;
const warte = ms => new Promise(r => setTimeout(r, ms));
const kat = () => GM.katalog || {};
const bewegung = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const speicher = {lesen(k, d){ try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } }, schreiben(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }};
let vorgeladen = null;

/* ---------- Anleitung ---------- */
// Beispielkarten aus dem Katalog: ein Monster mit Effekt, ein Zauber, eine Falle
function beispiel(typ, pred = () => true){
  const alle = Object.values(kat()).filter(k => k.seltenheit !== 'token' && k.typ === typ);
  return (alle.find(pred) || alle[0] || {}).id;
}
function anatomie(){
  const id = beispiel('monster', k => (k.effekt || []).length && (k.schluessel || []).length && k.seltenheit === 'epic');
  if (!id) return '';
  const punkte = [[1, '8%', '9%'], [2, '88%', '9%'], [3, '50%', '38%'], [4, '50%', '93%'], [5, '15%', '93%'], [6, '85%', '93%']];
  return `<div class="tut-anatomie"><div class="tut-karte">${GM.karte(id)}${punkte.map(([n, x, y]) => `<i class="tut-pin" style="left:${x};top:${y}">${n}</i>`).join('')}</div>
    <ol class="tut-legende"><li><b>Kosten</b> in Fokus</li><li><b>Symbole</b>: Fähigkeiten und Effekte</li><li><b>Typ</b>: Monster, Zauber oder Falle</li><li><b>Juwel</b>: Seltenheit – grau, blau, lila, gold</li><li><b>Angriff</b></li><li><b>Leben</b></li></ol></div>`;
}
function typenBild(){
  const ids = [beispiel('monster'), beispiel('zauber'), beispiel('falle')].filter(Boolean);
  const text = ['<b>Monster</b> kämpfen auf dem Feld', '<b>Zauber</b> wirken sofort', '<b>Fallen</b> liegen verdeckt'];
  return `<div class="tut-typen">${ids.map((id, i) => `<div>${GM.karte(id, {klasse: 'klein'})}<small>${text[i]}</small></div>`).join('')}</div>`;
}
const schritteBild = () => `<div class="tut-schritte">${[['fokus', 'Frage beantworten'], ['deck', 'Karten spielen'], ['schwert', 'Angreifen'], ['wechsel', 'Zug beenden']].map(([ico, t], i) => `<div><span>${G.ico[ico]}</span><small>${i + 1}. ${t}</small></div>`).join('<i class="tut-pfeil">→</i>')}</div>`;
const angriffBild = () => `<div class="tut-brett">
  <div class="tut-reihe"><span class="tut-held">${G.ico.schild}<small>Held geschützt</small></span><span class="tut-u waechter">${G.kwIco('waechter')}<small>Wächter</small></span></div>
  <div class="tut-reihe"><span class="tut-u bereit">${G.ico.schwert}<small>bereit</small></span><span class="tut-u schlaeft"><b>Zzz</b><small>frisch gelegt</small></span></div></div>`;
const TUTORIAL = [
  ['Eine Karte lesen', anatomie, 'Jede Karte zeigt auf einen Blick, was sie kann. Je seltener, desto prächtiger der Rahmen – <b>goldene Karten sind legendär</b>.'],
  ['Dein Zug in 4 Schritten', schritteBild, 'Jeder Zug beginnt mit einer <b>Frage</b> (20 Sekunden). Danach spielst du Karten mit deinem <b>Fokus</b>, greifst an und beendest den Zug. Der Fokus wächst jeden Zug um 1.'],
  ['Monster, Zauber, Fallen', typenBild, '<b>Monster</b> kommen auf einen deiner 4 Plätze. <b>Zauber</b> wirken sofort. <b>Fallen</b> liegen verdeckt und schnappen zu, wenn der Gegner angreift oder ein Monster ausspielt.'],
  ['Angreifen', angriffBild, 'Tippe ein <b>grün leuchtendes</b> Monster an und dann das Ziel – oder ziehe es. Frisch gelegte Monster schlafen (<b>Zzz</b>) und greifen erst im nächsten Zug an. Solange der Gegner einen <b>Wächter</b> hat, ist sein Held geschützt.'],
  ['Wissen ist deine Waffe', null, '<b>Richtig</b> geantwortet: <b>+1 Fokus, +1 Karte</b> und alle Monster mit <b>„Erleuchtet“</b> lösen aus. <b>3 richtig in Folge</b>: Aufstieg (+3/+3). <b>Legendäre</b> Karten gehen nur in einem Zug mit richtiger Antwort.', 'fokus'],
  ['Sammeln', null, 'Siege bringen XP, Coins und Booster. Spätestens im 15. Booster steckt eine legendäre Karte. Fehlende Karten bleiben verdeckt – bis du sie ziehst oder aus <b>Wissensstaub</b> herstellst.', 'booster'],
];
function anleitung(fertig){
  let i = 0;
  const w = document.createElement('div'); w.className = 'overlay';
  const zeichne = () => {
    const [t, bild, text, ico] = TUTORIAL[i];
    w.innerHTML = `<div class="overlay-box pop-in kk-tut">${bild ? bild() : `<div class="kk-tut-ico">${G.ico[ico]}</div>`}<div class="eyebrow">So funktioniert’s · ${i + 1} / ${TUTORIAL.length}</div><h2>${t}</h2><p>${text}</p>
      <div class="kk-tut-punkte">${TUTORIAL.map((_, k) => `<i class="${k === i ? 'an' : ''}"></i>`).join('')}</div>
      <div class="row" style="justify-content:center">${i ? '<button class="btn ghost" data-a="zurueck">Zurück</button>' : ''}<button class="btn primary" data-a="weiter">${i < TUTORIAL.length - 1 ? 'Weiter' : 'Los geht’s'}</button></div></div>`;
    w.querySelector('[data-a="weiter"]').onclick = () => { if (i < TUTORIAL.length - 1){ i++; zeichne(); } else { w.remove(); try { localStorage.setItem('lernwerk.kk2.tutorial', '1'); } catch(e){} fertig && fertig(); } };
    const z = w.querySelector('[data-a="zurueck"]'); if (z) z.onclick = () => { i--; zeichne(); };
  };
  document.body.appendChild(w); zeichne();
}
// Regeln & Symbole zum Nachschlagen (Lobby und Kampf)
function regeln(){
  const w = document.createElement('div'); w.className = 'overlay';
  const kws = ['waechter', 'ansturm', 'tarnung', 'schild', 'lebensraub', 'gift', 'ausspielen', 'erleuchtet'];
  w.innerHTML = `<div class="overlay-box pop-in kk-regeln-box"><div class="eyebrow">Lernwerk Legends</div><h2>Regeln &amp; Symbole</h2>
    <h3>Ablauf eines Zugs</h3>${schritteBild()}
    <ul class="kk-regel-liste"><li>Fokus wächst jeden Zug um 1 (bis 8). <b>Richtige Frage: +1 Fokus, +1 Karte.</b> Nach 20 Sekunden zählt die Frage als falsch.</li>
      <li>Monster greifen <b>ab dem Zug nach dem Ausspielen</b> an – außer mit Ansturm. Jedes Monster greift einmal pro Zug an.</li>
      <li>Hat der Gegner einen <b>Wächter</b>, musst du zuerst den Wächter angreifen. Sein Held ist so lange geschützt.</li>
      <li><b>Legendäre</b> Karten nur in einem Zug mit richtiger Antwort. 3 richtige in Folge schalten einen <b>Aufstieg</b> frei (+3/+3).</li></ul>
    <h3>Symbole auf den Karten</h3><div class="kk-symbole">${kws.map(k => `<div><span class="mk mk-${k}">${G.kwIco(k)}</span><div><b>${G.SCHLUESSEL[k][0]}</b><small>${G.SCHLUESSEL[k][1]}</small></div></div>`).join('')}</div>
    <h3>Seltenheit</h3><div class="kk-seltenheiten">${[['common', 'Gewöhnlich'], ['rare', 'Selten'], ['epic', 'Episch'], ['legendary', 'Legendär']].map(([s, t]) => `<span class="lwk s-${s} juwel-probe"><span class="lwk-juwel"></span></span><b>${t}</b>`).join('')}</div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="btn primary" data-zu>Verstanden</button></div></div>`;
  document.body.appendChild(w);
  const zu = () => w.remove();
  w.querySelector('[data-zu]').onclick = zu; w.onclick = e => { if (e.target === w) zu(); };
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
      <li><b>Jeder Zug:</b> Frage (20 s) → Karten spielen → angreifen → Zug beenden</li><li><b>Richtige Frage:</b> +1 Fokus, +1 Karte, „Erleuchtet“-Effekte</li><li><b>3 richtig in Folge:</b> Aufstieg (+3/+3) · <b>Legendäre</b> nur nach richtiger Antwort</li></ul>
      <div class="row"><button class="btn ghost klein" id="tut">Anleitung ansehen</button><button class="btn ghost klein" id="regeln">Regeln &amp; Symbole</button></div></div>
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
  $('#regeln').onclick = regeln;
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
  const K = {id, v, wahl: null, busy: false, hp: {du: v.du.hp, gegner: v.gegner.hp}, gesehen: v.logn, fertig: false, neu: new Set(), detail: null};
  merken(K);
  zeichne(K);
  // Züge des Gegners seit dem letzten Besuch hervorheben
  if (gesehen && v.log) v.log.filter(e => e.n > gesehen && (e.art === 'spielt' || e.art === 'beschwoert') && e.p !== v.ich && e.platz != null).forEach(e => { const u = einheitEl(K, 'gegner', e.platz); if (u) u.classList.add('erscheint'); });
  weiterNachZeichnen(K);
  const groesse = () => hoeheSetzen(K);
  const taste = ev => { if (ev.key === 'Escape' && K.wahl && !K.busy){ K.wahl = null; zeichne(K); } };
  window.addEventListener('resize', groesse); document.addEventListener('keydown', taste);
  GM.beimVerlassen(() => { window.removeEventListener('resize', groesse); document.removeEventListener('keydown', taste); coachWeg(); });
  if (!v.stufe && !v.frei && v.status === 'laeuft'){
    GM.aufEreignis('kampf', row => { if (row.id === id && !K.busy && !K.v.dran && (row.am_zug === GM.ich() || row.status === 'fertig')) aktualisieren(K); });
    const t = setInterval(() => { if (!K.busy && !K.v.dran && K.v.status === 'laeuft') aktualisieren(K); }, 15000);
    GM.beimVerlassen(() => clearInterval(t));
  }
}
// Das Spielfeld füllt genau die sichtbare Höhe (kein Scrollen zwischen Brett und Hand)
function hoeheSetzen(K){
  const el = K.root; if (!el || !document.body.contains(el)) return;
  const zm = L.zoom() || 1, r = el.getBoundingClientRect(), oben = (r.top + (window.scrollY || 0)) / zm;
  el.style.setProperty('--kk-h', Math.max(520, Math.floor(window.innerHeight / zm - oben - 20)) + 'px');
}
function merken(K){ try { localStorage.setItem(merkeKey(K.id), K.v.logn || 0); } catch(e){} }
async function aktualisieren(K){
  K.busy = true;
  try { const neu = await GM.rpc('kampf_ansicht', {p_id: K.id}); await uebernehmen(K, neu); }
  catch(e){} finally { K.busy = false; }
}
function weiterNachZeichnen(K){
  if (K.v.status === 'fertig') return ende(K);
  if (K.v.dran && K.v.phase === 'frage' && K.v.frage) setTimeout(() => frageZeigen(K), 300);
}

/* ---------- Regeln auf dem Client (nur für Anzeige und Erklärungen) ---------- */
const seite = (K, p) => p === K.v.ich ? 'du' : 'gegner';
const platzEl = (K, s, i) => K.root && K.root.querySelector(`.kk-reihe.${s} .kk-platz[data-platz="${i}"]`);
const einheitEl = (K, s, i) => { const p = platzEl(K, s, i); return p && p.querySelector('.einheit'); };
const heldEl = (K, s) => K.root && K.root.querySelector('.kk-held.' + s);
const hpEl = (K, s) => K.root && K.root.querySelector(s === 'du' ? '#hpD' : '#hpG');
const hatWaechter = feld => feld.some(m => m && (m.sch || []).includes('waechter') && !m.tarn);
// Was ist in diesem Zug schon passiert? (frisch gelegte Monster, schon angegriffen)
function zugInfo(K){
  const log = K.v.log || [], ich = K.v.ich; let i = log.length - 1;
  while (i >= 0 && !(log[i].art === 'zug' && log[i].p === ich)) i--;
  const frisch = new Set(), angegriffen = new Set();
  if (i >= 0) for (const e of log.slice(i + 1)){
    if (e.p !== ich) continue;
    if ((e.art === 'spielt' || e.art === 'beschwoert') && e.platz != null) frisch.add(e.platz);
    if (e.art === 'angriff') angegriffen.add(e.von);
    if (e.art === 'tod'){ frisch.delete(e.platz); angegriffen.delete(e.platz); }
  }
  return {frisch, angegriffen};
}
// Gültige Ziele der aktuellen Auswahl → Set aus 'g0'…'g3', 'e0'…'e3', 'held', 'leer0'…'leer3'
function ziele(K){
  const v = K.v, w = K.wahl, z = new Set(); if (!w) return z;
  const gFeld = v.gegner.feld, dFeld = v.du.feld;
  if (w.art === 'angriff'){
    const waechter = hatWaechter(gFeld);
    gFeld.forEach((m, i) => { if (m && !m.tarn && (!waechter || (m.sch || []).includes('waechter'))) z.add('g' + i); });
    if (!waechter) z.add('held');
  } else if (w.art === 'aufstieg'){
    dFeld.forEach((m, i) => { if (m && !m.auf) z.add('e' + i); });
  } else if (w.art === 'hand'){
    const k = kat()[v.du.hand[w.i]]; if (!k || !spielbar(K, k.id, true)) return z;
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
// Gewählte Handkarte ohne Ziel (Falle, Zauber ohne Ziel), die jetzt spielbar ist
function freiSpielbar(K){ const w = K.wahl; if (!w || w.art !== 'hand') return false; const id = K.v.du.hand[w.i], k = kat()[id]; return !!k && !brauchtZiel(k) && spielbar(K, id); }
const brauchtZiel = k => k && ((k.typ === 'monster') || (k.typ === 'zauber' && ['monster', 'wahl', 'eigen'].includes((k.effekt[0] || {}).ziel)));
function grundHand(K, id){
  const v = K.v, k = kat()[id]; if (!k) return 'Unbekannte Karte.';
  if (!v.dran) return 'Du bist gerade nicht dran.';
  if (v.phase !== 'spielen') return 'Beantworte zuerst die Zugfrage.';
  if (k.kosten > v.du.fokus) return `Zu teuer: kostet ${k.kosten} Fokus, du hast ${v.du.fokus}.`;
  if (k.seltenheit === 'legendary' && !v.du.bonus) return 'Legendäre Karten gehen nur in einem Zug mit richtiger Antwort.';
  if (k.typ === 'monster' && !v.du.feld.some(m => !m)) return 'Alle 4 Plätze sind belegt.';
  if (k.typ === 'falle' && !v.du.fallen.some(f => !f)) return 'Du hast schon zwei Fallen liegen.';
  return '';
}
function spielbar(K, id, ohneZiel){
  if (grundHand(K, id)) return false;
  const k = kat()[id];
  if (!ohneZiel && k.typ === 'zauber' && brauchtZiel(k)){ const alt = K.wahl; K.wahl = {art: 'hand', i: K.v.du.hand.indexOf(id)}; const n = ziele(K).size; K.wahl = alt; return n > 0; }
  return true;
}
const kannAngreifen = (K, m) => K.v.dran && K.v.phase === 'spielen' && m && m.bereit && !m.bet && m.a > 0;
function grundAngriff(K, m, platz){
  if (!K.v.dran) return 'Du bist gerade nicht dran.';
  if (K.v.phase !== 'spielen') return 'Beantworte zuerst die Zugfrage.';
  if (m.bet) return 'Betäubt – dieses Monster setzt diesen Zug aus.';
  if (m.a <= 0) return 'Dieses Monster hat keinen Angriff.';
  const zi = zugInfo(K);
  if (zi.angegriffen.has(platz)) return 'Hat in diesem Zug schon angegriffen.';
  if (!m.bereit) return 'Frisch gelegt (Zzz) – greift ab deinem nächsten Zug an. Nur Monster mit Ansturm dürfen sofort.';
  return '';
}
// Was kann ich gerade tun? → Hinweiszeile
function hinweis(K){
  const v = K.v, w = K.wahl;
  if (v.status === 'fertig') return {text: 'Kampf vorbei'};
  if (!v.dran) return {text: `Warte auf ${esc(v.gegner_name)} …`};
  if (v.phase === 'frage') return {text: 'Beantworte die Zugfrage'};
  if (w && w.art === 'angriff') return {text: hatWaechter(v.gegner.feld) ? 'Wähle einen Wächter als Ziel – sie schützen den Helden' : 'Wähle ein Ziel: Monster oder Held'};
  if (w && w.art === 'aufstieg') return {text: 'Welches Monster steigt auf?'};
  if (w && w.art === 'hand'){ const k = kat()[v.du.hand[w.i]], g = grundHand(K, k.id); return {text: g || (k.typ === 'monster' ? 'Tippe einen freien Platz an – oder ziehe die Karte' : brauchtZiel(k) ? 'Tippe ein leuchtendes Ziel an' : k.typ === 'falle' ? 'Tippe auf dein Spielfeld, um die Falle verdeckt zu legen – oder ziehe sie dorthin' : 'Tippe auf dein Spielfeld, um den Zauber zu wirken – oder ziehe ihn dorthin'), grund: !!g}; }
  const n = v.du.hand.filter(id => spielbar(K, id)).length, a = v.du.feld.filter(m => kannAngreifen(K, m)).length;
  if (!n && !a && !v.du.aufstieg) return {text: 'Nichts mehr zu tun – beende deinen Zug', fertig: true};
  const teile = [];
  if (n) teile.push(`${n} ${n === 1 ? 'Karte' : 'Karten'} spielbar`);
  if (a) teile.push(`${a} ${a === 1 ? 'Monster kann' : 'Monster können'} angreifen`);
  if (v.du.aufstieg && v.du.feld.some(m => m && !m.auf)) teile.push('Aufstieg bereit');
  if (a && hatWaechter(v.gegner.feld)) teile.push('erst die Wächter');
  return {text: teile.join(' · ') || 'Dein Zug'};
}

/* ---------- Darstellung ---------- */
function anim(el, kl){ if (!el) return; el.classList.remove(kl); void el.offsetWidth; el.classList.add(kl); }
function blase(K, s, text, gut){
  const ziel = heldEl(K, s); if (!ziel) return;
  const b = document.createElement('div'); b.className = 'kk-blase ' + (gut ? 'gut' : gut === false ? 'schlecht' : ''); b.textContent = text;
  ziel.appendChild(b); setTimeout(() => b.remove(), 1800);
}
// Erklärung direkt am Objekt (warum geht das nicht?)
function grundBlase(el, text){
  if (!el || !text) return;
  const alt = el.querySelector('.kk-grundblase'); if (alt) alt.remove();
  const b = document.createElement('div'); b.className = 'kk-grundblase'; b.textContent = text;
  el.appendChild(b); setTimeout(() => b.remove(), 3200);
}
// Monster auf dem Brett: hochformatige Mini-Karte mit Rahmen in Seltenheitsfarbe
function einheit(m, o = {}){
  const k = kat()[m.k] || {}, sch = m.sch || [], verletzt = m.v < m.max;
  const zustand = m.bet ? '<span class="eh-zustand bet" title="Betäubt: setzt einen Zug aus">z<small>z</small></span>'
    : o.schlaeft ? '<span class="eh-zustand zzz" title="Frisch gelegt: greift ab dem nächsten Zug an">Zzz</span>' : '';
  return `<div class="einheit s-${k.seltenheit || 'common'} ${m.auf ? 'auf' : ''} ${m.schild ? 'schild' : ''} ${m.tarn ? 'tarn' : ''} ${m.bet ? 'bet' : ''} ${o.bereit ? 'bereit' : ''} ${sch.includes('waechter') ? 'waechter' : ''} ${o.klasse || ''}" style="--fc:${(G.FACH[k.fach] || {}).farbe}" data-k="${m.k}">
    <div class="eh-bild">${G.kartenBild(k)}</div>
    ${sch.includes('waechter') ? `<span class="eh-waechter" title="Wächter: muss zuerst angegriffen werden">${G.kwIco('waechter')}</span>` : ''}
    <div class="eh-marken">${GM.effektMarken(k, sch.filter(x => x !== 'waechter'))}</div>
    <span class="eh-atk ${m.a > k.angriff ? 'hoch' : ''}">${m.a}</span><span class="eh-hp ${verletzt ? 'runter' : m.v > k.verteidigung ? 'hoch' : ''}">${m.v}</span>
    ${zustand}
  </div>`;
}
function zeichne(K){
  const v = K.v, app = L.app();
  const z = ziele(K), w = K.wahl, zi = zugInfo(K), h = hinweis(K);
  const frage = v.dran && v.phase === 'frage' && v.frage && v.status === 'laeuft';
  const gAva = v.stufe ? G.portrait(v.stufe, 40) : v.frei ? `<span class="ava ki">${G.ico.bot}</span>` : `<span class="ava" style="background:var(--${v.gegner_farbe || 'aew'})">${esc((v.gegner_name || '?')[0].toUpperCase())}</span>`;
  const reihe = (s, feld) => `<div class="kk-reihe ${s}">${[0, 1, 2, 3].map(i => { const m = feld[i], key = (s === 'du' ? 'e' : 'g') + i;
    const istZiel = z.has(key) || (s === 'du' && z.has('leer' + i)), gewaehlt = s === 'du' && w && w.art === 'angriff' && w.platz === i;
    const schlaeft = s === 'du' && v.dran && m && !m.bereit && !m.bet && zi.frisch.has(i);
    return `<div class="kk-platz ${m ? 'belegt' : ''} ${istZiel ? 'ziel' : ''} ${gewaehlt ? 'gewaehlt' : ''}" data-platz="${i}" data-seite="${s}" role="button" tabindex="0" aria-label="${m ? esc((kat()[m.k] || {}).name || '') : 'Freier Platz ' + (i + 1)}">
      ${m ? einheit(m, {bereit: s === 'du' && kannAngreifen(K, m), schlaeft, klasse: K.neu.has(s + i) ? 'erscheint' : ''}) : '<span class="kk-leer"></span>'}</div>`; }).join('')}</div>`;
  const fokusPips = `<span class="kk-pips" title="Fokus ${v.du.fokus} von ${v.du.maxfokus}${v.du.bonus ? ' (+1 Wissensbonus)' : ''}">${Array.from({length: Math.max(v.du.maxfokus + (v.du.bonus ? 1 : 0), v.du.fokus)}, (_, i) => `<i class="${i < v.du.fokus ? 'an' : ''} ${i >= v.du.maxfokus ? 'bonus' : ''}"></i>`).join('')}</span>`;
  const serie = `<span class="kk-serie" title="Richtige Antworten in Folge – bei 3 gibt es einen Aufstieg">${[0, 1, 2].map(i => `<i class="${i < (v.du.serie % 3 || (v.du.aufstieg && v.du.serie ? 3 : 0)) ? 'an' : ''}"></i>`).join('')}</span>`;
  const geschuetzt = hatWaechter(v.gegner.feld);
  const n = v.du.hand.length;
  app.innerHTML = `<div class="kk ${v.dran ? 'dran' : ''} ${frage ? 'fragt' : ''}" id="kk">
    <div class="kk-leiste"><button class="btn ghost" id="kkZurueck">${L.ICON.back}<span>Übersicht</span></button><span class="kk-titel">${v.stufe ? 'Gegner ' + v.stufe : v.frei ? 'Freies Spiel' : 'Gegen deine Klasse'} · Zug ${Math.max(1, v.du.zug)}</span>
      <span class="kk-leiste-r"><button class="btn ghost kk-hilfe" id="kkRegeln" title="Regeln & Symbole" aria-label="Regeln und Symbole">?</button>${v.status === 'laeuft' ? '<button class="btn ghost" id="kkAufgeben">Aufgeben</button>' : ''}</span></div>
    <div class="kk-held gegner ${z.has('held') ? 'ziel' : ''} ${geschuetzt ? 'geschuetzt' : ''}" data-held="1">${gAva}<div class="kk-held-info"><b>${esc(v.gegner_name || 'Gegner')}</b>${GM.hpBar(K.hp.gegner, v.gegner.maxhp, {id: 'hpG'})}</div>
      ${geschuetzt ? `<span class="kk-schutz" title="Geschützt: Solange ein Wächter steht, kann der Held nicht angegriffen werden">${G.kwIco('waechter')}<small>geschützt</small></span>` : ''}
      <div class="kk-zaehler"><span class="kk-gegner-hand" title="${v.gegner.hand} Handkarten">${Array.from({length: Math.min(v.gegner.hand, 8)}, () => '<i></i>').join('')}<b>${v.gegner.hand}</b></span>
        <span title="Verdeckte Fallen">${(v.gegner.fallen || []).map(f => `<i class="kk-falle ${f ? 'an' : ''}">${f ? '?' : ''}</i>`).join('')}</span><span title="Karten im Deck">${G.ico.deck}${v.gegner.deck}</span></div></div>
    <div class="kk-feld ${freiSpielbar(K) ? 'ablage' : ''}">
      ${reihe('gegner', v.gegner.feld)}
      <div class="kk-mitte">${frage ? '<div class="kk-frage" id="kkFrage"></div>' : `<span class="kk-status ${h.grund ? 'grund' : ''}">${h.text}</span>`}</div>
      ${reihe('du', v.du.feld)}
    </div>
    <div class="kk-held du"><div class="kk-held-info"><b>Du</b>${GM.hpBar(K.hp.du, v.du.maxhp, {id: 'hpD'})}</div>
      <div class="kk-ressourcen"><span class="kk-fokus-zahl" title="Fokus: bezahlt deine Karten">${G.ico.fokus}<b>${v.du.fokus}</b></span>${fokusPips}${serie}
        ${v.du.aufstieg ? `<button class="btn klein kk-aufstieg ${w && w.art === 'aufstieg' ? 'aktiv' : ''}" id="kkAufstieg" ${v.dran && v.phase === 'spielen' && v.du.feld.some(m => m && !m.auf) ? '' : 'disabled'}>${G.ico.pokal}Aufstieg</button>` : ''}
        <span class="kk-meine-fallen" title="Deine gelegten Fallen">${v.du.fallen.map(f => f ? `<i class="kk-falle an" title="${esc((kat()[f.k] || {}).name || '')}">${G.kwIco('falle')}</i>` : '<i class="kk-falle"></i>').join('')}</span></div>
      <div class="kk-knoepfe"><span class="kk-deck" title="Karten im Deck">${G.ico.deck}${v.du.deck}</span><button class="btn primary ${h.fertig ? 'puls' : ''}" id="kkEnde" ${v.dran && v.phase === 'spielen' && !K.busy ? '' : 'disabled'}>Zug beenden ${L.ICON.pfeil}</button></div></div>
    <aside class="kk-detail ${w && (w.art === 'hand' || w.art === 'info') ? 'offen' : ''}" id="kkDetail"></aside>
    <div class="kk-hand" style="--n:${n}">${v.du.hand.map((id, i) => { const k = kat()[id] || {}, g = grundHand(K, id), c = i - (n - 1) / 2;
      return `<button class="kk-hk ${spielbar(K, id) ? 'spielbar' : ''} ${v.dran && v.phase === 'spielen' && k.kosten > v.du.fokus ? 'teuer' : ''} ${v.dran && k.seltenheit === 'legendary' && !v.du.bonus ? 'leg-zu' : ''} ${w && w.art === 'hand' && w.i === i ? 'gewaehlt' : ''}" data-h="${i}" style="--i:${i};--r:${(c * 2.6).toFixed(1)}deg;--y:${(c * c * 2.2).toFixed(1)}px" aria-label="${esc(k.name || id)}" ${g && v.dran ? `title="${esc(g)}"` : ''}>${GM.karte(id, {klasse: 'klein'})}</button>`; }).join('') || '<p class="muted small kk-hand-leer">Keine Karten auf der Hand.</p>'}</div>
  </div>`;
  K.root = $('#kk'); K.neu.clear();
  hoeheSetzen(K);
  detailZeichnen(K);
  requestAnimationFrame(() => { if (K.hp.du !== v.du.hp){ K.hp.du = v.du.hp; GM.hpSetzen(hpEl(K, 'du'), v.du.hp); } if (K.hp.gegner !== v.gegner.hp){ K.hp.gegner = v.gegner.hp; GM.hpSetzen(hpEl(K, 'gegner'), v.gegner.hp); } });
  binden(K);
  if (K.grund){ const g = K.grund; K.grund = null; grundBlase(g.seite === 'held' ? heldEl(K, 'gegner') : platzEl(K, g.seite, g.platz), g.text); }
  if (!frage) setTimeout(() => coachPruefen(K), 450);
}

/* ---------- Detailbereich (Desktop rechts, sonst als Blatt von unten) ---------- */
function detailHtml(K){
  const v = K.v, d = K.detail || (K.wahl && (K.wahl.art === 'hand' || K.wahl.art === 'info') ? K.wahl : null);
  if (d && (d.art === 'hand' || d.art === 'handzeigen')){
    const id = d.id || v.du.hand[d.i], k = kat()[id]; if (!k) return '';
    const auswahl = K.wahl && K.wahl.art === 'hand' && v.du.hand[K.wahl.i] === id;
    const g = grundHand(K, id), ok = !g && spielbar(K, id);
    const tipp = g || (!ok ? 'Kein gültiges Ziel.' : k.typ === 'monster' ? 'Tippe einen freien Platz an – oder ziehe die Karte dorthin.' : brauchtZiel(k) ? 'Tippe ein leuchtendes Ziel an.' : k.typ === 'falle' ? 'Die Falle liegt verdeckt, bis der Gegner sie auslöst.' : 'Wirkt sofort.');
    return `<div class="kk-detail-karte">${GM.karte(id)}</div><div class="kk-detail-info"><p class="small ${g ? 'kk-grund' : 'muted'}">${auswahl || g ? tipp : 'Tippe die Karte an, um sie zu spielen.'}</p>
      ${auswahl ? `<div class="row">${ok && !brauchtZiel(k) ? `<button class="btn primary" id="kkSpielen">${k.typ === 'falle' ? 'Falle legen' : 'Ausspielen'}</button>` : ''}<button class="btn ghost" id="kkAbbrechen">Abbrechen</button></div>` : ''}</div>`;
  }
  if (d && d.art === 'info'){
    const m = (d.seite === 'du' ? v.du : v.gegner).feld[d.platz]; if (!m) return '';
    const k = kat()[m.k] || {}, extra = (m.sch || []).filter(kw => !(k.schluessel || []).includes(kw));
    const grund = d.seite === 'du' && !kannAngreifen(K, m) ? grundAngriff(K, m, d.platz) : '';
    return `<div class="kk-detail-karte">${GM.karte(m.k)}</div><div class="kk-detail-info">
      <p class="small"><b>Jetzt:</b> ${G.ico.schwert} ${m.a} · ${G.ico.herz} ${m.v} / ${m.max}${m.auf ? ' · aufgestiegen' : ''}</p>
      ${extra.length ? `<p class="small">Dazu: ${GM.kwChips(extra)}</p>` : ''}
      ${m.schild ? '<p class="small">Schild aktiv: der nächste Treffer macht keinen Schaden</p>' : ''}${m.tarn ? '<p class="small">Getarnt: nicht angreifbar, bis es selbst angreift</p>' : ''}
      ${grund ? `<p class="small kk-grund">${grund}</p>` : d.seite === 'du' && kannAngreifen(K, m) ? '<p class="small muted">Bereit: tippe das Monster an und dann das Ziel.</p>' : ''}
      ${K.wahl && K.wahl.art === 'info' ? '<button class="btn ghost" id="kkAbbrechen">Schließen</button>' : ''}</div>`;
  }
  // Ruhezustand: kurzer Verlauf der letzten Ereignisse
  return `<div class="kk-detail-leer"><p class="small muted">${G.ico.hinweis} Fahre über eine Karte, um sie groß zu sehen. Langes Drücken auf dem Handy.</p>
    <h4>Zuletzt</h4><ol class="kk-verlauf">${verlauf(K).map(t => `<li>${t}</li>`).join('') || '<li class="muted">Noch nichts passiert.</li>'}</ol></div>`;
}
function verlauf(K){
  const v = K.v, wer = p => p === v.ich ? 'Du' : esc(v.gegner_name || 'Gegner'), name = id => esc((kat()[id] || {}).name || 'eine Karte');
  const text = e => {
    switch (e.art){
      case 'zug': return `<b class="kk-v-zug">${wer(e.p)} – Zug ${e.zug}</b>`;
      case 'antwort': return `${wer(e.p)}: Frage ${e.ok ? '<span class="ok">richtig</span>' : '<span class="bad">falsch</span>'}`;
      case 'spielt': return `${wer(e.p)} ${e.typ === 'zauber' ? 'wirkt' : 'spielt'} <b>${name(e.k)}</b>`;
      case 'falle_gelegt': return `${wer(e.p)} legt eine Falle`;
      case 'falle': return `Falle <b>${name(e.k)}</b> schnappt zu`;
      case 'angriff': return `${wer(e.p)} greift ${e.ziel === -1 ? 'den Helden' : 'ein Monster'} an (−${e.schaden})`;
      case 'tod': return `<b>${name(e.k)}</b> ist besiegt`;
      case 'aufstieg': return `${wer(e.p)}: Aufstieg!`;
      case 'muede': return `${wer(e.p)}: Deck leer, −${e.schaden}`;
      default: return '';
    }
  };
  return (v.log || []).slice(-14).map(text).filter(Boolean).slice(-7);
}
function detailZeichnen(K){
  const el = K.root && K.root.querySelector('#kkDetail'); if (!el) return;
  el.innerHTML = detailHtml(K) + '<button class="kk-detail-zu" id="kkDetailZu" aria-label="Schließen">×</button>';
  el.classList.toggle('offen', !!(K.detail && K.detail.fest) || !!(K.wahl && (K.wahl.art === 'hand' || K.wahl.art === 'info')));
  const ab = el.querySelector('#kkAbbrechen'); if (ab) ab.onclick = () => { K.wahl = null; K.detail = null; zeichne(K); };
  const sp = el.querySelector('#kkSpielen'); if (sp) sp.onclick = () => spielen(K, K.wahl.i, null, null);
  el.querySelector('#kkDetailZu').onclick = () => { K.detail = null; if (K.wahl && (K.wahl.art === 'hand' || K.wahl.art === 'info')){ K.wahl = null; if (K.v.phase !== 'frage') return zeichne(K); } detailZeichnen(K); };
}
// Überfahren mit der Maus zeigt die Karte groß; verlassen → zurück zur Auswahl
let hoverT = null;
function hoverBinden(K, el, obj){
  el.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => { K.detail = obj; detailZeichnen(K); }, 160); });
  el.addEventListener('pointerleave', e => { if (e.pointerType !== 'mouse') return; clearTimeout(hoverT); hoverT = setTimeout(() => { if (K.detail === obj){ K.detail = null; detailZeichnen(K); } }, 140); });
  // langes Drücken (Touch) öffnet die Details als Blatt
  let lang = null;
  el.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; lang = setTimeout(() => { K.langDruck = true; K.detail = Object.assign({fest: true}, obj); detailZeichnen(K); }, 450); });
  ['pointerup', 'pointercancel', 'pointermove'].forEach(t => el.addEventListener(t, e => { if (t === 'pointermove' && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) < 3) return; clearTimeout(lang); }));
  el.addEventListener('contextmenu', e => { if (K.langDruck) e.preventDefault(); });
}

function binden(K){
  const v = K.v;
  $('#kkZurueck').onclick = () => L.go('#/games/karten');
  const auf = $('#kkAufgeben'); if (auf) auf.onclick = () => aufgeben(K);
  $('#kkRegeln').onclick = regeln;
  $('#kkEnde').onclick = () => zugBeenden(K);
  const au = $('#kkAufstieg'); if (au) au.onclick = () => { K.wahl = K.wahl && K.wahl.art === 'aufstieg' ? null : {art: 'aufstieg'}; zeichne(K); };
  K.root.querySelectorAll('.kk-hk').forEach(b => {
    const i = +b.dataset.h;
    hoverBinden(K, b, {art: 'handzeigen', id: v.du.hand[i]});
    ziehenBinden(K, b, i);
    b.onclick = () => {
      if (K.gezogen || K.langDruck){ K.gezogen = false; K.langDruck = false; return; }
      // Während der Frage nur ansehen – das Brett bleibt stehen
      if (v.dran && v.phase === 'frage'){ K.detail = {art: 'handzeigen', id: v.du.hand[i], fest: true}; return detailZeichnen(K); }
      K.detail = null;
      K.wahl = K.wahl && K.wahl.art === 'hand' && K.wahl.i === i ? null : {art: 'hand', i};
      zeichne(K);
    };
  });
  K.root.querySelectorAll('.kk-platz').forEach(p => {
    const s = p.dataset.seite, i = +p.dataset.platz, u = p.querySelector('.einheit');
    if (u) hoverBinden(K, u, {art: 'info', seite: s, platz: i});
    p.onclick = () => { if (K.langDruck){ K.langDruck = false; return; } platzGetippt(K, s, i); };
    p.onkeydown = ev => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); p.click(); } };
  });
  const held = heldEl(K, 'gegner');
  held.onclick = () => {
    if (ziele(K).has('held')) return zielGewaehlt(K, 'held');
    if (K.wahl && K.wahl.art === 'angriff' && hatWaechter(v.gegner.feld)) grundBlase(held, 'Geschützt: Besiege zuerst die Wächter.');
    else if (hatWaechter(v.gegner.feld)) grundBlase(held, 'Solange ein Wächter steht, ist der Held geschützt.');
  };
  // Klick ins Leere hebt die Auswahl auf
  K.root.querySelector('.kk-feld').addEventListener('click', e => { if (e.target.classList.contains('kk-feld') || e.target.classList.contains('kk-reihe')){
    if (freiSpielbar(K) && !e.target.closest('.kk-reihe.gegner')) return spielen(K, K.wahl.i, null, null);
    if (K.wahl && v.phase !== 'frage'){ K.wahl = null; zeichne(K); } } });
}
function platzGetippt(K, s, i){
  const v = K.v, w = K.wahl, z = ziele(K), key = (s === 'du' ? 'e' : 'g') + i;
  if (w && (z.has(key) || (s === 'du' && z.has('leer' + i)))) return zielGewaehlt(K, s === 'du' && !v.du.feld[i] ? 'leer' + i : key);
  if (s === 'du' && freiSpielbar(K)) return spielen(K, w.i, null, null);
  const m = (s === 'du' ? v.du : v.gegner).feld[i];
  if (v.phase === 'frage' && v.dran){ if (m){ K.detail = {art: 'info', seite: s, platz: i, fest: true}; detailZeichnen(K); } return; }
  if (s === 'du' && kannAngreifen(K, m)){ K.wahl = w && w.art === 'angriff' && w.platz === i ? null : {art: 'angriff', platz: i}; return zeichne(K); }
  if (s === 'du' && m && v.dran){ K.grund = {seite: 'du', platz: i, text: grundAngriff(K, m, i)}; K.wahl = {art: 'info', seite: s, platz: i}; return zeichne(K); }
  if (s === 'gegner' && m && w && w.art === 'angriff' && m.tarn){ K.grund = {seite: 'gegner', platz: i, text: 'Getarnt – erst angreifbar, wenn es selbst angegriffen hat.'}; return zeichne(K); }
  if (s === 'gegner' && m && w && w.art === 'angriff' && hatWaechter(v.gegner.feld)){ K.grund = {seite: 'gegner', platz: i, text: 'Erst die Wächter besiegen.'}; return zeichne(K); }
  if (m){ K.wahl = {art: 'info', seite: s, platz: i}; return zeichne(K); }
  if (w && w.art === 'hand'){ K.grund = {seite: s, platz: i, text: grundHand(K, v.du.hand[w.i]) || (s === 'gegner' ? 'Monster kommen auf deine Seite.' : 'Hier geht das nicht.')}; return zeichne(K); }
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
// Ziehen & Ablegen von der Hand aufs Feld (Maus und Stift; Touch nach oben ziehen)
function zielMarkieren(K){
  const z = ziele(K);
  K.root.querySelectorAll('.kk-platz').forEach(p => { const s = p.dataset.seite, i = +p.dataset.platz; p.classList.toggle('ziel', z.has((s === 'du' ? 'e' : 'g') + i) || (s === 'du' && z.has('leer' + i))); });
  const h = heldEl(K, 'gegner'); if (h) h.classList.toggle('ziel', z.has('held'));
}
function ziehenBinden(K, b, i){
  let start = null, geist = null;
  b.addEventListener('pointerdown', e => { if (e.button > 0 || K.busy) return; start = {x: e.clientX, y: e.clientY, id: e.pointerId}; });
  b.addEventListener('pointermove', e => {
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!geist){
      if (Math.hypot(dx, dy) < 10) return;
      if (e.pointerType === 'touch' && !(dy < -12 && Math.abs(dy) > Math.abs(dx))) { start = null; return; }
      const id = K.v.du.hand[i];
      if (!spielbar(K, id)){ start = null; K.grund = null; grundBlase(b, grundHand(K, id) || 'Kein gültiges Ziel.'); return; }
      K.wahl = {art: 'hand', i}; zielMarkieren(K); b.classList.add('zieht');
      geist = document.createElement('div'); geist.className = 'kk-geist'; geist.innerHTML = GM.karte(id, {klasse: 'klein'});
      document.body.appendChild(geist);
      try { b.setPointerCapture(e.pointerId); } catch(x){}
    }
    const zm = L.zoom() || 1;
    geist.style.left = e.clientX / zm + 'px'; geist.style.top = e.clientY / zm + 'px';
    const unter = document.elementFromPoint(e.clientX, e.clientY);
    K.root.querySelectorAll('.drueber').forEach(x => x.classList.remove('drueber'));
    const ziel = unter && unter.closest('.kk-platz.ziel, .kk-held.ziel'); if (ziel) ziel.classList.add('drueber');
  });
  const los = e => {
    if (!start) return; start = null;
    if (!geist) return;
    geist.remove(); geist = null; b.classList.remove('zieht'); K.gezogen = true; setTimeout(() => { K.gezogen = false; }, 0);
    const unter = document.elementFromPoint(e.clientX, e.clientY), k = kat()[K.v.du.hand[i]];
    const p = unter && unter.closest('.kk-platz'), h = unter && unter.closest('.kk-held.gegner'), feld = unter && unter.closest('.kk-feld, .kk-held');
    const z = ziele(K);
    if (p){ const s = p.dataset.seite, n = +p.dataset.platz, key = s === 'du' && !K.v.du.feld[n] ? 'leer' + n : (s === 'du' ? 'e' : 'g') + n; if (z.has(key)) return zielGewaehlt(K, key); }
    if (h && z.has('held')) return zielGewaehlt(K, 'held');
    if (feld && !brauchtZiel(k)) return spielen(K, i, null, null);
    K.wahl = null; zeichne(K);
  };
  b.addEventListener('pointerup', los);
  b.addEventListener('pointercancel', () => { if (geist){ geist.remove(); geist = null; b.classList.remove('zieht'); K.wahl = null; zeichne(K); } start = null; });
}

/* ---------- Coach-Tipps im ersten Kampf (je Tipp einmal) ---------- */
const COACH_KEY = 'lernwerk.kk2.coach';
let coachEl = null;
function coachWeg(){ if (coachEl){ coachEl.remove(); coachEl = null; } }
function coach(K, key, el, text){
  const fertig = speicher.lesen(COACH_KEY, []);
  if (!el || coachEl || fertig.includes(key) || fertig.includes('alle')) return false;
  speicher.schreiben(COACH_KEY, fertig.concat(key));
  const zm = L.zoom() || 1, r = el.getBoundingClientRect();
  const b = document.createElement('div'); b.className = 'kk-coach pop-in';
  b.innerHTML = `<p>${text}</p><div class="row"><button class="btn primary klein" data-ok>Verstanden</button><button class="btn ghost klein" data-aus>Keine Tipps mehr</button></div>`;
  const oben = r.top > 170;
  b.style.left = Math.max(8, Math.min(window.innerWidth / zm - 300, (r.left + r.width / 2) / zm - 140)) + 'px';
  b.style.top = (oben ? r.top / zm - 10 : r.bottom / zm + 10) + 'px';
  b.classList.add(oben ? 'ueber' : 'unter');
  document.body.appendChild(b); coachEl = b;
  b.querySelector('[data-ok]').onclick = coachWeg;
  b.querySelector('[data-aus]').onclick = () => { speicher.schreiben(COACH_KEY, ['alle']); coachWeg(); };
  setTimeout(() => { if (coachEl === b) coachWeg(); }, 9000);
  return true;
}
function coachPruefen(K){
  const v = K.v; if (!K.root || !document.body.contains(K.root) || !v.dran || v.phase !== 'spielen' || K.busy) return;
  const r = K.root;
  coach(K, 'hand', r.querySelector('.kk-hk.spielbar'), 'Grün umrandete Karten kannst du spielen: antippen und dann den Platz wählen – oder direkt aufs Feld ziehen.')
    || coach(K, 'zzz', r.querySelector('.kk-reihe.du .eh-zustand.zzz'), '<b>Zzz</b> heißt: frisch gelegt. Das Monster greift erst in deinem nächsten Zug an.')
    || coach(K, 'angriff', r.querySelector('.kk-reihe.du .einheit.bereit'), 'Grün leuchtende Monster können angreifen: erst das Monster antippen, dann das Ziel.')
    || coach(K, 'waechter', r.querySelector('.kk-reihe.gegner .einheit.waechter'), '<b>Wächter</b> (Schild-Symbol) müssen zuerst besiegt werden. Solange ist der gegnerische Held geschützt.')
    || (hinweis(K).fertig && coach(K, 'ende', r.querySelector('#kkEnde'), 'Nichts mehr zu tun? Dann beende deinen Zug – der Gegner ist dran.'));
}

/* ---------- Aktionen ---------- */
async function aktion(K, fn, args, vorher){
  if (K.busy) return; K.busy = true;
  K.wahl = null; K.detail = null; coachWeg();
  try {
    if (vorher) vorher();
    const neu = await GM.rpc(fn, Object.assign({p_id: K.id}, args));
    await uebernehmen(K, neu);
  } catch(e){ L.toast(GM.fehlerText(e)); K.wahl = null; zeichne(K); }
  finally { K.busy = false; if (K.root) { const b = $('#kkEnde'); if (b) b.disabled = !(K.v.dran && K.v.phase === 'spielen'); } }
}
const spielen = (K, h, platz, ziel) => { const hk = K.root && K.root.querySelector(`.kk-hk[data-h="${h}"]`); K.flugVon = hk ? hk.getBoundingClientRect() : null; return aktion(K, 'kampf_spielen', {p_hand: h, p_platz: platz, p_ziel: ziel}); };
const angreifen = (K, von, ziel) => aktion(K, 'kampf_angreifen', {p_von: von, p_ziel: ziel});
const aufsteigen = (K, platz) => aktion(K, 'kampf_aufstieg', {p_platz: platz});
const zugBeenden = K => aktion(K, 'kampf_zug_beenden', {}, () => { const s = K.root.querySelector('.kk-status'); if (s) s.textContent = 'Zug endet …'; });
async function aufgeben(K){
  if (!confirm('Wirklich aufgeben? Dein Gegner gewinnt, du bekommst keine Belohnung.')) return;
  try { const neu = await GM.rpc('kampf_aufgeben', {p_id: K.id}); K.v = neu; zeichne(K); ende(K); } catch(e){ L.toast(GM.fehlerText(e)); }
}

/* ---------- Effekte ---------- */
const mitte = r => ({x: r.left + r.width / 2, y: r.top + r.height / 2});
function fest(cls, r){ // Element in fester Position über einem Bereich (r in echten Pixeln)
  const zm = L.zoom() || 1, d = document.createElement('div'); d.className = cls;
  if (r){ d.style.left = r.left / zm + 'px'; d.style.top = r.top / zm + 'px'; d.style.width = r.width / zm + 'px'; d.style.height = r.height / zm + 'px'; }
  document.body.appendChild(d); return d;
}
function einschlag(el, art){
  if (!el || !bewegung()) return;
  const d = fest('kk-einschlag ' + (art || ''), el.getBoundingClientRect());
  d.innerHTML = '<b></b>' + Array.from({length: 8}, (_, i) => `<i style="--w:${i * 45 + 20}deg"></i>`).join('');
  setTimeout(() => d.remove(), 650);
}
function partikel(el, art){
  if (!el || !bewegung()) return;
  const d = fest('kk-partikel ' + art, el.getBoundingClientRect());
  d.innerHTML = Array.from({length: 9}, (_, i) => `<i style="--x:${(i - 4) * 11}%;--t:${(i % 3) * 90}ms"></i>`).join('');
  setTimeout(() => d.remove(), 1100);
}
async function flug(vonR, zielEl, kid, K){
  if (!vonR || !zielEl || !bewegung() || K.schnell) return;
  const zm = L.zoom() || 1, zr = zielEl.getBoundingClientRect(), a = mitte(vonR), b = mitte(zr);
  const d = fest('kk-flug', vonR); d.innerHTML = GM.karte(kid, {klasse: 'klein'}); d.style.setProperty('--kw', vonR.width / zm + 'px');
  const s = zr.height / vonR.height;
  if (d.animate){ await d.animate([{transform: 'none'}, {transform: `translate(${(b.x - a.x) / zm}px, ${(b.y - a.y) / zm}px) scale(${Math.min(1, s)}) rotate(0deg)`, opacity: .85}], {duration: 360, easing: 'cubic-bezier(.3,.7,.3,1)'}).finished.catch(() => {}); }
  d.remove();
}
async function geschoss(vonEl, zielEl, art){
  if (!vonEl || !zielEl || !bewegung()) return;
  const zm = L.zoom() || 1, a = mitte(vonEl.getBoundingClientRect()), b = mitte(zielEl.getBoundingClientRect());
  const d = fest('kk-geschoss ' + (art || '')); d.style.left = a.x / zm + 'px'; d.style.top = a.y / zm + 'px';
  if (d.animate){ await d.animate([{transform: 'translate(-50%,-50%) scale(.6)'}, {transform: `translate(calc(-50% + ${(b.x - a.x) / zm}px), calc(-50% + ${(b.y - a.y) / zm}px)) scale(1.1)`}], {duration: 320, easing: 'ease-in'}).finished.catch(() => {}); }
  d.remove(); einschlag(zielEl, art);
}
function zerbrechen(u){
  if (!u || !bewegung()) return;
  const d = fest('kk-splitter', u.getBoundingClientRect()), bild = u.querySelector('.eh-bild'); if (!bild) return d.remove();
  const teile = ['0 0,55% 0,40% 45%,0 60%', '55% 0,100% 0,100% 40%,40% 45%', '0 60%,40% 45%,50% 100%,0 100%', '40% 45%,100% 40%,100% 100%,50% 100%'];
  d.innerHTML = teile.map((p, i) => `<div style="clip-path:polygon(${p});--dx:${[-40, 40, -30, 35][i]}px;--dy:${[-30, -35, 40, 30][i]}px;--rot:${[-25, 30, -35, 20][i]}deg">${bild.outerHTML}</div>`).join('');
  setTimeout(() => d.remove(), 750);
}
async function banner(K, text, art){
  if (!bewegung() || K.schnell || !K.root) return;
  const b = document.createElement('div'); b.className = 'kk-banner ' + (art || ''); b.innerHTML = `<span>${text}</span>`;
  K.root.appendChild(b); await warte(950); b.remove();
}
function schadenRand(){ if (!bewegung()) return; const d = fest('kk-schaden-rand'); setTimeout(() => d.remove(), 600); }
function goldBlitz(){ if (!bewegung()) return; const d = fest('bo-blitz gold'); setTimeout(() => d.remove(), 900); }

/* ---------- Ereignisse abspielen ---------- */
// Neue Log-Ereignisse nacheinander auf dem bisherigen Bild zeigen, danach den neuen Stand zeichnen. Ein Tipp auf das Brett spult vor.
async function uebernehmen(K, neu){
  const ev = (neu.log || []).filter(e => e.n > K.gesehen);
  K.schnell = false;
  const spulen = () => { K.schnell = true; };
  if (K.root) K.root.addEventListener('pointerdown', spulen, {once: true});
  await abspielen(K, ev, neu);
  K.v = neu; K.gesehen = neu.logn; K.flugVon = null; merken(K);
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
// Werte-Plakette am Monster sofort mitziehen (danach zeichnet zeichne() ohnehin den echten Stand)
function wertAendern(u, art, delta){
  const b = u && delta ? u.querySelector(art === 'a' ? '.eh-atk' : '.eh-hp') : null; if (!b) return;
  b.textContent = Math.max(0, +b.textContent + delta);
  if (art === 'v' && delta < 0) b.classList.add('runter');
  anim(b, delta < 0 ? 'wert-runter' : 'wert-hoch');
}
const geschuetzt = u => !!(u && u.classList.contains('schild'));
// Karte kurz groß zeigen (Gegner spielt etwas / Falle schnappt zu)
async function karteZeigen(K, id, titel, art){
  if (!K.root || K.schnell) return;
  const w = document.createElement('div'); w.className = 'kk-auftritt ' + (art || '');
  w.innerHTML = `<div class="kk-auftritt-in"><div class="eyebrow">${titel}</div>${GM.karte(id)}</div>`;
  K.root.appendChild(w);
  await pause(K, art === 'falle' ? 1350 : 1150);
  w.classList.add('weg'); await warte(200); w.remove();
}
function heldHp(K, s, delta){
  K.hp[s] = Math.min((s === 'du' ? K.v.du : K.v.gegner).maxhp, K.hp[s] + delta);
  GM.hpSetzen(hpEl(K, s), K.hp[s]);
  if (delta < 0){ anim(heldEl(K, s), 'bebt'); GM.klang('treffer'); if (s === 'du'){ schadenRand(); anim(K.root, 'wackelt'); } }
}
function einheitSetzen(K, s, platz, kid, kl){
  const p = platzEl(K, s, platz); const k = kat()[kid]; if (!p || !k) return;
  p.classList.add('belegt');
  p.innerHTML = einheit({k: kid, a: k.angriff, v: k.verteidigung, max: k.verteidigung, sch: k.schluessel || [], schild: (k.schluessel || []).includes('schild'), tarn: (k.schluessel || []).includes('tarnung')}, {klasse: kl || 'erscheint'});
}
async function abspielen(K, ev, neu){
  let zauberVon = null;
  for (const e of ev){
    if (!K.root || !document.body.contains(K.root)) return;
    const s = seite(K, e.p), o = s === 'du' ? 'gegner' : 'du';
    const ks = e.zs != null ? seite(K, e.zs) : null;
    switch (e.art){
      case 'zug': {
        const st = K.root.querySelector('.kk-status');
        if (s === 'gegner'){ if (st) st.textContent = `${neu.gegner_name} ist am Zug …`; await banner(K, `Zug von ${esc(neu.gegner_name)}`, 'gegner'); await pause(K, 250); }
        else if (ev.some(x => x.p !== K.v.ich)) await banner(K, 'Dein Zug', 'du');
        break; }
      case 'antwort':
        if (s === 'gegner'){ blase(K, 'gegner', e.ok ? `Frage richtig · +1 Fokus${e.aufstieg ? ' · Aufstieg!' : ''}` : 'Frage falsch', e.ok); await pause(K, 700); }
        break;
      case 'spielt': {
        const k = kat()[e.k] || {};
        if (s === 'gegner'){
          await karteZeigen(K, e.k, e.typ === 'zauber' ? `${esc(neu.gegner_name)} wirkt einen Zauber` : `${esc(neu.gegner_name)} beschwört`);
          const h = K.root.querySelector('.kk-gegner-hand i'); if (h) h.remove();
        }
        if (k.seltenheit === 'legendary') goldBlitz();
        if (e.typ === 'monster' && e.platz != null){
          if (s === 'du') await flug(K.flugVon, platzEl(K, 'du', e.platz), e.k, K);
          einheitSetzen(K, s, e.platz, e.k, 'landet'); GM.klang('flip'); einschlag(platzEl(K, s, e.platz), 'staub'); await pause(K, 380);
        }
        if (e.typ === 'zauber'){ zauberVon = s === 'du' ? (K.root.querySelector('.kk-held.du')) : heldEl(K, 'gegner'); if (s === 'du'){ const hk = K.root.querySelector('.kk-hk.gewaehlt'); if (hk) hk.style.visibility = 'hidden'; } }
        break; }
      case 'beschwoert':
        einheitSetzen(K, s, e.platz, e.k); await pause(K, 300); break;
      case 'falle_gelegt':
        if (s === 'gegner'){ blase(K, 'gegner', 'legt eine Falle', null); await pause(K, 500); } break;
      case 'falle':
        await karteZeigen(K, e.k, `Falle von ${s === 'du' ? 'dir' : esc(neu.gegner_name)}!`, 'falle'); zauberVon = s === 'du' ? K.root.querySelector('.kk-held.du') : heldEl(K, 'gegner'); break;
      case 'erleuchtet':
        anim(einheitEl(K, s, e.platz), 'leuchtet'); partikel(einheitEl(K, s, e.platz), 'gold'); await pause(K, 350); break;
      case 'aufstieg':
        anim(einheitEl(K, s, e.platz), 'steigt-auf'); partikel(einheitEl(K, s, e.platz), 'gold'); window.FX && FX.ton('abz'); blase(K, s, 'Aufstieg!', true); await pause(K, 700); break;
      case 'angriff': {
        const a = einheitEl(K, s, e.von), ziel = e.ziel === -1 ? heldEl(K, o) : einheitEl(K, o, e.ziel);
        if (a && ziel){
          const ra = a.getBoundingClientRect(), rz = ziel.getBoundingClientRect(), zm = L.zoom();
          a.style.setProperty('--dx', ((rz.left + rz.width / 2) - (ra.left + ra.width / 2)) * .72 / zm + 'px');
          a.style.setProperty('--dy', ((rz.top + rz.height / 2) - (ra.top + ra.height / 2)) * .72 / zm + 'px');
          anim(a, 'stoesst');
        }
        GM.klang('wusch'); await pause(K, 300);
        einschlag(ziel, 'treffer');
        if (e.ziel === -1){ heldHp(K, o, -e.schaden); zahl(heldEl(K, o), '−' + e.schaden); }
        else {
          anim(ziel, 'getroffen'); zahl(ziel, '−' + e.schaden); if (!geschuetzt(ziel)) wertAendern(ziel, 'v', -e.schaden);
          if (e.zurueck){ zahl(a, '−' + e.zurueck); if (!geschuetzt(a)) wertAendern(a, 'v', -e.zurueck); }
          GM.klang('treffer');
        }
        await pause(K, 520);
        break; }
      case 'abgewehrt':
        blase(K, s, 'Angriff abgewehrt!', false); await pause(K, 500); break;
      case 'schild':
        zahl(einheitEl(K, s, e.platz), 'Schild!', 'heil'); { const u = einheitEl(K, s, e.platz); if (u) u.classList.remove('schild'); } await pause(K, 250); break;
      case 'effekt':
        if (e.e === 'schaden'){
          const ziel = e.ziel === 'held' ? heldEl(K, ks) : einheitEl(K, ks, e.platz);
          if (zauberVon && !K.schnell) await geschoss(zauberVon, ziel, 'zauber'); else einschlag(ziel, 'treffer');
          if (e.ziel === 'held'){ heldHp(K, ks, -e.wert); zahl(heldEl(K, ks), '−' + e.wert); }
          else { anim(ziel, 'getroffen'); zahl(ziel, '−' + e.wert); if (!geschuetzt(ziel)) wertAendern(ziel, 'v', -e.wert); GM.klang('treffer'); }
          await pause(K, 380);
        } else if (e.e === 'heilen'){ heldHp(K, ks, e.wert); zahl(heldEl(K, ks), '+' + e.wert, 'heil'); partikel(heldEl(K, ks), 'gruen'); await pause(K, 350); }
        else if (e.e === 'staerken'){ const u = einheitEl(K, ks, e.platz); anim(u, 'leuchtet'); partikel(u, 'gold'); zahl(u, `+${e.a || 0}/+${e.v || 0}`, 'heil'); wertAendern(u, 'a', e.a || 0); wertAendern(u, 'v', e.v || 0); await pause(K, 300); }
        else if (e.e === 'schild'){ const u = einheitEl(K, ks, e.platz); if (u) u.classList.add('schild'); partikel(u, 'blau'); await pause(K, 200); }
        else if (e.e === 'betaeuben'){ const u = einheitEl(K, ks, e.platz); if (u){ u.classList.add('bet'); anim(u, 'getroffen'); } await pause(K, 300); }
        break;
      case 'tod': {
        const u = einheitEl(K, s, e.platz);
        if (u){ zerbrechen(u); u.classList.add('stirbt'); await pause(K, 420); const p = u.parentElement; u.remove(); if (p){ p.classList.remove('belegt'); p.innerHTML = '<span class="kk-leer"></span>'; } }
        break; }
      case 'muede':
        heldHp(K, s, -e.schaden); blase(K, s, `Deck leer · −${e.schaden} Leben`, false); await pause(K, 600); break;
      case 'verbrannt':
        if (s === 'du') L.toast('Hand voll – die gezogene Karte ist verbrannt.'); break;
    }
  }
}

/* ---------- Zugfrage: Leiste im Brett mit 20-Sekunden-Timer ---------- */
async function frageZeigen(K){
  const platz = K.root && K.root.querySelector('#kkFrage');
  if (!platz || platz.dataset.an || !K.v.frage) return;
  platz.dataset.an = '1';
  const serie = K.v.du.serie || 0;
  platz.innerHTML = `<div class="kk-frage-box pop-in"><div class="kk-uhr"><i></i></div>
    <div class="kk-frage-kopf"><span class="eyebrow">Zugfrage · Zug ${K.v.du.zug}</span><span class="kk-uhr-zahl" title="Sekunden">${FRAGE_SEK}</span>
      <span class="small muted">Richtig: <b>+1 Fokus</b> · <b>+1 Karte</b>${serie % 3 === 2 ? ' · <b>Aufstieg!</b>' : serie ? ` · Serie ${serie % 3} / 3` : ''}</span></div>
    ${GM.frageHtml(K.v.frage, {klasse: 'kompakt'})}<div class="kk-frage-fuss"></div></div>`;
  const root = platz.querySelector('.gfrage'), balken = platz.querySelector('.kk-uhr i'), zahlEl = platz.querySelector('.kk-uhr-zahl');
  coach(K, 'frage', platz, 'Jeder Zug beginnt mit einer Frage. Du hast <b>20 Sekunden</b> – richtig heißt <b>+1 Fokus und +1 Karte</b>. Tasten 1–4 gehen auch.');
  let fertig = false, t = null;
  const senden = async wahl => {
    if (fertig) return; fertig = true; clearInterval(t);
    if (wahl < 0){ root.dataset.gesperrt = '1'; root.querySelectorAll('.gopt').forEach(x => x.disabled = true); }
    try {
      const neu = await GM.rpc('kampf_antwort', {p_id: K.id, p_wahl: wahl});
      const a = neu.antwort;
      GM.frageAufloesen(root, wahl, a.richtig, {warum: true, erklaerung: a.erklaerung});
      platz.classList.add(a.ok ? 'richtig' : 'falsch');
      const auf = a.ok && neu.du.aufstieg && !K.v.du.aufstieg;
      const fuss = platz.querySelector('.kk-frage-fuss');
      fuss.innerHTML = `<div class="feedback ${a.ok ? 'ok' : 'bad'} pop">${a.ok ? L.ICON.ok + `Richtig! +1 Fokus, +1 Karte${auf ? ' – und ein Aufstieg ist bereit!' : ''}` : L.ICON.x + (a.zu_spaet ? 'Zeit abgelaufen – diesmal kein Bonus.' : 'Leider falsch – diesmal kein Bonus, die Serie beginnt neu.')}</div><button class="btn primary klein" id="kkWeiter">Weiter ${L.ICON.pfeil}</button>`;
      let weg = false;
      const weiter = async () => { if (weg || !document.body.contains(platz)) return; weg = true; await uebernehmen(K, neu); };
      $('#kkWeiter').onclick = weiter;
      setTimeout(weiter, a.ok ? (auf ? 2200 : 1300) : 3000);
    } catch(e){ L.toast(GM.fehlerText(e)); fertig = false; GM.frageFrei(root); }
  };
  GM.frageBinden(root, wahl => senden(wahl));
  let rest = K.v.frage_rest != null ? K.v.frage_rest : FRAGE_SEK;
  try { rest = await GM.rpc('kampf_frage_start', {p_id: K.id}); } catch(e){}
  if (!document.body.contains(platz) || fertig) return;
  const ende = Date.now() + rest * 1000;
  const tick = () => {
    if (fertig || !document.body.contains(platz)) return clearInterval(t);
    const ms = Math.max(0, ende - Date.now()), sek = Math.ceil(ms / 1000);
    balken.style.width = (ms / (FRAGE_SEK * 10)) + '%'; zahlEl.textContent = sek;
    platz.classList.toggle('knapp', sek <= 5);
    if (ms <= 0){ clearInterval(t); senden(-1); }
  };
  t = setInterval(tick, 200); tick();
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
