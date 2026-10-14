# Architektur

**Stand:** Planung Phase 1 (2026-10-14), noch kein Code. Alles hier ist **vorläufig**, bis Alois
die Planung freigibt. Entscheidungen mit Begründung: `DECISIONS.md`.

Inhalt: 1. Technologieentscheidung · 2. Architekturübersicht · 3. Rollen und Lizenzen ·
4. Lehrkraft- und Schülerverwaltung · 5. Zugriffsprüfung · 6. Ablauf einer Lehrkraftlizenz.
Weitere Teile: Datenmodell `DATABASE.md`, Spiele und Statistik `GAME-MODULES.md`, Design
`DESIGN-SYSTEM.md`, Sicherheit `SECURITY.md`, Datenschutz `DATA-PROTECTION.md`, Hosting
`DEPLOYMENT.md`, Entwicklung `DEVELOPMENT.md`, Plan `ROADMAP.md`, offene Entscheidungen `STATUS.md`.

## 1. Technologieentscheidung

| Baustein | Wahl | Begründung | Verworfen |
| --- | --- | --- | --- |
| Sprache | TypeScript (strict) überall | ein Typsystem für Frontend, Server, Spiele | JavaScript ohne Typen |
| Web-Framework | Next.js (App Router) mit React | Server-Komponenten und Server Actions halten Prüfungen und Schlüssel auf dem Server; großes Ökosystem; als Node-Server selbst hostbar | SPA ohne Server (Prüfungen nur in der DB, kein sicherer Ort für Admin-Aktionen); Remix/SvelteKit (kleinere Auswahl an Bausteinen) |
| Datenbank | PostgreSQL über Supabase | RLS, Auth, Storage und lokale Entwicklung aus einer Hand; Postgres bleibt portabel | eigenes Backend mit eigener Auth (deutlich mehr Sicherheitsaufwand); Firebase (kein SQL/RLS, US-zentriert) |
| Authentifizierung | Supabase Auth | in RLS integriert (`auth.uid()`), Self-Hosting möglich | Auth.js mit eigener Sitzungsverwaltung (RLS-Anbindung selbst bauen) |
| Dateien | Supabase Storage (privat) | Zugriff über RLS-Policies und kurzlebige signierte URLs | öffentliche Buckets, Dateien in der DB |
| Validierung | Zod | ein Schema für Formular, Server und Spielkonfiguration | mehrere Validierungsschichten |
| UI | Tailwind CSS, Radix-Primitives, eigene Komponenten | barrierearme Grundbausteine, Design-Tokens als CSS-Variablen | schwere UI-Kits mit fremdem Look |
| Animation | Framer Motion; Canvas/PixiJS nur wenn ein Spiel es braucht | genügt für die meisten Lernspiele | Game-Engine als Standard |
| Tests | Vitest (Unit), pgTAP über `supabase test db` (RLS und DB-Funktionen), Playwright (E2E) | Rechte werden direkt in der DB negativ getestet | nur UI-Tests |
| Paketmanager | pnpm über Corepack, Node LTS gepinnt | reproduzierbar unter Windows und macOS | npm ohne Lockfile-Disziplin |
| CI | GitHub Actions | Lint, Typprüfung, Tests, DB-Tests bei jedem PR | |

Supabase ist nach Prüfung geeignet, weil RLS die Pflicht-Sicherheitsgrenze direkt in der
Datenbank liefert und der ganze Stack auch selbst gehostet werden kann (Ausstieg möglich).
Restbindung: Supabase-Auth-Tabellen und Storage-API. Hostingwahl: `DEPLOYMENT.md`.

## 2. Architekturübersicht

```
Browser (Admin / Lehrkraft / Schüler)
   │ HTTPS
Next.js-Server (EU)
   ├─ app/(admin)      Adminbereich
   ├─ app/(teacher)    Lehrkraftbereich
   ├─ app/(student)    Schülerbereich, Spielebibliothek
   ├─ platform/        zentrale Dienste: auth, rollen, lizenzen, schüler, klassen,
   │                   spielkatalog, medien, statistik-basis, audit
   ├─ games/<spiel>/   Spielmodule (Manifest, Spiel, Admin, Config, Medien, Statistik, Tests)
   └─ ui/              Designsystem
   │ Postgres-Protokoll / Supabase-API mit Nutzer-JWT
Supabase (EU): Postgres + RLS, Auth, Storage
```

Grundregeln:

- **Zwei Sicherheitsebenen:** Server-Code prüft Rolle und Berechtigung; RLS erzwingt dasselbe in
  der Datenbank. Fällt eine Ebene, hält die andere.
- **Normaler Zugriff mit Nutzer-JWT.** Der Service-Role-Schlüssel wird nur in wenigen, eng
  begrenzten Server-Funktionen benutzt (Konto anlegen, Admin-Einrichtung), jede mit Audit-Eintrag.
- **Lizenz- und Rechtelogik liegt ausschließlich in `platform/` und in SQL-Funktionen.** Spiele
  rufen nur die Plattform-Schnittstelle auf (`GAME-MODULES.md`).
