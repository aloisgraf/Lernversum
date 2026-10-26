# Datenschutzkonzept

**Stand:** Konzept Phase 1. Technische Maßnahmen machen die Plattform nicht automatisch
DSGVO-konform. Die offenen rechtlichen Fragen unten müssen vor dem Produktivbetrieb geklärt sein.

## Grundsätze

Datenminimierung, Zweckbindung, Speicherbegrenzung, rollenbasierter Zugriff, transparente
Protokollierung, kein Tracking, keine Werbung, keine Veröffentlichung von Schülerdaten,
keine externen Laufzeit-Abrufe (Fonts, CDNs, Analytics) im Schülerbereich.

## Verzeichnis der Daten (Entwurf)

| Daten | Zweck | Zugriff | Löschung (Vorschlag) |
| --- | --- | --- | --- |
| Admin: E-Mail, Name, 2FA | Verwaltung | Admins | bei Ausscheiden |
| Schule (optional): Name | Verwaltung | Admin; zugeordnete Lehrkräfte | mit Auflösung |
| Lehrkraft: E-Mail, Name, Schulen | Konto, Lizenz | Lehrkraft, Admin | 90 Tage nach Lizenzende ohne Verlängerung |
| Käufer: Name, E-Mail, ggf. Firma und Rechnungsadresse, Bestellungen (D-018) | Vertrag, Rechnung | Admin; Käufer selbst | gesetzliche Aufbewahrungsfrist für Buchhaltungsunterlagen (genaue Dauer prüfen); Kontodaten wie Lehrkraft |
| Schüler: Vorname, Nachname, Benutzername, Pseudonym-ID | Login, Zuordnung | Lehrkraft; Eltern; Schüler selbst | mit Löschung durch Lehrkraft oder Fristende |
| Kinderprofil: Spitzname (optional), Avatar aus fester Auswahl (D-023) | Anrede und Wiedererkennen im Kinderbereich | Kind selbst; Lehrkraft und Eltern (sehen, zurücksetzen) | mit dem Schülerkonto |
| Elternzugang: Benutzername | Fortschritt einsehen | Lehrkraft verwaltet | mit dem Schülerkonto |
| Freischaltungen | Lizenzprüfung | Lehrkraft, Schüler (eigene), Admin (ohne Namen) | mit Schülerkonto |
| Lernpakete (D-024): Name, Inhalt, erstellt, gültig bis, beendet | Freigabe, Nachvollziehbarkeit | Admin bzw. betreuende Person; Kind sieht nur Spiele | mit dem Schülerkonto |
| Spielrunden (D-024): Spiel, Beginn, Dauer, Aufgaben, Fehlversuche | Ergebnisse für Kind und Betreuende | betreuende Person (im Prototyp Admin); Kind nur eigene Sterne | einzelne Runden 12 Monate, danach Zusammenfassung je Paket |
| Spielsitzungen und Ereignisse | Lernstatistik | Lehrkraft; Eltern (nur lesen); Admin nur zweckgebunden mit Audit | Rohdaten 12 Monate, Aggregate bis Kontolöschung (Fristen entschieden, D-011) |
| Audit-/Sicherheitslogs | Nachvollziehbarkeit, Sicherheit | Admin | 12 Monate |
| Anmeldezeitpunkte und Sitzungsübernahmen (D-018) | Schutz vor Weitergabe der Zugangsdaten | Admin | Vorschlag 90 Tage; keine Gerätefingerabdrücke |
| Hochgeladene Medien | Spielinhalte | nach Scope | mit Inhalt |

Keine Geburtsdaten, keine E-Mail-Adressen von Kindern, keine Fotos oder Sprachaufnahmen von
Kindern, keine Gesundheits- oder Diagnosefelder.

## Kinderprofil (D-023, vorläufig)

