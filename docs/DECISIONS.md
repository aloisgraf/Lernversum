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

## D-009 Zugang in Version 1: Admin legt Lehrkräfte an — verbindlich (2026-10-14)

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

## Ersetzt

- Früheres Konzept „Elternlizenz / Therapeutenlizenz mit Kauf“ und „Themenstruktur mit
  gemeinsamer Wortliste je Thema“: durch D-002 ersetzt bzw. offen (siehe `STATUS.md`, E-1, E-10).
- Frühere Empfehlung Vercel-Hosting: durch D-008 ersetzt (EU-Anforderung).
