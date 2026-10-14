# Lernversum

Modulare Lernplattform für Kinder: Administratoren verwalten Lehrkräfte und Lizenzen,
Lehrkräfte legen Schüler an und schalten Lernspiele zeitlich begrenzt frei, Schüler spielen
in einer kindgerechten Spielebibliothek.

**Stand:** Technisches Grundgerüst (Phase 2a). Noch keine Benutzer, Rollen oder Spiele.

## Schnellstart

Voraussetzungen: Node.js 22, Docker, Git. Unter Windows WSL 2.

```
corepack enable
pnpm install
cp .env.example .env.local
pnpm db:start
pnpm dev
```

Ausführliche Anleitung für Windows und macOS: `docs/DEVELOPMENT.md`.

## Architekturplanung (Master-Prompt, Abschnitt 18)

| Nr. | Thema | Dokument |
| --- | --- | --- |
| 1 | Technologieentscheidung | `docs/ARCHITECTURE.md` §1 |
| 2 | Architekturübersicht | `docs/ARCHITECTURE.md` §2 |
| 3 | Datenbankmodell | `docs/DATABASE.md` |
| 4 | Rollen und Lizenzen | `docs/ARCHITECTURE.md` §3, §5, §6 |
| 5 | Lehrkraft-, Schüler- und Elternverwaltung | `docs/ARCHITECTURE.md` §4, `docs/ACCOUNT-FLOWS.md` |
| 6 | Spiele und Konfiguration | `docs/GAME-MODULES.md` |
| 7 | Statistikmodell | `docs/GAME-MODULES.md`, Abschnitt Statistik |
| 8 | Designsystem | `docs/DESIGN-SYSTEM.md` |
| 9 | Sicherheit und Datenschutz | `docs/SECURITY.md`, `docs/DATA-PROTECTION.md` |
| 10 | EU-Hosting | `docs/DEPLOYMENT.md` |
| 11 | Entwicklung Windows/macOS | `docs/DEVELOPMENT.md` |
| 12 | Einsatz von Claude Code | `docs/DEVELOPMENT.md`, `CLAUDE.md` |
| 13 | Implementierungsplan | `docs/ROADMAP.md` |
| 14 | Entscheidungen vor Beginn | `docs/STATUS.md` |
