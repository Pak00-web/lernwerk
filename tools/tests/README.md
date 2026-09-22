# Tests für Lernwerk Games

Laufen lokal ohne Supabase: PGlite (Postgres in Node) mit nachgebautem Supabase (Rollen, `auth.uid()`, Standardrechte).

```
cd tools/tests
npm i @electric-sql/pglite jsdom@24
node test-sql.js   # Server-Logik und Rechte (73 Prüfungen)
node test-ui.js    # echte Seite in jsdom, zwei Spieler A/B (ca. 1 Minute)
node sim.js        # Balance der Computer-Gegner
```
