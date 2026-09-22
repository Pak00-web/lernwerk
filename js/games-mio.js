/* Lernwerk Games – Quiz-Millionär: Einzelspieler auf der Wissensleiter. Fragen, Joker und Gewinn prüft der Server (mio_*). */
(function(){
"use strict";
const L = window.LW, GM = window.LW_GAMES, G = window.GGFX, $ = (s, r=document) => r.querySelector(s), esc = L.esc;
const LEITER = [10, 20, 30, 50, 75, 100, 150, 200, 300];   // XP je Stufe (wie _mio_leiter auf dem Server)
const SICHER = [3, 6];                                     // Sicherheitsstufen
const JOKER = [['fifty', 'joker50', '50/50', 'Zwei falsche Antworten weg'], ['hinweis', 'hinweis', 'Hinweis', 'Eine falsche Antwort mit Begründung'], ['wechsel', 'wechsel', 'Frage wechseln', 'Neue Frage, gleiche Stufe'], ['experte', 'experte', 'Expertenhilfe', 'Eine Lehrkraft gibt einen Tipp']];
const warte = ms => new Promise(r => setTimeout(r, ms));
const xp = n => n ? LEITER[n - 1] : 0;
const sicherBis = n => n >= 6 ? 6 : n >= 3 ? 3 : 0;

function leiterHtml(stufe){
  return `<ol class="mio-leiter">${LEITER.map((x, i) => { const n = i + 1;
    return `<li class="${n === stufe + 1 ? 'jetzt' : ''} ${n <= stufe ? 'geschafft' : ''} ${SICHER.includes(n) ? 'sicher' : ''}" style="--k:${i}"><span class="ml-nr">${n}</span><b>${x.toLocaleString('de-DE')} XP</b>${SICHER.includes(n) ? `<span class="ml-sicher" title="Sicherheitsstufe">${L.ICON.lock}</span>` : ''}</li>`; }).reverse().join('')}</ol>`;
}

async function viewStart(){
  const app = L.app();
  let konto = GM.konto(); try { konto = await GM.kontoLaden(); } catch(e){}
  const beste = konto ? ((konto.statistik || {}).mio || {}).beste || 0 : 0;
  app.innerHTML = GM.zurueck() + L.seitenKopf('Lernwerk Games', 'Quiz-Millionär', 'Wie weit kommst du auf der Wissensleiter?') + `
  <div class="mio-start">
    <div class="panel mio-intro"><div class="mio-art">${G.ART.millionaer()}</div>
      <ul class="mio-regeln">
        <li>${G.ico.xp}<span><b>9 Fragen, 9 Stufen</b> – jede richtige Antwort bringt dich eine Stufe höher. Es geht nur um XP, Coins und Ruhm – kein echtes Geld.</span></li>
        <li>${L.ICON.lock}<span><b>Sicherheitsstufen 3 und 6:</b> Bei einer falschen Antwort fällst du nur auf die letzte Sicherheitsstufe zurück.</span></li>
        <li>${G.ico.pokal}<span><b>Aussteigen</b> geht jederzeit – dann behältst du deinen aktuellen Gewinn.</span></li>
        <li>${G.ico.joker50}<span><b>4 Joker</b>, jeder nur einmal pro Spiel.</span></li>
      </ul>
      <div class="row"><button class="btn primary gross" id="los">${L.ICON.play}Spiel starten</button>${beste ? `<span class="muted small">Dein Bestwert: Stufe ${beste} · ${xp(beste)} XP</span>` : ''}</div>
      ${(konto && (konto.titel || []).includes('Quiz-Millionär')) ? '' : '<p class="small muted">Wer alle 9 schafft, bekommt den Titel „Quiz-Millionär“ und einen Booster.</p>'}
    </div>
    <div class="panel mio-seite">${leiterHtml(0)}</div>
  </div>`;
  GM.zieleBinden(app);
  $('#los').onclick = async () => { $('#los').disabled = true; try { spielen(await GM.rpc('mio_starten')); } catch(e){ L.toast(GM.fehlerText(e)); $('#los').disabled = false; } };
}

function spielen(s){
  const M = {id: s.id, stufe: s.stufe, frage: s.frage, joker: s.joker, weg: [], busy: false};
  zeichne(M);
}
function zeichne(M, animStufe){
  const app = L.app();
  app.innerHTML = `<div class="mio">
    <div class="kk-leiste"><button class="btn ghost" id="mioRaus">${L.ICON.back}<span>Games</span></button><span class="kk-titel">Quiz-Millionär · Frage ${M.stufe + 1} von 9</span><button class="btn" id="mioAus" ${M.stufe ? '' : 'disabled'}>Aussteigen · ${xp(M.stufe)} XP</button></div>
    <div class="mio-raster">
      <div class="mio-haupt">
        <div class="mio-gewinn"><div><span class="eyebrow">Aktueller Gewinn</span><b>${xp(M.stufe)} XP</b></div><div class="mio-pfeil">${L.ICON.pfeil}</div><div class="naechstes"><span class="eyebrow">Nächstes Ziel</span><b>${xp(M.stufe + 1)} XP</b></div><div class="mio-sicher"><span class="eyebrow">Sicher</span><b>${xp(sicherBis(M.stufe))} XP</b></div></div>
        <div class="mio-mini">${LEITER.map((_, i) => `<i class="${i < M.stufe ? 'an' : ''} ${i === M.stufe ? 'jetzt' : ''} ${SICHER.includes(i + 1) ? 'sicher' : ''}"></i>`).join('')}</div>
        <div class="mio-joker">${JOKER.map(([k, ico, t, tip]) => `<button class="mio-jk ${M.joker[k] ? '' : 'weg'}" data-j="${k}" title="${tip}" ${M.joker[k] ? '' : 'disabled'}>${G.ico[ico]}<span>${t}</span></button>`).join('')}</div>
        <div class="panel qbox mio-frage" id="mioFrage">${GM.frageHtml(M.frage)}</div>
        <div id="mioHilfe"></div>
      </div>
      <aside class="panel mio-seite">${leiterHtml(M.stufe)}</aside>
    </div></div>`;
  if (animStufe) { const li = app.querySelector('.mio-leiter li.geschafft'); if (li) li.classList.add('neu'); }
  $('#mioRaus').onclick = () => { if (confirm('Spiel verlassen? Dann steigst du mit deinem aktuellen Gewinn aus.')) aussteigen(M, '#/games'); };
  $('#mioAus').onclick = () => { if (confirm(`Aussteigen und ${xp(M.stufe)} XP mitnehmen?`)) aussteigen(M); };
  app.querySelectorAll('[data-j]').forEach(b => b.onclick = () => joker(M, b.dataset.j, b));
  M.weg.forEach(i => { const o = app.querySelector(`.gopt[data-o="${i}"]`); if (o){ o.disabled = true; o.classList.add('ausgeblendet'); } });
  const root = app.querySelector('.gfrage');
  GM.frageBinden(root, wahl => antworten(M, root, wahl));
}
async function antworten(M, root, wahl){
  if (M.busy) return; M.busy = true;
  const knopf = root.querySelector(`.gopt[data-o="${wahl}"]`); knopf && knopf.classList.add('eingeloggt');
  $('#mioAus') && ($('#mioAus').disabled = true);
  document.querySelectorAll('.mio-jk').forEach(b => b.disabled = true);
  let r;
  try { [r] = await Promise.all([GM.rpc('mio_antwort', {p_id: M.id, p_wahl: wahl}), warte(900)]); }   // kurze Spannung
  catch(e){ L.toast(GM.fehlerText(e)); M.busy = false; GM.frageFrei(root); return; }
  GM.frageAufloesen(root, wahl, r.richtig, {warum: true});
  if (r.ok && !r.beendet){
    GM.klang('wusch');
    await warte(1400);
    M.stufe = r.stufe; M.frage = r.frage; M.weg = []; M.busy = false;
    if (SICHER.includes(r.stufe)) L.toast(`Sicherheitsstufe erreicht: ${xp(r.stufe)} XP sind dir sicher!`);
    return zeichne(M, true);
  }
  await warte(r.ok ? 900 : 2200);
  ende(r, r.ok ? 'sieg' : 'verloren');
}
async function aussteigen(M, danach){
  if (M.busy) return; M.busy = true;
  try { const r = await GM.rpc('mio_aussteigen', {p_id: M.id}); if (danach){ GM.nachSpiel(`Quiz-Millionär: bei Stufe ${r.stufe} ausgestiegen`); return L.go(danach); } ende(r, 'ausgestiegen'); }
  catch(e){ L.toast(GM.fehlerText(e)); M.busy = false; }
}
async function joker(M, art, b){
  if (M.busy || !M.joker[art]) return; M.busy = true;
  let r; try { r = await GM.rpc('mio_joker', {p_id: M.id, p_art: art}); } catch(e){ L.toast(GM.fehlerText(e)); M.busy = false; return; }
  M.joker[art] = false; M.busy = false;
  b.classList.add('benutzt'); b.disabled = true; window.FX && FX.ton('combo');
  const hilfe = $('#mioHilfe'), e = L.D.einheiten.find(x => x.id === M.frage);
  const buchstabe = i => { const o = document.querySelector(`.gopt[data-o="${i}"] .box`); return o ? o.textContent : '?'; };
  if (art === 'fifty'){
    M.weg = M.weg.concat(r.weg);
    r.weg.forEach((i, k) => setTimeout(() => { const o = document.querySelector(`.gopt[data-o="${i}"]`); if (o){ o.classList.add('ausblenden'); o.disabled = true; } }, k * 250));
  }
  if (art === 'hinweis'){
    const o = e && e.optionen[r.falsch];
    hilfe.innerHTML = `<div class="panel mio-hilfe pop-in">${G.ico.hinweis}<div><b>Hinweis: Antwort ${buchstabe(r.falsch)} ist falsch.</b>${o && o[2] ? `<p class="small muted">${L.md(o[2])}</p>` : ''}</div></div>`;
    const x = document.querySelector(`.gopt[data-o="${r.falsch}"]`); if (x){ x.classList.add('ausblenden'); x.disabled = true; M.weg.push(r.falsch); }
  }
  if (art === 'experte'){
    const sicher = r.sicher >= 88 ? 'ziemlich sicher' : r.sicher >= 78 ? 'recht sicher' : 'nicht ganz sicher';
    hilfe.innerHTML = `<div class="panel mio-hilfe pop-in">${G.ico.experte}<div><b>Die Lehrkraft meint: „Ich würde ${buchstabe(r.vorschlag)} nehmen.“</b><p class="small muted">Sie ist ${sicher} (${r.sicher} %). Aber auch Lehrkräfte irren sich mal …</p></div></div>`;
    const x = document.querySelector(`.gopt[data-o="${r.vorschlag}"]`); if (x) x.classList.add('tipp');
  }
  if (art === 'wechsel'){ M.frage = r.frage; M.weg = []; zeichne(M); }
}
function ende(r, art){
  const app = L.app(), b = r.belohnung, s = r.stufe;
  const titel = art === 'sieg' ? 'Quiz-Millionär!' : art === 'ausgestiegen' ? 'Clever ausgestiegen' : 'Leider falsch';
  const sub = art === 'sieg' ? 'Alle 9 Stufen geschafft – Wahnsinn!' : art === 'ausgestiegen' ? `Du steigst bei Stufe ${s} aus und nimmst ${r.gewinn} XP mit.` : `Du warst auf Stufe ${s}. ${r.gewinn ? `Die Sicherheitsstufe rettet dir ${r.gewinn} XP.` : 'Beim nächsten Mal klappt es!'}`;
  app.innerHTML = `<div class="session">${GM.ergebnisHtml({ergebnis: art === 'sieg' ? 'sieg' : art === 'verloren' ? 'niederlage' : 'remis', eyebrow: 'Quiz-Millionär', titel, sub, belohnung: b,
    symbol: art === 'sieg' ? G.muenze(64) : undefined, extra: `<div class="mio-end-leiter">${leiterHtml(s).replace('mio-leiter', 'mio-leiter klein')}</div>`,
    knoepfe: `<button class="btn primary" id="nochmal">${L.ICON.play}Nochmal spielen</button><button class="btn ghost" data-ziel="#/games">Zu den Games</button>`})}</div>`;
  GM.zieleBinden(app); GM.ergebnisAn(app, art === 'sieg' ? 'sieg' : art === 'verloren' ? 'niederlage' : 'remis');
  $('#nochmal').onclick = async () => { $('#nochmal').disabled = true; try { spielen(await GM.rpc('mio_starten')); } catch(e){ L.toast(GM.fehlerText(e)); $('#nochmal').disabled = false; } };
  GM.nachSpiel(`Quiz-Millionär: Stufe ${s} · ${r.gewinn} XP`);
}

GM.MODULE.millionaer = () => viewStart();
})();