- **Schreibende Kernaktionen laufen über SQL-Funktionen** (z. B. `grant_game_license`), damit
  Prüfung und Änderung in einer Transaktion passieren.

## 3. Rollen und Lizenzen

### Rollen

| Rolle | Wird angelegt von | Anmeldung | Darf |
| --- | --- | --- | --- |
| Plattformadministrator | abgesicherter Einrichtungsprozess (CLI-Skript mit Einmal-Token), danach von anderen Admins | E-Mail + Passwort + 2FA | Schulen anlegen (optional), Lehrkräfte Schulen zuordnen, Lehrkräfte und Lehrkraftlizenzen verwalten, Spiele aktivieren, Spielmodule administrieren, globale Einstellungen, Protokolle, Lösch- und Auskunftsprozesse |
| Lehrkraft | nur Admin | E-Mail + Passwort | eigene Schüler und Klassen, Freischaltungen, Statistiken der eigenen Schüler, Codes erzeugen und erneuern, spielbezogene Einstellungen soweit freigegeben |
| Schüler | nur die eigene Lehrkraft | einmal Aktivierungscode, danach Benutzername + Passwort | freigeschaltete Spiele spielen, eigene einfache Fortschrittsanzeige |
| Eltern | automatisch mit dem Schüler | einmal Elterncode, danach Benutzername + Passwort | nur lesen: Fortschritt des eigenen Kindes |

Die Rolle steht in `profiles.role`, ist per RLS für Nutzer nicht schreibbar und wird zusätzlich
als Claim im JWT gespiegelt (Custom Access Token Hook), damit RLS ohne Zusatzabfrage prüft.
Maßgeblich bleibt die Tabelle.

Admin-Zugriff auf Lern- und Leistungsdaten ist standardmäßig **nicht** möglich. Für begründete
Fälle (Support, Auskunft, Löschung) gibt es eine Funktion mit Pflicht-Begründung und
Audit-Eintrag, zeitlich begrenzt.

### Drei Lizenzebenen

| Ebene | Tabelle | Vergeben von | Inhalt |
| --- | --- | --- | --- |
| Lehrkraftlizenz | `teacher_licenses` | Admin | Gültig von/bis, Status, Limits aus einem **Lizenzplan** |
| Plattformzugang des Schülers | `student_access` | Lehrkraft (innerhalb ihrer Lizenz) | Gültig von/bis, Status (aktiv, gesperrt, entzogen) |
| Spiellizenz | `game_licenses` | Lehrkraft | Schüler, Spiel, Beginn, Ende, Status, vergebende Lehrkraft |

**Lizenzpläne** (`license_plans`) bündeln die Limits an einer Stelle: max. Schüler, max. Klassen,
erlaubte Spiele, max. Dauer einer Freischaltung, weitere Feature-Flags (JSONB mit Zod-Schema).
Eine Lehrkraftlizenz verweist auf einen Plan; Admins können einzelne Werte pro Lizenz
überschreiben. Limits werden nur in SQL-Funktionen geprüft, nie verteilt im Code.

### Eltern, Lerntherapeuten, Nachhilfe

Eltern sind eine eigene, rein lesende Rolle, die zu genau einem Schüler gehört (D-014). Ein
Lerntherapeut oder Nachhilfelehrer ist eine Lehrkraft mit eigenem Lizenzplan. Ein späterer
Online-Kauf ersetzt nur den Schritt „Admin legt Lehrkraft und Lizenz an“ durch einen geprüften
Zahlungs-Webhook; für Version 1 legt der Admin an, ohne Zahlung (D-009).

## 4. Lehrkraft-, Schüler- und Elternverwaltung

Grundgedanke (D-014): Ein Schüler gehört **vorerst genau einer Lehrkraft** und hat **einen
Elternzugang**. Schüler und Eltern aktivieren ihren Zugang einmal mit einem Code und melden
sich danach mit Benutzername und selbst gewähltem Passwort an (D-015).

- **Schulen (optional, Admin):** Der Admin kann Schulen anlegen und Lehrkräfte zuordnen. Eine
  Lehrkraft kann zu keiner, einer oder mehreren Schulen gehören. Gleiche Schule heißt **nicht**,
  dass Lehrkräfte gegenseitig Schüler oder Daten sehen.
- **Lehrkraft anlegen (Admin):** Server-Funktion legt Auth-Konto an, verschickt Einladungslink
  (Passwort setzt die Lehrkraft selbst), legt Profil und Lizenz an. Keine öffentliche Registrierung.
- **Klasse anlegen (Lehrkraft):** Die Lehrkraft legt ihre Klasse bzw. Lerngruppe an und darin
  ihre Schüler, einzeln oder als Liste. Klassen sind optional.
- **Schüler anlegen (Lehrkraft):** Eine Server-Funktion prüft Lizenz und Schülerlimit in einer
  Transaktion und erzeugt in einem Schritt:
    - das Schülerkonto (Vorname, Nachname, keine E-Mail) mit **Aktivierungscode**,
    - den Elternzugang mit eigenem **Elterncode**.
