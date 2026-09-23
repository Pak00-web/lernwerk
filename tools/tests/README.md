# Tests für Lernwerk Games

Laufen lokal ohne Supabase: PGlite (Postgres in Node) mit nachgebautem Supabase (Rollen, `auth.uid()`, Standardrechte).

```
cd tools/tests
npm i @electric-sql/pglite jsdom@24
node test-sql.js          # Server-Logik, Engine-Regeln, Booster/Pity/Staub, KI-Gegner, Rechte
node test-ui.js           # echte Seite in jsdom, zwei Spieler A/B (ca. 2 Minuten)
node sim.js [n]           # Balance Lernwerk Legends: KI gegen KI, Wissensvorteil, Bosse
node sim-karte.js <boss>  # Einfluss einzelner Karten eines Boss-Decks
```

`SNAP=<Ordner> node test-ui.js` speichert zusätzlich DOM-Schnappschüsse (Sammlung, Booster, Lobby, Kampf) als HTML,
die sich bei laufendem `npx serve -l 5500 .` im Browser ansehen oder per Edge headless fotografieren lassen.