Das Kind kann einen Spitznamen eintragen und einen Avatar wählen. Avatare sind gezeichnete
Figuren aus einer festen Auswahl; Hochladen von Bildern oder Fotos gibt es nicht. Der Spitzname
ist freiwillig und auf 2 bis 20 Buchstaben begrenzt (keine Ziffern, Links oder E-Mail-Adressen);
die Oberfläche bittet, nicht den ganzen Namen einzutragen. Er erscheint nur im eigenen
Kinderbereich, nicht in Statistiken, Protokollen oder für andere Kinder. Lehrkraft und Eltern sehen
den Spitznamen und können ihn zurücksetzen, etwa bei unpassenden Wörtern (Alois, 2026-10-24).
Im Prototyp liegt das Profil nur im Speicher des Servers.

## Lernpakete und Spielrunden (D-024, vorläufig)

Gespeichert wird je Runde nur Spiel, Lernpaket, Beginn, Dauer, Zahl der Aufgaben und der
Fehlversuche; keine Geräte-, Browser- oder Ortsdaten, keine Eingaben im Wortlaut. Nach
12 Monaten werden einzelne Runden zu einer Zusammenfassung je Paket verdichtet. Das Kind sieht
nur seine eigenen Sterne, nie einen Vergleich mit anderen Kindern. Ergebnisse sieht, wer das
Kind betreut; im Prototyp ist das der Admin. Sobald Lehrkräfte und Eltern ihre Kinder selbst
betreuen, gilt für den Admin wieder E-7 (nur begründet, befristet, protokolliert).
Das Erstpasswort wird nur als Hash gespeichert; der Admin übergibt es dem Kind selbst, etwa
als Loginzettel (D-025). Der Zettel wird nur im Browser des Admins erzeugt und gedruckt, nicht
gespeichert; der QR-Code enthält nur die Adresse der Anmeldeseite.

## Pseudonymisierung

Lernstatistiken speichern nur die Schüler-UUID. Der Bezug zum Namen existiert nur in der
Schülertabelle der zuständigen Lehrkraft. Plattformweite Auswertungen nur aggregiert.

## Betroffenenrechte

Funktionen für Export (JSON/CSV je Schüler), Berichtigung (Lehrkraft) und Löschung
(Lehrkraft für Schüler, Admin für Lehrkraft), jede Löschung im Audit-Log ohne Inhaltsdaten.
Automatische Löschjobs nach den Fristen oben.

## Elternzugang

Wer den Elterncode zuerst einlöst, erhält den Elternzugang und sieht die Lerndaten des Kindes.
Die Lehrkraft übergibt ihn deshalb persönlich bzw. als verschlossene Karte; bei Verlust oder
Verdacht erzeugt sie einen neuen Code, der den bisherigen Zugang ersetzt.

## Klarnamen

Der Benutzername `vorname.nachname` erfordert den vollständigen Namen des Kindes (vorher nur
Vorname/Spitzname). Er ist nur für Lehrkraft, Eltern und das Kind sichtbar und erscheint nicht
in Statistiken oder Protokollen.
Zugriffe über Elterncodes werden protokolliert (ohne Inhaltsdaten).

## Offene rechtliche Fragen (vor Produktivbetrieb)

1. **Rollenverteilung:** Ist die Lehrkraft/Schule Verantwortliche und der Plattformbetreiber
   Auftragsverarbeiter (dann AV-Vertrag je Lehrkraft/Schule), oder ist der Betreiber selbst
   verantwortlich (z. B. bei Eltern)?
2. **Rechtsgrundlage:** Einwilligung der Erziehungsberechtigten oder schulische Rechtsgrundlage
   je Land; Altersgrenzen (z. B. AT 14, DE 16).
3. **Gesundheitsdaten:** Im Therapiekontext könnten Lerndaten Rückschlüsse auf eine LRS-Diagnose
   erlauben (Art. 9 DSGVO).
4. **Datenschutz-Folgenabschätzung:** wegen Kindern und Leistungsdaten wahrscheinlich nötig.
5. **Unterauftragsverarbeiter und Drittlandzugriffe** der Anbieter (`DEPLOYMENT.md`).
6. Datenschutzerklärung (kindgerechte Fassung), Impressum, Nutzungsbedingungen.
7. **Online-Kauf (D-018):** AGB mit Sperrklausel, Widerrufsrecht bei digitalen Inhalten für
   Verbraucher, Umsatzsteuer und Rechnungen, Vertrag mit dem Zahlungsanbieter.
