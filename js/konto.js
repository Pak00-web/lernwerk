/* Lernwerk – Konten über Supabase: Anmeldung, Sync des Lernstands, Profil, Rangliste, Datenschutz.
   Ohne Eintrag in js/config.js läuft die Seite wie bisher nur im Browser. */
(function(){
"use strict";
const L = window.LW, C = window.LW_CONFIG || {};
const $ = (s, r=document) => r.querySelector(s);
const FARBEN = ['aew','wbl','its1','its2','dk','accent'];
// Login per Spitzname: intern wird daraus eine Schein-Adresse, es wird nie eine E-Mail verschickt
const adresse = n => n.trim().toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9._-]/g, '_') + '@' + (C.loginDomain || 'lernwerk.example');

let sb = null, ich = null, profil = null, klasseName = '';
window.LW_ROUTEN = {'#/konto': viewKonto, '#/datenschutz': viewDatenschutz, '#/rangliste': viewRangliste};

/* ---------- Kopfzeile ---------- */
function kontoChip(){
  const slot = $('#kontoSlot'); if (!slot) return;
  if (!sb){ slot.innerHTML = ''; return; }
  slot.innerHTML = profil
    ? `<button class="chip konto" id="kontoBtn" title="Dein Konto"><span class="ava" style="background:var(--${profil.farbe})">${L.esc(profil.spitzname[0].toUpperCase())}</span>${L.esc(profil.spitzname)}</button>`
    : `<button class="btn primary klein" id="kontoBtn">Anmelden</button>`;
  $('#kontoBtn').onclick = () => L.go('#/konto');
}

/* ---------- Sync ---------- */
let timer = null, laeuftSync = false, offen = false;
window.LW_SYNC = {
  angemeldet: () => !!profil,
  geaendert(){ if (!profil) return; offen = true; clearTimeout(timer); timer = setTimeout(hochladen, 2000); },
  sb: () => sb, ich: () => ich, profil: () => profil,
  async rangliste(){ if (!profil) return null; const {data} = await sb.rpc('rangliste'); return data || []; },
};
async function hochladen(){
  if (!profil || laeuftSync || !offen) return;
  laeuftSync = true; offen = false;
  const S = L.stand(), tag = L.dayKey();
  try {
    const r = await Promise.all([
      sb.from('lernstand').upsert({user_id: ich.id, data: S, updated_at: new Date(S.updated).toISOString()}),
      sb.from('tages_xp').upsert({user_id: ich.id, tag, xp: (S.xpTag||{})[tag] || 0}),
      sb.from('profile').update({xp: S.xp, level: L.level().n, abzeichen: Object.keys(S.abz||{}).length}).eq('id', ich.id),
    ]);
    if (r.some(x => x.error)) throw r.find(x => x.error).error;
  } catch(e){ offen = true; }
  laeuftSync = false;
  if (offen) timer = setTimeout(hochladen, 10000);
}
window.addEventListener('online', () => { if (offen) hochladen(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && offen){ clearTimeout(timer); hochladen(); } });

async function standLaden(){
  const {data, error} = await sb.from('lernstand').select('data, updated_at').eq('user_id', ich.id).maybeSingle();
  if (error) return;
  const lokal = L.stand();
  if (data && (data.data.updated||0) > (lokal.updated||0)) L.uebernehmen(data.data);
  else if (lokal.updated){ offen = true; hochladen(); }
}

/* ---------- Anmeldung ---------- */
async function start(){
  if (!C.supabaseUrl || !C.supabaseKey || !window.supabase){ kontoChip(); return; }
  sb = window.supabase.createClient(C.supabaseUrl, C.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true}});
  const {data} = await sb.auth.getSession();
  await sitzung(data.session);
  sb.auth.onAuthStateChange((ev, s) => { if (ev === 'SIGNED_OUT') sitzung(null); });
  // Erster Besuch ohne Konto: einmal die Anmeldeseite zeigen
  let gesehen = false; try { gesehen = localStorage.getItem('lernwerk.kontoGesehen') === '1'; } catch(e){}
  if (!profil && !gesehen && (location.hash || '#/') === '#/') L.go('#/konto');
}
async function sitzung(s){
  ich = s ? s.user : null; profil = null; klasseName = '';
  if (ich){
    const {data} = await sb.from('profile').select('*').eq('id', ich.id).maybeSingle();
    profil = data || null;
    if (profil){ const k = await sb.rpc('klasse_name'); klasseName = k.data || ''; await standLaden(); }
  }
  kontoChip(); L.neuZeichnen();
  document.dispatchEvent(new CustomEvent('lw-konto', {detail: {profil}}));
}

