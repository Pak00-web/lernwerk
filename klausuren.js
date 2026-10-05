/* Lernwerk – Klausur-Vorbereitung
   Eigener Bereich je angekündigter Klausur: eigener Lernplan, eigene Lernseiten, eigene Fragen.
   Die Fragen hier stehen NICHT im allgemeinen Fragenpool (Fächer, Üben, Games) – sie bereiten nur auf diese eine Klausur vor.
   Typen: M = Multiple Choice, E = Eingabe (Stichpunkte mit begriffe/mind oder Zahl mit wert/einheit). Keine Karteikarten. fall:true = Fallaufgabe, zahl:true = Zahlen-Drill, probe:true = nur Probeklausur. */
(function () {
  const L = [];

  /* ======================= WBL-Klausur 1 · 15.10.2026 ======================= */
  const E = [];
  const K = (id, thema, frage, antwort, quelle, punkte = 2, extra = {}) => E.push({ id: 'k1-' + id, thema: 'k1-' + thema, typ: 'K', frage, antwort, quelle, punkte, ...extra });
  const M = (id, thema, frage, optionen, quelle, punkte = 2, extra = {}) => E.push({ id: 'k1-' + id, thema: 'k1-' + thema, typ: 'M', frage, optionen, quelle, punkte, ...extra });
  // Eingabe: Stichpunkte (begriffe + mind) oder Zahl (wert + einheit)
  const EI = (id, thema, frage, begriffe, mind, antwort, quelle, punkte = 3, extra = {}) => E.push({ id: 'k1-' + id, thema: 'k1-' + thema, typ: 'E', frage, begriffe, mind, antwort, quelle, punkte, ...extra });
  const EZ = (id, thema, frage, wert, einheit, antwort, quelle, punkte = 2, extra = {}) => E.push({ id: 'k1-' + id, thema: 'k1-' + thema, typ: 'E', frage, wert, einheit, antwort, quelle, punkte, zahl: true, ...extra });
  const LM = s => 'WBL · Lernmappe Klausur 1, S. ' + s;
  // Stichwortlisten (klein, ohne Umlaute: ä = ae …). Ein Begriff zählt, wenn eines seiner Stichworte in der Antwort vorkommt.
  const S_BET = [['Auszubildender lernt', 'lernt', 'lernen', 'erlernt', 'lernende'], ['Ausbildender = Betrieb / Vertragspartner', 'betrieb', 'vertragspartner', 'unternehmen', 'firma'], ['Ausbilder = Person, die ausbildet', 'person', 'ausbildet', 'betreu', 'verantwortlich', 'mitarbeiter']];
  const S_DUAL = [['zwei Lernorte', 'zwei', ' 2 ', 'beide', 'dual'], ['Betrieb (Praxis)', 'betrieb', 'praxis', 'praktisch'], ['Berufsschule (Theorie)', 'schule', 'theorie', 'theoretisch']];
  const S_IHK = [['Vertrag prüfen', 'vertrag'], ['Eignung von Betrieb/Ausbilder prüfen', 'eignung', 'geeignet', 'ausbildungsstaette'], ['ins Verzeichnis eintragen', 'verzeichnis', 'eintrag', 'registr'], ['Ausbildung überwachen', 'ueberwach', 'kontroll'], ['Prüfungen organisieren', 'pruefungen', 'pruefung organis', 'abschlusspruefung', 'zwischenpruefung'], ['Prüfungsausschüsse einsetzen', 'ausschuss', 'ausschuesse'], ['Verkürzung/Verlängerung', 'verkuerz', 'verlaenger'], ['Anlaufstelle bei Problemen', 'berat', 'anlauf', 'problem', 'hilf']];
  const S_VERTRAG = [['Ausbildungsberuf', 'beruf', 'bezeichnung'], ['Ziel und Gliederung', 'ziel', 'gliederung'], ['Beginn', 'beginn', 'start'], ['Dauer', 'dauer der ausbildung', 'ausbildungsdauer', 'dauer'], ['Maßnahmen außerhalb', 'ausserhalb', 'massnahme', 'extern', 'ueberbetrieb'], ['tägliche Arbeitszeit', 'arbeitszeit'], ['Probezeit', 'probezeit'], ['Vergütung', 'verguetung', 'gehalt', 'lohn', 'geld'], ['Urlaub', 'urlaub'], ['Kündigung', 'kuendig'], ['Tarifverträge', 'tarif', 'betriebsvereinbarung'], ['Ausbildungsnachweis', 'nachweis', 'berichtsheft'], ['Name und Anschrift', 'name', 'anschrift', 'adresse']];
  const S_AZUBI = [['Lernpflicht', 'lern'], ['Sorgfaltspflicht', 'sorgfalt', 'sorgfaeltig'], ['Gehorsamspflicht / Weisungen', 'gehorsam', 'weisung', 'anweisung'], ['Schweigepflicht', 'schweig', 'geheim', 'verschwieg'], ['Berichtsheft führen', 'bericht', 'nachweis'], ['Berufsschule besuchen', 'schul', 'teilnahme', 'teilnehmen'], ['Wettbewerbsverbot', 'wettbewerb', 'konkurrenz']];
  const S_BETRIEB = [['Ausbildungspflicht', 'ausbildungspflicht', 'ausbilden', 'vermitteln', 'beibringen'], ['Vergütungspflicht', 'verguet', 'bezahl', 'lohn', 'geld', 'gehalt'], ['Freistellungspflicht', 'freistell', 'frei stellen', 'freigeben'], ['Ausbildungsmittel kostenlos', 'mittel', 'kostenlos', 'material', 'werkzeug', 'arbeitsmittel'], ['Fürsorge und Schutz', 'fuersorge', 'schutz'], ['Zeugnis', 'zeugnis']];
  const S_PROBE = [['mindestens 1 Monat', '1 monat', 'einen monat', 'ein monat', '1 bis 4', '1 4 monat'], ['höchstens 4 Monate', '4 monat', 'vier monat', 'bis 4'], ['ohne Kündigungsfrist', 'frist', 'jederzeit', 'sofort', 'fristlos'], ['ohne Grund', 'grund', 'grundlos'], ['schriftlich', 'schriftlich']];
  const S_JZEIT = [['8 Std. pro Tag', '8'], ['40 Std. pro Woche', '40'], ['5 Tage pro Woche', '5', 'fuenf'], ['30 Min. Pause ab mehr als 4,5 Std.', '30'], ['60 Min. Pause ab mehr als 6 Std.', '60'], ['12 Std. Freizeit', '12']];
  const S_URLAUB = [['unter 16: 30 Werktage', '30'], ['unter 17: 27 Werktage', '27'], ['unter 18: 25 Werktage', '25']];
  const B160 = 'WBL · Buch S. 157–160 (Unterricht)', KARIN = 'WBL · Arbeitsblatt S. 16–17 Karin (Unterricht)';

  /* ---- 1. Beteiligte ---- */
  EI('b1', 'beteiligte', 'Erkläre den Unterschied zwischen **Auszubildendem**, **Ausbildendem** und **Ausbilder**.', S_BET, 3, '- **Auszubildender:** lernt einen anerkannten Ausbildungsberuf\n- **Ausbildender:** der Ausbildungsbetrieb – Vertragspartner des Azubis, verantwortlich für die ordnungsgemäße Ausbildung\n- **Ausbilder:** die konkrete Person im Betrieb, die ausbildet – fachlich und persönlich geeignet', LM(3), 3);
  M('b2', 'beteiligte', 'Wer ist der **Ausbildende**?', [
    ['Der Ausbildungsbetrieb – der Vertragspartner des Azubis', true, 'Der Ausbildende schließt den Vertrag und trägt die Verantwortung.'],
    ['Die Person, die im Betrieb ausbildet', false, 'Das ist der **Ausbilder**.'],
    ['Die Person, die den Beruf lernt', false, 'Das ist der **Auszubildende**.'],
    ['Die IHK', false, 'Die IHK ist die **zuständige Stelle**.'],
  ], LM(3));
  M('b3', 'beteiligte', 'Wer unterschreibt den Ausbildungsvertrag? (mehrere richtig)', [
    ['Der Auszubildende', true, 'Er ist Vertragspartner.'],
    ['Der Ausbildende (Betrieb)', true, 'Er ist der andere Vertragspartner.'],
    ['Bei Minderjährigen zusätzlich der gesetzliche Vertreter', true, 'Meist die Eltern.'],
    ['Die Berufsschule', false, 'Die Schule ist kein Vertragspartner.'],
  ], LM(3), 3, { mehrfach: true });
  M('b4', 'beteiligte', 'Kann der Chef eines kleinen Betriebs gleichzeitig Ausbilder sein?', [
    ['Ja – in kleinen Betrieben können Ausbildender und Ausbilder dieselbe Person sein', true, 'Er muss dann aber fachlich und persönlich geeignet sein.'],
    ['Nein, das ist verboten', false, 'Es ist erlaubt.'],
    ['Nur mit Erlaubnis der Berufsschule', false, 'Die Berufsschule entscheidet das nicht.'],
  ], LM(3));
  M('b5', 'beteiligte', 'Was muss ein **Ausbilder** mitbringen?', [
    ['Fachliche und persönliche Eignung', true, 'Das prüft auch die IHK.'],
    ['Einen Meistertitel in jedem Fall', false, 'Verlangt ist die Eignung.'],
    ['Mindestens 10 Jahre im Betrieb', false, 'Eine feste Zahl an Jahren gibt es nicht.'],
  ], LM(3));

  /* ---- 2. Duale Ausbildung ---- */
  EI('d1', 'dual', 'Warum heißt die Ausbildung **dual**? Erkläre kurz.', S_DUAL, 3, 'Sie findet an **zwei Lernorten** statt: im **Ausbildungsbetrieb** (Praxis) und in der **Berufsschule** (Theorie).', LM(4), 2);
  EI('d2', 'dual', 'Welche Aufgaben haben **Betrieb** und **Berufsschule**? Nenne je eine.', [['Betrieb: Praxis', 'praxis', 'praktisch', 'fertigkeit'], ['Schule: Theorie', 'theorie', 'theoretisch'], ['Lern- und Arbeitstechniken', 'technik'], ['Allgemeinbildung', 'allgemein']], 2, '- **Betrieb:** praktische Ausbildung – fachpraktische Kenntnisse, Fertigkeiten und Fähigkeiten; setzt die Ausbildungsordnung mit dem betrieblichen Ausbildungsplan um\n- **Berufsschule:** fachtheoretische Grundlagen, Lern- und Arbeitstechniken, berufsbezogene Allgemeinbildung', LM(4), 3);
  M('d3', 'dual', 'Wofür gibt es **überbetriebliche Ausbildungsstätten**?', [
    ['Sie vermitteln Inhalte, die der Betrieb selbst nicht vermitteln kann', true, 'Sie ergänzen die Ausbildung im Betrieb.'],
    ['Sie ersetzen die Berufsschule', false, 'Sie ergänzen den Betrieb, nicht die Schule.'],
    ['Sie nehmen die Abschlussprüfung ab', false, 'Das macht der Prüfungsausschuss der IHK.'],
  ], LM(4));
  M('d4', 'dual', 'Was vermittelt die **Berufsschule**? (mehrere richtig)', [
    ['Fachtheoretische Grundlagen', true, 'Die Theorie zum Beruf.'],
    ['Lern- und Arbeitstechniken', true, 'Steht so in der Lernmappe.'],
    ['Berufsbezogene Allgemeinbildung', true, 'Z. B. WBL, Deutsch.'],
    ['Den betrieblichen Ausbildungsplan', false, 'Den setzt der **Betrieb** um.'],
  ], LM(4), 3, { mehrfach: true });
  M('d5', 'dual', 'Was macht der **betriebliche Ausbildungsplan**?', [
    ['Er setzt die Vorgaben der Ausbildungsordnung im konkreten Betrieb um', true, 'Er darf mehr enthalten, aber nicht weniger.'],
    ['Er legt die Noten der Berufsschule fest', false, 'Hat mit der Schule nichts zu tun.'],
    ['Er ersetzt den Ausbildungsvertrag', false, 'Er ist ein Teil davon, kein Ersatz.'],
  ], LM(4));

  /* ---- 3. IHK ---- */
  EI('i1', 'ihk', 'Nenne **fünf Aufgaben der IHK** als zuständige Stelle.', S_IHK, 5, '- prüft den **Ausbildungsvertrag**\n- prüft die Eignung der **Ausbildungsstätte** und des **Ausbilders**\n- trägt das Ausbildungsverhältnis ins **Verzeichnis** ein\n- **überwacht** die Ausbildung\n- organisiert **Prüfungen**, setzt **Prüfungsausschüsse** ein\n- entscheidet über **Verkürzung/Verlängerung**\n- **Anlaufstelle** bei Problemen', LM(5), 5);
  M('i2', 'ihk', 'Was gehört zu den Aufgaben der IHK? (mehrere richtig)', [
    ['Prüft, ob der Ausbildungsvertrag den Vorgaben entspricht', true, 'Richtig.'],
    ['Überwacht die Ausbildung', true, 'Richtig.'],
    ['Organisiert Prüfungen und setzt Prüfungsausschüsse ein', true, 'Richtig.'],
    ['Zahlt die Ausbildungsvergütung', false, 'Das ist die Pflicht des **Ausbildenden**.'],
    ['Unterrichtet die Theorie', false, 'Das macht die **Berufsschule**.'],
  ], LM(5), 3, { mehrfach: true });
  M('i3', 'ihk', 'Wer entscheidet über eine **Verkürzung oder Verlängerung** der Ausbildungszeit?', [
    ['Die IHK (zuständige Stelle)', true, 'Steht in den IHK-Aufgaben.'],
    ['Der Ausbilder allein', false, 'Er kann es beantragen, entscheiden tut die IHK.'],
    ['Die Berufsschule', false, 'Nein.'],
  ], LM(5));
  M('i4', 'ihk', 'Welcher Merksatz fasst die Aufgaben der IHK zusammen?', [
    ['Die IHK prüft, registriert, überwacht, berät und organisiert Prüfungen', true, 'Merksatz aus der Lernmappe.'],
    ['Die IHK unterrichtet, benotet und zahlt die Vergütung', false, 'Unterricht = Berufsschule, Vergütung = Betrieb.'],
    ['Die IHK stellt Azubis ein und kündigt sie', false, 'Das macht der Ausbildende.'],
  ], LM(5));
  M('i5', 'ihk', 'Ein Azubi hat ernste Probleme mit seinem Betrieb. Wer ist eine wichtige **Anlaufstelle**?', [
    ['Die IHK', true, 'Sie ist bei Problemen in der Ausbildung eine wichtige Anlaufstelle.'],
    ['Das Finanzamt', false, 'Hat mit der Ausbildung nichts zu tun.'],
    ['Die Krankenkasse', false, 'Nicht zuständig.'],
  ], LM(5));

  /* ---- 4. Ausbildungsvertrag ---- */
  EI('v1', 'vertrag', 'Nenne **mindestens acht** wesentliche Inhalte des Berufsausbildungsvertrags.', S_VERTRAG, 8, '- Name und Anschrift des Azubis (und des Ausbildenden)\n- Bezeichnung des Ausbildungsberufs\n- Art, Ziel, sachliche und zeitliche Gliederung\n- Beginn und Dauer\n- Ausbildungsmaßnahmen außerhalb des Betriebs\n- regelmäßige tägliche Arbeitszeit\n- Dauer der **Probezeit**\n- Höhe und Zahlungstermin der **Vergütung**\n- **Urlaub**\n- Kündigungsvoraussetzungen\n- Hinweis auf Tarifverträge/Betriebsvereinbarungen\n- Form des Ausbildungsnachweises', LM(6), 5);
  M('v2', 'vertrag', 'Was muss im Ausbildungsvertrag stehen? (mehrere richtig)', [
    ['Dauer der Probezeit', true, 'Pflichtangabe.'],
    ['Höhe und Zahlungstermin der Vergütung', true, 'Pflichtangabe.'],
    ['Dauer des Urlaubs', true, 'Pflichtangabe.'],
    ['Voraussetzungen für eine Kündigung', true, 'Pflichtangabe.'],
    ['Die Noten aus der Berufsschule', false, 'Die gibt es vor Beginn noch gar nicht.'],
    ['Das Gehalt nach der Ausbildung', false, 'Gehört nicht in den Ausbildungsvertrag.'],
  ], LM(6), 3, { mehrfach: true });
  M('v3', 'vertrag', 'Wann müssen die wesentlichen Ausbildungsbedingungen festgehalten werden?', [
    ['Vor Beginn der Ausbildung', true, 'Steht so in der Lernmappe.'],
    ['Nach der Probezeit', false, 'Zu spät – vor Beginn.'],
    ['Erst zur Zwischenprüfung', false, 'Nein, vor Beginn.'],
  ], LM(6));
  M('v4', 'vertrag', 'Was ist mit „Form des **Ausbildungsnachweises**“ im Vertrag gemeint?', [
    ['Wie das Berichtsheft geführt wird (z. B. schriftlich oder elektronisch)', true, 'Der Ausbildungsnachweis ist das Berichtsheft.'],
    ['Wie das Abschlusszeugnis aussieht', false, 'Gemeint ist das Berichtsheft.'],
    ['Welche Kleidung der Azubi trägt', false, 'Nein.'],
  ], LM(6));
  M('v5', 'vertrag', 'Die Aufgabe lautet „Nennen Sie sechs Punkte“. Was ist die beste Strategie?', [
    ['Die sechs Punkte aufschreiben, bei denen ich am sichersten bin', true, 'Prüfungsstrategie aus der Lernmappe.'],
    ['Möglichst alle zwölf aufschreiben', false, 'Kostet Zeit – falsche Punkte können zählen.'],
    ['Nur drei sichere Punkte nennen', false, 'Dann fehlen Punkte.'],
  ], LM(6));

  /* ---- 5. Rechte und Pflichten ---- */
  EI('p1', 'pflichten', 'Nenne **fünf Pflichten des Auszubildenden**.', S_AZUBI, 5, '- **Lernpflicht**\n- **Sorgfaltspflicht** (Arbeitsmittel sorgfältig behandeln)\n- **Gehorsamspflicht** (berechtigte Weisungen befolgen)\n- **Schweigepflicht** (Betriebsgeheimnisse)\n- **Ausbildungsnachweis** (Berichtsheft) führen\n- Teilnahme an **Berufsschule** und Ausbildungsmaßnahmen\n- aus dem Unterricht: **Wettbewerbsverbot**', LM(7), 5);
  EI('p2', 'pflichten', 'Nenne **vier Pflichten des Ausbildenden** (Betrieb).', S_BETRIEB, 4, '- **Ausbildungspflicht** (Kenntnisse, Fertigkeiten, Fähigkeiten vermitteln)\n- **Vergütungspflicht**\n- **Freistellungspflicht** (Berufsschule, Prüfungen)\n- **Ausbildungsmittel kostenlos** bereitstellen\n- **Fürsorge und Schutz**\n- aus dem Unterricht: **Zeugnispflicht**', LM(7), 4);
  M('p3', 'pflichten', 'Welche Paare gehören zusammen? (Pflicht des Azubis ↔ Pflicht des Betriebs)', [
    ['Lernpflicht ↔ Ausbildungspflicht', true, 'Merke als Paar.'],
    ['Berufsschulbesuch ↔ Freistellung', true, 'Merke als Paar.'],
    ['Sorgfältiger Umgang ↔ Ausbildungsmittel bereitstellen', true, 'Merke als Paar.'],
    ['Schweigepflicht ↔ Vergütungspflicht', false, 'Diese beiden haben nichts miteinander zu tun.'],
  ], LM(7), 3, { mehrfach: true });
  M('p4', 'pflichten', 'Welche Pflichten kennst du **zusätzlich aus dem Unterricht** (Buch)? (mehrere richtig)', [
    ['Wettbewerbsverbot (Azubi)', true, 'Dem Betrieb keine Konkurrenz machen, z. B. Schwarzarbeit.'],
    ['Zeugnispflicht (Betrieb)', true, 'Am Ende der Ausbildung gibt es ein Zeugnis.'],
    ['Fürsorgepflicht (Betrieb)', true, 'Nur ausbildungsdienliche, angemessene Arbeiten.'],
    ['Überstundenpflicht (Azubi)', false, 'Gibt es nicht.'],
  ], B160 + ' Aufg. 3/4', 3, { mehrfach: true });
  M('p5', 'pflichten', 'Ein Azubi kopiert sein Berichtsheft komplett von jemand anderem. Was stimmt?', [
    ['Er verletzt seine Pflicht, den Ausbildungsnachweis ordnungsgemäß zu führen', true, 'Fall 6 der Lernmappe.'],
    ['Erlaubt, solange der Inhalt stimmt', false, 'Er muss es selbst ordnungsgemäß führen.'],
    ['Das ist eine Pflicht des Betriebs', false, 'Führen muss es der Azubi.'],
  ], LM(12) + ' Fall 6', 2, { fall: true });
  M('p6', 'pflichten', 'Der Betrieb lässt den Azubi dauerhaft nur Arbeiten machen, die nicht zum Beruf gehören. Was stimmt?', [
    ['Unzulässig – die Ausbildung muss die vorgesehenen beruflichen Inhalte vermitteln', true, 'Ausbildungspflicht verletzt (Fall 7).'],
    ['Zulässig, der Azubi muss Weisungen befolgen', false, 'Nur **berechtigte** Weisungen.'],
    ['Zulässig, wenn die Vergütung stimmt', false, 'Geld ändert nichts an der Ausbildungspflicht.'],
  ], LM(12) + ' Fall 7', 2, { fall: true });
  M('p7', 'pflichten', 'Eine Azubi erzählt Freunden Interna und Kundendaten aus dem Betrieb. Welche Pflicht verletzt sie?', [
    ['Schweigepflicht', true, 'Betriebsgeheimnisse und schützenswerte Daten nicht weitergeben.'],
    ['Lernpflicht', false, 'Geht ums Lernen.'],
    ['Sorgfaltspflicht', false, 'Geht um Arbeitsmittel.'],
  ], LM(7), 2, { fall: true });
  M('p8', 'pflichten', 'Der Azubi soll sich seinen Laptop für die Ausbildung selbst kaufen. Was stimmt?', [
    ['Unzulässig – Ausbildungsmittel stellt der Betrieb kostenlos', true, 'Pflicht des Ausbildenden.'],
    ['Zulässig, IT-Azubis bringen eigene Geräte mit', false, 'Nein, kostenlos durch den Betrieb.'],
    ['Zulässig, wenn er volljährig ist', false, 'Das Alter spielt keine Rolle.'],
  ], LM(7), 2, { fall: true });
  M('p9', 'pflichten', 'Der Ausbilder gibt eine berechtigte Anweisung, der Azubi weigert sich. Welche Pflicht verletzt er?', [
    ['Gehorsamspflicht', true, 'Berechtigte Weisungen müssen befolgt werden.'],
    ['Freistellungspflicht', false, 'Das ist eine Pflicht des Betriebs.'],
    ['Schweigepflicht', false, 'Passt nicht.'],
  ], LM(7), 2, { fall: true });
  M('p10', 'pflichten', 'Ein Azubi repariert nach Feierabend privat gegen Geld Kundengeräte seines Betriebs. Was stimmt?', [
    ['Verstoß gegen das Wettbewerbsverbot', true, 'Er macht dem Betrieb Konkurrenz (Schwarzarbeit).'],
    ['Erlaubt, es ist ja Freizeit', false, 'Trotzdem Konkurrenz.'],
    ['Verstoß gegen die Zeugnispflicht', false, 'Die betrifft den Betrieb.'],
  ], B160 + ' Aufg. 5e', 2, { fall: true });

  /* ---- 6. Probezeit ---- */
  EI('z1', 'probezeit', 'Erkläre die Regeln zur **Probezeit** (Dauer und Kündigung).', S_PROBE, 4, '- mindestens **1 Monat**, höchstens **4 Monate**\n- beide Seiten können **jederzeit** kündigen\n- **ohne Kündigungsfrist** und **ohne Grund**\n- Kündigung immer **schriftlich**', LM(8), 4);
  M('z2', 'probezeit', 'Wie lange dauert die Probezeit?', [
    ['Mindestens 1, höchstens 4 Monate', true, 'Zahlenanker: 1 bis 4 Monate.'],
    ['Genau 6 Monate', false, 'Das ist die Probezeit bei vielen Arbeitsverträgen, nicht in der Ausbildung.'],
    ['1 bis 3 Monate', false, 'Höchstens 4 Monate.'],
    ['Höchstens 2 Wochen', false, 'Viel zu kurz.'],
  ], LM(8), 2, { zahl: true });
  M('z3', 'probezeit', 'Im **2. Monat** kündigt der Betrieb schriftlich, **ohne Grund**. Wirksam?', [
    ['Ja – in der Probezeit braucht man keinen Grund', true, 'Fall 4 der Lernmappe.'],
    ['Nein – es muss immer ein Grund genannt werden', false, 'Erst nach der Probezeit.'],
    ['Nein – es gilt eine Frist von 4 Wochen', false, 'In der Probezeit ohne Frist.'],
  ], LM(12) + ' Fall 4', 2, { fall: true });
  M('z4', 'probezeit', 'Wer darf in der Probezeit kündigen?', [
    ['Beide – Azubi und Betrieb', true, 'Jederzeit, ohne Frist, ohne Grund.'],
    ['Nur der Betrieb', false, 'Auch der Azubi.'],
    ['Nur der Azubi', false, 'Auch der Betrieb.'],
  ], LM(8));
  M('z5', 'probezeit', 'Der Chef kündigt in der Probezeit **mündlich**. Wirksam?', [
    ['Nein – die Kündigung muss schriftlich sein', true, 'Fall Enno aus dem Buch.'],
    ['Ja – in der Probezeit reicht mündlich', false, 'Auch in der Probezeit schriftlich.'],
    ['Ja, wenn ein Zeuge dabei war', false, 'Schriftform ist Pflicht.'],
  ], B160 + ' Aufg. 7c', 2, { fall: true });
  M('z6', 'probezeit', 'Wozu dient die Probezeit?', [
    ['Beide prüfen, ob Ausbildung, Beruf und Zusammenarbeit passen', true, 'Der Betrieb prüft die Eignung, der Azubi, ob Beruf und Betrieb zu ihm passen.'],
    ['Der Azubi arbeitet ohne Vergütung zur Probe', false, 'Auch in der Probezeit gibt es Vergütung.'],
    ['Die IHK testet den Azubi', false, 'Die IHK ist daran nicht beteiligt.'],
  ], LM(8));

  /* ---- 7. Kündigung nach der Probezeit ---- */
  EI('n1', 'kuendigung', 'Erkläre den Unterschied zwischen Kündigung **während** und **nach** der Probezeit.', [['Probezeit: jederzeit ohne Grund', 'jederzeit', 'ohne grund', 'grundlos', 'ohne frist'], ['danach nur aus wichtigem Grund', 'wichtig'], ['fristlos', 'fristlos'], ['Azubi: 4 Wochen bei Aufgabe/Berufswechsel', '4 wochen', 'vier wochen'], ['schriftlich mit Gründen', 'schriftlich', 'begruend', 'gruende']], 3, '- **Probezeit:** beide jederzeit, ohne Frist, ohne Grund, schriftlich\n- **Danach – Betrieb:** nur **fristlos aus wichtigem Grund**, schriftlich **mit Gründen**\n- **Danach – Azubi:** fristlos aus wichtigem Grund oder mit **4 Wochen Frist**, wenn er die Ausbildung aufgibt oder einen anderen Beruf lernen will', LM(9), 4);
  M('n2', 'kuendigung', 'Wie kann der **Betrieb** nach der Probezeit kündigen?', [
    ['Nur fristlos aus wichtigem Grund – schriftlich mit Angabe der Gründe', true, 'Eine normale Kündigung gibt es für den Betrieb nicht.'],
    ['Mit 4 Wochen Frist ohne Grund', false, 'Die 4 Wochen gelten nur für den Azubi.'],
    ['Jederzeit ohne Grund', false, 'Das gilt nur in der Probezeit.'],
  ], LM(9));
  M('n3', 'kuendigung', 'Ein Azubi will nach der Probezeit einen **ganz anderen Beruf** lernen. Welche Frist gilt?', [
    ['4 Wochen', true, 'Gilt bei Aufgabe der Ausbildung oder Wechsel in einen anderen Beruf.'],
    ['Keine – er kann sofort gehen', false, 'Fristlos nur aus wichtigem Grund.'],
    ['3 Monate', false, 'Es sind 4 Wochen.'],
  ], LM(9), 2, { zahl: true });
  M('n4', 'kuendigung', 'Der Betrieb kündigt nach **5 Monaten** ohne Begründung. Was fällt auf?', [
    ['Die Probezeit (max. 4 Monate) ist vorbei – ohne wichtigen Grund und ohne Begründung ist die Kündigung unwirksam', true, 'Mini-Fall aus der Lernmappe.'],
    ['Alles in Ordnung, in den ersten 6 Monaten geht das', false, 'Die Probezeit dauert höchstens 4 Monate.'],
    ['Wirksam, wenn der Betrieb 4 Wochen Frist einhält', false, 'Die 4-Wochen-Regel gilt nur für den Azubi.'],
  ], LM(9), 3, { fall: true });
  M('n5', 'kuendigung', 'Was ist ein **Aufhebungsvertrag**?', [
    ['Beide Seiten einigen sich gemeinsam, die Ausbildung zu beenden – keine Kündigung', true, 'Steht so in der Lernmappe.'],
    ['Eine fristlose Kündigung durch den Betrieb', false, 'Er ist gerade keine Kündigung.'],
    ['Eine Verlängerung der Probezeit', false, 'Nein.'],
  ], LM(9));
  M('n6', 'kuendigung', 'Ina will nach der Probezeit fristlos zu einem anderen Betrieb wechseln – **gleicher Beruf**. Wirksam?', [
    ['Nein – dafür gibt es keinen wichtigen Grund; möglich ist nur ein Aufhebungsvertrag', true, 'Die 4-Wochen-Regel gilt nur bei Aufgabe oder Berufswechsel.'],
    ['Ja, mit 4 Wochen Frist', false, 'Gleicher Beruf ist kein Berufswechsel.'],
    ['Ja, Azubis dürfen immer fristlos gehen', false, 'Nur aus wichtigem Grund.'],
  ], B160 + ' Aufg. 7a', 3, { fall: true });
  M('n7', 'kuendigung', 'Anna beleidigt ihren Ausbilder als „fauler Sack“. Der Betrieb kündigt fristlos. Wirksam?', [
    ['Ja – eine Beleidigung ist ein wichtiger Grund', true, 'Fall 7b aus dem Buch.'],
    ['Nein – nach der Probezeit darf der Betrieb nie kündigen', false, 'Aus wichtigem Grund schon.'],
    ['Nein – er muss 4 Wochen Frist einhalten', false, 'Bei wichtigem Grund fristlos.'],
  ], B160 + ' Aufg. 7b', 2, { fall: true });

  /* ---- 8. Jugendarbeitsschutz: Arbeitszeit, Pausen, Ruhe ---- */
  EI('j1', 'jarbschg', 'Nenne die wichtigsten **Arbeitszeit- und Pausenregeln** für Jugendliche – mit Zahlen.', S_JZEIT, 5, '- höchstens **8 Std./Tag**, **40 Std./Woche**, **5 Tage**\n- Pause **30 Min.** bei mehr als 4,5 bis 6 Std.\n- Pause **60 Min.** bei mehr als 6 Std.\n- Pause zählt erst ab **15 Min.** am Stück\n- höchstens **4,5 Std.** ohne Pause\n- **12 Std.** Freizeit zwischen zwei Arbeitstagen\n- Arbeit nur zwischen **6 und 20 Uhr**', LM(10), 5);
  M('j2', 'jarbschg', 'Wie lange dürfen Jugendliche grundsätzlich arbeiten?', [
    ['8 Std. am Tag, 40 Std. pro Woche, 5 Tage', true, 'Zahlen-Merksatz 8 – 40 – 5.'],
    ['10 Std. am Tag, 48 Std. pro Woche', false, 'Zu viel für Jugendliche.'],
    ['8 Std. am Tag, 6 Tage pro Woche', false, 'Nur 5 Tage.'],
  ], LM(10), 2, { zahl: true });
  M('j3', 'jarbschg', 'Kevin (17) arbeitet am Freitag **5,5 Stunden ohne Pause**. Zulässig?', [
    ['Nein – bei mehr als 4,5 bis 6 Std. sind mindestens 30 Min. Pause vorgeschrieben', true, 'Fall 1 der Lernmappe.'],
    ['Ja – Pausen gibt es erst ab 6 Stunden', false, 'Schon ab mehr als 4,5 Std.'],
    ['Ja, freitags gelten keine Pausenregeln', false, 'Gibt es nicht.'],
  ], LM(12) + ' Fall 1', 2, { fall: true });
  M('j4', 'jarbschg', 'Eine 17-Jährige arbeitet **8 Stunden** und bekommt **30 Min.** Pause. Reicht das?', [
    ['Nein – bei mehr als 6 Std. sind 60 Min. Pause nötig', true, 'Fall 2 der Lernmappe.'],
    ['Ja – 30 Min. reichen immer', false, '30 Min. nur bis 6 Std.'],
    ['Ja, wenn sie früher gehen darf', false, 'Die Pause ist Pflicht (vgl. Karin).'],
  ], LM(12) + ' Fall 2', 2, { fall: true });
  M('j5', 'jarbschg', 'Wie lang muss eine Unterbrechung mindestens sein, damit sie als **Ruhepause** zählt?', [
    ['15 Minuten', true, 'Kürzere Unterbrechungen zählen nicht.'],
    ['5 Minuten', false, 'Zu kurz.'],
    ['30 Minuten', false, 'Pausen dürfen in 15-Minuten-Blöcke geteilt werden.'],
  ], LM(10), 2, { zahl: true });
  M('j6', 'jarbschg', 'Wie lange dürfen Jugendliche höchstens **am Stück ohne Pause** arbeiten?', [
    ['4,5 Stunden', true, 'Danach muss eine Ruhepause kommen.'],
    ['6 Stunden', false, 'Zu lang.'],
    ['3 Stunden', false, 'Die Grenze liegt bei 4,5 Std.'],
  ], LM(10), 2, { zahl: true });
  M('j7', 'jarbschg', 'Ein 16-jähriger Azubi hat zwischen zwei Arbeitstagen nur **10 Stunden** frei. Zulässig?', [
    ['Nein – mindestens 12 Stunden Freizeit', true, 'Fall 8 der Lernmappe.'],
    ['Ja – 10 Stunden reichen', false, 'Für Jugendliche gelten 12 Std.'],
    ['Ja – 11 Stunden wären nötig, 10 sind knapp ok', false, '11 Std. gelten für Erwachsene (ArbZG), Jugendliche 12 Std.'],
  ], LM(12) + ' Fall 8', 2, { fall: true });
  M('j8', 'jarbschg', 'Zu welchen Uhrzeiten dürfen Jugendliche grundsätzlich arbeiten?', [
    ['Zwischen 6 und 20 Uhr', true, 'Ausnahmen gibt es nur für bestimmte Bereiche.'],
    ['Zwischen 8 und 18 Uhr', false, 'Der Rahmen ist 6 bis 20 Uhr.'],
    ['Rund um die Uhr, wenn der Chef zustimmt', false, 'Nein.'],
  ], LM(10), 2, { zahl: true });
  M('j9', 'jarbschg', 'Ein 17-jähriger Azubi arbeitet von **8 bis 16 Uhr** und bekommt nur **30 Min.** Pause. Beurteile.', [
    ['Nicht ausreichend – bei mehr als 6 Std. Arbeit sind 60 Min. Pause vorgeschrieben', true, 'Aufgabe 10 der Probeklausur.'],
    ['In Ordnung – 30 Min. sind genug', false, 'Mehr als 6 Std. → 60 Min.'],
    ['In Ordnung, weil er schon 17 ist', false, 'Das JArbSchG gilt bis unter 18.'],
  ], LM(14) + ' Aufg. 10', 3, { fall: true });
  M('j10', 'jarbschg', 'Karin (16) ist von 7 bis 20 Uhr im Betrieb, mit Pause von 12 bis 17 Uhr. Zulässig?', [
    ['Nein – die Schichtzeit (Arbeit + Pausen) beträgt 13 Std., erlaubt sind höchstens 10', true, 'Aus dem Unterricht (Karin Aufg. 4).'],
    ['Ja – sie arbeitet ja nur 8 Stunden', false, 'Die Schichtzeit ist das Problem.'],
    ['Ja – 7 bis 20 Uhr liegt im erlaubten Rahmen', false, 'Uhrzeit ok, Schichtzeit nicht.'],
  ], KARIN + ' Aufg. 4', 3, { fall: true });
  M('j11', 'jarbschg', 'Wofür steht die **12** im Zahlen-Merksatz 8 – 40 – 5 – 12?', [
    ['12 Stunden Freizeit zwischen zwei Arbeitstagen', true, '8 Std./Tag · 40 Std./Woche · 5 Tage · 12 Std. Freizeit.'],
    ['12 Werktage Urlaub', false, 'Urlaub: 30 / 27 / 25 Werktage.'],
    ['12 Minuten Pause', false, 'Pausen: 30 bzw. 60 Minuten.'],
    ['Höchstens 12 Stunden Schichtzeit', false, 'Schichtzeit höchstens 10 Std.'],
  ], LM(10), 2, { zahl: true });

  /* ---- 9. Jugendarbeitsschutz: Urlaub, Schule, Schutz ---- */
  EI('u1', 'urlaub', 'Welche **Urlaubsansprüche** haben Jugendliche unter 16, unter 17 und unter 18 Jahren? (Werktage)', S_URLAUB, 3, 'Stichtag: **Alter zu Beginn des Kalenderjahres**\n- unter 16 → **30 Werktage**\n- unter 17 → **27 Werktage**\n- unter 18 → **25 Werktage**', LM(11), 3, { zahl: true });
  M('u2', 'urlaub', 'Ein Azubi ist am **1. Januar 16 Jahre** alt. Wie viel Urlaub bekommt er mindestens?', [
    ['27 Werktage', true, 'Er ist noch nicht 17 → 27 Werktage.'],
    ['30 Werktage', false, '30 gelten nur, wenn er noch nicht 16 ist.'],
    ['25 Werktage', false, '25 gelten, wenn er noch nicht 18 ist.'],
  ], LM(11), 2, { zahl: true, fall: true });
  M('u3', 'urlaub', 'Titus ist 17 und bekommt **24 Werktage** Urlaub. Was stimmt?', [
    ['Verstoß – ihm stehen mindestens 25 Werktage zu', true, 'Unter 18 → 25 Werktage.'],
    ['In Ordnung', false, '24 ist zu wenig.'],
    ['Ihm stehen 30 Werktage zu', false, '30 gelten nur unter 16.'],
  ], B160 + ' Aufg. 5b', 2, { fall: true });
  M('u4', 'urlaub', 'Ein Azubi soll für seine **Prüfung** einen Urlaubstag nehmen. Was stimmt?', [
    ['Falsch – für Prüfungen muss er freigestellt werden', true, 'Fall 3 der Lernmappe (Freistellungspflicht).'],
    ['Richtig, Prüfungen sind Privatsache', false, 'Nein, Freistellung ist Pflicht.'],
    ['Richtig, wenn die Prüfung nachmittags ist', false, 'Die Uhrzeit ändert nichts.'],
  ], LM(12) + ' Fall 3', 2, { fall: true });
  M('u5', 'urlaub', 'Darf ein Jugendlicher im **Akkord** arbeiten?', [
    ['Grundsätzlich nein – Akkordarbeit ist für Jugendliche verboten', true, 'In den Materialien werden nur Ausnahmen zu Ausbildungszwecken erwähnt.'],
    ['Ja, wenn er schneller arbeiten will', false, 'Grundsätzlich verboten.'],
    ['Ja, ab 16 Jahren', false, 'Gilt für alle unter 18.'],
  ], LM(11));
  M('u6', 'urlaub', 'Nach **4 Unterrichtsstunden** fällt der Rest aus. Muss Karin (16) noch in den Betrieb?', [
    ['Ja – erst ein Schultag mit mehr als 5 Unterrichtsstunden (1× pro Woche) ersetzt den Arbeitstag', true, 'Aus dem Unterricht (Karin Aufg. 3).'],
    ['Nein – jeder Schultag ist komplett frei', false, 'Nur bei mehr als 5 Unterrichtsstunden.'],
    ['Nur, wenn der Chef anruft', false, 'Sie muss zurück.'],
  ], KARIN + ' Aufg. 3', 3, { fall: true });
  M('u7', 'urlaub', 'Für wen gilt das **Jugendarbeitsschutzgesetz**?', [
    ['Für Beschäftigte unter 18 Jahren', true, 'Deshalb in Fallaufgaben zuerst auf das Alter achten.'],
    ['Für alle Azubis, egal wie alt', false, 'Nur unter 18.'],
    ['Nur für Schüler im Praktikum', false, 'Für alle Beschäftigten unter 18.'],
  ], LM(10));
  M('u8', 'urlaub', 'Welche ärztliche Untersuchung schreibt das JArbSchG **vor Beginn** vor?', [
    ['Die Erstuntersuchung – ohne sie darf der Jugendliche nicht beschäftigt werden', true, 'Höchstens 14 Monate vor Beginn; im ersten Jahr folgt eine Nachuntersuchung.'],
    ['Keine – nur bei gefährlichen Berufen', false, 'Die Erstuntersuchung gilt für alle Jugendlichen.'],
    ['Ein Sehtest beim Optiker', false, 'Gemeint ist die ärztliche Erstuntersuchung.'],
  ], KARIN + ' Aufg. 7');
  M('u9', 'urlaub', 'Karin (16) soll am Berufsschultag freiwillig für 20 € im Betrieb arbeiten. Zulässig?', [
    ['Nein – Freistellung für die Berufsschule, auch freiwillig nicht', true, 'Aus dem Unterricht (Karin Aufg. 5).'],
    ['Ja, wenn sie freiwillig zustimmt', false, 'Auch freiwillig nicht.'],
    ['Ja, wenn sie dafür bezahlt wird', false, 'Geld ändert nichts.'],
  ], KARIN + ' Aufg. 5', 2, { fall: true });
  M('u10', 'urlaub', 'Worauf achtest du bei einer Fallaufgabe zum Arbeitsschutz **zuerst**?', [
    ['Auf das Alter – unter 18 gelten die strengeren Regeln des JArbSchG', true, 'Tipp aus der Lernmappe.'],
    ['Auf den Ausbildungsberuf', false, 'Zuerst das Alter.'],
    ['Auf die Höhe der Vergütung', false, 'Spielt für den Arbeitsschutz keine Rolle.'],
  ], LM(11));

  /* ---- Zahlen eintippen ---- */
  EZ('e1', 'probezeit', 'Wie viele **Monate** darf die Probezeit **höchstens** dauern?', 4, 'Monate', 'Höchstens **4 Monate** (mindestens 1 Monat).', LM(8));
  EZ('e2', 'probezeit', 'Wie viele **Monate** muss die Probezeit **mindestens** dauern?', 1, 'Monat', 'Mindestens **1 Monat** (höchstens 4 Monate).', LM(8));
  EZ('e3', 'kuendigung', 'Ein Azubi will nach der Probezeit einen anderen Beruf lernen. Wie viele **Wochen** Kündigungsfrist gelten?', 4, 'Wochen', '**4 Wochen** – bei Aufgabe der Ausbildung oder Wechsel in einen anderen Beruf.', LM(9));
  EZ('e4', 'jarbschg', 'Wie viele **Stunden** dürfen Jugendliche grundsätzlich **pro Tag** arbeiten?', 8, 'Stunden', 'Höchstens **8 Stunden** pro Tag.', LM(10));
  EZ('e5', 'jarbschg', 'Wie viele **Stunden** dürfen Jugendliche grundsätzlich **pro Woche** arbeiten?', 40, 'Stunden', 'Höchstens **40 Stunden** pro Woche, an 5 Tagen.', LM(10));
  EZ('e6', 'jarbschg', 'Ein Jugendlicher arbeitet **7 Stunden**. Wie viele **Minuten** Pause stehen ihm mindestens zu?', 60, 'Minuten', 'Mehr als 6 Std. Arbeit → **60 Minuten** Pause.', LM(10), 2, { fall: true });
  EZ('e7', 'jarbschg', 'Kevin (17) arbeitet **5,5 Stunden**. Wie viele **Minuten** Pause muss er mindestens bekommen?', 30, 'Minuten', 'Mehr als 4,5 bis 6 Std. → **30 Minuten** Pause.', LM(12) + ' Fall 1', 2, { fall: true });
  EZ('e8', 'jarbschg', 'Wie viele **Stunden** Freizeit müssen Jugendliche zwischen zwei Arbeitstagen mindestens haben?', 12, 'Stunden', 'Mindestens **12 Stunden**.', LM(10));
  EZ('e9', 'jarbschg', 'Wie viele **Minuten** muss eine Unterbrechung mindestens dauern, damit sie als Ruhepause zählt?', 15, 'Minuten', 'Mindestens **15 Minuten** am Stück.', LM(10));
  EZ('e10', 'jarbschg', 'Wie viele **Stunden** dürfen Jugendliche höchstens **am Stück ohne Pause** arbeiten?', 4.5, 'Stunden', 'Höchstens **4,5 Stunden**.', LM(10));
  EZ('e11', 'jarbschg', 'Bis wie viel **Uhr** dürfen Jugendliche grundsätzlich höchstens arbeiten?', 20, 'Uhr', 'Grundsätzlich nur zwischen **6 und 20 Uhr**.', LM(10));
  EZ('e12', 'jarbschg', 'Wie viele **Stunden** darf die Schichtzeit (Arbeit + Pausen) eines Jugendlichen höchstens betragen?', 10, 'Stunden', 'Höchstens **10 Stunden** (aus dem Unterricht, Karin Aufg. 4).', KARIN + ' Aufg. 4');
  EZ('e13', 'urlaub', 'Ein Azubi ist am **1. Januar 15 Jahre** alt. Wie viele **Werktage** Urlaub bekommt er mindestens?', 30, 'Werktage', 'Noch nicht 16 → **30 Werktage**.', LM(11), 2, { fall: true });
  EZ('e14', 'urlaub', 'Ein Azubi ist am **1. Januar 16 Jahre** alt. Wie viele **Werktage** Urlaub bekommt er mindestens?', 27, 'Werktage', 'Noch nicht 17 → **27 Werktage**.', LM(11), 2, { fall: true });
  EZ('e15', 'urlaub', 'Eine Azubi ist am **1. Januar 17 Jahre** alt. Wie viele **Werktage** Urlaub bekommt sie mindestens?', 25, 'Werktage', 'Noch nicht 18 → **25 Werktage**.', LM(11), 2, { fall: true });
  EZ('e16', 'urlaub', 'Ab **mehr als wie vielen** Unterrichtsstunden muss ein Jugendlicher (1× pro Woche) nach der Berufsschule nicht mehr in den Betrieb?', 5, 'Unterrichtsstunden', 'Bei **mehr als 5** Unterrichtsstunden (aus dem Unterricht, Karin Aufg. 3).', KARIN + ' Aufg. 3');

  /* ---- Probeklausur (S. 14, Lösungshinweise S. 15) – nur im Probeklausur-Modus ---- */
  const P = (id, thema, frage, begriffe, mind, antwort, punkte) => EI(id, thema, frage, begriffe, mind, antwort, LM('14/15') + ' Aufg. ' + id.slice(2), punkte, { probe: true });
  P('pk1', 'dual', 'Erkläre in eigenen Worten, was eine **duale Ausbildung** ist.', S_DUAL, 3, 'Ausbildung an **zwei zentralen Lernorten**: im **Betrieb** für die Praxis und in der **Berufsschule** für Theorie und berufsbezogene Bildung.', 3);
  P('pk2', 'beteiligte', 'Erkläre den Unterschied zwischen **Auszubildendem, Ausbildendem und Ausbilder**.', S_BET, 3, 'Auszubildender **lernt**; Ausbildender ist der **Betrieb/Vertragspartner**; Ausbilder ist die **verantwortliche Ausbildungsperson**.', 3);
  P('pk3', 'vertrag', 'Nenne **mindestens acht** wesentliche Inhalte eines Berufsausbildungsvertrags.', S_VERTRAG, 8, 'Z. B. Ausbildungsberuf, Ziel und Gliederung, Beginn, Dauer, externe Maßnahmen, Arbeitszeit, Probezeit, Vergütung, Urlaub, Kündigungsregeln, Tarifhinweise, Ausbildungsnachweis.', 4);
  P('pk4', 'pflichten', 'Nenne **fünf Pflichten des Auszubildenden**.', S_AZUBI, 5, 'Z. B. Lernpflicht, Sorgfalt, Weisungen beachten, Schweigepflicht, Berichtsheft führen.', 3);
  P('pk5', 'pflichten', 'Nenne **vier Pflichten des Ausbildenden**.', S_BETRIEB, 4, 'Z. B. ausbilden, Vergütung zahlen, freistellen, Ausbildungsmittel bereitstellen.', 3);
  P('pk6', 'ihk', 'Nenne **fünf Aufgaben der IHK** als zuständige Stelle.', S_IHK, 5, 'Vertrag/Eignung prüfen, registrieren, überwachen, Prüfungen organisieren, Prüfungsausschüsse einsetzen, über Verkürzung/Verlängerung entscheiden.', 3);
  P('pk7', 'probezeit', 'Erkläre die **Regeln zur Probezeit**.', S_PROBE, 4, 'Mindestens **1**, höchstens **4 Monate**; in dieser Zeit **schriftliche** Kündigung **ohne Frist** und **ohne Grund** möglich.', 3);
  P('pk8', 'kuendigung', 'Erkläre den Unterschied zwischen Kündigung **während** und **nach** der Probezeit.', [['Probezeit: jederzeit ohne Grund', 'jederzeit', 'ohne grund', 'grundlos', 'ohne frist'], ['danach nur aus wichtigem Grund', 'wichtig'], ['Azubi: 4 Wochen bei Aufgabe/Berufswechsel', '4 wochen', 'vier wochen']], 2, 'Nach der Probezeit gelten strengere Voraussetzungen, besonders der **wichtige Grund** für eine fristlose Kündigung durch den Ausbildenden. Der Azubi kann zusätzlich mit **4 Wochen** Frist kündigen, wenn er die Ausbildung aufgibt oder den Beruf wechselt.', 3);
  P('pk9', 'jarbschg', 'Nenne die wichtigsten **Arbeitszeit- und Pausenregeln** für Jugendliche.', S_JZEIT, 5, 'Grundsätzlich **8 Std./Tag, 40 Std./Woche, 5 Tage**; **30 Min.** Pause bei mehr als 4,5 bis 6 Std., **60 Min.** bei mehr als 6 Std.; **12 Std.** Ruhezeit.', 4);
  P('pk10', 'jarbschg', 'Ein **17-jähriger** Azubi arbeitet von **8:00 bis 16:00 Uhr** und bekommt nur **30 Minuten** Pause. Beurteile den Fall.', [['nicht ausreichend', 'nicht', 'unzulaessig', 'verstoss', 'zu wenig', 'zu kurz', 'falsch'], ['60 Minuten nötig', '60'], ['mehr als 6 Std. Arbeit', '6', 'sechs', '7.5', '7 5']], 2, 'Nicht ausreichend: Er arbeitet mehr als 6 Stunden – für Jugendliche sind dann **60 Minuten** Pause vorgeschrieben.', 3);
  P('pk11', 'urlaub', 'Welche **Urlaubsansprüche** gelten für Jugendliche unter 16, unter 17 und unter 18 Jahren?', S_URLAUB, 3, 'Unter 16: **30**; unter 17: **27**; unter 18: **25 Werktage**.', 3);
  P('pk12', 'pflichten', 'Warum darf der Betrieb einen Azubi nicht dauerhaft mit **ausbildungsfremden Tätigkeiten** beschäftigen?', [['Ausbildungsziel erreichen', 'ziel'], ['berufliche Inhalte vermitteln (Ausbildungspflicht)', 'ausbildungspflicht', 'vermitteln', 'inhalte', 'lernen', 'beruf']], 2, 'Die Ausbildung dient dem **Ausbildungsziel** und muss die vorgeschriebenen beruflichen Inhalte vermitteln (**Ausbildungspflicht**).', 2);

  L.push({
    id: 'wbl-k1', fach: 'wbl', titel: 'WBL-Klausur 1', untertitel: 'Ausbildung & Arbeitsrecht', datum: '2026-10-15',
    quelle: 'Lernmappe Klausur 1 (16 Seiten) + Ergänzungen aus dem Unterricht (Buch S. 157–160, Arbeitsblatt Karin)',
    nichtDran: ['Elternzeit', 'Mutterschutz', 'Technischer Arbeitsschutz'],
    themen: [
      { id: 'k1-beteiligte', name: 'Beteiligte im Ausbildungsverhältnis', lern: [
        '- **Auszubildender:** lernt einen anerkannten Ausbildungsberuf und schließt den Vertrag mit dem Ausbildenden. Bei Minderjährigen unterschreibt zusätzlich ein gesetzlicher Vertreter.',
        '- **Ausbildender:** der Ausbildungsbetrieb, also der Vertragspartner. Er trägt die Verantwortung für eine ordnungsgemäße Ausbildung.',
        '- **Ausbilder:** die konkrete Person, die ausbildet. Muss **fachlich und persönlich geeignet** sein.',
        '- In kleinen Betrieben können Ausbildender und Ausbilder **dieselbe Person** sein.',
      ], merke: 'Auszubildender = lernt. Ausbildender = Betrieb/Vertragspartner. Ausbilder = betreuende Person.', seite: 3 },
      { id: 'k1-dual', name: 'Duale Ausbildung', lern: [
        '- **Dual** = zwei zentrale Lernorte.',
        '- **Ausbildungsbetrieb:** Praxis – fachpraktische Kenntnisse, Fertigkeiten und Fähigkeiten. Der betriebliche Ausbildungsplan setzt die Ausbildungsordnung im Betrieb um.',
        '- **Berufsschule:** fachtheoretische Grundlagen, Lern- und Arbeitstechniken, berufsbezogene Allgemeinbildung.',
        '- **Überbetriebliche Ausbildungsstätte:** ergänzt, wenn der Betrieb Inhalte nicht selbst vermitteln kann.',
      ], merke: 'Betrieb = Praxis, Berufsschule = Theorie.', seite: 4 },
      { id: 'k1-ihk', name: 'IHK als zuständige Stelle', lern: [
        '- prüft den **Ausbildungsvertrag**',
        '- prüft die Eignung der **Ausbildungsstätte** und des **Ausbilders**',
        '- trägt das Ausbildungsverhältnis ins **Verzeichnis** ein',
        '- **überwacht** die Ausbildung',
        '- organisiert **Prüfungen** und setzt **Prüfungsausschüsse** ein',
        '- entscheidet über **Verkürzung/Verlängerung**',
        '- ist **Anlaufstelle** bei Problemen',
      ], merke: 'Die IHK prüft, registriert, überwacht, berät und organisiert Prüfungen.', seite: 5 },
      { id: 'k1-vertrag', name: 'Ausbildungsvertrag', lern: [
        'Vor Beginn festhalten – in der Klausur mindestens 8 Punkte sicher können:',
        '- Name und Anschrift des Azubis · Ausbildungsberuf',
        '- Art, Ziel, sachliche und zeitliche Gliederung',
        '- Beginn und Dauer · Maßnahmen außerhalb des Betriebs',
        '- tägliche Arbeitszeit · **Probezeit**',
        '- **Vergütung** (Höhe, Zahlungstermin) · **Urlaub**',
        '- Kündigungsvoraussetzungen · Hinweis auf Tarifverträge',
        '- Form des **Ausbildungsnachweises** (Berichtsheft)',
      ], merke: '„Nennen Sie sechs“ → die sechs sichersten Punkte aufschreiben.', seite: 6 },
      { id: 'k1-pflichten', name: 'Rechte und Pflichten', lern: [
        '**Azubi:** Lernpflicht · Sorgfaltspflicht · Gehorsamspflicht (berechtigte Weisungen) · Schweigepflicht · Berichtsheft führen · Berufsschule besuchen',
        '**Betrieb:** Ausbildungspflicht · Vergütungspflicht · Freistellungspflicht · Ausbildungsmittel kostenlos · Ziel erreichbar machen · Fürsorge und Schutz',
        '**Aus dem Unterricht zusätzlich:** Wettbewerbsverbot (Azubi), Zeugnispflicht (Betrieb)',
      ], merke: 'Paare: Lernpflicht ↔ Ausbildungspflicht · Berufsschule ↔ Freistellung · Sorgfalt ↔ Ausbildungsmittel', seite: 7 },
      { id: 'k1-probezeit', name: 'Probezeit', lern: [
        '- mindestens **1 Monat**, höchstens **4 Monate**',
        '- beide Seiten dürfen **jederzeit** kündigen',
        '- **ohne Kündigungsfrist** und **ohne Grund**',
        '- Kündigung immer **schriftlich** (mündlich = unwirksam)',
      ], merke: 'Probezeit = 1 bis 4 Monate.', seite: 8 },
      { id: 'k1-kuendigung', name: 'Kündigung nach der Probezeit', lern: [
        '- **Betrieb:** nur **fristlos aus wichtigem Grund**, schriftlich und **mit Gründen**',
        '- **Azubi:** fristlos aus wichtigem Grund – oder mit **4 Wochen** Frist, wenn er die Ausbildung aufgibt oder einen anderen Beruf lernen will',
        '- **Aufhebungsvertrag:** keine Kündigung, beide einigen sich',
      ], merke: 'Probezeit = jederzeit ohne Grund. Danach: Betrieb nur aus wichtigem Grund; Azubi zusätzlich die 4-Wochen-Regel.', seite: 9 },
      { id: 'k1-jarbschg', name: 'JArbSchG: Arbeitszeit und Pausen', lern: [
        '- höchstens **8 Std./Tag**, **40 Std./Woche**, **5 Tage**',
        '- mehr als 4,5 bis 6 Std. → **30 Min.** Pause · mehr als 6 Std. → **60 Min.**',
        '- Pause zählt ab **15 Min.** · höchstens **4,5 Std.** am Stück',
        '- **12 Std.** Freizeit zwischen zwei Arbeitstagen · Arbeit nur **6–20 Uhr**',
        '- aus dem Unterricht: **Schichtzeit** (Arbeit + Pausen) höchstens **10 Std.**',
      ], merke: '8 – 40 – 5 – 12. Pausen: 30 Min. ab mehr als 4,5 Std., 60 Min. ab mehr als 6 Std.', seite: 10 },
      { id: 'k1-urlaub', name: 'JArbSchG: Urlaub, Schule, Schutz', lern: [
        '- Urlaub nach Alter zu Beginn des Jahres: unter 16 → **30**, unter 17 → **27**, unter 18 → **25 Werktage**',
        '- Freistellung für **Berufsschule**, **Prüfungen** und vorgeschriebene Maßnahmen',
        '- aus dem Unterricht: Schultag mit **mehr als 5 Unterrichtsstunden** (1× pro Woche) ersetzt den Arbeitstag',
        '- verboten: bestimmte **gefährliche Arbeiten**, grundsätzlich **Akkordarbeit**',
        '- Samstags-/Sonntagsarbeit nur eingeschränkt in bestimmten Bereichen',
        '- aus dem Unterricht: **Erstuntersuchung** beim Arzt vor Beginn',
      ], merke: 'Fallaufgabe: zuerst auf das Alter achten. Unter 18 → JArbSchG.', seite: 11 },
    ],
    // Lernplan bis zur Klausur. art: lernen · check · faelle · gross · probe · fehler · klausur
    plan: [
      { tag: '2026-10-05', titel: 'Beteiligte, duale Ausbildung, IHK', dauer: '45 Min.', art: 'lernen', themen: ['k1-beteiligte', 'k1-dual', 'k1-ihk'], n: 14 },
      { tag: '2026-10-06', titel: 'Ausbildungsvertrag', dauer: '45 Min.', art: 'lernen', themen: ['k1-vertrag'], n: 10 },
      { tag: '2026-10-07', titel: 'Rechte und Pflichten', dauer: '50 Min.', art: 'lernen', themen: ['k1-pflichten'], n: 12 },
      { tag: '2026-10-08', titel: 'Probezeit und Kündigung', dauer: '50 Min.', art: 'lernen', themen: ['k1-probezeit', 'k1-kuendigung'], n: 14 },
      { tag: '2026-10-09', titel: 'Wochencheck ohne Unterlagen', dauer: '20 Min.', art: 'check', themen: ['k1-beteiligte', 'k1-dual', 'k1-ihk', 'k1-vertrag', 'k1-pflichten', 'k1-probezeit', 'k1-kuendigung'], n: 15 },
      { tag: '2026-10-10', titel: 'Jugendarbeitsschutzgesetz', dauer: '60 Min.', art: 'lernen', themen: ['k1-jarbschg', 'k1-urlaub'], n: 16 },
      { tag: '2026-10-11', titel: 'Fallaufgaben lösen', dauer: '45 Min.', art: 'faelle', n: 16 },
      { tag: '2026-10-12', titel: 'Großwiederholung + Zahlenblatt', dauer: '60 Min.', art: 'gross', n: 25 },
      { tag: '2026-10-13', titel: 'Probeklausur ohne Hilfe', dauer: '30 Min.', art: 'probe' },
      { tag: '2026-10-14', titel: 'Fehler nachlernen + Selbstcheck', dauer: '30 Min.', art: 'fehler', n: 15 },
      { tag: '2026-10-15', titel: 'Klausur – morgens nur das Zahlenblatt', dauer: '10 Min.', art: 'klausur' },
    ],
    zahlen: [
      ['Probezeit', '1 bis 4 Monate'],
      ['Azubi kündigt bei Aufgabe / anderem Beruf', '4 Wochen Frist'],
      ['Jugendliche – Arbeitszeit', '8 Std./Tag · 40 Std./Woche · 5 Tage'],
      ['Pause bei mehr als 4,5 bis 6 Std.', '30 Minuten'],
      ['Pause bei mehr als 6 Std.', '60 Minuten'],
      ['Mindestlänge einer Ruhepause', '15 Minuten'],
      ['Höchstens am Stück ohne Pause', '4,5 Stunden'],
      ['Freizeit zwischen zwei Arbeitstagen', '12 Stunden'],
      ['Arbeitszeitrahmen', '6 bis 20 Uhr'],
      ['Schichtzeit (Arbeit + Pausen)', 'höchstens 10 Std. (Unterricht)'],
      ['Berufsschultag ersetzt Arbeitstag', 'mehr als 5 Unterrichtsstunden, 1× pro Woche (Unterricht)'],
      ['Urlaub unter 16 / 17 / 18', '30 / 27 / 25 Werktage'],
    ],
    selbstcheck: [
      'Ich kann die drei Beteiligten unterscheiden.',
      'Ich kann die duale Ausbildung in 2–3 Sätzen erklären.',
      'Ich kann mindestens 6–8 Vertragsinhalte nennen.',
      'Ich kann 5 Pflichten des Azubis nennen.',
      'Ich kann 4 Pflichten des Ausbildenden nennen.',
      'Ich kann mindestens 5 IHK-Aufgaben nennen.',
      'Ich kenne die Probezeit: 1 bis 4 Monate.',
      'Ich kann Kündigung in und nach der Probezeit unterscheiden.',
      'Ich kenne 8 / 40 / 5 / 12.',
      'Ich kenne die Pausen 30 / 60 Minuten.',
      'Ich kenne 30 / 27 / 25 Werktage Urlaub.',
      'Ich kann eine Fallaufgabe mit einer passenden Regel begründen.',
    ],
    probe: { minuten: 30 },
    einheiten: E,
  });

  window.LW_KLAUSUREN = L;
})();
