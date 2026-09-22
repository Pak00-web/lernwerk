/* Lernwerk – Spielgefühl: Konfetti, Wackeln, Töne, Abzeichen */
(function(){
"use strict";
const ruhig = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Konfetti (mehrere Stöße gleichzeitig möglich) ---------- */
const FARBEN = ['#2B50D8','#FFE066','#0E8A7B','#DB5A2B','#5A55D6','#17935A'];
let teile = [], laeuft = false, cv = null, cx = null;
function konfetti(n=120, x, y, weit=1){
  if (ruhig()) return;
  cv = cv || document.getElementById('confetti'); if (!cv) return;
  cv.hidden = false; cx = cx || cv.getContext('2d');
  if (cv.width !== innerWidth || cv.height !== innerHeight){ cv.width = innerWidth; cv.height = innerHeight; }
  x = x ?? innerWidth/2; y = y ?? innerHeight*.35;
  for (let i=0;i<n;i++) teile.push({x:x+(Math.random()-.5)*40*weit, y, vx:(Math.random()-.5)*12*weit, vy:-Math.random()*11*weit-3, r:Math.random()*6+4, c:FARBEN[i%FARBEN.length], a:Math.random()*6, s:(Math.random()-.5)*.3, t:0});
  if (!laeuft){ laeuft = true; requestAnimationFrame(schritt); }
}
function schritt(){
  cx.clearRect(0,0,cv.width,cv.height);
  teile = teile.filter(p => p.t < 130 && p.y < cv.height + 20);
  for (const p of teile){ p.t++; p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.s;
    cx.save(); cx.globalAlpha = Math.min(1, (130-p.t)/30); cx.translate(p.x,p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2); cx.restore(); }
  if (teile.length) requestAnimationFrame(schritt); else { laeuft = false; cx.clearRect(0,0,cv.width,cv.height); cv.hidden = true; }
}
function stoss(el, n=28){ if (!el) return konfetti(n); const r = el.getBoundingClientRect(); konfetti(n, r.left + r.width/2, r.top + r.height/2, .7); }

/* ---------- Bewegung ---------- */
function wackeln(el){ if (!el || ruhig()) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
function hochzaehlen(el, bis, ms=700){
  if (!el) return; if (ruhig() || bis <= 0){ el.textContent = bis; return; }
  const t0 = performance.now();
  (function f(t){ const p = Math.min(1,(t-t0)/ms); el.textContent = Math.round(bis*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(f); })(t0);
}

/* ---------- Töne (per WebAudio erzeugt, abschaltbar) ---------- */
let ac = null;
let tonAn = true; try { tonAn = localStorage.getItem('lernwerk.ton') !== 'aus'; } catch(e){}
const NOTEN = {ok:[[660,.07],[880,.12]], bad:[[196,.18,'sawtooth']], combo:[[660,.06],[880,.06],[1175,.14]], level:[[523,.1],[659,.1],[784,.1],[1047,.28]], abz:[[784,.09],[988,.09],[1319,.3]], tick:[[1200,.03,'square']], ende:[[392,.15],[330,.15],[262,.35]]};
function ton(art){
  if (!tonAn || !NOTEN[art]) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    let t = ac.currentTime + .01;
    for (const [f, d, typ] of NOTEN[art]){
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(typ==='sawtooth'?.05:.12, t+.01); g.gain.exponentialRampToValueAtTime(.0001, t+d);
      o.connect(g).connect(ac.destination); o.start(t); o.stop(t+d+.02); t += d*.85;
    }
  } catch(e){}
}
function tonUmschalten(){ tonAn = !tonAn; try{ localStorage.setItem('lernwerk.ton', tonAn?'an':'aus'); }catch(e){} if (tonAn) ton('ok'); return tonAn; }

/* ---------- Großes Fenster (Level, Abzeichen) ---------- */
function fenster(html, dauer=0){
  const w = document.createElement('div'); w.className = 'overlay';
  w.innerHTML = `<div class="overlay-box pop-in">${html}<button class="btn primary" style="margin-top:6px">Weiter</button></div>`;
  const zu = () => { w.classList.add('weg'); setTimeout(()=>w.remove(), 200); };
  w.onclick = e => { if (e.target === w || e.target.tagName === 'BUTTON') zu(); };
  document.body.appendChild(w); w.querySelector('button').focus();
  if (dauer) setTimeout(zu, dauer);
}

/* ---------- Abzeichen ---------- */
// ctx: {S, streak(), mastery(fachId), faecher}
const ABZ = [
  {id:'start',   sym:'🌱', name:'Erste Schritte',    text:'Die erste Frage richtig beantwortet.',  ok:c=>c.S.stat.richtig>=1},
  {id:'r50',     sym:'🎯', name:'Treffsicher',       text:'50 richtige Antworten.',                 ok:c=>c.S.stat.richtig>=50, fort:c=>[c.S.stat.richtig,50]},
  {id:'r250',    sym:'🏹', name:'Scharfschütze',     text:'250 richtige Antworten.',                ok:c=>c.S.stat.richtig>=250, fort:c=>[c.S.stat.richtig,250]},
  {id:'r1000',   sym:'🧠', name:'Wissensmaschine',   text:'1000 richtige Antworten.',               ok:c=>c.S.stat.richtig>=1000, fort:c=>[c.S.stat.richtig,1000]},
  {id:'s3',      sym:'🔥', name:'Dranbleiber',       text:'3 Tage am Stück gelernt.',               ok:c=>c.streak()>=3, fort:c=>[c.streak(),3]},
  {id:'s7',      sym:'⚡', name:'Wochenserie',       text:'7 Tage am Stück gelernt.',               ok:c=>c.streak()>=7, fort:c=>[c.streak(),7]},
  {id:'s30',     sym:'🌋', name:'Unaufhaltsam',      text:'30 Tage am Stück gelernt.',              ok:c=>c.streak()>=30, fort:c=>[c.streak(),30]},
  {id:'ziel',    sym:'✅', name:'Tagesziel',         text:'Das Tagesziel einmal geschafft.',        ok:c=>Object.values(c.S.days).some(n=>n>=c.S.ziel)},
  {id:'c5',      sym:'🔗', name:'Kombo 5',           text:'5 richtige Antworten in Folge.',         ok:c=>c.S.stat.comboBest>=5},
  {id:'c15',     sym:'⛓️', name:'Kombo 15',          text:'15 richtige Antworten in Folge.',        ok:c=>c.S.stat.comboBest>=15, fort:c=>[c.S.stat.comboBest,15]},
  {id:'hex',     sym:'🔢', name:'Hex-Meister',       text:'20 Rechenaufgaben zu Hex richtig.',      ok:c=>hexZahl(c)>=20, fort:c=>[hexZahl(c),20]},
  {id:'bin',     sym:'💾', name:'Bit-Flüsterer',     text:'20 Dual- oder Zweierkomplement-Aufgaben richtig.', ok:c=>binZahl(c)>=20, fort:c=>[binZahl(c),20]},
  {id:'klausur', sym:'📝', name:'Prüfling',          text:'Die erste Probe-Klausur geschrieben.',   ok:c=>c.S.klausuren.length>=1},
  {id:'eins',    sym:'🥇', name:'Glatte Eins',       text:'Eine 1 in einer Probe-Klausur.',         ok:c=>c.S.stat.einsen>=1 || c.S.klausuren.some(k=>k.note===1)},
  {id:'rennen',  sym:'⏱️', name:'Blitzmerker',       text:'15 richtige im Zeitrennen.',             ok:c=>c.S.stat.rennenBest>=15, fort:c=>[c.S.stat.rennenBest,15]},
  {id:'leben',   sym:'❤️', name:'Überlebenskünstler', text:'20 Fragen im Modus 3 Leben geschafft.', ok:c=>c.S.stat.lebenBest>=20, fort:c=>[c.S.stat.lebenBest,20]},
  {id:'fach',    sym:'🏆', name:'Fachexperte',       text:'Ein Fach zu 80 % sicher.',               ok:c=>c.faecher.some(f=>c.mastery(f)>=80)},
  {id:'duell',   sym:'⚔️', name:'Duellant',          text:'Das erste Quizduell gewonnen.',          ok:c=>c.S.stat.duelleGewonnen>=1},
  {id:'lvl10',   sym:'👑', name:'Level 10',          text:'Level 10 erreicht.',                     ok:c=>c.level()>=10, fort:c=>[c.level(),10]},
];
const zaehle = (c, re) => Object.entries(c.S.stat.rechnen||{}).filter(([k])=>re.test(k)).reduce((s,[,n])=>s+n,0);
const hexZahl = c => zaehle(c, /hex/);
const binZahl = c => zaehle(c, /bin|zk2/);

function pruefeAbzeichen(ctx){
  const neu = [];
  for (const a of ABZ){ if (!ctx.S.abz[a.id] && a.ok(ctx)){ ctx.S.abz[a.id] = Date.now(); neu.push(a); } }
  return neu;
}
function zeigeAbzeichen(a){
  ton('abz'); konfetti(140);
  fenster(`<div class="abz-gross">${a.sym}</div><div class="eyebrow">Abzeichen freigeschaltet</div><h2>${a.name}</h2><p class="muted">${a.text}</p>`);
}

window.FX = {konfetti, stoss, wackeln, hochzaehlen, ton, tonUmschalten, tonAn:()=>tonAn, fenster, ABZ, pruefeAbzeichen, zeigeAbzeichen};
})();
