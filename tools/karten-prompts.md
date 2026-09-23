# Kartenbilder für Lernwerk Legends (Gemini)

Jede Karte bekommt ein eigenes Bild. Solange es fehlt, zeigt die Karte eine Silhouette in der Fachfarbe.

## So geht's
1. In Gemini **zuerst den Stil-Vorspann** einfügen, dann **eine** Motivzeile dahinter (eine Karte pro Bild).
2. Format **quer 3:2** (z. B. 1536 × 1024). Das Motiv steht **mittig mit etwas Rand**, weil das Bild auf dem Spielbrett rund bzw. quadratisch zugeschnitten wird.
3. Speichern als `img/karten/<Karten-ID>.webp` (oder `.jpg`/`.png`), z. B. `img/karten/its-drache.webp`.
4. Claude Bescheid geben: Die Datei wird in `BILDER` in `js/games-gfx.js` eingetragen und geprüft.

Tipp: Bilder, die gut zusammenpassen, entstehen, wenn du alle Karten eines Fachs im **selben Gemini-Chat** erzeugst und bei Abweichungen sagst: „gleicher Stil wie das erste Bild“.

## Stil-Vorspann (immer davor)
> Digital painted trading card creature art in the style of a modern fantasy card game (Legends of Runeterra / Hearthstone quality). One single creature, centered, full body visible, dynamic heroic pose, dramatic rim lighting, rich saturated colors, painterly details, soft depth of field background with a simple atmospheric environment. The creature is themed around German vocational IT training. **No text, no letters, no numbers, no logos, no card frame, no border.** Landscape 3:2.

Farbwelt je Fach (an den Vorspann anhängen):
- **WBL** (Arbeitswelt & Recht): *color palette teal and emerald green with warm gold accents, office / workshop / court environment*
- **ITS** (IT-Sicherheit): *color palette orange and ember red with dark steel, server room / cyber environment*
- **AEW** (Anwendungsentwicklung): *color palette violet and electric blue, glowing code and circuit environment*

## Motive

### WBL – Wirtschafts- und Betriebslehre
| ID | Karte | Motiv |
|---|---|---|
| `wbl-wichtel` | Azubi-Wichtel | a small cheerful goblin apprentice in an oversized work vest, holding a clipboard and a pencil, eager expression |
| `wbl-stechuhr` | Stechuhr-Golem | a stocky stone golem whose chest is an old punch clock, glowing clock face, arms crossed, guarding a factory gate |
| `wbl-phantom` | Probezeit-Phantom | a translucent ghost in a business shirt and tie, half faded away, holding a contract that dissolves into mist |
| `wbl-salamander` | Arbeitsschutz-Salamander | a friendly fire salamander wearing a yellow safety helmet, safety goggles and gloves |
| `wbl-golem` | Paragrafen-Golem | a massive golem built from law books and stone tablets engraved with paragraph symbols, shield raised |
| `wbl-unterweisung` | Unterweisung | a glowing instruction scroll unrolling in the air above a workbench, safety pictograms shining (spell, no creature) |
| `wbl-abmahnung` | Abmahnung | a red official warning letter with a wax seal, crackling with red energy, pinned by a dagger (trap, no creature) |
| `wbl-greif` | Tarif-Greif | a proud griffin with golden feathers clutching a scroll of a wage agreement, diving forward |
| `wbl-einhorn` | Jugendschutz-Einhorn | a gentle white unicorn with a glowing protective aura around a small group of young apprentices |
| `wbl-vereinbarung` | Betriebsvereinbarung | many hands from different workers stacked on a glowing golden document on a round table (spell) |
| `wbl-kuendigungsschutz` | Kündigungsschutz | a huge translucent golden shield blocking a door that is being slammed shut (trap) |
| `wbl-mammut` | Mindestlohn-Mammut | a mighty woolly mammoth carrying a golden coin on its back like a monument, calm and strong |
| `wbl-koloss` | IHK-Kammer-Koloss | a colossal armored titan made of an old chamber building with columns, holding a giant stamp |
| `wbl-titan` | Betriebsrats-Titan | a giant titan formed from many united workers, shoulder to shoulder, raising a shield over the workforce |
| `wbl-hydra` | Prüfungsausschuss-Hydra | a legendary three-headed hydra, each head wearing examiner glasses, sitting behind a long exam table, intimidating and majestic |

