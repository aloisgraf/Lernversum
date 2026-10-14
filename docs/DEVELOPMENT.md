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

## Erste Einrichtung

```
git clone https://github.com/aloisgraf/Lernversum.git
cd Lernversum
corepack enable          # aktiviert die im Projekt festgelegte pnpm-Version
pnpm install
cp .env.example .env.local
pnpm db:start            # startet Supabase lokal in Docker, gibt URL und Schlüssel aus
                         # Werte für NEXT_PUBLIC_SUPABASE_ANON_KEY und
                         # SUPABASE_SERVICE_ROLE_KEY in .env.local eintragen
pnpm dev                 # App unter http://localhost:3000
```

Unter Windows alle Befehle in der WSL-2-Shell ausführen (Ubuntu), Docker Desktop mit
WSL-Integration aktivieren.

## Befehle

| Befehl | Zweck |
| --- | --- |
| `pnpm dev` | App im Entwicklungsmodus |
| `pnpm build` / `pnpm start` | Produktions-Build bauen / starten |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript-Prüfung |
| `pnpm format` / `pnpm format:check` | Prettier anwenden / prüfen |
| `pnpm test` | Unit-Tests (Vitest) |
| `pnpm test:e2e` | End-to-End-Tests (Playwright; vorher `pnpm build` und einmalig `pnpm exec playwright install chromium`) |
| `pnpm db:start` / `pnpm db:stop` | lokale Supabase starten / stoppen |
| `pnpm db:reset` | lokale DB neu aufsetzen (nur lokal!) |
| `pnpm test:db` | Datenbanktests (pgTAP, braucht laufende lokale Supabase) |
| `pnpm check` | Lint, Typen, Format und Unit-Tests zusammen |

## Projektstruktur

```
src/app/            Seiten (Next.js App Router)
src/lib/            Plattform-Hilfen (z. B. Prüfung der Umgebungsvariablen)
tests/unit/         Unit-Tests
tests/e2e/          Playwright-Tests (Desktop, Tablet, Smartphone)
supabase/           lokale Supabase-Konfiguration, Migrationen, Datenbanktests
.github/workflows/  CI
docs/               Projektdokumentation
```

## Paketsicherheit

`pnpm-workspace.yaml` setzt `minimumReleaseAge` auf 14 Tage: neue Paketversionen werden erst
installiert, wenn sie mindestens zwei Wochen alt sind (Schutz vor kompromittierten
Veröffentlichungen). Nur ausdrücklich gelistete Pakete dürfen Installationsskripte ausführen.

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
