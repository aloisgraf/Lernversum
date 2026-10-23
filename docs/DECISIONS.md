# Entscheidungen

Status: **verbindlich** (von Alois bestätigt), **vorläufig** (Vorschlag) oder **ersetzt**.
Vorläufige Entscheidungen zu Sicherheit, Datenmodell, Kosten, Lizenzen oder Grundarchitektur
sind keine Grundlage für Implementierung. Größere Entscheidungen bekommen später eigene ADRs
in `docs/adr/`.

## D-001 Projektregeln — verbindlich (2026-10-14)

Die Entwicklungsregeln von Alois gelten für das gesamte Projekt (Kurzfassung `CLAUDE.md`).

## D-002 Master-Prompt als fachliche Grundlage — verbindlich (2026-10-14)

Rollen Admin/Lehrkraft/Schüler, drei Lizenzebenen, Spiele als Produktmodule, EU-Hosting.

## D-003 Tech-Stack — vorläufig

Next.js + TypeScript, Supabase (Postgres, RLS, Auth, Storage), Zod, Tailwind + Radix, Vitest,
pgTAP, Playwright, pnpm, GitHub Actions. Begründung und verworfene Alternativen:
`ARCHITECTURE.md` Abschnitt 1.

## D-004 Lizenzpläne statt verteilter Limits — vorläufig

Limits stehen in `license_plans` und werden nur in SQL-Funktionen geprüft.

## D-005 Zugriffsprüfung in einer SQL-Funktion `can_play` — vorläufig

Genutzt bei Bibliothek, Sitzungsstart und jedem Ereignis.

## D-006 Statistik als Sitzungen + versionierte Ereignisse, Kennzahlen pro Spiel — vorläufig

## D-007 Spielspezifische Daten in eigenem DB-Schema `game_<slug>` — vorläufig

## D-008 Hosting: Supabase Cloud Frankfurt + App-Container bei EU-Hoster — Richtung verbindlich (D-011), Anbieterprüfung offen

## D-009 Zugang in Version 1: Admin legt Lehrkräfte an — teilweise ersetzt durch D-018 (2026-10-21)

Keine Selbstregistrierung und keine Zahlung in V1. Eltern und Lerntherapeuten werden als
Lehrkraft mit eigenem Lizenzplan angelegt (z. B. „Eltern“: max. 1 Schüler, keine Gruppen).
Online-Kauf kann später einen geprüften Zahlungs-Webhook als Ersatz für den Admin-Schritt ergänzen.

## D-010 Einrichtungen mit Schulcode — ersetzt durch D-012

## D-012 Schüler mit mehreren Lehrkräften, Schulen optional — ersetzt durch D-014 (Schulen bleiben optional)

Ein Schüler hat ein Konto und kann mit mehreren Lehrkräften verknüpft sein. Lehrkräfte haben einen
eindeutigen Lehrercode und gehören zu keiner, einer oder mehreren Schulen. Jede Lehrkraft sieht nur
Daten aus ihren eigenen Freischaltungen. Verknüpfungsablauf und Schüler-Login: Entwurf/offen (E-13, E-14).

## D-011 Weitere Festlegungen — verbindlich (2026-10-14)

- App-Hosting bei einem EU-Container-Hoster statt Vercel (E-3); Supabase Cloud Frankfurt nach
  Vertragsprüfung (E-4). Konkrete Anbieter erst nach Prüfung der Bedingungen.
- Ablauf Lehrkraftlizenz: Spielen gesperrt, Lehrkraft 90 Tage nur lesend, dann Löschung (E-5).
- Fristen: Rohereignisse 12 Monate, Logs 12 Monate, Konten 90 Tage nach Lizenzende (E-6).
- Admin-Zugriff auf Lerndaten nur mit Begründung, befristet, protokolliert (E-7).
- Klassen/Gruppen optional (E-9).
- Inhalte zuerst je Spiel, da jedes Spiel andere Anforderungen hat (E-10).
- Repository privat (E-11). Windows-Entwicklung mit WSL 2 (E-12).

## D-013 Schüler-Login mit eigenem Login-Namen — ersetzt durch D-014

Eindeutiger Login-Name + Passwort, unabhängig von Lehrkräften und Schulen. Lehrercodes dienen nur
zum Verknüpfen.

## D-014 Ein Lehrer pro Schüler, Code-Login, Elternzugang — verbindlich (2026-10-14)

Ersetzt D-012 und D-013. Die Lehrkraft legt ihre Klasse und Schüler an. Jeder Schüler erhält einen
Schülercode zum Anmelden; gleichzeitig wird ein Elterncode erzeugt, mit dem die Eltern nur lesend
den Fortschritt ihres Kindes sehen. Ein Schüler gehört vorerst genau einer Lehrkraft und seinen
Eltern. Mehrere Lehrkräfte pro Schüler bleiben als spätere Erweiterung möglich.