async function registrieren(f){
  const name = f.spitzname.value.trim(), pw = f.passwort.value, code = f.code.value.trim(), farbe = f.querySelector('[name=farbe]:checked')?.value || 'aew';
  if (!/^[A-Za-z0-9ÄÖÜäöüß._-]{3,20}$/.test(name)) throw new Error('Spitzname: 3–20 Zeichen, nur Buchstaben, Zahlen, . _ -');
  if (pw.length < 8) throw new Error('Das Passwort braucht mindestens 8 Zeichen.');
  if (!f.ds.checked) throw new Error('Bitte die Datenschutzhinweise bestätigen.');
  const r = await sb.auth.signUp({email: adresse(name), password: pw});
  if (r.error) throw new Error(/registered|exists/i.test(r.error.message) ? 'Diesen Spitznamen gibt es schon.' : r.error.message);
  if (!r.data.session) throw new Error('Registrierung braucht eine Bestätigung – bitte beim Seitenbetreiber melden.');
  const b = await sb.rpc('klasse_beitreten', {p_code: code, p_spitzname: name, p_farbe: farbe});
  if (b.error){ await sb.rpc('konto_loeschen'); await sb.auth.signOut(); throw new Error(/Klassencode/.test(b.error.message) ? 'Der Klassencode stimmt nicht.' : /duplicate|unique/i.test(b.error.message) ? 'Diesen Spitznamen gibt es schon.' : b.error.message); }
  await sitzung(r.data.session);
}
async function anmelden(f){
  const r = await sb.auth.signInWithPassword({email: adresse(f.spitzname.value), password: f.passwort.value});
  if (r.error) throw new Error(/invalid/i.test(r.error.message) ? 'Spitzname oder Passwort falsch.' : r.error.message);
  await sitzung(r.data.session);
  if (!profil) throw new Error('Zu diesem Konto gibt es kein Profil.');
}

