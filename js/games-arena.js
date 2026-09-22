/* Lernwerk Games – Wissens-Arena: Live-Duell mit Rangsystem. Fragen, Zeitmessung, Schaden und Rangpunkte berechnet der Server (arena_*). */
(function(){
"use strict";
const L = window.LW, GM = window.LW_GAMES, G = window.GGFX, $ = (s, r=document) => r.querySelector(s), esc = L.esc;
const warte = ms => new Promise(r => setTimeout(r, ms));
const HP = 50;

/* ---------- Lobby mit Rang ---------- */
async function viewLobby(){
  const app = L.app();
  app.innerHTML = GM.zurueck() + L.seitenKopf('Lernwerk Games', 'Wissens-Arena', 'Duell gegen andere Lernende. Wissen entscheidet.') + `<div id="arl">${GM.laedt()}</div>`;
  GM.zieleBinden(app);
  const el = $('#arl');
  let konto, liste, matches;
  try {
    konto = await GM.kontoLaden();
    const [r1, r2] = await Promise.all([GM.sb().rpc('arena_rangliste'), GM.sb().from('arena_matches').select('*').in('status', ['angefragt', 'laeuft']).order('erstellt', {ascending: false})]);
    if (r1.error) throw r1.error; if (r2.error) throw r2.error;
    liste = r1.data || []; matches = r2.data || [];
  } catch(e){ return GM.fehlerZeigen(el, e, viewLobby); }
  if (!document.body.contains(el)) return;
  const me = GM.ich(), r = GM.rang(konto.rang_punkte), sp = konto.arena_siege + konto.arena_niederlagen + konto.arena_remis;
  const quote = sp ? Math.round(konto.arena_siege / sp * 100) : 0;
  const nm = Object.fromEntries(liste.map(x => [x.id, x]));
  const frisch = m => Date.now() - Date.parse(m.erstellt) < 15 * 60000;
  const an = matches.filter(m => m.status === 'angefragt' && m.spieler_b === me && frisch(m));
  const von = matches.filter(m => m.status === 'angefragt' && m.spieler_a === me && frisch(m));
  const laufend = matches.filter(m => m.status === 'laeuft' && m.runde_ende && Date.now() - Date.parse(m.runde_ende) < 110000);
  const gName = m => { const g = nm[m.spieler_a === me ? m.spieler_b : m.spieler_a]; return g ? g.spitzname : 'Unbekannt'; };
  const sortiert = liste.slice().sort((a, b) => b.rang_punkte - a.rang_punkte || b.siege - a.siege || a.spitzname.localeCompare(b.spitzname));
  el.innerHTML = `
  <div class="ar-oben">
    <div class="panel ar-rang r-${r.id}">
      <div class="ar-rang-badge">${G.rangAbzeichen(r.id, 96)}</div>
      <div class="ar-rang-info"><div class="eyebrow">Dein Rang</div><h2>${r.name}</h2><p><b class="mono">${konto.rang_punkte}</b> Rangpunkte</p>
        ${r.naechster ? `<div class="bar ar-rang-bar"><i style="width:${r.prozent}%"></i></div><small class="muted">Noch ${r.naechster.ab - konto.rang_punkte} RP bis ${r.naechster.name}</small>` : '<small class="muted">Höchster Rang erreicht!</small>'}</div>
      <ul class="ar-stats"><li><b>${konto.arena_siege}</b><span>Siege</span></li><li><b>${konto.arena_niederlagen}</b><span>Niederlagen</span></li><li><b>${quote} %</b><span>Siegesquote</span></li><li><b>${konto.arena_serie}</b><span>Siegesserie</span></li></ul>
    </div>
    <div class="panel ar-aktion">
      <h3>Bereit fürs Duell?</h3><p class="small muted">5 Runden, beide bekommen dieselbe Frage. Richtig macht Schaden – je schneller, desto mehr: <b>≤ 4 s: 14</b> · <b>≤ 9 s: 11</b> · <b>sonst: 8</b>. 50 Lebenspunkte.</p>
      <button class="btn primary gross" id="suchen">${G.ico.schwert}Gegner suchen</button>
      <button class="btn" id="fordern">Mitschüler herausfordern</button>
      <p class="tiny muted">Sieg: +25 RP (+5 je Serie, bis +40), 60 XP, 40 Coins · Niederlage: −15 RP, 20 XP</p>
    </div>
  </div>
  ${an.length || von.length || laufend.length ? `<section class="section"><div class="section-head"><h2>Offene Duelle</h2></div><div class="stack">
    ${an.map(m => `<div class="panel drow dran"><span class="ava" style="background:var(--${(nm[m.spieler_a] || {}).farbe || 'aew'})">${esc(gName(m)[0].toUpperCase())}</span><div><b>${esc(gName(m))}</b><div class="small muted">fordert dich heraus</div></div><span></span><div class="row"><button class="btn primary" data-annehmen="${m.id}">Annehmen</button><button class="btn ghost" data-ablehnen="${m.id}">Ablehnen</button></div></div>`).join('')}
    ${von.map(m => `<div class="panel drow"><span class="ava" style="background:var(--${(nm[m.spieler_b] || {}).farbe || 'aew'})">${esc(gName(m)[0].toUpperCase())}</span><div><b>${esc(gName(m))}</b><div class="small muted">Warte auf Antwort …</div></div><span></span><button class="btn ghost" data-ablehnen="${m.id}">Zurückziehen</button></div>`).join('')}
    ${laufend.map(m => `<div class="panel drow dran"><span class="ava" style="background:var(--aew)">${esc(gName(m)[0].toUpperCase())}</span><div><b>${esc(gName(m))}</b><div class="small muted">Läuft · Runde ${m.runde} / ${m.runden}</div></div><span></span><button class="btn primary" data-oeffnen="${m.id}">Weiterspielen</button></div>`).join('')}
  </div></section>` : ''}
  <section class="section"><div class="section-head"><h2>Arena-Rangliste</h2><span class="muted small">deine Klasse</span></div>
    <div class="rliste">${sortiert.map((x, i) => `<div class="panel rrow ar-rrow ${x.id === me ? 'du' : ''}" style="--k:${i}"><span class="platz p${i + 1}">${i + 1}</span>${GM.rangBadge(x.rang_punkte, 34)}<div class="rname"><b>${esc(x.spitzname)}${x.id === me ? ' <span class="tag">du</span>' : ''}</b><span class="tiny muted">${GM.rang(x.rang_punkte).name} · ${x.siege} S · ${x.niederlagen} N${x.serie > 1 ? ` · ${x.serie}er-Serie` : ''}</span></div><span class="rxp mono">${x.rang_punkte} RP</span></div>`).join('') || '<p class="muted">Noch niemand in der Klasse.</p>'}</div></section>
  <section class="section"><div class="section-head"><h2>Rangstufen</h2></div>
    <div class="ar-stufen">${GM.RAENGE.map(([id, n, ab]) => `<div class="ar-stufe ${id === r.id ? 'jetzt' : ''}">${G.rangAbzeichen(id, 48)}<b>${n}</b><small>ab ${ab} RP</small></div>`).join('')}</div></section>`;
  el.querySelectorAll('[data-annehmen]').forEach(b => b.onclick = () => L.go('#/games/arena/' + b.dataset.annehmen + '/annehmen'));
  el.querySelectorAll('[data-oeffnen]').forEach(b => b.onclick = () => L.go('#/games/arena/' + b.dataset.oeffnen));
  el.querySelectorAll('[data-ablehnen]').forEach(b => b.onclick = async () => { try { await GM.rpc('arena_ablehnen', {p_id: b.dataset.ablehnen}); } catch(e){} viewLobby(); });
  $('#suchen').onclick = suchen;
  $('#fordern').onclick = () => fordern(liste.filter(x => x.id !== me));
  // Einladungen live, solange die Lobby offen ist
  GM.aufEreignis('arena', (row, p) => { if (row.spieler_b === me && row.status === 'angefragt' && p.eventType === 'INSERT') viewLobby(); });
}

function warteFenster(titel, text, abbrechen){
  const w = document.createElement('div'); w.className = 'overlay';
  w.innerHTML = `<div class="overlay-box pop-in ar-warte"><div class="ar-radar"><i></i><i></i><i></i>${G.ico.schwert}</div><h2>${titel}</h2><p class="muted">${text}</p><button class="btn ghost" data-zu>Abbrechen</button></div>`;
  document.body.appendChild(w);
  w.querySelector('[data-zu]').onclick = () => { w.remove(); abbrechen(); };
  return w;
}
function suchen(){
  let aktiv = true, t = null;
  const stop = () => { aktiv = false; clearTimeout(t); };
  const w = warteFenster('Suche Gegner …', 'Sobald jemand aus deiner Klasse auch sucht, geht es los.', async () => { stop(); try { await GM.rpc('arena_suche_abbrechen'); } catch(e){} });
  GM.beimVerlassen(() => { if (aktiv){ stop(); w.remove(); GM.rpc('arena_suche_abbrechen').catch(() => {}); } });
  const gefunden = id => { if (!aktiv) return; stop(); w.remove(); window.FX && FX.ton('combo'); L.go('#/games/arena/' + id); };
  GM.aufEreignis('arena', row => { if (row.status === 'laeuft' && (row.spieler_a === GM.ich() || row.spieler_b === GM.ich())) gefunden(row.id); });
  const runde = async () => {
    if (!aktiv) return;
    try { const m = await GM.rpc('arena_suchen'); if (m && m.id) return gefunden(m.id); }
    catch(e){ L.toast(GM.fehlerText(e)); stop(); w.remove(); return; }
    t = setTimeout(runde, 4000);
  };
  runde();
}
function fordern(liste){
  const w = document.createElement('div'); w.className = 'overlay';
  w.innerHTML = `<div class="overlay-box g-wahl pop-in"><div class="eyebrow">Wissens-Arena</div><h2>Wen forderst du heraus?</h2><p class="small muted">Die Person muss gerade online sein und innerhalb von 15 Minuten annehmen.</p><input class="inp" id="gsuch" placeholder="Spitzname suchen"><div class="g-wahl-liste" id="gliste"></div><button class="btn ghost" data-zu>Abbrechen</button></div>`;
  document.body.appendChild(w);
  w.querySelector('[data-zu]').onclick = () => w.remove();
  w.onclick = e => { if (e.target === w) w.remove(); };
  const zeichne = q => { $('#gliste').innerHTML = liste.filter(x => x.spitzname.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.spitzname.localeCompare(b.spitzname)).map(x => `<button class="drow wahl panel" data-g="${x.id}">${GM.rangBadge(x.rang_punkte, 28)}<div><b>${esc(x.spitzname)}</b><div class="small muted">${GM.rang(x.rang_punkte).name} · ${x.rang_punkte} RP</div></div>${G.ico.schwert}</button>`).join('') || '<p class="muted">Noch niemand sonst in deiner Klasse.</p>';
    w.querySelectorAll('[data-g]').forEach(b => b.onclick = async () => {
      w.remove();
      let m; try { m = await GM.rpc('arena_herausfordern', {p_gegner: b.dataset.g}); } catch(e){ return L.toast(GM.fehlerText(e)); }
      const name = (liste.find(x => x.id === b.dataset.g) || {}).spitzname || 'deinem Gegner';
      let offen = true;
      const f = warteFenster(`Warte auf ${esc(name)} …`, 'Die Herausforderung gilt 15 Minuten.', async () => { offen = false; try { await GM.rpc('arena_ablehnen', {p_id: m.id}); } catch(e){} });
      const pruefe = row => {
        if (row.id !== m.id || !offen) return;
        if (row.status === 'laeuft'){ offen = false; f.remove(); window.FX && FX.ton('combo'); L.go('#/games/arena/' + m.id); }
        if (row.status === 'abgelehnt' || row.status === 'abgebrochen'){ offen = false; f.remove(); L.toast(`${name} hat abgelehnt.`); viewLobby(); }
      };
      GM.aufEreignis('arena', pruefe);
      // Rückfallebene, falls die Live-Nachricht nicht ankommt
      const t = setInterval(async () => { if (!offen) return clearInterval(t); try { pruefe(await GM.rpc('arena_pruefen', {p_id: m.id})); } catch(e){} }, 3000);
      GM.beimVerlassen(() => { clearInterval(t); if (offen) f.remove(); });
    }); };
  $('#gsuch').oninput = e => zeichne(e.target.value); zeichne('');
}

/* ---------- Match ---------- */
async function viewMatch(id, annehmen){
  const app = L.app();
  app.innerHTML = GM.laedt(annehmen ? 'Duell wird gestartet …' : 'Duell wird geladen …');
  let A;
  try { A = await GM.rpc(annehmen ? 'arena_annehmen' : 'arena_pruefen', {p_id: id}); }
  catch(e){ return GM.fehlerZeigen(app, e, () => viewMatch(id)); }
  if (annehmen) history.replaceState(null, '', '#/games/arena/' + id);
  GM.serverZeit(A.jetzt);
  const M = {id, A, runde: 0, verlauf: A.verlauf.length, busy: false, fertig: false, beantwortet: false};
  if (A.status === 'abgelehnt' || A.status === 'abgebrochen'){ app.innerHTML = `<div class="panel g-leer"><h3>Dieses Duell findet nicht statt</h3><p class="muted">${A.status === 'abgelehnt' ? 'Die Herausforderung wurde abgelehnt oder zurückgezogen.' : 'Das Duell ist abgelaufen.'}</p><button class="btn primary" data-ziel="#/games/arena">Zur Arena</button></div>`; return GM.zieleBinden(app); }
  if (A.status === 'angefragt'){ app.innerHTML = `<div class="panel g-leer"><h3>Warte auf deinen Gegner …</h3><p class="muted">Sobald die Herausforderung angenommen ist, geht es los.</p><button class="btn" data-ziel="#/games/arena">Zur Arena</button></div>`; GM.zieleBinden(app); }
  else zeichne(M);
  const holen = async () => {
    if (M.busy || M.fertig) return; M.busy = true;
    try { const neu = await GM.rpc('arena_pruefen', {p_id: id}); GM.serverZeit(neu.jetzt); await uebernehmen(M, neu); } catch(e){}
    finally { M.busy = false; }
  };
  const t = setInterval(holen, 1500), uhr = setInterval(() => tick(M), 100);
  GM.beimVerlassen(() => { clearInterval(t); clearInterval(uhr); });
  GM.aufEreignis('arena', row => { if (row.id === id) holen(); });
}
const seiten = A => ({du: A.ich, er: A.ich === 'a' ? 'b' : 'a'});
const nameVon = (A, s) => { const u = s === 'a' ? A.spieler_a : A.spieler_b; return (A.namen[u] || {}).n || 'Gegner'; };
const farbeVon = (A, s) => { const u = s === 'a' ? A.spieler_a : A.spieler_b; return (A.namen[u] || {}).f || 'aew'; };
const rpVon = (A, s) => (A.rang || {})[s === 'a' ? A.spieler_a : A.spieler_b] || 0;
function zeichne(M){
  const A = M.A, app = L.app(), s = seiten(A);
  if (A.status === 'fertig' || A.status === 'abgebrochen') return ende(M);
  const sp = (w, klasse) => `<div class="ar-sp ${klasse}"><span class="ava" style="background:var(--${farbeVon(A, w)})">${esc(nameVon(A, w)[0].toUpperCase())}</span>
    <div class="ar-sp-info"><b>${klasse === 'du' ? 'Du' : esc(nameVon(A, w))} ${GM.rangBadge(rpVon(A, w), 22)}</b>${GM.hpBar(A['hp_' + w], HP, {id: 'arHp' + klasse})}<span class="ar-sp-status" id="arSt${klasse}"></span></div></div>`;
  app.innerHTML = `<div class="ar" id="ar">
    <div class="kk-leiste"><button class="btn ghost" id="arRaus">${L.ICON.back}<span>Arena</span></button><span class="kk-titel">RUNDE <b id="arRunde">${A.runde}</b> / ${A.runden}</span><span></span></div>
    <div class="ar-kampf">${sp(s.du, 'du')}<div class="ar-vs">VS</div>${sp(s.er, 'er')}</div>
    <div class="ar-timer"><div class="ar-timer-spur"><i id="arBalken"></i></div><span class="mono" id="arZeit"></span></div>
    <div class="panel qbox ar-frage" id="arFrage"></div>
    <p class="ar-hinweis tiny muted">Schnell richtig: ≤ 4 s = 14 Schaden · ≤ 9 s = 11 · danach 8 · falsch = 0</p>
  </div>`;
  $('#arRaus').onclick = () => { if (confirm('Arena verlassen? Das Duell läuft weiter – nicht beantwortete Runden zählen als falsch.')) L.go('#/games/arena'); };
  M.runde = 0; frageZeigen(M);
}
function frageZeigen(M){
  const A = M.A, el = $('#arFrage'); if (!el || A.status !== 'laeuft') return;
  if (M.runde === A.runde) return;
  M.runde = A.runde; M.beantwortet = (A.ich === 'a' ? A.a_fertig : A.b_fertig);
  $('#arRunde') && ($('#arRunde').textContent = A.runde);
  el.innerHTML = `<div class="ar-countdown" id="arCount"></div>` + GM.frageHtml(A.frage_id, {klasse: 'verdeckt'});
  const root = el.querySelector('.gfrage');
  if (M.beantwortet){ root.classList.remove('verdeckt'); root.querySelectorAll('.gopt').forEach(b => b.disabled = true); status(M, 'du', 'Antwort abgegeben'); }
  GM.frageBinden(root, async wahl => {
    const runde = A.runde;
    try {
      const neu = await GM.rpc('arena_antwort', {p_id: M.id, p_runde: runde, p_wahl: wahl});
      GM.serverZeit(neu.jetzt); M.beantwortet = true;
      if (neu.antwort){
        GM.frageAufloesen(root, wahl, neu.antwort.richtig);
        status(M, 'du', neu.antwort.ok ? `Richtig in ${(neu.antwort.ms / 1000).toFixed(1).replace('.', ',')} s → ${neu.antwort.schaden} Schaden` : 'Falsch – kein Schaden', neu.antwort.ok);
      }
      await uebernehmen(M, neu);
    } catch(e){ L.toast(GM.fehlerText(e)); GM.frageFrei(root); }
  });
}
function status(M, wer, text, gut){ const el = $('#arSt' + wer); if (el){ el.textContent = text; el.className = 'ar-sp-status ' + (gut ? 'gut' : gut === false ? 'schlecht' : ''); } }
function tick(M){
  const A = M.A; if (A.status !== 'laeuft' || !A.runde_start) return;
  const t = GM.jetzt(), start = Date.parse(A.runde_start), ende = Date.parse(A.runde_ende);
  const c = $('#arCount'), root = document.querySelector('#arFrage .gfrage'), z = $('#arZeit'), bal = $('#arBalken');
  if (t < start){
    const n = Math.ceil((start - t) / 1000);
    if (c){ c.hidden = false; if (c.dataset.n !== String(n)){ c.dataset.n = n; c.innerHTML = `<span class="pop-in">${n}</span><small>Runde ${A.runde} startet</small>`; window.FX && FX.ton('tick'); } }
    if (root) root.classList.add('verdeckt');
    if (z) z.textContent = ''; if (bal) bal.style.width = '100%';
    return;
  }
  if (c && !c.hidden){ c.hidden = true; if (root){ root.classList.remove('verdeckt'); } }
  const rest = Math.max(0, ende - t), p = rest / (ende - start) * 100;
  if (z) z.textContent = Math.ceil(rest / 1000) + ' s';
  if (bal){ bal.style.width = p + '%'; bal.className = (t - start) <= 4000 ? 'schnell' : (t - start) <= 9000 ? 'mittel' : 'langsam'; }
  if (!rest && root && !M.beantwortet){ root.querySelectorAll('.gopt').forEach(b => b.disabled = true); status(M, 'du', 'Zeit abgelaufen', false); }
  const er = seiten(A).er; if ((er === 'a' ? A.a_fertig : A.b_fertig) && !M.erGemeldet){ M.erGemeldet = A.runde; status(M, 'er', 'hat geantwortet ✓'); }
}
async function uebernehmen(M, neu){
  const alt = M.A; M.A = neu;
  if (neu.status === 'laeuft' && alt.status === 'angefragt') return zeichne(M);
  // Runde aufgelöst: Ergebnis zeigen, Schaden animieren
  if (neu.verlauf.length > M.verlauf){
    M.verlauf = neu.verlauf.length;
    const v = neu.verlauf[neu.verlauf.length - 1], s = seiten(neu);
    const root = document.querySelector('#arFrage .gfrage');
    if (root && !root.querySelector('.right, .miss')) GM.frageAufloesen(root, (v[s.du] || {}).wahl ?? -1, v.richtig, {nurZeigen: true});
    const ich = v[s.du] || {}, er = v[s.er] || {};
    status(M, 'du', ich.ok ? `Richtig · ${ich.schaden} Schaden` : ich.ms == null ? 'Keine Antwort' : 'Falsch', !!ich.ok);
    status(M, 'er', er.ok ? `Richtig · ${er.schaden} Schaden` : er.ms == null ? 'Keine Antwort' : 'Falsch', !!er.ok);
    await warte(500);
    if (ich.schaden){ GM.hpSetzen($('#arHper'), neu['hp_' + s.er]); GM.klang('treffer'); const x = document.querySelector('.ar-sp.er'); x && x.classList.add('getroffen'); }
    if (er.schaden){ setTimeout(() => { GM.hpSetzen($('#arHpdu'), neu['hp_' + s.du]); GM.klang('treffer'); const x = document.querySelector('.ar-sp.du'); x && x.classList.add('getroffen'); }, ich.schaden ? 350 : 0); }
    await warte(neu.status === 'laeuft' ? 1900 : 1600);
    document.querySelectorAll('.ar-sp.getroffen').forEach(x => x.classList.remove('getroffen'));
    M.erGemeldet = 0;
  }
  if (neu.status === 'fertig' || neu.status === 'abgebrochen') return ende(M);
  if (neu.runde !== M.runde){ status(M, 'du', ''); status(M, 'er', ''); frageZeigen(M); }
}
async function ende(M){
  if (M.fertig) return; M.fertig = true;
  const A = M.A, app = L.app(), s = seiten(A);
  if (A.status === 'abgebrochen'){ app.innerHTML = `<div class="panel g-leer"><h3>Duell abgebrochen</h3><p class="muted">Beide waren zu lange weg – dieses Duell wird nicht gewertet.</p><button class="btn primary" data-ziel="#/games/arena">Zur Arena</button></div>`; return GM.zieleBinden(app); }
  const erg = A.ergebnis === 'remis' ? 'remis' : A.ergebnis === s.du ? 'sieg' : 'niederlage';
  const rp = A['rp_' + s.du] || 0, rpNeu = rpVon(A, s.du);
  const richtig = A.verlauf.filter(v => (v[s.du] || {}).ok).length;
  app.innerHTML = `<div class="session">${GM.ergebnisHtml({ergebnis: erg, eyebrow: 'Wissens-Arena',
    sub: `gegen ${esc(nameVon(A, s.er))} · ${Math.max(0, A['hp_' + s.du])} : ${Math.max(0, A['hp_' + s.er])} Lebenspunkte · ${richtig} von ${A.verlauf.length} richtig`,
    extra: `<div class="ar-verlauf">${A.verlauf.map(v => `<span class="${(v[s.du] || {}).ok ? 'ok' : 'bad'}" title="Runde ${v.runde}">${(v[s.du] || {}).ok ? L.ICON.ok : L.ICON.x}</span>`).join('')}</div><div id="arRangNeu"></div>`,
    knoepfe: `<button class="btn primary" id="revanche">${G.ico.schwert}Revanche</button><button class="btn" data-ziel="#/games/arena">Zur Arena</button>`})}</div>`;
  GM.zieleBinden(app); GM.ergebnisAn(app, erg);
  $('#revanche').onclick = async () => { try { const m = await GM.rpc('arena_herausfordern', {p_gegner: s.er === 'a' ? A.spieler_a : A.spieler_b}); L.toast('Revanche angefragt!'); L.go('#/games/arena/' + m.id); } catch(e){ L.toast(GM.fehlerText(e)); } };
  const altRang = GM.rang(rpNeu - rp).id;
  await GM.nachSpiel(`Wissens-Arena gegen ${nameVon(A, s.er)}: ${erg === 'sieg' ? 'gewonnen' : erg === 'remis' ? 'unentschieden' : 'verloren'} (${rp >= 0 ? '+' : ''}${rp} RP)`);
  GM.belohnungEinsetzen(app, 'arena', {rp, rpNeu});
  const k = GM.konto(); const neuRang = k ? GM.rang(k.rang_punkte) : null;
  if (neuRang && neuRang.id !== altRang && rp > 0){ const el = $('#arRangNeu'); if (el) el.innerHTML = `<div class="ar-aufstieg pop-in">${G.rangAbzeichen(neuRang.id, 72)}<b>Aufstieg: ${neuRang.name}!</b></div>`; window.FX && (FX.ton('abz'), FX.konfetti(160)); }
}

GM.MODULE.arena = h => { const t = h.split('/'); return t[3] ? viewMatch(t[3], t[4] === 'annehmen') : viewLobby(); };
})();
