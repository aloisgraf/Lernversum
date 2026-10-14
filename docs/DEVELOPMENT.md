# Entwicklung (Windows und macOS)

**Stand:** Plan Phase 1. Befehle werden mit dem Grundgerüst (Phase 2) angelegt und dann getestet.

## Voraussetzungen

| Werkzeug | Windows | macOS |
| --- | --- | --- |
| Git | Git for Windows | Xcode Command Line Tools oder Homebrew |
| Node.js LTS (Version in `.nvmrc`) | fnm oder nvm-windows | fnm oder nvm |
| pnpm | `corepack enable` | `corepack enable` |
| Docker | Docker Desktop mit WSL 2 | Docker Desktop (oder OrbStack) |
| Supabase CLI | als Dev-Abhängigkeit im Projekt (`pnpm supabase …`) | gleich |
| Claude Code | Installation laut Anthropic-Doku | gleich |

Empfehlung für Windows: Repository **innerhalb von WSL 2** klonen (schnellere Dateizugriffe mit
Docker, gleiche Shell wie macOS). Direkt unter Windows funktioniert es auch.

## Plattformunabhängigkeit

- `.gitattributes`: `* text=auto eol=lf`; `.editorconfig`.
- Keine absoluten Pfade, keine OS-spezifischen Skripte; alle Skripte als `package.json`-Skripte
  oder Node-Skripte.
- Konfiguration nur über `.env.local` (nicht im Repo), Vorlage `.env.example` ohne Geheimnisse.
- CI läuft auf Ubuntu und zusätzlich einmal auf macOS und Windows (Matrix für Unit-Tests).

## Geplante Befehle

```
pnpm install            Abhängigkeiten
pnpm db:start           lokale Supabase starten (Docker)
pnpm db:reset           DB neu aufsetzen: Migrationen + Testdaten (nur lokal)
pnpm dev                App starten
pnpm lint / typecheck   statische Prüfungen
pnpm test               Unit-Tests
pnpm test:db            RLS- und Funktionstests (pgTAP)
pnpm test:e2e           Playwright
pnpm setup:admin        Ersteinrichtung Admin (lokal mit Testtoken)
```

## Git

- `main` geschützt; Arbeit auf Branches, Merge über PR mit grüner CI.
- Commits und Pushes durch Claude nur nach Freigabe von Alois.

## Einsatz von Claude Code

- `CLAUDE.md` mit den verbindlichen Regeln, `docs/` als Projektgedächtnis, `docs/adr/` für Entscheidungen.
- Hauptagent plant und integriert. Subagenten nur für abgegrenzte Aufgaben: unabhängiges
  Sicherheitsreview von RLS und Lizenzfunktionen, Review abgeschlossener Phasen, gezielte
  Recherche (z. B. Anbieterbedingungen).
- Jede Phase endet mit Tests, Doku-Update (`STATUS.md`, `CHANGELOG.md`) und Zusammenfassung.
- Hooks (später, nach Freigabe): Lint und Typprüfung nach Änderungen; Blockieren von
  Befehlen gegen Produktion.
- Kosten: Analysen auf betroffene Dateien beschränken, vorhandene Doku statt erneutem Lesen.
