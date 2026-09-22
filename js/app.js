(function(){
"use strict";
const D = window.LERNWERK_DATEN || {faecher:[],themen:[],einheiten:[]};
const $ = (s, r=document) => r.querySelector(s);
const app = $('#app');
const ICON = {
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 12 18a5 5 0 0 1-5-5.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-9z"/><path d="M7 19.5h10v2H7z" opacity=".35"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
  cards:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="6" width="14" height="14" rx="2.5"/><path d="M7 3h11.5A2.5 2.5 0 0 1 21 5.5V17"/></svg>',
  quiz:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="6" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="5" cy="18" r="1.6"/><path d="M10 6h10M10 12h10M10 18h10"/></svg>',
  calc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/></svg>',
  exam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
  target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
  ok:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg>',
  ton:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  tonAus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',
  trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9.5 18h5"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.8 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z"/></svg>',
  timer:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M19 5l1.5 1.5"/></svg>',
  swords:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5 14 2h3v3l-4.5 4.5M5 14l-2 2 2 2M7 17l-2 2"/></svg>',
  pfeil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function md(s){
  const lines = esc(s).split('\n'); let out = '', inList = false;
  const inline = t => t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>');
  for (const l of lines){
    if (/^\s*[-•]\s+/.test(l)){ if(!inList){out+='<ul>';inList=true;} out += '<li>'+inline(l.replace(/^\s*[-•]\s+/,''))+'</li>'; continue; }
    if (inList){out+='</ul>';inList=false;}
    out += (/^\d+\.\s/.test(l) ? '<div>'+inline(l)+'</div>' : (l.trim() ? '<div>'+inline(l)+'</div>' : ''));
  }
  if (inList) out += '</ul>';
  return out;
}
const fachOf = id => D.faecher.find(f => f.id === id);
const themaOf = id => D.themen.find(t => t.id === id);
const fachOfThema = tid => fachOf((themaOf(tid)||{}).fach);
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
let zufall = Math.random; // für Duelle durch einen Seed ersetzbar, damit beide dieselben Zahlen bekommen
const rnd = (a,b) => a + Math.floor(zufall()*(b-a+1));
const pick = a => a[Math.floor(zufall()*a.length)];
const seedZufall = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const de = (n, d=0) => n.toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const dayKey = (t=Date.now()) => { const d=new Date(t); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };

/* ---------------- Speicher ---------------- */
const LSK = 'lernwerk.stand.v1';
const statNeu = () => ({richtig:0, comboBest:0, rechnen:{}, rennenBest:0, lebenBest:0, einsen:0, duelleGewonnen:0});
const neu = () => ({v:1, box:{}, xp:0, days:{}, klausuren:[], ziel:20, updated:0, stat:statNeu(), abz:{}});
const ergaenze = s => { s = Object.assign(neu(), s); s.stat = Object.assign(statNeu(), s.stat); s.abz = s.abz || {}; return s; };
let S = neu();
try { const raw = localStorage.getItem(LSK); if (raw) S = ergaenze(JSON.parse(raw)); } catch(e){}
// Test-Stände von vor dem Reset verwerfen
if ((S.updated||0) < ((window.LW_CONFIG||{}).resetAb||0)){ S = neu(); try { localStorage.removeItem(LSK); } catch(e){} }
function save(){
  S.updated = Date.now();
  try { localStorage.setItem(LSK, JSON.stringify(S)); } catch(e){}
  if (window.LW_SYNC) window.LW_SYNC.geaendert(S);
}
// Schnittstelle für konto.js: Stand vom Server übernehmen
window.LW = {
  stand: () => S,
  uebernehmen(r){ S = ergaenze(JSON.parse(JSON.stringify(r))); try{localStorage.setItem(LSK, JSON.stringify(S));}catch(e){} if (!session && !exam) route(); else header(); },
  neuZeichnen: () => { if (!session && !exam) route(); },
  zuruecksetzen(){ S = neu(); save(); route(); },
};

/* ---------------- Fortschritt ---------------- */
const INTERVALL = [0, 0, 1, 3, 7, 16]; // Tage je Leitner-Fach 1..5
const boxOf = id => (S.box[id] && S.box[id].b) || 0;
const isDue = id => { const r = S.box[id]; if (!r) return true; return Date.now() >= r.t + INTERVALL[r.b]*86400000 - 3600000; };
function rateItem(id, gut, halb){
  const r = S.box[id] || {b:0,t:0};
  let b = r.b || 0;
  if (gut) b = Math.min(5, b+1); else if (halb) b = Math.max(1, b); else b = 1;
  S.box[id] = {b, t:Date.now()};
}
function addXP(n, el){
  const lvlVor = level().n;
  S.xp += n; const k = dayKey(); S.days[k] = (S.days[k]||0) + 1; S.xpTag = S.xpTag || {}; S.xpTag[k] = (S.xpTag[k]||0) + n;
  save(); header();
  if (el && n>0){ const r = el.getBoundingClientRect(); const f = document.createElement('div'); f.className='xpfly'; f.textContent='+'+n+' XP'; f.style.left=(r.left+r.width/2-30)+'px'; f.style.top=(r.top-10)+'px'; document.body.appendChild(f); setTimeout(()=>f.remove(),900); }
  if (level().n > lvlVor){ logEintrag('level', 'Level ' + level().n + ' erreicht!'); FX.ton('level'); konfetti(160); FX.fenster(`<div class="lvl-gross">${level().n}</div><div class="eyebrow">Level aufgestiegen</div><h2>Level ${level().n} erreicht!</h2><p class="muted">Bis Level ${level().n+1} brauchst du ${level().need} XP.</p>`); }
  if (S.days[k] === S.ziel) { logEintrag('ziel', 'Tagesziel geschafft (' + S.ziel + ' Antworten)'); toast('Tagesziel geschafft!'); konfetti(90); }
  abzeichenPruefen();
}
function abzeichenPruefen(){
  const neu = FX.pruefeAbzeichen({S, streak, level:()=>level().n, faecher:D.faecher.filter(f=>!f.bald).map(f=>f.id), mastery:fid=>mastery(einheitenIn({fach:fid}))});
  if (neu.length){ neu.forEach(a => logEintrag('abz', 'Neues Abzeichen: ' + a.name)); save(); neu.forEach((a,i)=>setTimeout(()=>FX.zeigeAbzeichen(a), 400 + i*1500)); }
}
/* Treffer/Fehler zentral: Combo, Töne, Animation */
function treffer(el){
  S.stat.richtig++; if (session){ session.combo = (session.combo||0)+1; session.richtig++; }
  const c = session ? session.combo : 0;
  if (c > S.stat.comboBest) S.stat.comboBest = c;
  FX.stoss(el, c>=5?45:24);
  if (c && [3,5,10,15,20,30].includes(c)){ FX.ton('combo'); toast(c+'er-Kombo! +'+c+' Bonus-XP'); if (session) session.xp += c; return c; }
  FX.ton('ok'); return 0;
}
function fehler(el){ if (session) session.combo = 0; FX.ton('bad'); FX.wackeln(el); }
function comboChip(){ const c = session && session.combo || 0; return `<span class="combo ${c>=3?'an':''} ${c>=10?'heiss':''}" id="combo" title="Richtige in Folge">${ICON.flame}<b>${c}</b></span>`; }
function comboNeu(){ const el=$('#combo'); if (el){ el.outerHTML = comboChip(); const n=$('#combo'); if (session && session.combo>=3){ n.classList.add('pop'); } } }
function level(){ let n=1, need=150, rest=S.xp; while (rest >= need){ rest-=need; n++; need = 150 + (n-1)*75; } return {n, rest, need}; }
function streak(){
  let n = 0; let t = Date.now();
  if (!S.days[dayKey(t)]) t -= 86400000;
  while (S.days[dayKey(t)]) { n++; t -= 86400000; }
  return n;
}
const einheitenIn = (scope) => D.einheiten.filter(e => (!scope.themen || scope.themen.includes(e.thema)) && (!scope.fach || (themaOf(e.thema)||{}).fach === scope.fach));
function mastery(list){ if (!list.length) return 0; return Math.round(list.reduce((s,e)=>s+boxOf(e.id),0) / (list.length*5) * 100); }
const rechenIn = (scope) => { const set = new Set(); D.themen.forEach(t => { if (t.rechnen && (!scope.themen || scope.themen.includes(t.id)) && (!scope.fach || t.fach===scope.fach)) t.rechnen.forEach(r=>set.add(r)); }); return [...set]; };

/* ---------------- Rechenaufgaben ---------------- */
const grp4 = s => String(s).replace(/\s/g,'').replace(/(.{4})(?=.)/g,'$1 ');
const bits = (n, w) => grp4((n >>> 0).toString(2).padStart(w,'0').slice(-w));
const norm = s => String(s).replace(/[\s_]/g,'').toUpperCase().replace(/^0X/,'');
const hexg = (n, w) => n.toString(16).toUpperCase().padStart(w,'0').replace(/(..)(?=.)/g,'$1 ');
const tbl = (head, rows, hlCol) => '<table><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,i)=>'<td'+(i===hlCol?' class="hl"':'')+'>'+c+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
const numEq = base => (inp, val) => { const s = norm(inp); if (!s || !new RegExp(base===2?'^[01]+$':base===16?'^[0-9A-F]+$':'^-?\\d+$').test(s)) return false; return parseInt(s, base) === val; };
const GEN = {
  dez2bin(){ const n = rnd(20,255); const rows=[]; let x=n; while(x>0){ rows.push([x+' : 2', Math.floor(x/2), x%2]); x=Math.floor(x/2); }
    return {name:'Dezimal → Dual', thema:'aew-zahl', frage:'Rechne die Dezimalzahl mit der <b>Divisionsmethode</b> in eine Dualzahl (8 Bit) um.', zeige:n+'<sub>10</sub>', loesung:bits(n,8), check:(i)=>numEq(2)(i,n), punkte:3,
      schritte:'<p class="small muted">So lange durch 2 teilen, bis 0 herauskommt. Reste <b>von unten nach oben</b> lesen.</p>'+tbl(['Rechnung','Ergebnis','Rest'], rows, 2)+'<p style="margin-top:8px">Ergebnis: <code>'+bits(n,8)+'</code></p>'+(window.GFX?GFX.stellen(n):'')}; },
  bin2dez(){ const n = rnd(20,255); const b=n.toString(2).padStart(8,'0'); const w=[128,64,32,16,8,4,2,1]; const teile=w.filter((x,i)=>b[i]==='1');
    return {name:'Dual → Dezimal', thema:'aew-zahl', frage:'Rechne die Dualzahl in eine Dezimalzahl um (Additionsmethode).', zeige:grp4(b)+'<sub>2</sub>', loesung:String(n), check:(i)=>numEq(10)(i,n), punkte:2,
      schritte:(window.GFX?GFX.stellen(n):tbl(['Stellenwert',...w],[['Bit',...b.split('').map(c=>c==='1'?'<b>1</b>':'0')]]))+'<p style="margin-top:8px">Alle Einsen addieren: <code>'+teile.join(' + ')+' = '+n+'</code></p>'}; },
  dez2hex(){ const n = rnd(100,9999); const rows=[]; let x=n; const H='0123456789ABCDEF'; while(x>0){ rows.push([x+' : 16', Math.floor(x/16), (x%16)+(x%16>9?' ('+H[x%16]+')':'')]); x=Math.floor(x/16); }
    return {name:'Dezimal → Hex', thema:'aew-zahl', frage:'Rechne die Dezimalzahl in eine Hexadezimalzahl um.', zeige:n+'<sub>10</sub>', loesung:hexg(n, n>255?4:2), check:(i)=>numEq(16)(i,n), punkte:3,
      schritte:'<p class="small muted">Durch 16 teilen, Reste von unten nach oben lesen (10=A … 15=F).</p>'+tbl(['Rechnung','Ergebnis','Rest'], rows, 2)+'<p style="margin-top:8px">Ergebnis: <code>'+n.toString(16).toUpperCase()+'</code> · als Bytes <code>'+hexg(n,n>255?4:2)+'</code></p>'}; },
  hex2dez(){ const n = rnd(20,65535); const h=n.toString(16).toUpperCase(); const L=h.length; const teile=h.split('').map((c,i)=>{const p=L-1-i; return parseInt(c,16)+' · 16'+sup(p)+' = '+(parseInt(c,16)*Math.pow(16,p));});
    return {name:'Hex → Dezimal', thema:'aew-zahl', frage:'Rechne die Hexadezimalzahl in eine Dezimalzahl um.', zeige:h+'<sub>16</sub>', loesung:String(n), check:(i)=>numEq(10)(i,n), punkte:3,
      schritte:'<ol>'+teile.map(t=>'<li><code>'+t+'</code></li>').join('')+'</ol><p style="margin-top:8px">Summe: <code>'+n+'</code></p>'}; },
  bin2hex(){ const w = pick([8,16]); const n = rnd(w===8?16:256, w===8?255:65535); const b=n.toString(2).padStart(w,'0'); const nib=b.match(/.{4}/g);
    return {name:'Dual → Hex', thema:'aew-zahl', frage:'Wandle die Dualzahl in eine Hexadezimalzahl um.', zeige:grp4(b)+'<sub>2</sub>', loesung:hexg(n,w/4), check:(i)=>numEq(16)(i,n), punkte:2,
      schritte:'<p class="small muted">Trick: <b>4 Bit = 1 Hex-Zeichen.</b></p>'+tbl(['4 Bit',...nib],[['Hex',...nib.map(x=>parseInt(x,2).toString(16).toUpperCase())]])}; },
  zk2bin(){ const n = -rnd(2,128); const a=-n; const inv=(~a)&255;
    return {name:'Zweierkomplement bilden', thema:'aew-zahl', frage:'Stelle die negative Dezimalzahl als vorzeichenbehaftete Dualzahl (Zweierkomplement, 8 Bit) dar.', zeige:n+'<sub>10</sub>', loesung:bits(n&255,8), check:(i)=>{const s=norm(i); return /^[01]{8}$/.test(s) && parseInt(s,2)===(n&255);}, punkte:3,
      schritte:tbl(['Schritt','Rechnung','Ergebnis'],[['1','Betrag dual',a+' = <code>'+bits(a,8)+'</code>'],['2','Alle Bits umdrehen','<code>'+bits(inv,8)+'</code>'],['3','+1','<code>'+bits(n&255,8)+'</code>']],2)}; },
  zk2dez(){ const v = rnd(0,255); const neg = v>=128; const val = neg? v-256 : v;
    const st = neg ? [['1','Erstes Bit ist 1','→ negativ'],['2','Bits umdrehen','<code>'+bits((~v)&255,8)+'</code>'],['3','+1','<code>'+bits(((~v)&255)+1,8)+'</code> = '+(-val)],['4','Minus davor','<b>'+val+'</b>']] : [['1','Erstes Bit ist 0','→ positiv'],['2','Normal umrechnen','<b>'+val+'</b>']];
    return {name:'Zweierkomplement lesen', thema:'aew-zahl', frage:'Welche Dezimalzahl steht in dieser vorzeichenbehafteten Dualzahl (Zweierkomplement, 8 Bit)?', zeige:bits(v,8)+'<sub>2</sub>', loesung:String(val), check:(i)=>{const s=String(i).replace(/\s/g,'').replace('−','-'); return /^[+-]?\d+$/.test(s) && parseInt(s,10)===val;}, punkte:3,
      schritte:tbl(['Schritt','Was','Ergebnis'], st, 2)}; },
  ascii2bin(){ const c = pick('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-'.split('')); const k=c.charCodeAt(0);
    return {name:'Zeichen → Binärcode', thema:'aew-zahl', frage:'Wandle das Zeichen mithilfe der ASCII-Tabelle in Binärcode (8 Bit) um.', zeige:'„'+esc(c)+'"', loesung:bits(k,8), check:(i)=>numEq(2)(i,k), punkte:2,
      schritte:tbl(['Zeichen','Dezimal (ASCII)','Hex','Binär'],[[esc(c),k,k.toString(16).toUpperCase(),'<code>'+bits(k,8)+'</code>']],3)+'<p class="small muted" style="margin-top:8px">Merke: A = 65, a = 97, Bindestrich = 45. Groß- und Kleinbuchstaben haben verschiedene Codes.</p>'}; },
  bin2ascii(){ const w = pick(['Bit','Byte','Code','Java','Hash','Bank','Daten','Tabelle','Netz','Info']); const b=w.split('').map(c=>c.charCodeAt(0).toString(2).padStart(8,'0'));
    return {name:'Binärcode → Text', thema:'aew-zahl', frage:'Wandle den Binärcode mithilfe der ASCII-Tabelle in Text um (Groß-/Kleinschreibung beachten).', zeige:'<span style="font-size:.62em">'+b.join(' ')+'</span>', loesung:w, check:(i)=>String(i).trim()===w, punkte:3,
      schritte:tbl(['Binär','Hex','Dezimal','Zeichen'], w.split('').map((c,i)=>['<code>'+b[i]+'</code>',c.charCodeAt(0).toString(16).toUpperCase(),c.charCodeAt(0),'<b>'+c+'</b>']),3)}; },
  bruteforce(){ const t0 = pick([10,20,30,60]); const z = pick([62,94]); const n = pick([9,10,11]); const frist = pick([7,14,30,90]); const k=n-8;
    const sek = t0*Math.pow(z,k); const std = sek/3600; const tage = sek/86400; const ja = tage <= frist;
    const kette = t0+' s'+' × '+z+(k>1?' × '+z:'')+(k>2?' × '+z:'');
    return {name:'Brute-Force-Zeit', thema:'its-pw', frage:'Ein 8-stelliges Passwort wird per Brute Force in <b>'+t0+' Sekunden</b> erraten. Jede Stelle hat <b>'+z+'</b> mögliche Zeichen. Die Passwortlänge wird auf <b>'+n+' Zeichen</b> erhöht, das Passwort gilt <b>'+frist+' Tage</b>.<br>Wie viele <b>Tage</b> braucht der Angreifer höchstens? (auf 2 Nachkommastellen)', zeige:'', loesung:de(tage,2)+' Tage → '+(ja?'ja, knackbar innerhalb der Frist':'nein, nicht innerhalb der Frist'),
      check:(i)=>{ const v=parseFloat(String(i).replace(/\./g,'').replace(',','.').replace(/[^\d.]/g,'')); return isFinite(v) && Math.abs(v-tage) <= Math.max(0.011, tage*0.005); }, punkte:4, eingabe:'z. B. 3,07',
      schritte:tbl(['Schritt','Rechnung'],[['Idee','Jede zusätzliche Stelle → Zeit × '+z],['Sekunden','<code>'+kette+' = '+de(sek)+' s</code>'],['Stunden','<code>'+de(sek)+' : 3600 ≈ '+de(std,2)+' h</code>'],['Tage','<code>'+de(std,2)+' : 24 ≈ '+de(tage,2)+' Tage</code>'],['Vergleich','<code>'+de(tage,2)+' '+(ja?'≤':'>')+' '+frist+'</code> → '+(ja?'<b>knackbar</b> innerhalb der Gültigkeit':'<b>nicht</b> innerhalb der Gültigkeit')]],1)}; },
};
function aufgabe(key, seed){ const alt = zufall; if (seed != null) zufall = seedZufall(seed); try { return Object.assign(GEN[key](), {key, seed}); } finally { zufall = alt; } }
function sup(p){ return String(p).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join(''); }

/* ---------------- Kopf, Toast, Konfetti ---------------- */
function header(){
  const s = streak(), L = level();
  $('#streakChip').innerHTML = ICON.flame + s + (s===1?' Tag':' Tage');
  $('#lvlChip').innerHTML = ICON.star + 'Level ' + L.n + '<span class="lvlbar" aria-hidden="true"><i style="width:'+Math.round(L.rest/L.need*100)+'%"></i></span>';
}
let toastT; function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2200); }
const konfetti = n => FX.konfetti(n);
$('#homeBtn').onclick = () => { go('#/'); };
$('#abzBtn').onclick = () => go('#/abzeichen');
const tonIcon = () => { $('#tonBtn').innerHTML = FX.tonAn() ? ICON.ton : ICON.tonAus; $('#tonBtn').setAttribute('aria-label', FX.tonAn()?'Töne aus':'Töne an'); };
$('#tonBtn').onclick = () => { FX.tonUmschalten(); tonIcon(); }; tonIcon();
function thema(t){ document.documentElement.dataset.theme = t; try{localStorage.setItem('lernwerk.theme', t);}catch(e){} }
$('#themeBtn').onclick = () => thema(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light');
try { thema(localStorage.getItem('lernwerk.theme') === 'light' ? 'light' : 'dark'); } catch(e){ document.documentElement.dataset.theme = 'dark'; }

/* ---------------- Router ---------------- */
let session = null, exam = null;
function go(h){ if (location.hash === h) route(); else location.hash = h; }
window.addEventListener('hashchange', route);
function route(){
  const h = location.hash || '#/';
  header(); window.scrollTo(0,0); railLeeren(); navAktiv(h); clearTimeout(heroT);
  const SEITEN = {'#/faecher':viewFaecher, '#/lernen':viewLernen, '#/karteikarten':viewKarteikarten, '#/lernpfad':viewLernpfad, '#/fortschritt':viewFortschritt, '#/einstellungen':viewEinstellungen, '#/mehr':viewMehr};
  if (SEITEN[h]){ session = null; exam = null; stopTimer(); return SEITEN[h](); }
  if (h.startsWith('#/fach/')) return viewFach(h.split('/')[2]);
  if (h === '#/klausur') return viewKlausurSetup();
  if (h === '#/abzeichen') return viewAbzeichen();
  if (window.LW_ROUTEN){ for (const [p, f] of Object.entries(window.LW_ROUTEN)) if (h.startsWith(p)) { session = null; exam = null; stopTimer(); return f(h); } }
  if (h === '#/uebung' && session) return renderSession();
  if (h === '#/pruefung' && exam) return renderExam();
  session = null; exam = null; stopTimer();
  viewHome();
}

/* ---------------- Hülle: Navigation, rechte Spalte ---------------- */
const NAV = [
  ['#/', 'start', 'Startseite'], ['#/faecher', 'faecher', 'Fächer'], ['#/duell', 'duelle', 'Quiz-Duelle'], ['#/rangliste', 'rang', 'Rangliste'],
  null,
  ['#/karteikarten', 'karten', 'Karteikarten'], ['#/lernpfad', 'pfad', 'Lernpfad'], ['#/fortschritt', 'fortschritt', 'Fortschritt'], ['#/einstellungen', 'einst', 'Einstellungen'],
];
const TABS = [['#/', 'start', 'Start'], ['#/faecher', 'faecher', 'Fächer'], ['#/duell', 'duelle', 'Duelle'], ['#/rangliste', 'rang', 'Rangliste'], ['#/mehr', 'mehr', 'Mehr']];
function huelle(){
  const nav = $('#side'); if (!nav || !window.GFX) return;
  nav.innerHTML = NAV.map(n => n ? `<a class="nav" href="${n[0]}" data-nav="${n[0]}">${GFX.nav[n[1]]}<span>${n[2]}</span></a>` : '<div class="nav-gruppe">Mein Lernen</div>').join('')
    + `<div class="nav-fuss">${GFX.nav.rakete}<span>Lernen. Spielen.<br>Besser werden.</span></div>`;
  $('#tabbar').innerHTML = TABS.map(n => `<a class="tab" href="${n[0]}" data-nav="${n[0]}">${GFX.nav[n[1]]}<span>${n[2]}</span></a>`).join('');
}
function navAktiv(h){
  const basis = h === '#/' || h === '' ? '#/' : '#/' + (h.split('/')[1] || '');
  const map = {'#/fach':'#/faecher', '#/uebung':'#/', '#/pruefung':'#/', '#/klausur':'#/', '#/abzeichen':'#/fortschritt', '#/konto':'#/einstellungen', '#/datenschutz':'#/einstellungen', '#/lernen':'#/'};
  const ziel = map[basis] || basis;
  document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('aktiv', a.dataset.nav === ziel || (ziel === '#/mehr' && a.dataset.nav === '#/mehr')));
}
const rail = () => $('#rail');
function railLeeren(){ const r = rail(); if (r) r.innerHTML = ''; document.body.classList.remove('mit-rail'); }

/* ---------------- Aktivitäten ---------------- */
function logEintrag(art, text){ S.log = S.log || []; S.log.unshift({t: Date.now(), art, text}); if (S.log.length > 30) S.log.length = 30; save(); }
const vorZeit = t => { const m = Math.round((Date.now()-t)/60000); if (m < 1) return 'gerade eben'; if (m < 60) return 'vor ' + m + ' Min.'; const h = Math.round(m/60); if (h < 24) return 'vor ' + h + (h===1?' Stunde':' Stunden'); const d = Math.round(h/24); return 'vor ' + d + (d===1?' Tag':' Tagen'); };

/* ---------------- Startseite ---------------- */
let heroT = null;
function viewHome(){
  const alle = D.einheiten, faellig = alle.filter(e=>isDue(e.id)).length, heute = S.days[dayKey()]||0;
  const eingeloggt = window.LW_SYNC && window.LW_SYNC.angemeldet();
  const profil = eingeloggt ? window.LW_SYNC.profil() : null;
  app.innerHTML = `
  <section class="hero">
    <div class="hero-text">
      <div class="hero-eyebrow">Lernen. Spielen. Besser werden.</div>
      <h1 class="hero-titel">Dein Wissen.<br>Dein <span class="verlauf">Spiel.</span></h1>
      <p class="hero-sub">Lerne euren <span class="hl-gelb">Unterrichtsstoff</span> – spielerisch, interaktiv und mit spannenden Quiz-Duellen. Fordere deine Klasse heraus und werde zum Lern-Champion!</p>
      <div class="row hero-knoepfe"><button class="btn primary gross" id="goOn">Jetzt starten ${ICON.pfeil}</button><button class="btn ghost-hell gross" id="soGehts">${ICON.play}So funktioniert’s</button></div>
    </div>
    <div class="hero-bild" aria-hidden="true">
      <img class="hero-img" src="img/hero.jpg" alt="" onerror="this.remove()">
      <div class="hero-ersatz">${GFX.heroErsatz()}</div>
      <div class="spieler links"><span class="ava" style="background:var(--${profil ? profil.farbe : 'aew'})">${esc((profil ? profil.spitzname : 'Du')[0].toUpperCase())}</span><div><b>${esc(profil ? profil.spitzname : 'Du')}</b><small>${ICON.bolt}${S.xp} <i class="muenze"></i></small></div></div>
      <div class="spieler rechts" id="heroGegner"><span class="ava" style="background:var(--its2)">?</span><div><b>Klasse</b><small>${ICON.bolt}– <i class="muenze"></i></small></div></div>
      <div class="quizkarte" id="quizkarte"></div>
      ${GFX.funkeln()}
    </div>
  </section>

  <section class="features">
    ${feature('gruen','gamepad','Spielerisch lernen','Karteikarten, Quiz, Rechnen, Zeitrennen und 3 Leben – mit Kombos und XP.','#/lernen')}
    ${feature('lila','personen','Quiz-Duelle','Fordere jemanden aus deiner Klasse heraus und zeige, was du kannst!','#/duell', window.LW_DUELL && window.LW_DUELL.offen() ? window.LW_DUELL.offen()+' × du bist dran' : '')}
    ${feature('gold','pokal','Fortschritt & Belohnungen','Sammle XP, steige in der Rangliste auf und schalte Abzeichen frei.','#/fortschritt')}
    ${feature('blau','buch','Alle Fächer & Themen','WBL, ITS1 und AEW – jede Frage aus eurem Unterricht, mit Quelle.','#/faecher')}
  </section>

  <section class="unten">
    <div class="panel so-gehts">
      <div class="kasten-kopf">${GFX.appIcon('lila','personen',30)}<div><h2>So einfach geht’s</h2><p class="muted small">In wenigen Schritten zum Lernerfolg – und dabei noch Spaß haben!</p></div></div>
      <div class="schritte">${SCHRITTE.map((s,k)=>`${k?`<span class="schritt-pfeil">${ICON.pfeil}</span>`:''}<div class="schritt"><div class="schritt-kopf"><span class="nr" style="background:var(--${s[0]})">${k+1}</span>${GFX.nav[s[1]]}</div><b>${s[2]}</b><p>${s[3]}</p></div>`).join('')}</div>
    </div>
    <div class="panel rang-kasten" id="rangKasten">${rangKasten(null)}</div>
  </section>`;

  // rechte Spalte
  const L = level(), pro = Math.round(L.rest/L.need*100);
  document.body.classList.add('mit-rail');
  rail().innerHTML = `
    <div class="panel rail-kasten">
      <div class="kasten-kopf">${GFX.nav.fortschritt}<h3>Deine Statistik</h3></div>
      <div class="statistik">
        <div class="ring lvl-ring" style="--p:${pro};--c:var(--akzent-2)"><div><b>Level ${L.n}</b><small>${pro} %</small></div></div>
        <ul class="stat-liste">
          <li>${GFX.mini('flamme')}<div><b>${streak()} ${streak()===1?'Tag':'Tage'}</b><small>Serie</small></div></li>
          <li>${GFX.mini('pokal')}<div><b data-zahl="${S.stat.duelleGewonnen||0}">${S.stat.duelleGewonnen||0}</b><small>Gewonnene Duelle</small></div></li>
          <li>${GFX.mini('stern')}<div><b data-zahl="${S.xp}">${S.xp}</b><small>Gesamtpunkte (XP)</small></div></li>
        </ul>
      </div>
      <div class="tipp">${GFX.mini('lampe')}<div><b>Tipp</b><span>${tipp(faellig, heute)}</span></div></div>
    </div>
    <div class="panel rail-kasten">
      <div class="kasten-kopf">${ICON.bolt}<h3>Aktivitäten</h3></div>
      <ul class="aktiv-liste">${(S.log||[]).slice(0,5).map(a=>`<li><span class="aktiv-ico ${a.art}">${GFX.mini(AKT_ICON[a.art]||'stern')}</span><div><b>${esc(a.text)}</b><small>${vorZeit(a.t)}</small></div></li>`).join('') || '<li class="leer"><span class="muted small">Noch nichts passiert – leg los, dann erscheinen hier deine Erfolge.</span></li>'}</ul>
    </div>
    <div class="panel rail-kasten cta-duell">
      <div class="cta-kopf">${GFX.mini('pokal')}<div><b>Heute noch ein Duell?</b><span>Fordere jetzt jemanden aus deiner Klasse heraus und teste dein Wissen!</span></div></div>
      <button class="btn primary voll" id="ctaDuell">Duell starten ${ICON.pfeil}</button>
    </div>`;

  $('#goOn').onclick = () => startSession({titel:'Weiterlernen', kinds:['K','M','R'], scope:{}, n:15});
  $('#soGehts').onclick = () => FX.fenster(`<div class="eyebrow">So funktioniert’s</div><h2>In 4 Schritten zum Lern-Champion</h2><ol class="so-liste">${SCHRITTE.map(s=>`<li><b>${s[2]}</b><span>${s[3]}</span></li>`).join('')}</ol>`);
  $('#ctaDuell').onclick = () => go('#/duell');
  app.querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => go(b.dataset.ziel));
  document.querySelectorAll('#rail [data-zahl]').forEach(b => FX.hochzaehlen(b, +b.dataset.zahl, 900));
  heroQuiz();
  if (eingeloggt && window.LW_SYNC.rangliste) window.LW_SYNC.rangliste().then(d => { const k = $('#rangKasten'); if (!k) return; k.innerHTML = rangKasten(d); rangKastenAn(d); heroGegner(d); });
  else rangKastenAn(null);
}
const SCHRITTE = [['aew','buchnav','Fach wählen','Wähle ein Fach oder ein Thema aus eurem Unterricht.'],['wbl','gamepadnav','Lernen & Üben','Karteikarten, Quiz und Rechenaufgaben – und XP sammeln.'],['its2','duelle','Quiz-Duell starten','Fordere jemanden aus deiner Klasse heraus.'],['dk','rang','Aufsteigen & Belohnen','Level aufsteigen, Rangliste erklimmen, Abzeichen sammeln.']];
const AKT_ICON = {duell:'pokal', verloren:'personen', abz:'schild', level:'stern', klausur:'blatt', ziel:'haken', neu:'personen'};
function feature(farbe, ico, titel, text, ziel, extra){
  return `<button class="feature ${farbe}" data-ziel="${ziel}">${GFX.appIcon(farbe, ico, 56)}<h3>${titel}</h3><p>${text}</p>${extra?`<span class="feature-extra">${extra}</span>`:''}<span class="feature-pfeil">${ICON.pfeil}</span></button>`;
}
function tipp(faellig, heute){
  const dran = window.LW_DUELL ? window.LW_DUELL.offen() : 0;
  if (dran) return `Du bist in ${dran} ${dran===1?'Duell':'Duellen'} dran!`;
  if (heute < S.ziel) return `Noch ${S.ziel-heute} Antworten bis zum Tagesziel.`;
  if (faellig) return `${faellig} Einheiten sind zum Wiederholen fällig.`;
  return 'Tagesziel geschafft – Zeit für ein Zeitrennen!';
}
function rangKasten(d){
  const kopf = `<div class="kasten-kopf">${GFX.mini('krone')}<h3>Rangliste</h3></div>`;
  if (!window.LW_SYNC || !window.LW_SYNC.angemeldet()) return kopf + `<p class="muted small">Mit Konto siehst du hier, wer in deiner Klasse vorne liegt.</p><button class="btn primary voll" data-ziel="#/konto">Anmelden</button>`;
  if (!d) return kopf + '<p class="muted small">Lädt …</p>';
  return kopf + `<div class="seg mini drei"><button aria-pressed="true" data-rk="woche">Woche</button><button aria-pressed="false" data-rk="gesamt">Allzeit</button><button aria-pressed="false" data-rk="duell">Duelle</button></div><ol class="rk-liste" id="rkListe"></ol>`;
}
function rangKastenAn(d){
  const k = $('#rangKasten'); if (!k) return;
  k.querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => go(b.dataset.ziel));
  if (!d) return;
  const ich = window.LW_SYNC.ich() && window.LW_SYNC.ich().id;
  let duelle = null;
  const zeichne = async art => {
    if (art === 'duell'){ if (!duelle) duelle = await window.LW_SYNC.duellRangliste(); const q = x => x.gespielt ? x.siege/x.gespielt : 0; const l = (duelle||[]).slice().sort((a,b)=>b.siege-a.siege||q(b)-q(a)||b.punkte-a.punkte).slice(0,5);
      $('#rkListe').innerHTML = l.map((x,i)=>`<li class="${x.id===ich?'du':''}"><span class="rk-platz p${i+1}">${i+1}</span><span class="ava" style="background:var(--${x.farbe})">${esc(x.spitzname[0].toUpperCase())}</span><span class="rk-name">${esc(x.spitzname)}${x.id===ich?' <small>(du)</small>':''}</span><span class="rk-xp mono">${x.siege}–${x.niederlagen}</span></li>`).join('') || '<li class="muted small">Noch keine Duelle gespielt.</li>'; return; }
    const l = d.slice().sort((a,b)=>b[art]-a[art]).slice(0,5);
    $('#rkListe').innerHTML = l.map((x,i)=>`<li class="${x.id===ich?'du':''}"><span class="rk-platz p${i+1}">${i+1}</span><span class="ava" style="background:var(--${x.farbe})">${esc(x.spitzname[0].toUpperCase())}</span><span class="rk-name">${esc(x.spitzname)}${x.id===ich?' <small>(du)</small>':''}</span><span class="rk-xp mono">${x[art].toLocaleString('de-DE')}</span></li>`).join('') || '<li class="muted small">Noch niemand in der Klasse.</li>'; };
  k.querySelectorAll('[data-rk]').forEach(b => b.onclick = () => { k.querySelectorAll('[data-rk]').forEach(x=>x.setAttribute('aria-pressed', x===b)); zeichne(b.dataset.rk); });
  zeichne('woche');
}
function heroGegner(d){
  const ich = window.LW_SYNC.ich() && window.LW_SYNC.ich().id; const g = (d||[]).filter(x=>x.id!==ich).sort((a,b)=>b.woche-a.woche)[0];
  const el = $('#heroGegner'); if (!el || !g) return;
  el.innerHTML = `<span class="ava" style="background:var(--${g.farbe})">${esc(g.spitzname[0].toUpperCase())}</span><div><b>${esc(g.spitzname)}</b><small>${ICON.bolt}${g.gesamt} <i class="muenze"></i></small></div>`;
}
// Schwebende Quiz-Karte im Hero: echte Fragen, richtige Antwort leuchtet auf
function heroQuiz(){
  clearTimeout(heroT);
  const box = $('#quizkarte'); if (!box) return;
  const pool = D.einheiten.filter(e => e.typ==='M' && e.optionen.length>=3 && e.optionen.length<=4 && e.optionen.filter(o=>o[1]).length===1 && e.frage.length < 75 && e.optionen.every(o=>o[0].length<30 && o[0].split(/s+/).every(w=>w.length<=18)));
  let n = 0;
  const zeige = () => {
    if (!document.body.contains(box)) return;
    const e = pick(pool), f = fachOfThema(e.thema), opts = shuffle(e.optionen); n = n % 10 + 1;
    box.innerHTML = `<div class="qk-kopf"><span class="qk-fach" style="--fc:var(--${f.farbe})">${GFX.nav.faecher}${f.name}</span><span class="qk-nr">${n}/10</span></div><div class="qk-frage">${md(e.frage)}</div>
      <div class="qk-opts">${opts.map((o,k)=>`<div class="qk-opt" data-ok="${o[1]?1:0}"><b>${'ABCD'[k]}</b><span>${md(o[0])}</span></div>`).join('')}</div>`;
    box.classList.remove('wechsel'); void box.offsetWidth; box.classList.add('wechsel');
    heroT = setTimeout(() => { const r = box.querySelector('[data-ok="1"]'); if (r){ r.classList.add('richtig'); r.insertAdjacentHTML('beforeend', `<i class="qk-haken">${ICON.ok}</i>`); } heroT = setTimeout(zeige, 3200); }, 2600);
  };
  zeige();
}

