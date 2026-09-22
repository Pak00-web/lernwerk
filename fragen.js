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
  K('w3', 'wbl-dual', 'Unterschied zwischen dualer und vollzeitschulischer Ausbildung?', '**Dual:** Schule + Betrieb.\n**Vollzeitschulisch:** überwiegend in der Schule + Praktika (z. B. Pflege, Erzieher, Assistentenberufe). Ziele reichen von Berufsvorbereitung bis zum höheren Schulabschluss.', B156 + ' Aufg. 2');
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
    ['Mindestens 10 Jahre Berufserfahrung', false, 'Steht so nicht in den Unterlagen.'],
    ['Mitgliedschaft im Betriebsrat', false, 'Hat mit der Ausbilderrolle nichts zu tun.'],
  ], 'WBL · Beteiligte im Ausbildungsverhältnis (Buch S. 152–156)');
  K('w7', 'wbl-dual', 'Welches Zeugnis bekommt man vom Betrieb/Kammer und welches von der Berufsschule?', 'Betrieb/Kammer: Abschlussprüfung vor der Kammer → **Facharbeiterbrief / Kammerzeugnis**.\nBerufsschule: Zeugnisnoten → **Abschlusszeugnis der Berufsschule**.\nDazu kommt das **Zeugnis des Betriebs**.', KL5 + ' Aufg. 1');
  K('w8', 'wbl-dual', 'Was ist die JAV und wann gibt es sie?', '**Jugend- und Auszubildendenvertretung.** Nur in Betrieben **mit Betriebsrat** und mindestens **5** Jugendlichen/Azubis unter 25. Amtszeit **2 Jahre**.', 'WBL · Beteiligte (Buch S. 152–156)');

  K('w10', 'wbl-vertrag', 'Wer unterschreibt den Ausbildungsvertrag und welche Form gilt?', '**Ausbildender und Auszubildender**, bei Minderjährigen zusätzlich der **gesetzliche Vertreter**. Der Vertrag muss **vor Beginn schriftlich** niedergelegt werden (§ 11 BBiG).', AB68 + ' Aufg. 2', 3);
  K('w11', 'wbl-vertrag', 'Nenne fünf Mindestangaben im Ausbildungsvertrag (§ 11 BBiG).', 'Ausbildungsberuf und Ziel · sachliche/zeitliche Gliederung · Beginn und Dauer · Maßnahmen außerhalb des Betriebs · tägliche Arbeitszeit · **Probezeit** · Vergütung · Urlaub · Kündigungsvoraussetzungen · Hinweis auf Tarifverträge · Form des Ausbildungsnachweises', AB68 + ' Aufg. 1', 5);
  K('w12', 'wbl-vertrag', 'Was prüft die Kammer (IHK) beim Ausbildungsvertrag?', 'Ob der Vertrag zur **Ausbildungsordnung** passt, die **Eignung der Ausbildungsstätte** und die **Eignung des Ausbilders**. Dann Eintrag ins **Verzeichnis der Berufsausbildungsverhältnisse**.', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  K('w13', 'wbl-vertrag', 'Nenne drei weitere Aufgaben der Kammer.', 'Überwacht die Ausbildung · bildet **Prüfungsausschüsse** · organisiert Prüfungen und erlässt Prüfungsvorschriften · entscheidet über Verkürzung/Verlängerung · Fortbildungen · **Ansprechpartner bei Problemen**', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  M('w14', 'wbl-vertrag', 'Welche Reihenfolge der Ausbildungsvorgaben stimmt (oben = höchste)?', [
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
  K('w19', 'wbl-vertrag', 'Welche Zeitpunkte beenden ein Ausbildungsverhältnis?', 'Bestandene **Abschlussprüfung** · **Kündigung** · **Ablauf der Ausbildungszeit**', 'WBL · Beteiligte (Buch S. 152–156)', 3);
  K('w20', 'wbl-vertrag', 'Was passiert, wenn man die Abschlussprüfung nicht besteht?', 'Sie kann **bis zu zweimal wiederholt** werden. Auf Verlangen verlängert sich die Ausbildung bis zur nächsten Wiederholungsprüfung (höchstens **1 Jahr**).', B156 + ' Aufg. 8');

  K('w30', 'wbl-pflichten', 'Nenne die Pflichten des Auszubildenden (§ 13 BBiG).', '**Lern**pflicht · **Sorgfalts**pflicht · **Gehorsams**pflicht · **Schul**pflicht (Berufsschule, Prüfungen) · **Nachweis**pflicht (Berichtsheft) · **Schweige**pflicht · **Wettbewerbsverbot**', B160 + ' Aufg. 3', 4);
  K('w31', 'wbl-pflichten', 'Nenne die Pflichten des Ausbildenden (§§ 14–17 BBiG).', '**Ausbildungs**pflicht (Ausbilder stellen, Mittel kostenlos) · **Fürsorge**pflicht (nur ausbildungsdienliche Arbeiten) · **Vergütungs**pflicht · **Freistellungs**pflicht (Berufsschule, Prüfungen) · **Zeugnis**pflicht', B160 + ' Aufg. 3', 4);
  K('w32', 'wbl-pflichten', 'Was ist das Wettbewerbsverbot?', 'Azubis dürfen dem Ausbildungsbetrieb **keine Konkurrenz** machen, z. B. durch **Schwarzarbeit**. Folge: Schadenersatz oder Kündigung.', B160 + ' Aufg. 4');
  M('w33', 'wbl-pflichten', 'Klaras Chef sagt: „Die Berufsschule ist unnötig, du bleibst im Betrieb." Welche Pflicht verletzt er?', [
    ['Freistellungspflicht', true, 'Der Betrieb muss für Berufsschule und Prüfungen freistellen.'],
    ['Vergütungspflicht', false, 'Es geht nicht ums Geld.'],
    ['Zeugnispflicht', false, 'Passt nicht zur Situation.'],
    ['Gehorsamspflicht', false, 'Das ist eine Pflicht des Azubis.'],
  ], AB68 + ' Aufg. 7 (Klara Korte)');
  M('w34', 'wbl-pflichten', 'Klara soll im Haushalt der Chefin putzen. Welche Pflicht wird verletzt?', [
    ['Fürsorgepflicht – nur ausbildungsdienliche Arbeiten', true, 'Private Arbeiten gehören nicht zur Ausbildung.'],
    ['Schweigepflicht', false, 'Passt nicht.'],
    ['Wettbewerbsverbot', false, 'Das betrifft den Azubi.'],
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
    ['Nur fristlos aus wichtigem Grund, schriftlich mit Grund', true, 'Eine ordentliche Kündigung gibt es für den Betrieb nicht.'],
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
    ['60 Minuten', true, 'Bei mehr als 6 Stunden 60 min, Blöcke mind. 15 min.'],
    ['30 Minuten', false, '30 min gelten bei 4,5–6 Stunden.'],
    ['45 Minuten', false, 'Die Regel für Erwachsene – nicht für Jugendliche.'],
    ['25 Minuten reichen, wenn sie früher gehen darf', false, 'Verstoß (Karin Aufg. 2).'],
  ], JQ + ' Aufg. 2');
  M('w52', 'wbl-jarbschg', 'Nach 4 Stunden Unterricht fällt der Rest aus. Muss Karin (16) noch in den Betrieb?', [
    ['Ja – erst bei mehr als 5 Unterrichtsstunden ist der Tag erledigt', true, 'Einmal pro Woche gilt ein Schultag mit > 5 Stunden als Arbeitstag.'],
    ['Nein – jeder Schultag ist komplett frei', false, 'Nur bei mehr als 5 Unterrichtsstunden.'],
    ['Nur wenn der Chef anruft', false, 'Sie muss zurück in den Betrieb.'],
  ], JQ + ' Aufg. 3');
  K('w53', 'wbl-jarbschg', 'Wie viel Urlaub bekommen Jugendliche? (Stichtag?)', 'Alter am **1.1.** zählt:\n- unter 16 → **30 Werktage**\n- unter 17 → **27 Werktage**\n- unter 18 → **25 Werktage**', JQ + ' Aufg. 8', 3);
  M('w54', 'wbl-jarbschg', 'Titus ist 17 und bekommt 24 Tage Urlaub. Was stimmt?', [
    ['Verstoß – ihm stehen mindestens 25 Werktage zu', true, 'Unter 18 → 25 Werktage.'],
    ['In Ordnung', false, '24 ist zu wenig.'],
    ['Ihm stehen 30 Werktage zu', false, '30 gelten nur unter 16.'],
  ], B160 + ' Aufg. 5b');
  M('w55', 'wbl-jarbschg', 'Karin arbeitet 7–20 Uhr mit Pause 12–17 Uhr. Ist ihre Beschwerde berechtigt?', [
    ['Ja – die Schichtzeit beträgt 13 Stunden, erlaubt sind 10', true, 'Schichtzeit = Arbeit + Pausen, max. 10 h.'],
    ['Nein – sie arbeitet ja nur 8 Stunden', false, 'Die Schichtzeit ist das Problem.'],
    ['Nein – Jugendliche dürfen bis 20 Uhr arbeiten', false, 'Uhrzeit ok, Schichtzeit nicht.'],
  ], JQ + ' Aufg. 4');
  K('w56', 'wbl-jarbschg', 'Was ist für Jugendliche verboten (§§ 22, 23)?', '**Gefährliche Arbeiten**, **Akkordarbeit** und Arbeiten über der Leistungsfähigkeit.', JQ + ' Aufg. 6');
  K('w57', 'wbl-jarbschg', 'Welche ärztlichen Untersuchungen schreibt das JArbSchG vor?', '**Erstuntersuchung** höchstens 14 Monate vor Beginn (ohne sie keine Beschäftigung!) und **Nachuntersuchung** im ersten Jahr.', JQ + ' Aufg. 7');
  K('w58', 'wbl-jarbschg', 'Freizeit, Uhrzeit, Wochenende – was gilt für Jugendliche?', 'Mind. **12 h** Freizeit zwischen zwei Arbeitstagen · Arbeit nur **6–20 Uhr** · Samstag nur in Branchen mit Samstagsarbeit + freier Ersatztag · Sonntag fast nur Gastronomie/Gesundheit', 'WBL · Buch S. 157–160', 3);
  M('w59', 'wbl-jarbschg', 'Miro (17) soll wegen eines Großauftrags an Berufsschultagen im Betrieb arbeiten. Was stimmt?', [
    ['Unzulässig – Schulpflicht und Freistellung gehen vor', true, 'Ein Großauftrag ist kein Ausbildungszweck.'],
    ['Zulässig, wenn er freiwillig zustimmt', false, 'Auch freiwillig nicht (vgl. Karin Aufg. 5).'],
    ['Zulässig, wenn er Überstunden bezahlt bekommt', false, 'Geld ändert nichts.'],
  ], 'WBL · Buch S. 157 (Ausgangssituation Miro)');
  K('w60', 'wbl-jarbschg', 'Wer überwacht das Jugendarbeitsschutzgesetz, und für wen gilt es?', 'Gilt für Jugendliche **unter 18** (unter 15 = Kind → Kinderarbeit verboten). Überwachung: **Gewerbeaufsichtsamt** / Arbeitsschutzbehörde.', JQ + ' Zusammenfassung');

  K('w70', 'wbl-schutz', 'Unterschied technischer und sozialer Arbeitsschutz?', '**Technisch:** sichere Maschinen, Geräte und Arbeitsräume (UVV, Arbeitsstättenverordnung, Produktsicherheitsgesetz).\n**Sozial:** schützt bestimmte Personengruppen und regelt Arbeitszeiten (JArbSchG, ArbZG, MuSchG, SGB IX).', 'WBL · Arbeitsblatt S. 18', 4);
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
  K('w73', 'wbl-schutz', 'Arbeitszeitgesetz: tägliche Arbeitszeit und Ruhezeit bei Erwachsenen?', 'Max. **8 h/Tag** (bis **10 h**, wenn der Durchschnitt über 6 Monate 8 h bleibt). **11 h Ruhezeit** zwischen zwei Arbeitstagen.', 'WBL · Arbeitsblatt S. 18');
  K('w74', 'wbl-schutz', 'Nenne drei Regeln des Mutterschutzgesetzes.', 'Beschäftigungsverbot **6 Wochen vor** und **8 Wochen nach** der Geburt · besonderer **Kündigungsschutz** · keine schweren/gefährlichen Arbeiten, keine Nacht-, Sonntags- und Mehrarbeit · Mutterschaftsgeld', 'WBL · Arbeitsblatt S. 18', 3);
  K('w75', 'wbl-schutz', 'Wer überwacht den Arbeitsschutz?', 'Staatlich das **Gewerbeaufsichtsamt / Amt für Arbeitsschutz** und die **Berufsgenossenschaften**. Im Betrieb zusätzlich Betriebsrat, Sicherheitsbeauftragte, Betriebsarzt.', 'WBL · Arbeitsblatt S. 18');
  K('w76', 'wbl-schutz', 'Nenne Ursachen und Folgen von Arbeitsunfällen.', '**Ursachen:** ungenügende Schutzvorrichtungen, **menschliche** Fehler (Unachtsamkeit, Hektik, Alkohol), **technisches** Versagen.\n**Folgen:** Verletzter (Schmerzen, Verdienstausfall), Betrieb (Ausfall, höhere BG-Beiträge), Gesellschaft (Kosten für Behandlung, Reha, Renten).', 'WBL · Aufgabensammlung Klett S. 14', 4);
  M('w77', 'wbl-schutz', 'Was bedeutet ein **blaues, rundes** Sicherheitszeichen?', [
    ['Gebotszeichen – etwas muss getan werden (z. B. Fußschutz benutzen)', true, 'Blau = Gebot.'],
    ['Verbotszeichen', false, 'Verbot = rot durchgestrichen.'],
    ['Warnzeichen', false, 'Warnung = gelbes Dreieck.'],
  ], 'WBL · Arbeitsblatt S. 18');
  K('w78', 'wbl-schutz', 'Was regelt der Schwerbehindertenschutz (SGB IX)?', 'Teilhabe fördern, **besonderer Kündigungsschutz**, **Zusatzurlaub (5 Tage)**, Freistellung von Mehrarbeit auf Verlangen.', 'WBL · Arbeitsblatt S. 18');

  K('w90', 'wbl-arbeit', 'Unterschied Fortbildung und Umschulung?', '**Fortbildung** baut auf dem erlernten Beruf auf (Meister, Techniker, Fachwirt).\n**Umschulung** bereitet auf einen **anderen** Beruf vor (z. B. nach Unfall, wenn der Beruf wegfällt).', 'WBL · Arbeitsblatt S. 9');
  M('w91', 'wbl-arbeit', 'Was fördert das **BAföG**?', [
    ['Schulische Bildungsmaßnahmen', true, 'Bundesausbildungsförderungsgesetz.'],
    ['Berufliche Weiterbildung, Fortbildung und Umschulung', false, 'Das fördert das SGB.'],
    ['Nur Studium im Ausland', false, 'Zu eng.'],
  ], 'WBL · Arbeitsblatt S. 9');
  M('w92', 'wbl-arbeit', 'Was ist **job enrichment**?', [
    ['Aufgabenbereicherung – mehr Entscheidungsspielraum', true, 'Qualitativ mehr Verantwortung.'],
    ['Aufgabenerweiterung – mehrere Arbeitselemente zu einer Aufgabe', false, 'Das ist job enlargement.'],
    ['Aufgabenwechsel bei eintönigen Arbeiten', false, 'Das ist job rotation.'],
  ], 'WBL · Arbeitsblatt S. 11 (Humanisierung)');
  M('w93', 'wbl-arbeit', 'Was ist **job rotation**?', [
    ['Häufiger Aufgabenwechsel bei eintönigen Arbeiten', true, 'Gegen Monotonie.'],
    ['Aufgabenbereicherung', false, 'Das ist job enrichment.'],
    ['Schichtarbeit rund um die Uhr', false, 'Nein.'],
  ], 'WBL · Arbeitsblatt S. 11 (Humanisierung)');
  M('w94', 'wbl-arbeit', '„Montag ist der leistungsstärkste Tag der Woche." Stimmt das?', [
    ['Nein – Montag ist Anlaufphase, das Hoch liegt Dienstag/Mittwoch', true, 'Wochenkurve: Anlauf, Hoch, Abfall zum Freitag.'],
    ['Ja – nach dem Wochenende ist man ausgeruht', false, 'Die Aussage im Arbeitsblatt ist falsch.'],
  ], 'WBL · Arbeitsblatt S. 10');
  K('w95', 'wbl-arbeit', 'Nenne je zwei Vor- und Nachteile der betrieblichen Arbeitsteilung.', '**Vorteile:** höhere Produktivität, Spezialisierung/Übung, gleichmäßige Qualität, geringere Kosten.\n**Nachteile:** Monotonie, einseitige Belastung, Abhängigkeit (fällt einer aus, stockt alles), kein Bezug zum Endprodukt.', 'WBL · Klett S. 8 (Wohnland AG)', 4);
  K('w96', 'wbl-arbeit', 'Wohnland AG: Jeder braucht 8 h pro Tisch. Wie viele Tische schaffen 3 Leute mit Arbeitsteilung am Tag?', 'Jeder macht nur, was er am schnellsten kann (je 2 h): **6 h statt 24 h** Gesamtzeit je Tisch → bei 8 h Arbeitszeit **4 statt 3 Esstische** pro Tag.', 'WBL · Klett S. 8 (Wohnland AG)', 3);
  K('w97', 'wbl-arbeit', 'Nenne fünf Stressoren am Arbeitsplatz.', 'Zeitdruck · Lärm · Überforderung · Monotonie/Unterforderung · Konflikte/Mobbing · ständige Unterbrechungen · Schichtarbeit · unklare Anweisungen · Angst um den Arbeitsplatz', 'WBL · Arbeitsblatt S. 10', 5);
  K('w98', 'wbl-arbeit', 'Wodurch steigt die Leistungsbereitschaft?', 'Anerkennung und Lob · gerechte Bezahlung · gutes Betriebsklima · interessante Aufgaben · Aufstiegschancen · Mitbestimmung · gute Arbeitsbedingungen', 'WBL · Arbeitsblatt S. 10', 3);
  M('w99', 'wbl-arbeit', 'Welche Art von Arbeit macht ein **Fachinformatiker**?', [
    ['Gelernte Arbeit', true, 'Abgeschlossene Ausbildung.'],
    ['Angelernte Arbeit', false, 'Angelernt = kurz eingewiesen (z. B. Fließband).'],
    ['Ungelernte Arbeit', false, 'Ungelernt = Aushilfe.'],
  ], 'WBL · Klett S. 9 (Arten der Arbeit)', 1);

  K('w110', 'wbl-beruf', 'Nenne die vier Fachrichtungen des Fachinformatikers.', '**Anwendungsentwicklung**, **Systemintegration**, **Daten- und Prozessanalyse**, **Digitale Vernetzung** (die letzten beiden seit 2020 neu).', 'WBL · BIBB „Ausbildung gestalten: Fachinformatiker/-in"', 2);
  M('w111', 'wbl-beruf', 'Wann ist Teil 1 der gestreckten Abschlussprüfung und wie viel zählt er?', [
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
  K('i1', 'its-dsgvo', 'Unterschied Datenschutz und Datensicherheit?', '**Datenschutz** schützt **personenbezogene Daten** – Betroffene behalten die Kontrolle über ihre Daten.\n**Datensicherheit** schützt **alle Daten** vor Verlust, Diebstahl, Beschädigung und unbefugtem Zugriff (Vertraulichkeit, Integrität, Verfügbarkeit).', DS + ' Aufg. 1a/b', 4);
  K('i2', 'its-dsgvo', 'Was besagt das Verbotsprinzip im Datenschutz?', 'Die Verarbeitung personenbezogener Daten ist **grundsätzlich verboten** – erlaubt nur mit **Einwilligung** oder einer **gesetzlichen Grundlage** („Verbot mit Erlaubnisvorbehalt").', DS + ' Aufg. 1c', 3);
  M('i3', 'its-dsgvo', '„Die Speicherung der Daten ist zeitlich begrenzt." Welcher Grundsatz aus Art. 5 DSGVO?', [
    ['Speicherbegrenzung', true, 'Nr. 6 in der Schulaufgabe.'],
    ['Datenminimierung', false, 'Datenminimierung = nur so viele Daten wie nötig.'],
    ['Zweckbindung', false, 'Zweckbindung = Zweck vorher festgelegt.'],
    ['Richtigkeit', false, 'Richtigkeit = Daten korrekt, Anspruch auf Korrektur.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i4', 'its-dsgvo', '„Dem Zweck angemessen und auf das notwendige Maß beschränkt." Welcher Grundsatz?', [
    ['Datenminimierung', true, 'Nur so viele Daten wie nötig.'],
    ['Transparenz', false, 'Transparenz = Betroffene umfassend informieren.'],
    ['Rechtmäßigkeit', false, 'Rechtmäßigkeit = Einwilligung/Rechtsgrundlage.'],
    ['Speicherbegrenzung', false, 'Das betrifft die Dauer.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i5', 'its-dsgvo', '„Zwecke müssen bei der Erhebung festgelegt, eindeutig und legitim sein." Welcher Grundsatz?', [
    ['Zweckbindung', true, 'Nr. 3.'],
    ['Transparenz', false, 'Passt nicht.'],
    ['Integrität und Vertraulichkeit', false, 'Das ist der Schutz durch TOM.'],
  ], DS + ' Aufg. 1d (Art. 5)');
  M('i6', 'its-dsgvo', '„Schutz vor unbefugtem Zugriff durch technisch-organisatorische Maßnahmen." Welcher Grundsatz?', [
    ['Integrität und Vertraulichkeit', true, 'Nr. 7.'],
    ['Richtigkeit', false, 'Passt nicht.'],
    ['Datenminimierung', false, 'Passt nicht.'],
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
    ['Kriterien für IT-Sicherheit', false, 'Nein.'],
    ['Ein Verschlüsselungsverfahren', false, 'Nein.'],
  ], DS + ' Aufg. 1e');
  M('i12', 'its-dsgvo', 'Was ist das **BDSG**?', [
    ['Bundesdatenschutzgesetz – ergänzt die DSGVO in Deutschland', true, 'Die DSGVO gilt EU-weit, das BDSG ergänzt national.'],
    ['Ersetzt die DSGVO in Deutschland', false, 'Es ergänzt, ersetzt nicht.'],
    ['Ein Standard des BSI', false, 'Nein, ein Gesetz.'],
  ], DS + ' Aufg. 1e');
  K('i13', 'its-dsgvo', 'Unterschied Privacy by Design und Privacy by Default?', '**By Design:** Datenschutz schon bei der **Entwicklung** mitdenken.\n**By Default:** **Voreinstellungen** sind datenschutzfreundlich.', 'ITS1 · Themenübersicht LF4', 2);
  K('i14', 'its-dsgvo', 'Nenne vier technisch-organisatorische Maßnahmen (TOM).', 'Verschlüsselung · Zugriffsrechte auf das Nötige beschränken · automatische Löschung · Backups · Zutrittskontrolle · 2-Faktor-Authentifizierung · Schulungen · Löschkonzept', DS + ' (eigene Lösung)', 4);
  K('i15', 'its-dsgvo', 'Sportverein: Welche Daten werden wofür erhoben?', 'Name, Geburtsdatum, Geschlecht, Kontoverbindung, Kontaktdaten, Beitrittsdatum – für die **Mitgliederverwaltung** und **Beitragszahlungen**.', DS + ' Frage 1 (Sportverein)', 2);
  K('i16', 'its-dsgvo', 'Sportverein: Nenne vier Gefahren für die Mitgliederdaten.', 'Unbefugter Zugriff · Diebstahl/Verlust von Geräten · Hacking · Schadsoftware · Phishing · Fehler von Mitarbeitern · schwache Passwörter · fehlende Updates · Feuer/Wasser · Missbrauch durch Berechtigte', 'ITS1 · DSGVO Arbeitsauftrag (Sportverein) Aufg. 1', 4);
  K('i17', 'its-dsgvo', 'Warum können Schutzziele trotz Maßnahmen verletzt werden? Beispiel je Ziel.', 'Maßnahmen **senken das Risiko**, schließen es nie ganz aus.\n**Verfügbarkeit:** Cyberangriff, Hardwaredefekt · **Integrität:** unbefugte Änderung, menschlicher Fehler · **Vertraulichkeit:** Phishing, gestohlenes Passwort, falsch versendete Mail', 'ITS1 · DSGVO Arbeitsauftrag (Sportverein) Aufg. 3', 4);
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
  K('i50', 'its-mass', 'Unterschied organisatorische und technische Maßnahmen – je zwei Beispiele.', '**Organisatorisch** = Regeln für Menschen: Zugangskontrolle zu Serverräumen, Einweisung in Passwortrichtlinien, Konto erst nach Quittierung der Benutzerordnung, Notfallplan bei Ausfall des Admins.\n**Technisch** = Technik schützt: Dienste auf mehrere Server verteilen, unnötige Dienste abschalten, Telnet durch SSH ersetzen, Verschlüsselung/VPN, IDS, Firewall.', AA + ' · Arbeitsauftrag 1', 4);
  M('i51', 'its-mass', 'Warum soll **Telnet** durch **SSH** ersetzt werden?', [
    ['Telnet überträgt das Passwort im Klartext, SSH verschlüsselt', true, 'Bei Telnet kann mitgelesen werden.'],
    ['SSH ist schneller', false, 'Nicht der Grund.'],
    ['Telnet funktioniert nicht mit Switches', false, 'Nicht der Grund.'],
  ], AA + ' · Arbeitsauftrag 1 (technisch Nr. 3)');
  M('i52', 'its-mass', 'Was macht ein **Intrusion Detection System (IDS)**?', [
    ['Es spürt unautorisierte (erfolgte) Eingriffe auf', true, 'Spezielle Überwachungssoftware.'],
    ['Es verschlüsselt Festplatten', false, 'Nein.'],
    ['Es erstellt Backups', false, 'Nein.'],
  ], AA + ' · Arbeitsauftrag 1 (technisch Nr. 5)');
  M('i53', 'its-mass', 'Welche Beispiele sind **Fehlverhalten**, das zu Vertraulichkeitsverlust führt?', [
    ['Ausdrucke mit personenbezogenen Daten bleiben am Netzdrucker liegen', true, 'Jeder Vorbeikommende kann sie lesen.'],
    ['Vertrauliches wird in Hörweite Fremder besprochen', true, 'z. B. am Handy in der Öffentlichkeit.'],
    ['Festplatten werden zur Reparatur geschickt, ohne sie sicher zu löschen', true, 'Daten gelangen in fremde Hände.'],
    ['Regelmäßige Backups werden gemacht', false, 'Das ist eine Schutzmaßnahme.'],
  ], AA + ' · Fehlverhalten', 3, { mehrfach: true });
  K('i54', 'its-mass', 'Was bedeutet Verlust der Datenbankintegrität/-konsistenz – und welche Konsequenzen hat er?', 'Die Daten sind **noch vorhanden**, aber in einem **fehlerhaften Zustand**.\nKonsequenzen: Aufgaben können nicht (vollständig) erledigt werden · Informationsgehalt wird verfälscht · **hoher Aufwand** zur Wiederherstellung · oft unklar, **welche** Daten verändert wurden → weitere wirtschaftliche Schäden.', AA + ' · Arbeitsauftrag 2', 4);
  M('i55', 'its-mass', 'Eine Datenbank-Datei liegt im Unix-Ordner **/tmp**. Über Nacht ist die Datenbank unbrauchbar. Warum?', [
    ['/tmp wird automatisch geleert – die Datei wurde gelöscht', true, '/tmp ist für kurzlebige Dateien.'],
    ['/tmp ist schreibgeschützt', false, 'Nein.'],
    ['Ein Virus', false, 'Die Situation beschreibt die automatische Löschung.'],
  ], AA + ' · Arbeitsauftrag 2 (Situation 1)');
  K('i56', 'its-mass', 'Wie kann unzureichendes Schlüsselmanagement die Verschlüsselung unterlaufen?', 'Schlüssel **unsicher erzeugt oder aufbewahrt** · **schwache/erratbare** Schlüssel · Schlüssel **nicht auf sicherem Weg** übermittelt (z. B. Schlüssel und Daten auf **derselben** Diskette).\nAuch der **Verlust** ist ein Problem: vergessen, Mitarbeiter hat die Firma verlassen, versehentlich gelöscht → Daten nicht mehr entschlüsselbar.', AA + ' · Arbeitsauftrag 3', 4);
  M('i57', 'its-mass', 'Beim Triple-DES werden drei identische Teilschlüssel verwendet. Folge?', [
    ['Es wirkt nur wie eine einfache DES-Verschlüsselung – der Sicherheitsgewinn geht verloren', true, 'Arbeitsauftrag 3, letzte Situation.'],
    ['Dreifache Sicherheit', false, 'Gerade nicht.'],
    ['Die Verschlüsselung funktioniert nicht mehr', false, 'Sie funktioniert, ist aber schwach.'],
  ], AA + ' · Arbeitsauftrag 3');
  K('i58', 'its-mass', 'Event GmbH: Ergänze je eine Maßnahme – logisch (Software), organisatorisch, physikalisch (baulich).', '**Logisch:** Virenscanner – Schadsoftware wird nicht ausgeführt.\n**Organisatorisch:** Geschäftsprozess für Datensicherung – geklärt, wer sie wie durchführt.\n**Physikalisch:** Zutrittskontrolle mit Chipkarte – nur Berechtigte betreten Gebäude/Räume.\n(Weitere sinnvolle Lösungen möglich.)', AA + ' · Event GmbH a) (Lehrerlösung)', 6);
  M('i59', 'its-mass', 'Welcher Aspekt ist „Backup-Server in einem anderen Brandabschnitt"?', [
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
    ['Glossar', false, 'Nein.'],
  ], LP);
  K('a3', 'aew-last', 'Nenne die sechs Gliederungspunkte eines Lastenhefts (nach Balzert).', '1. Visionen und Ziele\n2. Rahmenbedingungen\n3. Kontext und Überblick\n4. Funktionale Anforderungen\n5. Qualitätsanforderungen (nichtfunktional)\n6. Glossar', LP, 6);
  K('a4', 'aew-last', 'Unterschied funktionale und nichtfunktionale Anforderung – mit Beispiel.', '**Funktional:** was das System können muss (Funktion, Verhalten, Daten) – „Kunde anlegen".\n**Nichtfunktional:** Qualität/Randbedingung (Leistung, Softwarequalität, rechtlich) – „Suchergebnis in 2 Sekunden", „leicht wartbar".', LP, 4);
  M('a5', 'aew-last', 'Welche Anforderung ist **gut** formuliert?', [
    ['„Das System soll Suchergebnisse innerhalb von 2 Sekunden anzeigen."', true, 'Eindeutig und prüfbar.'],
    ['„Das System soll schnell sein."', false, 'Nicht prüfbar – was heißt schnell?'],
    ['„Das System soll irgendwie benutzerfreundlich sein."', false, 'Nicht eindeutig.'],
  ], LP);
  K('a6', 'aew-last', 'Welche Eigenschaften hat eine gute Anforderung?', '**eindeutig, verständlich, prüfbar, widerspruchsfrei, vollständig**', LP, 3);
  K('a7', 'aew-last', 'Wozu vergibt man IDs (z. B. /LF10/) an Anforderungen?', 'Für **Traceability** (Nachvollziehbarkeit): Eine Anforderung lässt sich vom Lastenheft → Pflichtenheft → Programm → Test verfolgen.', LP, 2);
  M('a8', 'aew-last', 'Was gehört unbedingt ins Pflichtenheft, wird aber oft vergessen?', [
    ['Testfälle und Abnahmekriterien', true, 'Das Pflichtenheft ist oft Vertragsgrundlage.'],
    ['Das Firmenlogo', false, 'Nein.'],
    ['Die Gehälter der Entwickler', false, 'Nein.'],
  ], LP);
  M('a9', 'aew-last', 'Auf welcher Norm basieren Lasten- und Pflichtenheft?', [
    ['DIN 69901-5', true, 'Projektmanagement-Begriffe.'],
    ['ISO 27001', false, 'Das ist Informationssicherheit.'],
    ['DIN 5008', false, 'Das ist die Norm für Schreib- und Gestaltungsregeln (Briefe).'],
  ], LP, 1);
  K('a10', 'aew-last', 'IT-Recruiting: Wie heißt das Dokument, in dem die Anforderungen an das Projekt stehen, und was enthält es?', '**Lastenheft.** Es fasst die **wirtschaftlichen, technischen und organisatorischen Erwartungen** des Auftraggebers zusammen: funktionale und nichtfunktionale Anforderungen (Anforderungsspezifikation).', TB + ' Aufg. 1+2 (Lösung)', 3);
  M('a11', 'aew-last', 'Beko-Lastenheft: „/LF7O/ Das System muss Datenexporte in CSV und Excel ermöglichen." Was ist das?', [
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
    ['Er gehört nicht zum System', false, 'Nein.'],
  ], 'AEW · Muster Use-Case-Diagramm (Pizza)');
  M('a23', 'aew-uc', 'Was bedeutet **«extend»**?', [
    ['Erweitert einen Anwendungsfall nur unter einer Bedingung (condition)', true, 'z. B. Benutzerkonto erstellen {Kunde neu}.'],
    ['Wird immer ausgeführt', false, 'Das ist «include».'],
    ['Verbindet zwei Akteure', false, 'Nein.'],
  ], 'AEW · Muster Use-Case-Diagramm (Pizza)');
  M('a24', 'aew-uc', 'In welche Richtung zeigt der «extend»-Pfeil?', [
    ['Vom erweiternden Fall **zum erweiterten (Basis-)Fall**', true, 'z. B. Benutzerkonto erstellen → Einloggen.'],
    ['Vom Basisfall zum erweiternden Fall', false, 'Umgekehrt.'],
    ['Zum Akteur', false, 'Nein.'],
  ], 'AEW · Use-Case Kundendatenerfassung (Lösung)', 1);
  K('a25', 'aew-uc', 'Was gehört in ein Use-Case-Diagramm?', '**Systemgrenze** (Rechteck) · **Akteure** außerhalb (Strichmännchen) · **Anwendungsfälle** als Ellipsen · Assoziationen (Linien) · **«include»/«extend»**-Beziehungen, Bedingungen als condition-Notiz', 'AEW · Muster Use-Case-Diagramm', 3);
  M('a26', 'aew-uc', 'Darf ein Anwendungsfall mit zwei Akteuren verbunden sein?', [
    ['Ja – z. B. „Kunden benachrichtigen" mit Mitarbeiter und Kunde', true, 'Linien dürfen aber keine Ellipsen schneiden.'],
    ['Nein, immer nur ein Akteur', false, 'UML erlaubt mehrere.'],
  ], 'AEW · Use-Case Kundendatenerfassung (Lösung)', 1);
  K('a27', 'aew-uc', 'IT-Recruiting: Welche Beziehung haben „Benutzerkonto erstellen" und „Einloggen"?', '**«extend»** mit der Bedingung **{Kunde neu}** – nur Neukunden erstellen ein Konto.', 'AEW · Use-Case Kundendatenerfassung (Lösung)', 2);
  K('a28', 'aew-uc', 'Die sechs Schritte von Design Thinking?', 'Verstehen · Beobachten · Sichtweise definieren · Ideen finden · Prototypen entwickeln · Testen', LP, 3);

  const DT = 'AEW · Leseprobe Datentypen und Datenstrukturen';
  M('a40', 'aew-typ', 'Wie viele Byte belegt ein Java-**int**?', [['4 Byte', true, 'Wertebereich ca. ±2,1 Milliarden.'], ['2 Byte', false, 'Das ist short (oder char).'], ['8 Byte', false, 'Das ist long (oder double).'], ['1 Byte', false, 'Das ist byte.']], DT + ' S. 101', 1);
  M('a41', 'aew-typ', 'Welcher Wertebereich gehört zu **byte**?', [['−128 … +127', true, '−2⁷ … 2⁷−1.'], ['0 … 255', false, 'Java-byte ist vorzeichenbehaftet.'], ['−32 768 … +32 767', false, 'Das ist short.']], DT + ' S. 101', 1);
  M('a42', 'aew-typ', 'Wie viele Byte belegt ein **char** in Java und was speichert er?', [['2 Byte, ein Unicode-Zeichen', true, 'Standardwert \\u0000.'], ['1 Byte, ein ASCII-Zeichen', false, 'In Java 2 Byte Unicode.'], ['4 Byte, einen Text', false, 'Text = String.']], DT + ' S. 101', 1);
  K('a43', 'aew-typ', 'Nenne die acht primitiven Datentypen in Java mit Byte-Größe.', 'boolean (undefiniert) · byte (1) · short (2) · int (4) · long (8) · float (4) · double (8) · char (2)', DT + ' S. 101', 4);
  M('a44', 'aew-typ', 'Wie kennzeichnet man einen **long**- bzw. **float**-Wert im Code?', [['long mit L, float mit f (z. B. 3123466000L, 0.234f)', true, 'Genau so im Buch.'], ['long mit l, float mit d', false, 'd wäre double.'], ['Gar nicht nötig', false, 'Ohne f ist 0.234 ein double.']], DT + ' S. 101', 1);
  M('a45', 'aew-typ', 'Wann findet eine **implizite** Typumwandlung statt?', [['Automatisch von einem niederwertigen in einen höherwertigen Typ (z. B. byte → long)', true, 'Kein Informationsverlust.'], ['Automatisch von double nach int', false, 'Das braucht einen Cast (explizit).'], ['Nur mit dem Cast-Operator', false, 'Das ist explizit.']], DT + ' S. 102');
  K('a46', 'aew-typ', 'Was passiert bei `int zahlI = 120; float zahlF = 30.8f; int summe = zahlI + (int) zahlF;`?', 'Expliziter Cast: Die **Nachkommastellen werden abgeschnitten** (30.8 → 30). Ergebnis **150**. Ohne Cast gäbe es den Fehler „possible lossy conversion from float to int".', DT + ' S. 103', 2);
  M('a47', 'aew-typ', '`short s = (short) 32343423;` ergibt −31361. Warum?', [['Der Wert passt nicht in 16 Bit – die oberen Bits werden abgeschnitten', true, 'Expliziter Cast von höher- auf niederwertig kann Werte verfälschen.'], ['Weil short immer negativ ist', false, 'Nein.'], ['Rundungsfehler bei Kommazahlen', false, 'Es sind ganze Zahlen.']], DT + ' S. 103');
  M('a48', 'aew-typ', 'Wofür nutzt man **Wrapper-Klassen** wie Integer?', [['Um primitive Werte als Objekte (Referenzdatentypen) zu verwenden – Autoboxing', true, 'int ↔ Integer automatisch.'], ['Um Texte zu speichern', false, 'Dafür gibt es String.'], ['Für Konstantenlisten', false, 'Dafür gibt es enum.']], DT + ' S. 103–104');
  M('a49', 'aew-typ', 'Welcher Datentyp passt für eine feste Auswahl wie die vier Jahreszeiten?', [['enum (Aufzählungstyp)', true, 'Eigener Datentyp mit festen Werten.'], ['String', false, 'Tippfehler möglich.'], ['int[]', false, 'Nicht aussagekräftig.']], DT + ' S. 104');
  M('a50', 'aew-typ', 'Welcher Java-Typ passt für eine **Postleitzahl** wie „01067"?', [['String – man rechnet nicht damit und die führende 0 bleibt erhalten', true, 'Als int würde aus 01067 → 1067.'], ['int', false, 'Führende 0 geht verloren.'], ['double', false, 'Keine Kommazahl.']], 'AEW · eigene Lösung Personal-/Kundendaten', 2);
  M('a51', 'aew-typ', 'Welcher Typ passt für „Bewerber spricht mehrere Fremdsprachen"?', [['Ein Array, z. B. String[] fremdsprachen', true, 'Mehrere Werte gleichen Typs.'], ['boolean', false, 'Nur ja/nein.'], ['char', false, 'Nur ein Zeichen.']], 'AEW · Entwurfsphase Aufg. 1+2', 1);
  K('a52', 'aew-typ', 'Regeln für Variablennamen in Java?', 'Beginnen mit einem **Kleinbuchstaben** und sollen **aussagekräftig** sein (z. B. anzahlImmobilienbesitzer).', DT + ' S. 101', 1);
  M('a53', 'aew-typ', 'Standardwert (default) eines **boolean**?', [['false', true, 'Und Zahlen 0 bzw. 0.0.'], ['true', false, 'Nein.'], ['null', false, 'null gibt es nur bei Referenztypen.']], DT + ' S. 101', 1);

  const ZS = 'AEW · Aufgabe Verwalten von Daten in IT-Systemen';
  M('a60', 'aew-zahl', 'Welche Eigenschaften haben **Informationen**?', [
    ['Sie sind an einen Träger gebunden', true, 'z. B. Papier, Datei, Schall.'],
    ['Sie verursachen Kosten', true, 'Beschaffung, Speicherung.'],
    ['Sie sind leicht übertragbar', true, ''],
    ['Sie verbrauchen sich', false, 'Informationen nutzen sich nicht ab.'],
    ['Sie können nur digital übertragen werden', false, 'Auch analog (Sprache, Brief).'],
  ], ZS + ' Aufg. 1.1 Nr. 1', 3, { mehrfach: true });
  M('a61', 'aew-zahl', 'Welche Aussagen über **Daten** sind korrekt?', [
    ['Daten sind eine wiederherstellbare Darstellung von Informationen', true, ''],
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
  M('a70', 'aew-zahl', 'Woran erkennt man eine negative Zahl im Zweierkomplement?', [['Das erste (höchste) Bit ist 1', true, 'Vorzeichenbit.'], ['Das letzte Bit ist 1', false, 'Das zeigt nur ungerade Zahlen.'], ['Sie enthält mehr Einsen als Nullen', false, 'Nein.']], ZS + ' Aufg. 5', 1);
  M('a71', 'aew-zahl', 'Welcher Zahlenbereich passt in 8 Bit Zweierkomplement?', [['−128 … +127', true, 'Wie Java-byte.'], ['0 … 255', false, 'Das ist ohne Vorzeichen.'], ['−127 … +128', false, 'Andersrum.']], ZS + ' Aufg. 5', 1);
  M('a72', 'aew-zahl', 'Warum ist „1101 0000 als Buchstabe gemäß ASCII" nicht eindeutig?', [['1101 0000 = 208 liegt außerhalb von ASCII (0–127)', true, 'Die Bedeutung hängt von der Zeichentabelle ab.'], ['Weil ASCII nur Zahlen kennt', false, 'Nein.'], ['Weil es 9 Bit sind', false, 'Es sind 8 Bit.']], ZS + ' Aufg. 1.1 Nr. 6c', 1);

  window.LERNWERK_DATEN = F;
})();
