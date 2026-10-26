# Sicherheitskonzept

**Stand:** Konzept Phase 1. Keine Maßnahme ist implementiert oder geprüft. Eine absolute
Sicherheit gibt es nicht; Ziel ist eine nachweisbar abgesicherte Architektur mit Tests und
dokumentierten Restrisiken.

## Schutzziele und Grundsätze

- Security by Design, Least Privilege, Default Deny (RLS ohne Policy = kein Zugriff).
- Zwei Ebenen: Server-Prüfung + RLS. Die Oberfläche ist keine Sicherheitsgrenze.
- Rollen und Lizenzen nur über geprüfte SQL-/Server-Funktionen änderbar.

## Maßnahmen

| Bereich | Maßnahme |
| --- | --- |
| Transport | nur HTTPS/TLS, HSTS |
| Speicherung | Verschlüsselung at rest durch Datenbank- und Speicheranbieter; Backups verschlüsselt |
| Schlüssel | Service-Role und andere Geheimnisse nur als Server-Umgebungsvariablen; nie `NEXT_PUBLIC_`; Secret-Scanning in CI; `.env*` in `.gitignore` |
| Authentifizierung | keine freie Registrierung, Konten nur nach bestätigter Zahlung oder durch Admin (D-018); Admin mit 2FA (TOTP) Pflicht; Lehrkraft 2FA empfohlen; Sitzungswiderruf bei Sperre |
| Admin-Einrichtung | einmaliges CLI-Skript mit Einmal-Token, nur auf dem Server ausführbar, danach gesperrt |
| Passwörter (D-024) | scrypt (N=16384, r=8, p=1) mit Salz, auch für Erstpasswörter; Kinder ≥ 8, Erwachsene ≥ 12, max. 128 Zeichen; Liste häufiger Passwörter; Pflichtwechsel nach Erstpasswort; gleiche Rechenzeit für unbekannte Benutzernamen |
| Autorisierung | RLS auf allen Tabellen; `can_play` und Kernfunktionen als SECURITY DEFINER mit festem `search_path` und eigener Rechteprüfung |
| Eingaben | Zod-Validierung serverseitig; parametrisierte Abfragen; keine dynamische SQL-Zusammensetzung |
| XSS | React-Escaping, kein `dangerouslySetInnerHTML` ohne Sanitizer, strenge Content-Security-Policy mit Nonces |
| CSRF | Server Actions mit Origin-Prüfung; Cookies `SameSite=Lax`, `HttpOnly`, `Secure` |
| Uploads | Whitelist, Größenlimit, Signaturprüfung, Neukodierung, private Buckets, signierte URLs mit kurzer Laufzeit |
| Rate-Limits | Login (Konto + IP), Schüler-Login besonders streng, Konto-/Schüleranlage, Upload, Ereignis-Schreiben |
| Protokolle | `audit_log` für Admin- und Lizenzaktionen; Sicherheitslogs ohne Lerninhalte, nur IDs |
| Fehler | generische Meldungen nach außen, Details nur im Server-Log |
| Abhängigkeiten | Lockfile, Dependabot, `pnpm audit` in CI, regelmäßige Updates |
| Umgebungen | lokal, Staging, Produktion getrennt; eigene Projekte, Schlüssel, Daten; keine Echtdaten außerhalb Produktion |
| Backup | tägliche Backups + Point-in-Time-Recovery (Anbieter, EU); Wiederherstellung halbjährlich getestet |

## Pflicht-Tests (negativ und positiv)

Alle Punkte aus dem Master-Prompt, Abschnitt 14, als pgTAP- und Playwright-Tests, u. a.:

- Lehrkraft A liest/ändert keine Schüler, Gruppen, Freischaltungen, Statistiken von Lehrkraft B.
- Eltern sehen nur das eigene Kind, nur lesend, und können kein Spiel starten und nichts schreiben.
- Ein neuer Aktivierungscode macht den alten ungültig und beendet laufende Sitzungen.
- Online-Kauf (D-018): Konto und Lizenz nur aus einem Webhook mit gültiger Signatur des
  Zahlungsanbieters; doppelte Zustellung legt nichts doppelt an. Negativtests: gefälschte oder
  fehlende Signatur, wiederholte Nachricht, manipulierter Betrag oder manipuliertes Paket werden
  abgewiesen. Paket, Preis und Kinderzahl kommen nur aus der Serverkonfiguration, nie aus dem
  Browser. Keine Zahlungsdaten bei Lernversum.
- Demo-Login (D-019) nur auf Test-Servern: aus, solange nicht ausdrücklich eingeschaltet;
  Negativtests in `tests/e2e/demo-login.spec.ts` (ohne Anmeldung, falsches Passwort, falsche
  Rolle, gefälschtes Cookie, zweite Anmeldung, Abmelden). Restrisiko: Passwörter liegen im
  Klartext in den Coolify-Einstellungen; deshalb nur Testdaten.