/* ---------------- Weitere Seiten ---------------- */
const seitenKopf = (eyebrow, titel, sub) => `<div class="seiten-kopf"><div class="eyebrow">${eyebrow}</div><h1>${titel}</h1>${sub?`<p class="muted">${sub}</p>`:''}</div>`;
function viewFaecher(){
  app.innerHTML = seitenKopf('Alle Fächer & Themen', 'Fächer', 'Fortschritt = wie sicher du den Stoff kannst') + `<div class="faecher">${D.faecher.map(fachCard).join('')}</div>`;
  app.querySelectorAll('[data-fach]').forEach(b => b.onclick = () => go('#/fach/'+b.dataset.fach));
}
function viewLernen(){
  app.innerHTML = seitenKopf('Spielerisch lernen', 'Üben & Spielen', 'Alle Fächer gemischt – such dir aus, worauf du Lust hast.') + `
  <div class="row" style="margin:6px 0 4px"><button class="btn primary" id="goOn">${ICON.bolt}Weiterlernen</button><button class="btn" id="goWeak">${ICON.target}Schwächen trainieren</button></div>
  <section class="section"><div class="section-head"><h2>Üben</h2></div><div class="modes">
    ${modeTile('karten','cards','Karteikarten','Frage, umdrehen, ehrlich bewerten. Nicht Gewusstes kommt öfter.', 'var(--wbl)')}
    ${modeTile('quiz','quiz','Multiple Choice','Ankreuzen wie in der IHK-Prüfung – mit Erklärung zu jeder Antwort.', 'var(--aew)')}
    ${modeTile('rechnen','calc','Rechenaufgaben','Dual, Hex, Zweierkomplement, ASCII, Brute Force – immer neue Zahlen.', 'var(--its1)')}
    ${modeTile('klausur','exam','Klausur-Simulation','Mit Timer, Punkten und Note nach IHK-Schlüssel.', 'var(--akzent)')}
  </div></section>
  <section class="section"><div class="section-head"><h2>Spielen</h2><span class="muted small">Bestwerte werden gespeichert</span></div><div class="modes spiele">
    <button class="mode spiel" data-spiel="rennen" style="--sc:var(--its1)">${kachelBild('rennen', ICON.timer)}<h3>Zeitrennen</h3><p class="small muted">60 Sekunden – so viele richtige wie möglich.</p><span class="best">Rekord ${S.stat.rennenBest}</span></button>
    <button class="mode spiel" data-spiel="leben" style="--sc:var(--bad)">${kachelBild('leben', ICON.heart)}<h3>3 Leben</h3><p class="small muted">Wie weit kommst du? Es wird immer schwerer.</p><span class="best">Rekord ${S.stat.lebenBest}</span></button>
    <button class="mode spiel" data-spiel="duell" style="--sc:var(--aew)">${kachelBild('duell', ICON.swords)}<h3>Quizduell</h3><p class="small muted">Fordere jemanden aus deiner Klasse heraus.</p><span class="best">3 Runden · 9 Fragen</span></button>
  </div></section>`;
  $('#goOn').onclick = () => startSession({titel:'Weiterlernen', kinds:['K','M','R'], scope:{}, n:15});
  $('#goWeak').onclick = () => startSession({titel:'Schwächen trainieren', kinds:['K','M'], scope:{}, n:15, nurSchwach:true});
  app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => startMode(b.dataset.mode, {}));
  app.querySelectorAll('[data-spiel]').forEach(b => b.onclick = () => b.dataset.spiel==='duell' ? go('#/duell') : startSpiel(b.dataset.spiel));
}
function viewKarteikarten(){
  const fs = D.faecher.filter(f=>!f.bald);
  app.innerHTML = seitenKopf('Mein Lernen', 'Karteikarten', 'Wähle ein Fach oder ein einzelnes Thema. Fällige Karten kommen zuerst.') + `<div class="stack">${fs.map(f=>{ const th = D.themen.filter(t=>t.fach===f.id);
    return `<div class="panel kk-fach" style="--fc:var(--${f.farbe})"><div class="kk-kopf">${GFX.fach[f.id]||''}<div><h2 style="color:var(--${f.farbe})">${f.name}</h2><span class="muted small">${esc(f.lang)}</span></div><button class="btn primary" data-kf="${f.id}">${ICON.cards}Alle Karten</button></div>
      <div class="kk-themen">${th.map(t=>{ const l = einheitenIn({themen:[t.id]}).filter(e=>e.typ==='K'); if (!l.length) return ''; const due = l.filter(e=>isDue(e.id)).length;
        return `<button class="kk-thema" data-kt="${t.id}"><span>${esc(t.name)}</span><small>${l.length} Karten · ${due} fällig</small><div class="bar"><i style="width:${mastery(l)}%;background:var(--${f.farbe})"></i></div></button>`; }).join('')}</div></div>`; }).join('')}</div>`;
  app.querySelectorAll('[data-kf]').forEach(b => b.onclick = () => startMode('karten', {fach:b.dataset.kf}));
  app.querySelectorAll('[data-kt]').forEach(b => b.onclick = () => startMode('karten', {themen:[b.dataset.kt]}));
}
function viewLernpfad(){
  const fs = D.faecher.filter(f=>!f.bald);
  app.innerHTML = seitenKopf('Mein Lernen', 'Lernpfad', 'Arbeite dich Station für Station durch. Sterne gibt es für 30, 60 und 90 % Sicherheit.') + `<div class="pfade">${fs.map(f=>{
    const th = D.themen.filter(t=>t.fach===f.id).map(t=>({t, m:mastery(einheitenIn({themen:[t.id]}))}));
    const naechste = th.findIndex(x=>x.m < 60);
    return `<div class="panel pfad" style="--fc:var(--${f.farbe})"><div class="pfad-kopf">${GFX.fach[f.id]||''}<h2 style="color:var(--${f.farbe})">${f.name}</h2></div>
      <div class="pfad-weg">${th.map((x,i)=>{ const sterne = x.m>=90?3:x.m>=60?2:x.m>=30?1:0;
        return `<button class="station ${i===naechste?'jetzt':''} ${sterne===3?'fertig':''}" data-st="${x.t.id}" style="--x:${[0,1,2,1][i%4]}"><span class="st-kreis">${i===naechste?ICON.play:sterne===3?ICON.ok:i+1}</span><span class="st-text"><b>${esc(x.t.name)}</b><small>${'★'.repeat(sterne)}<span class="leer">${'★'.repeat(3-sterne)}</span> · ${x.m} %</small></span>${i===naechste?'<span class="st-hier">du bist hier</span>':''}</button>`; }).join('')}</div></div>`; }).join('')}</div>`;
  app.querySelectorAll('[data-st]').forEach(b => b.onclick = () => startSession({titel: themaOf(b.dataset.st).name, kinds:['K','M','R'], scope:{themen:[b.dataset.st]}, n:12}));
}
function viewFortschritt(){
  const L = level(), tage = []; for (let i=13;i>=0;i--){ const k = dayKey(Date.now()-i*86400000); tage.push([k, (S.xpTag||{})[k]||0]); }
  const max = Math.max(10, ...tage.map(t=>t[1])); const kl = S.klausuren.slice(-6).reverse();
  const da = FX.ABZ.filter(a=>S.abz[a.id]).length;
  app.innerHTML = seitenKopf('Fortschritt & Belohnungen', 'Fortschritt') + `
  <div class="fs-oben">
    <div class="panel fs-level"><div class="ring lvl-ring" style="--p:${Math.round(L.rest/L.need*100)};--c:var(--akzent-2)"><div><b>Level ${L.n}</b><small>${L.rest}/${L.need} XP</small></div></div><div><b class="gross-zahl" data-zahl="${S.xp}">${S.xp}</b><span class="muted">XP gesamt</span><br><b class="gross-zahl" data-zahl="${S.stat.richtig}">${S.stat.richtig}</b><span class="muted">richtige Antworten</span></div></div>
    <div class="panel fs-verlauf"><h3>XP der letzten 14 Tage</h3><div class="balken">${tage.map(([k,v])=>`<div class="b" title="${k}: ${v} XP"><i style="height:${Math.round(v/max*100)}%"></i><small>${k.slice(8)}</small></div>`).join('')}</div></div>
  </div>
  <section class="section"><div class="section-head"><h2>Fächer</h2></div><div class="faecher">${D.faecher.filter(f=>!f.bald).map(fachCard).join('')}</div></section>
  <section class="section"><div class="section-head"><h2>Abzeichen</h2><button class="btn ghost" id="abzMehr">${ICON.trophy}${da} von ${FX.ABZ.length} · alle ansehen</button></div><div class="abz-streifen">${FX.ABZ.filter(a=>S.abz[a.id]).map((a,k)=>`<div class="abz-mini" style="--k:${k}" title="${esc(a.name)}">${FX.medaille(a)}</div>`).join('') || '<p class="muted small">Noch keine Abzeichen.</p>'}</div></section>
  ${kl.length ? `<section class="section"><div class="section-head"><h2>Probe-Klausuren</h2></div><div class="klist">${kl.map(k=>`<div class="panel krow"><div class="note" style="color:${notenFarbe(k.note)}">${k.note}</div><div><b>${esc(k.titel)}</b><div class="small muted">${k.datum} · ${k.punkte} von ${k.max} Punkten</div></div><div class="mono">${k.prozent} %</div></div>`).join('')}</div></section>` : ''}`;
  app.querySelectorAll('[data-zahl]').forEach(b => FX.hochzaehlen(b, +b.dataset.zahl, 900));
  app.querySelectorAll('[data-fach]').forEach(b => b.onclick = () => go('#/fach/'+b.dataset.fach));
  $('#abzMehr').onclick = () => go('#/abzeichen');
}
function viewEinstellungen(){
  const hell = document.documentElement.dataset.theme === 'light';
  const konto = window.LW_SYNC && window.LW_SYNC.angemeldet();
  app.innerHTML = seitenKopf('Mein Lernen', 'Einstellungen') + `<div class="panel setup einst">
    <div><div class="eyebrow">Tagesziel</div><div class="seg" id="ziel">${[10,20,30,50].map(z=>`<button aria-pressed="${S.ziel===z}" data-z="${z}">${z} Antworten</button>`).join('')}</div></div>
    <div><div class="eyebrow">Darstellung</div><div class="seg" id="thema"><button aria-pressed="${!hell}" data-t="dark">Dunkel</button><button aria-pressed="${hell}" data-t="light">Hell</button></div></div>
    <div><div class="eyebrow">Töne</div><div class="seg" id="toene"><button aria-pressed="${FX.tonAn()}" data-o="1">An</button><button aria-pressed="${!FX.tonAn()}" data-o="0">Aus</button></div></div>
    <div><div class="eyebrow">Fortschritt</div><button class="btn no" id="reset">Meinen Fortschritt zurücksetzen</button></div>
    <div><div class="eyebrow">Konto</div><div class="row"><button class="btn" data-ziel="#/konto">${konto ? 'Profil & Konto' : 'Anmelden / Konto anlegen'}</button><button class="btn ghost" data-ziel="#/datenschutz">Datenschutz</button><button class="btn ghost" data-ziel="#/abzeichen">${ICON.trophy}Abzeichen</button></div></div>
  </div>`;
  $('#reset').onclick = () => { if (confirm('Wirklich den ganzen Fortschritt (XP, Level, Abzeichen, Karteikarten-Stand) löschen? Das lässt sich nicht rückgängig machen.')) { window.LW.zuruecksetzen(); toast('Fortschritt zurückgesetzt'); go('#/'); } };
  app.querySelectorAll('[data-z]').forEach(b => b.onclick = () => { S.ziel = +b.dataset.z; save(); viewEinstellungen(); toast('Tagesziel: ' + S.ziel); });
  app.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { thema(b.dataset.t); viewEinstellungen(); });
  app.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { if ((b.dataset.o==='1') !== FX.tonAn()) { FX.tonUmschalten(); tonIcon(); } viewEinstellungen(); });
  app.querySelectorAll('[data-ziel]').forEach(b => b.onclick = () => go(b.dataset.ziel));
}
function viewMehr(){
  app.innerHTML = seitenKopf('Menü', 'Mehr') + `<div class="mehr-liste">${NAV.filter(n=>n && !TABS.some(t=>t[0]===n[0])).concat([['#/lernen','gamepadnav','Üben & Spielen'],['#/abzeichen','pokalnav','Abzeichen'],['#/konto','einst','Konto']]).map(n=>`<a class="panel mehr-eintrag" href="${n[0]}">${GFX.nav[n[1]]}<span>${n[2]}</span>${ICON.pfeil}</a>`).join('')}</div>`;
}
function abzStreifen(){
  const da = FX.ABZ.filter(a=>S.abz[a.id]).sort((a,b)=>S.abz[b.id]-S.abz[a.id]);
  return `<section class="section"><div class="section-head"><h2>Abzeichen</h2><button class="btn ghost" id="abzMehr">${ICON.trophy}${da.length} von ${FX.ABZ.length} · alle ansehen</button></div>
    <div class="abz-streifen">${da.length ? da.slice(0,8).map((a,k)=>`<div class="abz-mini" style="--k:${k}" title="${esc(a.name)}: ${esc(a.text)}">${FX.medaille(a)}</div>`).join('') : '<p class="muted small">Noch keine Abzeichen – beantworte deine erste Frage richtig!</p>'}</div></section>`;
}
function viewAbzeichen(){
  const ctx = {S, streak, level:()=>level().n};
  app.innerHTML = `<button class="btn ghost back" id="bk">${ICON.back}Fortschritt</button>
  <div style="margin-top:12px"><div class="eyebrow">Sammlung</div><h1>Abzeichen</h1><p class="muted" style="margin-top:6px">${FX.ABZ.filter(a=>S.abz[a.id]).length} von ${FX.ABZ.length} freigeschaltet</p></div>
  <div class="abz-grid">${FX.ABZ.map((a,k)=>{ const hat = S.abz[a.id]; const f = !hat && a.fort ? a.fort(ctx) : null;
    return `<div class="panel abz ${hat?'hat':'zu'}" style="--k:${k}"><div class="abz-sym">${hat?FX.medaille(a):(window.GFX?GFX.gesperrt():ICON.lock)}</div><h3>${esc(a.name)}</h3><p class="small muted">${esc(a.text)}</p>${hat?`<span class="tiny muted">seit ${new Date(hat).toLocaleDateString('de-DE')}</span>`: f?`<div class="bar"><i style="width:${Math.min(100,Math.round(f[0]/f[1]*100))}%;background:var(--accent)"></i></div><span class="tiny muted">${Math.min(f[0],f[1])} / ${f[1]}</span>`:''}</div>`; }).join('')}</div>`;
  $('#bk').onclick = () => go('#/fortschritt');
}
const kachelBild = (k, ico) => window.GFX ? `<div class="kachel-bild">${GFX.kachel[k]}</div>` : `<div class="ico">${ico}</div>`;
function modeTile(mode, ico, t, sub, col){ return `<button class="mode" data-mode="${mode}"><div class="ico" style="color:${col}">${ICON[ico]}</div><h3>${t}</h3><p class="small muted">${sub}</p></button>`; }
function fachCard(f){
  const th = D.themen.filter(t=>t.fach===f.id), bild = window.GFX && GFX.fach[f.id] ? GFX.fach[f.id] : '';
  if (f.bald) return `<div class="fachkarte bald" style="--fc:var(--${f.farbe})"><div class="fk-kopf"><div class="fk-bild">${bild}</div><div class="fk-titel"><h3>${f.name}</h3><span>${esc(f.lang)}</span></div><span class="fk-bald">Bald</span></div><p class="fk-leer">Noch keine Unterlagen. Sobald im Unterricht etwas dran war, kommt es hier dazu.</p></div>`;
  const list = einheitenIn({fach:f.id}), m = mastery(list), due = list.filter(e=>isDue(e.id)).length;
  return `<button class="fachkarte" data-fach="${f.id}" style="--fc:var(--${f.farbe})">
    <div class="fk-kopf"><div class="fk-bild">${bild}</div><div class="fk-titel"><h3>${f.name}</h3><span>${esc(f.lang)}</span></div><div class="ring sm" style="--p:${m};--c:var(--${f.farbe})"><div><b>${m}%</b></div></div></div>
    <div class="fk-chips"><span>${list.length} Einheiten</span><span>${th.length} Themen</span><span class="${due?'faellig':''}">${due} fällig</span></div>
    <ul class="fk-themen">${th.map(t=>{ const mm = mastery(einheitenIn({themen:[t.id]})); return `<li><span>${esc(t.name)}</span><b>${mm}%</b><div class="fk-bar"><i style="width:${Math.max(mm,2)}%"></i></div></li>`; }).join('')}</ul>
    <span class="fk-los">Jetzt lernen ${ICON.pfeil}</span>
  </button>`;
}
const notenFarbe = n => ({1:'var(--ok)',2:'var(--ok)',3:'var(--accent)',4:'var(--warn)',5:'var(--bad)',6:'var(--bad)'})[n] || 'var(--ink)';

