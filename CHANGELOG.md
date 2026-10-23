# Changelog

## Unveröffentlicht

- Entwurf D-018 in `docs/`: Lizenzpakete und Laufzeiten, Online-Kauf in Selbstbedienung,
  nur eine Anmeldung je Konto; offene Punkte L-2 bis L-7.
- Erstes Spiel „Wald-Wesen füttern“ (Endungen -el, -en, -er) als Testversion ohne Anmeldung,
  verlinkt von der Startseite über `/spiele`; keine Speicherung von Ergebnissen.
- Technisches Grundgerüst: Next.js 16 mit TypeScript, Tailwind, Zod-geprüfte Umgebungsvariablen,
  Sicherheits-Header, Vitest, Playwright, lokale Supabase (Registrierung deaktiviert),
  RLS-Basistest (pgTAP), GitHub-Actions-CI für Linux, macOS und Windows, Dependabot.
- Projektregeln (`CLAUDE.md`) und Architekturplanung Phase 1 (`docs/`) angelegt.
