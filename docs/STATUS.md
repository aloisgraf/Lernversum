# Projektstand

**Zuletzt aktualisiert:** 2026-10-21

## Stand

- Phase 1 (Architekturplanung) als Entwurf fertig; E-8 und E-14 offen.
- Phase 2a (technisches Grundgerüst) umgesetzt und mit Freigabe committed. Noch keine
  Benutzer, Rollen oder Tabellen.
- Lokal geprüft: Lint, Typprüfung, Format, 4 Unit-Tests, Build, 9 End-to-End-Tests
  (3 Bildschirmgrößen), Abhängigkeitsprüfung ohne Befund. RLS-Basistest in einem
  Supabase-Postgres-Container ausgeführt (positiv und negativ). Der volle lokale
  Supabase-Stack ließ sich in der Cloud-Umgebung nicht starten (Docker-Hub-Limit); er läuft in der CI.
- Automatisch geprüft (CI-Lauf 38643739725, Commit e5bdfb3): alle 6 Jobs grün – Lint/Typen/Unit/Build
  unter Ubuntu, macOS und Windows, Datenbanktests mit vollem lokalem Supabase-Stack (pgTAP),
  End-to-End (Playwright), Abhängigkeitsprüfung.
- Dokumentation am 2026-10-14 mit Freigabe von Alois committed (Branch `claude/project-thread-xulmv5`).
- Sicherheits- und Datenschutz-Audit Nr. 1 durchgeführt (`SECURITY-AUDIT.md`, `FREIGABE-CHECKLISTE.md`):
  kein kritischer Befund; Maßnahmen zu K-01 bis K-03 freigegeben (D-017), übrige Maßnahmen offen.

## Entscheidungen vor Entwicklungsbeginn

| Nr. | Frage | Ergebnis |
| --- | --- | --- |
| E-1 | Zugang für Eltern und Therapeuten in V1 | Online-Kauf in Selbstbedienung; Admin kann zusätzlich anlegen (D-018) |
| E-2 | Schulen und Zuordnung | Schulen optional, Lehrkraft in 0..n Schulen; Schüler gehört einer Lehrkraft (D-014) |
| E-3 | App-Hosting | EU-Container-Hoster (D-011) |
| E-4 | Datenbank | Supabase Cloud Frankfurt nach Vertragsprüfung (D-011) |
| E-5 | Ablauf Lehrkraftlizenz | Spielen gesperrt, 90 Tage lesend, dann Löschung (D-011) |
| E-6 | Aufbewahrungsfristen | 12 Monate Rohereignisse und Logs, Konten 90 Tage nach Lizenzende (D-011) |
| E-7 | Admin-Zugriff auf Lerndaten | nur begründet, befristet, protokolliert (D-011) |
| E-8 | Datenschutzrechtlich Verantwortlicher | **offen**, wird von Alois geklärt; muss vor Produktivbetrieb feststehen |
| E-9 | Klassen/Gruppen | optional (D-011) |
| E-10 | Inhalte je Spiel oder gemeinsam | zuerst je Spiel (D-011) |
| E-11 | Repository | privat (D-011) |
| E-12 | Windows mit WSL 2 | ja (D-011) |
| E-13 | Schüler- und Elternzugang | Aktivierungscode, danach `vorname.nachname` + eigenes Passwort (D-014, D-015) |
| E-14 | Benutzername der Eltern | **offen**, wird von Alois nachgereicht; Empfehlung: `eltern.vorname.nachname` des Kindes |

## Offen

- E-8 (blockiert nur den Produktivbetrieb, nicht die Entwicklung).
- Anbieterprüfung Hosting (`DEPLOYMENT.md`).

## Nächste Schritte

1. Weitere Audit-Maßnahmen (`SECURITY-AUDIT.md`, Abschnitt 7) zur Freigabe vorlegen, vor allem
   Branch-Schutz (A-04) und Erweiterung des RLS-Basistests (A-01 bis A-03) vor der ersten Migration.
2. Benutzer- und Rollenmodell klären (`ACCOUNT-FLOWS.md`), inkl. E-14 und Lizenzfragen L-2 bis L-7 (D-018).
3. Danach Phase 2b: Login, Rollen, Konten laut `ROADMAP.md`, inklusive D-017.
