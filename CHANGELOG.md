# Changelog

## Unveröffentlicht

- Test-Admin neu aufgebaut (D-024): Kinder mit frei gewähltem Benutzernamen und Erstpasswort,
  Passwortwechsel nach der ersten Anmeldung (scrypt-Hash, Mindestlänge, Liste häufiger
  Passwörter), Kategorien mit Stufen einfach/mittel/schwer, Lernpakete mit Ablaufdatum oder
  unbefristet, Ergebnisse je Paket; Kinder sehen freigegebene Spiele auf der Weltkarte und ihre
  Sterne. Öffentliche Spieleseite entfernt, Spiele nur noch mit Freigabe.
- Design: Schrift Patrick Hand für Wortmarke und Kinderbereich (Überschriften, Knöpfe);
  Admin mit plastischen Pill-Buttons, Datentabellen und Status-Pillen, Formulare über
  „+ Neu …“ aufklappbar.
- Feuerplanet (D-026): erste Lernwelt mit dem Bild von Alois und eigener Seite, Funki das Lava-Alien
  begrüßt mit Namen und lobt nach jedem Spiel mit wechselnden Sätzen; Weltkarte führt in die
  Lernwelten, Spiele führen dorthin zurück.
- Loginzettel (D-025): nach dem Anlegen eines Kindes oder neuem Erstpasswort druckbar, mit
  QR-Code zur Anmeldeseite (Bibliothek `qrcode-generator`), Passwort nicht gespeichert.
- Kinderbereich: Lernwelten als gezeichnete schwebende Inseln, Profil `/bereich/profil` mit
  Spitzname und Avatarwahl (acht gezeichnete Avatare), Begrüßung mit Spitzname (D-023).
- Sicherheit: Zod 4.6.5 → 4.6.7 (hohe Lücke GHSA-mrhx-c7xc-m3w5), befristete Ausnahme nach D-020.
- Design nach dem Designpaket (D-022): Farben, Schriften Nunito und Fredoka, Wortmarke; Startseite und Login
  im Weltraum-Stil, Test-Admin mit Seitenleiste und Karten, Kinderbereich als Weltkarte.
- Test-Admin (Prototyp, Daten nur im Speicher): Lizenznehmer, Lizenzen mit Paket und Laufzeit,
  Kinder mit Kinder- und Elternkarte, Spielfreischaltungen, Themen (D-021).
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
