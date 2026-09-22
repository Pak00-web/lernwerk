/* Lernwerk – eigene Grafiken (Inline-SVG): Logo, Hintergrund-Symbole, Kachel-Illustrationen,
   Fach-Bilder, Medaillen, Erklär-Grafiken zu Lösungen. Farben kommen aus den CSS-Tokens. */
(function(){
"use strict";
const f = v => `style="fill:${v}"`, s = (v, w=2) => `style="stroke:${v};stroke-width:${w};fill:none;stroke-linecap:round;stroke-linejoin:round"`;
const txt = (x, y, t, o={}) => `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" style="fill:${o.c||'var(--ink)'};font:${o.w||600} ${o.s||13}px ${o.m?'var(--f-mono)':'var(--f-body)'}">${t}</text>`;

/* ---------- Logo: „L“ aus Bit-Blöcken mit Doktorhut ---------- */
const logo = () => `<svg class="logo-svg" viewBox="0 0 32 32" aria-hidden="true">
  <g class="logo-bloecke" style="fill:#FFE066">
    <rect x="7" y="9" width="5" height="5" rx="1.2" style="--i:0"/><rect x="7" y="15" width="5" height="5" rx="1.2" style="--i:1"/>
    <rect x="7" y="21" width="5" height="5" rx="1.2" style="--i:2"/><rect x="13" y="21" width="5" height="5" rx="1.2" style="--i:3"/>
    <rect x="19" y="21" width="5" height="5" rx="1.2" style="--i:4" opacity=".55"/>
  </g>
  <g class="logo-hut"><path d="M14 9.5 21 6l7 3.5-7 3.5z" style="fill:#FFE066"/><path d="M17.5 11.3v3.2c1 1 6 1 7 0v-3.2" ${s('#FFE066',1.6)}/><path d="M28 9.5v5" ${s('#FFE066',1.2)}/><circle cx="28" cy="15.3" r="1" style="fill:#FFE066"/></g>
</svg>`;
const icon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#14213D"/>${logo().replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`;

/* ---------- Hintergrund-Symbole (Linien, currentColor) ---------- */
const BG = [
  `<text x="12" y="17" text-anchor="middle" style="font:700 16px var(--f-mono);fill:currentColor">0</text>`,
  `<text x="12" y="17" text-anchor="middle" style="font:700 16px var(--f-mono);fill:currentColor">1</text>`,
  `<text x="12" y="16" text-anchor="middle" style="font:700 11px var(--f-mono);fill:currentColor">0x</text>`,
  `<path d="M9 4c-3 0-3 2-3 4s0 4-3 4c3 0 3 2 3 4s0 4 3 4M15 4c3 0 3 2 3 4s0 4 3 4c-3 0-3 2-3 4s0 4-3 4" ${s('currentColor',1.6)}/>`,
  `<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" ${s('currentColor',1.6)}/>`,
  `<rect x="5" y="11" width="14" height="9" rx="2" ${s('currentColor',1.6)}/><path d="M8 11V8a4 4 0 0 1 8 0v3" ${s('currentColor',1.6)}/>`,
  `<text x="12" y="18" text-anchor="middle" style="font:700 18px var(--f-body);fill:currentColor">§</text>`,
  `<circle cx="12" cy="12" r="3" ${s('currentColor',1.6)}/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" ${s('currentColor',1.6)}/>`,
  `<circle cx="12" cy="5" r="2.5" ${s('currentColor',1.5)}/><path d="M12 7.5v7M7 10h10M12 14.5l-4 6M12 14.5l4 6" ${s('currentColor',1.5)}/>`,
  `<ellipse cx="12" cy="12" rx="9" ry="5" ${s('currentColor',1.5)}/>`,
  `<path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5" ${s('currentColor',1.5)}/>`,
  `<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" ${s('currentColor',1.5)}/>`,
];

/* ---------- Kachel-Illustrationen (animiert über CSS) ---------- */
const kachel = {
  rennen: `<svg viewBox="0 0 64 64" class="ill ill-rennen"><circle cx="32" cy="36" r="20" style="fill:var(--surface);stroke:var(--sc);stroke-width:4"/><rect x="27" y="8" width="10" height="6" rx="2" style="fill:var(--sc)"/><path d="M48 18l4-4" ${s('var(--sc)',4)}/>
    ${[0,1,2,3,4,5,6,7,8,9,10,11].map(k=>`<path d="M32 19v3" transform="rotate(${k*30} 32 36)" ${s('var(--ink-3)',2)}/>`).join('')}
    <path class="zeiger" d="M32 36V22" ${s('var(--ink)',3)}/><circle cx="32" cy="36" r="3" style="fill:var(--sc)"/></svg>`,
  leben: `<svg viewBox="0 0 64 64" class="ill ill-leben">${[[12,34,.8],[32,28,1],[52,34,.8]].map(([x,y,g],k)=>`<g transform="translate(${x} ${y}) scale(${g})"><path class="herz" style="--i:${k};fill:var(--sc)" d="M0 12s-12-7-14-14c-1.6-5 1.6-10 6.5-10 3.3 0 5.6 2 7.5 4.6 1.9-2.6 4.2-4.6 7.5-4.6 4.9 0 8.1 5 6.5 10C12 5 0 12 0 12z"/></g>`).join('')}</svg>`,
  duell: `<svg viewBox="0 0 64 64" class="ill ill-duell"><g class="schwert l"><path d="M14 50 44 20" ${s('var(--ink-2)',4)}/><path d="M44 20l5-7-7 5" style="fill:var(--ink-2)"/><path d="M12 42l10 10" ${s('var(--sc)',4)}/><circle cx="10" cy="54" r="3" style="fill:var(--sc)"/></g>
    <g class="schwert r"><path d="M50 50 20 20" ${s('var(--ink-2)',4)}/><path d="M20 20l-5-7 7 5" style="fill:var(--ink-2)"/><path d="M52 42 42 52" ${s('var(--sc)',4)}/><circle cx="54" cy="54" r="3" style="fill:var(--sc)"/></g>
    <g class="funke" style="fill:var(--mark)"><circle cx="32" cy="30" r="2"/><circle cx="26" cy="26" r="1.3"/><circle cx="38" cy="25" r="1.3"/></g></svg>`,
  rangliste: `<svg viewBox="0 0 64 64" class="ill ill-rang"><defs><linearGradient id="glanz" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><clipPath id="pokalclip"><path d="M24 8h16v10a8 8 0 0 1-16 0z"/></clipPath></defs>
    <rect x="4" y="44" width="18" height="14" rx="2" style="fill:var(--surface-2)"/><rect x="23" y="36" width="18" height="22" rx="2" style="fill:var(--sc)"/><rect x="42" y="48" width="18" height="10" rx="2" style="fill:var(--surface-2)"/>
    ${txt(13,55,'2',{s:10,c:'var(--ink-2)',w:800})}${txt(32,50,'1',{s:12,c:'#fff',w:800})}${txt(51,56,'3',{s:9,c:'var(--ink-2)',w:800})}
    <path d="M24 8h16v10a8 8 0 0 1-16 0z" style="fill:#E6B422"/><path d="M24 11h-4a4 4 0 0 0 4 5M40 11h4a4 4 0 0 1-4 5M32 26v5M27 33h10" ${s('#E6B422',2.5)}/>
    <rect class="glanz" x="-14" y="6" width="10" height="24" style="fill:url(#glanz)" clip-path="url(#pokalclip)"/></svg>`,
};

/* ---------- Fach-Illustrationen ---------- */
const fach = {
  wbl: `<svg viewBox="0 0 64 64" class="ill ill-fach ill-wbl"><rect x="12" y="6" width="34" height="46" rx="4" style="fill:var(--surface);stroke:var(--wbl);stroke-width:2.5"/>${txt(29,30,'§',{s:22,c:'var(--wbl)',w:800})}<path d="M19 38h20M19 44h13" ${s('var(--ink-3)',2)}/><g class="stift"><path d="M40 56l14-22 5 3-14 22-6 2z" style="fill:var(--mark);stroke:var(--ink);stroke-width:1.5"/></g></svg>`,
  its1: `<svg viewBox="0 0 64 64" class="ill ill-fach ill-its"><path d="M32 5l21 8v15c0 14-9 23-21 27C20 51 11 42 11 28V13z" style="fill:color-mix(in srgb,var(--its1) 14%,var(--surface));stroke:var(--its1);stroke-width:2.5"/><g class="buegel"><path d="M25 30v-5a7 7 0 0 1 14 0v5" ${s('var(--its1)',3)}/></g><rect x="22" y="29" width="20" height="14" rx="3" style="fill:var(--its1)"/><circle cx="32" cy="35" r="2" style="fill:var(--surface)"/><path d="M32 36v3" ${s('var(--surface)',2)}/></svg>`,
  aew: `<svg viewBox="0 0 64 64" class="ill ill-fach ill-aew"><rect x="6" y="10" width="52" height="34" rx="4" style="fill:var(--surface);stroke:var(--aew);stroke-width:2.5"/><path d="M24 54h16M32 44v10" ${s('var(--aew)',2.5)}/><path d="m21 22-6 5 6 5M43 22l6 5-6 5M35 19l-6 16" ${s('var(--aew)',2.5)}/><rect class="cursor" x="45" y="35" width="6" height="2.5" style="fill:var(--ink)"/></svg>`,
  its2: `<svg viewBox="0 0 64 64" class="ill ill-fach"><rect x="10" y="12" width="44" height="14" rx="3" ${s('var(--its2)',2.5)}/><rect x="10" y="32" width="44" height="14" rx="3" ${s('var(--its2)',2.5)}/><circle cx="18" cy="19" r="2" style="fill:var(--its2)"/><circle cx="18" cy="39" r="2" style="fill:var(--its2)"/><path d="M32 46v8M22 54h20" ${s('var(--its2)',2.5)}/></svg>`,
  dk: `<svg viewBox="0 0 64 64" class="ill ill-fach"><path d="M10 14h32a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H24l-10 8v-8h-4a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" ${s('var(--dk)',2.5)}/><path d="M16 24h20M16 30h14" ${s('var(--dk)',2.5)}/></svg>`,
};

/* ---------- Heute-Szene: Laptop tippt, Bücher, Tasse dampft ---------- */
const szene = () => `<svg viewBox="0 0 180 120" class="szene" aria-hidden="true">
  <rect x="0" y="104" width="180" height="4" rx="2" style="fill:var(--line)"/>
  <g transform="translate(20 34)"><rect x="0" y="0" width="84" height="56" rx="5" style="fill:var(--ink)"/><rect x="5" y="5" width="74" height="46" rx="2" style="fill:var(--surface-2)"/>
    ${[[10,11,40,'var(--aew)'],[16,19,34,'var(--its1)'],[16,27,46,'var(--ink-3)'],[10,35,26,'var(--wbl)'],[10,43,50,'var(--ink-3)']].map(([x,y,w,c],k)=>`<rect class="zeile" x="${x}" y="${y}" width="${w}" height="3.5" rx="1.75" style="fill:${c};--i:${k}"/>`).join('')}
    <path d="M-8 60h100l-6 10H-2z" style="fill:var(--ink-2)"/></g>
  <g transform="translate(116 62)"><rect x="0" y="30" width="46" height="12" rx="2" style="fill:var(--wbl)"/><rect x="4" y="18" width="40" height="12" rx="2" style="fill:var(--aew)"/><rect x="-2" y="6" width="44" height="12" rx="2" style="fill:var(--its1)"/><path d="M4 12h30M8 24h30M6 36h30" ${s('rgba(255,255,255,.5)',1.5)}/></g>
  <g transform="translate(140 38)"><path d="M0 12h20v14a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6z" style="fill:var(--mark)"/><path d="M20 15h3a4 4 0 0 1 0 8h-3" ${s('var(--mark)',2.5)}/>
    ${[4,10,16].map((x,k)=>`<path class="dampf" style="--i:${k}" d="M${x} 8c-3-3 3-5 0-8" ${s('var(--ink-3)',1.8)}/>`).join('')}</g>
</svg>`;

/* ---------- Medaillen für Abzeichen ---------- */
const STUFE = {bronze:['#CD7F32','#8C5523'], silber:['#C3CCD6','#7D8A99'], gold:['#F2C94C','#B8860B']};
const SYM = {
  spross:`<path d="M0 8V-2M0 1c-5 0-7-4-7-8 4 0 7 3 7 8zM0-2c0-5 3-8 8-8 0 5-3 8-8 8z" ${s('#fff',2.2)}/>`,
  ziel:`<circle r="8" ${s('#fff',2.2)}/><circle r="4" ${s('#fff',2.2)}/><circle r="1.4" style="fill:#fff"/>`,
  pfeil:`<circle r="8" ${s('#fff',2.2)}/><circle r="3" style="fill:#fff"/><path d="M3-3 10-10M6-10h4v4" ${s('#fff',2.2)}/>`,
  lampe:`<path d="M-4 5h8M-3 9h6M-5 2c-3-2-4-5-4-8a9 9 0 0 1 18 0c0 3-1 6-4 8" ${s('#fff',2.2)}/>`,
  flamme:`<path d="M0-11c1 4 7 6 7 12a7 7 0 0 1-14 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 2-9z" style="fill:#fff"/>`,
  haken:`<circle r="9" ${s('#fff',2.2)}/><path d="m-4 0 3 3 6-6" ${s('#fff',2.6)}/>`,
  kette:`<rect x="-10" y="-4" width="11" height="8" rx="4" ${s('#fff',2.2)}/><rect x="-1" y="-4" width="11" height="8" rx="4" ${s('#fff',2.2)}/>`,
  blatt:`<path d="M-6-10h9l4 4v16h-13z" ${s('#fff',2.2)}/><path d="M-3-2h7M-3 3h7" ${s('#fff',2)}/>`,
  uhr:`<circle cy="1" r="9" ${s('#fff',2.2)}/><path d="M0-4v5l3 2M-3-10h6" ${s('#fff',2.2)}/>`,
  herz:`<path d="M0 9s-9-5-10-10c-1-4 1-7 5-7 2 0 4 1 5 3 1-2 3-3 5-3 4 0 6 3 5 7C9 4 0 9 0 9z" style="fill:#fff"/>`,
  hut:`<path d="M-11-2 0-8l11 6-11 6z" style="fill:#fff"/><path d="M-6 1v5c2 2 10 2 12 0V1M11-2v7" ${s('#fff',2)}/>`,
  schwerter:`<path d="M-9 9 7-7M9 9-7-7M-9 4l5 5M9 4 4 9" ${s('#fff',2.4)}/>`,
  krone:`<path d="M-10 6-11-7l6 5 5-8 5 8 6-5-1 13z" style="fill:#fff"/>`,
};
function medaille(stufe, sym, zahl, gross){
  const [c1, c2] = STUFE[stufe] || STUFE.bronze, id = 'm' + Math.random().toString(36).slice(2,8);
  const mitte = zahl != null ? `${SYM[sym] ? `<g transform="translate(0 -5) scale(.72)">${SYM[sym]}</g>` : ''}<text y="${SYM[sym]?11:6}" text-anchor="middle" style="fill:#fff;font:800 ${SYM[sym]?10:16}px var(--f-display)">${zahl}</text>` : (SYM[sym] || '');
  return `<svg viewBox="-32 -32 64 64" class="medaille ${gross?'gross':''}" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="${id}c"><circle r="22"/></clipPath></defs>
    <path d="M-12 14-18 30l7-3 4 6 5-16M12 14l6 16-7-3-4 6-5-16" style="fill:var(--aew)"/>
    <circle r="24" style="fill:url(#${id})"/><circle r="18.5" style="fill:${c2}"/><circle r="18.5" style="fill:none;stroke:rgba(255,255,255,.35);stroke-width:1.2"/>
    <g>${mitte}</g><rect class="m-glanz" x="-40" y="-30" width="12" height="60" transform="rotate(20)" style="fill:rgba(255,255,255,.35)" clip-path="url(#${id}c)"/></svg>`;
}
const gesperrt = () => `<svg viewBox="-32 -32 64 64" class="medaille zu" aria-hidden="true"><circle r="24" style="fill:var(--surface-2);stroke:var(--line);stroke-width:2"/><rect x="-8" y="-2" width="16" height="12" rx="2.5" ${s('var(--ink-3)',2.2)}/><path d="M-5-2v-4a5 5 0 0 1 10 0v4" ${s('var(--ink-3)',2.2)}/></svg>`;
const platz = n => n > 3 ? '' : `<svg viewBox="-16 -16 32 32" class="platz-svg"><circle r="13" style="fill:${['#F2C94C','#C3CCD6','#CD7F32'][n-1]}"/><circle r="10" style="fill:none;stroke:rgba(255,255,255,.5);stroke-width:1.2"/>${n===1?`<path d="M-7 5-8-5l4 3 4-6 4 6 4-3-1 10z" style="fill:#fff" transform="translate(0 -1) scale(.8)"/>`:`<text y="5" text-anchor="middle" style="fill:#fff;font:800 13px var(--f-display)">${n}</text>`}</svg>`;

/* ---------- Erklär-Grafiken zu Lösungen ---------- */
const box = (x, y, w, h, c, t, u) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" style="fill:color-mix(in srgb,${c} 13%,var(--surface));stroke:${c};stroke-width:2"/>${txt(x+w/2, y+(u?h/2-2:h/2+5), t, {w:800, s:14, c})}${u?txt(x+w/2, y+h/2+15, u, {s:11.5, c:'var(--ink-2)', w:400}):''}`;
const pfeil = (x1, y1, x2, y2, c='var(--ink-3)', gestr) => { const id='p'+Math.random().toString(36).slice(2,7); return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" style="fill:${c}"/></marker></defs><path d="M${x1} ${y1} L${x2} ${y2}" style="stroke:${c};stroke-width:2;fill:none${gestr?';stroke-dasharray:6 5':''}" marker-end="url(#${id})"/>`; };
const B = {
  dual: () => `<svg viewBox="0 0 520 200">
    ${box(10,20,170,74,'var(--wbl)','Betrieb','Praxis · Fertigkeiten')}${box(340,20,170,74,'var(--aew)','Berufsschule','Theorie · Allgemeinbildung')}
    <circle cx="260" cy="57" r="30" style="fill:var(--mark)"/>${txt(260,62,'Azubi',{w:800,c:'var(--mark-ink)'})}
    ${pfeil(182,57,226,57,'var(--wbl)')}${pfeil(338,57,294,57,'var(--aew)')}
    ${box(150,128,220,56,'var(--ink-3)','Überbetriebliche Stätte','ergänzt, was der Betrieb nicht kann')}${pfeil(260,126,260,90,'var(--ink-3)',true)}</svg>`,
  cia: () => `<svg viewBox="0 0 520 250"><path d="M260 28 430 214H90z" style="fill:color-mix(in srgb,var(--its1) 8%,var(--surface));stroke:var(--its1);stroke-width:2.5;stroke-linejoin:round"/>
    ${txt(260,150,'Schutzziele',{w:800,s:15,c:'var(--its1)'})}${txt(260,168,'der IT-Sicherheit',{s:12,c:'var(--ink-2)',w:400})}
    <circle cx="260" cy="28" r="16" style="fill:var(--its1)"/>${txt(260,33,'C',{w:800,c:'#fff',s:14})}${txt(290,24,'Vertraulichkeit',{a:'start',w:800})}${txt(290,40,'nur Befugte sehen die Daten',{a:'start',s:11.5,c:'var(--ink-2)',w:400})}
    <circle cx="90" cy="214" r="16" style="fill:var(--its1)"/>${txt(90,219,'I',{w:800,c:'#fff',s:14})}${txt(10,244,'Integrität: richtig und unverändert',{a:'start',s:11.5,c:'var(--ink-2)',w:400})}
    <circle cx="430" cy="214" r="16" style="fill:var(--its1)"/>${txt(430,219,'A',{w:800,c:'#fff',s:14})}${txt(510,244,'Verfügbarkeit: da, wenn man sie braucht',{a:'end',s:11.5,c:'var(--ink-2)',w:400})}</svg>`,
  lastpflicht: () => `<svg viewBox="0 0 520 170">
    <path d="M20 20h150l20 20v110H20z" style="fill:color-mix(in srgb,var(--its1) 10%,var(--surface));stroke:var(--its1);stroke-width:2"/>${txt(105,58,'Lastenheft',{w:800,s:15,c:'var(--its1)'})}${txt(105,84,'Auftraggeber (Kunde)',{s:12,c:'var(--ink-2)',w:400})}${txt(105,120,'WAS?',{w:800,s:22})}
    ${pfeil(200,85,316,85,'var(--ink-3)')}${txt(258,74,'wird zu',{s:11.5,c:'var(--ink-3)',w:400})}
    <path d="M330 20h150l20 20v110H330z" style="fill:color-mix(in srgb,var(--aew) 10%,var(--surface));stroke:var(--aew);stroke-width:2"/>${txt(415,58,'Pflichtenheft',{w:800,s:15,c:'var(--aew)'})}${txt(415,84,'Auftragnehmer (Entwickler)',{s:12,c:'var(--ink-2)',w:400})}${txt(415,120,'WIE?',{w:800,s:22})}</svg>`,
  usecase: () => `<svg viewBox="0 0 520 230"><circle cx="46" cy="70" r="12" ${s('var(--ink)',2)}/><path d="M46 82v40M24 96h44M46 122l-18 30M46 122l18 30" ${s('var(--ink)',2)}/>${txt(46,172,'Akteur',{s:12})}
    <rect x="120" y="14" width="390" height="206" rx="6" ${s('var(--ink-3)',2)}/>${txt(500,34,'Systemgrenze',{a:'end',s:11.5,c:'var(--ink-3)',w:400})}
    <ellipse cx="205" cy="80" rx="70" ry="26" style="fill:color-mix(in srgb,var(--aew) 12%,var(--surface));stroke:var(--aew);stroke-width:2"/>${txt(205,85,'Einloggen',{s:13})}
    <ellipse cx="425" cy="80" rx="76" ry="26" style="fill:var(--surface);stroke:var(--aew);stroke-width:2"/>${txt(425,85,'Passwort prüfen',{s:13})}
    <ellipse cx="205" cy="180" rx="84" ry="26" style="fill:var(--surface);stroke:var(--aew);stroke-width:2"/>${txt(205,178,'Konto erstellen',{s:13})}${txt(205,194,'{Kunde neu}',{s:11,c:'var(--ink-3)',w:400})}
    <path d="M60 100 140 84" ${s('var(--ink)',2)}/>${pfeil(277,80,345,80,'var(--aew)',true)}${txt(311,70,'«include»',{s:11,c:'var(--aew)'})}
    ${pfeil(205,153,205,108,'var(--its1)',true)}${txt(250,134,'«extend»',{s:11,c:'var(--its1)'})}</svg>`,
  zweier: () => { const z = [['Betrag 15','0000 1111'],['Bits umdrehen','1111 0000'],['+ 1','1111 0001']];
    return `<svg viewBox="0 0 520 150">${z.map(([a,b],k)=>`<rect x="${10+k*172}" y="30" width="156" height="80" rx="10" style="fill:${k===2?'color-mix(in srgb,var(--ok) 13%,var(--surface))':'var(--surface-2)'};stroke:${k===2?'var(--ok)':'var(--line)'};stroke-width:2"/>${txt(88+k*172,58,a,{s:12,c:'var(--ink-2)'})}${txt(88+k*172,88,b,{m:1,s:17,w:600})}${k<2?pfeil(168+k*172,70,180+k*172,70):''}`).join('')}${txt(260,138,'= −15 im Zweierkomplement (erstes Bit 1 → negativ)',{s:12.5,c:'var(--ok)',w:700})}</svg>`; },
  hexdual: () => `<svg viewBox="0 0 520 150">${['1010','1111'].map((b,k)=>`<rect x="${120+k*150}" y="20" width="130" height="46" rx="10" style="fill:var(--surface-2);stroke:var(--aew);stroke-width:2"/>${txt(185+k*150,50,b,{m:1,s:19})}${pfeil(185+k*150,70,185+k*150,94,'var(--aew)')}<rect x="${160+k*150}" y="98" width="50" height="40" rx="10" style="fill:var(--aew)"/>${txt(185+k*150,125,['A','F'][k],{m:1,s:20,c:'#fff',w:700})}`).join('')}${txt(60,50,'4 Bit',{s:13,c:'var(--ink-2)'})}${txt(60,124,'1 Hex',{s:13,c:'var(--ink-2)'})}</svg>`,
  division: () => { const r = []; let x = 171; while (x > 0){ r.push([x, Math.floor(x/2), x%2]); x = Math.floor(x/2); }
    return `<svg viewBox="0 0 520 ${40+r.length*26}">${r.map(([a,b,c],k)=>`${txt(150,30+k*26,a+' : 2 = '+b,{a:'end',m:1,s:14,w:400})}${txt(200,30+k*26,'Rest',{s:12,c:'var(--ink-3)',w:400})}<rect x="226" y="${14+k*26}" width="24" height="22" rx="5" style="fill:${c?'var(--mark)':'var(--surface-2)'}"/>${txt(238,30+k*26,c,{m:1,s:14,c:c?'var(--mark-ink)':'var(--ink)'})}`).join('')}
      ${pfeil(275,20+r.length*26-10,275,18,'var(--aew)')}${txt(290,24+r.length*13,'von unten nach oben lesen',{a:'start',s:12.5,c:'var(--aew)'})}${txt(290,44+r.length*13,'171 = 1010 1011',{a:'start',m:1,s:15,w:600})}</svg>`; },
};
// Dynamische Stellenwerttafel für Rechenaufgaben
function stellen(n, w=8){
  const b = (n>>>0).toString(2).padStart(w,'0').slice(-w), bw = 500/w;
  return `<svg viewBox="0 0 520 96" class="lern-grafik">${b.split('').map((c,k)=>{ const x = 10+k*bw, wert = Math.pow(2, w-1-k); return `<rect x="${x+2}" y="8" width="${bw-4}" height="36" rx="7" style="fill:${c==='1'?'var(--mark)':'var(--surface-2)'}"/>${txt(x+bw/2,32,wert,{s:13,c:c==='1'?'var(--mark-ink)':'var(--ink-3)',w:c==='1'?800:400})}<rect x="${x+2}" y="50" width="${bw-4}" height="36" rx="7" style="fill:none;stroke:${c==='1'?'var(--mark)':'var(--line)'};stroke-width:2"/>${txt(x+bw/2,74,c,{m:1,s:16,w:c==='1'?700:400})}`; }).join('')}</svg>`;
}
// Welche Einheit bekommt welche Erklär-Grafik
const ZUORDNUNG = {w1:'dual', w2:'dual', w3:'dual', i30:'cia', i31:'cia', i32:'cia', i33:'cia', i39:'cia', a1:'lastpflicht', a10:'lastpflicht', a22:'usecase', a23:'usecase', a24:'usecase', a25:'usecase', a27:'usecase', a69:'zweier', a70:'zweier', a68:'hexdual', a65:'division'};
function bild(e){ const k = e.bild || ZUORDNUNG[e.id]; return k && B[k] ? `<figure class="lern-grafik">${B[k]()}</figure>` : ''; }

window.GFX = {logo, icon, BG, kachel, fach, szene, medaille, gesperrt, platz, bild, stellen};
})();
