/* Lernwerk – Fragen-Datenbank
   Regel: Nur Wissen aus dem Unterricht (Arbeitsblätter, Lehrerlösungen, Lehrbuchseiten).
   Jede Einheit trägt ihre Quelle. ap1:true = Zusatzwissen für die IHK-Prüfung (abschaltbar).
   Typen: K = Karteikarte (frage/antwort), M = Multiple Choice (optionen [text, richtig, warum]). */
(function () {
  const F = {
    faecher: [
      { id: 'wbl', name: 'WBL', lang: 'Wirtschafts- und Betriebslehre', farbe: 'wbl' },
      { id: 'its1', name: 'ITS1', lang: 'IT-Systeme 1 · Lernfeld 4', farbe: 'its1' },
      { id: 'aew', name: 'AEW', lang: 'Anwendungsentwicklung · Lernfeld 5', farbe: 'aew' },
      { id: 'its2', name: 'ITS2', lang: 'IT-Systeme 2', farbe: 'its2', bald: true },
      { id: 'dk', name: 'DK', lang: 'Deutsch / Kommunikation', farbe: 'dk', bald: true },
    ],
    themen: [
      { id: 'wbl-dual', fach: 'wbl', name: 'Duales System und Beteiligte' },
      { id: 'wbl-vertrag', fach: 'wbl', name: 'Ausbildungsvertrag, Kammer, Ausbildungsordnung' },
      { id: 'wbl-pflichten', fach: 'wbl', name: 'Rechte, Pflichten, Kündigung' },
      { id: 'wbl-jarbschg', fach: 'wbl', name: 'Jugendarbeitsschutzgesetz' },
      { id: 'wbl-schutz', fach: 'wbl', name: 'Arbeitsschutz' },
      { id: 'wbl-arbeit', fach: 'wbl', name: 'Arbeitswelt und Arbeitsleistung' },
      { id: 'wbl-beruf', fach: 'wbl', name: 'Ausbildungsberuf Fachinformatiker' },
      { id: 'its-dsgvo', fach: 'its1', name: 'Datenschutz und DSGVO' },
      { id: 'its-cia', fach: 'its1', name: 'CIA-Dreieck und Hashwerte' },
      { id: 'its-mass', fach: 'its1', name: 'Maßnahmen und Gefährdungen' },
      { id: 'its-pw', fach: 'its1', name: 'Passwörter und 2-Faktor', rechnen: ['bruteforce'] },
      { id: 'aew-last', fach: 'aew', name: 'Lasten- und Pflichtenheft' },
      { id: 'aew-uc', fach: 'aew', name: 'Anforderungen und Use-Case' },
      { id: 'aew-typ', fach: 'aew', name: 'Datentypen (Java)' },
      { id: 'aew-zahl', fach: 'aew', name: 'Daten und Zahlensysteme', rechnen: ['dez2bin', 'bin2dez', 'dez2hex', 'hex2dez', 'bin2hex', 'zk2bin', 'zk2dez', 'ascii2bin', 'bin2ascii'] },
    ],
    einheiten: [],
  };
  const E = F.einheiten;
  const K = (id, thema, frage, antwort, quelle, punkte = 2, extra = {}) => E.push({ id, thema, typ: 'K', frage, antwort, quelle, punkte, ...extra });
  const M = (id, thema, frage, optionen, quelle, punkte = 2, extra = {}) => E.push({ id, thema, typ: 'M', frage, optionen, quelle, punkte, ...extra });

  /* ================= WBL ================= */
  const KL5 = 'WBL · Arbeitsblatt S. 5 (Klett)', B156 = 'WBL · Buch S. 156', AB68 = 'WBL · Arbeitsblatt S. 6–8', B160 = 'WBL · Buch S. 160', AB1617 = 'WBL · Arbeitsblatt S. 16–17 (Karin)';

  K('w1', 'wbl-dual', 'Was versteht man unter dem dualen System?', 'Ausbildung an **zwei Lernorten**: im **Betrieb** (Praxis: Fertigkeiten, Kenntnisse) und in der **Berufsschule** (Theorie, Lern- und Arbeitstechniken, Allgemeinbildung). Evtl. ergänzt durch überbetriebliche Ausbildungsstätten.', B156 + ' Aufg. 1a');
  K('w2', 'wbl-dual', 'Welche Aufgaben haben Berufsschule, Betrieb und überbetriebliche Ausbildungsstätte?', '**Schule:** Theorie, Lern- und Arbeitstechniken, Allgemeinbildung\n**Betrieb:** Praxis\n**Überbetrieblich:** das, was der Betrieb nicht abdecken kann', B156 + ' Aufg. 1b', 3);
  K('w3', 'wbl-dual', 'Was ist der Unterschied zwischen einer dualen und einer vollzeitschulischen Ausbildung?', '**Dual:** Schule + Betrieb.\n**Vollzeitschulisch:** überwiegend in der Schule + Praktika (z. B. Pflege, Erzieher, Assistentenberufe). Ziele reichen von Berufsvorbereitung bis zum höheren Schulabschluss.', B156 + ' Aufg. 2');
  K('w4', 'wbl-dual', 'Nenne zwei Vorteile und zwei Nachteile des dualen Systems.', '**Vorteile:** praxisbezogen, spart dem Staat Geld (rein schulisch teurer), abwechslungsreicher.\n**Nachteile:** Ausbildungsplätze hängen von der **Wirtschaftslage** statt vom **Bedarf** ab, unterschiedliche **Qualität**, **Abstimmung** Betrieb–Schule schwierig.', KL5 + ' Aufg. 2', 4);
  M('w5', 'wbl-dual', 'Wer ist der **Ausbildende**?', [
    ['Der Betrieb bzw. das Unternehmen – der Vertragspartner', true, 'Richtig: Der Ausbildende schließt den Vertrag mit dem Azubi.'],
    ['Die Person im Betrieb, die die Ausbildung durchführt', false, 'Das ist der **Ausbilder**.'],
    ['Die Person, die die Ausbildung macht', false, 'Das ist der **Auszubildende**.'],
    ['Die IHK', false, 'Die IHK ist die **zuständige Stelle**.'],
  ], B156 + ' Aufg. 3');
  M('w6', 'wbl-dual', 'Was muss ein **Ausbilder** mitbringen?', [
    ['Fachliche und persönliche Eignung (Ausbildereignung)', true, 'Genau das prüft auch die Kammer.'],
    ['Einen Meistertitel in jedem Fall', false, 'Nicht zwingend – verlangt ist die Eignung.'],
    ['Mindestens 10 Jahre Berufserfahrung', false, 'Verlangt ist die Eignung – keine feste Anzahl an Jahren.'],
    ['Mitgliedschaft im Betriebsrat', false, 'Hat mit der Ausbilderrolle nichts zu tun.'],
  ], 'WBL · Beteiligte im Ausbildungsverhältnis (Buch S. 152–156)');
  K('w7', 'wbl-dual', 'Welches Zeugnis bekommt man vom Betrieb/Kammer und welches von der Berufsschule?', 'Betrieb/Kammer: Abschlussprüfung vor der Kammer → **Facharbeiterbrief / Kammerzeugnis**.\nBerufsschule: Zeugnisnoten → **Abschlusszeugnis der Berufsschule**.\nDazu kommt das **Zeugnis des Betriebs**.', KL5 + ' Aufg. 1');
  K('w8', 'wbl-dual', 'Was ist die JAV und in welchen Betrieben gibt es sie?', '**Jugend- und Auszubildendenvertretung.** Nur in Betrieben **mit Betriebsrat** und mindestens **5** Jugendlichen/Azubis unter 25. Amtszeit **2 Jahre**.', 'WBL · Beteiligte (Buch S. 152–156)');

  K('w10', 'wbl-vertrag', 'Wer unterschreibt den Ausbildungsvertrag und welche Form gilt?', '**Ausbildender und Auszubildender**, bei Minderjährigen zusätzlich der **gesetzliche Vertreter**. Der Vertrag muss **vor Beginn schriftlich** niedergelegt werden (§ 11 BBiG).', AB68 + ' Aufg. 2', 3);
  K('w11', 'wbl-vertrag', 'Nenne fünf Mindestangaben im Ausbildungsvertrag (§ 11 BBiG).', 'Ausbildungsberuf und Ziel · sachliche/zeitliche Gliederung · Beginn und Dauer · Maßnahmen außerhalb des Betriebs · tägliche Arbeitszeit · **Probezeit** · Vergütung · Urlaub · Kündigungsvoraussetzungen · Hinweis auf Tarifverträge · Form des Ausbildungsnachweises', AB68 + ' Aufg. 1', 5);
  K('w12', 'wbl-vertrag', 'Was prüft die Kammer (IHK) beim Ausbildungsvertrag?', 'Ob der Vertrag zur **Ausbildungsordnung** passt, die **Eignung der Ausbildungsstätte** und die **Eignung des Ausbilders**. Dann Eintrag ins **Verzeichnis der Berufsausbildungsverhältnisse**.', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  K('w13', 'wbl-vertrag', 'Nenne drei weitere Aufgaben der Kammer.', 'Überwacht die Ausbildung · bildet **Prüfungsausschüsse** · organisiert Prüfungen und erlässt Prüfungsvorschriften · entscheidet über Verkürzung/Verlängerung · Fortbildungen · **Ansprechpartner bei Problemen**', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  M('w14', 'wbl-vertrag', 'Welche Vorschriften gelten für die Ausbildung – in welcher Rangfolge? (links = wichtigste)', [
    ['BBiG → Ausbildungsordnung → Ausbildungsrahmenplan → betrieblicher Ausbildungsplan', true, 'Das Gesetz steht oben, der Plan des Betriebs unten.'],
    ['Ausbildungsordnung → BBiG → betrieblicher Plan → Rahmenplan', false, 'Das BBiG ist das Gesetz und steht ganz oben.'],
    ['Betrieblicher Plan → Rahmenplan → Ausbildungsordnung → BBiG', false, 'Genau umgekehrt.'],
    ['BBiG → betrieblicher Plan → Ausbildungsordnung → Rahmenplan', false, 'Der betriebliche Plan steht ganz unten.'],
  ], 'WBL · Rechtliche Rangfolge (Tafelbild)');
  K('w15', 'wbl-vertrag', 'Was muss eine Ausbildungsordnung enthalten (§ 5 BBiG)?', 'Bezeichnung des Ausbildungsberufs · Ausbildungsdauer (2–3 Jahre) · **Ausbildungsberufsbild** · **Ausbildungsrahmenplan** (sachliche + zeitliche Gliederung) · **Prüfungsanforderungen**', AB68 + ' Aufg. 6', 5);
  M('w16', 'wbl-vertrag', 'Darf der betriebliche Ausbildungsplan von der Ausbildungsordnung abweichen?', [
    ['Er darf mehr enthalten, aber nicht weniger', true, 'Richtig – die Ausbildungsordnung ist das Minimum.'],
    ['Er darf weniger enthalten, wenn der Betrieb klein ist', false, 'Nein, nie weniger.'],
    ['Er muss wörtlich identisch sein', false, 'Er darf mehr enthalten.'],
    ['Er ist freiwillig und kann entfallen', false, 'Er ist Teil des Vertrags und muss spätestens bei Beginn ausgehändigt werden.'],
  ], 'WBL · Beteiligte (Buch S. 152–156)');
  K('w17', 'wbl-vertrag', 'Wer überwacht die Einhaltung der Ausbildungsordnung?', 'Die **zuständige Stelle**, z. B. **IHK** (Fachinformatiker) oder HWK.', AB68 + ' Aufg. 6', 1);
  K('w18', 'wbl-vertrag', 'Was gehört in den Ausbildungsnachweis (Berichtsheft)?', 'Wöchentlich: betriebliche Tätigkeiten (mit Bezug zur Nr. im Rahmenplan) + Stunden, Unterweisungen/Schulungen, Berufsschulthemen, Unterschriften Azubi + Ausbilder. Darf **während der Arbeitszeit** geführt werden; der Betrieb muss es **überwachen**.', 'WBL · Muster Ausbildungsnachweis (BIBB)', 3);
  K('w19', 'wbl-vertrag', 'Wodurch endet eine Ausbildung?', 'Bestandene **Abschlussprüfung** · **Kündigung** · **Ablauf der Ausbildungszeit**', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  K('w20', 'wbl-vertrag', 'Was passiert, wenn man die Abschlussprüfung nicht besteht?', 'Sie kann **bis zu zweimal wiederholt** werden. Auf Verlangen verlängert sich die Ausbildung bis zur nächsten Wiederholungsprüfung (höchstens **1 Jahr**).', B156 + ' Aufg. 8');

  K('w30', 'wbl-pflichten', 'Welche Pflichten hast du als Azubi? (§ 13 BBiG)', '**Lern**pflicht · **Sorgfalts**pflicht · **Gehorsams**pflicht · **Schul**pflicht (Berufsschule, Prüfungen) · **Nachweis**pflicht (Berichtsheft) · **Schweige**pflicht · **Wettbewerbsverbot**', B160 + ' Aufg. 3', 4);
  K('w31', 'wbl-pflichten', 'Welche Pflichten hat der Ausbildungsbetrieb? (§§ 14–17 BBiG)', '**Ausbildungs**pflicht (Ausbilder stellen, Mittel kostenlos) · **Fürsorge**pflicht (nur ausbildungsdienliche Arbeiten) · **Vergütungs**pflicht · **Freistellungs**pflicht (Berufsschule, Prüfungen) · **Zeugnis**pflicht', B160 + ' Aufg. 3', 4);
  K('w32', 'wbl-pflichten', 'Was ist das Wettbewerbsverbot?', 'Azubis dürfen dem Ausbildungsbetrieb **keine Konkurrenz** machen, z. B. durch **Schwarzarbeit**. Folge: Schadenersatz oder Kündigung.', B160 + ' Aufg. 4');
  M('w33', 'wbl-pflichten', 'Klaras Chef sagt: „Die Berufsschule ist unnötig, du bleibst im Betrieb." Welche Pflicht verletzt er?', [
    ['Freistellungspflicht', true, 'Der Betrieb muss für Berufsschule und Prüfungen freistellen.'],
    ['Vergütungspflicht', false, 'Es geht nicht ums Geld.'],
    ['Zeugnispflicht', false, 'Um das Zeugnis geht es hier nicht.'],
    ['Gehorsamspflicht', false, 'Das ist eine Pflicht des Azubis.'],
  ], AB68 + ' Aufg. 7 (Klara Korte)');
  M('w34', 'wbl-pflichten', 'Klara soll im Haushalt der Chefin putzen. Welche Pflicht wird verletzt?', [
    ['Fürsorgepflicht – nur ausbildungsdienliche Arbeiten', true, 'Private Arbeiten gehören nicht zur Ausbildung.'],
    ['Schweigepflicht', false, 'Hier wird kein Geheimnis verraten.'],
    ['Wettbewerbsverbot', false, 'Das Wettbewerbsverbot ist eine Pflicht des Azubis.'],
    ['Lernpflicht', false, 'Das ist eine Pflicht des Azubis.'],
  ], AB68 + ' Aufg. 7 (Klara Korte)');
  M('w35', 'wbl-pflichten', 'Klara erzählt Freunden von Umsatz und Schulden des Betriebs. Welche Pflicht verletzt sie?', [
    ['Schweigepflicht', true, 'Betriebsgeheimnisse dürfen nicht weitergegeben werden.'],
    ['Sorgfaltspflicht', false, 'Die betrifft sorgfältiges Arbeiten.'],
    ['Gehorsamspflicht', false, 'Die betrifft Weisungen.'],
    ['Nachweispflicht', false, 'Die betrifft das Berichtsheft.'],
  ], AB68 + ' Aufg. 7 (Klara Korte)');
  M('w36', 'wbl-pflichten', 'Welche Aussagen zur Probezeit stimmen?', [
    ['Sie dauert 1 bis 4 Monate', true, 'Genau so steht es im BBiG.'],
    ['In der Probezeit können beide jederzeit ohne Frist und ohne Grund kündigen', true, 'Aber immer schriftlich.'],
    ['Die Probezeit darf 6 Monate dauern', false, 'Höchstens 4 Monate.'],
    ['In der Probezeit darf mündlich gekündigt werden', false, 'Kündigung immer schriftlich (Fall Enno: unwirksam).'],
  ], B160 + ' Aufg. 2', 3, { mehrfach: true });
  K('w37', 'wbl-pflichten', 'Wozu dient die Probezeit?', 'Der **Betrieb** prüft, ob der Azubi geeignet ist (Leistung, Verhalten). Der **Azubi** prüft, ob Beruf und Betrieb zu ihm passen.', 'WBL · Arbeitsblatt S. 7 (Schaubild 5)');
  M('w38', 'wbl-pflichten', 'Wie kann der **Betrieb** nach der Probezeit kündigen?', [
    ['Nur fristlos aus einem wichtigen Grund – schriftlich und mit Begründung', true, 'Eine ordentliche Kündigung gibt es für den Betrieb nicht.'],
    ['Mit 4 Wochen Frist ohne Grund', false, 'Das gibt es nur für den Azubi bei Berufsaufgabe/-wechsel.'],
    ['Jederzeit mündlich', false, 'Immer schriftlich.'],
    ['Gar nicht', false, 'Aus wichtigem Grund (z. B. Diebstahl) schon.'],
  ], B160 + ' Aufg. 6');
  M('w39', 'wbl-pflichten', 'Wie kann der **Azubi** nach der Probezeit kündigen?', [
    ['Mit 4 Wochen Frist, wenn er den Beruf wechselt oder die Ausbildung aufgibt', true, 'Schriftlich mit Grund.'],
    ['Fristlos bei grober Pflichtverletzung des Betriebs', true, 'Aus wichtigem Grund geht es fristlos.'],
    ['Fristlos, um im gleichen Beruf zu einem anderen Betrieb zu wechseln', false, 'Unwirksam (Fall Ina) – nur per Aufhebungsvertrag möglich.'],
    ['Mündlich mit 2 Wochen Frist', false, 'Immer schriftlich, Frist 4 Wochen.'],
  ], B160 + ' Aufg. 6/7', 3, { mehrfach: true });
  M('w40', 'wbl-pflichten', 'Anna nennt ihren Ausbilder „fauler Sack". Der Betrieb kündigt fristlos. Wirksam?', [
    ['Ja – Beleidigung ist ein wichtiger Grund', true, 'Deshalb ist die fristlose Kündigung wirksam.'],
    ['Nein – nach der Probezeit darf der Betrieb nie kündigen', false, 'Aus wichtigem Grund darf er.'],
    ['Nein – er müsste 4 Wochen Frist einhalten', false, 'Bei wichtigem Grund fristlos.'],
  ], B160 + ' Aufg. 7b');
  M('w41', 'wbl-pflichten', 'Sandro repariert privat gegen Geld Autos in der Werkstatt seines Betriebs. Was stimmt?', [
    ['Verstoß gegen das Wettbewerbsverbot', true, 'Schwarzarbeit macht dem Betrieb Konkurrenz.'],
    ['Erlaubt, weil es nach Feierabend ist', false, 'Trotzdem Konkurrenz zum Betrieb.'],
    ['Verstoß gegen die Zeugnispflicht', false, 'Die betrifft den Betrieb.'],
  ], B160 + ' Aufg. 5e');
  M('w42', 'wbl-pflichten', 'Lea soll für die Zwischenprüfung Urlaub nehmen. Was stimmt?', [
    ['Verstoß – der Betrieb muss für Prüfungen freistellen', true, 'Freistellungspflicht.'],
    ['In Ordnung, Prüfungen sind Privatsache', false, 'Nein, Freistellung ist Pflicht.'],
    ['In Ordnung, wenn sie volljährig ist', false, 'Gilt für alle Azubis.'],
  ], B160 + ' Aufg. 5f');

  const JQ = AB1617;
  M('w50', 'wbl-jarbschg', 'Wie lange dürfen Jugendliche höchstens arbeiten?', [
    ['8 Stunden am Tag, 40 Stunden in der Woche, 5 Tage', true, '§§ 8, 9, 15 JArbSchG.'],
    ['10 Stunden am Tag, 48 in der Woche', false, 'Das wäre zu viel.'],
    ['8 Stunden am Tag, 6 Tage die Woche', false, 'Nur 5 Tage.'],
  ], JQ + ' Zusammenfassung');
  M('w51', 'wbl-jarbschg', 'Karin (16) arbeitet 7 Stunden. Wie lang muss die Pause sein?', [
    ['60 Minuten', true, 'Bei mehr als 6 Stunden Arbeit: 60 Minuten Pause, in Blöcken von mindestens 15 Minuten.'],
    ['30 Minuten', false, '30 min gelten bei 4,5–6 Stunden.'],
    ['45 Minuten', false, 'Die Regel für Erwachsene – nicht für Jugendliche.'],
    ['25 Minuten reichen, wenn sie früher gehen darf', false, 'Verstoß (Karin Aufg. 2).'],
  ], JQ + ' Aufg. 2');
  M('w52', 'wbl-jarbschg', 'Nach 4 Stunden Unterricht fällt der Rest aus. Muss Karin (16) noch in den Betrieb?', [
    ['Ja – erst bei mehr als 5 Unterrichtsstunden ist der Tag erledigt', true, 'Einmal pro Woche zählt ein Schultag mit mehr als 5 Unterrichtsstunden als ganzer Arbeitstag.'],
    ['Nein – jeder Schultag ist komplett frei', false, 'Nur bei mehr als 5 Unterrichtsstunden.'],
    ['Nur wenn der Chef anruft', false, 'Sie muss zurück in den Betrieb.'],
  ], JQ + ' Aufg. 3');
  K('w53', 'wbl-jarbschg', 'Wie viel Urlaub bekommen Jugendliche? (Stichtag?)', 'Alter am **1.1.** zählt:\n- unter 16 → **30 Werktage**\n- unter 17 → **27 Werktage**\n- unter 18 → **25 Werktage**', JQ + ' Aufg. 8', 3);
  M('w54', 'wbl-jarbschg', 'Titus ist 17 und bekommt 24 Tage Urlaub. Was stimmt?', [
    ['Verstoß – ihm stehen mindestens 25 Werktage zu', true, 'Unter 18 → 25 Werktage.'],
    ['In Ordnung', false, '24 ist zu wenig.'],
    ['Ihm stehen 30 Werktage zu', false, '30 gelten nur unter 16.'],
  ], B160 + ' Aufg. 5b');
  M('w55', 'wbl-jarbschg', 'Karin (16) ist von 7 bis 20 Uhr im Betrieb, mit Pause von 12 bis 17 Uhr. Sie beschwert sich. Hat sie recht?', [
    ['Ja – die Schichtzeit beträgt 13 Stunden, erlaubt sind 10', true, 'Schichtzeit = Arbeitszeit + Pausen. Für Jugendliche höchstens 10 Stunden.'],
    ['Nein – sie arbeitet ja nur 8 Stunden', false, 'Die Schichtzeit ist das Problem.'],
    ['Nein – Jugendliche dürfen bis 20 Uhr arbeiten', false, 'Uhrzeit ok, Schichtzeit nicht.'],
  ], JQ + ' Aufg. 4');
  K('w56', 'wbl-jarbschg', 'Welche Arbeiten sind für Jugendliche verboten? (§§ 22, 23 JArbSchG)', '**Gefährliche Arbeiten**, **Akkordarbeit** und Arbeiten über der Leistungsfähigkeit.', JQ + ' Aufg. 6');
  K('w57', 'wbl-jarbschg', 'Welche ärztlichen Untersuchungen schreibt das JArbSchG vor?', '**Erstuntersuchung** höchstens 14 Monate vor Beginn (ohne sie keine Beschäftigung!) und **Nachuntersuchung** im ersten Jahr.', JQ + ' Aufg. 7');
  K('w58', 'wbl-jarbschg', 'Freizeit, Uhrzeit, Wochenende – was gilt für Jugendliche?', 'Mind. **12 h** Freizeit zwischen zwei Arbeitstagen · Arbeit nur **6–20 Uhr** · Samstag nur in Branchen mit Samstagsarbeit + freier Ersatztag · Sonntag fast nur Gastronomie/Gesundheit', 'WBL · Buch S. 157–160', 3);
  M('w59', 'wbl-jarbschg', 'Miro (17) soll wegen eines Großauftrags an Berufsschultagen im Betrieb arbeiten. Was stimmt?', [
    ['Unzulässig – Schulpflicht und Freistellung gehen vor', true, 'Ein Großauftrag ist kein Ausbildungszweck.'],
    ['Zulässig, wenn er freiwillig zustimmt', false, 'Auch freiwillig nicht (vgl. Karin Aufg. 5).'],
    ['Zulässig, wenn er Überstunden bezahlt bekommt', false, 'Geld ändert nichts.'],
  ], 'WBL · Buch S. 157 (Ausgangssituation Miro)');
  K('w60', 'wbl-jarbschg', 'Wer überwacht das Jugendarbeitsschutzgesetz, und für wen gilt es?', 'Gilt für Jugendliche **unter 18** (unter 15 = Kind → Kinderarbeit verboten). Überwachung: **Gewerbeaufsichtsamt** / Arbeitsschutzbehörde.', JQ + ' Zusammenfassung');

  K('w70', 'wbl-schutz', 'Was ist der Unterschied zwischen technischem und sozialem Arbeitsschutz?', '**Technisch:** sichere Maschinen, Geräte und Arbeitsräume (UVV, Arbeitsstättenverordnung, Produktsicherheitsgesetz).\n**Sozial:** schützt bestimmte Personengruppen und regelt Arbeitszeiten (JArbSchG, ArbZG, MuSchG, SGB IX).', 'WBL · Arbeitsblatt S. 18', 4);
  M('w71', 'wbl-schutz', 'Wer erlässt die Unfallverhütungsvorschriften (UVV)?', [
    ['Die Berufsgenossenschaften', true, 'Träger der gesetzlichen Unfallversicherung.'],
    ['Die IHK', false, 'Die IHK ist für die Ausbildung zuständig.'],
    ['Der Betriebsrat', false, 'Er überwacht mit, erlässt aber keine UVV.'],
    ['Das Gewerbeaufsichtsamt', false, 'Es überwacht staatlich.'],
  ], 'WBL · Arbeitsblatt S. 18');
  M('w72', 'wbl-schutz', 'Welche Gesetze gehören zum **sozialen** Arbeitsschutz?', [
    ['Jugendarbeitsschutzgesetz', true, 'Schützt jugendliche Arbeitnehmer.'],
    ['Mutterschutzgesetz', true, 'Schützt Schwangere und Mütter.'],
    ['Arbeitszeitgesetz', true, 'Regelt Höchstarbeitszeiten und Pausen.'],
    ['Produktsicherheitsgesetz', false, 'Technischer Arbeitsschutz (sichere Geräte).'],
    ['Arbeitsstättenverordnung', false, 'Technischer Arbeitsschutz (Räume, Licht, Lärm).'],
  ], 'WBL · Arbeitsblatt S. 18', 3, { mehrfach: true });
  K('w73', 'wbl-schutz', 'Wie lange dürfen Erwachsene am Tag arbeiten und wie viel Ruhezeit brauchen sie? (Arbeitszeitgesetz)', 'Max. **8 h/Tag** (bis **10 h**, wenn der Durchschnitt über 6 Monate 8 h bleibt). **11 h Ruhezeit** zwischen zwei Arbeitstagen.', 'WBL · Arbeitsblatt S. 18');
  K('w74', 'wbl-schutz', 'Nenne drei Regeln des Mutterschutzgesetzes.', 'Beschäftigungsverbot **6 Wochen vor** und **8 Wochen nach** der Geburt · besonderer **Kündigungsschutz** · keine schweren/gefährlichen Arbeiten, keine Nacht-, Sonntags- und Mehrarbeit · Mutterschaftsgeld', 'WBL · Arbeitsblatt S. 18', 3);
  K('w75', 'wbl-schutz', 'Wer überwacht den Arbeitsschutz?', 'Staatlich das **Gewerbeaufsichtsamt / Amt für Arbeitsschutz** und die **Berufsgenossenschaften**. Im Betrieb zusätzlich Betriebsrat, Sicherheitsbeauftragte, Betriebsarzt.', 'WBL · Arbeitsblatt S. 18');
  K('w76', 'wbl-schutz', 'Nenne Ursachen und Folgen von Arbeitsunfällen.', '**Ursachen:** ungenügende Schutzvorrichtungen, **menschliche** Fehler (Unachtsamkeit, Hektik, Alkohol), **technisches** Versagen.\n**Folgen:** Verletzter (Schmerzen, Verdienstausfall), Betrieb (Ausfall, höhere BG-Beiträge), Gesellschaft (Kosten für Behandlung, Reha, Renten).', 'WBL · Aufgabensammlung Klett S. 14', 4);
  M('w77', 'wbl-schutz', 'Was bedeutet ein **blaues, rundes** Sicherheitszeichen?', [
    ['Gebotszeichen – etwas muss getan werden (z. B. Fußschutz benutzen)', true, 'Blau = Gebot.'],
    ['Verbotszeichen', false, 'Verbot = rot durchgestrichen.'],
    ['Warnzeichen', false, 'Warnung = gelbes Dreieck.'],
  ], 'WBL · Arbeitsblatt S. 18');
  K('w78', 'wbl-schutz', 'Was regelt der Schwerbehindertenschutz (SGB IX)?', 'Teilhabe fördern, **besonderer Kündigungsschutz**, **Zusatzurlaub (5 Tage)**, Freistellung von Mehrarbeit auf Verlangen.', 'WBL · Arbeitsblatt S. 18');

  K('w90', 'wbl-arbeit', 'Was ist der Unterschied zwischen Fortbildung und Umschulung?', '**Fortbildung** baut auf dem erlernten Beruf auf (Meister, Techniker, Fachwirt).\n**Umschulung** bereitet auf einen **anderen** Beruf vor (z. B. nach Unfall, wenn der Beruf wegfällt).', 'WBL · Arbeitsblatt S. 9');
  M('w91', 'wbl-arbeit', 'Was fördert das **BAföG**?', [
    ['Schulische Bildungsmaßnahmen', true, 'Bundesausbildungsförderungsgesetz.'],
    ['Berufliche Weiterbildung, Fortbildung und Umschulung', false, 'Das fördert das SGB.'],
    ['Nur Studium im Ausland', false, 'Das BAföG fördert allgemein schulische Bildung – nicht nur im Ausland.'],
  ], 'WBL · Arbeitsblatt S. 9');
  M('w92', 'wbl-arbeit', 'Was ist **job enrichment**?', [
    ['Aufgabenbereicherung – mehr Entscheidungsspielraum', true, 'Qualitativ mehr Verantwortung.'],
    ['Aufgabenerweiterung – mehrere Arbeitselemente zu einer Aufgabe', false, 'Das ist job enlargement.'],
    ['Aufgabenwechsel bei eintönigen Arbeiten', false, 'Das ist job rotation.'],
  ], 'WBL · Arbeitsblatt S. 11 (Humanisierung)');
  M('w93', 'wbl-arbeit', 'Was ist **job rotation**?', [
    ['Häufiger Aufgabenwechsel bei eintönigen Arbeiten', true, 'Gegen Monotonie.'],
    ['Aufgabenbereicherung', false, 'Das ist job enrichment.'],
    ['Schichtarbeit rund um die Uhr', false, 'Mit Schichtarbeit hat job rotation nichts zu tun.'],
  ], 'WBL · Arbeitsblatt S. 11 (Humanisierung)');
  M('w94', 'wbl-arbeit', '„Montag ist der leistungsstärkste Tag der Woche." Stimmt das?', [
    ['Nein – Montag ist Anlaufphase, das Hoch liegt Dienstag/Mittwoch', true, 'Wochenkurve: Anlauf, Hoch, Abfall zum Freitag.'],
    ['Ja – nach dem Wochenende ist man ausgeruht', false, 'Die Aussage im Arbeitsblatt ist falsch.'],
  ], 'WBL · Arbeitsblatt S. 10');
  K('w95', 'wbl-arbeit', 'Nenne je zwei Vor- und Nachteile der betrieblichen Arbeitsteilung.', '**Vorteile:** höhere Produktivität, Spezialisierung/Übung, gleichmäßige Qualität, geringere Kosten.\n**Nachteile:** Monotonie, einseitige Belastung, Abhängigkeit (fällt einer aus, stockt alles), kein Bezug zum Endprodukt.', 'WBL · Klett S. 8 (Wohnland AG)', 4);
  K('w96', 'wbl-arbeit', 'Wohnland AG: Ohne Arbeitsteilung baut jeder der 3 Tischler einen Tisch in 8 Stunden. Wie viele Tische schaffen die drei am Tag mit Arbeitsteilung?', 'Jeder macht nur, was er am schnellsten kann (je 2 h): **6 h statt 24 h** Gesamtzeit je Tisch → bei 8 h Arbeitszeit **4 statt 3 Esstische** pro Tag.', 'WBL · Klett S. 8 (Wohnland AG)', 3);
  K('w97', 'wbl-arbeit', 'Nenne fünf Stressoren am Arbeitsplatz.', 'Zeitdruck · Lärm · Überforderung · Monotonie/Unterforderung · Konflikte/Mobbing · ständige Unterbrechungen · Schichtarbeit · unklare Anweisungen · Angst um den Arbeitsplatz', 'WBL · Arbeitsblatt S. 10', 5);
  K('w98', 'wbl-arbeit', 'Wodurch steigt die Leistungsbereitschaft?', 'Anerkennung und Lob · gerechte Bezahlung · gutes Betriebsklima · interessante Aufgaben · Aufstiegschancen · Mitbestimmung · gute Arbeitsbedingungen', 'WBL · Arbeitsblatt S. 10', 3);
  M('w99', 'wbl-arbeit', 'Welche Art von Arbeit macht ein **Fachinformatiker**?', [
    ['Gelernte Arbeit', true, 'Abgeschlossene Ausbildung.'],
    ['Angelernte Arbeit', false, 'Angelernt = kurz eingewiesen (z. B. Fließband).'],
    ['Ungelernte Arbeit', false, 'Ungelernt = Aushilfe.'],
  ], 'WBL · Klett S. 9 (Arten der Arbeit)', 1);

  K('w110', 'wbl-beruf', 'Nenne die vier Fachrichtungen des Fachinformatikers.', '**Anwendungsentwicklung**, **Systemintegration**, **Daten- und Prozessanalyse**, **Digitale Vernetzung** (die letzten beiden seit 2020 neu).', 'WBL · BIBB „Ausbildung gestalten: Fachinformatiker/-in"', 2);
  M('w111', 'wbl-beruf', 'Die Abschlussprüfung hat zwei Teile („gestreckt"). Wann ist Teil 1 und wie viel zählt er?', [
    ['Im 4. Ausbildungshalbjahr, 90 min schriftlich, 20 %', true, 'Prüfungsbereich „Einrichten eines IT-gestützten Arbeitsplatzes".'],
    ['Am Ende der Ausbildung, 50 %', false, 'Das ist die Projektarbeit in Teil 2.'],
    ['Im 2. Halbjahr, zählt nicht in die Note', false, 'Bei der gestreckten Prüfung zählt Teil 1 mit.'],
  ], 'WBL · BIBB Fachinformatiker (Prüfung)');
  K('w112', 'wbl-beruf', 'Wie ist Teil 2 der Abschlussprüfung (Anwendungsentwicklung) aufgebaut?', '- **Softwareprojekt**: Projektarbeit max. **80 h** + Doku, Präsentation (max. 15 min) + Fachgespräch → **50 %**\n- Planen eines Softwareproduktes, 90 min → 10 %\n- Entwicklung und Umsetzung von Algorithmen, 90 min → 10 %\n- Wirtschafts- und Sozialkunde, 60 min → 10 %', 'WBL · BIBB Fachinformatiker (Prüfung)', 4);
  K('w113', 'wbl-beruf', 'Wann ist die Abschlussprüfung bestanden?', 'Gesamtergebnis **mind. ausreichend**, **Teil 2** mind. ausreichend, **mind. drei Prüfungsbereiche** von Teil 2 ausreichend und **kein Bereich ungenügend**.', 'WBL · BIBB Fachinformatiker (Prüfung)', 4);
  K('w114', 'wbl-beruf', 'Wann ist eine mündliche Ergänzungsprüfung möglich?', 'Nur in **einem** Bereich (Planen eines Softwareproduktes, Algorithmen oder WiSo), wenn er schlechter als ausreichend ist und den Ausschlag geben kann. Gewichtung alt : neu = **2 : 1**.', 'WBL · BIBB Fachinformatiker (Prüfung)', 3);
  M('w115', 'wbl-beruf', 'Welches Lernfeld ist „Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen"?', [
    ['Lernfeld 4', true, '1. Ausbildungsjahr – euer ITS1-Thema.'],
    ['Lernfeld 5', false, 'LF 5 = Software zur Verwaltung von Daten anpassen (AEW).'],
    ['Lernfeld 2', false, 'LF 2 = Arbeitsplätze nach Kundenwunsch ausstatten.'],
  ], 'WBL · BIBB Fachinformatiker (Lernfelder)', 1);

  /* ================= ITS1 ================= */
  const DS = 'ITS1 · Arbeitsauftrag DSGVO und Umsetzung LF4', CIA = 'ITS1 · Arbeitsblatt 2a CIA-Dreieck';
  K('i1', 'its-dsgvo', 'Was ist der Unterschied zwischen Datenschutz und Datensicherheit?', '**Datenschutz** schützt **personenbezogene Daten** – Betroffene behalten die Kontrolle über ihre Daten.\n**Datensicherheit** schützt **alle Daten** vor Verlust, Diebstahl, Beschädigung und unbefugtem Zugriff (Vertraulichkeit, Integrität, Verfügbarkeit).', DS + ' Aufg. 1a/b', 4);
  K('i2', 'its-dsgvo', 'Was bedeutet das „Verbotsprinzip" im Datenschutz?', 'Die Verarbeitung personenbezogener Daten ist **grundsätzlich verboten** – erlaubt nur mit **Einwilligung** oder einer **gesetzlichen Grundlage** („Verbot mit Erlaubnisvorbehalt").', DS + ' Aufg. 1c', 3);
  M('i3', 'its-dsgvo', '„Daten dürfen nur so lange gespeichert werden, wie sie gebraucht werden." Welcher Grundsatz der DSGVO (Art. 5) ist das?', [
    ['Speicherbegrenzung', true, 'Die Speicherung ist zeitlich begrenzt.'],
    ['Datenminimierung', false, 'Datenminimierung = nur so viele Daten wie nötig.'],
    ['Zweckbindung', false, 'Zweckbindung = Zweck vorher festgelegt.'],
    ['Richtigkeit', false, 'Richtigkeit = Daten korrekt, Anspruch auf Korrektur.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i4', 'its-dsgvo', '„Es werden nur so viele Daten erhoben, wie für den Zweck nötig sind." Welcher Grundsatz der DSGVO ist das?', [
    ['Datenminimierung', true, 'Nur so viele Daten wie nötig.'],
    ['Transparenz', false, 'Transparenz = Betroffene umfassend informieren.'],
    ['Rechtmäßigkeit', false, 'Rechtmäßigkeit = Einwilligung/Rechtsgrundlage.'],
    ['Speicherbegrenzung', false, 'Das betrifft die Dauer.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i5', 'its-dsgvo', '„Schon beim Erheben muss feststehen, wofür die Daten genutzt werden." Welcher Grundsatz der DSGVO ist das?', [
    ['Zweckbindung', true, 'Die Daten dürfen nur für den festgelegten Zweck genutzt werden.'],
    ['Transparenz', false, 'Transparenz heißt: Betroffene werden verständlich informiert.'],
    ['Integrität und Vertraulichkeit', false, 'Das ist der Schutz durch TOM.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i6', 'its-dsgvo', '„Daten werden mit technischen und organisatorischen Maßnahmen vor unbefugtem Zugriff geschützt." Welcher Grundsatz der DSGVO ist das?', [
    ['Integrität und Vertraulichkeit', true, 'Daten bleiben geschützt und unverändert.'],
    ['Richtigkeit', false, 'Richtigkeit heißt: Die Daten müssen stimmen.'],
    ['Datenminimierung', false, 'Datenminimierung heißt: nur so viele Daten wie nötig.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  K('i7', 'its-dsgvo', 'Nenne die sieben Grundsätze aus Art. 5 DSGVO.', 'Rechtmäßigkeit · Transparenz · Zweckbindung · Datenminimierung · Richtigkeit · Speicherbegrenzung · Integrität und Vertraulichkeit', DS + ' Aufg. 1d', 7);
  K('i8', 'its-dsgvo', 'Nenne drei Rechte der betroffenen Personen nach DSGVO.', 'Auskunft · Berichtigung · Löschung („Recht auf Vergessenwerden") · Einschränkung der Verarbeitung · Datenübertragbarkeit · Widerspruch', DS + ' Aufg. 1c (Rechte)', 3);
  K('i9', 'its-dsgvo', 'Welche Aufgaben hat das BSI?', 'Das **Bundesamt für Sicherheit in der Informationstechnik** schützt die IT Deutschlands, entwickelt **Sicherheitsstandards und Empfehlungen** (Grundschutz-Kompendium), warnt vor Sicherheitslücken, unterstützt Behörden und Unternehmen.', DS + ' Aufg. 1d', 3);
  M('i10', 'its-dsgvo', 'Was ist **ISO 27001**?', [
    ['Internationaler Standard für Informationssicherheits-Managementsysteme', true, 'ISO 27000er-Reihe.'],
    ['Das deutsche Datenschutzgesetz', false, 'Das ist das BDSG.'],
    ['Gesetz für kritische Infrastrukturen', false, 'Das ist KRITIS.'],
  ], DS + ' Aufg. 1e');
  M('i11', 'its-dsgvo', 'Wofür steht **KRITIS**?', [
    ['Kritische Infrastrukturen (z. B. Energie, Wasser, Gesundheit)', true, 'Besonders zu schützende Einrichtungen.'],
    ['Kriterien für IT-Sicherheit', false, 'KRITIS ist die Abkürzung für kritische Infrastrukturen.'],
    ['Ein Verschlüsselungsverfahren', false, 'KRITIS ist kein Verfahren, sondern eine Gruppe besonders wichtiger Einrichtungen.'],
  ], DS + ' Aufg. 1e');
  M('i12', 'its-dsgvo', 'Was ist das **BDSG**?', [
    ['Bundesdatenschutzgesetz – ergänzt die DSGVO in Deutschland', true, 'Die DSGVO gilt EU-weit, das BDSG ergänzt national.'],
    ['Ersetzt die DSGVO in Deutschland', false, 'Es ergänzt, ersetzt nicht.'],
    ['Ein Standard des BSI', false, 'Nein, ein Gesetz.'],
  ], DS + ' Aufg. 1e');
  K('i13', 'its-dsgvo', 'Was ist der Unterschied zwischen „Privacy by Design" und „Privacy by Default"?', '**By Design:** Datenschutz schon bei der **Entwicklung** mitdenken.\n**By Default:** **Voreinstellungen** sind datenschutzfreundlich.', 'ITS1 · Themenübersicht LF4', 2);
  K('i14', 'its-dsgvo', 'Nenne vier technisch-organisatorische Maßnahmen (TOM).', 'Verschlüsselung · Zugriffsrechte auf das Nötige beschränken · automatische Löschung · Backups · Zutrittskontrolle · 2-Faktor-Authentifizierung · Schulungen · Löschkonzept', DS + ' (eigene Lösung)', 4);
  K('i15', 'its-dsgvo', 'Sportverein: Welche Daten werden wofür erhoben?', 'Name, Geburtsdatum, Geschlecht, Kontoverbindung, Kontaktdaten, Beitrittsdatum – für die **Mitgliederverwaltung** und **Beitragszahlungen**.', DS + ' Frage 1 (Sportverein)', 2);
  K('i16', 'its-dsgvo', 'Sportverein: Nenne vier Gefahren für die Mitgliederdaten.', 'Unbefugter Zugriff · Diebstahl/Verlust von Geräten · Hacking · Schadsoftware · Phishing · Fehler von Mitarbeitern · schwache Passwörter · fehlende Updates · Feuer/Wasser · Missbrauch durch Berechtigte', 'ITS1 · DSGVO Arbeitsauftrag (Sportverein) Aufg. 1', 4);
  K('i17', 'its-dsgvo', 'Warum kann trotz Schutzmaßnahmen etwas passieren? Nenne für jedes Schutzziel ein Beispiel.', 'Maßnahmen **senken das Risiko**, schließen es nie ganz aus.\n**Verfügbarkeit:** Cyberangriff, Hardwaredefekt · **Integrität:** unbefugte Änderung, menschlicher Fehler · **Vertraulichkeit:** Phishing, gestohlenes Passwort, falsch versendete Mail', 'ITS1 · DSGVO Arbeitsauftrag (Sportverein) Aufg. 3', 4);
  M('i18', 'its-dsgvo', 'Sind IP-Adressen personenbezogene Daten?', [
    ['Ja – die DSGVO sieht sie als „Online-Kennung", die eine Person identifizieren kann', true, 'Speicherung nur DSGVO-konform, z. B. kurz für IT-Sicherheit.'],
    ['Nein – sie gehören zu einem Gerät, nicht zu einer Person', false, 'Gerichte und DSGVO sagen: doch personenbezogen.'],
    ['Nur statische IP-Adressen', false, 'Die Unterlagen unterscheiden hier nicht.'],
  ], CIA + ' · Lösungen Aufgabe 1');

  K('i30', 'its-cia', 'Nenne die drei Schutzziele und erkläre sie in einem Satz.', '**Vertraulichkeit:** Nur Befugte sehen die Daten.\n**Integrität:** Daten sind richtig und unverändert.\n**Verfügbarkeit:** Daten/Systeme sind da, wenn man sie braucht.', CIA, 3);
  M('i31', 'its-cia', 'Womit wird **Vertraulichkeit** sichergestellt?', [
    ['Datenverschlüsselung', true, 'Unlesbar für Unbefugte.'],
    ['Benutzername/Passwort und Zwei-Faktor-Authentifizierung', true, 'Nur Berechtigte kommen rein.'],
    ['Minimale Zugänglichkeit vertraulicher Informationen', true, 'Rechte nur so viel wie nötig.'],
    ['Regelmäßige Hardwarewartung', false, 'Das dient der Verfügbarkeit.'],
  ], CIA + ' (Vertraulichkeit)', 3, { mehrfach: true });
  M('i32', 'its-cia', 'Womit wird **Integrität** sichergestellt?', [
    ['Dateiberechtigungen und Zugriffskontrollen', true, 'Verhindert unbefugte Änderungen.'],
    ['Versionskontrolle', true, 'Verhindert versehentliche Änderungen durch Berechtigte.'],
    ['Prüfsummen (Hashwerte)', true, 'Zeigen, ob Daten bei der Übertragung verändert wurden.'],
    ['Firewall gegen DoS-Angriffe', false, 'Das schützt die Verfügbarkeit.'],
  ], CIA + ' (Integrität)', 3, { mehrfach: true });
  M('i33', 'its-cia', 'Womit wird **Verfügbarkeit** sichergestellt?', [
    ['Gerätewartung, Reparaturen, Updates, regelmäßige Sicherungen', true, 'So bleiben Systeme nutzbar.'],
    ['Notfallpläne', true, 'Schnelle Wiederherstellung nach Katastrophen.'],
    ['Firewalls gegen Denial-of-Service-Angriffe', true, 'DoS überlastet Ressourcen.'],
    ['Zwei-Faktor-Authentifizierung', false, 'Das schützt die Vertraulichkeit.'],
  ], CIA + ' (Verfügbarkeit)', 3, { mehrfach: true });
  M('i34', 'its-cia', 'Was macht ein **Denial-of-Service-Angriff (DoS)**?', [
    ['Er überlastet Ressourcen, damit ein Dienst nicht mehr verfügbar ist', true, 'Angriff auf die Verfügbarkeit.'],
    ['Er liest heimlich Daten mit', false, 'Das wäre ein Angriff auf die Vertraulichkeit.'],
    ['Er verändert Datenbankeinträge', false, 'Das betrifft die Integrität.'],
  ], CIA + ' (Verfügbarkeit)');
  K('i35', 'its-cia', 'Was ist ein Hashwert und welche Eigenschaften hat er?', 'Ein „**Fingerabdruck**" von Daten: Eine **Hashfunktion** macht aus Daten einen Wert mit **fester Länge**. Aus dem Hashwert kann man die Daten **nicht zurückrechnen** – er dient nur zum **Vergleich**.', CIA + ' (Integrität)', 3);
  M('i36', 'its-cia', 'Wie prüft man, ob eine heruntergeladene Datei unverändert ist?', [
    ['Hashwert selbst berechnen und mit dem Hashwert der Quelle vergleichen', true, 'Gleich → unverändert, ungleich → manipuliert/beschädigt.'],
    ['Dateigröße anschauen', false, 'Gleiche Größe beweist nichts.'],
    ['Die Datei öffnen und schauen, ob sie funktioniert', false, 'Manipulationen fallen so nicht auf.'],
  ], CIA + ' (Integrität)');
  M('i37', 'its-cia', 'Welche Verfahren sind gängige Prüfsummen/Hashfunktionen?', [
    ['MD5', true, 'Gängig, aber veraltet.'],
    ['SHA-256', true, 'Heute Standard.'],
    ['SHA-512', true, 'Noch längerer Hash.'],
    ['AES', false, 'AES ist ein Verschlüsselungsverfahren, keine Hashfunktion.'],
  ], CIA + ' (Integrität)', 2, { mehrfach: true });
  M('i38', 'its-cia', 'Ein Nutzer hat sein Passwort vergessen. Kann der Admin es aus dem gespeicherten Hashwert wiederherstellen?', [
    ['Nein – das Passwort muss zurückgesetzt werden', true, 'Aus dem Hash kann man nicht zurückrechnen.'],
    ['Ja, mit dem Admin-Schlüssel', false, 'Hashing ist keine Verschlüsselung.'],
    ['Ja, wenn es SHA-256 ist', false, 'Bei keinem Hashverfahren.'],
  ], CIA + ' (Integrität)');
  M('i39', 'its-cia', 'Im Arbeitsblatt steht: „Verfügbarkeit stellt sicher, dass nur autorisierte Personen zugreifen können." Was ist daran falsch?', [
    ['Das beschreibt Vertraulichkeit – Verfügbarkeit heißt: erreichbar, wenn gebraucht', true, 'Achtung, Fehler im Blatt!'],
    ['Nichts, das ist korrekt', false, 'Zugriff nur für Befugte = Vertraulichkeit.'],
    ['Das beschreibt Integrität', false, 'Integrität = Daten richtig und unverändert.'],
  ], CIA + ' (Einleitung)', 1);

  const AA = 'ITS1 · Arbeitsblatt 2a';
  K('i50', 'its-mass', 'Was ist der Unterschied zwischen organisatorischen und technischen Maßnahmen? Nenne je zwei Beispiele.', '**Organisatorisch** = Regeln für Menschen: Zugangskontrolle zu Serverräumen, Einweisung in Passwortrichtlinien, Konto erst nach Quittierung der Benutzerordnung, Notfallplan bei Ausfall des Admins.\n**Technisch** = Technik schützt: Dienste auf mehrere Server verteilen, unnötige Dienste abschalten, Telnet durch SSH ersetzen, Verschlüsselung/VPN, IDS, Firewall.', AA + ' · Arbeitsauftrag 1', 4);
  M('i51', 'its-mass', 'Warum soll **Telnet** durch **SSH** ersetzt werden?', [
    ['Telnet überträgt das Passwort im Klartext, SSH verschlüsselt', true, 'Bei Telnet kann mitgelesen werden.'],
    ['SSH ist schneller', false, 'Es geht nicht um Geschwindigkeit, sondern um Sicherheit.'],
    ['Telnet funktioniert nicht mit Switches', false, 'Das stimmt nicht – das Problem ist die unverschlüsselte Übertragung.'],
  ], AA + ' · Arbeitsauftrag 1 (technisch Nr. 3)');
  M('i52', 'its-mass', 'Was macht ein **Intrusion Detection System (IDS)**?', [
    ['Es erkennt unerlaubte Eingriffe ins System, die passiert sind', true, 'Eine spezielle Überwachungssoftware.'],
    ['Es verschlüsselt Festplatten', false, 'Das wäre Verschlüsselung – eine andere Schutzmaßnahme.'],
    ['Es erstellt Backups', false, 'Das wäre Datensicherung – eine andere Schutzmaßnahme.'],
  ], AA + ' · Arbeitsauftrag 1 (technisch Nr. 5)');
  M('i53', 'its-mass', 'Welche Beispiele sind **Fehlverhalten**, das zu Vertraulichkeitsverlust führt?', [
    ['Ausdrucke mit personenbezogenen Daten bleiben am Netzdrucker liegen', true, 'Jeder Vorbeikommende kann sie lesen.'],
    ['Vertrauliches wird in Hörweite Fremder besprochen', true, 'z. B. am Handy in der Öffentlichkeit.'],
    ['Festplatten werden zur Reparatur geschickt, ohne sie sicher zu löschen', true, 'Daten gelangen in fremde Hände.'],
    ['Regelmäßige Backups werden gemacht', false, 'Das ist eine Schutzmaßnahme.'],
  ], AA + ' · Fehlverhalten', 3, { mehrfach: true });
  K('i54', 'its-mass', 'Was heißt es, wenn eine Datenbank ihre Integrität (Konsistenz) verliert – und welche Folgen hat das?', 'Die Daten sind **noch vorhanden**, aber in einem **fehlerhaften Zustand**.\nKonsequenzen: Aufgaben können nicht (vollständig) erledigt werden · Informationsgehalt wird verfälscht · **hoher Aufwand** zur Wiederherstellung · oft unklar, **welche** Daten verändert wurden → weitere wirtschaftliche Schäden.', AA + ' · Arbeitsauftrag 2', 4);
  M('i55', 'its-mass', 'Eine Datenbank-Datei liegt im Unix-Ordner **/tmp**. Über Nacht ist die Datenbank unbrauchbar. Warum?', [
    ['/tmp wird automatisch geleert – die Datei wurde gelöscht', true, '/tmp ist für kurzlebige Dateien.'],
    ['/tmp ist schreibgeschützt', false, 'In /tmp darf man schreiben – das Problem ist das automatische Leeren.'],
    ['Ein Virus', false, 'Die Situation beschreibt die automatische Löschung.'],
  ], AA + ' · Arbeitsauftrag 2 (Situation 1)');
  K('i56', 'its-mass', 'Wie kann schlechter Umgang mit Schlüsseln eine Verschlüsselung nutzlos machen?', 'Schlüssel **unsicher erzeugt oder aufbewahrt** · **schwache/erratbare** Schlüssel · Schlüssel **nicht auf sicherem Weg** übermittelt (z. B. Schlüssel und Daten auf **derselben** Diskette).\nAuch der **Verlust** ist ein Problem: vergessen, Mitarbeiter hat die Firma verlassen, versehentlich gelöscht → Daten nicht mehr entschlüsselbar.', AA + ' · Arbeitsauftrag 3', 4);
  M('i57', 'its-mass', 'Triple-DES verschlüsselt in drei Schritten. Was passiert, wenn alle drei Teilschlüssel gleich sind?', [
    ['Es wirkt nur wie eine einfache DES-Verschlüsselung – der Sicherheitsgewinn geht verloren', true, 'Mit drei gleichen Schlüsseln bleibt nur die Sicherheit von einfachem DES.'],
    ['Dreifache Sicherheit', false, 'Gerade nicht – gleiche Schlüssel bringen keinen Gewinn.'],
    ['Die Verschlüsselung funktioniert nicht mehr', false, 'Sie funktioniert, ist aber schwach.'],
  ], AA + ' · Arbeitsauftrag 3');
  K('i58', 'its-mass', 'Event GmbH: Nenne je eine Schutzmaßnahme – logisch (Software), organisatorisch (Regeln) und physikalisch (Gebäude).', '**Logisch:** Virenscanner – Schadsoftware wird nicht ausgeführt.\n**Organisatorisch:** Geschäftsprozess für Datensicherung – geklärt, wer sie wie durchführt.\n**Physikalisch:** Zutrittskontrolle mit Chipkarte – nur Berechtigte betreten Gebäude/Räume.\n(Weitere sinnvolle Lösungen möglich.)', AA + ' · Event GmbH a) (Lehrerlösung)', 6);
  M('i59', 'its-mass', 'Der Backup-Server steht in einem anderen Brandabschnitt des Gebäudes. Welche Art von Maßnahme ist das?', [
    ['Physikalisch (bauliche Maßnahme)', true, 'Bei Brand sind die Daten woanders noch da.'],
    ['Logisch (Software)', false, 'Es geht um den Ort.'],
    ['Organisatorisch', false, 'Es ist eine bauliche Maßnahme.'],
  ], AA + ' · Event GmbH a)', 1);

  K('i70', 'its-pw', 'Warum sind Sonderzeichen und Ziffern in Passwörtern sinnvoll?', '**Erhöhung der Komplexität:** mehr mögliche Zeichen pro Stelle (94 statt 26) → viel mehr Kombinationen → Brute Force dauert länger.\n**Ausschluss von Wörterbuchattacken:** solche Passwörter stehen in keinem Wörterbuch.', AA + ' · Arbeitsauftrag 4a (Lehrerlösung)', 2);
  K('i71', 'its-pw', '8 Stellen = 30 s Brute Force. 94 Zeichen pro Stelle. Kann ein 10-stelliges Passwort innerhalb von 30 Tagen erraten werden? (Rechenweg)', 'Jede zusätzliche Stelle → Zeit × 94.\n`30 s × 94 × 94 = 265 080 s`\n`265 080 s : 3600 ≈ 73,63 h`\n`73,63 h : 24 ≈ 3,07 Tage`\n**3,07 Tage < 30 Tage → Ja**, jedes 10-stellige Passwort kann innerhalb der Gültigkeitsdauer erraten werden.', AA + ' · Arbeitsauftrag 4b (Lehrerlösung)', 4);
  M('i72', 'its-pw', 'Welche Beispiele sind echte **2-Faktor**-Authentifizierung?', [
    ['Smartcard und PIN', true, 'Besitz + Wissen.'],
    ['Benutzername/Passwort und SMS-Code', true, 'Wissen + Besitz (Handy).'],
    ['Benutzername/Passwort und Token', true, 'Wissen + Besitz.'],
    ['Passwort und zusätzliche PIN', false, 'Beides ist „Wissen" – nur ein Faktor-Typ.'],
  ], AA + ' · Arbeitsauftrag 4c (Lehrerlösung)', 4, { mehrfach: true });
  K('i73', 'its-pw', 'Warum wird das Benutzerpasswort als Hashwert gespeichert?', '**Aus dem Hashwert kann nicht auf das Passwort geschlossen werden.** Bei der Prüfung von Benutzername und Passwort kann der Passwort-Hash übers Netz übertragen und mit dem gespeicherten Hash **verglichen** werden. Bei Diebstahl der Datenbank sind die Passwörter geschützt.', AA + ' · Arbeitsauftrag 4d (Lehrerlösung)', 3);
  K('i74', 'its-pw', 'Nenne zwei Maßnahmen, mit denen die Passwortsicherheit erhöht werden kann.', 'Passwortchronik erzwingen (alte nicht wiederverwenden) · Ablaufzeit für Passwörter · Passwort muss **Komplexitätsbedingungen** entsprechen · (auch: Sperre nach Fehlversuchen, 2FA)', AA + ' · Arbeitsauftrag 4e (Lehrerlösung)', 4);
  M('i75', 'its-pw', 'Was empfiehlt das BSI laut Arbeitsblatt heute zum Passwortwechsel?', [
    ['Ändern, wenn das Passwort in fremde Hände geraten sein könnte', true, 'Die Pflicht zum regelmäßigen Wechsel wurde gestrichen.'],
    ['Alle 30 Tage ändern', false, 'Diese Empfehlung wurde gestrichen.'],
    ['Nie ändern', false, 'Bei Verdacht schon.'],
  ], AA + ' · Arbeitsauftrag 4 (Text)');
  M('i76', 'its-pw', 'Ein 10-stelliges Passwort braucht 3,07 Tage. Wie lange ungefähr ein 11-stelliges (94 Zeichen)?', [
    ['Etwa 288 Tage', true, '3,07 Tage × 94 ≈ 288 Tage.'],
    ['Etwa 6 Tage', false, 'Nicht ×2, sondern ×94.'],
    ['Etwa 31 Tage', false, 'Nicht ×10, sondern ×94.'],
  ], AA + ' · Arbeitsauftrag 4b (Weiterführung)', 2);

  /* ================= AEW ================= */
  const LP = 'AEW · Leseprobe Anforderungsspezifikationen', TB = 'AEW · TaskCards-Board (Anforderungsanalyse)';
  K('a1', 'aew-last', 'Wer schreibt das Lastenheft, wer das Pflichtenheft? (Merksatz)', '**Lastenheft** = Auftraggeber (Kunde) → **WAS** soll gemacht werden?\n**Pflichtenheft** = Auftragnehmer (Entwickler) → **WIE** wird es umgesetzt?', LP, 2);
  M('a2', 'aew-last', '„Die Daten werden in einer MySQL-Datenbank in der Tabelle Kunde gespeichert." Wohin gehört dieser Satz?', [
    ['Pflichtenheft – konkrete technische Umsetzung', true, 'Das WIE.'],
    ['Lastenheft – Anforderung des Kunden', false, 'Lastenheft wäre: „Das System muss Kundendaten dauerhaft speichern."'],
    ['Glossar', false, 'Das Glossar erklärt nur Begriffe.'],
  ], LP);
  K('a3', 'aew-last', 'Nenne die sechs Gliederungspunkte eines Lastenhefts (nach Balzert).', '1. Visionen und Ziele\n2. Rahmenbedingungen\n3. Kontext und Überblick\n4. Funktionale Anforderungen\n5. Qualitätsanforderungen (nichtfunktional)\n6. Glossar', LP, 6);
  K('a4', 'aew-last', 'Was ist der Unterschied zwischen funktionalen und nichtfunktionalen Anforderungen? Nenne je ein Beispiel.', '**Funktional:** was das System können muss (Funktion, Verhalten, Daten) – „Kunde anlegen".\n**Nichtfunktional:** Qualität/Randbedingung (Leistung, Softwarequalität, rechtlich) – „Suchergebnis in 2 Sekunden", „leicht wartbar".', LP, 4);
  M('a5', 'aew-last', 'Welche Anforderung ist **gut** formuliert?', [
    ['„Das System soll Suchergebnisse innerhalb von 2 Sekunden anzeigen."', true, 'Eindeutig und prüfbar.'],
    ['„Das System soll schnell sein."', false, 'Nicht prüfbar – was heißt schnell?'],
    ['„Das System soll irgendwie benutzerfreundlich sein."', false, 'Nicht eindeutig.'],
  ], LP);
  K('a6', 'aew-last', 'Welche Eigenschaften hat eine gute Anforderung?', '**eindeutig, verständlich, prüfbar, widerspruchsfrei, vollständig**', LP, 3);
  K('a7', 'aew-last', 'Warum bekommen Anforderungen Nummern wie /LF10/?', 'Für **Traceability** (Nachvollziehbarkeit): Eine Anforderung lässt sich vom Lastenheft → Pflichtenheft → Programm → Test verfolgen.', LP, 2);
  M('a8', 'aew-last', 'Was gehört unbedingt ins Pflichtenheft, wird aber oft vergessen?', [
    ['Testfälle und Abnahmekriterien', true, 'Das Pflichtenheft ist oft Vertragsgrundlage.'],
    ['Das Firmenlogo', false, 'Das ist Gestaltung, keine Anforderung.'],
    ['Die Gehälter der Entwickler', false, 'Gehälter gehören nicht ins Pflichtenheft.'],
  ], LP);
  M('a9', 'aew-last', 'Auf welcher Norm basieren Lasten- und Pflichtenheft?', [
    ['DIN 69901-5', true, 'Die Norm legt Begriffe im Projektmanagement fest.'],
    ['ISO 27001', false, 'Das ist Informationssicherheit.'],
    ['DIN 5008', false, 'Das ist die Norm für Schreib- und Gestaltungsregeln (Briefe).'],
  ], LP, 1);
  K('a10', 'aew-last', 'IT-Recruiting: Wie heißt das Dokument, in dem die Anforderungen an das Projekt stehen, und was enthält es?', '**Lastenheft.** Es fasst die **wirtschaftlichen, technischen und organisatorischen Erwartungen** des Auftraggebers zusammen: funktionale und nichtfunktionale Anforderungen (Anforderungsspezifikation).', TB + ' Aufg. 1+2 (Lösung)', 3);
  M('a11', 'aew-last', 'Im Lastenheft steht: „/LF70/ Das System muss Daten als CSV und Excel exportieren können." Was für eine Anforderung ist das?', [
    ['Eine funktionale Anforderung', true, 'LF = Lastenheft-Funktion.'],
    ['Eine Qualitätsanforderung', false, 'Es beschreibt eine Funktion.'],
    ['Eine Rahmenbedingung', false, 'Rahmenbedingungen sind /LR…/.'],
  ], TB + ' Aufg. 4 (Muster Beko)');
  K('a12', 'aew-last', 'Nenne fünf funktionale Anforderungen aus dem Lastenheft IT-Recruiting.', 'Kunden- und Mitarbeiterdaten erfassen/ändern/löschen · Dokumente zuordnen · Rollen- und Berechtigungssystem · Such- und Filterfunktion · Export CSV/Excel · mehrsprachig · Backups und Wiederherstellung', TB + ' Aufg. 4 (Muster Beko)', 5);

  K('a20', 'aew-uc', 'Was ist ein Stakeholder?', 'Jede Person oder Organisation, die **Anforderungen beeinflusst** oder **vom System betroffen** ist – z. B. Auftraggeber, Endnutzer, Entwickler, Tester, Rechtsabteilung. Ihre Interessen führen oft zu einem **Kompromiss**.', LP, 2);
  M('a21', 'aew-uc', 'In welchen Formen werden Anforderungen dokumentiert?', [
    ['Lasten-/Pflichtenheft (DIN 69901-5)', true, 'Klassisch.'],
    ['Spezifikation nach IEEE 830', true, 'Internationaler Standard.'],
    ['User Stories im Product Backlog (Scrum)', true, 'Agil.'],
    ['Als Use-Case-Diagramm im Glossar', false, 'Das Glossar erklärt Begriffe.'],
  ], LP, 3, { mehrfach: true });
  M('a22', 'aew-uc', 'Was bedeutet **«include»** im Use-Case-Diagramm?', [
    ['Der Anwendungsfall wird **immer** mit ausgeführt', true, 'Pfeil zeigt auf den eingebundenen Fall (Daten einstellen → Einloggen).'],
    ['Er wird nur unter einer Bedingung ausgeführt', false, 'Das ist «extend».'],
    ['Er gehört nicht zum System', false, 'Mit der Systemgrenze hat «include» nichts zu tun.'],
  ], 'AEW · Muster Use-Case-Diagramm (Pizza)');
  M('a23', 'aew-uc', 'Was bedeutet **«extend»**?', [
    ['Erweitert einen Anwendungsfall nur unter einer Bedingung (condition)', true, 'z. B. Benutzerkonto erstellen {Kunde neu}.'],
    ['Wird immer ausgeführt', false, 'Das ist «include».'],
    ['Verbindet zwei Akteure', false, '«extend» verbindet zwei Anwendungsfälle, keine Akteure.'],
  ], 'AEW · Muster Use-Case-Diagramm (Pizza)');
  M('a24', 'aew-uc', 'In welche Richtung zeigt der «extend»-Pfeil?', [
    ['Vom erweiternden Fall **zum erweiterten (Basis-)Fall**', true, 'z. B. Benutzerkonto erstellen → Einloggen.'],
    ['Vom Basisfall zum erweiternden Fall', false, 'Umgekehrt.'],
    ['Zum Akteur', false, 'Der Pfeil verbindet zwei Anwendungsfälle.'],
  ], 'AEW · Use-Case Kundendatenerfassung (Lösung)', 1);
  K('a25', 'aew-uc', 'Was gehört in ein Use-Case-Diagramm?', '**Systemgrenze** (Rechteck) · **Akteure** außerhalb (Strichmännchen) · **Anwendungsfälle** als Ellipsen · Assoziationen (Linien) · **«include»/«extend»**-Beziehungen, Bedingungen als condition-Notiz', 'AEW · Muster Use-Case-Diagramm', 3);
  M('a26', 'aew-uc', 'Darf ein Anwendungsfall mit zwei Akteuren verbunden sein?', [
    ['Ja – z. B. „Kunden benachrichtigen" mit Mitarbeiter und Kunde', true, 'Linien dürfen aber keine Ellipsen schneiden.'],
    ['Nein, immer nur ein Akteur', false, 'UML erlaubt mehrere.'],
  ], 'AEW · Use-Case Kundendatenerfassung (Lösung)', 1);
  K('a27', 'aew-uc', 'IT-Recruiting: Welche Beziehung haben „Benutzerkonto erstellen" und „Einloggen"?', '**«extend»** mit der Bedingung **{Kunde neu}** – nur Neukunden erstellen ein Konto.', 'AEW · Use-Case Kundendatenerfassung (Lösung)', 2);
  K('a28', 'aew-uc', 'Nenne die sechs Schritte von Design Thinking.', 'Verstehen · Beobachten · Sichtweise definieren · Ideen finden · Prototypen entwickeln · Testen', LP, 3);

  const DT = 'AEW · Leseprobe Datentypen und Datenstrukturen';
  M('a40', 'aew-typ', 'Wie viele Byte belegt ein Java-**int**?', [['4 Byte', true, 'Wertebereich ca. ±2,1 Milliarden.'], ['2 Byte', false, 'Das ist short (oder char).'], ['8 Byte', false, 'Das ist long (oder double).'], ['1 Byte', false, 'Das ist byte.']], DT + ' S. 101', 1);
  M('a41', 'aew-typ', 'Welcher Wertebereich gehört zu **byte**?', [['−128 … +127', true, '−2⁷ … 2⁷−1.'], ['0 … 255', false, 'Java-byte ist vorzeichenbehaftet.'], ['−32 768 … +32 767', false, 'Das ist short.']], DT + ' S. 101', 1);
  M('a42', 'aew-typ', 'Wie viele Byte belegt ein **char** in Java und was speichert er?', [['2 Byte, ein Unicode-Zeichen', true, 'Standardwert \\u0000.'], ['1 Byte, ein ASCII-Zeichen', false, 'In Java 2 Byte Unicode.'], ['4 Byte, einen Text', false, 'Text = String.']], DT + ' S. 101', 1);
  K('a43', 'aew-typ', 'Nenne die acht primitiven Datentypen in Java mit Byte-Größe.', 'boolean (undefiniert) · byte (1) · short (2) · int (4) · long (8) · float (4) · double (8) · char (2)', DT + ' S. 101', 4);
  M('a44', 'aew-typ', 'Wie kennzeichnet man einen **long**- bzw. **float**-Wert im Code?', [['long mit L, float mit f (z. B. 3123466000L, 0.234f)', true, 'Genau so im Buch.'], ['long mit l, float mit d', false, 'd wäre double.'], ['Gar nicht nötig', false, 'Ohne f ist 0.234 ein double.']], DT + ' S. 101', 1);
  M('a45', 'aew-typ', 'Wann wandelt Java einen Typ **automatisch** um (implizite Typumwandlung)?', [['Automatisch von einem kleineren in einen größeren Typ (z. B. byte → long)', true, 'Kein Informationsverlust.'], ['Automatisch von double nach int', false, 'Das braucht einen Cast (explizit).'], ['Nur mit dem Cast-Operator', false, 'Das ist explizit.']], DT + ' S. 102');
  K('a46', 'aew-typ', 'Was passiert bei `int zahlI = 120; float zahlF = 30.8f; int summe = zahlI + (int) zahlF;`?', 'Expliziter Cast: Die **Nachkommastellen werden abgeschnitten** (30.8 → 30). Ergebnis **150**. Ohne Cast gäbe es den Fehler „possible lossy conversion from float to int".', DT + ' S. 103', 2);
  M('a47', 'aew-typ', '`short s = (short) 32343423;` ergibt −31361. Warum?', [['Der Wert passt nicht in 16 Bit – die oberen Bits werden abgeschnitten', true, 'Expliziter Cast von höher- auf niederwertig kann Werte verfälschen.'], ['Weil short immer negativ ist', false, 'short kann auch positiv sein (bis 32 767).'], ['Rundungsfehler bei Kommazahlen', false, 'Es sind ganze Zahlen.']], DT + ' S. 103');
  M('a48', 'aew-typ', 'Wofür nutzt man **Wrapper-Klassen** wie Integer?', [['Um primitive Werte als Objekte (Referenzdatentypen) zu verwenden – Autoboxing', true, 'int ↔ Integer automatisch.'], ['Um Texte zu speichern', false, 'Dafür gibt es String.'], ['Für Konstantenlisten', false, 'Dafür gibt es enum.']], DT + ' S. 103–104');
  M('a49', 'aew-typ', 'Welcher Datentyp passt für eine feste Auswahl wie die vier Jahreszeiten?', [['enum (Aufzählungstyp)', true, 'Eigener Datentyp mit festen Werten.'], ['String', false, 'Tippfehler möglich.'], ['int[]', false, 'Nicht aussagekräftig.']], DT + ' S. 104');
  M('a50', 'aew-typ', 'Welcher Java-Typ passt für eine **Postleitzahl** wie „01067"?', [['String – man rechnet nicht damit und die führende 0 bleibt erhalten', true, 'Als int würde aus 01067 → 1067.'], ['int', false, 'Führende 0 geht verloren.'], ['double', false, 'Keine Kommazahl.']], 'AEW · eigene Lösung Personal-/Kundendaten', 2);
  M('a51', 'aew-typ', 'Welcher Typ passt für „Bewerber spricht mehrere Fremdsprachen"?', [['Ein Array, z. B. String[] fremdsprachen', true, 'Mehrere Werte gleichen Typs.'], ['boolean', false, 'Nur ja/nein.'], ['char', false, 'Nur ein Zeichen.']], 'AEW · Entwurfsphase Aufg. 1+2', 1);
  K('a52', 'aew-typ', 'Regeln für Variablennamen in Java?', 'Beginnen mit einem **Kleinbuchstaben** und sollen **aussagekräftig** sein (z. B. anzahlImmobilienbesitzer).', DT + ' S. 101', 1);
  M('a53', 'aew-typ', 'Standardwert (default) eines **boolean**?', [['false', true, 'Und Zahlen 0 bzw. 0.0.'], ['true', false, 'Der Standardwert ist false.'], ['null', false, 'null gibt es nur bei Referenztypen.']], DT + ' S. 101', 1);

  const ZS = 'AEW · Aufgabe Verwalten von Daten in IT-Systemen';
  M('a60', 'aew-zahl', 'Welche Eigenschaften haben **Informationen**?', [
    ['Sie sind an einen Träger gebunden', true, 'z. B. Papier, Datei, Schall.'],
    ['Sie verursachen Kosten', true, 'Beschaffung, Speicherung.'],
    ['Sie sind leicht übertragbar', true, 'z. B. durch Kopieren oder Weitersagen.'],
    ['Sie verbrauchen sich', false, 'Informationen nutzen sich nicht ab.'],
    ['Sie können nur digital übertragen werden', false, 'Auch analog (Sprache, Brief).'],
  ], ZS + ' Aufg. 1.1 Nr. 1', 3, { mehrfach: true });
  M('a61', 'aew-zahl', 'Welche Aussagen über **Daten** sind korrekt?', [
    ['Daten sind eine wiederherstellbare Darstellung von Informationen', true, 'Aus Daten kann man die Information wieder gewinnen.'],
    ['Daten können durch Messung gewonnen werden', true, 'z. B. Sensorwerte.'],
    ['Daten können nicht direkt übertragen werden', false, 'Daten werden übertragen.'],
    ['Daten werden mithilfe von Informationen abgebildet', false, 'Umgekehrt: Informationen werden durch Daten abgebildet.'],
  ], ZS + ' Aufg. 1.1 Nr. 2', 2, { mehrfach: true });
  M('a62', 'aew-zahl', 'Welche Aussagen zum Binärcode sind **falsch**?', [
    ['Der Binärcode besteht aus den Ziffern 0 bis 9', true, 'Falsch – das ist das Dezimalsystem.'],
    ['Alle Daten liegen in Form von Binärcodes vor', true, 'Falsch – Daten können auch analog sein.'],
    ['Der Binärcode besteht aus den Ziffern 0 und 1', false, 'Diese Aussage ist richtig.'],
    ['Informationen müssen in der Regel in Binärcodes überführt werden', false, 'Diese Aussage ist richtig.'],
  ], ZS + ' Aufg. 1.1 Nr. 3', 2, { mehrfach: true });
  M('a63', 'aew-zahl', 'Welche Daten können **eindeutig** interpretiert werden?', [
    ['„1 000 als Dezimalzahl"', true, 'Das Zahlensystem ist angegeben.'],
    ['„1 000"', false, 'Dezimal oder binär (= 8)?'],
    ['„20,00 € sind zu billig."', false, 'Subjektive Bewertung.'],
    ['„19,73 Sekunden im Sprint sind eine sehr gute Leistung."', false, 'Subjektive Bewertung.'],
  ], ZS + ' Aufg. 1.1 Nr. 6', 2, { mehrfach: true });
  K('a64', 'aew-zahl', 'Ordne das EVA-Prinzip: Welche Begriffe gehören zu Eingabe, Verarbeitung, Ausgabe?', '**Eingabe:** Informationen in Daten umwandeln → Eingabedaten\n**Verarbeitung:** Daten verarbeiten und übertragen\n**Ausgabe:** Ausgabedaten → Daten interpretieren (wieder Information)', ZS + ' Aufg. 1.2', 4);
  K('a65', 'aew-zahl', 'Erkläre die Divisionsmethode (Dezimal → Dual).', 'Die Zahl wiederholt **durch 2 teilen**, bis 0 herauskommt. Die **Reste von unten nach oben** gelesen ergeben die Dualzahl. Beispiel: 171 → 1010 1011.', ZS + ' Aufg. 2.1', 2);
  K('a66', 'aew-zahl', 'Erkläre die Subtraktionsmethode (Dezimal → Dual).', 'Vom größten Stellenwert (128, 64, 32 …) aus: **passt** der Stellenwert in die Restzahl → abziehen, Bit = 1; **passt nicht** → Bit = 0.', ZS + ' Aufg. 2.3', 2);
  K('a67', 'aew-zahl', 'Erkläre die Multiplikationsmethode (Dual → Dezimal).', 'Links beginnen: Zwischenergebnis **× 2 + nächstes Bit**, bis alle Bits verarbeitet sind. Beispiel 1000 1011: 1→2→4→8→17→34→69→**139**.', ZS + ' Aufg. 2.4', 2);
  M('a68', 'aew-zahl', 'Warum passen Hexadezimal und Dual so gut zusammen?', [['Ein Hex-Zeichen entspricht genau 4 Bit', true, 'Deshalb in 4er-Gruppen umrechnen.'], ['Beide haben die Basis 2', false, 'Hex hat Basis 16.'], ['Weil Hex nur Buchstaben hat', false, 'Nein, 0–9 und A–F.']], ZS + ' Aufg. 3');
  K('a69', 'aew-zahl', 'Wie bildet man das Zweierkomplement einer negativen Zahl?', '1. Betrag dual darstellen\n2. **Alle Bits umdrehen** (Einerkomplement)\n3. **+1** addieren\nBeispiel −15: 0000 1111 → 1111 0000 → **1111 0001**', ZS + ' Aufg. 5', 3);
  M('a70', 'aew-zahl', 'Woran erkennt man eine negative Zahl im Zweierkomplement?', [['Das erste (höchste) Bit ist 1', true, 'Vorzeichenbit.'], ['Das letzte Bit ist 1', false, 'Das zeigt nur ungerade Zahlen.'], ['Sie enthält mehr Einsen als Nullen', false, 'Die Anzahl der Einsen sagt nichts über das Vorzeichen.']], ZS + ' Aufg. 5', 1);
  M('a71', 'aew-zahl', 'Welcher Zahlenbereich passt in 8 Bit Zweierkomplement?', [['−128 … +127', true, 'Wie Java-byte.'], ['0 … 255', false, 'Das ist ohne Vorzeichen.'], ['−127 … +128', false, 'Andersrum.']], ZS + ' Aufg. 5', 1);
  M('a72', 'aew-zahl', 'Warum kann man „1101 0000" nicht eindeutig als ASCII-Zeichen lesen?', [['1101 0000 = 208 liegt außerhalb von ASCII (0–127)', true, 'Die Bedeutung hängt von der Zeichentabelle ab.'], ['Weil ASCII nur Zahlen kennt', false, 'ASCII enthält Buchstaben, Ziffern und Zeichen.'], ['Weil es 9 Bit sind', false, 'Es sind 8 Bit.']], ZS + ' Aufg. 1.1 Nr. 6c', 1);

  /* ================= Spiel-Varianten =================
     Abgewandelte Fassungen der Spielfragen: gleicher Stoff, andere Blickrichtung (Fallbeispiel, „Was trifft NICHT zu?", umgekehrt gefragt).
     Nur in den Games (Server-Lösungen über tools/spiel-fragen.js), nicht im Lernbereich. Quelle und Thema kommen von der Originalfrage. */
  F.varianten = [];
  const V = (basis, frage, optionen) => {
    const o = E.find(e => e.id === basis), n = F.varianten.filter(v => v.basis === basis).length + 1;
    F.varianten.push({ id: basis + 'v' + n, basis, thema: o.thema, typ: 'M', frage, optionen, quelle: o.quelle, punkte: o.punkte });
  };
  // WBL
  V('w5', 'Im Ausbildungsvertrag gibt es zwei **Vertragspartner**. Wer ist das?', [['Der Ausbildende (Betrieb) und der Auszubildende', true, 'Der Betrieb schließt den Vertrag mit dem Azubi.'], ['Der Ausbilder und die IHK', false, 'Der Ausbilder führt die Ausbildung nur durch, die IHK ist die zuständige Stelle.'], ['Der Auszubildende und die Berufsschule', false, 'Die Berufsschule ist kein Vertragspartner.'], ['Der Ausbilder und der Auszubildende', false, 'Vertragspartner ist der Betrieb, nicht der Ausbilder.']]);
  V('w5', 'Herr Kaya bringt den Azubis im Betrieb die Praxis bei. Welche Rolle hat er?', [['Ausbilder', true, 'Die Person, die die Ausbildung durchführt.'], ['Ausbildender', false, 'Das ist der Betrieb als Vertragspartner.'], ['Auszubildender', false, 'Das ist die Person, die die Ausbildung macht.'], ['Zuständige Stelle', false, 'Das ist die IHK.']]);
  V('w6', 'Die IHK prüft, ob jemand ausbilden darf. Worauf kommt es an?', [['Auf die fachliche und persönliche Eignung', true, 'Das ist die Ausbildereignung.'], ['Auf einen Meistertitel', false, 'Nicht zwingend – verlangt ist die Eignung.'], ['Auf mindestens 10 Jahre im Beruf', false, 'Eine feste Zahl an Jahren wird nicht verlangt.'], ['Auf einen Sitz im Betriebsrat', false, 'Hat mit der Ausbilderrolle nichts zu tun.']]);
  V('w14', 'Welche Vorschrift steht in der Rangfolge ganz **oben**?', [['Das Berufsbildungsgesetz (BBiG)', true, 'Das Gesetz steht über allen anderen Vorschriften.'], ['Der betriebliche Ausbildungsplan', false, 'Der steht ganz unten.'], ['Der Ausbildungsrahmenplan', false, 'Der steht unter BBiG und Ausbildungsordnung.'], ['Die Ausbildungsordnung', false, 'Sie kommt erst nach dem BBiG.']]);
  V('w14', 'Welche Vorschrift steht in der Rangfolge ganz **unten**?', [['Der betriebliche Ausbildungsplan', true, 'Er setzt die anderen Vorschriften im Betrieb um.'], ['Das BBiG', false, 'Das Gesetz steht ganz oben.'], ['Die Ausbildungsordnung', false, 'Sie steht direkt unter dem BBiG.'], ['Der Ausbildungsrahmenplan', false, 'Er steht über dem betrieblichen Plan.']]);
  V('w16', 'Die Ausbildungsordnung verlangt bestimmte Inhalte. Der Betrieb plant zusätzlich zwei weitere. Ist das erlaubt?', [['Ja – mehr ist erlaubt, weniger nie', true, 'Die Ausbildungsordnung ist das Minimum.'], ['Nein – der Plan muss genau gleich sein', false, 'Er darf mehr enthalten.'], ['Nein – der Betrieb darf nur weniger planen', false, 'Genau umgekehrt: nie weniger.']]);
  V('w16', 'Ein kleiner Betrieb lässt zwei Inhalte der Ausbildungsordnung einfach weg. Was stimmt?', [['Nicht erlaubt – die Ausbildungsordnung ist das Minimum', true, 'Weniger ist nie erlaubt.'], ['Erlaubt, weil der Betrieb klein ist', false, 'Die Größe des Betriebs ändert nichts.'], ['Erlaubt, weil der Ausbildungsplan freiwillig ist', false, 'Er ist Teil des Vertrags.']]);
  V('w33', 'Welche Pflicht hat der **Betrieb**, wenn der Azubi zur Berufsschule oder zur Prüfung muss?', [['Freistellungspflicht', true, 'Der Betrieb muss den Azubi dafür freistellen.'], ['Lernpflicht', false, 'Das ist eine Pflicht des Azubis.'], ['Schweigepflicht', false, 'Das ist eine Pflicht des Azubis.'], ['Gehorsamspflicht', false, 'Das ist eine Pflicht des Azubis.']]);
  V('w34', 'Welche Arbeiten darf der Betrieb einem Azubi übertragen?', [['Nur Arbeiten, die der Ausbildung dienen', true, 'Private oder ausbildungsfremde Arbeiten gehören nicht dazu.'], ['Alle Arbeiten, auch private für die Chefin', false, 'Private Arbeiten verletzen die Fürsorgepflicht.'], ['Nur Arbeiten, die dem Azubi Spaß machen', false, 'Entscheidend ist der Ausbildungszweck.']]);
  V('w34', 'Welche Pflicht des Betriebs schützt Azubis vor ausbildungsfremden Arbeiten?', [['Fürsorgepflicht', true, 'Nur ausbildungsdienliche Arbeiten.'], ['Vergütungspflicht', false, 'Die betrifft das Geld.'], ['Zeugnispflicht', false, 'Die betrifft das Zeugnis am Ende.'], ['Wettbewerbsverbot', false, 'Das ist eine Pflicht des Azubis.']]);
  V('w35', 'Welche Pflicht hat ein **Azubi** in Bezug auf Betriebsgeheimnisse?', [['Schweigepflicht', true, 'Betriebsgeheimnisse dürfen nicht weitergegeben werden.'], ['Fürsorgepflicht', false, 'Das ist eine Pflicht des Betriebs.'], ['Freistellungspflicht', false, 'Das ist eine Pflicht des Betriebs.'], ['Zeugnispflicht', false, 'Das ist eine Pflicht des Betriebs.']]);
  V('w35', 'Welche dieser Pflichten gehört **nicht** zu den Pflichten des Azubis?', [['Freistellungspflicht', true, 'Die hat der Betrieb.'], ['Schweigepflicht', false, 'Die hat der Azubi.'], ['Lernpflicht', false, 'Die hat der Azubi.'], ['Nachweispflicht (Berichtsheft)', false, 'Die hat der Azubi.']]);
  V('w38', 'Tom ist nach der Probezeit und will seinen Beruf aufgeben. Wie kann **er** kündigen?', [['Schriftlich mit 4 Wochen Frist', true, 'Das gibt es nur für den Azubi bei Berufsaufgabe oder -wechsel.'], ['Jederzeit mündlich', false, 'Eine Kündigung ist immer schriftlich.'], ['Gar nicht – nur der Betrieb kann kündigen', false, 'Der Azubi kann mit 4 Wochen Frist kündigen.']]);
  V('w38', 'Welche Kündigung gibt es für den **Betrieb** nach der Probezeit **nicht**?', [['Eine ordentliche Kündigung mit Frist und ohne Grund', true, 'Der Betrieb kann nur fristlos aus wichtigem Grund kündigen.'], ['Eine fristlose Kündigung wegen Diebstahl', false, 'Diebstahl ist ein wichtiger Grund.'], ['Eine schriftliche Kündigung mit Begründung', false, 'So muss die fristlose Kündigung sein.']]);
  V('w40', 'Was ist ein **wichtiger Grund**, aus dem der Betrieb nach der Probezeit fristlos kündigen darf?', [['Der Azubi beleidigt den Ausbilder', true, 'Beleidigung (wie auch Diebstahl) ist ein wichtiger Grund.'], ['Der Azubi nimmt seinen Urlaub', false, 'Urlaub steht ihm zu.'], ['Der Azubi geht zur Berufsschule', false, 'Dafür muss der Betrieb ihn sogar freistellen.']]);
  V('w41', 'Was verbietet das **Wettbewerbsverbot** einem Azubi?', [['Dem eigenen Betrieb Konkurrenz zu machen, z. B. durch Schwarzarbeit', true, 'Auch nach Feierabend.'], ['Nach Feierabend Sport zu treiben', false, 'Freizeit ist erlaubt, solange er keine Konkurrenz macht.'], ['Mit Kollegen über die Arbeit zu reden', false, 'Darum geht es beim Wettbewerbsverbot nicht.']]);
  V('w42', 'Muss Lea für ihre **Abschlussprüfung** Urlaub nehmen?', [['Nein – der Betrieb muss sie freistellen', true, 'Freistellungspflicht für Berufsschule und Prüfungen.'], ['Ja, Prüfungen sind Privatsache', false, 'Die Freistellung ist Pflicht des Betriebs.'], ['Nur wenn sie schon volljährig ist', false, 'Das gilt für alle Azubis.']]);
  V('w50', 'Jonas (16) soll 9 Stunden am Tag arbeiten. Was stimmt?', [['Nicht erlaubt – höchstens 8 Stunden am Tag', true, 'Jugendliche: 8 Stunden am Tag, 40 in der Woche.'], ['Erlaubt, solange es nicht mehr als 48 Stunden in der Woche sind', false, 'Für Jugendliche gelten 40 Stunden in der Woche.'], ['Erlaubt, wenn er dafür nur 4 Tage arbeitet', false, 'Die 8 Stunden am Tag gelten trotzdem.']]);
  V('w50', 'An wie vielen Tagen pro Woche dürfen Jugendliche höchstens arbeiten?', [['5 Tage', true, '8 Stunden am Tag, 40 Stunden, 5 Tage.'], ['6 Tage', false, 'Nur 5 Tage.'], ['7 Tage', false, 'Nur 5 Tage.']]);
  V('w51', 'Karin (16) arbeitet 5 Stunden. Wie lang muss ihre Pause mindestens sein?', [['30 Minuten', true, '30 Minuten gelten bei 4,5 bis 6 Stunden Arbeit.'], ['60 Minuten', false, '60 Minuten erst bei mehr als 6 Stunden.'], ['Keine Pause nötig', false, 'Ab 4,5 Stunden braucht sie eine Pause.']]);
  V('w51', 'Wie dürfen Jugendliche ihre Pausen aufteilen?', [['In Blöcken von mindestens 15 Minuten', true, 'Kürzere Unterbrechungen zählen nicht als Pause.'], ['Beliebig, z. B. in 5-Minuten-Stücken', false, 'Ein Block muss mindestens 15 Minuten lang sein.'], ['Nur als eine einzige lange Pause', false, 'Aufteilen ist erlaubt – in Blöcken ab 15 Minuten.']]);
  V('w52', 'Karin (16) hat 6 Unterrichtsstunden in der Berufsschule. Muss sie danach noch in den Betrieb?', [['Nein – einmal pro Woche zählt ein Schultag mit mehr als 5 Stunden als ganzer Arbeitstag', true, 'Bei mehr als 5 Unterrichtsstunden ist der Tag erledigt.'], ['Ja, immer', false, 'Nicht bei mehr als 5 Unterrichtsstunden (einmal pro Woche).'], ['Nur wenn der Chef anruft', false, 'Die Regel gilt unabhängig vom Chef.']]);
  V('w54', 'Wie viele Urlaubstage stehen einem **15-Jährigen** mindestens zu?', [['30 Werktage', true, 'Unter 16 → 30 Werktage.'], ['25 Werktage', false, '25 Werktage gelten unter 18.'], ['20 Werktage', false, 'Das ist zu wenig.']]);
  V('w55', 'Was ist die **Schichtzeit**?', [['Arbeitszeit plus Pausen', true, 'Von Arbeitsbeginn bis Arbeitsende.'], ['Nur die reine Arbeitszeit', false, 'Die Pausen gehören dazu.'], ['Nur die Pausen', false, 'Arbeitszeit plus Pausen.']]);
  V('w55', 'Wie lang darf die **Schichtzeit** für Jugendliche höchstens sein?', [['10 Stunden', true, 'Arbeitszeit + Pausen höchstens 10 Stunden.'], ['8 Stunden', false, '8 Stunden ist die reine Arbeitszeit.'], ['13 Stunden', false, 'Das war bei Karin der Verstoß.']]);
  V('w59', 'Wegen eines Großauftrags soll Miro (17) an Schultagen im Betrieb bleiben. Welche Pflicht des Betriebs steht dagegen?', [['Freistellungspflicht', true, 'Schulpflicht und Freistellung gehen vor.'], ['Vergütungspflicht', false, 'Es geht nicht ums Geld – auch bezahlte Überstunden ändern nichts.'], ['Zeugnispflicht', false, 'Die betrifft das Zeugnis.']]);
  V('w71', 'Welche Aufgabe haben die **Berufsgenossenschaften**?', [['Sie tragen die gesetzliche Unfallversicherung und erlassen die UVV', true, 'Unfallverhütungsvorschriften.'], ['Sie nehmen die Abschlussprüfung ab', false, 'Das macht die IHK.'], ['Sie vertreten die Beschäftigten im Betrieb', false, 'Das macht der Betriebsrat.']]);
  V('w77', 'Wie sieht ein **Verbotszeichen** aus?', [['Rund, rot durchgestrichen', true, 'Rot = Verbot.'], ['Rund und blau', false, 'Blau = Gebot.'], ['Gelbes Dreieck', false, 'Gelbes Dreieck = Warnung.']]);
  V('w77', 'Was bedeutet ein **gelbes Dreieck** als Sicherheitszeichen?', [['Warnzeichen – Achtung, Gefahr', true, 'Gelbes Dreieck = Warnung.'], ['Gebotszeichen', false, 'Gebot = blau und rund.'], ['Verbotszeichen', false, 'Verbot = rot durchgestrichen.']]);
  V('w91', 'Was fördert das **SGB** (Sozialgesetzbuch)?', [['Berufliche Weiterbildung, Fortbildung und Umschulung', true, 'Das BAföG fördert dagegen schulische Bildung.'], ['Schulische Bildungsmaßnahmen', false, 'Das fördert das BAföG.'], ['Nur ein Studium im Ausland', false, 'Darum geht es beim SGB nicht.']]);
  V('w92', 'Mehrere Arbeitselemente werden zu einer größeren Aufgabe zusammengefasst. Wie heißt das?', [['job enlargement', true, 'Aufgabenerweiterung – mehr vom Gleichen.'], ['job enrichment', false, 'Das ist mehr Entscheidungsspielraum.'], ['job rotation', false, 'Das ist Aufgabenwechsel.']]);
  V('w92', 'Eine Mitarbeiterin darf jetzt selbst entscheiden, wie sie ihre Aufgaben plant. Was ist das?', [['job enrichment', true, 'Aufgabenbereicherung – mehr Verantwortung.'], ['job enlargement', false, 'Das wäre nur mehr Aufgaben der gleichen Art.'], ['job rotation', false, 'Das wäre Aufgabenwechsel.']]);
  V('w93', 'Am Fließband wechseln alle zwei Stunden die Stationen. Wie heißt das?', [['job rotation', true, 'Aufgabenwechsel gegen Monotonie.'], ['job enrichment', false, 'Das ist mehr Entscheidungsspielraum.'], ['job enlargement', false, 'Das ist das Zusammenfassen von Arbeitselementen.']]);
  V('w94', 'Wann ist die Leistung laut **Wochenkurve** am höchsten?', [['Dienstag und Mittwoch', true, 'Montag Anlauf, dann Hoch, zum Freitag Abfall.'], ['Montag', false, 'Montag ist die Anlaufphase.'], ['Freitag', false, 'Zum Freitag fällt die Leistung ab.']]);
  V('w99', 'Eine Aushilfe räumt ohne Einweisung Regale ein. Welche Art von Arbeit ist das?', [['Ungelernte Arbeit', true, 'Ungelernt = Aushilfe.'], ['Angelernte Arbeit', false, 'Angelernt = kurz eingewiesen.'], ['Gelernte Arbeit', false, 'Gelernt = abgeschlossene Ausbildung.']]);
  V('w99', 'Jemand wird am Fließband kurz eingewiesen und arbeitet dann dort. Welche Art von Arbeit ist das?', [['Angelernte Arbeit', true, 'Angelernt = kurz eingewiesen.'], ['Gelernte Arbeit', false, 'Dafür braucht es eine abgeschlossene Ausbildung.'], ['Ungelernte Arbeit', false, 'Ungelernt = Aushilfe ohne Einweisung.']]);
  V('w111', 'Wie viel zählt **Teil 1** der gestreckten Abschlussprüfung?', [['20 %', true, 'Im 4. Halbjahr, 90 Minuten schriftlich.'], ['50 %', false, 'Teil 1 zählt 20 %.'], ['Gar nicht', false, 'Bei der gestreckten Prüfung zählt Teil 1 mit.']]);
  V('w111', 'Wann findet **Teil 1** der Abschlussprüfung statt?', [['Im 4. Ausbildungshalbjahr', true, 'Einrichten eines IT-gestützten Arbeitsplatzes.'], ['Im 2. Ausbildungshalbjahr', false, 'Erst im 4. Halbjahr.'], ['Am Ende der Ausbildung', false, 'Das ist Teil 2.']]);
  V('w115', 'Worum geht es in **Lernfeld 5**?', [['Software zur Verwaltung von Daten anpassen', true, 'Das ist euer AEW-Thema.'], ['Schutzbedarfsanalyse im eigenen Arbeitsbereich', false, 'Das ist Lernfeld 4.'], ['Arbeitsplätze nach Kundenwunsch ausstatten', false, 'Das ist Lernfeld 2.']]);
  // ITS
  V('i3', 'Ein Online-Shop löscht Kundendaten, sobald er sie nicht mehr braucht. Welcher DSGVO-Grundsatz ist das?', [['Speicherbegrenzung', true, 'Speichern nur so lange wie nötig.'], ['Transparenz', false, 'Transparenz = Betroffene informieren.'], ['Richtigkeit', false, 'Richtigkeit = Daten müssen stimmen.'], ['Zweckbindung', false, 'Zweckbindung = Zweck vorher festgelegt.']]);
  V('i3', 'Was bedeutet der DSGVO-Grundsatz **Richtigkeit**?', [['Die Daten müssen stimmen – Betroffene haben Anspruch auf Korrektur', true, 'Falsche Daten müssen berichtigt werden.'], ['Nur so viele Daten erheben wie nötig', false, 'Das ist Datenminimierung.'], ['Daten nur so lange speichern wie nötig', false, 'Das ist Speicherbegrenzung.']]);
  V('i4', 'Ein Sportverein fragt bei der Anmeldung nach dem Gehalt, obwohl er das nicht braucht. Gegen welchen Grundsatz verstößt er?', [['Datenminimierung', true, 'Nur so viele Daten wie für den Zweck nötig.'], ['Speicherbegrenzung', false, 'Die betrifft die Dauer der Speicherung.'], ['Richtigkeit', false, 'Die betrifft korrekte Daten.']]);
  V('i5', 'Ein Shop nutzt Lieferadressen plötzlich für fremde Werbung – das war vorher nicht festgelegt. Welcher Grundsatz ist verletzt?', [['Zweckbindung', true, 'Daten nur für den vorher festgelegten Zweck.'], ['Speicherbegrenzung', false, 'Es geht nicht um die Dauer.'], ['Richtigkeit', false, 'Die Adressen stimmen ja.']]);
  V('i5', 'Was bedeutet **Transparenz** in der DSGVO?', [['Betroffene werden verständlich und umfassend informiert', true, 'Sie sollen wissen, was mit ihren Daten passiert.'], ['Nur so viele Daten erheben wie nötig', false, 'Das ist Datenminimierung.'], ['Schutz durch technische und organisatorische Maßnahmen', false, 'Das ist Integrität und Vertraulichkeit.']]);
  V('i6', 'Wofür steht **TOM** im Datenschutz?', [['Technische und organisatorische Maßnahmen', true, 'Sie schützen Daten vor unbefugtem Zugriff.'], ['Transparente Online-Meldung', false, 'TOM sind Schutzmaßnahmen.'], ['Tägliche Offline-Sicherung', false, 'Eine Sicherung kann eine TOM sein – die Abkürzung heißt aber etwas anderes.']]);
  V('i6', 'Was verlangt der DSGVO-Grundsatz **Rechtmäßigkeit**?', [['Eine Einwilligung oder eine andere Rechtsgrundlage', true, 'Ohne Rechtsgrundlage keine Verarbeitung.'], ['Dass die Daten korrekt sind', false, 'Das ist Richtigkeit.'], ['Dass der Zweck vorher feststeht', false, 'Das ist Zweckbindung.']]);
  V('i10', 'Welcher Standard beschreibt **Informationssicherheits-Managementsysteme**?', [['ISO 27001', true, 'Aus der ISO-27000er-Reihe.'], ['DIN 69901-5', false, 'Das ist Projektmanagement (Lasten-/Pflichtenheft).'], ['DIN 5008', false, 'Das sind Schreib- und Gestaltungsregeln.'], ['BDSG', false, 'Das ist ein Gesetz.']]);
  V('i11', 'Welche Einrichtung gehört zu **KRITIS**?', [['Ein Wasserwerk', true, 'Energie, Wasser, Gesundheit sind kritische Infrastrukturen.'], ['Ein Kiosk', false, 'Kein besonders zu schützender Bereich.'], ['Ein Fitnessstudio', false, 'Kein besonders zu schützender Bereich.']]);
  V('i12', 'Wie hängen **DSGVO** und **BDSG** zusammen?', [['Die DSGVO gilt EU-weit, das BDSG ergänzt sie in Deutschland', true, 'Ergänzen, nicht ersetzen.'], ['Das BDSG ersetzt die DSGVO in Deutschland', false, 'Es ergänzt sie nur.'], ['Beide sind Standards des BSI', false, 'Beide sind Gesetze bzw. Verordnungen.']]);
  V('i18', 'Ein Webserver speichert die IP-Adressen seiner Besucher. Was stimmt?', [['IP-Adressen sind personenbezogen – speichern nur DSGVO-konform', true, 'Die DSGVO sieht sie als Online-Kennung.'], ['Egal, IP-Adressen gehören zu Geräten', false, 'Sie können eine Person identifizieren.'], ['Die DSGVO gilt nur für Namen und Adressen', false, 'Auch Online-Kennungen sind personenbezogen.']]);
  V('i34', 'Welches Schutzziel greift ein **DoS-Angriff** an?', [['Verfügbarkeit', true, 'Der Dienst soll nicht mehr erreichbar sein.'], ['Vertraulichkeit', false, 'Das wäre heimliches Mitlesen.'], ['Integrität', false, 'Das wäre das Verändern von Daten.']]);
  V('i34', 'Jemand liest heimlich Daten mit. Welches Schutzziel ist verletzt?', [['Vertraulichkeit', true, 'Nur Befugte sollen Zugriff haben.'], ['Verfügbarkeit', false, 'Die Daten sind ja noch erreichbar.'], ['Integrität', false, 'Die Daten werden nicht verändert.']]);
  V('i36', 'Dein selbst berechneter Hashwert ist **anders** als der auf der Download-Seite. Was bedeutet das?', [['Die Datei wurde verändert oder beschädigt', true, 'Ungleich → manipuliert oder beschädigt.'], ['Die Datei ist in Ordnung', false, 'Nur gleiche Hashwerte bedeuten unverändert.'], ['Die Datei ist nur größer geworden', false, 'Der Hashwert sagt nichts über die Größe.']]);
  V('i36', 'Welches Schutzziel prüft man mit einem **Hashwert-Vergleich**?', [['Integrität', true, 'Daten sind richtig und unverändert.'], ['Verfügbarkeit', false, 'Die betrifft die Erreichbarkeit.'], ['Vertraulichkeit', false, 'Die betrifft den Zugriff.']]);
  V('i38', 'Warum speichert man Passwörter als **Hashwert**?', [['Aus dem Hash kann man das Passwort nicht zurückrechnen', true, 'Selbst der Admin kann es nicht lesen.'], ['Damit der Admin es jederzeit nachlesen kann', false, 'Genau das geht mit Hashes nicht.'], ['Weil Hashing eine Verschlüsselung mit Schlüssel ist', false, 'Hashing ist keine Verschlüsselung.']]);
  V('i39', 'Was beschreibt das Schutzziel **Integrität**?', [['Die Daten sind richtig und unverändert', true, 'Keine unbefugte Änderung.'], ['Die Daten sind erreichbar, wenn man sie braucht', false, 'Das ist Verfügbarkeit.'], ['Nur Befugte können zugreifen', false, 'Das ist Vertraulichkeit.']]);
  V('i39', 'Was beschreibt das Schutzziel **Verfügbarkeit**?', [['Systeme und Daten sind erreichbar, wenn man sie braucht', true, 'Ein DoS-Angriff greift genau das an.'], ['Nur Befugte können zugreifen', false, 'Das ist Vertraulichkeit.'], ['Die Daten sind unverändert', false, 'Das ist Integrität.']]);
  V('i51', 'Ein Admin meldet sich per **Telnet** am Switch an. Was ist das Risiko?', [['Das Passwort geht im Klartext übers Netz und kann mitgelesen werden', true, 'Deshalb SSH – das verschlüsselt.'], ['Der Switch wird langsamer', false, 'Es geht um Sicherheit, nicht um Tempo.'], ['Es gibt kein Risiko', false, 'Telnet überträgt unverschlüsselt.']]);
  V('i52', 'Ein System meldet: „Unerlaubter Eingriff auf dem Server erkannt." Was für ein System ist das?', [['Ein Intrusion Detection System (IDS)', true, 'Es erkennt unerlaubte Eingriffe.'], ['Ein Backup-System', false, 'Das sichert Daten.'], ['Eine Festplattenverschlüsselung', false, 'Die schützt Daten, meldet aber keine Eingriffe.']]);
  V('i55', 'Wofür ist der Unix-Ordner **/tmp** gedacht?', [['Für kurzlebige Dateien – er wird automatisch geleert', true, 'Wichtige Daten gehören woanders hin.'], ['Für wichtige Datenbanken', false, 'Die wären nach dem Leeren weg.'], ['Für schreibgeschützte Systemdateien', false, 'In /tmp darf man schreiben.']]);
  V('i57', 'Warum braucht **Triple-DES** unterschiedliche Teilschlüssel?', [['Mit gleichen Schlüsseln wirkt es nur wie einfaches DES', true, 'Der Sicherheitsgewinn geht sonst verloren.'], ['Sonst funktioniert die Verschlüsselung gar nicht', false, 'Sie funktioniert, ist aber schwach.'], ['Damit es schneller wird', false, 'Es geht um Sicherheit.']]);
  V('i59', 'Eine Firewall-Software blockiert unerwünschte Verbindungen. Welche Art von Maßnahme ist das?', [['Logisch (Software)', true, 'Die Maßnahme steckt in der Software.'], ['Physikalisch (baulich)', false, 'Bauliche Maßnahmen betreffen Gebäude und Räume.'], ['Organisatorisch', false, 'Organisatorisch wären Regeln und Abläufe.']]);
  V('i59', 'Wovor schützt ein Backup-Server in einem **anderen Brandabschnitt**?', [['Vor Datenverlust, wenn es im Serverraum brennt', true, 'Die Daten sind dann woanders noch da.'], ['Vor Phishing-Mails', false, 'Dagegen hilft der Standort nicht.'], ['Vor gestohlenen Passwörtern', false, 'Dagegen hilft der Standort nicht.']]);
  V('i75', 'Muss man laut BSI sein Passwort alle 30 Tage wechseln?', [['Nein – nur, wenn es in fremde Hände geraten sein könnte', true, 'Die Pflicht zum regelmäßigen Wechsel wurde gestrichen.'], ['Ja, alle 30 Tage', false, 'Diese Empfehlung wurde gestrichen.'], ['Nie, auch nicht bei Verdacht', false, 'Bei Verdacht schon.']]);
  V('i76', 'Ein 10-stelliges Passwort braucht 3,07 Tage. Wie lange ungefähr ein **9-stelliges** (94 Zeichen)?', [['Etwa 47 Minuten', true, '3,07 Tage ÷ 94 ≈ 47 Minuten.'], ['Etwa 1,5 Tage', false, 'Nicht ÷ 2, sondern ÷ 94.'], ['Etwa 7 Stunden', false, 'Nicht ÷ 10, sondern ÷ 94.']]);
  V('i76', 'Warum dauert das Knacken mit jedem weiteren Zeichen etwa **94-mal** so lang?', [['Weil es für die neue Stelle 94 mögliche Zeichen gibt', true, 'Jede Stelle vervielfacht die Möglichkeiten.'], ['Weil pro Zeichen 94 Sekunden dazukommen', false, 'Es wird multipliziert, nicht addiert.'], ['Weil sich die Zeit pro Zeichen verdoppelt', false, 'Nicht ×2, sondern ×94.']]);
  // AEW
  V('a2', '„Das System muss Kundendaten dauerhaft speichern." Wohin gehört dieser Satz?', [['Lastenheft – Anforderung des Kunden', true, 'Das WAS aus Sicht des Kunden.'], ['Pflichtenheft – technische Umsetzung', false, 'Das Pflichtenheft beschreibt das WIE, z. B. „MySQL-Tabelle Kunde".'], ['Glossar', false, 'Das Glossar erklärt nur Begriffe.']]);
  V('a2', 'Was beschreibt das **Pflichtenheft**?', [['WIE die Anforderungen technisch umgesetzt werden', true, 'Konkrete technische Umsetzung.'], ['WAS der Kunde will', false, 'Das ist das Lastenheft.'], ['Nur die Begriffe des Projekts', false, 'Das ist das Glossar.']]);
  V('a5', 'Welche Anforderung ist **schlecht** formuliert?', [['„Die Software soll modern aussehen."', true, 'Nicht prüfbar – was heißt modern?'], ['„Der CSV-Export muss in unter 5 Sekunden fertig sein."', false, 'Eindeutig und prüfbar.'], ['„Das System muss 100 Nutzer gleichzeitig bedienen."', false, 'Eindeutig und prüfbar.']]);
  V('a8', 'Warum gehören **Abnahmekriterien** ins Pflichtenheft?', [['Weil es oft Vertragsgrundlage ist und die Abnahme daran geprüft wird', true, 'Testfälle und Abnahmekriterien werden oft vergessen.'], ['Damit das Firmenlogo stimmt', false, 'Das ist Gestaltung.'], ['Damit die Gehälter feststehen', false, 'Gehälter gehören nicht hinein.']]);
  V('a9', 'Wofür ist die Norm **DIN 5008**?', [['Schreib- und Gestaltungsregeln, z. B. für Briefe', true, 'Nicht für Lasten- und Pflichtenhefte.'], ['Lasten- und Pflichtenheft', false, 'Das ist DIN 69901-5.'], ['Informationssicherheit', false, 'Das ist ISO 27001.']]);
  V('a11', 'Im Lastenheft steht eine Nummer **/LR10/**. Was ist das?', [['Eine Rahmenbedingung', true, 'LR = Lastenheft-Rahmenbedingung.'], ['Eine Funktion', false, 'Funktionen sind /LF…/.'], ['Ein Testfall', false, 'Testfälle stehen im Pflichtenheft.']]);
  V('a11', '„/LF20/ Das System muss Rechnungen als PDF erzeugen." Was für eine Anforderung ist das?', [['Eine funktionale Anforderung', true, 'Es beschreibt eine Funktion – LF = Lastenheft-Funktion.'], ['Eine Qualitätsanforderung', false, 'Qualität wäre z. B. „in 2 Sekunden".'], ['Eine Rahmenbedingung', false, 'Rahmenbedingungen sind /LR…/.']]);
  V('a22', '„Daten einstellen" hat ein **«include»** zu „Einloggen". Was heißt das?', [['Beim Daten einstellen wird immer eingeloggt', true, '«include» = wird immer mit ausgeführt.'], ['Eingeloggt wird nur unter einer Bedingung', false, 'Das wäre «extend».'], ['Einloggen gehört nicht zum System', false, 'Mit der Systemgrenze hat das nichts zu tun.']]);
  V('a23', '„Benutzerkonto erstellen" erweitert „Einloggen" per **«extend»** {Kunde neu}. Wann wird das Konto erstellt?', [['Nur wenn der Kunde neu ist', true, '«extend» = nur unter der Bedingung.'], ['Bei jedem Einloggen', false, 'Das wäre «include».'], ['Nie, «extend» ist nur ein Kommentar', false, '«extend» wird unter der Bedingung ausgeführt.']]);
  V('a24', 'Wohin zeigt der **«include»**-Pfeil?', [['Auf den eingebundenen Fall (z. B. Daten einstellen → Einloggen)', true, 'Der Basisfall zeigt auf den Fall, der immer mitläuft.'], ['Auf den Akteur', false, 'Der Pfeil verbindet zwei Anwendungsfälle.'], ['Vom eingebundenen Fall zum Basisfall', false, 'Umgekehrt.']]);
  V('a26', 'Was ist im Use-Case-Diagramm **nicht** erlaubt?', [['Verbindungslinien, die Ellipsen schneiden', true, 'Linien dürfen keine Anwendungsfälle kreuzen.'], ['Einen Anwendungsfall mit zwei Akteuren verbinden', false, 'Das ist erlaubt.'], ['«extend» zwischen zwei Anwendungsfällen', false, 'Genau dafür ist «extend» da.']]);
  V('a40', 'Welcher Java-Typ belegt **8 Byte** für ganze Zahlen?', [['long', true, 'long = 8 Byte.'], ['int', false, 'int = 4 Byte.'], ['short', false, 'short = 2 Byte.'], ['byte', false, 'byte = 1 Byte.']]);
  V('a40', 'Wie viele Byte belegt ein Java-**short**?', [['2 Byte', true, 'Wie char.'], ['4 Byte', false, 'Das ist int.'], ['8 Byte', false, 'Das ist long.'], ['1 Byte', false, 'Das ist byte.']]);
  V('a41', 'Welcher Wertebereich gehört zu **short**?', [['−32 768 … +32 767', true, '16 Bit mit Vorzeichen.'], ['−128 … +127', false, 'Das ist byte.'], ['0 … 255', false, 'Java kennt keinen vorzeichenlosen short.']]);
  V('a42', 'Welcher Datentyp speichert in Java einen **ganzen Text**?', [['String', true, 'Ein Referenzdatentyp.'], ['char', false, 'char speichert nur ein Zeichen.'], ['boolean', false, 'boolean speichert nur true oder false.']]);
  V('a44', 'Welchen Typ hat `0.234` im Java-Code **ohne** Endung?', [['double', true, 'Für float braucht man das f.'], ['float', false, 'Nur mit f: 0.234f.'], ['int', false, 'Es ist eine Kommazahl.']]);
  V('a44', 'Wie schreibt man den long-Wert 3123466000 richtig in Java?', [['3123466000L', true, 'long mit L.'], ['3123466000f', false, 'f steht für float.'], ['3123466000d', false, 'd steht für double.']]);
  V('a45', 'Welche Umwandlung braucht einen **Cast**?', [['double → int', true, 'Von groß nach klein nur explizit.'], ['byte → long', false, 'Das geht automatisch.'], ['int → long', false, 'Das geht automatisch.']]);
  V('a45', 'Warum wandelt Java **byte → long** ohne Cast um?', [['Kein Informationsverlust – der größere Typ fasst alle Werte', true, 'Implizite Typumwandlung.'], ['Weil beide gleich groß sind', false, 'byte = 1 Byte, long = 8 Byte.'], ['Weil long ein Objekt ist', false, 'long ist ein primitiver Typ.']]);
  V('a47', 'Was kann bei einem Cast von **int nach short** passieren?', [['Obere Bits werden abgeschnitten – der Wert kann sich verfälschen', true, 'Wie bei (short) 32343423 → −31361.'], ['Nichts, Java rundet immer passend', false, 'Es wird abgeschnitten, nicht gerundet.'], ['Der Code lässt sich nicht kompilieren', false, 'Mit Cast ist es erlaubt.']]);
  V('a48', 'Was ist **Autoboxing**?', [['Die automatische Umwandlung zwischen z. B. int und Integer', true, 'Primitiver Wert ↔ Wrapper-Objekt.'], ['Das automatische Speichern in eine Datei', false, 'Hat mit Dateien nichts zu tun.'], ['Die Umwandlung von Text in Zahlen', false, 'Das wäre Parsen.']]);
  V('a49', 'Warum ist ein **enum** für die vier Jahreszeiten besser als ein String?', [['Nur die festen Werte sind möglich – keine Tippfehler', true, 'Eigener Datentyp mit festen Werten.'], ['Weil String keine Umlaute kann', false, 'String kann Umlaute.'], ['Weil ein enum automatisch sortiert', false, 'Darum geht es nicht – es geht um feste Werte.']]);
  V('a50', 'Warum ist **int** für die Postleitzahl 01067 ungeeignet?', [['Die führende 0 geht verloren (1067)', true, 'Außerdem rechnet man nicht mit PLZ.'], ['int kann keine fünfstelligen Zahlen', false, 'int schafft bis ca. 2,1 Milliarden.'], ['int ist zu ungenau', false, 'int ist für ganze Zahlen genau.']]);
  V('a50', 'Welcher Typ passt für eine **Telefonnummer** wie „0171 234567"?', [['String', true, 'Man rechnet nicht damit, führende 0 und Leerzeichen bleiben erhalten.'], ['int', false, 'Die führende 0 ginge verloren.'], ['double', false, 'Keine Kommazahl.']]);
  V('a51', 'Welcher Typ passt für „Bewerber hat einen Führerschein (ja/nein)"?', [['boolean', true, 'Nur ja oder nein.'], ['String[]', false, 'Ein Array ist für mehrere Werte.'], ['char', false, 'char speichert ein Zeichen.']]);
  V('a53', 'Welchen Standardwert hat ein **int**-Attribut?', [['0', true, 'Zahlen starten mit 0 bzw. 0.0.'], ['null', false, 'null gibt es nur bei Referenztypen.'], ['1', false, 'Der Standardwert ist 0.']]);
  V('a53', 'Welcher Typ kann den Wert **null** haben?', [['String', true, 'String ist ein Referenztyp.'], ['boolean', false, 'Primitiv – Standardwert false.'], ['int', false, 'Primitiv – Standardwert 0.']]);
  V('a68', 'Wie viele Hex-Zeichen braucht man für **1 Byte** (8 Bit)?', [['2', true, 'Ein Hex-Zeichen = 4 Bit.'], ['1', false, 'Ein Hex-Zeichen reicht nur für 4 Bit.'], ['8', false, 'So viele Bits, nicht Hex-Zeichen.']]);
  V('a68', 'Welche **Basis** hat das Hexadezimalsystem?', [['16', true, 'Ziffern 0–9 und A–F.'], ['2', false, 'Das ist das Dualsystem.'], ['10', false, 'Das ist das Dezimalsystem.']]);
  V('a70', 'Ist **1000 0001** im 8-Bit-Zweierkomplement positiv oder negativ?', [['Negativ – das höchste Bit ist 1', true, 'Vorzeichenbit.'], ['Positiv – das letzte Bit ist 1', false, 'Das letzte Bit zeigt nur, dass die Zahl ungerade ist.'], ['Positiv – es hat mehr Nullen als Einsen', false, 'Die Anzahl sagt nichts über das Vorzeichen.']]);
  V('a71', 'Welcher Zahlenbereich passt in **8 Bit ohne Vorzeichen**?', [['0 … 255', true, '2⁸ = 256 Werte.'], ['−128 … +127', false, 'Das ist mit Vorzeichen (Zweierkomplement).'], ['0 … 127', false, 'Das wären nur 7 Bit.']]);
  V('a72', 'Welchen Zahlenbereich umfasst **ASCII**?', [['0 … 127', true, '7 Bit.'], ['0 … 255', false, 'Werte über 127 hängen von der Zeichentabelle ab.'], ['0 … 1023', false, 'Das wären 10 Bit.']]);

  window.LERNWERK_DATEN = F;
})();