/* ---------------- Fach-Ansicht ---------------- */
function viewFach(fid){
  const f = fachOf(fid); if (!f) return go('#/');
  const th = D.themen.filter(t=>t.fach===fid);
  app.innerHTML = `
  <button class="btn ghost back" id="bk">${ICON.back}Alle Fächer</button>
  <div style="margin-top:14px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
    <div class="ring" style="--p:${mastery(einheitenIn({fach:fid}))};--c:var(--${f.farbe})"><div><b>${mastery(einheitenIn({fach:fid}))}%</b><small>sicher</small></div></div>
    <div><div class="eyebrow">${esc(f.lang)}</div><h1 style="color:var(--${f.farbe})">${f.name}</h1></div>
  </div>
  <div class="row" style="margin-top:18px">
    <button class="btn primary" data-m="karten">${ICON.cards}Karteikarten</button>
    <button class="btn" data-m="quiz">${ICON.quiz}Multiple Choice</button>
    ${rechenIn({fach:fid}).length?`<button class="btn" data-m="rechnen">${ICON.calc}Rechnen</button>`:''}
    <button class="btn" data-m="klausur">${ICON.exam}Klausur ${f.name}</button>
  </div>
  <section class="section"><div class="section-head"><h2>Themen</h2><span class="muted small">einzeln üben</span></div>
  <div class="stack">${th.map(t=>{const l=einheitenIn({themen:[t.id]}); const m=mastery(l); const due=l.filter(e=>isDue(e.id)).length; const nK=l.filter(e=>e.typ==='K').length, nM=l.filter(e=>e.typ==='M').length;
    return `<div class="panel topic"><div class="meta"><h3>${esc(t.name)}</h3><div class="bar"><i style="width:${m}%;background:var(--${f.farbe})"></i></div><div class="small muted">${m} % sicher · ${due} fällig · ${nK} Karten · ${nM} Quizfragen${t.rechnen?' · Rechenaufgaben':''}</div></div>
    <div class="row">${nK?`<button class="btn" data-t="${t.id}" data-m="karten">${ICON.cards}Karten</button>`:''}${nM?`<button class="btn" data-t="${t.id}" data-m="quiz">${ICON.quiz}Quiz</button>`:''}${t.rechnen?`<button class="btn" data-t="${t.id}" data-m="rechnen">${ICON.calc}Rechnen</button>`:''}</div></div>`;}).join('')}</div></section>`;
  $('#bk').onclick = () => go('#/faecher');
  app.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
    const scope = b.dataset.t ? {themen:[b.dataset.t]} : {fach:fid};
    if (b.dataset.m==='klausur'){ klausurVorwahl = fid; return go('#/klausur'); }
    startMode(b.dataset.m, scope);
  });
}
function startMode(mode, scope){
  if (mode==='klausur'){ klausurVorwahl = scope.fach || null; return go('#/klausur'); }
  const titel = {karten:'Karteikarten', quiz:'Multiple Choice', rechnen:'Rechenaufgaben'}[mode];
  startSession({titel, kinds: mode==='karten'?['K']:mode==='quiz'?['M']:['R'], scope, n: mode==='rechnen'?8:12});
}