- **Codes:** einmalige Aktivierungscodes, zufällig, ohne verwechselbare Zeichen, z. B.
  `K7QM-4TXR-9WPD` (ca. 60 Bit), gültig für eine begrenzte Zeit (Vorschlag 30 Tage). Die
  Lehrkraft druckt sie als **Zugangskarte mit QR-Code** (eine für das Kind, eine für die Eltern).
  Gespeichert wird nur ein Hash. Nach der Aktivierung ist der Code verbraucht.
- **Aktivierung:** Nach Eingabe des Codes zeigt das System den **Benutzernamen** und der Nutzer
  wählt sein **Passwort** selbst (zweimal eingeben, kindgerechte Mindestregeln).
    - Schüler: `vorname.nachname` (klein, Umlaute umgeschrieben: `jürgen.öz` → `juergen.oez`).
      Gibt es den Namen schon, wird eine Zahl angehängt (`max.mueller2`).
    - Eltern: Vorschlag `eltern.vorname.nachname` des Kindes, damit keine Elternnamen gespeichert
      werden müssen.
- **Passwort vergessen:** Kinder und Eltern haben keine E-Mail im System. Die Lehrkraft erzeugt
  einen neuen Aktivierungscode; der Benutzername bleibt, das Passwort wird neu gesetzt und alle
  Sitzungen enden.
- **Eltern:** sehen nur lesend den Fortschritt ihres Kindes (Übersicht pro Spiel, Verlauf).
  Sie sehen keine anderen Kinder, keine Lehrkraftdaten, keine Verwaltung. Ein Elterncode pro
  Kind; mehrere Elternteile teilen ihn (später ausbaubar).
- **Sperren/Zurücksetzen:** Lehrkraft kann Schüler- und Elternzugang getrennt sperren oder einen
  neuen Aktivierungscode erzeugen; laufende Sitzungen werden widerrufen und protokolliert.
- **Freischalten:** Lehrkraft wählt Schüler, Spiel, Beginn, Ende; Funktion prüft Lehrkraftlizenz,
  Plan (Spiel erlaubt, Dauer zulässig), Zuständigkeit und Spielstatus.
- **Übersicht:** aktive, bald auslaufende (konfigurierbar, z. B. 14 Tage) und abgelaufene
  Freischaltungen.
- **Erweiterbar:** Freischaltungen und Spielsitzungen speichern schon jetzt die vergebende
  Lehrkraft. Mehrere Lehrkräfte pro Schüler (z. B. Schule und Nachhilfe) lassen sich später mit
  einer Verknüpfungstabelle ergänzen, ohne Statistikdaten umzubauen.

## 5. Verbindliche Zugriffsprüfung

Eine SQL-Funktion `can_play(student_id, game_id)` (SECURITY DEFINER, festes `search_path`) prüft
alle sechs Bedingungen des Master-Prompts und gibt die gültige Freischaltung zurück:

1. Schülerkonto aktiv
2. zuständige Lehrkraft aktiv und Lehrkraftlizenz gültig
3. gültiger Plattformzugang des Schülers
4. gültige Spiellizenz für das Spiel (Zeitraum, Status)
5. Spiel zentral aktiviert und sichtbar
6. Lehrkraft darf diese Freischaltung verwalten (Spiel im Plan erlaubt)

Verwendet wird sie bei der Bibliothek, beim **Start einer Spielsitzung** (die Sitzung speichert
die Freischaltung) und bei **jedem Speichern von Spielereignissen**. Eine abgelaufene Lizenz
stoppt damit auch laufende Sitzungen und direkte API-Aufrufe. Elternzugänge können nie spielen
und nie schreiben.

## 6. Ablauf einer Lehrkraftlizenz (konfigurierbar)

Einstellung in `platform_settings`, vorgeschlagene Standardwerte:

| Daten | Verhalten bei Ablauf |
| --- | --- |
| Lehrkraft | Login möglich, aber nur Lesezugriff und Hinweis; keine neuen Schüler oder Freischaltungen |
| Schülerkonten | bleiben bestehen, Spielen gesperrt (Hinweis „Freischaltung abgelaufen“) |
| Elternzugänge | bleiben lesend während der Nachfrist, dann gelöscht wie die Statistiken |
| Spiellizenzen | bleiben gespeichert, gelten aber nicht (Prüfung 2 greift) |
| Statistiken | bleiben für die Lehrkraft lesbar während einer Nachfrist (z. B. 90 Tage), danach Löschung nach `DATA-PROTECTION.md` |
| Verlängerung | stellt alles ohne Datenverlust wieder her |

Diese Standardwerte sind entschieden (D-011). Alternative Einstellungen bleiben konfigurierbar:
„sofort sperren, auch Lesezugriff“; „Schüler dürfen bis Ende der laufenden Spiellizenz weiterspielen“.
