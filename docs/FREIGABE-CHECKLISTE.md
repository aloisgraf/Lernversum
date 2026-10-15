# Freigabe-Checkliste Produktivbetrieb Lernversum

Stand: 2026-10-14 (Audit Nr. 1). Jeder Punkt braucht einen Nachweis (Link, Testlauf, Dokument).
Ein Produktivstart mit echten Schülerdaten setzt **alle** Punkte voraus und darf nicht allein auf
einem KI-Audit beruhen. Aktueller Stand: **nicht freigabefähig** (Phase 2a, keine Plattformfunktionen).

## A. Recht und Organisation (Betreiber, Datenschutzfachperson)

- [ ] Verantwortlichenrolle geklärt (E-8), AV-Verträge mit Schulen/Lehrkräften falls nötig
- [ ] Rechtsgrundlage je Nutzergruppe und Land dokumentiert
- [ ] Datenschutz-Folgenabschätzung durchgeführt und abgezeichnet
- [ ] AVV mit Supabase, App-Hoster, Mailanbieter, ggf. Monitoring; Regionen und Backup-Standort schriftlich EU
- [ ] Drittlandübermittlungen bewertet (DPF/SCC, Transfer-Impact-Assessment)
- [ ] Datenschutzhinweise (Lehrkraft, Eltern, kindgerecht), Impressum, Nutzungsbedingungen veröffentlicht
- [ ] Verfahren für Betroffenenrechte (Auskunft, Berichtigung, Löschung, Export) mit Zuständigkeit und Frist
- [ ] Verfahren bei Datenschutzverletzungen (72 h) mit Kontakten und Vorlage
- [ ] Verzeichnis der Verarbeitungstätigkeiten und TOM-Dokumentation vollständig
- [ ] 2FA für alle Betreiberkonten (GitHub, Supabase, Hoster, Domain, Mail)

## B. Sicherheit im Code (automatisiert nachgewiesen)

- [ ] Testmatrix (Audit 3.4) vollständig als pgTAP-Tests, alle grün in CI
- [ ] Lizenz-Negativtests (Ablauf, Sperre, Widerruf, deaktiviertes Spiel) auch per direktem API-/RPC-Aufruf grün
- [ ] Gesperrter Nutzer mit noch gültigem JWT hat keinen Zugriff (K-02)
- [ ] Admin-Daten nur mit `aal2` (K-03)
- [ ] Keine Tabelle/View/Funktion für `anon` erreichbar außer Positivliste (A-01 bis A-03)
- [ ] Rate-Limits je Benutzername und IP für Login und Codeeinlösung getestet (K-01, K-05)
- [ ] Jede Server Action: Negativtest ohne Sitzung und mit fremder Rolle (K-07)
- [ ] Service-Role nur im dafür vorgesehenen Modul (Lint-Regel), jede Nutzung im Audit-Log (K-06)
- [ ] Upload: Typ-Whitelist, Größenlimit, Signaturprüfung, Neukodierung, private Buckets getestet
- [ ] CSP mit Nonces, `no-store` auf Seiten mit personenbezogenen Daten (A-05, A-09)
- [ ] Keine Passwörter, Codes, Tokens oder Namen in Logs und Fehlerberichten (Test)
- [ ] Lint, Typprüfung, Unit, E2E, DB-Tests, Build in CI grün auf dem freizugebenden Commit

## C. Lieferkette und Repository

- [ ] `main` geschützt, Merge nur per PR mit Pflicht-Checks (A-04)
- [ ] Secret-Scan (gitleaks + GitHub Push Protection) aktiv, Historie ohne Funde (A-08)
- [ ] `pnpm audit` ohne offene hohe/kritische Funde oder dokumentierte Ausnahme (A-07)
- [ ] Actions per SHA gepinnt, Dependabot-Läufe grün (A-06, A-12)

## D. Betrieb

- [ ] Getrennte Projekte und Schlüssel für Entwicklung, Staging, Produktion; keine Echtdaten außerhalb Produktion
- [ ] Konfigurationstest Produktion: EU-Region, Signup aus, MFA an, Passwortregeln, Redirect-URLs, Rate-Limits (A-11)
- [ ] Produktions-Deployment nur über GitHub-Environment mit Freigabe durch Alois
- [ ] Backups und PITR aktiv, Wiederherstellung auf Staging getestet, Löschungen nach Restore nachgezogen (DS-02)
- [ ] Automatische Löschjobs nach Fristen laufen und sind getestet
- [ ] Monitoring und Alarmierung für Fehler und auffällige Anmeldeversuche
- [ ] TLS-Konfiguration geprüft (z. B. SSL Labs mindestens A), HSTS-Preload bewusst entschieden

## E. Unabhängige Prüfung

- [ ] Externes Sicherheitsaudit bzw. Penetrationstest gegen Staging, kritische und hohe Befunde behoben
- [ ] Nachprüfung in `SECURITY-AUDIT.md` Abschnitt 8 eingetragen
- [ ] Schriftliche Freigabe durch Alois
