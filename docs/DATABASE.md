# Datenbank

**Stand:** Entwurf Phase 1, keine Migrationen. PostgreSQL (Supabase).

## Regeln

- Nur versionierte Migrationen (`supabase/migrations/`), erzeugt mit der Supabase-CLI.
- Jede Tabelle im Schema `public` und in Spiel-Schemas hat RLS aktiviert; ohne Policy ist alles verboten.
- Fremdschlüssel, `CHECK`-Constraints, Indizes auf allen Fremdschlüsseln und Filterspalten.
- Kernaktionen (Schüler anlegen, freischalten, Sitzung starten) als SQL-Funktionen in einer
  Transaktion, Limits mit Sperre (`SELECT … FOR UPDATE`) gegen parallele Anlage.
- Destruktive Änderungen nur mit Migrationskonzept und Backup; zuerst lokal, dann Staging.
- Zeitangaben immer `timestamptz` (UTC).
- RLS-Policies und Funktionen werden mit pgTAP getestet, inklusive negativer Fälle.

## Plattform-Tabellen (Schema `public`)

| Tabelle | Wichtige Spalten | Beziehung | Zugriff (RLS, Kurzform) |
| --- | --- | --- | --- |
| `profiles` | id (= auth.users.id), role, display_name, status | 1:1 Auth-Konto | eigene Zeile lesen; Rolle/Status nur Admin-Funktionen |
| `schools` | id, name, status | optional | Admin schreibt; Lehrkraft liest eigene |
| `teachers` | profile_id, created_by | → profiles | Admin; Lehrkraft sich selbst |
| `school_teachers` | school_id, teacher_id | n:m, optional | Admin |
| `license_plans` | id, name, max_students, max_groups, max_grant_days, allowed_game_ids, features (jsonb) | | Admin schreibt; Lehrkraft liest eigenen Plan |
| `teacher_licenses` | id, teacher_id, plan_id, valid_from, valid_until, status, overrides (jsonb) | → teachers, license_plans | Admin; Lehrkraft liest eigene |
| `students` | profile_id, teacher_id, first_name, last_name, username (unique), status | → profiles, teachers | Lehrkraft nur eigene; Schüler sich selbst; Eltern lesen Anzeigenamen des eigenen Kindes |
| `parent_access` | profile_id, student_id (unique), username (unique), status |
| `activation_codes` | id, target (student / parent), target_id, code_lookup (unique), code_hash, expires_at, used_at | → students oder parent_access | nur Server-Funktionen; Lehrkraft sieht Status für eigene Schüler | → profiles, students; genau ein Elternzugang je Schüler | Lehrkraft des Kindes verwaltet; Eltern lesen nur eigene Zeile |
| `student_access` | student_id, valid_from, valid_until, status | → students | Lehrkraft eigene; Schüler liest eigene |
| `groups` | id, teacher_id, name | → teachers | Lehrkraft nur eigene |
| `group_members` | group_id, student_id | → groups, students; gleiche Lehrkraft per Trigger geprüft | Lehrkraft nur eigene |
| `games` | id (slug), version, title, description, status (active/inactive), visibility, config_version, required_license | Spielregistrierung | alle lesen aktive (Katalog); Admin schreibt |
| `game_licenses` | id, student_id, game_id, teacher_id, valid_from, valid_until, status | → students, games, teachers | Lehrkraft nur eigene Schüler; Schüler liest eigene; Eltern lesen die des eigenen Kindes |
| `game_configs` | id, game_id, scope (global / teacher / group / student), scope_id, schema_version, config (jsonb) | → games | Admin global; Lehrkraft eigener Scope, wenn Spiel es erlaubt |
| `media_assets` | id, owner_scope, game_id, storage_path, mime, size, sha256, status | → games | nach Scope; Auslieferung nur über signierte URLs |
| `game_sessions` | id, student_id, game_id, game_license_id, game_version, config_snapshot_id, started_at, ended_at | → students, games, game_licenses | Schüler schreibt eigene über `start_game_session`; Lehrkraft liest eigene Schüler; Eltern lesen eigenes Kind |
| `game_events` | id, session_id, type, payload (jsonb), event_schema_version, occurred_at | → game_sessions | einfügen nur bei gültiger Freischaltung der Sitzung; nie ändern; Lesen wie Sitzung |
| `platform_settings` | key, value (jsonb) | | Admin |
| `audit_log` | id, actor_id, action, target_type, target_id, reason, created_at | | nur anhängen; Admin liest |

Spielspezifische Inhalte und Statistik-Tabellen liegen in einem eigenen Schema je Spiel
(`game_<slug>`), mit eigenen Migrationen und RLS (siehe `GAME-MODULES.md`).

## Wichtige Beziehungen

```
schools n─m teachers (school_teachers, optional)
teachers 1─n teacher_licenses n─1 license_plans
teachers 1─n students 1─1 parent_access
students 1─n student_access
teachers 1─n groups n─m students (group_members)
students 1─n game_licenses n─1 games   (game_licenses.teacher_id = vergebende Lehrkraft)
game_licenses 1─n game_sessions 1─n game_events
games 1─n game_configs, media_assets
```

## Aktivierung und Anmeldung

Aktivierungscodes bestehen aus einem Suchteil (`code_lookup`) und einem geheimen Teil, gespeichert
nur als Hash. Bei der Aktivierung prüft eine Server-Funktion Code, Ablauf und `used_at`, setzt
das selbst gewählte Passwort im Auth-Konto (interne, nicht zustellbare Kennung, angemeldet wird
per Benutzername) und markiert den Code als verbraucht, alles in einer Transaktion.

## Pseudonymisierung

Statistik-Tabellen referenzieren nur `student_id` (UUID), nie Namen. Namen stehen nur in
`students`/`profiles` und sind nur für die Lehrkraft und die Eltern des Kindes lesbar. Auswertungen über
mehrere Schüler (Admin, Plattformstatistik) laufen nur aggregiert.

## Offen

- Endgültige Spalten nach Freigabe; Spiel-Schemas erst mit dem jeweiligen Spiel.
- Ob Konfiguration je Gruppe/Schüler überschreibbar sein soll (vorgesehen, aber optional).