- Test-Admin (D-021): Jede Server-Aktion prüft zuerst die Admin-Rolle; Eingaben mit Zod
  geprüft; Anzahl der Einträge begrenzt. Negativtests: ohne Anmeldung und als `testuser` sind
  alle Admin-Seiten gesperrt. Offen: kein automatisierter Test, der Admin-Aktionen direkt per
  POST als `testuser` aufruft (kommt mit der echten Umsetzung in Phase 2b).
- Einzelanmeldung (D-018, vorläufig): Eine neue Anmeldung beendet alle anderen Sitzungen des
  Kontos. Negativtest: Nach der zweiten Anmeldung wird das Token der ersten serverseitig
  abgelehnt, auch per direktem API-Aufruf. Restrisiko: Bis zum Ablauf des Zugriffstokens
  (10 Minuten, D-017) bleibt die alte Sitzung für reine Lesezugriffe gültig, sofern RLS die
  Sitzung nicht zusätzlich prüft.
- Ein verbrauchter oder abgelaufener Code kann nicht erneut eingelöst werden.
- Gleiche Schule gibt keinen Zugriff auf Schüler anderer Lehrkräfte.
- Lehrkraft kann nur Spiele aus ihrem Plan und nur im erlaubten Zeitraum freischalten.
- Schüler ändert weder Rolle noch Lizenzen; sieht keine anderen Schüler.
- Ohne Plattformzugang, ohne Spiellizenz, mit deaktiviertem Spiel oder abgelaufener
  Lehrkraftlizenz: keine Sitzung, keine Ereignisse, auch per direktem API-Aufruf.
- Medien ohne Berechtigung nicht abrufbar, auch nicht mit geratener URL.
- Produktionskonfiguration zeigt auf EU-Regionen (Konfigurationstest).

## Audit und verbindliche Ergänzungen

- Sicherheits- und Datenschutz-Audit Nr. 1 (2026-10-14): `SECURITY-AUDIT.md`, Freigabe-Checkliste
  für den Produktivbetrieb: `FREIGABE-CHECKLISTE.md`. Nur die Maßnahmen zu K-01 bis K-03 sind
  freigegeben (D-017); alle anderen Maßnahmen des Audits sind offen.
- D-017 präzisiert die Zeilen Authentifizierung und Rate-Limits oben: Anmeldung von Schülern und
  Eltern nur über eigenen Server-Endpunkt mit Begrenzung je Benutzername, Status immer aus
  Tabellen, Token-Laufzeit 10 Minuten, Admin-Rechte nur mit `aal2`.

## Restrisiken (bekannt)

- **Loginzettel (D-025):** Ein gedruckter Zettel mit Erstpasswort kann verloren gehen oder
  fotografiert werden. Ausgleich: gilt nur bis zum Pflichtwechsel, Passwort wird nicht
  gespeichert und nur einmal angezeigt, QR-Code ohne Zugangsdaten.
- **Erstpasswort (D-024):** Der Admin kennt es, bis das Kind es ändert. Ausgleich:
  Pflichtwechsel vor jeder anderen Seite, nur Hash gespeichert, Zurücksetzen beendet alle
  Sitzungen. Die Liste häufiger Passwörter ist im Prototyp klein; ab Phase 2b prüft Supabase
  zusätzlich gegen bekannte Datenlecks.

- **Erratbare Benutzernamen:** `vorname.nachname` ist vorhersehbar; Schutz liegt allein im
  Passwort. Ausgleich: Mindestlänge, Rate-Limits pro Benutzername und IP, gleiche Fehlermeldung
  für falschen Namen und falsches Passwort (keine Namensabfrage möglich).
- **Aktivierungscodes:** einmalig, befristet, nur gehasht, Rate-Limit; wer einen Code abfängt und
  zuerst einlöst, übernimmt den Zugang. Ausgleich: Lehrkraft sieht, ob aktiviert wurde, und kann
  sofort neu erzeugen.
- Weitergegebene oder fotografierte Zugangskarten: Schüler sehen nur Spiele; Eltern sehen Lerndaten
  des Kindes, daher Elternkarte getrennt und vertraulich übergeben.
- Gemeinsam genutzte Geräte in Schule/Familie: Abmelden muss einfach und deutlich sein.
- Abhängigkeit von Anbieter-Sicherheit (Supabase, Hosting).
- Supabase vergibt neuen Tabellen und Funktionen in `public` standardmäßig volle Rechte für
  `anon` und `authenticated`; RLS und ausdrückliches `REVOKE` sind die einzige Schranke
  (Audit A-02). Views umgehen RLS ohne `security_invoker` (Audit A-01).
