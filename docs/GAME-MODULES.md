# Spielmodule, Konfiguration und Statistik

**Stand:** Entwurf Phase 1. Erstes Spiel als Testversion ohne Anmeldung und ohne Speicherung:
„Wald-Wesen füttern“ (`docs/games/wald-wesen-fuettern.md`), aus dem Konzept „Lernversum Zauberwald“.

## Prinzip

Jedes Spiel ist ein eigenständiges Produktmodul mit eigener Oberfläche, Logik,
Konfiguration, Adminbereich, Medien, Statistik und Tests. Die Plattform liefert Konten, Rollen,
Lizenzen, Katalog, Medienspeicher, Sitzungen und Ereignisse. Ein Spiel implementiert nie eigene
Sicherheits-, Rollen- oder Lizenzprüfungen und greift nie mit privilegierten Schlüsseln zu.

## Aufbau eines Moduls

```
src/games/<slug>/
  manifest.ts        Kennung, Version, Titel, Beschreibung, Vorschaubild, Abhängigkeiten,
                     configVersion, eventSchemaVersion, Fähigkeiten (z. B. Medien)
  config/            Zod-Schema je Version + Migration alter Konfigurationen
  player/            Spieloberfläche (eigenes Design, nutzt ui/-Grundelemente)
  logic/             reine Spiellogik, ohne UI, gut testbar
  admin/             Verwaltungsoberfläche für Admin und (falls vorgesehen) Lehrkraft
  stats/             Ereignistypen (Zod), Kennzahlen, Lehrkraft-Ansichten
  media/             statische Spielgrafiken und Töne (versioniert im Repo)
  tests/             Unit-, Komponenten- und E2E-Tests des Spiels
supabase/migrations/ <zeit>_game_<slug>_*.sql  (eigenes Schema game_<slug>, mit RLS)
```

Spiele werden in einer Registry (`src/games/registry.ts`) eingetragen und per Migration in
`games` registriert. Spiel-Code wird nur auf Spielseiten geladen (Code-Splitting).

## Schnittstelle Plattform ↔ Spiel (verbindlich nach Freigabe)

Die Plattform übergibt dem Spiel:

- `session`: Sitzungs-ID, Spiel-Version, Konfiguration (bereits validiert, als Snapshot)
- `media`: Funktion zum Abruf signierter URLs für freigegebene Medien
- `reportEvent(type, payload)`: speichert ein Ereignis; Plattform validiert gegen das Schema des
  Spiels und prüft serverseitig erneut `can_play`
- `endSession(summary)`: beendet die Sitzung
- `ui`: gemeinsame Grundelemente (Zurück zur Bibliothek, Ton an/aus, Pause)

Das Spiel erhält keine Namen, keine Lizenzdaten und keine Daten anderer Schüler.

## Konfiguration, die mit dem Spiel wächst

- Jedes Spiel definiert sein eigenes Konfigurationsschema (Zod) mit `schemaVersion`.
- Einfache Einstellungen liegen als JSONB in `game_configs` (Scope: global, Lehrkraft, Gruppe,
  Schüler; das Spiel legt fest, welche Scopes erlaubt sind).
- Umfangreiche Inhalte (z. B. Wortlisten mit Bildern) bekommen eigene Tabellen im Schema
  `game_<slug>` mit Fremdschlüsseln und RLS.
- Neue Einstellungen: neue Schemaversion + Migrationsfunktion alt → neu; alte Sitzungen bleiben
  über den Konfigurations-Snapshot nachvollziehbar.
- Die Adminmaske wird pro Spiel gebaut (kein generischer Einheitsbereich), nutzt aber
  gemeinsame Formular-Bausteine.
- Validierung immer serverseitig vor dem Speichern.

## Medien

- Spielgrafiken, die Teil des Spiels sind: im Repository unter `media/`.
- Hochgeladene Inhalte (Admin/Lehrkraft): privater Supabase-Storage-Bucket je Spiel, Pfad
  `<game>/<scope>/<uuid>`; Auslieferung nur über kurzlebige signierte URLs nach Rechteprüfung.
- Upload über den Server: erlaubte Typen pro Spiel (Whitelist), Größenlimit, Prüfung der
  Dateisignatur, Bilder werden neu kodiert (Metadaten entfernt), kein SVG aus Uploads,
  Prüfsumme gespeichert.
- Löschung: Asset wird gelöscht, wenn der Inhalt gelöscht wird oder die Aufbewahrungsfrist endet.

## Statistikmodell (Architekturebene)

Gemeinsame Grundlage, kein starres Kennzahlenmodell:

1. **Sitzungen** (`game_sessions`): wer, welches Spiel, welche Version und Konfiguration, Beginn, Ende.
2. **Ereignisse** (`game_events`): Typ + Nutzdaten, vom Spiel definiert und versioniert
   (`eventSchemaVersion`), nur anhängen.
3. **Kennzahlen** werden pro Spiel aus Ereignissen berechnet (SQL-Views oder Funktionen im
   Spiel-Schema), damit sie reproduzierbar sind. Bei Bedarf materialisierte Tagesaggregate.
4. **Zeitbegriffe** sind pro Spiel festgelegt: aktive Bearbeitungszeit (Zeit mit sichtbarer
   Aufgabe, Pausen/Inaktivität > N s abgezogen) vs. Sitzungsdauer.
5. **Ansichten der Lehrkraft**: gemeinsame Filter (Schüler, Spiel, Zeitraum, Sitzung) von der
   Plattform; Inhalte der Auswertung liefert das Spiel.
6. **Aufbewahrung**: Rohereignisse kürzer (Vorschlag 12 Monate), Aggregate länger, Löschung
   nach `DATA-PROTECTION.md`.

Pro neuem Spiel wird mit Alois festgelegt: relevante Ereignisse, gespeicherte Daten, Kennzahlen,
Lehrkraft-Ansicht, Zeitvergleich, Datensparsamkeit, Aufbewahrung, Tests.

## Neues Spiel hinzufügen (Verfahren)

1. Beschreibung von Alois analysieren: Lernziel, Mechanik, Inhalte, Einstellungen, Medien, Statistik.
2. Kurzkonzept + Design-Entwurf zur Freigabe.
3. Modul anlegen (Manifest, Schema, Migration mit RLS), Logik, Spieloberfläche, Adminmaske,
   Statistik.
4. Tests: Logik, Konfigurationsvalidierung, RLS des Spiel-Schemas (negativ), E2E Start nur mit Lizenz.
5. Doku in diesem Ordner ergänzen (`docs/games/<slug>.md`).