/* ---------------- Übungs-Sitzung ---------------- */
// modus: undefined = normal · 'rennen' = 60 s Zeitrennen · 'leben' = 3 Leben · 'duell' = feste Fragen, beiEnde-Rückruf
function startSession(cfg){
  let items = [];
  const pool = einheitenIn(cfg.scope).filter(e=>cfg.kinds.includes(e.typ));
  if (pool.length){
    let cand = cfg.nurSchwach ? pool.filter(e=>S.box[e.id] && S.box[e.id].b<=2) : pool.filter(e=>isDue(e.id));
    if (cand.length < cfg.n && !cfg.nurSchwach) cand = cand.concat(shuffle(pool.filter(e=>!cand.includes(e))).sort((a,b)=>boxOf(a.id)-boxOf(b.id)));
    cand = shuffle(cand).sort((a,b)=>boxOf(a.id)-boxOf(b.id));
    items = cand.slice(0, cfg.n).map(e=>({kind:e.typ, e}));
  }
  const gens = cfg.kinds.includes('R') ? rechenIn(cfg.scope) : [];
  if (gens.length){
    const anzahl = cfg.kinds.length===1 ? cfg.n : Math.max(2, Math.round(cfg.n/5));
    for (let i=0;i<anzahl;i++) items.push({kind:'R', r:aufgabe(pick(gens))});
    if (cfg.kinds.length>1) items = shuffle(items);
  }
  if (!items.length){ toast('Hier gibt es gerade nichts zu üben.'); return; }
  items.forEach(it=>{ if (it.e) delete it.e._order; });
  session = {titel:cfg.titel, items, i:0, richtig:0, xp:0, combo:0, cfg};
  go('#/uebung');
}
/* Spielmodi: endlose Fragenfolge aus Multiple Choice + Rechnen */
function spielItem(stufe){
  const pool = D.einheiten.filter(e=>e.typ==='M' && (e.punkte||2) <= 2 + stufe);
  const gens = rechenIn({});
  if (gens.length && zufall() < .3) return {kind:'R', r:aufgabe(pick(gens))};
  const e = pick(pool.length ? pool : D.einheiten.filter(e=>e.typ==='M')); delete e._order; return {kind:'M', e};
}
function startSpiel(modus){
  const titel = modus==='rennen' ? 'Zeitrennen' : '3 Leben';
  session = {titel, modus, items:[spielItem(0), spielItem(0)], i:0, richtig:0, xp:0, combo:0, leben:3, cfg:{modus},
    ende: modus==='rennen' ? Date.now() + 60000 : 0};
  go('#/uebung');
}
function nachfuellen(){ const s=session; if (!s.modus || s.modus==='duell') return; while (s.items.length < s.i + 2) s.items.push(spielItem(Math.min(2, Math.floor(s.richtig/6)))); }
let rennT = null;
function rennenTick(){
  const el=$('#rt'); if (!session || session.modus!=='rennen'){ clearInterval(rennT); rennT=null; return; }
  const rest = Math.max(0, session.ende - Date.now()); const sek = Math.ceil(rest/1000);
  if (el){ el.textContent = sek + ' s'; el.classList.toggle('low', rest < 10000); const b=$('#rbar'); if (b) b.style.width = (rest/600)+'%'; }
  if (rest < 10000 && rest > 0 && sek !== session.letzteSek){ session.letzteSek = sek; FX.ton('tick'); }
  if (!rest){ clearInterval(rennT); rennT=null; FX.ton('ende'); renderSessionEnd(); }
}
function sessionTop(){
  const s=session;
  const quit = `<button class="btn ghost" id="quit" aria-label="Übung beenden">${ICON.x}</button>`;
  if (s.modus==='rennen') return `<div class="sbar">${quit}<div class="bar"><i id="rbar" style="width:100%;background:var(--its1)"></i></div><span class="timer" id="rt">60 s</span>${comboChip()}<span class="chip" title="Richtige">${ICON.ok}<b id="rpkt">${s.richtig}</b></span></div>`;
  if (s.modus==='leben') return `<div class="sbar">${quit}<div class="herzen" id="herzen">${[0,1,2].map(k=>`<i class="${k<s.leben?'':'leer'}">${ICON.heart}</i>`).join('')}</div><span style="flex:1"></span>${comboChip()}<span class="chip">Frage <b>${s.i+1}</b></span></div>`;
  const p=Math.round(s.i/s.items.length*100);
  return `<div class="sbar">${quit}<div class="bar" aria-label="Fortschritt"><i style="width:${p}%"></i></div><span class="mono small">${Math.min(s.i+1,s.items.length)}/${s.items.length}</span>${comboChip()}</div>`;
}
function qhead(e, extra=''){
  const t=themaOf(e.thema), f=fachOfThema(e.thema);
  return `<div class="qhead"><span class="tag"><span class="dot" style="background:var(--${f.farbe})"></span>${f.name} · ${esc(t.name)}</span><span class="tag">${e.punkte||2} Punkte</span>${extra}</div>`;
}
const srcHtml = q => `<div class="src">${ICON.book}<span>Quelle: ${esc(q)}</span></div>`;
function renderSession(){
  const s = session; if (!s) return go('#/');
  nachfuellen();
  if (s.i >= s.items.length) return renderSessionEnd();
  const it = s.items[s.i];
  app.innerHTML = `<div class="session">${sessionTop()}<div id="q" class="rein"></div></div>`;
  $('#quit').onclick = () => { if (s.modus==='duell' && !confirm('Runde abbrechen? Du kannst sie später weiterspielen.')) return; session=null; go(s.modus==='duell' ? '#/duell' : '#/'); };
  if (s.modus==='rennen'){ if (!rennT) rennT = setInterval(rennenTick, 250); rennenTick(); }
  if (it.kind==='K') renderK(it.e); else if (it.kind==='M') renderM(it.e, false); else renderR(it.r, false);
}
function next(){ if (!session) return; session.i++; renderSession(); }
/* Gemeinsame Auswertung einer Antwort in der Übung */
function antwort(ok, el, xp, box){
  const s = session;
  if (ok){ const bonus = treffer(el); xp += bonus; } else { fehler(box); }
  s.xp += xp; addXP(xp, el); comboNeu();
  if (s.modus==='duell' && s.beiAntwort) s.beiAntwort(s.i, ok);
  if (s.modus==='rennen'){ const r=$('#rpkt'); if (r) r.textContent = s.richtig; setTimeout(()=>{ if (session===s && s.modus==='rennen' && Date.now()<s.ende) next(); }, ok?550:1300); return 'auto'; }
  if (s.modus==='leben' && !ok){
    s.leben--; const h = $('#herzen'); if (h){ const i = h.children[s.leben]; if (i){ i.classList.add('leer','platzt'); } }
    if (s.leben <= 0){ setTimeout(()=>{ if (session===s){ FX.ton('ende'); renderSessionEnd(); } }, 1400); return 'auto'; }
  }
}
function renderK(e){
  $('#q').innerHTML = `${qhead(e)}
  <div class="card3d" id="card"><div class="card-in" id="cin">
    <div class="face"><div class="eyebrow">Frage</div><div class="q">${md(e.frage)}</div><div class="hint">Erst selbst antworten (laut oder im Kopf), dann umdrehen. <span class="mono">Leertaste</span></div></div>
    <div class="face back-face"><div class="eyebrow">Musterlösung</div><div class="answer">${md(e.antwort)}</div>${window.GFX?GFX.bild(e):''}${srcHtml(e.quelle)}</div>
  </div></div>
  <div id="act" class="row" style="margin-top:16px"><button class="btn primary" id="flip" style="flex:1">Umdrehen</button></div>`;
  const cin=$('#cin'); requestAnimationFrame(()=>{ const h=Math.max(...[...cin.children].map(c=>c.scrollHeight)); cin.style.minHeight=Math.max(300,h)+'px'; });
  const flip = () => { FX.ton('tick'); $('#card').classList.add('flip'); $('#act').outerHTML = `<div class="rate" id="act">
      <button class="btn no" data-r="0">Nicht gewusst<small>kommt gleich wieder · 1</small></button>
      <button class="btn mid" data-r="1">Teilweise<small>bald wieder · 2</small></button>
      <button class="btn yes" data-r="2">Gewusst<small>später wieder · 3</small></button></div>`;
    document.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>rateK(e,+b.dataset.r,b)); };
  $('#flip').onclick = flip; $('#card').onclick = () => { if(!$('#card').classList.contains('flip')) flip(); };
  keyHandler = (k) => { if (k===' ' && !$('#card').classList.contains('flip')) { flip(); return true; } if ($('#card').classList.contains('flip') && ['1','2','3'].includes(k)) { const b=document.querySelector('[data-r="'+(+k-1)+'"]'); rateK(e,+k-1,b); return true; } };
}
function rateK(e, r, el){
  if (!session || session.gesperrt) return; session.gesperrt = true;
  rateItem(e.id, r===2, r===1);
  if (r===1){ session.xp += 5; addXP(5, el); }
  else antwort(r===2, el, r===2?10:2, $('#card'));
  if (r===0) { // später in dieser Sitzung noch einmal
    const pos = Math.min(session.items.length, session.i + 4); session.items.splice(pos, 0, {kind:'K', e, wdh:true});
  }
  setTimeout(()=>{ if (session){ session.gesperrt = false; next(); } }, r===2 ? 380 : 120);
}
function renderM(e, examMode){
  const richtige = e.optionen.filter(o=>o[1]).length; const mehr = e.mehrfach || richtige>1;
  const opts = (e._order ||= shuffle(e.optionen.map((o,i)=>i)));
  const target = examMode ? $('#eq') : $('#q');
  target.innerHTML = `${qhead(e, mehr?'<span class="tag" style="color:var(--accent)">mehrere richtig</span>':'')}
  <div class="panel qbox" id="qbox"><div class="q">${md(e.frage)}</div>
  <div class="opts" role="${mehr?'group':'radiogroup'}">${opts.map((oi,k)=>`<button class="opt ${mehr?'':'round'}" data-o="${oi}" aria-pressed="false" style="--k:${k}"><span class="box">${'ABCDE'[k]}</span><span>${md(e.optionen[oi][0])}</span></button>`).join('')}</div>
  <div id="mfb"></div></div>
  <div class="row" style="margin-top:16px"><button class="btn primary" id="check" style="flex:1" disabled>${examMode?'Antwort speichern':'Prüfen'}</button></div>`;
  const sel = new Set(examMode && exam.ant[exam.i] ? exam.ant[exam.i] : []);
  const paint = () => { target.querySelectorAll('.opt').forEach(b=>{ const on=sel.has(+b.dataset.o); b.classList.toggle('sel',on); b.setAttribute('aria-pressed',on); }); $('#check').disabled = !sel.size; };
  // Im Zeitrennen reicht bei Einfachauswahl ein Klick
  const sofort = !examMode && session && session.modus==='rennen' && !mehr;
  target.querySelectorAll('.opt').forEach(b => b.onclick = () => { const o=+b.dataset.o; if (mehr){ sel.has(o)?sel.delete(o):sel.add(o); } else { sel.clear(); sel.add(o); } paint(); if (sofort) $('#check').click(); });
  paint();
  $('#check').onclick = () => {
    if (examMode){ exam.ant[exam.i] = [...sel]; examNext(); return; }
    if (target.dataset.fertig) return; target.dataset.fertig = '1';
    const ok = e.optionen.every((o,i)=>o[1]===sel.has(i));
    target.querySelectorAll('.opt').forEach(b=>{ const i=+b.dataset.o, o=e.optionen[i]; b.disabled=true; b.classList.remove('sel');
      if (o[1] && sel.has(i)) b.classList.add('right'); else if (!o[1] && sel.has(i)) b.classList.add('wrong'); else if (o[1]) b.classList.add('miss');
      if (o[2] && session.modus!=='rennen') b.insertAdjacentHTML('beforeend', `<span class="why">${md(o[2])}</span>`); });
    $('#mfb').innerHTML = `<div class="feedback ${ok?'ok':'bad'} pop">${ok?ICON.ok+pick(LOB):ICON.x+'Nicht ganz – schau dir die Erklärungen an.'}</div>${session.modus==='rennen'?'':(window.GFX?GFX.bild(e):'')+srcHtml(e.quelle)}`;
    rateItem(e.id, ok, false);
    const treff = target.querySelector('.opt.right') || $('#check');
    const auto = antwort(ok, treff, ok?10:2, $('#qbox'));
    if (!ok && !session.modus){ const pos=Math.min(session.items.length, session.i+5); session.items.splice(pos,0,{kind:'M',e,wdh:true}); }
    const b=$('#check'); if (auto){ b.remove(); return; } b.textContent='Weiter'; b.disabled=false; b.onclick=next; b.focus();
  };
  keyHandler = (k) => { if (/^[1-5]$/.test(k)) { const btn=target.querySelectorAll('.opt')[+k-1]; if (btn && !btn.disabled) btn.click(); return true; } if (k==='Enter' && !$('#check').disabled) { $('#check').click(); return true; } };
}
const LOB = ['Richtig!','Stark!','Genau so!','Sitzt!','Volltreffer!','Sauber!'];
function renderR(r, examMode){
  const target = examMode ? $('#eq') : $('#q');
  const f = fachOfThema(r.thema), t = themaOf(r.thema);
  target.innerHTML = `<div class="qhead"><span class="tag"><span class="dot" style="background:var(--${f.farbe})"></span>${f.name} · ${esc(t.name)}</span><span class="tag">${esc(r.name)}</span><span class="tag">${r.punkte} Punkte</span></div>
  <div class="panel qbox" id="qbox"><div class="q">${r.frage}</div>${r.zeige?`<div class="big-num">${r.zeige}</div>`:''}
  <label class="small muted" for="rin" style="display:block;margin:12px 0 6px">Deine Antwort</label>
  <input class="inp" id="rin" autocomplete="off" spellcheck="false" placeholder="${esc(r.eingabe||'Ergebnis eingeben')}" value="${examMode && exam.ant[exam.i]!=null ? esc(exam.ant[exam.i]) : ''}">
  <div id="rfb"></div></div>
  <div class="row" style="margin-top:16px"><button class="btn primary" id="check" style="flex:1">${examMode?'Antwort speichern':'Prüfen'}</button>${examMode?'':'<button class="btn" id="skip">'+(session && session.modus ? 'Weiß ich nicht' : 'Lösungsweg zeigen')+'</button>'}</div>`;
  const inp=$('#rin'); setTimeout(()=>inp.focus(),50);
  const zeige = (ok) => {
    if (inp.disabled) return;
    inp.classList.add(ok?'ok':'bad'); inp.disabled=true;
    $('#rfb').innerHTML = `<div class="feedback ${ok?'ok':'bad'} pop">${ok?ICON.ok+pick(LOB):ICON.x+'Lösung: <span class="mono" style="margin-left:6px">'+esc(r.loesung)+'</span>'}</div>
      ${session.modus==='rennen'?'':`<details class="steps" ${ok?'':'open'}><summary>Rechenweg Schritt für Schritt</summary><div class="steps-body">${r.schritte}</div></details>`}`;
    if (ok && r.key) S.stat.rechnen[r.key] = (S.stat.rechnen[r.key]||0) + 1;
    const auto = antwort(ok, inp, ok?15:3, $('#qbox'));
    const b=$('#check'); const sk=$('#skip'); if (sk) sk.remove();
    if (auto){ b.remove(); return; } b.textContent='Weiter'; b.onclick=next; b.focus();
  };
  $('#check').onclick = () => { if (examMode){ exam.ant[exam.i]=inp.value; examNext(); return; } if (inp.disabled) return next(); if (!inp.value.trim()) { inp.focus(); return; } zeige(!!r.check(inp.value)); };
  const sk=$('#skip'); if (sk) sk.onclick = () => zeige(false);
  inp.addEventListener('keydown', ev => { if (ev.key==='Enter'){ ev.preventDefault(); $('#check').click(); } });
  keyHandler = null;
}
function renderSessionEnd(){
  const s=session; if (!s) return;
  if (s.beiEnde){ const f = s.beiEnde; session = null; return f(s); }
  clearInterval(rennT); rennT = null; keyHandler = null;
  const gespielt = s.modus ? s.i + (s.modus==='leben' ? 1 : 0) : s.items.length;
  let rekord = false, zeile = '';
  if (s.modus==='rennen'){ rekord = s.richtig > S.stat.rennenBest; if (rekord) S.stat.rennenBest = s.richtig; zeile = 'Bestwert: '+S.stat.rennenBest+' richtige in 60 s'; }
  if (s.modus==='leben'){ rekord = s.richtig > S.stat.lebenBest; if (rekord) S.stat.lebenBest = s.richtig; zeile = 'Bestwert: '+S.stat.lebenBest+' richtige mit 3 Leben'; }
  if (s.modus){ save(); abzeichenPruefen(); }
  const n = Math.max(1, gespielt); const p = Math.round(s.richtig/n*100);
  app.innerHTML = `<div class="session"><div class="panel end pop">
    <div class="eyebrow">${esc(s.titel)} ${s.modus?'vorbei':'geschafft'}</div>
    ${rekord && s.richtig ? '<div class="rekord">Neuer Rekord!</div>' : ''}
    <div class="big"><span id="endN">0</span><span class="muted" style="font-size:.45em"> ${s.modus?'richtige':'/ '+n}</span></div>
    <p class="muted">${s.modus ? zeile : 'richtig beantwortet'} · <b style="color:var(--accent)">+<span id="endXP">0</span> XP</b></p>
    <div class="row" style="justify-content:center"><button class="btn primary" id="again">${ICON.bolt}Noch eine Runde</button><button class="btn" id="home">Zur Übersicht</button></div>
  </div></div>`;
  FX.hochzaehlen($('#endN'), s.richtig); FX.hochzaehlen($('#endXP'), s.xp, 900);
  if (rekord && s.richtig){ FX.ton('level'); konfetti(160); } else if (p>=80 && s.richtig){ konfetti(110); }
  $('#again').onclick = () => s.modus ? startSpiel(s.modus) : startSession(s.cfg); $('#home').onclick = () => { session=null; go('#/'); };
  session = null;
}
let keyHandler = null;
document.addEventListener('keydown', ev => {
  if (!keyHandler) return; const tag=(ev.target.tagName||'').toLowerCase(); if (tag==='input'||tag==='textarea') return;
  if (keyHandler(ev.key)) ev.preventDefault();
});

