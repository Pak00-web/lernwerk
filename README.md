# Lernwerk

Lernseite für die FIAE-Klasse am Berufskolleg Bocholt-West: Karteikarten, Multiple Choice, Rechenaufgaben, Probe-Klausuren, Zeitrennen, 3 Leben, Abzeichen, Rangliste und Quizduell.

Statische Seite ohne Build-Schritt. Konten und Lernstand liegen bei Supabase.

## Aufbau
| Datei | Inhalt |
|---|---|
| `index.html` | Seitengerüst |
| `fragen.js` | alle Lerneinheiten (nur Unterrichtsstoff, jede mit Quelle) |
| `js/app.js` | Startseite, Üben, Klausur, Spielmodi |
| `js/spiel.js` | Konfetti, Töne, Abzeichen |
| `js/konto.js` | Anmeldung, Sync, Profil, Rangliste, Datenschutz |
| `js/duell.js` | Quizduell |
| `js/config.js` | Supabase-URL und öffentlicher anon-Key |
| `supabase/schema.sql` | Tabellen und Zugriffsregeln |
| `sw.js`, `manifest.webmanifest` | App-Installation und Offline-Betrieb |

## Einrichtung (einmalig)
1. **Supabase:** Projekt anlegen (Region *Central EU (Frankfurt)*).
   - *SQL Editor*: `supabase/schema.sql` komplett ausführen, den angezeigten **Klassencode** notieren.
   - *Authentication → Sign In / Providers → Email*: **Confirm email ausschalten** (es gibt keine echten E-Mail-Adressen).
   - *Project Settings → API*: `Project URL` und `anon public` Key in `js/config.js` eintragen. Den `service_role`-Key nie verwenden.
2. **GitHub:** Repository `lernwerk` anlegen, pushen, unter *Settings → Pages* „Deploy from branch: main / root“ wählen.

## Lokal testen
```
npx serve .
```

## Neue Fragen
In `fragen.js` ergänzen, testen, committen, pushen. GitHub Pages aktualisiert sich nach etwa einer Minute. Bei jeder Änderung an Seitendateien `CACHE` in `sw.js` hochzählen, damit Handys die neue Version laden.

## Passwort vergessen
Im Supabase-Dashboard unter *Authentication → Users* den Nutzer suchen (`spitzname@lernwerk.example`) und ein neues Passwort setzen.
