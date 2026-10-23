# Abläufe: Lehrkraft, Schüler und Eltern anlegen

**Stand:** Entwurf nach D-009, D-014, D-015 und D-018 (vorläufig, 2026-10-21). Noch nicht umgesetzt.

Überblick: Privatpersonen und Unternehmen (z. B. Lerntherapeuten) kaufen ihre Lizenz selbst
online; dabei entsteht ihr Konto ohne Zutun des Admins (Abschnitt 1a). Der Admin kann Konten
weiterhin manuell anlegen (Abschnitt 1). Der Lizenznehmer legt seine Schüler an. Pro Schüler
entstehen zwei Zugangskarten, eine für das Kind und eine für die Eltern. Kind und Eltern lösen
ihre Karte einmal ein und melden sich danach mit Benutzername und eigenem Passwort an.

Wer Kinder anlegen darf, hängt von der **Lizenz** ab (Abschnitt 0). Bei der Elternlizenz ist
der Elternteil selbst der Lizenznehmer und legt sein eines Kind an (Abschnitt 2a).

```
Admin ──legt an──▶ Lehrkraft ──legt an──▶ Schüler ─┬─ Karte Kind   → Aktivierung → max.mueller + Passwort
                                                    └─ Karte Eltern → Aktivierung → eltern.max.mueller + Passwort
```

## 0. Lizenzen (D-018, vorläufig)

| Lizenz | Lizenznehmer | Kinder | Laufzeit |
| --- | --- | --- | --- |
| Elternlizenz | Elternteil | 1 | 3, 6 oder 12 Monate |
| Lerntherapie 6 / 12 / 20 | Lerntherapeut | 6, 12 oder 20 | 3, 6 oder 12 Monate |
| Schule / Lehrperson | Lehrkraft | 20 | 3, 6 oder 12 Monate |

- Jede Lizenz ist ein Eintrag in `license_plans` (Kinderzahl) plus eine Lizenz mit Beginn und
  Ende (Laufzeit). Neue Pakete brauchen keine Code-Änderung.
- Das Kinderlimit wird serverseitig beim Anlegen geprüft, auch bei gleichzeitigen Anfragen.
- Läuft die Lizenz ab, gilt D-011: Spielen gesperrt, 90 Tage nur lesend, dann Löschung.
  Verlängern verschiebt das Ende; Daten bleiben erhalten.
- Erwerb: online durch den Käufer selbst (Abschnitt 1a, L-1 entschieden). Die Kinderzahl
  wählt der Käufer mit dem Paket.

## 1a. Lizenz online kaufen (Selbstbedienung)

1. Auf der öffentlichen Seite wählt der Käufer Paket und Laufzeit, z. B. „Lerntherapie 12,
   6 Monate“, und gibt Name, E-Mail und bei Unternehmen Firmenname und Rechnungsdaten ein.
2. Er akzeptiert AGB (inkl. Sperre bei Weitergabe der Zugangsdaten) und Datenschutzerklärung.
3. Die Zahlung läuft vollständig beim Zahlungsanbieter. Lernversum speichert keine Karten- oder
   Kontodaten.
4. Erst wenn der Zahlungsanbieter die Zahlung bestätigt (signierte Server-Nachricht, Webhook),
   legt das System Konto, Profil und Lizenz an und protokolliert den Vorgang. Wird die
   Nachricht doppelt zugestellt, entsteht trotzdem nur eine Lizenz.
5. Der Käufer bekommt eine E-Mail mit einem befristeten Link und setzt sein Passwort selbst.
   Damit ist auch die E-Mail-Adresse bestätigt.
6. Danach meldet er sich an und legt bis zur gekauften Kinderzahl Schüler an (Abschnitt 2 bzw.
   2a) und vergibt deren Zugangskarten.

Eine freie Registrierung ohne Kauf gibt es nicht: Konten entstehen nur nach bestätigter Zahlung
oder durch den Admin. Verlängern funktioniert genauso über einen neuen Kauf mit bestehendem Konto.

## 1. Lehrkraft anlegen (durch den Admin)

1. Admin meldet sich im Adminbereich an (E-Mail, Passwort, zweiter Faktor).
2. Admin wählt „Neue Lehrkraft“ und gibt Vorname, Nachname und E-Mail ein; optional ordnet er
   eine oder mehrere Schulen zu.