/* ---------------- Klausur ---------------- */
let klausurVorwahl = null;
const NOTEN = [[92,1,'sehr gut'],[81,2,'gut'],[67,3,'befriedigend'],[50,4,'ausreichend'],[30,5,'mangelhaft'],[0,6,'ungenügend']];
const note = p => NOTEN.find(n=>p>=n[0]);
function viewKlausurSetup(){
  const fs = D.faecher.filter(f=>!f.bald);
  let fach = klausurVorwahl && fs.find(f=>f.id===klausurVorwahl) ? klausurVorwahl : fs[0].id; let laenge = 40;
  const draw = () => {
    const th = D.themen.filter(t=>t.fach===fach);
    app.innerHTML = `<button class="btn ghost back" id="bk">${ICON.back}Zurück</button>
    <div style="margin-top:12px"><div class="eyebrow">Klausur-Simulation</div><h1>Probe-Klausur</h1><p class="muted" style="margin-top:6px">Wie in der echten Klausur: erst am Ende gibt es die Auswertung – mit Note nach IHK-Schlüssel.</p></div>
    <div class="panel setup" style="margin-top:18px">
      <div><div class="eyebrow" style="margin-bottom:8px">Fach</div><div class="seg" id="segF">${fs.map(f=>`<button aria-pressed="${f.id===fach}" data-f="${f.id}">${f.name}</button>`).join('')}</div></div>
      <div><div class="eyebrow" style="margin-bottom:8px">Themen der Klausur</div><div class="checks">${th.map(t=>`<label class="check"><input type="checkbox" checked value="${t.id}"><span>${esc(t.name)}</span></label>`).join('')}</div></div>
      <div><div class="eyebrow" style="margin-bottom:8px">Umfang</div><div class="seg" id="segL">${[[20,'Kurz · 20 Punkte · 15 min'],[40,'Normal · 40 Punkte · 30 min'],[60,'Lang · 60 Punkte · 45 min']].map(([v,l])=>`<button aria-pressed="${v===laenge}" data-l="${v}">${l}</button>`).join('')}</div></div>
      <button class="btn primary" id="start">${ICON.exam}Klausur starten</button>
    </div>`;
    $('#bk').onclick = () => go(klausurVorwahl ? '#/fach/'+klausurVorwahl : '#/');
    app.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{fach=b.dataset.f; draw();});
    app.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{laenge=+b.dataset.l; app.querySelectorAll('[data-l]').forEach(x=>x.setAttribute('aria-pressed', x===b));});
    $('#start').onclick = () => { const themen=[...app.querySelectorAll('.checks input:checked')].map(i=>i.value); if(!themen.length){toast('Wähle mindestens ein Thema.');return;} startExam(fach, themen, laenge); };
  };
  draw();
}
function startExam(fach, themen, ziel){
  const pool = shuffle(einheitenIn({themen})).sort((a,b)=>boxOf(a.id)-boxOf(b.id) + (Math.random()-.5)*3);
  const gens = rechenIn({themen}); const aufg = []; let pkt = 0;
  const anteilR = gens.length ? Math.max(1, Math.round(ziel/15)) : 0;
  for (let i=0;i<anteilR;i++){ const r=aufgabe(pick(gens)); aufg.push({kind:'R', r}); pkt+=r.punkte; }
  for (const e of pool){ if (pkt >= ziel) break; aufg.push({kind:e.typ, e}); pkt += e.punkte||2; }
  pool.forEach(e=>delete e._order);
  exam = {titel: fachOf(fach).name + ' · ' + (themen.length===1?themaOf(themen[0]).name:themen.length+' Themen'), aufg:shuffle(aufg), i:0, ant:[], selbst:[], max:pkt, ende: Date.now() + Math.round(ziel*0.75)*60000, themen};
  go('#/pruefung');
}
let timerT = null; function stopTimer(){ clearInterval(timerT); timerT=null; }
function renderExam(){
  const x = exam; if (!x) return go('#/');
  if (x.i >= x.aufg.length) return finishExam();
  const it = x.aufg[x.i];
  app.innerHTML = `<div class="session"><div class="sbar"><button class="btn ghost" id="quit" aria-label="Klausur abbrechen">${ICON.x}</button><div class="dots" style="flex:1">${x.aufg.map((a,k)=>`<i class="${k<x.i?'done':''} ${k===x.i?'cur':''}"></i>`).join('')}</div><span class="timer" id="tm"></span></div><div id="eq"></div></div>`;
  $('#quit').onclick = () => { if (confirm('Klausur abbrechen? Die Antworten gehen verloren.')){ exam=null; stopTimer(); go('#/'); } };
  if (!timerT) timerT = setInterval(tick, 1000); tick();
  if (it.kind==='M') renderM(it.e, true);
  else if (it.kind==='R') renderR(it.r, true);
  else renderExamK(it.e);
}
function tick(){ const el=$('#tm'); if(!exam) return stopTimer(); const rest=Math.max(0, exam.ende-Date.now()); const m=Math.floor(rest/60000), s=Math.floor(rest%60000/1000); if (el){ el.textContent=m+':'+String(s).padStart(2,'0'); el.classList.toggle('low', rest<120000); } if (!rest){ stopTimer(); toast('Zeit ist um!'); finishExam(); } }
function renderExamK(e){
  $('#eq').innerHTML = `${qhead(e)}<div class="panel qbox"><div class="q">${md(e.frage)}</div>
  <label class="small muted" for="ta" style="display:block;margin:14px 0 6px">Deine Antwort (Stichpunkte reichen)</label>
  <textarea class="inp" id="ta" placeholder="Schreibe deine Antwort wie in der Klausur …">${esc(exam.ant[exam.i]||'')}</textarea>
  <div id="kfb"></div></div>
  <div class="row" style="margin-top:16px"><button class="btn primary" id="show" style="flex:1">Mit Musterlösung vergleichen</button></div>`;
  $('#show').onclick = () => {
    exam.ant[exam.i] = $('#ta').value; $('#ta').disabled = true;
    $('#kfb').innerHTML = `<div class="panel" style="margin-top:14px;padding:16px;background:var(--surface-2);box-shadow:none"><div class="eyebrow">Musterlösung</div><div class="answer" style="margin-top:6px">${md(e.antwort)}</div>${window.GFX?GFX.bild(e):''}${srcHtml(e.quelle)}</div>
    <p class="small muted" style="margin-top:12px">Bewerte ehrlich – wie ein Lehrer:</p>
    <div class="rate"><button class="btn no" data-p="0">0 Punkte<small>nicht getroffen</small></button><button class="btn mid" data-p="0.5">${de((e.punkte||2)/2,1)} Punkte<small>teilweise</small></button><button class="btn yes" data-p="1">${e.punkte||2} Punkte<small>vollständig</small></button></div>`;
    $('#show').remove();
    document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ exam.selbst[exam.i]=+b.dataset.p; examNext(); });
  };
  keyHandler = null;
}
function examNext(){ exam.i++; renderExam(); }
function finishExam(){
  stopTimer(); const x = exam; if (!x) return;
  let pkt = 0; const fehler = []; const proThema = {};
  x.aufg.forEach((a,k) => {
    let got = 0, max = a.kind==='R' ? a.r.punkte : (a.e.punkte||2);
    if (a.kind==='M'){ const sel=new Set(x.ant[k]||[]); const ok=a.e.optionen.every((o,i)=>o[1]===sel.has(i)); got = ok?max:0; rateItem(a.e.id, ok, false); if(!ok) fehler.push(a); }
    else if (a.kind==='R'){ const ok = x.ant[k]!=null && a.r.check(x.ant[k]); got = ok?max:0; if(!ok) fehler.push(a); }
    else { const s = x.selbst[k] ?? 0; got = max*s; rateItem(a.e.id, s===1, s===0.5); if (s<1) fehler.push(a); }
    pkt += got; const tid = a.kind==='R'?a.r.thema:a.e.thema; proThema[tid] = proThema[tid]||[0,0]; proThema[tid][0]+=got; proThema[tid][1]+=max;
  });
  const prozent = Math.round(pkt/x.max*100); const n = note(prozent); if (n[1]===1) S.stat.einsen++;
  S.klausuren.push({titel:x.titel, datum:new Date().toLocaleDateString('de-DE'), punkte:+pkt.toFixed(1), max:x.max, prozent, note:n[1]});
  if (S.klausuren.length>30) S.klausuren.shift();
  logEintrag('klausur', 'Probe-Klausur ' + x.titel + ': Note ' + n[1]);
  addXP(prozent>=50 ? 50 : 15);
  exam = null;
  app.innerHTML = `<div class="session">
  <div class="panel result-top pop" style="margin-top:24px">
    <div class="gradebig" style="background:${notenFarbe(n[1])}"><div><b>${n[1]}</b><small>${n[2]}</small></div></div>
    <div class="stack" style="gap:8px"><div class="eyebrow">Auswertung · ${esc(x.titel)}</div><h2>${de(pkt,1)} von ${x.max} Punkten · ${prozent} %</h2>
      <p class="muted small">IHK-Schlüssel: ab 92 % sehr gut · 81 % gut · 67 % befriedigend · 50 % ausreichend · 30 % mangelhaft.</p></div>
  </div>
  <section class="section"><div class="section-head"><h2>Nach Themen</h2></div><div class="stack">${Object.entries(proThema).map(([tid,[g,m]])=>{const f=fachOfThema(tid); const p=Math.round(g/m*100); return `<div class="panel" style="padding:14px 16px;display:grid;gap:8px"><div class="row" style="justify-content:space-between"><b>${esc(themaOf(tid).name)}</b><span class="mono small">${de(g,1)}/${m} · ${p} %</span></div><div class="bar"><i style="width:${p}%;background:var(--${f.farbe})"></i></div></div>`;}).join('')}</div></section>
  ${fehler.length?`<section class="section"><div class="section-head"><h2>Das solltest du wiederholen</h2><button class="btn primary" id="uebeF">${ICON.target}Diese ${fehler.length} Aufgaben üben</button></div><div class="stack">${fehler.map(a=>a.kind==='R'?`<div class="panel mist"><b>${esc(a.r.name)}</b><div class="small muted">Aufgabe: ${a.r.zeige||''} · richtige Lösung: <span class="mono">${esc(a.r.loesung)}</span></div></div>`:`<div class="panel mist"><b>${md(a.e.frage)}</b><div class="answer small">${a.e.typ==='M'?'Richtig: '+a.e.optionen.filter(o=>o[1]).map(o=>md(o[0])).join(' · '):md(a.e.antwort)}</div>${srcHtml(a.e.quelle)}</div>`).join('')}</div></section>`:'<p style="margin-top:24px" class="muted">Keine Fehler – perfekt!</p>'}
  <div class="row" style="margin-top:26px"><button class="btn" id="home">Zur Übersicht</button><button class="btn" id="neu">${ICON.exam}Neue Klausur</button></div></div>`;
  if (prozent>=50) konfetti(prozent>=81?180:110);
  $('#home').onclick=()=>go('#/'); $('#neu').onclick=()=>go('#/klausur');
  const uf=$('#uebeF'); if (uf) uf.onclick = () => { const items = fehler.map(a=>a.kind==='R'?{kind:'R',r:aufgabe(a.r.key)}:{kind:a.e.typ==='M'?'M':'K',e:a.e}); items.forEach(i=>{ if(i.e) delete i.e._order; }); session={titel:'Fehler aus der Klausur', items, i:0, richtig:0, xp:0, cfg:{titel:'Schwächen trainieren', kinds:['K','M'], scope:{}, n:15, nurSchwach:true}}; go('#/uebung'); };
}

/* ---------------- Schnittstelle für konto.js / duell.js ---------------- */
Object.assign(window.LW, {
  logEintrag, D, ICON, esc, md, toast, go, route, header, save, addXP, level, streak, dayKey, fachOf, themaOf, rechenIn, aufgabe, shuffle, abzeichenPruefen,
  app: () => app,
  // Feste Fragenfolge spielen (Duell): items = [{kind:'M', e} | {kind:'R', r}]
  spielen(items, titel, beiAntwort, beiEnde){ items.forEach(it=>{ if (it.e) delete it.e._order; }); session = {titel, modus:'duell', items, i:0, richtig:0, xp:0, combo:0, cfg:{}, beiAntwort, beiEnde}; go('#/uebung'); },
});
if (window.GFX){ $('#logo').innerHTML = GFX.logo(); huelle(); } FX.hintergrund();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
route();
})();
