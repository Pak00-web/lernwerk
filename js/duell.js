/* Lernwerk – Quizduell: abwechselnd, 3 Runden à 3 Fragen, wer dran ist, wählt das Fach.
   Ablauf: A wählt Runde 1 und spielt · B spielt Runde 1, wählt Runde 2, spielt · A spielt Runde 2, wählt Runde 3, spielt · B spielt Runde 3 → fertig. */
(function(){
"use strict";
const L = window.LW, $ = (s, r=document) => r.querySelector(s);
const RUNDEN = 3, FRAGEN = 3, SIEG_XP = 50, SPIEL_XP = 15;
let duelle = [], namen = {}, kanal = null;

const sync = () => window.LW_SYNC;
const sb = () => sync() && sync().sb();
const ich = () => sync() && sync().ich() && sync().ich().id;
const binA = d => d.spieler_a === ich();
const gegner = d => binA(d) ? d.spieler_b : d.spieler_a;
const meine = (d, r) => binA(d) ? r.a : r.b;
const seine = (d, r) => binA(d) ? r.b : r.a;
const summe = arr => (arr||[]).filter(Boolean).length;

window.LW_DUELL = { offen: () => duelle.filter(d => d.status==='laeuft' && d.am_zug===ich()).length };
L.ICON && Object.assign(window.LW_ROUTEN || (window.LW_ROUTEN = {}), {'#/duell': viewListe});

/* ---------- Daten ---------- */
async function laden(){
  if (!sync() || !sync().angemeldet()){ duelle = []; return; }
  const {data} = await sb().from('duelle').select('*').order('geaendert', {ascending:false}).limit(40);
  duelle = data || [];
  const ids = [...new Set(duelle.flatMap(d => [d.spieler_a, d.spieler_b]))].filter(id => !namen[id]);
  if (ids.length){ const {data: p} = await sb().from('profile').select('id, spitzname, farbe').in('id', ids); (p||[]).forEach(x => namen[x.id] = x); }
  gewinneVerbuchen();
}
function abonnieren(){
  if (kanal || !sb()) return;
  kanal = sb().channel('duelle').on('postgres_changes', {event:'*', schema:'public', table:'duelle'}, async () => {
    const vorher = window.LW_DUELL.offen(); await laden();
    if (window.LW_DUELL.offen() > vorher){ L.toast('Du bist im Quizduell dran!'); window.FX && FX.ton('combo'); }
    const h = location.hash || '#/'; if (h === '#/' || h === '#/duell') L.neuZeichnen();
  }).subscribe();
}
// Sieg einmalig im eigenen Lernstand verbuchen (auch wenn der Gegner die letzte Runde gespielt hat)
function gewinneVerbuchen(){
  const S = L.stand(); S.duelleVerbucht = S.duelleVerbucht || [];
  for (const d of duelle){
    if (d.status !== 'fertig' || S.duelleVerbucht.includes(d.id)) continue;
    S.duelleVerbucht.push(d.id); if (S.duelleVerbucht.length > 200) S.duelleVerbucht.shift();
    const [ich_, er] = binA(d) ? [d.punkte_a, d.punkte_b] : [d.punkte_b, d.punkte_a];
    const wer = name(gegner(d));
    if (ich_ > er){ S.stat.duelleGewonnen = (S.stat.duelleGewonnen||0) + 1; L.logEintrag('duell', `Quiz-Duell gegen ${wer} gewonnen (${ich_}:${er})`); L.addXP(SIEG_XP); }
    else L.logEintrag('verloren', `Quiz-Duell gegen ${wer}: ${ich_}:${er}`);
  }
}
document.addEventListener('lw-konto', async e => {
  if (e.detail.profil){ await laden(); abonnieren(); L.neuZeichnen(); }
  else { duelle = []; if (kanal){ sb() && sb().removeChannel(kanal); kanal = null; } }
});

/* ---------- Fragen ---------- */
function fragenFuer(fach){
  const pool = L.shuffle(L.D.einheiten.filter(e => e.typ==='M' && (L.themaOf(e.thema)||{}).fach === fach));
  const gens = L.rechenIn({fach});
  const out = [];
  for (let i=0; i<FRAGEN; i++){
    if (gens.length && (i===FRAGEN-1 || !pool.length) && Math.random() < .6) out.push({t:'R', key: gens[Math.floor(Math.random()*gens.length)], seed: Math.floor(Math.random()*2**31)});
    else if (pool.length) out.push({t:'M', id: pool.pop().id});
  }
  return out;
}
const zuItems = fragen => fragen.map(f => f.t==='R' ? {kind:'R', r: L.aufgabe(f.key, f.seed)} : {kind:'M', e: L.D.einheiten.find(e => e.id===f.id)}).filter(x => x.r || x.e);

/* ---------- Zug spielen ---------- */
// Jede Antwort wird sofort gespeichert – abbrechen und neu starten bringt keine neuen Fragen.
// Ändern darf den Datensatz nur, wer am Zug ist (Regel in der Datenbank).
const komplett = (arr, r) => !!arr && arr.length >= r.fragen.length;
// Neue Runde wählen darf man einmal pro Zug: wenn die letzte Runde vom Gegner stammt (oder noch keine existiert)
const darfWaehlen = d => d.runden.length < RUNDEN && (!d.runden.length || d.runden[d.runden.length-1].von !== ich());
function naechsterSchritt(d){
  const offen = d.runden.findIndex(r => !komplett(meine(d, r), r));
  if (offen >= 0) return {art:'spielen', runde: offen};
  if (darfWaehlen(d)) return {art:'waehlen'};
  return {art:'speichern'};
}
async function zug(id){
  const {data: d, error} = await sb().from('duelle').select('*').eq('id', id).single();
  if (error || !d){ L.toast('Duell nicht gefunden'); return viewListe(); }
  if (d.status !== 'laeuft' || d.am_zug !== ich()){ L.toast(d.status === 'laeuft' ? 'Du bist gerade nicht dran – warte auf deinen Gegner.' : 'Dieses Duell ist schon beendet.'); return viewListe(); }
  weiter(d);
}
function weiter(d){
  const s = naechsterSchritt(d);
  if (s.art === 'spielen') return runde(d, s.runde);
  if (s.art === 'waehlen') return fachWaehlen(d);
  return speichern(d);
}
async function schreiben(d, felder){
  const upd = Object.assign({runden: d.runden, geaendert: new Date().toISOString()}, felder);
  if (d.id) return sb().from('duelle').update(upd).eq('id', d.id).select().single();
  const res = await sb().from('duelle').insert(Object.assign({spieler_a: d.spieler_a, spieler_b: d.spieler_b, klasse_id: d.klasse_id, am_zug: ich(), status: 'laeuft'}, upd)).select().single();
  if (!res.error) d.id = res.data.id;
  return res;
}
function fachWaehlen(d){
  const app = L.app(); const fs = L.D.faecher.filter(f => !f.bald);
  const angebot = L.shuffle(fs).slice(0, 3);
  app.innerHTML = `<div class="session"><button class="btn ghost back" id="bk">${L.ICON.back}Duelle</button>
    <div class="duell-kopf">${vs(d)}</div>
    <div class="eyebrow" style="margin-top:18px">Runde ${d.runden.length+1} von ${RUNDEN}</div><h2>Wähle ein Fach</h2>
    <div class="fachwahl">${angebot.map((f,k)=>`<button class="mode fwahl" data-f="${f.id}" style="--sc:var(--${f.farbe});--k:${k}"><h3 style="color:var(--${f.farbe})">${f.name}</h3><p class="small muted">${L.esc(f.lang)}</p></button>`).join('')}</div></div>`;
  $('#bk').onclick = () => L.go('#/duell');
  app.querySelectorAll('[data-f]').forEach(b => b.onclick = async () => {
    app.querySelectorAll('[data-f]').forEach(x => x.disabled = true);
    d.runden.push({fach: b.dataset.f, von: ich(), fragen: fragenFuer(b.dataset.f), a: null, b: null});
    const res = await schreiben(d, {});   // Runde sofort festschreiben
    if (res.error){ d.runden.pop(); L.toast('Speichern fehlgeschlagen – bitte nochmal versuchen'); app.querySelectorAll('[data-f]').forEach(x => x.disabled = false); return; }
    runde(d, d.runden.length-1);
  });
}
function runde(d, idx){
  const r = d.runden[idx], alle = zuItems(r.fragen);
  const feld = binA(d) ? 'a' : 'b';
  r[feld] = r[feld] || [];
  const start = r[feld].length;             // nach Abbruch an der nächsten offenen Frage weiter
  const f = L.fachOf(r.fach);
  L.spielen(alle.slice(start), `Duell · Runde ${idx+1} · ${f ? f.name : ''}`, (i, ok) => {
    r[feld][start + i] = !!ok;
    schreiben(d, {}).then(res => { if (res.error) L.toast('Antwort konnte nicht gespeichert werden'); });
  }, () => rundenErgebnis(d, idx));
}
function rundenErgebnis(d, idx){
  const nachher = naechsterSchritt(d);
  const r = d.runden[idx], app = L.app();
  const zwischenstand = punkte(d);
  const er = seine(d, r);
  app.innerHTML = `<div class="session"><div class="panel end pop">
    <div class="eyebrow">Runde ${idx+1} geschafft</div>
    <div class="punkte-reihe">${meine(d, r).map(ok => `<i class="${ok?'ok':'bad'}">${ok?L.ICON.ok:L.ICON.x}</i>`).join('')}</div>
    <p class="muted">${summe(meine(d, r))} von ${r.fragen.length} richtig${komplett(er, r) ? ` · ${L.esc(name(gegner(d)))}: ${summe(er)}` : ''}</p>
    <div class="big mono">${zwischenstand.ich} : ${zwischenstand.er}</div>
    <div class="row" style="justify-content:center"><button class="btn primary" id="w">${nachher.art==='waehlen' ? 'Nächste Runde wählen' : nachher.art==='spielen' ? 'Weiter' : 'Zug beenden'}</button></div>
  </div></div>`;
  if (summe(meine(d, r)) === r.fragen.length){ window.FX && FX.konfetti(120); }
  $('#w').onclick = () => { $('#w').disabled = true; weiter(d); };
}
function punkte(d){ let a = 0, b = 0; d.runden.forEach(r => { a += summe(r.a); b += summe(r.b); }); return binA(d) ? {ich:a, er:b} : {ich:b, er:a}; }
async function speichern(d){
  const {ich: p1, er: p2} = punkte(d);
  const fertig = d.runden.length === RUNDEN && d.runden.every(r => komplett(r.a, r) && komplett(r.b, r));
  const res = await schreiben(d, {punkte_a: binA(d) ? p1 : p2, punkte_b: binA(d) ? p2 : p1, am_zug: fertig ? null : gegner(d), status: fertig ? 'fertig' : 'laeuft'});
  if (res.error){ L.toast('Speichern fehlgeschlagen – bitte nochmal versuchen'); const w=$('#w'); if (w) w.disabled = false; return; }
  L.addXP(SPIEL_XP);
  await laden();
  abschliessen(res.data);
}
function abschliessen(d){
  const app = L.app(), p = punkte(d);
  const fertig = d.status === 'fertig';
  const sieg = p.ich > p.er, remis = p.ich === p.er;
  app.innerHTML = `<div class="session"><div class="panel end pop">
    <div class="duell-kopf">${vs(d)}</div>
    <div class="big mono">${p.ich} : ${p.er}</div>
    <h2>${!fertig ? `${L.esc(name(gegner(d)))} ist jetzt dran` : sieg ? 'Gewonnen!' : remis ? 'Unentschieden' : 'Knapp verloren'}</h2>
    <p class="muted">${!fertig ? 'Du bekommst eine Nachricht auf der Startseite, sobald du wieder dran bist.' : sieg ? `+${SIEG_XP} XP für den Sieg` : 'Revanche?'}</p>
    ${rundenTabelle(d)}
    <div class="row" style="justify-content:center"><button class="btn primary" id="l">Zu den Duellen</button>${fertig ? '<button class="btn" id="rev">'+L.ICON.swords+'Revanche</button>' : ''}</div>
  </div></div>`;
  if (fertig && sieg){ window.FX && (FX.ton('level'), FX.konfetti(200)); }
  $('#l').onclick = () => L.go('#/duell');
  const rv = $('#rev'); if (rv) rv.onclick = () => neuesDuell(gegner(d));
}

/* ---------- Ansichten ---------- */
const name = id => (namen[id] && namen[id].spitzname) || 'Unbekannt';
const ava = id => `<span class="ava" style="background:var(--${(namen[id]||{}).farbe||'ink-3'})">${L.esc(name(id)[0].toUpperCase())}</span>`;
function vs(d){ const p = punkte(d); return `<div class="vs"><div>${ava(ich())}<b>Du</b></div><span class="mono">${p.ich} : ${p.er}</span><div>${ava(gegner(d))}<b>${L.esc(name(gegner(d)))}</b></div></div>`; }
function rundenTabelle(d){
  return `<div class="rtab">${Array.from({length:RUNDEN}, (_, i) => { const r = d.runden[i]; const f = r && L.fachOf(r.fach);
    const zeile = arr => Array.from({length:FRAGEN}, (_, k) => !arr || arr[k] === undefined ? '<i></i>' : `<i class="${arr[k]?'ok':'bad'}"></i>`).join('');
    return `<div class="rt"><span class="rt-p">${zeile(r && meine(d, r))}</span><span class="rt-f" style="color:var(--${f?f.farbe:'ink-3'})">${f ? f.name : 'Runde '+(i+1)}</span><span class="rt-p">${zeile(r && komplett(seine(d, r), r) && (komplett(meine(d, r), r) || d.status==='fertig') ? seine(d, r) : null)}</span></div>`; }).join('')}</div>`;
}
async function viewListe(){
  const app = L.app();
  if (!sync() || !sync().angemeldet()){ app.innerHTML = `<div class="konto-box panel"><h2>Quizduell</h2><p class="muted">Für Duelle brauchst du ein Konto.</p><button class="btn primary" id="k">Anmelden</button></div>`; $('#k').onclick = () => L.go('#/konto'); return; }
  app.innerHTML = `<p class="muted" style="margin-top:30px">Lädt …</p>`;
  await laden();
  const dran = duelle.filter(d => d.status==='laeuft' && d.am_zug===ich());
  const warten = duelle.filter(d => d.status==='laeuft' && d.am_zug!==ich());
  const fertig = duelle.filter(d => d.status!=='laeuft').slice(0, 10);
  const karte = d => { const p = punkte(d); const st = d.status==='abgelehnt' ? 'abgelehnt' : d.status==='fertig' ? (p.ich>p.er?'gewonnen':p.ich<p.er?'verloren':'unentschieden') : `Runde ${Math.max(1,d.runden.length)} von ${RUNDEN}`;
    return `<div class="panel drow ${d.status==='fertig'?(p.ich>p.er?'sieg':p.ich<p.er?'niederlage':''):''}">${ava(gegner(d))}<div><b>${L.esc(name(gegner(d)))}</b><div class="small muted">${st}</div></div><span class="mono">${p.ich} : ${p.er}</span>
      ${d.status==='laeuft' && d.am_zug===ich() ? `<div class="row"><button class="btn primary" data-spiel="${d.id}">Spielen</button>${!d.runden.some(r=>r.b) && !binA(d) ? `<button class="btn ghost" data-ab="${d.id}">Ablehnen</button>` : ''}</div>` : d.status==='fertig' ? `<button class="btn" data-rev="${gegner(d)}">Revanche</button>` : ''}</div>`; };
  app.innerHTML = `<button class="btn ghost back" id="bk">${L.ICON.back}Übersicht</button>
  <div class="section-head" style="margin-top:12px"><div><div class="eyebrow">Gegen deine Klasse</div><h1>Quizduell</h1><p class="muted small" style="margin-top:6px;max-width:520px">So läuft es: 3 Runden mit je 3 Fragen. Du spielst die Runde deines Gegners nach und wählst dann die nächste – danach ist er dran.</p></div><button class="btn primary" id="neu">${L.ICON.swords}Neues Duell</button></div>
  ${dran.length ? `<section class="section"><div class="section-head"><h2>Du bist dran</h2></div><div class="stack">${dran.map(karte).join('')}</div></section>` : ''}
  ${warten.length ? `<section class="section"><div class="section-head"><h2>Warten auf Gegner</h2></div><div class="stack">${warten.map(karte).join('')}</div></section>` : ''}
  ${fertig.length ? `<section class="section"><div class="section-head"><h2>Beendet</h2></div><div class="stack">${fertig.map(karte).join('')}</div></section>` : ''}
  ${!duelle.length ? '<p class="muted" style="margin-top:24px">Noch keine Duelle. Fordere jemanden heraus!</p>' : ''}
  <section class="section"><div class="section-head"><h2>Duell-Rangliste</h2><button class="btn ghost" id="alleRang">${L.ICON.trophy}Ganze Rangliste</button></div><div class="rliste" id="duellRang"><p class="muted">Lädt …</p></div></section>`;
  $('#bk').onclick = () => L.go('#/');
  $('#neu').onclick = () => gegnerWaehlen();
  $('#alleRang').onclick = () => { sessionStorage.setItem('lernwerk.rangTab', 'duell'); L.go('#/rangliste'); };
  sync().duellRangliste().then(r => { const el = $('#duellRang'); if (el) el.innerHTML = sync().duellListe(r, ich(), 5); });
  app.querySelectorAll('[data-spiel]').forEach(b => b.onclick = () => { b.disabled = true; zug(b.dataset.spiel); });
  app.querySelectorAll('[data-rev]').forEach(b => b.onclick = () => neuesDuell(b.dataset.rev));
  app.querySelectorAll('[data-ab]').forEach(b => b.onclick = async () => { if (!confirm('Duell ablehnen?')) return; await sb().from('duelle').update({status:'abgelehnt', am_zug:null}).eq('id', b.dataset.ab); viewListe(); });
}
async function gegnerWaehlen(){
  const app = L.app();
  const {data} = await sb().rpc('rangliste');
  const liste = (data||[]).filter(x => x.id !== ich()).sort((a,b) => a.spitzname.localeCompare(b.spitzname));
  app.innerHTML = `<button class="btn ghost back" id="bk">${L.ICON.back}Duelle</button><div style="margin-top:12px"><div class="eyebrow">Neues Duell</div><h1>Wen forderst du heraus?</h1></div>
    <input class="inp" id="such" placeholder="Spitzname suchen" style="margin-top:16px">
    <div class="stack" id="gl" style="margin-top:14px"></div>`;
  namen = Object.assign(namen, Object.fromEntries(liste.map(x => [x.id, x])));
  const zeichne = q => { $('#gl').innerHTML = liste.filter(x => x.spitzname.toLowerCase().includes(q.toLowerCase())).map(x => `<button class="panel drow wahl" data-g="${x.id}">${ava(x.id)}<div><b>${L.esc(x.spitzname)}</b><div class="small muted">Level ${x.level}</div></div>${L.ICON.swords}</button>`).join('') || '<p class="muted">Noch niemand sonst in deiner Klasse.</p>';
    app.querySelectorAll('[data-g]').forEach(b => b.onclick = () => neuesDuell(b.dataset.g)); };
  $('#such').oninput = e => zeichne(e.target.value); zeichne('');
  $('#bk').onclick = () => L.go('#/duell');
}
function neuesDuell(gegnerId){
  const p = sync().profil();
  if (!namen[ich()]) namen[ich()] = p;
  fachWaehlen({id:null, spieler_a: ich(), spieler_b: gegnerId, klasse_id: p.klasse_id, runden: [], status:'laeuft', am_zug: ich()});
}
})();