## D-015 Aktivierung per Code, danach Benutzername + eigenes Passwort — verbindlich (2026-10-14)

Ergänzt D-014. Schüler- und Elterncode werden einmal eingelöst. Danach meldet sich der Schüler mit
`vorname.nachname` und selbst gewähltem Passwort an. Benutzername der Eltern: Vorschlag
`eltern.vorname.nachname` des Kindes (noch zu bestätigen).

## D-016 Werkzeugversionen im Grundgerüst — verbindlich (2026-10-14)

- Node 22 LTS, pnpm 10 (über Corepack), Next.js 16.3, React 19, Tailwind 4, Zod 4.
- TypeScript 5 statt 7: `typescript-eslint` unterstützt TypeScript 7 noch nicht.
- ESLint 9 statt 10: `eslint-plugin-react` (über `eslint-config-next`) läuft noch nicht mit ESLint 10.
- Paketversionen müssen mindestens 14 Tage alt sein (`minimumReleaseAge`).
- Kein `output: "standalone"` vorerst; kommt mit dem Docker-Deployment.

## D-017 Anmeldeschutz, Sperrwirkung und Admin-2FA — verbindlich (2026-10-15)

Aus dem Sicherheitsaudit (`SECURITY-AUDIT.md`, K-01 bis K-03). Umsetzung mit Phase 2b.

- **Anmeldeschutz (K-01):** Schüler und Eltern melden sich nur über einen eigenen Server-Endpunkt
  an; der direkte Passwort-Login gegen die Supabase-Auth-API wird für sie unterbunden. Je
  Benutzername nach 5 Fehlversuchen 1 Minute Wartezeit, danach jeweils doppelt so lang, höchstens
  15 Minuten, keine Dauersperre. Je IP-Adresse 100 Versuche in 5 Minuten. Zähler in einer
  Postgres-Tabelle (keine neue Infrastruktur). Passwörter: Kinder mindestens 8, Eltern mindestens
  12 Zeichen, keine häufigen Passwörter, nicht der eigene Benutzername. Gleiche Fehlermeldung für
  falschen Namen und falsches Passwort; Fehlversuche nur mit IDs protokolliert.
- **Sperrwirkung (K-02):** Rolle, Konto- und Lizenzstatus werden in RLS, `can_play` und
  Server-Code immer aus den Tabellen gelesen; der Rollen-Claim im Token dient nur der Oberfläche.
  Zugriffstoken gelten 10 Minuten (`jwt_expiry = 600`). Sperre und neuer Aktivierungscode beenden
  alle Sitzungen.
- **Admin-2FA (K-03):** Alle Admin-Policies und Admin-Funktionen verlangen `aal2`. TOTP ist in
  Staging und Produktion aktiviert und für Admins Pflicht.
- **Abnahme:** Tests T-K1-1 bis T-K3-2 laut `SECURITY-AUDIT.md`, Abschnitt 8, in CI grün.

## D-018 Lizenzpakete, Laufzeiten und Einzelanmeldung — vorläufig (2026-10-21)

Vorgabe von Alois; Details in `ACCOUNT-FLOWS.md`, Abschnitte 0, 2a und 4a.

- Pakete: Elternlizenz (1 Kind), Lerntherapie (6, 12 oder 20 Kinder), Schule/Lehrperson
  (20 Kinder). Laufzeiten 3, 6 oder 12 Monate. Umsetzung über `license_plans`.
- Bei der Elternlizenz ist der Elternteil Lizenznehmer und legt sein Kind selbst an.
- Je Konto höchstens eine aktive Sitzung; Weitergabe der Zugangsdaten kann zur Sperre führen
  (AGB).
- **Online-Kauf in Selbstbedienung (von Alois entschieden, 2026-10-21):** Privatpersonen und
  Unternehmen kaufen ihre Lizenz online; Konto und Lizenz entstehen erst nach vom
  Zahlungsanbieter bestätigter Zahlung. Ersetzt in D-009 „keine Selbstregistrierung, keine
  Zahlung in V1“. Der Admin kann weiterhin manuell anlegen.
- Zahlungsanbieter ist neue Infrastruktur: Auswahl mit Kosten, AVV und Anbieterbindung wird
  hier dokumentiert, bevor er eingebunden wird (L-5).
- Offene Punkte L-2 bis L-7 in `ACCOUNT-FLOWS.md`; erst danach insgesamt verbindlich.

## Ersetzt

- Früheres Konzept „Elternlizenz / Therapeutenlizenz mit Kauf“ und „Themenstruktur mit
  gemeinsamer Wortliste je Thema“: durch D-002 ersetzt bzw. offen (siehe `STATUS.md`, E-1, E-10).
- Frühere Empfehlung Vercel-Hosting: durch D-008 ersetzt (EU-Anforderung).
