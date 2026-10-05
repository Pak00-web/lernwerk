// Test der Klausur-Vorbereitung (#/klausuren): echte Seite in jsdom, ohne Konto/Supabase
// node test-klausuren.js
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');
const path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..', '..');
let fehler = 0; const ok = (b, t) => { if (b) console.log('  ✓ ' + t); else { fehler++; console.log('  ✗ ' + t); } };
const warte = ms => new Promise(r => setTimeout(r, ms));

class Lokal extends ResourceLoader {
  fetch(url, o){
    if (url.startsWith('file:')) return super.fetch(url, o);
    return Promise.resolve(Buffer.from(''));   // Schriften, CDN, Supabase: leer
  }
}
const findeE = (E, d) => { const qt = d.querySelector('.q').textContent.trim(); return E.find(x => x.typ === 'E' && x.frage.replace(/\*\*/g, '') === qt); };
const loesungE = e => e.wert != null ? String(e.wert).replace('.', ',') : e.begriffe.map(b => b[1].trim()).join(', ');
(async () => {
  const vc = new VirtualConsole(); const jsFehler = [];
  vc.on('jsdomError', e => { if (!/Not implemented/.test(e.message)) jsFehler.push(e.message + ' ' + String((e.detail && e.detail.stack) || e.stack || '').split('\n').slice(0, 3).join(' ')); });
  vc.on('error', e => jsFehler.push(String(e)));
  const dom = await JSDOM.fromFile(path.join(ROOT, 'index.html'), {runScripts: 'dangerously', resources: new Lokal(), virtualConsole: vc, pretendToBeVisual: true, beforeParse(win){ win.matchMedia = () => ({matches: true, addEventListener(){}, removeEventListener(){}, addListener(){}}); win.scrollTo = () => {}; }, url: 'file:///' + ROOT.replace(/\\/g, '/') + '/index.html'});
  const w = dom.window, d = w.document;
  w.HTMLCanvasElement.prototype.getContext = () => null;
  await new Promise(r => w.addEventListener('load', r));
  await warte(300);
  const geh = async h => { w.location.hash = h; await warte(150); };
  const klick = async sel => { const b = typeof sel === 'string' ? d.querySelector(sel) : sel; if (!b) throw new Error('fehlt: ' + sel); b.click(); await warte(150); };

  console.log('Klausur-Daten');
  const KL = w.LW_KLAUSUREN; ok(KL && KL.length === 1, 'eine Klausur geladen');
  const k = KL[0], E = k.einheiten;
  ok(new Set(E.map(e => e.id)).size === E.length, 'Fragen-IDs eindeutig (' + E.length + ')');
  ok(E.every(e => k.themen.some(t => t.id === e.thema)), 'jede Frage hat ein Thema der Klausur');
  ok(E.every(e => e.quelle), 'jede Frage hat eine Quelle');
  ok(E.filter(e => e.typ === 'M').every(e => e.optionen.some(o => o[1])), 'jede MC-Frage hat eine richtige Antwort');
  ok(E.filter(e => e.probe).length === 12, 'Probeklausur hat 12 Aufgaben');
  const D = w.LERNWERK_DATEN;
  ok(!D.einheiten.some(e => String(e.id).startsWith('k1-')), 'Klausurfragen sind NICHT im allgemeinen Pool');
  ok(!D.themen.some(t => t.id.startsWith('k1-')), 'Klausurthemen sind NICHT in den Fächern');

  console.log('Übersicht');
  ok(d.querySelector('#side [data-nav="#/klausuren"]'), 'Menüpunkt „Klausuren“ in der Seitenleiste');
  await geh('#/klausuren');
  ok(d.querySelector('[data-kl="wbl-k1"]'), 'Karte der WBL-Klausur');
  await klick('[data-kl="wbl-k1"]');
  ok(w.location.hash === '#/klausuren/wbl-k1', 'öffnet die Vorbereitung');
  ok(d.querySelectorAll('.kv-tag').length === k.plan.length, 'Lernplan mit ' + k.plan.length + ' Schritten');
  ok(d.querySelectorAll('.kv-thema').length === k.themen.length, k.themen.length + ' Themen-Karten');
  ok(d.querySelectorAll('[data-sc]').length === 12, 'Selbstcheck mit 12 Punkten');

  console.log('Lernseite');
  await klick('[data-lern="k1-probezeit"]');
  ok(d.querySelector('.overlay .kv-lernseite') && d.querySelector('.overlay').textContent.includes('1 Monat'), 'Lernseite Probezeit geht auf');
  await klick('.overlay .btn.primary'); await warte(250);
  ok(!d.querySelector('.overlay'), 'Lernseite schließt');

  console.log('Lernplan-Schritt üben');
  const tag = k.plan[1].tag;   // Ausbildungsvertrag
  await klick(`.kv-tag [data-plan="${tag}"]`);
  ok(w.location.hash === '#/uebung', 'Übung startet');
  let runden = 0, nurKlausur = true;
  while (w.location.hash === '#/uebung' && d.querySelector('#q') && runden < 40){
    runden++;
    if (process.env.DBG) console.log('R', runden, (d.querySelector('.sbar .mono') || {}).textContent, !!d.querySelector('#flip'), !!d.querySelector('.opt'), ((d.querySelector('.q') || {}).textContent || '').slice(0, 40));
    const tagTxt = (d.querySelector('.qhead .tag') || {}).textContent || '';
    if (!/Ausbildungsvertrag/.test(tagTxt)) nurKlausur = false;
    if (d.querySelector('#flip')){ ok(false, 'Karteikarte in der Klausur-Vorbereitung'); break; }
    else if (d.querySelector('#ein')){ const e = findeE(E, d); if (!e){ ok(false, 'Eingabe-Frage nicht gefunden'); break; } d.querySelector('#ein').value = loesungE(e); await klick('#check');
      if (process.env.SNAP && !global.snap){ global.snap = 1; fs.writeFileSync(path.join(ROOT, 'snap-e.html'), '<!doctype html>' + d.documentElement.outerHTML.replace(/<script[\s\S]*?<\/script>/g, '')); }
      if (!d.querySelector('.feedback.ok')){ ok(false, 'Musterantwort nicht erkannt: ' + e.id); break; } await klick('#check'); }
    else if (d.querySelector('.opt')){   // richtige Optionen über den Fragetext finden
      const qt = d.querySelector('.q').textContent.trim(), e = E.find(x => x.typ === 'M' && x.frage.replace(/\*\*/g, '') === qt);
      if (!e) { ok(false, 'Frage nicht gefunden: ' + qt); break; }
      for (const b of d.querySelectorAll('.opt')) if (e.optionen[+b.dataset.o][1]) await klick(b);
      await klick('#check'); const b = d.querySelector('#check');
      if (process.env.DBG && jsFehler.length) console.log('  JS:', jsFehler.slice(-2));
      if (process.env.DBG) console.log('  nach Prüfen:', b && b.textContent, b && b.disabled, (d.querySelector('#mfb') || {}).textContent.slice(0, 40), [...d.querySelectorAll('.opt')].map(o => o.className).join('|'));
      if (b) await klick(b);
    }
    else { if (process.env.DBG) console.log('  JS:', jsFehler.slice(-3)); break; }
  }
  ok(nurKlausur, 'nur Fragen zum Thema des Tages (' + runden + ' Fragen)');
  ok(d.querySelector('.end'), 'Ergebnisseite');
  ok(d.querySelector('#home').textContent.includes('Klausur'), 'Knopf „Zurück zur Klausur“');
  const st = w.LW.stand();
  ok(st.vorb && st.vorb['wbl-k1'] && st.vorb['wbl-k1'].tage[tag], 'Lernplan-Schritt automatisch abgehakt');
  await klick('#home');
  ok(w.location.hash === '#/klausuren/wbl-k1', 'zurück auf der Vorbereitungsseite');
  ok(d.querySelector(`.kv-tag.erledigt [data-hk="${tag}"]`), 'Schritt als erledigt angezeigt');

  console.log('Haken und Selbstcheck');
  await klick(`[data-hk="${tag}"]`);
  ok(!w.LW.stand().vorb['wbl-k1'].tage[tag], 'Haken lässt sich entfernen');
  const cb = d.querySelector('[data-sc="0"]'); cb.checked = true; cb.dispatchEvent(new w.Event('change')); await warte(100);
  ok(w.LW.stand().vorb['wbl-k1'].check[0], 'Selbstcheck wird gespeichert');

  console.log('Probeklausur');
  await klick('#kvProbe');
  ok(w.location.hash === '#/pruefung', 'Probeklausur startet');
  let n = 0;
  while (d.querySelector('#ein') && n < 20){ n++; d.querySelector('#ein').value = loesungE(findeE(E, d)); await klick('#check'); }
  ok(n === 12, '12 Aufgaben als Eingabe beantwortet');
  ok(!E.some(e => e.typ === 'K'), 'keine Karteikarten mehr');
  ok(d.querySelector('.gradebig') && d.querySelector('.gradebig').textContent.includes('1'), 'Note 1 bei voller Punktzahl');
  ok(w.LW.stand().vorb['wbl-k1'].tage[k.plan.find(p => p.art === 'probe').tag], 'Probeklausur-Schritt im Lernplan abgehakt');
  await klick('#home');
  ok(w.location.hash === '#/klausuren/wbl-k1' && d.querySelector('.kv-ergebnisse'), 'Ergebnis steht auf der Vorbereitungsseite');

  console.log('Trennung vom allgemeinen Üben');
  await geh('#/fach/wbl');
  ok(d.querySelector('#app').textContent.includes('WBL'), 'Fachseite lädt');
  ok(!d.querySelector('#app').textContent.includes('JArbSchG: Arbeitszeit'), 'Klausurthemen erscheinen nicht in der Fachansicht');

  ok(!jsFehler.length, 'keine JS-Fehler' + (jsFehler.length ? ': ' + jsFehler.slice(0, 3).join(' | ') : ''));
  console.log(fehler ? `\n${fehler} Fehler` : '\nAlles grün');
  process.exit(fehler ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
