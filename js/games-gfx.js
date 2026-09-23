/* Lernwerk Games – eigene Grafiken (SVG, im Stil von grafik.js): Karten-Artwork, Spiel-Artworks, Booster, Münze, Bombe, Rangabzeichen.
   Alle Illustrationen sind hier selbst gezeichnet, keine fremden Bilder. */
(function(){
"use strict";
let uid = 0; const nid = p => p + (++uid);
const st = (c, w=1.6) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/* ---------- Fächer ---------- */
const FACH = {
  wbl:  {name:'WBL', farbe:'#2FCFA0', dunkel:'#0B3B33'},
  its1: {name:'ITS', farbe:'#FF8A5C', dunkel:'#40200F'},
  aew:  {name:'AEW', farbe:'#8B7BFF', dunkel:'#221C55'},
};
// Hintergrundmuster je Fach (in 100×80): WBL Warnstreifen, ITS Leiterbahnen, AEW Code-Raster
const MUSTER = {
  wbl: Array.from({length:9}, (_, i) => `<path d="M${-30 + i*16} 80 L${10 + i*16} 0" ${st('#fff', 5)} opacity=".05"/>`).join(''),
  its1: `<g ${st('#fff', 1.2)} opacity=".09"><path d="M0 18h22l8 8h18M100 60H74l-8-8H48M0 64h14l6-6h10M100 14H82l-6 6H62"/><circle cx="48" cy="26" r="2"/><circle cx="48" cy="52" r="2"/><circle cx="30" cy="58" r="2"/><circle cx="62" cy="20" r="2"/></g>`,
  aew: `<g fill="#fff" opacity=".08">${Array.from({length:40}, (_, i) => `<rect x="${6 + (i%10)*10}" y="${6 + Math.floor(i/10)*20}" width="${2 + (i*7)%5}" height="2" rx="1"/>`).join('')}</g>`,
};

/* ---------- Karten-Symbole (24×24, Linienstil) ---------- */
const H = '#EAF0FF';
const figur = (x='') => `<circle cx="12" cy="8" r="3.6" ${st(H)}/><path d="M4.5 21.5c0-4.4 3.4-7.5 7.5-7.5s7.5 3.1 7.5 7.5" ${st(H)}/>${x}`;
const A = c => st(c, 1.6);   // Akzent in Fachfarbe
const SYM = {
  azubi:      c => figur(`<rect x="14.5" y="15.5" width="6" height="5" rx=".8" ${A(c)}/><path d="M17.5 15.5v5" ${A(c)}/>`),
  schuh:      c => `<path d="M6 3.5h5v9l6.2 2.6c2 .9 3.3 2.3 3.3 4.4H6z" ${st(H)}/><path d="M6 17.5h14.4M13.5 13.6c1.4.2 2.6 1.4 2.7 3" ${A(c)}/>`,
  betriebsrat:c => figur(`<path d="M15 2.5h7v4.5h-3.5L16.5 9V7H15z" ${A(c)}/>`),
  erstehilfe: c => figur(`<path d="M12 16.5v4M10 18.5h4" ${st('#FF6B7A', 1.8)}/>`),
  stapler:    c => `<path d="M3 17V9h7l3 4v4z" ${st(H)}/><path d="M16 3v14M16 17h6" ${A(c)}/><circle cx="6" cy="18.5" r="2" ${st(H)}/><circle cx="12" cy="18.5" r="2" ${st(H)}/><path d="M5 9V6h4" ${st(H)}/>`,
  ausbilder:  c => figur(`<path d="M12 14.5l-1.3 2.2 1.3 4.3 1.3-4.3z" ${A(c)}/><rect x="16" y="13" width="5" height="6.5" rx=".8" ${A(c)}/>`),
  helm:       c => `<path d="M4 16a8 8 0 0 1 16 0z" ${st(H)}/><path d="M2.5 16h19M12 8v3.5M9 9.2l.8 3M15 9.2l-.8 3" ${A(c)}/><path d="M7 19.5h10" ${st(H)}/>`,
  kammer:     c => `<path d="M3 9l9-5.5L21 9z" ${st(H)}/><path d="M5.5 10.5v7M9.8 10.5v7M14.2 10.5v7M18.5 10.5v7" ${A(c)}/><path d="M3 20h18" ${st(H)}/>`,
  vertrag:    c => `<path d="M6 2.5h9l4 4v15H6z" ${st(H)}/><path d="M9 9h7M9 12h7" ${st(H)}/><path d="M8.5 17.5c1.5-2 2.5 1 3.8-.6 1-1.2 1.8.8 3.2-.4" ${A(c)}/>`,
  paragraf:   c => `<rect x="4" y="3" width="16" height="18" rx="3" ${st(H)}/><text x="12" y="16.5" text-anchor="middle" style="font:800 12px var(--f-display);fill:${c}">§</text>`,
  roboter:    c => `<path d="M4 21h10M7 21v-3h4v3" ${st(H)}/><path d="M9 18l3-8 7-3" ${st(H)}/><circle cx="12" cy="10" r="1.5" ${A(c)}/><path d="M19 7l2-2M19 7l2.5 1.5" ${A(c)}/>`,
  chefin:     c => figur(`<rect x="14.5" y="15.5" width="7" height="5" rx="1" ${A(c)}/><path d="M16.5 15.5v-1.2h3v1.2" ${A(c)}/><path d="M9 3.2l1.5 1.3L12 2.8l1.5 1.7L15 3.2" ${st('#FFC93C', 1.3)}/>`),
  pruefer:    c => figur(`<circle cx="10.4" cy="8.2" r="1.3" ${A(c)}/><circle cx="13.6" cy="8.2" r="1.3" ${A(c)}/><path d="M11.7 8.2h.6" ${A(c)}/><rect x="15" y="13.5" width="6" height="7.5" rx="1" ${A(c)}/><path d="M16.6 17.2l1.2 1.2 2-2.4" ${A(c)}/>`),
  schloss:    c => `<rect x="5" y="10" width="14" height="11" rx="2.5" ${st(H)}/><path d="M8 10V7.5a4 4 0 0 1 8 0V10" ${st(H)}/><path d="M9 15.5h.01M12 15.5h.01M15 15.5h.01" ${st(c, 2.6)}/>`,
  router:     c => `<rect x="3" y="12" width="18" height="7" rx="2" ${st(H)}/><path d="M7 12V5M17 12V5" ${st(H)}/><path d="M6.5 15.5h.01M9.5 15.5h.01" ${st(c, 2.4)}/><path d="M10 5.5a3 3 0 0 1 4 0M8.5 3.5a5.5 5.5 0 0 1 7 0" ${A(c)}/>`,
  switch:     c => `<rect x="2.5" y="8" width="19" height="8" rx="1.8" ${st(H)}/>${[5,8,11,14,17].map(x=>`<rect x="${x}" y="10.5" width="2" height="2.2" rx=".3" ${A(c)}/>`).join('')}<path d="M5 18.5v2M12 18.5v2M19 18.5v2" ${st(H)}/>`,
  kabel:      c => `<path d="M8 3h8v6l-1.5 2h-5L8 9z" ${st(H)}/><path d="M10 5v2M12 5v2M14 5v2" ${A(c)}/><path d="M12 11v3c0 4-6 3-6 7" ${A(c)}/>`,
  backup:     c => `<ellipse cx="10" cy="6" rx="6" ry="2.5" ${st(H)}/><path d="M4 6v10c0 1.4 2.7 2.5 6 2.5M16 6v4" ${st(H)}/><path d="M4 11c0 1.4 2.7 2.5 6 2.5" ${st(H)}/><path d="M21 17a4 4 0 1 1-1.2-2.8M20.5 12.5v2h-2" ${A(c)}/>`,
  firewall:   c => `<path d="M3 21V9h18v12zM3 13h18M3 17h18M8 9v4M16 9v4M12 13v4M6 17v4M18 17v4" ${st(H)}/><path d="M12 7.5c-2-1.5-1.5-3.5 0-5 .3 1.5 2.5 2 2.5 3.8a2.5 2.5 0 0 1-2.5 1.2z" style="fill:${c}"/>`,
  token:      c => `<rect x="5" y="3" width="14" height="18" rx="3" ${st(H)}/><rect x="8" y="6" width="8" height="5" rx="1" ${A(c)}/><text x="12" y="10.2" text-anchor="middle" style="font:700 4px var(--f-mono);fill:${c}">428</text><circle cx="12" cy="16" r="2" ${st(H)}/>`,
  dsb:        c => figur(`<path d="M17.5 11.5l3.5 1.4v2.6c0 2.2-1.6 3.6-3.5 4.3-1.9-.7-3.5-2.1-3.5-4.3v-2.6z" ${A(c)}/>`),
  hash:       c => `<path d="M9 3l-2 18M17 3l-2 18M4 8.5h17M3 15.5h17" ${st(H, 1.8)}/><circle cx="12" cy="12" r="2" style="fill:${c}"/>`,
  server:     c => `<rect x="4" y="3" width="16" height="5.5" rx="1.2" ${st(H)}/><rect x="4" y="9.5" width="16" height="5.5" rx="1.2" ${st(H)}/><rect x="4" y="16" width="16" height="5.5" rx="1.2" ${st(H)}/><path d="M7 5.8h.01M7 12.2h.01M7 18.8h.01" ${st(c, 2.6)}/><path d="M11 5.8h6M11 12.2h6M11 18.8h6" ${st(H, 1)} opacity=".6"/>`,
  techniker:  c => figur(`<path d="M7.8 8.5a4.2 4.2 0 0 1 8.4 0" ${A(c)}/><path d="M16.2 8.5v2.3c0 1-1 1.7-2.4 1.7" ${A(c)}/><rect x="6.3" y="7.5" width="1.8" height="3" rx=".6" style="fill:${c}"/>`),
  rechenzentrum: c => `${[3,9.5,16].map(x=>`<rect x="${x}" y="4" width="5" height="16" rx="1" ${st(H)}/><path d="M${x+1.5} 7h2M${x+1.5} 10h2M${x+1.5} 13h2" ${A(c)}/>`).join('')}<path d="M2 21.5h20" ${st(H)}/>`,
  bot:        c => `<rect x="5" y="7" width="14" height="11" rx="3" ${st(H)}/><path d="M12 7V4" ${st(H)}/><circle cx="12" cy="3.3" r="1" style="fill:${c}"/><circle cx="9" cy="12" r="1.4" style="fill:${c}"/><circle cx="15" cy="12" r="1.4" style="fill:${c}"/><path d="M9 15.5h6" ${st(H)}/><path d="M19 20.5l2.5-2.5M20 21.5l.8-.8" ${A(c)}/>`,
  dreieck:    c => `<path d="M12 3L21.5 20h-19z" ${st(H)}/>${[['C',12,8.7],['I',5.8,18.3],['A',18.2,18.3]].map(([t,x,y])=>`<text x="${x}" y="${y}" text-anchor="middle" style="font:800 4.2px var(--f-display);fill:${c}">${t}</text>`).join('')}<circle cx="12" cy="14.2" r="1.4" style="fill:${c}"/>`,
  bit:        c => `<circle cx="12" cy="12" r="8.5" ${st(H)}/><text x="12" y="16.3" text-anchor="middle" style="font:700 12px var(--f-mono);fill:${c}">1</text>`,
  byte:       c => `${Array.from({length:8}, (_, i) => `<rect x="${1.6 + i*2.7}" y="8.5" width="2.3" height="7" rx=".4" ${i%3===0 ? `style="fill:${c}"` : st(H, 1)}/>`).join('')}<path d="M2 19h20" ${st(H, 1)}/>`,
  variable:   c => `<rect x="3" y="7" width="18" height="10" rx="2" ${st(H)}/><text x="12" y="13.8" text-anchor="middle" style="font:700 5px var(--f-mono);fill:${c}">int x</text>`,
  lastenheft: c => `<path d="M6 2.5h9l4 4v15H6z" ${st(H)}/><path d="M9 10l1.2 1.2L12.5 9M9 15l1.2 1.2 2.3-2.2" ${A(c)}/><path d="M14 10.5h2.5M14 15.5h2.5" ${st(H)}/>`,
  pflichtenheft: c => `<path d="M6 2.5h9l4 4v15H6z" ${st(H)}/><circle cx="12.5" cy="14" r="2.6" ${A(c)}/><path d="M12.5 9.6v1.4M12.5 17v1.4M8.1 14h1.4M15.5 14h1.4" ${A(c)}/>`,
  debugger:   c => `<ellipse cx="12" cy="13.5" rx="4.5" ry="6" ${st(H)}/><path d="M12 7.5v12M7.5 11H3.5M16.5 11h4M7.5 15.5h-4M16.5 15.5h4M9 6l-1.5-2.5M15 6l1.5-2.5" ${st(H)}/><path d="M10 11l4 4M14 11l-4 4" ${A(c)}/>`,
  hex:        c => `<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" ${st(H)}/><text x="12" y="14.5" text-anchor="middle" style="font:700 6.5px var(--f-mono);fill:${c}">0xF</text>`,
  compiler:   c => `<path d="M3 7l-1 1 1 1M7 7l1 1-1 1" ${st(H)}/><path d="M9.5 8h3" ${A(c)}/><circle cx="17" cy="15" r="3" ${st(H)}/><path d="M17 10.5v1.3M17 18.2v1.3M12.5 15h1.3M20.2 15h1.3M13.8 11.8l.9.9M19.3 17.3l.9.9M13.8 18.2l.9-.9M19.3 12.7l.9-.9" ${st(H)}/><path d="M5 12v5h5" ${A(c)}/>`,
  zweier:     c => `<text x="12" y="10" text-anchor="middle" style="font:700 5.2px var(--f-mono);fill:${H}">0101</text><path d="M12 11.5v3M10.5 13.5l1.5 1.5 1.5-1.5" ${A(c)}/><text x="12" y="21" text-anchor="middle" style="font:700 5.2px var(--f-mono);fill:${c}">1011</text>`,
  architektin: c => figur(`<rect x="14.5" y="13.5" width="7" height="7" rx=".8" ${A(c)}/><path d="M14.5 17h7M18 13.5v7" ${A(c)}/>`),
  ascii:      c => `<rect x="3" y="3" width="18" height="18" rx="2" ${st(H)}/><path d="M3 9h18M3 15h18M12 3v18" ${st(H, 1)}/><text x="7.5" y="7.3" text-anchor="middle" style="font:700 3.8px var(--f-mono);fill:${c}">A</text><text x="16.5" y="7.3" text-anchor="middle" style="font:700 3.8px var(--f-mono);fill:${H}">65</text><text x="7.5" y="13.3" text-anchor="middle" style="font:700 3.8px var(--f-mono);fill:${c}">a</text><text x="16.5" y="13.3" text-anchor="middle" style="font:700 3.8px var(--f-mono);fill:${H}">97</text>`,
  algorithmus: c => `<rect x="8" y="2" width="8" height="4" rx="2" ${st(H)}/><path d="M12 6v2.5" ${st(H)}/><path d="M12 8.5l4.5 3.5-4.5 3.5L7.5 12z" ${A(c)}/><path d="M12 15.5V18M16.5 12H20v8h-8" ${st(H)}/><rect x="8" y="18" width="8" height="4" rx="1" ${st(H)}/>`,
  akteur:     c => `<circle cx="12" cy="5" r="2.8" ${st(H)}/><path d="M12 7.8v7.5M6.5 11h11M12 15.3l-4 6M12 15.3l4 6" ${st(H)}/><ellipse cx="19" cy="4" rx="3" ry="1.7" ${A(c)}/>`,
};

/* ---------- Lernwerk Legends: Kartenbilder ---------- */
// Vorhandene Monster-Bilder (von Gemini erzeugt) in img/karten/: Karten-ID → Dateiname. Fehlt ein Eintrag, zeigt die Karte eine Silhouette.
const BILDER = {
  'aew-basilisk': 'aew-basilisk.jpg', 'aew-breakpoint': 'aew-breakpoint.jpg', 'aew-drache': 'aew-drache.jpg', 'aew-eule': 'aew-eule.jpg', 'aew-kaefer': 'aew-kaefer.jpg', 'aew-kraken': 'aew-kraken.jpg', 'aew-luchs': 'aew-luchs.jpg', 'aew-phantom': 'aew-phantom.jpg', 'aew-refactoring': 'aew-refactoring.jpg', 'aew-review': 'aew-review.jpg', 'aew-schlange': 'aew-schlange.jpg', 'aew-schleim': 'aew-schleim.jpg', 'aew-stapel': 'aew-stapel.jpg', 'aew-titan': 'aew-titan.jpg', 'aew-wurm': 'aew-wurm.jpg', 'its-drache': 'its-drache.jpg', 'wbl-abmahnung': 'wbl-abmahnung.jpg', 'wbl-einhorn': 'wbl-einhorn.jpg', 'wbl-golem': 'wbl-golem.jpg', 'wbl-greif': 'wbl-greif.jpg', 'wbl-phantom': 'wbl-phantom.jpg', 'wbl-salamander': 'wbl-salamander.jpg', 'wbl-stechuhr': 'wbl-stechuhr.jpg', 'wbl-unterweisung': 'wbl-unterweisung.jpg', 'wbl-wichtel': 'wbl-wichtel.jpg',
};
// Silhouetten je Kreaturtyp (100×75), flach in der Fachfarbe
const SIL = {
  drache: c => `<path d="M22 58c6-10 14-14 24-14l10-10-4-9 9 5 6-6v10l8 4-9 3c2 8-2 15-10 19 8 2 16 0 22-6-2 9-12 15-24 14-10 0-18-4-22-7z" fill="${c}"/><path d="M46 44 30 18l-2 16-10-8 4 16-8-2 14 12z" fill="${c}" opacity=".8"/><path d="M58 38l14-22 2 14 10-6-4 14 8 0-14 8z" fill="${c}" opacity=".65"/><circle cx="64" cy="31" r="1.6" fill="#0B1026"/>`,
  golem: c => `<rect x="36" y="20" width="28" height="22" rx="4" fill="${c}"/><rect x="41" y="10" width="18" height="13" rx="3" fill="${c}"/><rect x="24" y="22" width="11" height="26" rx="4" fill="${c}" opacity=".85"/><rect x="65" y="22" width="11" height="26" rx="4" fill="${c}" opacity=".85"/><rect x="38" y="43" width="10" height="20" rx="3" fill="${c}"/><rect x="52" y="43" width="10" height="20" rx="3" fill="${c}"/><rect x="45" y="15" width="3" height="3" fill="#0B1026"/><rect x="52" y="15" width="3" height="3" fill="#0B1026"/><path d="M44 28h12M44 33h12" stroke="#0B1026" stroke-width="1.4" opacity=".4"/>`,
  geist: c => `<path d="M32 62V34a18 18 0 0 1 36 0v28l-6-5-6 5-6-5-6 5-6-5z" fill="${c}"/><path d="M32 40c-8 2-12 8-14 12M68 40c8 2 12 8 14 12" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".7"/><ellipse cx="44" cy="34" rx="3" ry="4" fill="#0B1026"/><ellipse cx="56" cy="34" rx="3" ry="4" fill="#0B1026"/>`,
  kaefer: c => `<ellipse cx="50" cy="42" rx="17" ry="20" fill="${c}"/><circle cx="50" cy="20" r="8" fill="${c}"/><path d="M50 24v37" stroke="#0B1026" stroke-width="1.6" opacity=".45"/><path d="M34 34l-12-6M33 44H19M34 53l-12 7M66 34l12-6M67 44h14M66 53l12 7M46 13l-6-8M54 13l6-8" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="46.5" cy="19" r="1.6" fill="#0B1026"/><circle cx="53.5" cy="19" r="1.6" fill="#0B1026"/>`,
  bestie: c => `<path d="M20 44c0-8 8-13 20-13h18l8-10 3 7 5-4-1 10c6 3 8 8 8 13l-7 1-4-4H64l-2 20h-7l-1-14H40l-2 14h-7l-1-16c-5-1-10-2-10-4z" fill="${c}"/><path d="M20 42c-6-2-9-7-8-12 3 4 6 6 10 6" fill="${c}" opacity=".8"/><circle cx="70" cy="33" r="1.6" fill="#0B1026"/>`,
  humanoid: c => `<path d="M50 10c8 0 13 6 13 13s-5 13-13 13-13-6-13-13 5-13 13-13z" fill="${c}"/><path d="M38 12c4-6 20-6 24 0l-3 6c-4-4-14-4-18 0z" fill="${c}" opacity=".7"/><path d="M28 66c0-18 10-28 22-28s22 10 22 28z" fill="${c}"/><path d="M72 40l8-14M80 26l4 3" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/><circle cx="45" cy="23" r="1.8" fill="#0B1026"/><circle cx="55" cy="23" r="1.8" fill="#0B1026"/>`,
  schlange: c => `<path d="M24 62c14 0 18-10 12-18s-2-18 12-18 16 10 10 18-4 18 10 18" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M40 20c4-8 16-8 18 0 1 5-4 8-10 8s-9-3-8-8z" fill="${c}"/><path d="M50 28l-2 6M52 28l2 6" stroke="#FF6B7A" stroke-width="1.4"/><circle cx="46" cy="20" r="1.6" fill="#0B1026"/><circle cx="53" cy="20" r="1.6" fill="#0B1026"/>`,
  vogel: c => `<path d="M50 28c7 0 11 5 11 12 0 9-5 17-11 17s-11-8-11-17c0-7 4-12 11-12z" fill="${c}"/><path d="M40 38C28 30 18 30 10 34c10 2 16 8 22 14 3 0 6-2 8-4zM60 38c12-8 22-8 30-4-10 2-16 8-22 14-3 0-6-2-8-4z" fill="${c}" opacity=".8"/><circle cx="50" cy="24" r="8" fill="${c}"/><path d="M50 27l-3 5h6z" fill="#FFC93C"/><circle cx="46.5" cy="22" r="1.8" fill="#0B1026"/><circle cx="53.5" cy="22" r="1.8" fill="#0B1026"/><path d="M45 57l-3 8M55 57l3 8" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
  krake: c => `<path d="M50 10c12 0 20 9 20 20 0 8-4 13-10 15H40c-6-2-10-7-10-15 0-11 8-20 20-20z" fill="${c}"/>${[26,36,46,54,64,74].map((x,i)=>`<path d="M${40 + i*4} 44c${(x-50)*.4} 6 ${(x-50)*.9} 10 ${(x-50)*.9 + (i%2?4:-4)} 22" fill="none" stroke="${c}" stroke-width="4.5" stroke-linecap="round"/>`).join('')}<circle cx="43" cy="30" r="3" fill="#0B1026"/><circle cx="57" cy="30" r="3" fill="#0B1026"/>`,
  schleim: c => `<path d="M22 62c0-14 8-30 28-30s28 16 28 30z" fill="${c}"/><path d="M36 34c2-8 8-12 14-12" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="42" cy="46" r="4" fill="#0B1026"/><circle cx="58" cy="46" r="4" fill="#0B1026"/><path d="M44 55c4 3 8 3 12 0" stroke="#0B1026" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="30" cy="58" r="3" fill="#fff" opacity=".25"/>`,
  zauber: c => `<circle cx="50" cy="36" r="24" fill="none" stroke="${c}" stroke-width="2.5" opacity=".6"/><circle cx="50" cy="36" r="16" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="3 3"/><path d="M50 14l4 16 16 6-16 6-4 16-4-16-16-6 16-6z" fill="${c}"/><path d="M30 64h40" stroke="${c}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`,
  falle: c => `<path d="M50 10 72 18v18c0 14-9 22-22 27-13-5-22-13-22-27V18z" fill="${c}"/><path d="M50 22v18" stroke="#0B1026" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="48" r="3" fill="#0B1026"/>`,
};
function silhouette(k){
  const f = FACH[k.fach] || FACH.aew, g = nid('sg'), s = SIL[k.art] || SIL.bestie;
  return `<svg viewBox="0 0 100 75" class="lwk-sil" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><radialGradient id="${g}" cx=".5" cy=".45" r=".65"><stop offset="0" stop-color="${f.farbe}" stop-opacity=".38"/><stop offset="1" stop-color="${f.dunkel}"/></radialGradient></defs>
    <rect width="100" height="75" fill="${f.dunkel}"/><rect width="100" height="75" fill="url(#${g})"/>${MUSTER[k.fach] || ''}<ellipse cx="50" cy="66" rx="30" ry="4" fill="#000" opacity=".35"/>${s(f.farbe)}</svg>`;
}
// Bild der Karte: echtes Bild, wenn vorhanden, sonst Silhouette
function kartenBild(k){
  const datei = BILDER[k.bild || k.id];
  return datei ? `<img class="lwk-img" src="img/karten/${datei}" alt="" loading="lazy" decoding="async">` : silhouette(k);
}
// Schlüsselwörter: Name, Erklärung, Symbol
const SCHLUESSEL = {
  waechter: ['Wächter', 'Muss zuerst angegriffen werden.', '<path d="M12 2.5 20 5.5v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="currentColor"/>'],
  ansturm: ['Ansturm', 'Kann sofort angreifen.', '<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/>'],
  tarnung: ['Tarnung', 'Nicht angreifbar, bis es selbst angreift.', '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 20 20 4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'],
  schild: ['Schild', 'Der erste Treffer macht keinen Schaden.', '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="12" cy="12" r="4" fill="currentColor"/>'],
  lebensraub: ['Lebensraub', 'Verursachter Schaden heilt den eigenen Helden.', '<path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.8 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/>'],
  gift: ['Gift', 'Vernichtet jedes Monster, das es trifft.', '<path d="M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13z" fill="currentColor"/>'],
  // Effekt-Marken (keine Schlüsselwörter, aber gleich dargestellt): zeigen auf einen Blick, dass die Karte etwas auslöst
  ausspielen: ['Beim Ausspielen', 'Wirkt einmal, sobald die Karte gespielt wird.', '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M10 7.5 16.5 12 10 16.5z" fill="currentColor"/>'],
  erleuchtet: ['Erleuchtet', 'Wirkt nach jeder richtig beantworteten Zugfrage.', '<path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" fill="currentColor"/><path d="M9 20h6M10 22.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'],
  zauber: ['Zauber', 'Wirkt sofort und kommt danach auf den Ablagestapel.', '<path d="M11 1.5 13.2 8 19.5 10.2 13.2 12.4 11 19 8.8 12.4 2.5 10.2 8.8 8z" fill="currentColor"/><path d="M19 15l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" fill="currentColor"/>'],
  falle: ['Falle', 'Liegt verdeckt und schnappt zu, wenn der Gegner das Auslöse-Ereignis macht.', '<path d="M2.5 15h19M4 15l2-6 2 6 2-6 2 6 2-6 2 6 2-6 2 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/><path d="M4 18.5h16" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>'],
};
const kwIco = (kw, cls = '') => SCHLUESSEL[kw] ? `<svg viewBox="0 0 24 24" class="kw-ico ${cls}" aria-hidden="true">${SCHLUESSEL[kw][2]}</svg>` : '';

/* ---------- Karten-Artwork (alte Karten, für Hub-Vorschau) ---------- */
function kartenBildAlt(k){
  const f = FACH[k.fach] || FACH.aew, s = SYM[k.bild] || SYM.bit, g = nid('kg');
  return `<svg viewBox="0 0 100 80" class="lwk-art" aria-hidden="true"><defs><radialGradient id="${g}" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="${f.farbe}" stop-opacity=".45"/><stop offset="1" stop-color="${f.dunkel}" stop-opacity="1"/></radialGradient></defs>
    <rect width="100" height="80" fill="${f.dunkel}"/><rect width="100" height="80" fill="url(#${g})"/>${MUSTER[k.fach] || ''}
    <circle cx="50" cy="40" r="25" fill="${f.dunkel}" opacity=".55"/><circle cx="50" cy="40" r="25" ${st(f.farbe, 1.2)} opacity=".5"/>
    <g transform="translate(29.6 19.6) scale(1.7)">${s(f.farbe)}</g></svg>`;
}
// Gegner-Porträts (Karten-Kampf gegen den Computer)
const PORTRAIT_X = [
  c => `<path d="M8.5 5.3h7l1.3 1.4" ${A(c)}/>`,                                           // Praktikant: Kappe
  c => `<path d="M8.4 7.4c.6-3 6.6-3 7.2 0" ${A(c)}/><path d="M15.5 6.5c1.5.5 2 2 1.6 3.5" ${A(c)}/>`, // Kollegin: Zopf
  c => `<path d="M12 14.5l-1.3 2.2 1.3 4.3 1.3-4.3z" ${A(c)}/>`,                             // Ausbilder: Krawatte
  c => `<circle cx="10.4" cy="8.2" r="1.3" ${A(c)}/><circle cx="13.6" cy="8.2" r="1.3" ${A(c)}/><rect x="15" y="15" width="6.5" height="5" rx="1" ${A(c)}/>`,  // Abteilungsleitung
  c => `<path d="M8.5 6.5h7M9 9.5l2-1.5M15 9.5l-2-1.5" ${A(c)}/><rect x="15" y="14" width="7" height="5" rx="1" ${A(c)}/><path d="M16.5 16.5h4" ${A(c)}/>`,        // Hacker: Kapuze, Laptop
  c => `<circle cx="10.4" cy="8.2" r="1.3" ${A(c)}/><circle cx="13.6" cy="8.2" r="1.3" ${A(c)}/><path d="M15 15l2 2-2 2M19 19h3" ${A(c)}/>`,                                          // Lead-Dev: Brille, Terminal
  c => `<path d="M12 14.5l-1.3 2.2 1.3 4.3 1.3-4.3z" ${A(c)}/><rect x="16" y="13" width="5" height="6.5" rx=".8" ${A(c)}/>`,                                                    // Ausbilder: Krawatte, Ordner
  c => `<circle cx="10.4" cy="8.2" r="1.3" ${A(c)}/><circle cx="13.6" cy="8.2" r="1.3" ${A(c)}/><path d="M8.3 3.3l1.6 1.4L12 2.6l2.1 2.1 1.6-1.4" ${st('#FFC93C', 1.3)}/><path d="M16 15l1.2 1.2 2.4-2.6" ${A(c)}/>`,
];
function portrait(stufe, gr=64){
  const c = ['#35D6A0','#3F9BFF','#FF8A5C','#8B7BFF','#2FCFA0','#FFC93C'][stufe-1] || '#8B7BFF', g = nid('pg');
  const x = [0, 1, 4, 5, 2, 7][stufe-1];
  return `<svg viewBox="0 0 64 64" width="${gr}" height="${gr}" class="portrait" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="#0E1535"/></linearGradient></defs>
    <rect width="64" height="64" rx="16" fill="#121A38"/><rect width="64" height="64" rx="16" fill="url(#${g})"/><g transform="translate(8 8) scale(2)">${figur(PORTRAIT_X[x] ? PORTRAIT_X[x](c) : '')}</g></svg>`;
}

/* ---------- Kleine UI-Symbole ---------- */
const ico = {
  schwert: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M14.5 3H21v6.5L10 20.5 3.5 14z" fill="currentColor" opacity=".25"/><path d="M14.5 3H21v6.5L10 20.5M3.5 14 10 20.5M6 17.5 3 20.5M7.5 11.5l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  schild: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M12 2.5 20 5.5v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10v-6z" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  fokus: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="currentColor"/></svg>',
  herz: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.3C1.1 8.3 3.2 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.8 0 5.9 3.8 4.5 7.2C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>',
  deck: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><rect x="4" y="6" width="12" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3h9.5A2.5 2.5 0 0 1 20 5.5V17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  xp: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>',
  flamme: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M12 2c1 3.5 5 5.5 5 10.5A5 5 0 0 1 12 18a5 5 0 0 1-5-5.5c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-9z" fill="currentColor"/></svg>',
  booster: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M6 3l2 1.2L10 3l2 1.2L14 3l2 1.2L18 3v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 9l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z" fill="currentColor"/></svg>',
  pokal: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" opacity=".25"/><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8M9.5 18h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  joker50: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>',
  hinweis: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M9 18h6M10 21h4M8.5 14.5C7 13.4 6 11.6 6 9.5a6 6 0 0 1 12 0c0 2.1-1 3.9-2.5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  wechsel: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5M4 20v-4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bot: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3.5" fill="currentColor" opacity=".25" stroke="currentColor" stroke-width="2"/><path d="M12 7V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="3.3" r="1.4" fill="currentColor"/><circle cx="9" cy="12.5" r="1.6" fill="currentColor"/><circle cx="15" cy="12.5" r="1.6" fill="currentColor"/><path d="M9.5 16h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  experte: '<svg viewBox="0 0 24 24" class="gi" aria-hidden="true"><circle cx="12" cy="7.5" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4.5 21c0-4.2 3.4-7 7.5-7s7.5 2.8 7.5 7M2 5.5 12 1l10 4.5L12 10z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
};
const muenze = (gr=18) => `<svg viewBox="0 0 24 24" width="${gr}" height="${gr}" class="muenze-svg" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#E0A21A"/><circle cx="12" cy="11" r="9" fill="#FFC93C"/><circle cx="12" cy="11" r="6.3" fill="none" stroke="#E0A21A" stroke-width="1.4"/><path d="M10.2 8v6h3.6" fill="none" stroke="#B8780E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- Booster-Pack ---------- */
function booster(fach='mix', gr=120){
  const f = FACH[fach] || {name:'MIX', farbe:'#6C5CFF', dunkel:'#1B1450'}, g = nid('bg'), gl = nid('bgl');
  const zz = n => Array.from({length:n}, (_, i) => `${6 + i*(68/(n-1))} ${i%2?4:0}`).join(' L');
  return `<svg viewBox="0 0 80 112" width="${gr*80/112}" height="${gr}" class="booster-svg" aria-hidden="true"><defs>
    <linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${f.farbe}"/><stop offset=".55" stop-color="${f.dunkel}"/><stop offset="1" stop-color="#0B1026"/></linearGradient>
    <linearGradient id="${gl}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <path d="M6 4 L${zz(9)} L74 4 V108 L${Array.from({length:9}, (_, i) => `${74 - i*(68/8)} ${108 + (i%2?4:0)}`).join(' L')} Z" fill="url(#${g})" stroke="${f.farbe}" stroke-width="1.2"/>
    <rect class="b-glanz" x="-40" y="0" width="30" height="112" fill="url(#${gl})" transform="skewX(-18)"/>
    <path d="M6 20h68M6 92h68" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>
    <g transform="translate(24 30) scale(1)"><path d="M3 12.3 16 6l13 6.3-13 6.3z" fill="#fff" opacity=".92"/><path d="M9.5 15.2v5.2c0 1.9 3 3.6 6.5 3.6s6.5-1.7 6.5-3.6v-5.2L16 18.3z" fill="#fff" opacity=".7"/></g>
    <text x="40" y="74" text-anchor="middle" style="font:900 13px var(--f-display);fill:#fff;letter-spacing:.06em">${f.name}</text>
    <text x="40" y="86" text-anchor="middle" style="font:800 6.5px var(--f-display);fill:#fff;opacity:.75;letter-spacing:.2em">BOOSTER · 5 KARTEN</text></svg>`;
}

/* ---------- Bombe ---------- */
const bombe = (gr=160) => { const g = nid('bo'); return `<svg viewBox="0 0 120 120" width="${gr}" height="${gr}" class="bombe-svg" overflow="visible" aria-hidden="true"><defs><radialGradient id="${g}" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#4A5488"/><stop offset=".45" stop-color="#1D2350"/><stop offset="1" stop-color="#070A1C"/></radialGradient></defs>
  <circle cx="56" cy="70" r="40" fill="url(#${g})"/><circle class="bombe-glut" cx="56" cy="70" r="40" fill="#FF4D5E" opacity="0"/>
  <ellipse cx="42" cy="54" rx="10" ry="6" fill="#fff" opacity=".18" transform="rotate(-35 42 54)"/>
  <rect x="70" y="26" width="18" height="14" rx="3" transform="rotate(35 79 33)" fill="#2A3270"/>
  <path class="lunte" d="M84 24c6-8 14-9 20-4" fill="none" stroke="#C9A26B" stroke-width="3" stroke-linecap="round"/>
  <g transform="translate(104 20)"><g class="funke"><circle r="4.5" fill="#FFC93C"/><path d="M0-9v4M0 5v4M-9 0h4M5 0h4M-6-6l2.5 2.5M3.5 3.5 6 6M-6 6l2.5-2.5M3.5-3.5 6-6" stroke="#FFE066" stroke-width="2" stroke-linecap="round"/></g></g></svg>`; };

/* ---------- Rangabzeichen ---------- */
const RANG_FARBE = {bronze:['#E09A5A','#8C5523'], silber:['#DDE4EC','#7D8A99'], gold:['#FFD966','#B8860B'], platin:['#8FF0DD','#2E8F86'], diamant:['#9AD4FF','#3A6FD8'], meister:['#D9A2FF','#7B2FBE']};
function rangAbzeichen(id, gr=56){
  const [h, d] = RANG_FARBE[id] || RANG_FARBE.bronze, g = nid('rg');
  const innen = {bronze:'<path d="M-8 2l8-6 8 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    silber:'<path d="M-8-1l8-6 8 6M-8 6l8-6 8 6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    gold:'<path d="M-8-4l8-6 8 6M-8 2l8-6 8 6M-8 8l8-6 8 6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    platin:'<path d="M0-10l2.9 6 6.6.9-4.8 4.6 1.2 6.5L0 4.9l-5.9 3.1 1.2-6.5-4.8-4.6 6.6-.9z" fill="#fff"/>',
    diamant:'<path d="M-9-3l4-6h10l4 6-9 12z" fill="#fff"/><path d="M-9-3h18M-5-9l5 6 5-6M0-3v12" stroke="' + d + '" stroke-width="1.2" fill="none"/>',
    meister:'<path d="M-10 6-11-7l6 5 5-8 5 8 6-5-1 13z" fill="#fff"/>'}[id] || '';
  return `<svg viewBox="-32 -34 64 68" width="${gr}" height="${gr}" class="rang-svg" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>
    <path d="M0-30 26-15v30L0 30-26 15v-30z" fill="url(#${g})" stroke="${d}" stroke-width="2"/><path d="M0-24 21-12v24L0 24-21 12v-24z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.4"/>${innen}</svg>`;
}

/* ---------- Spiel-Artworks für den Hub: flach, klare Formen, eine Farbe je Spiel ---------- */
const raster = c => `<g fill="${c}" opacity=".16">${Array.from({length:60}, (_, i) => `<circle cx="${12 + (i%12)*27}" cy="${14 + Math.floor(i/12)*30}" r="1.6"/>`).join('')}</g>`;
const ART = {
  karten: () => `<svg viewBox="0 0 320 150" class="spiel-art" aria-hidden="true">${raster('#B9A6FF')}
    ${[[-12,'#3F9BFF',112],[0,'#8B5CFF',160],[12,'#F2C94C',208]].map(([r,c,x],i)=>`<g class="ak-karte" transform="translate(${x} 82) rotate(${r})"><rect x="-32" y="-46" width="64" height="90" rx="6" fill="#0E1433" stroke="${c}" stroke-width="3"/><rect x="-25" y="-38" width="50" height="40" rx="3" fill="${c}"/><path d="M-25 -2 l12 -14 9 9 8 -12 21 17z" fill="#0E1433" opacity=".35"/><rect x="-25" y="8" width="34" height="4" rx="2" fill="#fff" opacity=".8"/><rect x="-25" y="16" width="44" height="3" rx="1.5" fill="#fff" opacity=".35"/><circle cx="-20" cy="34" r="6" fill="#FF6B7A"/><circle cx="20" cy="34" r="6" fill="#35D6A0"/></g>`).join('')}</svg>`,
  bombe: () => `<svg viewBox="0 0 320 150" class="spiel-art" aria-hidden="true">${raster('#FFB199')}
    <g transform="translate(100 18)">${bombe(120).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <rect x="214" y="36" width="72" height="34" rx="8" fill="#0E1433"/><text x="250" y="60" text-anchor="middle" class="ab-tick" style="font:800 20px var(--f-mono);fill:#FF6B4A">0:17</text></svg>`,
  millionaer: () => `<svg viewBox="0 0 320 150" class="spiel-art" aria-hidden="true">${raster('#FFE08A')}
    ${[0,1,2,3,4,5].map(i=>`<rect x="${66 + i*32}" y="${128 - (i+1)*17}" width="28" height="${(i+1)*17}" rx="3" fill="${i===5?'#F2C94C':'#0E1433'}" ${i===5?'':'stroke="#F2C94C" stroke-opacity=".45" stroke-width="1.5"'}/>`).join('')}
    <text x="68" y="36" style="font:800 14px var(--f-mono);fill:#F2C94C">300 XP</text></svg>`,
  arena: () => `<svg viewBox="0 0 320 150" class="spiel-art" aria-hidden="true">${raster('#9CCBFF')}
    <g class="aa-l"><path d="M84 38 118 48v24c0 20-14 32-34 38-20-6-34-18-34-38V48z" fill="#3F9BFF"/><path d="M84 52v44" stroke="#0E1433" stroke-width="4" stroke-linecap="round" opacity=".35"/></g>
    <g class="aa-r"><path d="M236 38 270 48v24c0 20-14 32-34 38-20-6-34-18-34-38V48z" fill="#8B7BFF"/><path d="M222 74h28" stroke="#0E1433" stroke-width="4" stroke-linecap="round" opacity=".35"/></g>
    <text x="160" y="86" text-anchor="middle" style="font:900 30px var(--f-display);fill:#fff">VS</text></svg>`,
  duell: () => `<svg viewBox="0 0 320 150" class="spiel-art" aria-hidden="true">${raster('#8FF0CF')}
    <g><rect x="52" y="30" width="112" height="62" rx="14" fill="#35D6A0"/><path d="M78 92l-6 18 22-18z" fill="#35D6A0"/><text x="108" y="72" text-anchor="middle" style="font:900 34px var(--f-display);fill:#0E1433">?</text></g>
    <g><rect x="156" y="58" width="112" height="62" rx="14" fill="#0E1433" stroke="#35D6A0" stroke-width="3"/><path d="M242 120l6 16-22-16z" fill="#0E1433" stroke="#35D6A0" stroke-width="3" stroke-linejoin="round"/><text x="212" y="100" text-anchor="middle" style="font:900 30px var(--f-display);fill:#35D6A0">3 : 2</text></g></svg>`,
};

window.GGFX = {FACH, kartenBild, kartenBildAlt, silhouette, BILDER, SCHLUESSEL, kwIco, portrait, ico, muenze, booster, bombe, rangAbzeichen, ART};
})();