3. Admin wählt die Lizenz (z. B. „Schule“, „Lerntherapie 12“) und die Laufzeit (3, 6 oder
   12 Monate). Der Plan legt fest: max. Anzahl Schüler und Klassen, erlaubte Spiele, maximale
   Dauer einer Freischaltung.
4. Das System prüft die Eingaben, legt Konto, Profil und Lehrkraftlizenz an und schreibt einen
   Eintrag ins Audit-Log.
5. Die Lehrkraft bekommt eine Einladungs-E-Mail mit einem Link (befristet gültig).
6. Über den Link setzt die Lehrkraft ihr Passwort selbst. Danach meldet sie sich mit E-Mail und
   Passwort an.

Der manuelle Weg bleibt für Sonderfälle (z. B. Schulen auf Rechnung, Testzugänge). Läuft der
Einladungslink ab, schickt der Admin einen neuen.

## 2. Schüler anlegen (durch die Lehrkraft)

1. Lehrkraft meldet sich an und legt optional eine Klasse oder Lerngruppe an (z. B. „2b“).
2. Sie wählt „Schüler hinzufügen“ und gibt Vorname und Nachname ein, einzeln oder als Liste.
3. Das System prüft serverseitig:
    - Lehrkraftlizenz gültig,
    - Schülerlimit des Plans noch nicht erreicht (auch bei gleichzeitigem Anlegen),
    - Eingaben gültig.
4. Das System legt in einem Schritt an:
    - das Schülerkonto (noch nicht aktiviert),
    - den Plattformzugang des Schülers (Gültigkeit nach Vorgabe der Lehrkraft),
    - den Elternzugang (noch nicht aktiviert),
    - je einen **Aktivierungscode** für Kind und Eltern, z. B. `K7QM-4TXR-9WPD`, gültig 30 Tage.
5. Die Lehrkraft druckt die beiden **Zugangskarten** (Code und QR-Code). Die Codes sind nur in
   diesem Moment sichtbar; gespeichert wird nur ein nicht umkehrbarer Prüfwert (Hash).
6. Die Lehrkraft gibt die Kinderkarte dem Kind und die Elternkarte verschlossen den Eltern mit.
7. In der Schülerliste sieht die Lehrkraft für jedes Kind: „Kind aktiviert ja/nein“ und
   „Eltern aktiviert ja/nein“.

Danach schaltet die Lehrkraft dem Kind einzelne Spiele frei (Spiel, Beginn, Ende).

## 2a. Elternlizenz: Elternteil legt sein Kind an

1. Der Elternteil erhält wie eine Lehrkraft eine Einladung per E-Mail und setzt sein Passwort.
2. Er legt genau ein Kind an (Vorname, Nachname). Ein zweites Kind lehnt der Server ab.
3. Es entsteht nur die **Kinderkarte**. Eine Elternkarte entfällt, weil der Elternteil schon
   ein eigenes Konto hat und darüber den Fortschritt sieht.
4. Der Elternbereich zeigt den Fortschritt lesend, wie in Abschnitt 4. Welche Spiele das Kind
   spielen darf, ergibt sich aus der Lizenz (offen, ob der Elternteil selbst freischaltet, L-4).

## 3. Kind aktiviert seinen Zugang

1. Das Kind öffnet die Anmeldeseite und tippt auf „Ich habe eine Karte“, gibt den Code ein
   oder scannt den QR-Code.
2. Das System prüft: Code gültig, nicht abgelaufen, noch nicht benutzt.
3. Das Kind sieht seinen Benutzernamen groß angezeigt, z. B. **max.mueller**.
    - Umlaute werden umgeschrieben (`jürgen.öz` → `juergen.oez`).
    - Gibt es den Namen schon, wird eine Zahl angehängt (`max.mueller2`).
4. Das Kind wählt sein Passwort selbst und gibt es zur Kontrolle zweimal ein (kindgerechte
   Mindestregeln, z. B. mindestens 8 Zeichen).
5. Das Passwort wird gesetzt, der Code ist verbraucht. Das Kind ist angemeldet und sieht seine
   Spielebibliothek.

Ab jetzt meldet sich das Kind mit **Benutzername und Passwort** an.

## 4. Eltern aktivieren ihren Zugang