/* ---------- Ansichten ---------- */
function viewKonto(){
  const app = L.app();
  try { localStorage.setItem('lernwerk.kontoGesehen', '1'); } catch(e){}
  if (!sb){ app.innerHTML = `<div class="konto-box panel"><h2>Konten sind noch nicht eingerichtet</h2><p class="muted">Dein Fortschritt wird in diesem Browser gespeichert.</p><button class="btn primary" id="weiter">Zur Übersicht</button></div>`; $('#weiter').onclick = () => L.go('#/'); return; }
  if (profil) return viewProfil();
  let modus = 'neu';
  const zeichne = () => {
    app.innerHTML = `<div class="konto-box panel pop-in">
      <div class="brand-mark gross"><svg viewBox="0 0 24 24" fill="none" stroke="#FFE066" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18V6l8 6 8-6v12"/></svg></div>
      <h1>${modus==='neu' ? 'Willkommen im Lernwerk' : 'Schön, dass du wieder da bist'}</h1>
      <p class="muted">${modus==='neu' ? 'Mit Konto wird dein Lernstand auf allen Geräten gespeichert – und du kannst in der Rangliste und im Quizduell gegen deine Klasse antreten.' : 'Melde dich mit Spitzname und Passwort an.'}</p>
      <div class="seg tabs"><button aria-pressed="${modus==='neu'}" data-m="neu">Neues Konto</button><button aria-pressed="${modus==='login'}" data-m="login">Anmelden</button></div>
      <form id="kf" class="kform" autocomplete="on">
        <label>Spitzname<input class="inp" name="spitzname" required minlength="3" maxlength="20" autocomplete="username" placeholder="z. B. ByteBoss"></label>
        <label>Passwort<input class="inp" name="passwort" type="password" required minlength="8" autocomplete="${modus==='neu'?'new-password':'current-password'}" placeholder="mindestens 8 Zeichen"></label>
        ${modus==='neu' ? `
        <label>Klassencode<input class="inp" name="code" required placeholder="bekommst du von ${L.esc(C.betreiberKurz || 'der Klasse')}"></label>
        <fieldset><legend>Deine Farbe</legend><div class="farbwahl">${FARBEN.map((f,i)=>`<label><input type="radio" name="farbe" value="${f}" ${i===0?'checked':''}><span style="background:var(--${f})"></span></label>`).join('')}</div></fieldset>
        <label class="check"><input type="checkbox" name="ds"><span>Ich habe die <a href="#/datenschutz">Datenschutzhinweise</a> gelesen.</span></label>
        <p class="tiny muted">Bitte keinen echten Namen als Spitznamen – deine Klasse sieht ihn in der Rangliste. Passwort vergessen? ${L.esc(C.betreiberKurz || 'Der Betreiber')} kann es zurücksetzen.</p>` : ''}
        <div id="kfehler" class="feedback bad" hidden></div>
        <button class="btn primary" type="submit">${modus==='neu' ? 'Konto anlegen' : 'Anmelden'}</button>
      </form>
      <button class="btn ghost" id="ohne">Ohne Konto weiter (nur dieser Browser)</button>
    </div>`;
    app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { modus = b.dataset.m; zeichne(); });
    $('#ohne').onclick = () => L.go('#/');
    $('#kf').onsubmit = async ev => {
      ev.preventDefault(); const f = ev.target, btn = f.querySelector('[type=submit]'), fe = $('#kfehler');
      btn.disabled = true; fe.hidden = true;
      try { if (modus==='neu') await registrieren(f); else await anmelden(f);
        window.FX && FX.ton('level'); window.FX && FX.konfetti(120); L.toast(modus==='neu' ? 'Konto angelegt – viel Spaß!' : 'Angemeldet'); L.go('#/'); }
      catch(e){ fe.innerHTML = L.ICON.x + L.esc(e.message || 'Das hat nicht geklappt.'); fe.hidden = false; window.FX && FX.wackeln(f); btn.disabled = false; }
    };
  };
  zeichne();
}
function viewProfil(){
  const app = L.app(), S = L.stand();
  app.innerHTML = `<button class="btn ghost back" id="bk">${L.ICON.back}Übersicht</button>
  <div class="profil-kopf"><span class="ava gross" style="background:var(--${profil.farbe})">${L.esc(profil.spitzname[0].toUpperCase())}</span>
    <div><div class="eyebrow">${L.esc(klasseName)}</div><h1>${L.esc(profil.spitzname)}</h1><p class="muted">Level ${L.level().n} · ${S.xp} XP · ${Object.keys(S.abz||{}).length} Abzeichen</p></div></div>
  <div class="panel setup" style="margin-top:18px">
    <div><div class="eyebrow" style="margin-bottom:8px">Farbe</div><div class="farbwahl">${FARBEN.map(f=>`<label><input type="radio" name="farbe" value="${f}" ${f===profil.farbe?'checked':''}><span style="background:var(--${f})"></span></label>`).join('')}</div></div>
    <div class="row"><button class="btn" id="rang">${L.ICON.trophy}Rangliste</button><button class="btn" id="aus">Abmelden</button><a class="btn ghost" href="#/datenschutz">Datenschutz</a></div>
  </div>
  <div class="panel setup gefahr" style="margin-top:14px"><div><h3>Konto löschen</h3><p class="small muted">Löscht dein Konto, deinen Lernstand und deine Duelle endgültig. Der Fortschritt in diesem Browser bleibt erhalten.</p></div><button class="btn no" id="del">Konto endgültig löschen</button></div>`;
  $('#bk').onclick = () => L.go('#/');
  $('#rang').onclick = () => L.go('#/rangliste');
  app.querySelectorAll('[name=farbe]').forEach(r => r.onchange = async () => { const {error} = await sb.from('profile').update({farbe: r.value}).eq('id', ich.id); if (!error){ profil.farbe = r.value; kontoChip(); viewProfil(); } });
  $('#aus').onclick = async () => { await hochladen(); await sb.auth.signOut(); L.toast('Abgemeldet'); L.go('#/'); };
  $('#del').onclick = async () => {
    if (prompt('Zum Bestätigen deinen Spitznamen eingeben:') !== profil.spitzname) return;
    const {error} = await sb.rpc('konto_loeschen'); if (error){ L.toast('Löschen fehlgeschlagen'); return; }
    await sb.auth.signOut(); L.toast('Konto gelöscht'); L.go('#/');
  };
}
async function viewRangliste(){
  const app = L.app();
  if (!profil){ app.innerHTML = `<div class="konto-box panel"><h2>Rangliste</h2><p class="muted">Die Rangliste gibt es nur mit Konto.</p><button class="btn primary" id="k">Anmelden</button></div>`; $('#k').onclick = () => L.go('#/konto'); return; }
  let art = 'woche';
  app.innerHTML = `<button class="btn ghost back" id="bk">${L.ICON.back}Übersicht</button><div style="margin-top:12px"><div class="eyebrow">${L.esc(klasseName)}</div><h1>Rangliste</h1></div>
    <div class="seg" style="margin-top:14px"><button aria-pressed="true" data-a="woche">Diese Woche</button><button aria-pressed="false" data-a="gesamt">Gesamt</button></div><div id="rl" class="rliste"><p class="muted">Lädt …</p></div>`;
  $('#bk').onclick = () => L.go('#/');
  await hochladen();
  const {data, error} = await sb.rpc('rangliste');
  const zeichne = () => {
    if (error){ $('#rl').innerHTML = '<p class="muted">Rangliste konnte nicht geladen werden.</p>'; return; }
    const liste = (data||[]).slice().sort((a,b)=>b[art]-a[art] || a.spitzname.localeCompare(b.spitzname));
    const max = Math.max(1, ...liste.map(x=>x[art]));
    $('#rl').innerHTML = liste.map((x,i)=>`<div class="panel rrow ${x.id===ich.id?'du':''}" style="--k:${i}">
      <span class="platz p${i+1}">${i<3&&window.GFX?GFX.platz(i+1):i+1}</span><span class="ava" style="background:var(--${x.farbe})">${L.esc(x.spitzname[0].toUpperCase())}</span>
      <div class="rname"><b>${L.esc(x.spitzname)}${x.id===ich.id?' <span class="tag">du</span>':''}</b><div class="bar"><i style="width:${Math.round(x[art]/max*100)}%;background:var(--${x.farbe})"></i></div><span class="tiny muted">Level ${x.level} · ${x.abzeichen} Abzeichen</span></div>
      <span class="rxp mono">${x[art]} XP</span></div>`).join('') || '<p class="muted">Noch niemand in der Klasse.</p>';
  };
  app.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { art = b.dataset.a; app.querySelectorAll('[data-a]').forEach(x=>x.setAttribute('aria-pressed', x===b)); zeichne(); });
  zeichne();
}
function viewDatenschutz(){
  const app = L.app();
  app.innerHTML = `<button class="btn ghost back" id="bk">${L.ICON.back}Zurück</button>
  <article class="panel text-seite">
    <h1>Datenschutzhinweise</h1>
    <p class="muted">Stand: ${C.datenschutzStand || '2026'}</p>
    <h2>Wer ist verantwortlich?</h2>
    <p>${L.esc(C.betreiber || 'Der Betreiber dieser Seite')} betreibt das Lernwerk privat und nicht kommerziell für die eigene Berufsschulklasse. Kontakt: ${L.esc(C.kontakt || 'persönlich in der Klasse')}.</p>
    <h2>Welche Daten werden gespeichert?</h2>
    <ul>
      <li><b>Ohne Konto:</b> nichts auf einem Server. Dein Lernstand liegt nur im Speicher deines Browsers (localStorage).</li>
      <li><b>Mit Konto:</b> dein <b>Spitzname</b>, dein <b>Passwort</b> (nur verschlüsselt als Hash), deine <b>Farbe</b>, dein <b>Lernstand</b> (welche Fragen du wie gut kannst, XP, Abzeichen, Probe-Klausuren), deine <b>XP pro Tag</b> und deine <b>Quizduelle</b>.</li>
      <li>Es wird <b>keine E-Mail-Adresse</b> und kein echter Name abgefragt.</li>
    </ul>
    <h2>Wer sieht was?</h2>
    <p>Deine Klasse sieht deinen Spitznamen, deine Farbe, dein Level, die Zahl deiner Abzeichen und deine XP in der Rangliste. Deinen genauen Lernstand sieht niemand außer dir. Duelle sehen nur die beiden Beteiligten.</p>
    <h2>Wo liegen die Daten?</h2>
    <p>Die Konten liegen bei <b>Supabase</b> auf einem Server in der EU (Frankfurt). Die Seite selbst wird über <b>GitHub Pages</b> ausgeliefert; dabei verarbeitet GitHub technisch deine IP-Adresse. Schriften werden von Google Fonts geladen.</p>
    <h2>Zweck und Rechtsgrundlage</h2>
    <p>Die Daten dienen nur dazu, dass du auf allen Geräten weiterlernen und mit deiner Klasse spielen kannst (Art. 6 Abs. 1 lit. a und b DSGVO – deine Einwilligung und die Bereitstellung des Kontos).</p>
    <h2>Deine Rechte</h2>
    <p>Du kannst dein Konto jederzeit unter <b>Konto → Konto endgültig löschen</b> selbst löschen – dann sind alle Daten auf dem Server sofort weg. Auskunft, Berichtigung und Fragen: direkt an den Betreiber. Du hast außerdem das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (in NRW: LDI NRW).</p>
    <h2>Cookies und Tracking</h2>
    <p>Es gibt kein Tracking und keine Werbung. Für die Anmeldung wird ein Sitzungsschlüssel im Browserspeicher abgelegt.</p>
  </article>`;
  $('#bk').onclick = () => history.length > 1 ? history.back() : L.go('#/');
}

/* ---------- Supabase laden und starten ---------- */
if (C.supabaseUrl && C.supabaseKey){
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
  s.onload = start; s.onerror = () => { kontoChip(); };
  document.head.appendChild(s);
} else kontoChip();
})();
