# Projektstand

**Zuletzt aktualisiert:** 2026-10-14

## Stand

- Phase 1 (Architekturplanung) als Entwurf fertig; E-8 und E-14 offen.
- Kein Code, keine Migrationen, keine Tests ausgeführt (nichts zu testen).
- Dokumentation am 2026-10-14 mit Freigabe von Alois committed (Branch `claude/project-thread-xulmv5`).

## Entscheidungen vor Entwicklungsbeginn

| Nr. | Frage | Ergebnis |
| --- | --- | --- |
| E-1 | Zugang für Eltern und Therapeuten in V1 | Admin legt an, keine Zahlung (D-009) |
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

1. Freigabe der Planung durch Alois; E-14 nachreichen.
2. Phase 2 (Grundplattform) laut `ROADMAP.md`.
