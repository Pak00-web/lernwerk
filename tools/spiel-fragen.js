/* Erzeugt supabase/spiel-fragen.sql aus fragen.js: die Lösungen der Spielfragen für den Server.
   Spielfragen = Multiple Choice mit genau einer richtigen Antwort.
   Aufruf nach jeder Änderung an fragen.js:  node tools/spiel-fragen.js
   Danach die erzeugte Datei im Supabase SQL Editor ausführen. */
const fs = require('fs'), path = require('path');
global.window = {};
require(path.join(__dirname, '..', 'fragen.js'));
const D = window.LERNWERK_DATEN;
const fachVon = t => (D.themen.find(x => x.id === t) || {}).fach;
const fragen = D.einheiten.filter(e => e.typ === 'M' && !e.mehrfach && e.optionen.filter(o => o[1]).length === 1);
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const zeilen = fragen.map(e => `  (${q(e.id)}, ${q(fachVon(e.thema))}, ${e.punkte || 2}, ${e.optionen.length}, ${e.optionen.findIndex(o => o[1])})`);
const sql = `-- Automatisch erzeugt von tools/spiel-fragen.js – nicht von Hand ändern.
-- Lösungen der ${fragen.length} Spielfragen aus fragen.js. Nach jeder Änderung an fragen.js neu erzeugen und im SQL Editor ausführen.
begin;
delete from public.spiel_fragen;
insert into public.spiel_fragen (id, fach, schwer, anzahl, richtig) values
${zeilen.join(',\n')};
commit;
select count(*) as spielfragen from public.spiel_fragen;
`;
fs.writeFileSync(path.join(__dirname, '..', 'supabase', 'spiel-fragen.sql'), sql);
console.log(fragen.length + ' Spielfragen geschrieben');
