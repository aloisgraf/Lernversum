# Lernversum – Arbeitsregeln für Claude

Lernversum ist eine modulare, datenschutzorientierte Lernplattform für Kinder mit den Rollen
Admin, Lehrkraft und Schüler und Lernspielen als eigenständigen Modulen. Diese Datei enthält nur die dauerhaft geltenden Arbeitsregeln.
Details stehen in `docs/`.

## Prioritäten (verbindlich, in dieser Reihenfolge)

1. Sicherheit, Datenschutz, Datenintegrität
2. Korrekte Geschäftslogik und Berechtigungen
3. Tragfähige Architektur
4. Automatisierte Tests und nachweisbare Funktion
5. Wartbarkeit und Dokumentation
6. Tokeneffizienz
7. Geschwindigkeit

Geschwindigkeit geht nie auf Kosten von 1 bis 5.

## Arbeitsweise

- Vor größeren Änderungen: relevanten Code und `docs/` lesen, betroffene Dateien und
  Schnittstellen benennen, kurzen Plan erstellen, Auswirkungen auf Sicherheit, Datenschutz und
  Datenbank bewerten, dann die kleinstmögliche vollständige Lösung umsetzen.
- Gründlicher vorgehen bei: Architektur, Migrationen, Authentifizierung, Lizenzen,
  Berechtigungen, personenbezogenen Daten.
- Ursachen untersuchen statt Symptome überdecken. Keine großen Änderungen auf Verdacht.
- Nicht jedes Mal das ganze Repository lesen; vorhandene Doku nutzen.
- Neue Bibliotheken oder Infrastruktur nur mit bewertetem Nutzen und Kosten (in `docs/DECISIONS.md`).

## Git

- Vor Änderungen `git status` prüfen; fremde, ungesicherte Änderungen nicht überschreiben.
- **Keine Commits und keine Pushes ohne ausdrückliche Freigabe von Alois.**
- Keine destruktiven Git-Befehle ohne geprüfte Auswirkungen.
- Keine Geheimnisse (Schlüssel, Passwörter, Echtdaten) im Repository.

## Sicherheit (Kurzfassung, Details in `docs/SECURITY.md`)

- Berechtigungen werden serverseitig geprüft; die Oberfläche ist keine Sicherheitsgrenze.
- RLS für alle relevanten Tabellen; Rollen und Lizenzen sind für Nutzer nicht änderbar.
- Privilegierte Schlüssel nie im Frontend.
- Jede sicherheitskritische Änderung bekommt auch **negative Tests** (unberechtigter Zugriff scheitert).
- Nie behaupten, die Plattform sei unangreifbar oder automatisch DSGVO-konform.

## Architektur (Details in `docs/ARCHITECTURE.md`, `docs/GAME-MODULES.md`)

- Benutzerverwaltung, Authentifizierung, Rollen und Lizenzen sind zentrale Plattformdienste und
  werden nie in Spiele kopiert.
- Jedes Spiel ist ein Modul mit Logik, Oberfläche, Admin, Konfiguration, Medien, Statistik, Tests.
- Neue Funktion: zuerst entscheiden, ob Plattform- oder Spielfunktion.

## Qualität

Fertig heißt: passende Tests, Typprüfung, Linting, Build und Berechtigungsprüfung wurden
tatsächlich ausgeführt. Nicht ausgeführte Prüfungen werden mit Grund benannt. Status klar
trennen: implementiert / lokal getestet / automatisiert geprüft / unabhängig überprüft / produktiv.

## Agenten

Subagenten nur für klar abgegrenzte Aufgaben (Sicherheits- oder Architektur-Review, Recherche,
Testanalyse). Klarer Auftrag, nur relevanter Kontext, keine globalen Architekturentscheidungen,
keine parallelen Änderungen an denselben Dateien. Ergebnisse vor Integration selbst prüfen.

## Bei Unsicherheit

Risikoarme, reversible Entscheidungen selbst treffen. Nachfragen bei Auswirkungen auf Sicherheit,
Datenschutz, Datenmodell, Kosten oder Anbieterbindung, Lizenz- und Rechtemodell, Grundarchitektur.
Wenige präzise Fragen, mit Empfehlung. Keine stillen Annahmen.

## Abschluss größerer Aufgaben

Kurz: was umgesetzt, welche Dateien, welche Tests tatsächlich gelaufen und mit welchem Ergebnis,
welche Sicherheitsaspekte geprüft, offene Risiken, nächster sinnvoller Schritt.
Danach `docs/STATUS.md` aktualisieren.

## Projektgedächtnis

| Datei | Inhalt |
| --- | --- |
| `docs/ARCHITECTURE.md` | Systemarchitektur |
| `docs/DECISIONS.md` | Entscheidungen (verbindlich vs. vorläufig) |
| `docs/SECURITY.md` | Sicherheitsanforderungen und Risiken |
| `docs/DATA-PROTECTION.md` | Datenschutz und Datenverarbeitung |
| `docs/DATABASE.md` | Datenmodell und Migrationen |
| `docs/GAME-MODULES.md` | Spielmodule, Konfiguration, Statistik |
| `docs/ACCOUNT-FLOWS.md` | Abläufe: Lehrkraft, Schüler, Eltern anlegen und aktivieren |
| `docs/DESIGN-SYSTEM.md` | Designsystem |
| `docs/DEVELOPMENT.md` | lokale Entwicklung Windows/macOS, Claude Code |
| `docs/DEPLOYMENT.md` | EU-Hosting und Deployment |
| `docs/ROADMAP.md` | Phasen und Prioritäten |
| `docs/STATUS.md` | aktueller Stand und offene Aufgaben |
