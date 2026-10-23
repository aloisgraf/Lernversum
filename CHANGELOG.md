# Changelog

## Unveröffentlicht

- Demo-Login: Anmeldeseite nennt bei ausgeschaltetem Login den Grund (ohne Werte);
  `DEMO_LOGIN` und Passwörter tolerieren Leerzeichen am Rand, `on` auch großgeschrieben.
- Sicherheit: Next.js 16.3.8 → 16.4.2 (kritische Lücken GHSA-2464-fhr4-w9xw,
  GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r), befristete Ausnahme von der 14-Tage-Regel (D-020).
- Demo-Login für Test-Server mit `/login`, grobem Adminbereich `/admin` und Benutzerbereich
  `/bereich`; standardmäßig aus (D-019).
- Entwurf D-018 in `docs/`: Lizenzpakete und Laufzeiten, Online-Kauf in Selbstbedienung,
  nur eine Anmeldung je Konto; offene Punkte L-2 bis L-7.
- Erstes Spiel „Wald-Wesen füttern“ (Endungen -el, -en, -er) als Testversion ohne Anmeldung,
  verlinkt von der Startseite über `/spiele`; keine Speicherung von Ergebnissen.
- Technisches Grundgerüst: Next.js 16 mit TypeScript, Tailwind, Zod-geprüfte Umgebungsvariablen,
  Sicherheits-Header, Vitest, Playwright, lokale Supabase (Registrierung deaktiviert),
  RLS-Basistest (pgTAP), GitHub-Actions-CI für Linux, macOS und Windows, Dependabot.
- Projektregeln (`CLAUDE.md`) und Architekturplanung Phase 1 (`docs/`) angelegt.