1. Die Eltern öffnen die Anmeldeseite, wählen „Elternzugang aktivieren“ und geben den Code
   der Elternkarte ein.
2. Das System prüft den Code wie beim Kind.
3. Die Eltern sehen ihren Benutzernamen, Vorschlag **eltern.max.mueller** (noch zu bestätigen, E-14).
4. Die Eltern wählen ihr Passwort selbst (strengere Mindestregeln als beim Kind, da sie Lerndaten sehen).
5. Danach sehen die Eltern nur lesend den Fortschritt ihres Kindes: welche Spiele freigeschaltet
   sind, wann geübt wurde und die Auswertungen der Spiele. Sie können keine Spiele starten und
   nichts ändern.

## 4a. Nur eine Anmeldung gleichzeitig (D-018, vorläufig)

Zugangsdaten sollen nicht weitergegeben werden. Darum:

- Jedes Konto (Kind, Eltern, Lehrkraft, Therapeut) hat **höchstens eine aktive Sitzung**.
- Vorschlag: Eine neue Anmeldung beendet die alte Sitzung; das alte Gerät zeigt „Du wurdest
  auf einem anderen Gerät angemeldet“. So sperrt sich ein Kind nicht selbst aus, wenn es den
  Tab einfach schließt (L-2).
- Das System zählt solche Übernahmen je Konto. Häufen sie sich (Schwelle festzulegen), bekommt
  der Admin einen Hinweis und entscheidet über eine Sperre. Keine vollautomatische Sperre, weil
  z. B. Schule und Zuhause echte Fehlalarme erzeugen (L-3).
- Gespeichert werden nur Zeitpunkte der Anmeldungen, keine Gerätekennungen oder
  Gerätefingerabdrücke; IP-Adressen nur kurz für den Anmeldeschutz (D-017).
- Die Sperre bei Weitergabe muss in den AGB stehen. Die AGB schreibt eine Rechtsberatung, nicht
  Claude.

## 5. Wenn etwas schiefgeht

| Situation | Lösung |
| --- | --- |
| Karte verloren, noch nicht aktiviert | Lehrkraft erzeugt neuen Code; der alte wird ungültig |
| Code abgelaufen | Lehrkraft erzeugt neuen Code |
| Kind oder Eltern haben das Passwort vergessen | Lehrkraft erzeugt neuen Aktivierungscode; Benutzername bleibt, Passwort wird neu gewählt, alle offenen Sitzungen enden |
| Verdacht, dass jemand Fremdes den Elternzugang hat | Lehrkraft sperrt den Elternzugang und erzeugt einen neuen Code |
| Kind verlässt die Klasse | Lehrkraft deaktiviert das Kind; Daten werden nach den Fristen gelöscht |
| Lehrkraftlizenz läuft ab | Kinder können nicht mehr spielen; Lehrkraft und Eltern sehen die Daten 90 Tage lesend, dann Löschung |

Für Kinder und Eltern gibt es keine Passwort-Zurücksetzung per E-Mail, weil im System keine
E-Mail-Adressen von ihnen gespeichert werden.

## Offene Punkte

- L-1: entschieden – Online-Kauf mit Selbstbedienung (2026-10-21).
- L-5: Zahlungsanbieter (Vorschlag: EU-Anbieter, Auswahl nach Prüfung von Kosten, AVV und
  Rechnungsstellung).
- L-6: Kaufen Schulen auch online, oder auf Rechnung über den Admin?
- L-7: Kann ein Käufer während der Laufzeit auf ein größeres Paket wechseln?
- L-2: Zweite Anmeldung beendet die erste (Vorschlag) oder wird abgewiesen?
- L-3: Sperre nach Prüfung durch den Admin (Vorschlag) oder automatisch?
- L-4: Bei der Elternlizenz: schaltet der Elternteil Spiele selbst frei oder sind alle Spiele
  der Lizenz offen (Vorschlag)?
- Bekommen Kinder von Therapeuten und Schulen weiterhin eine Elternkarte (Vorschlag: ja)?

- E-14: Benutzername der Eltern.
- Gültigkeitsdauer der Codes (Vorschlag 30 Tage) und Passwortregeln für Kinder.
- Ob die Lehrkraft Schülerlisten per Datei (CSV) importieren können soll.
