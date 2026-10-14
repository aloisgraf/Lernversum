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
| Schüler: Vorname, Nachname, Benutzername, Pseudonym-ID | Login, Zuordnung | Lehrkraft; Eltern; Schüler selbst | mit Löschung durch Lehrkraft oder Fristende |
| Elternzugang: Benutzername | Fortschritt einsehen | Lehrkraft verwaltet | mit dem Schülerkonto |
| Freischaltungen | Lizenzprüfung | Lehrkraft, Schüler (eigene), Admin (ohne Namen) | mit Schülerkonto |
| Spielsitzungen und Ereignisse | Lernstatistik | Lehrkraft; Eltern (nur lesen); Admin nur zweckgebunden mit Audit | Rohdaten 12 Monate, Aggregate bis Kontolöschung (Fristen entschieden, D-011) |
| Audit-/Sicherheitslogs | Nachvollziehbarkeit, Sicherheit | Admin | 12 Monate |
| Hochgeladene Medien | Spielinhalte | nach Scope | mit Inhalt |

Keine Geburtsdaten, keine E-Mail-Adressen von Kindern, keine Fotos oder Sprachaufnahmen von
Kindern, keine Gesundheits- oder Diagnosefelder.

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
