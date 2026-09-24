/* Lernwerk Games – Bomben-Quiz: Party-Modus für 2–6 Spieler, jeder am eigenen Gerät.
   Wann die Bombe explodiert, weiß nur der Server (bomben_geheim). Alle fragen jede Sekunde bombe_pruefen. */
(function(){
"use strict";
const L = window.LW, GM = window.LW_GAMES, G = window.GGFX, $ = (s, r=document) => r.querySelector(s), esc = L.esc;
const warte = ms => new Promise(r => setTimeout(r, ms));
const zeit = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

/* ---------- Start: Raum erstellen oder beitreten ---------- */
function viewStart(){
  const app = L.app();
  app.innerHTML = GM.zurueck() + L.seitenKopf('Lernwerk Games', 'Bomben-Quiz', 'Beantworte die Frage, bevor die Bombe explodiert.') + `
  <div class="bq-start">
    <div class="panel bq-intro"><div class="bq-art">${G.ART.bombe()}</div>
      <ol class="bq-regeln"><li><b>Wer die Bombe hat, bekommt eine Frage.</b></li><li><b>Richtig:</b> Die Bombe geht an den nächsten Spieler.</li><li><b>Falsch:</b> Die Bombe bleibt bei dir – und du bist 2 Sekunden gesperrt.</li><li>Irgendwann (20–45 s) knallt es. Wer sie dann hat, verliert ein Leben. Nach 2 Leben ist man raus.</li></ol>
      <p class="small muted">2–6 Spieler aus deiner Klasse, jeder am eigenen Gerät – oder mit KI-Mitspielern. Sieg: 40 XP + 30 Coins, dabei sein: 15 XP + 10 Coins (mit KI im Raum die Hälfte).</p></div>
    <div class="bq-aktionen">
      <div class="panel bq-kasten"><h3>Neuen Raum öffnen</h3><p class="small muted">Du bekommst einen Code, den du deiner Klasse sagst.</p><button class="btn primary gross" id="neu">${G.ico.flamme}Raum erstellen</button></div>
      <div class="panel bq-kasten"><h3>Allein gegen die KI</h3><p class="small muted">Sofort spielen mit zwei KI-Mitspielern. In der Lobby kannst du weitere hinzufügen.</p><button class="btn gross" id="kiRaum">${G.ico.bot}Mit KI spielen</button></div>
      <form class="panel bq-kasten" id="beitreten"><h3>Einem Raum beitreten</h3><label class="small muted" for="code">Raumcode</label>
        <input class="inp bq-code-inp mono" id="code" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD" required>
        <button class="btn primary" type="submit">Beitreten ${L.ICON.pfeil}</button></form>
    </div>
  </div>`;
  GM.zieleBinden(app);
  $('#code').oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  $('#neu').onclick = async () => { $('#neu').disabled = true; try { const r = await GM.rpc('bombe_erstellen'); L.go('#/games/bombe/' + r.id); } catch(e){ L.toast(GM.fehlerText(e)); $('#neu').disabled = false; } };
  $('#kiRaum').onclick = async () => { $('#kiRaum').disabled = true;
    try { let r = await GM.rpc('bombe_erstellen'); r = await GM.rpc('bombe_bot_hinzu', {p_raum: r.id}); r = await GM.rpc('bombe_bot_hinzu', {p_raum: r.id}); L.go('#/games/bombe/' + r.id); }
    catch(e){ L.toast(GM.fehlerText(e)); $('#kiRaum').disabled = false; } };
  $('#beitreten').onsubmit = async ev => { ev.preventDefault(); const b = ev.target.querySelector('button'); b.disabled = true;
    try { const r = await GM.rpc('bombe_beitreten', {p_code: $('#code').value}); L.go('#/games/bombe/' + r.id); } catch(e){ L.toast(GM.fehlerText(e)); b.disabled = false; window.FX && FX.wackeln(ev.target); } };
}

/* ---------- Raum ---------- */
async function viewRaum(id){
  const app = L.app();
  app.innerHTML = GM.laedt('Raum wird geladen …');
  let R; try { R = await GM.rpc('bombe_pruefen', {p_raum: id}); } catch(e){ return GM.fehlerZeigen(app, e, () => viewRaum(id)); }
  const B = {id, R, nr: -1, laeuft: false, weiterT: 0, fertig: false};
  GM.serverZeit(R.jetzt);
  zeichne(B);
  const holen = async () => {
    if (B.laeuft || B.fertig) return; B.laeuft = true;
    try { const neu = await GM.rpc('bombe_pruefen', {p_raum: id}); GM.serverZeit(neu.jetzt); uebernehmen(B, neu);
      // Explosion verpasst (z. B. Seite neu geladen): nächste Runde selbst anstoßen
      if (B.R.status === 'boom' && !$('.bq-explosion') && B.R.letzte && GM.jetzt() - Date.parse(B.R.letzte.zeit) > 4000){ const w = await GM.rpc('bombe_weiter', {p_raum: id}); uebernehmen(B, w); } } catch(e){ if (/nicht gefunden/.test(e.message)) { B.fertig = true; L.toast('Der Raum ist geschlossen.'); L.go('#/games/bombe'); } }
    finally { B.laeuft = false; }
  };
  const t = setInterval(() => { if (B.R.status === 'lobby' ? Date.now() % 3000 < 1000 : true) holen(); }, 1000);
  const uhr = setInterval(() => tick(B), 250);
  GM.beimVerlassen(() => { clearInterval(t); clearInterval(uhr); });
  GM.aufEreignis('bombe', row => { if (row.id === id) holen(); });
}
const name = (R, u) => (R.namen[u] || {}).n || 'Jemand';
const farbe = (R, u) => (R.namen[u] || {}).f || 'aew';
const istBot = (R, u) => !!(R.namen[u] || {}).ki;
const ava = (R, u) => istBot(R, u) ? `<span class="ava ki">${G.ico.bot}</span>` : `<span class="ava" style="background:var(--${farbe(R, u)})">${esc(name(R, u)[0].toUpperCase())}</span>`;

// Große Statuszeile: wer ist dran (KI „überlegt …“)
function statusHtml(R){
  if (R.status === 'boom') return boomText(R);
  if (R.bombe_bei === GM.ich()) return '<span class="bq-dran-du">Du bist dran!</span>';
  return `<b>${esc(name(R, R.bombe_bei))}</b> ist dran${istBot(R, R.bombe_bei) ? ' <span class="bq-denkt">überlegt<i>.</i><i>.</i><i>.</i></span>' : ''}`;
}
// Sitzwinkel am Tisch: du unten (90°), die anderen reihum
function sitz(R, i){ const n = R.spieler.length, ich = Math.max(0, R.spieler.indexOf(GM.ich())); return Math.round(90 + (i - ich) * 360 / n); }
// Bombe fliegt vom alten zum neuen Halter
function wurf(von, an){
  const a = document.querySelector(`.bq-sp[data-u="${von}"]`), b = document.querySelector(`.bq-sp[data-u="${an}"]`);
  if (!a || !b || !a.animate || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  const zm = L.zoom() || 1, ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
  const x0 = (ra.left + ra.width / 2) / zm, y0 = (ra.top + ra.height / 2) / zm, dx = (rb.left + rb.width / 2) / zm - x0, dy = (rb.top + rb.height / 2) / zm - y0;
  const d = document.createElement('div'); d.className = 'bq-wurf'; d.innerHTML = G.bombe(44); d.style.left = x0 + 'px'; d.style.top = y0 + 'px';
  document.body.appendChild(d);
  d.animate([{transform: 'translate(-50%,-50%) scale(.6) rotate(0)'}, {transform: `translate(calc(-50% + ${dx / 2}px), calc(-50% + ${dy / 2 - 70}px)) scale(1.1) rotate(200deg)`, offset: .5}, {transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(.7) rotate(400deg)`}], {duration: 600, easing: 'cubic-bezier(.4,0,.6,1)'}).finished.then(() => d.remove(), () => d.remove());
}
function zeichne(B){
  const R = B.R, app = L.app(), me = GM.ich();
  if (R.status === 'lobby') return lobby(B);
  if (R.status === 'fertig') return ergebnis(B);
  const beiMir = R.bombe_bei === me && R.status === 'laeuft';
  app.innerHTML = `<div class="bq ${beiMir ? 'bei-mir' : ''} ${R.status === 'boom' ? 'boom' : ''}" id="bq">
    <div class="kk-leiste"><button class="btn ghost" id="bqRaus">${L.ICON.back}<span>Verlassen</span></button><span class="kk-titel">Raum ${esc(R.code)} · Runde ${R.runde}</span><span></span></div>
    <div class="bq-tisch"><div class="bq-platte"></div>
    <div class="bq-bombe-platz"><div class="bq-bombe" id="bqBombe">${G.bombe(150)}<div class="bq-timer mono" id="bqUhr">0:00</div></div></div>
    <div class="bq-spieler ${R.status === 'laeuft' ? 'aktiv' : ''}">${R.spieler.map((u, i) => { const lb = R.leben[u] || 0; return `<div class="bq-sp ${u === R.bombe_bei ? 'hat' : ''} ${lb <= 0 ? 'raus' : ''} ${u === me ? 'ich' : ''}" data-u="${u}" style="--a:${sitz(R, i)}deg">${ava(R, u)}<b>${esc(name(R, u))}${u === me ? ' <small>(du)</small>' : ''}</b><span class="bq-herzen">${[0, 1].map(k => `<i class="${k < lb ? '' : 'leer'}">${G.ico.herz}</i>`).join('')}</span>${u === R.bombe_bei ? '<span class="bq-mini-bombe">' + G.bombe(26) + '</span>' : ''}</div>`; }).join('')}</div>
    </div>
    <div class="bq-mitte"><div class="bq-status" id="bqStatus">${statusHtml(R)}</div>
      <div class="bq-meldung" id="bqMeldung"></div></div>
    <div class="panel qbox bq-frage ${beiMir ? '' : 'zuschauen'}" id="bqFrage"></div>
  </div>`;
  $('#bqRaus').onclick = () => verlassen(B);
  B.nr = -1; frageZeigen(B);
}
function frageZeigen(B){
  const R = B.R, el = $('#bqFrage'); if (!el) return;
  if (R.status !== 'laeuft'){ el.innerHTML = `<p class="muted">${R.status === 'boom' ? 'Nächste Runde startet gleich …' : ''}</p>`; B.nr = R.frage_nr; return; }
  if (B.nr === R.frage_nr || B.pause > Date.now()) return;
  B.nr = R.frage_nr;
  const beiMir = R.bombe_bei === GM.ich();
  el.classList.toggle('zuschauen', !beiMir);
  el.innerHTML = (beiMir ? '' : `<p class="small muted bq-zuschauen">${esc(name(R, R.bombe_bei))} muss antworten – du schaust zu.</p>`) + GM.frageHtml(R.frage_id, {gesperrt: !beiMir});
  el.classList.remove('aufgeloest');
  if (!beiMir) return;
  const root = el.querySelector('.gfrage');
  sperreZeigen(B, root);
  GM.frageBinden(root, async wahl => {
    const nr = R.frage_nr;
    try {
      const neu = await GM.rpc('bombe_antwort', {p_raum: B.id, p_nr: nr, p_wahl: wahl});
      GM.serverZeit(neu.jetzt);
      if (neu.antwort){ GM.frageAufloesen(root, wahl, neu.antwort.richtig); await warte(neu.antwort.ok ? 450 : 1100); }
      uebernehmen(B, neu);
    } catch(e){ L.toast(GM.fehlerText(e)); GM.frageFrei(root); }
  });
}
// Was hat der andere Spieler (oder die KI) geantwortet? Alte Frage 1,9 s aufgelöst zeigen, dann die neue
function aufloesungZeigen(B, R, l, wer){
  const el = $('#bqFrage'); if (!el) return;
  B.pause = Date.now() + 1900;
  el.classList.add('zuschauen', 'aufgeloest');
  el.innerHTML = `<p class="small bq-zuschauen"><b>${esc(name(R, wer))}</b> hat geantwortet – <span class="${l.ok ? 'bq-ok' : 'bq-falsch'}">${l.ok ? 'richtig' : 'falsch'}</span></p>` + GM.frageHtml(l.frage, {gesperrt: true});
  GM.frageAufloesen(el.querySelector('.gfrage'), +l.wahl, +l.richtig, {nurZeigen: true});
  setTimeout(() => { B.pause = 0; frageZeigen(B); }, 1950);
}
// Nach falscher Antwort 2 s gesperrt (prüft der Server)
function sperreZeigen(B, root){
  const bis = B.R.gesperrt_bis ? Date.parse(B.R.gesperrt_bis) : 0, rest = bis - GM.jetzt();
  if (rest <= 0 || !root) return;
  root.classList.add('gesperrt'); root.querySelectorAll('.gopt').forEach(b => b.disabled = true);
  setTimeout(() => { if (document.body.contains(root)){ root.classList.remove('gesperrt'); GM.frageFrei(root); } }, rest + 50);
}
const boomText = R => { const o = R.letzte && R.letzte.opfer; return `<b>${esc(name(R, o))}</b> hat es erwischt!${R.letzte.raus ? ' Raus!' : ' −1 Leben'}`; };
function meldung(text, art){ const m = $('#bqMeldung'); if (!m) return; m.innerHTML = `<span class="${art || ''}">${text}</span>`; m.classList.remove('neu'); void m.offsetWidth; m.classList.add('neu'); }

function uebernehmen(B, neu){
  const alt = B.R; B.R = neu;
  if (neu.status !== alt.status || (neu.status === 'lobby' && neu.spieler.length !== alt.spieler.length) || neu.runde !== alt.runde){
    if (neu.status === 'boom' && alt.status === 'laeuft') return explosion(B);
    if (neu.status === 'fertig' && alt.status !== 'fertig'){ return alt.status === 'laeuft' ? explosion(B, true) : zeichne(B); }
    return zeichne(B);
  }
  if (neu.status !== 'laeuft') return;
  // Bombe weitergegeben oder falsch
  if (neu.frage_nr !== alt.frage_nr){
    const l = neu.letzte || {};
    if (l.art === 'weiter'){ meldung(`${esc(name(neu, l.von))} lag richtig → Bombe an <b>${esc(name(neu, l.an))}</b>`, 'gut'); GM.klang('wusch'); wurf(l.von, l.an); }
    if (l.art === 'falsch') meldung(`${esc(name(neu, l.wer))} lag falsch – die Bombe bleibt!`, 'schlecht');
    if (l.art === 'verlassen') meldung(`${esc(name(neu, l.wer))} hat das Spiel verlassen.`);
    const wer = l.von || l.wer;
    if (l.frage && l.wahl != null && wer && wer !== GM.ich()) aufloesungZeigen(B, neu, l, wer);
    const beiMir = neu.bombe_bei === GM.ich();
    if (beiMir && alt.bombe_bei !== GM.ich()){ window.FX && FX.ton('combo'); navigator.vibrate && navigator.vibrate(120); }
    $('#bq') && $('#bq').classList.toggle('bei-mir', beiMir);
    const st = $('#bqStatus'); if (st) st.innerHTML = statusHtml(neu);
    document.querySelectorAll('.bq-sp').forEach(s => { s.classList.toggle('hat', s.dataset.u === neu.bombe_bei); const m = s.querySelector('.bq-mini-bombe'); if (m) m.remove(); if (s.dataset.u === neu.bombe_bei) s.insertAdjacentHTML('beforeend', '<span class="bq-mini-bombe">' + G.bombe(26) + '</span>'); });
    frageZeigen(B);
  }
}
async function explosion(B, ende){
  const R = B.R, o = R.letzte && R.letzte.opfer;
  const bq = $('#bq');
  if (bq){
    bq.classList.add('boom'); GM.klang('boom'); navigator.vibrate && navigator.vibrate([200, 80, 300]);
    const fx = document.createElement('div'); fx.className = 'bq-explosion'; fx.innerHTML = Array.from({length: 18}, (_, i) => `<i style="--w:${i * 20}deg;--d:${60 + (i % 3) * 30}px"></i>`).join(''); bq.appendChild(fx);
    const st = $('#bqStatus'); if (st) st.innerHTML = boomText(R);
    const f = $('#bqFrage'); if (f) f.innerHTML = `<p class="muted">${o === GM.ich() ? 'Autsch – das warst du.' : 'Puh, diesmal nicht du.'}</p>`;
    document.querySelectorAll('.bq-sp').forEach(s => { if (s.dataset.u === o){ const i = s.querySelectorAll('.bq-herzen i:not(.leer)'); const h = i[i.length - 1]; if (h) h.classList.add('leer', 'platzt'); s.classList.add('getroffen'); } });
  }
  await warte(ende ? 2600 : 3700);
  if (!document.body.contains(bq)) return;
  if (ende || B.R.status === 'fertig') return zeichne(B);
  // nächste Runde: jeder im Raum darf auslösen, der Server startet sie genau einmal
  try { const neu = await GM.rpc('bombe_weiter', {p_raum: B.id}); GM.serverZeit(neu.jetzt); B.R = neu; } catch(e){}
  zeichne(B);
}
function tick(B){
  const R = B.R, uhr = $('#bqUhr'); if (!uhr || R.status !== 'laeuft' || !R.zuendung) return;
  const s = Math.max(0, (GM.jetzt() - Date.parse(R.zuendung)) / 1000);
  uhr.textContent = zeit(s);
  const bo = $('#bqBombe'); if (bo) bo.style.setProperty('--takt', (s > 35 ? .25 : s > 25 ? .45 : s > 15 ? .7 : 1.1) + 's');
  if (R.bombe_bei === GM.ich()){ const sek = Math.floor(s); if (sek !== B.letzteSek){ B.letzteSek = sek; window.FX && FX.ton('tick'); } }
}
function lobby(B){
  const R = B.R, app = L.app(), host = R.host === GM.ich();
  app.innerHTML = GM.zurueck('#/games/bombe', 'Bomben-Quiz') + `<div class="bq-lobby" id="bqLobby">
    <div class="panel bq-code-kasten"><div class="eyebrow">Raumcode</div><div class="bq-code mono">${esc(R.code)}</div><p class="small muted">Sag den Code deiner Klasse. Sie treten unter Games → Bomben-Quiz bei.</p></div>
    <div class="panel bq-kasten"><h3>Spieler (${R.spieler.length} / 6)</h3>
      <ul class="bq-liste">${R.spieler.map((u, i) => `<li style="--k:${i}">${ava(R, u)}<b>${esc(name(R, u))}</b>${istBot(R, u) ? '<span class="ki-tag">KI</span>' : ''}${u === R.host ? '<span class="tag">Gastgeber</span>' : ''}${u === GM.ich() ? '<span class="tag">du</span>' : ''}</li>`).join('')}</ul>
      ${host ? `<div class="bq-ki-leiste"><span class="small muted">KI-Mitspieler: ${(R.bots || []).length}</span><button class="btn klein" id="kiPlus" ${R.spieler.length >= 6 ? 'disabled' : ''}>${G.ico.bot}+ KI</button><button class="btn klein ghost" id="kiMinus" ${(R.bots || []).length ? '' : 'disabled'}>− KI</button></div>
        <button class="btn primary gross" id="start" ${R.spieler.length < 2 ? 'disabled' : ''}>${L.ICON.play}Spiel starten</button>${R.spieler.length < 2 ? '<p class="small muted">Warte auf Mitspieler oder füge KI-Mitspieler hinzu …</p>' : ''}` : `<p class="muted"><span class="g-spinner klein"></span> Warte, bis ${esc(name(R, R.host))} startet …</p>`}
      <button class="btn ghost" id="bqRaus">Raum verlassen</button></div></div>`;
  GM.zieleBinden(app);
  $('#bqRaus').onclick = () => verlassen(B);
  const kiAendern = fn => async ev => { ev.target.closest('button').disabled = true; try { B.R = await GM.rpc(fn, {p_raum: B.id}); } catch(e){ L.toast(GM.fehlerText(e)); } lobby(B); };
  const kp = $('#kiPlus'); if (kp) kp.onclick = kiAendern('bombe_bot_hinzu');
  const km = $('#kiMinus'); if (km) km.onclick = kiAendern('bombe_bot_weg');
  const s = $('#start'); if (s) s.onclick = async () => { s.disabled = true; try { const neu = await GM.rpc('bombe_starten', {p_raum: B.id}); GM.serverZeit(neu.jetzt); B.R = neu; zeichne(B); } catch(e){ L.toast(GM.fehlerText(e)); s.disabled = false; } };
}
async function ergebnis(B){
  if (B.fertig) return; B.fertig = true;
  const R = B.R, app = L.app(), me = GM.ich(), sieg = R.sieger === me;
  const reihe = [R.sieger].concat((R.raus || []).slice().reverse()).filter((u, i, a) => u && a.indexOf(u) === i);
  app.innerHTML = `<div class="session" id="bqEnde">${GM.ergebnisHtml({ergebnis: sieg ? 'sieg' : 'niederlage', eyebrow: 'Bomben-Quiz · Raum ' + esc(R.code), titel: sieg ? 'Du hast überlebt!' : `${esc(name(R, R.sieger))} gewinnt`,
    sub: `${R.runde} Runden · ${Object.values(R.richtige || {}).reduce((s, n) => s + n, 0)} richtige Antworten insgesamt`, symbol: sieg ? G.ico.pokal : G.bombe(64),
    extra: `<ol class="bq-platz">${reihe.map((u, i) => `<li>${i === 0 ? G.ico.pokal : `<span class="nr">${i + 1}</span>`}${ava(R, u)}<b>${esc(name(R, u))}</b><span class="muted small">${(R.richtige || {})[u] || 0} richtig</span></li>`).join('')}</ol>`,
    knoepfe: `<button class="btn primary" id="neuRaum">${G.ico.flamme}Neuer Raum</button><button class="btn ghost" data-ziel="#/games">Zu den Games</button>`})}</div>`;
  GM.zieleBinden(app); GM.ergebnisAn(app, sieg ? 'sieg' : 'niederlage');
  $('#neuRaum').onclick = async () => { try { const r = await GM.rpc('bombe_erstellen'); L.go('#/games/bombe/' + r.id); } catch(e){ L.toast(GM.fehlerText(e)); } };
  await GM.nachSpiel(`Bomben-Quiz: ${sieg ? 'gewonnen' : 'Platz ' + (reihe.indexOf(me) + 1)}`);
  GM.belohnungEinsetzen(app, 'bombe');
}
async function verlassen(B){
  if (B.R.status === 'laeuft' || B.R.status === 'boom'){ if (!confirm('Spiel verlassen? Dann bist du raus.')) return; }
  B.fertig = true;
  try { await GM.rpc('bombe_verlassen', {p_raum: B.id}); } catch(e){}
  L.go('#/games/bombe');
}

GM.MODULE.bombe = h => { const id = h.split('/')[3]; return id ? viewRaum(id) : viewStart(); };
})();