### ITS – IT-Sicherheit
| ID | Karte | Motiv |
|---|---|---|
| `its-aal` | Phishing-Aal | a sly electric eel with a fishing lure hanging from its head, the lure shaped like an email envelope |
| `its-passwort` | Passwort-Golem | a small sturdy golem made of glowing padlocks and keys, one big lock on its chest |
| `its-spam` | Spam-Schwarm | a swarm of tiny winged envelope creatures buzzing like insects |
| `its-trojaner` | Trojaner-Ross | a wooden horse made of circuit boards with hidden glowing eyes inside, sneaky mood |
| `its-baer` | Backup-Bär | a big protective bear carrying stacked hard drives on its back, holding a copy of a glowing data crystal |
| `its-patchday` | Patch-Day | a glowing patch being stitched onto a cracked shield with streams of code (spell) |
| `its-honeypot` | Honeypot | a golden honey pot glowing temptingly in a dark server room, hidden sensor wires around it (trap) |
| `its-rabe` | Ransomware-Rabe | a dark raven with glowing orange eyes holding a padlock in its claws, chains around it |
| `its-hexe` | Hash-Hexe | a witch stirring a cauldron that turns text scrolls into glowing hash fingerprints |
| `its-barbar` | Brute-Force-Barbar | a huge barbarian smashing a giant keypad with a hammer, sparks flying |
| `its-verschluesselung` | Verschlüsselung | swirling glowing runes forming a sphere around a treasure chest, impenetrable (spell) |
| `its-zombie` | Zero-Day-Zombie | a glitching zombie emerging from a crack in a firewall, pixel fragments falling off |
| `its-sphinx` | DSGVO-Sphinx | a wise sphinx guarding a data vault, holding a scroll of rules, stern eyes |
| `its-botnetz` | Botnetz-Königin | a queen insect with a crown of antennas controlling a swarm of small robot bugs |
| `its-drache` | Firewall-Drache | a legendary dragon made of burning brick walls and flames, wings spread, guarding a glowing server tower |

### AEW – Anwendungsentwicklung
| ID | Karte | Motiv |
|---|---|---|
| `aew-kaefer` | Bug-Käfer | a cute but mischievous beetle with glowing code patterns on its shell |
| `aew-schleim` | Syntax-Schleim | a wobbly purple slime with a missing semicolon floating inside, confused face |
| `aew-eule` | Debug-Eule | a wise owl with magnifying-glass monocle, perched on a laptop, examining a tiny bug |
| `aew-phantom` | Null-Pointer-Phantom | a ghost pointing its finger into an empty void, arrow-shaped aura |
| `aew-wurm` | Endlosschleifen-Wurm | a long worm curled into an infinity loop, biting its own tail, glowing |
| `aew-refactoring` | Refactoring | messy tangled wires transforming into clean glowing geometric structures (spell) |
| `aew-breakpoint` | Breakpoint | a glowing red stop sign orb freezing a charging creature in mid-air (trap) |
| `aew-luchs` | Lambda-Luchs | a fast lynx leaping, trail of glowing lambda-shaped light (no letters) |
| `aew-basilisk` | Binär-Basilisk | a serpent basilisk with patterns of ones and zeros as scales, hypnotic glowing eyes |
| `aew-stapel` | Stapel-Golem | a golem made of stacked glowing blocks, the top block floating |
| `aew-review` | Code-Review | two glowing eyes looking through large reading glasses at floating code panels (spell) |
| `aew-schlange` | Rekursions-Schlange | a snake whose tail becomes a smaller copy of itself, again and again, spiral composition |
| `aew-kraken` | Compiler-Kraken | a giant kraken whose tentacles hold floating code blocks and turn them into glowing machine parts |
| `aew-titan` | Stack-Overflow-Titan | an enormous titan made of overflowing stacked blocks, crumbling at the top, overwhelming |
| `aew-drache` | Algorithmus-Kristalldrache | a legendary crystal dragon with flowchart-like glowing veins, majestic, prismatic light |

### Spielmarken (optional)
| ID | Motiv |
|---|---|
| `tok-bug` | a tiny beetle bug, simple |
| `tok-spam` | a tiny winged envelope creature |
| `tok-rekursion` | a tiny spiral snake |
