# Sicherheits- und Datenschutz-Audit Lernversum

| | |
| --- | --- |
| Audit-Nr. | 1 |
| Datum | 2026-10-14 |
| Prüfgegenstand | Repository `aloisgraf/Lernapp` (auf GitHub `Lernversum`), Branch `claude/project-thread-xulmv5`, Commit `e5bdfb3` (Phase 2a), Planungsdokumente in `docs/` |
| Prüfer | KI-Assistent (Claude), im Auftrag von Alois |
| Status | Von Alois geprüft. Maßnahmen zu K-01 bis K-03 am 2026-10-15 freigegeben (`DECISIONS.md` D-017), Umsetzung in Phase 2b. Übrige Maßnahmen nicht freigegeben. |

> **Wichtig:** Dieses Audit ist eine KI-gestützte Prüfung. Es ersetzt weder einen unabhängigen
> Penetrationstest noch die Beurteilung durch eine qualifizierte Datenschutzfachperson. Bestandene
> Tests bedeuten nicht, dass die Anwendung sicher oder DSGVO-konform ist. Ein Produktivstart mit
> echten Schülerdaten darf nicht allein auf Grundlage dieses Berichts freigegeben werden.

---

## 1. Zusammenfassung und Prüfungsumfang

### 1.1 Ergebnis in Kürze

Der aktuelle Code (Phase 2a) ist ein technisches Grundgerüst: eine statische Startseite, geprüfte
Umgebungsvariablen, Sicherheits-Header, lokale Supabase-Konfiguration, ein RLS-Basistest und CI.
Es gibt **noch keine Benutzer, Rollen, Tabellen, Migrationen, API-Endpunkte, Server Actions,
Lizenzlogik oder Uploads**. Daher ist die tatsächliche Angriffsfläche heute sehr klein, und die
meisten Pflichtprüfpunkte konnten **nur auf Konzeptebene** beurteilt werden.

| Schweregrad | Nachgewiesen im Code/Repo | Konzeptbefunde (noch nicht implementiert) |
| --- | --- | --- |
| Kritisch | 0 | 0 |
| Hoch | 0 | 3 (K-01, K-02, K-03) |
| Mittel | 4 (A-01, A-02, A-03, A-04) | 8 (K-04 bis K-09, DS-01, DS-02) |
| Niedrig | 4 (A-05 bis A-08) | 3 (K-10, K-11, DS-03) |
| Hinweis | 5 (A-09 bis A-13) | 2 (K-12, K-13) |

Wichtigste Punkte:

1. **Der RLS-Basistest hat Lücken (A-01, A-03).** Eine View über einer RLS-Tabelle umgeht RLS,
   und der Test bleibt grün. Nachgewiesen in einem Supabase-Postgres-17-Container.
2. **Supabase vergibt neuen Tabellen und Funktionen in `public` automatisch volle Rechte für
   `anon` und `authenticated` (A-02).** RLS ist damit die einzige Schranke; jede künftige
   `SECURITY DEFINER`-Funktion (z. B. `can_play`) ist ohne ausdrückliches `REVOKE` für
   nicht angemeldete Nutzer aufrufbar. Nachgewiesen.
3. **Kein Branch-Schutz, kein `main`-Branch (A-04).** Alles liegt auf einem ungeschützten Branch.
4. **Kinder- und Elternanmeldung mit erratbaren Benutzernamen (K-01)**, **Sperren wirken bei
   JWT-basierten Prüfungen erst nach bis zu 60 Minuten (K-02)** und **Admin-2FA ist nur wirksam,
   wenn die Datenbank die Stufe `aal2` prüft (K-03)**: Diese drei Konzeptpunkte müssen vor bzw. in
   Phase 2b gelöst werden, sonst entstehen hohe Risiken.
5. **Datenschutz:** Verantwortlichenrolle (E-8), Rechtsgrundlage, DSFA, Auftragsverarbeitung,
   Verfahren bei Datenpannen und Backup-Löschkonzept sind offen (Abschnitt 6). Ohne diese Punkte
   ist kein Produktivbetrieb mit echten Schülerdaten möglich.

### 1.2 Umfang

| Bereich | Geprüft | Art |
| --- | --- | --- |
| Quellcode `src/`, Tests, Build-Konfiguration | ja, vollständig (42 Dateien) | statisch und dynamisch |
| `supabase/config.toml`, pgTAP-Test | ja | statisch und im Datenbank-Container |
| Datenbankstruktur, Migrationen, RLS-Policies | **nicht vorhanden** (keine Migrationen) | nur Konzept (`DATABASE.md`) |
| Auth, Sitzungen, Passwort-Reset, Kontoverwaltung | **nicht implementiert** | nur Konzept und lokale Auth-Konfiguration |
| Lizenzlogik, `can_play` | **nicht implementiert** | nur Konzept |
| API-Endpunkte, Server Actions | **keine vorhanden** (bestätigt durch Build-Ausgabe: nur `/` und `/_not-found`) | dynamisch |
| Dateispeicher, Uploads | **nicht implementiert** | nur Konzept |
| CI, Dependabot, GitHub-Repository | ja (Workflow-Datei, Laufergebnisse, Branch-Status) | statisch, GitHub-API |
| Git-Historie | ja (2 Commits, alle Branches) | Geheimnisscan |
| Deployment, Produktion, Staging | **existieren nicht** | nur Konzept (`DEPLOYMENT.md`) |
| Datenschutz | Konzeptdokumente | Dokumentenprüfung |

Nicht im Umfang: echte Daten (es gibt keine), Produktivsysteme (gibt es nicht), Anbieterverträge.

---

## 2. Prüfmethoden und Werkzeuge

Alle Prüfungen liefen in einer isolierten Kopie des Repositorys (`git archive HEAD`) in einer
Cloud-Sandbox. Am Repository selbst wurde nichts geändert (`git status` sauber), nichts
committet oder gepusht. Die Datenbankprüfungen liefen in einem lokalen Wegwerf-Container, jede
Probe in einer Transaktion mit `ROLLBACK`.

| Prüfung | Befehl / Werkzeug | Ergebnis |
| --- | --- | --- |
| Installation | `pnpm install --frozen-lockfile` (pnpm 10.28.0, Node 22.22.0) | erfolgreich |
| Linting | `pnpm lint` (ESLint 9, eslint-config-next) | 0 Fehler, 0 Warnungen |
| Typprüfung | `pnpm typecheck` (`tsc --noEmit`, strict) | 0 Fehler |
| Formatierung | `pnpm format:check` | bestanden |
| Unit-Tests | `pnpm test` (Vitest 5) | 4 von 4 bestanden |
| Build | `pnpm build` (Next.js 16.3.8) | erfolgreich; Routen: `/`, `/_not-found`, beide statisch |
| E2E-Tests | `CI=1 pnpm test:e2e` (Playwright, Chromium, 3 Viewports) | 9 von 9 bestanden |
| Dynamische Header-/Methodenprüfung | `pnpm start` + `curl` (GET, 404, TRACE, POST mit fremdem Origin) | siehe A-09; Nachweis `audit/nachweise/header-pruefung.log` |
| Client-Bundle auf Geheimnisse | `grep -rE 'SERVICE_ROLE…' .next/static`, Suche nach `*.map` | keine Treffer, keine Source-Maps ausgeliefert |
| Abhängigkeiten (Produktion) | `pnpm audit --prod` | keine bekannten Schwachstellen |
| Abhängigkeiten (alle) | `pnpm audit` | 1 hoch (Dev-Abhängigkeit, A-07) |
| Veraltete Pakete | `pnpm outdated` | nur bewusst zurückgehaltene Major-Versionen (D-016) |
| Geheimnisscan Git-Historie | gitleaks 8.28.0, `gitleaks git --log-opts="--all"` | 2 Commits, keine Funde |
| Geheimnisscan Dateien | detect-secrets 1.5 | 5 Treffer in `supabase/config.toml`, alle Fehlalarme (`env(...)`-Platzhalter) |
| Statische Analyse | Semgrep (Regelsätze typescript, javascript, generic/secrets, yaml/github-actions aus `semgrep-rules`) | 16 Treffer zu ungepinnten Actions (A-06), 2 irrelevante i18n-Hinweise, keine Sicherheitsbefunde im App-Code |
| Datenbank / RLS | Supabase-Postgres-Image `supabase/postgres:17.6.1.011`, Basistest `000_baseline.test.sql` und Proben T2 bis T6 | siehe A-01 bis A-03; Proben in `audit/nachweise/t*.sql` |
| CI-Ergebnis GitHub | GitHub-API, Lauf 38643739725 | alle 6 Jobs grün (inkl. DB-Tests, E2E, Audit) |
| Repository-Einstellungen | GitHub-API `list_branches` | ein Branch, nicht geschützt (A-04) |

**Nicht ausgeführt, mit Grund:**

- Vollständiger lokaler Supabase-Stack (`supabase start`): in dieser Sandbox nicht nötig, da nur
  die Datenbank relevant ist; stattdessen das gleiche Postgres-Image direkt. Der volle Stack lief
  in der GitHub-CI erfolgreich.
- DAST-Scanner (z. B. OWASP ZAP), Lasttests, Rate-Limit-Tests: es gibt keine Endpunkte mit Logik.
- RLS-Tests je Tabelle und Rolle: es gibt keine Tabellen. Eine Soll-Testmatrix steht in 3.4.
- Prüfung von GitHub-Einstellungen wie Secret Scanning, Dependabot-Alerts, Sichtbarkeit des
  Repositorys: mit den verfügbaren Werkzeugen nicht abrufbar; als offene Punkte geführt.
- Supabase-Semgrep-Regeln aus der Registry: Netzwerkzugriff gesperrt; lokale Kopie der
  öffentlichen Regeln verwendet.

### 2.1 Abgleich mit OWASP ASVS 5.0.0 (Kapitelebene)

| ASVS-Kapitel | Stand |
| --- | --- |
| V1 Encoding and Sanitization | Code: keine Ausgabe von Nutzereingaben, React-Escaping. Konzept vorhanden. |
| V2 Validation and Business Logic | Konzept (Zod, SQL-Funktionen, Limits mit Sperre). Nicht implementiert. |
| V3 Web Frontend Security | Header teilweise gesetzt, CSP fehlt (A-05, A-09). |
| V4 API and Web Service | keine Endpunkte. Nicht prüfbar. |
| V5 File Handling | Konzept gut (Whitelist, Neukodierung, private Buckets). Nicht implementiert. |
| V6 Authentication | Konzeptlücken K-01, K-03, K-04. Nicht implementiert. |
| V7 Session Management | Konzeptlücke K-02. Nicht implementiert. |
| V8 Authorization | Konzept zweistufig (Server + RLS); Lücken A-01, A-02, K-06. |
| V9 Self-contained Tokens | Supabase-JWT; Claim-Spiegelung riskant (K-02). |
| V10 OAuth/OIDC | nicht vorgesehen. |
| V11 Cryptography | Codes nur gehasht (Konzept); Details offen (K-05). |
| V12 Secure Communication | HSTS gesetzt; TLS-Terminierung erst mit Hosting prüfbar. |
| V13 Configuration | Umgebungsvariablen geprüft, Server-Geheimnisse mit `server-only`; Lücken A-04, A-06, A-11. |
| V14 Data Protection | Konzept gut; Lücken DS-01 bis DS-03. |
| V15 Secure Coding and Architecture | Abhängigkeitsprüfung, Release-Alter-Sperre; Lücke A-07. |
| V16 Logging and Error Handling | Konzept vorhanden, Details offen (K-09). |
| V17 WebRTC | nicht relevant. |

---

## 3. Befunde

Kennzeichnung: **A-** = im aktuellen Code/Repository **nachgewiesen**. **K-** = Konzeptbefund
(Risiko in der geplanten Architektur, **nicht im Code prüfbar**, weil noch nicht implementiert;
teils Annahme über künftiges Verhalten). **DS-** = Datenschutzbefund.

### 3.1 Nachgewiesene Befunde im Code und Repository

#### A-01 · Mittel · RLS-Basistest erkennt Views nicht, die RLS umgehen

- **Betroffen:** `supabase/tests/database/000_baseline.test.sql`, Test 1 (`relkind in ('r','p')`).
- **Auswirkung:** In PostgreSQL laufen normale Views mit den Rechten ihres Eigentümers
  (`postgres`) und umgehen dadurch RLS der darunterliegenden Tabelle. Legt eine künftige
  Migration eine View (z. B. für Statistiken) ohne `security_invoker = true` an, kann `anon` oder
  jede angemeldete Rolle alle Zeilen lesen, also auch fremde Schülerdaten. Der Basistest, der genau
  diese Klasse von Fehlern abfangen soll, bleibt grün.
- **Nachweis (reproduzierbar):** `audit/nachweise/t4.sql` im Container `supabase/postgres:17.6.1.011`:
  Tabelle mit RLS und ohne Policy, View darüber, Schreibrechte der View entzogen. Ergebnis:
  `anon_liest_view_trotz_rls | 1` und beide Basistests `ok`.
  Gegenprobe `t2.sql`: Tabelle ohne RLS lässt den Test korrekt scheitern.
- **Abhilfe:** Basistest um Views und materialisierte Views erweitern: jede View in `public` und
  `game_*` muss `security_invoker=true` haben oder darf für `anon`/`authenticated` keine Rechte
  besitzen; materialisierte Views dürfen für diese Rollen nicht lesbar sein. Regel in
  `DATABASE.md` aufnehmen.

#### A-02 · Mittel · Standardrechte von Supabase: volle Tabellenrechte und EXECUTE für `anon`

- **Betroffen:** Datenbank-Grundkonfiguration (Supabase-Standard), künftige Migrationen,
  geplante `SECURITY DEFINER`-Funktionen (`can_play`, `grant_game_license` usw.).
- **Auswirkung:** Jede neu angelegte Tabelle in `public` erhält für `anon` und `authenticated`
  automatisch SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER. Jede neue Funktion ist
  für `anon` ausführbar. RLS schützt Tabellen, aber eine `SECURITY DEFINER`-Funktion läuft mit
  Eigentümerrechten **ohne RLS**; ohne eigenes `REVOKE` und eigene Rechteprüfung in der Funktion
  kann ein nicht angemeldeter Aufrufer sie über die REST-API (`/rest/v1/rpc/...`) ausführen.
- **Nachweis:** `audit/nachweise/t3.sql`: `tabelle_grants anon: DELETE,INSERT,REFERENCES,SELECT,TRIGGER,TRUNCATE,UPDATE`,
  `fn_execute_anon = t`, `anon_ruft_definer_fn = 42`.
- **Abhilfe:** In der ersten Migration `alter default privileges ... revoke all ... from anon,
  authenticated` (für Tabellen, Sequenzen, Funktionen in `public` und `game_*`), danach Rechte je
  Objekt ausdrücklich vergeben. Jede Funktion: `revoke execute ... from public, anon`, fester
  `search_path`, Rechteprüfung am Anfang. pgTAP-Test: Keine Funktion in `public`/`game_*` ist für
  `anon` ausführbar außer einer dokumentierten Positivliste; `TRUNCATE` für keine App-Rolle.

#### A-03 · Mittel · Zweiter Basistest ist unzuverlässig, andere Schemas ungeprüft

- **Betroffen:** `000_baseline.test.sql`, Test 2.
- **Auswirkung:** Test 2 vergleicht nur Tabellennamen, nicht Schema plus Name. Gibt es eine
  gleichnamige Tabelle mit RLS in einem anderen Schema, wird eine Tabelle ohne RLS übersehen.
  Außerdem prüft keiner der Tests Schemas außerhalb von `public`/`game_*` (z. B. ein später
  ergänztes `app_private` oder `storage`), die per Rechtevergabe erreichbar werden könnten.
- **Nachweis:** `t5.sql`: Tabelle `game_x.probe` ohne RLS mit INSERT für `anon`, daneben
  `public.probe` mit RLS: Test 2 meldet `ok` (nur Test 1 schlägt an). `t6.sql`: Schema
  `app_private` mit SELECT für `anon`: beide Tests `ok`.
- **Abhilfe:** Test 2 über `pg_class.oid` bzw. `(schema, name)` verknüpfen; zusätzlicher Test:
  `anon`/`authenticated` haben `USAGE` nur auf einer Positivliste von Schemas; die über die API
  exponierten Schemas (`config.toml: api.schemas`) werden gegen dieselbe Liste geprüft.

#### A-04 · Mittel · Kein geschützter Hauptbranch

- **Betroffen:** GitHub-Repository. Es existiert nur `claude/project-thread-xulmv5`
  (`protected: false`), kein `main`.
- **Auswirkung:** `DEVELOPMENT.md` und `DEPLOYMENT.md` setzen „`main` geschützt, Merge nur über PR
  mit grüner CI“ voraus. Derzeit kann jeder Push mit Schreibrecht ungeprüft auf den einzigen Branch
  gehen; Dependabot arbeitet ebenfalls gegen diesen Branch. Sobald ein Deployment an einem Branch
  hängt, wäre ungeprüfter Code direkt produktiv.
- **Nachweis:** GitHub-API `list_branches` am 2026-10-14.
- **Abhilfe:** `main` anlegen, als Standardbranch setzen, Branch-Schutz bzw. Ruleset: PR
  erforderlich, alle CI-Jobs als Pflicht-Checks, kein Force-Push, keine Löschung.

#### A-05 · Niedrig (wird Mittel, sobald Nutzereingaben verarbeitet werden) · Keine Content-Security-Policy

- **Betroffen:** `next.config.ts`.
- **Auswirkung:** Ohne CSP fehlt die zweite Verteidigungslinie gegen XSS. Heute ohne praktische
  Wirkung (keine Nutzereingaben), aber `SECURITY.md` verlangt eine strenge CSP mit Nonces.
  Geplant für Phase 6; das ist zu spät, weil Login und Konten in Phase 2b kommen.
- **Nachweis:** `audit/nachweise/header-pruefung.log`: kein `Content-Security-Policy`-Header.
- **Abhilfe:** CSP mit Nonces (Next.js-Middleware/Proxy) spätestens mit Phase 2b; zusätzlich
  `Cross-Origin-Opener-Policy: same-origin`, `frame-ancestors 'none'`. E2E-Test auf den Header.

#### A-06 · Niedrig · GitHub Actions nicht auf Commit-SHA gepinnt

- **Betroffen:** `.github/workflows/ci.yml` (`actions/checkout@v4`, `pnpm/action-setup@v4`,
  `actions/setup-node@v4`).
- **Auswirkung:** Ein kompromittiertes Tag einer Action (insbesondere der Drittanbieter-Action
  `pnpm/action-setup`) würde Code in der CI ausführen. Derzeit begrenzt: `permissions: contents: read`,
  keine Secrets in der CI.
- **Nachweis:** Semgrep `third-party-action-not-pinned-to-commit-sha` (4 Treffer),
  `github-actions-mutable-action-tag` (12 Treffer).
- **Abhilfe:** Actions auf vollständige Commit-SHAs pinnen (Dependabot aktualisiert diese weiter).
  Spätestens bevor Deploy-Secrets in die CI kommen.

#### A-07 · Niedrig · Abhängigkeitsprüfung nur für Produktionspakete; eine bekannte Lücke in Dev-Paketen

- **Betroffen:** CI-Job `audit` (`pnpm audit --prod`), Paket `braces <= 3.0.3` über
  `eslint-config-next > @next/eslint-plugin-next > fast-glob > micromatch`.
- **Auswirkung:** GHSA-vfj7-8cjw-p6xm (Denial of Service durch tief verschachtelte Muster),
  laut Advisory ohne gepatchte Version. Betrifft nur das Linting, keine ausgelieferte App.
  Dev-Lücken mit echtem Risiko (z. B. im Supabase-CLI, Playwright, Build-Werkzeug) würden aber
  ebenfalls nicht gemeldet.
- **Nachweis:** `audit/nachweise/pnpm-audit-alle.log`.
- **Abhilfe:** Zweiten CI-Schritt `pnpm audit` (alle Pakete) mit dokumentierter Ausnahmeliste
  (`pnpm.auditConfig.ignoreGhsas`) für bewertete Dev-Funde ergänzen.

#### A-08 · Niedrig · Secret-Scanning in CI fehlt

- **Betroffen:** `.github/workflows/ci.yml`; Zusage in `SECURITY.md` („Secret-Scanning in CI“).
- **Auswirkung:** Ein versehentlich committeter Schlüssel (z. B. Service-Role) würde nicht
  automatisch erkannt. Heute: keine Geheimnisse gefunden (gitleaks über die gesamte Historie).
- **Abhilfe:** gitleaks-Schritt in CI (mit `fetch-depth: 0`) und GitHub Secret Scanning mit Push
  Protection aktivieren (Einstellung von Alois prüfen).

#### A-09 · Hinweis · Header-Konfiguration: HSTS `preload`, Cache-Verhalten

- HSTS enthält `includeSubDomains; preload`. `preload` ist nur sinnvoll, wenn die Domain bewusst in
  die Browser-Preload-Liste eingetragen wird; das ist schwer rückgängig zu machen. Vor dem
  Deployment entscheiden.
- Statische Seiten werden mit `Cache-Control: s-maxage=31536000` ausgeliefert. Für die Startseite
  unbedenklich; alle Seiten mit personenbezogenen Daten müssen dynamisch und mit
  `Cache-Control: private, no-store` ausgeliefert werden. E2E-Test vorsehen.
- Positiv: `X-Powered-By` entfernt, `nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`
  gesetzt; `TRACE` und `POST /` liefern 405; keine Source-Maps im Client; keine Geheimnisnamen im
  Client-Bundle.

#### A-10 · Hinweis · Unit-Test „gibt keine Werte preis“ kann leer bestehen

- **Betroffen:** `tests/unit/env.test.ts`, Test 3. Wirft `parsePublicEnv` künftig nicht mehr, wird
  keine Erwartung geprüft und der Test besteht trotzdem.
- **Abhilfe:** `expect.assertions(1)` oder `expect(() => …).toThrow()` plus Prüfung der Meldung.
  Für `parseServerEnv` fehlt ein entsprechender Test.

#### A-11 · Hinweis · Lokale Auth-Konfiguration ist keine Vorlage für Produktion

- **Betroffen:** `supabase/config.toml`: `minimum_password_length = 8`, `password_requirements = ""`,
  MFA (TOTP) deaktiviert, `enable_confirmations = false`, Studio und S3-Protokoll aktiv.
- **Auswirkung:** Für die lokale Entwicklung angemessen. Die Einstellungen eines Supabase-Cloud-
  Projekts werden aber im Dashboard bzw. per Management-API gesetzt, nicht aus dieser Datei. Es
  gibt keinen Mechanismus, der Produktionswerte (Signup aus, MFA an, Passwortregeln, Rate-Limits,
  Redirect-URLs) festhält und prüft (Konfigurationsdrift).
- **Positiv:** `enable_signup = false`, anonyme Anmeldung aus, Refresh-Token-Rotation an,
  `secure_password_change = true`.
- **Abhilfe:** Soll-Konfiguration für Staging/Produktion dokumentieren und per Skript gegen die
  Management-API prüfen (Konfigurationstest, wie in `SECURITY.md` für die EU-Region vorgesehen).

#### A-12 · Hinweis · Dependabot-Updates für npm schlagen fehl

- **Betroffen:** Dependabot-Läufe 38643743416 und 38643749233 (`npm_and_yarn`): `failure`.
- **Auswirkung:** Sicherheitsupdates kommen möglicherweise nicht automatisch an. Ursache nicht
  untersucht (Annahme: Zusammenspiel mit `minimumReleaseAge` oder pnpm 10).
- **Abhilfe:** Log der Dependabot-Läufe prüfen; ggf. Dependabot-Gruppen/`cooldown` passend zu
  `minimumReleaseAge` konfigurieren.

#### A-13 · Hinweis · Dokumentation widerspricht sich beim Berechtigungsmodell

- `DECISIONS.md` D-009: „Eltern und Lerntherapeuten werden als Lehrkraft mit eigenem Lizenzplan
  angelegt“; D-014/D-015 und `ARCHITECTURE.md`: Eltern sind eine eigene, rein lesende Rolle.
- `DATABASE.md`: Die Tabellenzeilen `parent_access` und `activation_codes` sind ineinander
  verrutscht; die RLS-Spalte für `parent_access` ist dadurch nicht eindeutig.
- **Auswirkung:** Unklare Vorgaben führen zu falschen Policies. Vor Phase 2b bereinigen.

### 3.2 Konzeptbefunde (nicht im Code prüfbar)

#### K-01 · Hoch · Online-Passwortraten bei Kinder- und Elternkonten

- **Betroffen:** `ACCOUNT-FLOWS.md`, `SECURITY.md` (Restrisiko erkannt, Gegenmaßnahme unvollständig).
- **Auswirkung:** Benutzernamen sind aus Klassenlisten ableitbar (`vorname.nachname`,
  `eltern.vorname.nachname`), Kinderpasswörter sind kurz und einfach. Supabase Auth hat **keine
  kontobezogene Sperre**; die eingebauten Limits gelten **pro IP-Adresse**
  (`sign_in_sign_ups = 30` je 5 Minuten). Folgen: (a) Ein Angreifer mit vielen IPs kann gezielt
  Konten raten; ein Elternkonto liefert alle Lerndaten des Kindes. (b) Eine Schule hinter einer
  gemeinsamen IP erreicht das Limit schnell, die ganze Klasse kann sich nicht mehr anmelden.
- **Abhilfe:** Anmeldung nur über einen eigenen Server-Endpunkt (nicht direkt gegen die Supabase-
  Auth-API, sonst ist die Begrenzung umgehbar) mit Limits **pro Benutzername** (z. B. zunehmende
  Wartezeit) und pro IP; direkten Passwort-Login gegen `/auth/v1/token` für Schüler/Eltern
  verhindern oder überwachen. Passwortregeln: Eltern mind. 12 Zeichen und Prüfung gegen
  Liste häufiger Passwörter; Kinder: Mindestlänge plus Sperrliste. Fehlversuche protokollieren und
  der Lehrkraft anzeigen. Negativtests: 20 Fehlversuche auf ein Konto aus verschiedenen IPs werden
  gebremst.

#### K-02 · Hoch · Sperre, Lizenzablauf und Rollenentzug wirken verzögert

- **Betroffen:** `ARCHITECTURE.md` §3 (Rolle als JWT-Claim gespiegelt), `SECURITY.md`
  („Sitzungswiderruf bei Sperre“), `config.toml` `jwt_expiry = 3600`.
- **Auswirkung:** Supabase-Access-Tokens sind bis zum Ablauf gültig; ein Abmelden aller Sitzungen
  widerruft nur die Refresh-Tokens. Prüfen RLS oder Server-Code Rolle oder Status anhand des
  JWT-Claims, behält ein gesperrter Elternzugang, ein entzogener Schüler oder eine Lehrkraft mit
  abgelaufener Lizenz bis zu 60 Minuten Zugriff. Das widerspricht den Pflichttests
  („neuer Code beendet laufende Sitzungen“).
- **Abhilfe:** Rolle und Status in RLS und `can_play` immer aus Tabellen lesen (der Claim nur als
  Hinweis für die Oberfläche) oder zusätzlich gegen `auth.sessions` bzw. eine eigene
  Sperrtabelle prüfen. Kurze Token-Laufzeit (z. B. 5 bis 10 Minuten) erwägen. pgTAP-Test: gesperrter
  Nutzer mit noch gültigem JWT kann nichts lesen.

#### K-03 · Hoch · Admin-2FA muss in der Datenbank erzwungen werden

- **Betroffen:** `SECURITY.md` („Admin mit 2FA Pflicht“), `config.toml` (MFA aus).
- **Auswirkung:** In Supabase ist ein mit Passwort angemeldeter Nutzer auch ohne zweiten Faktor
  voll authentifiziert (`aal1`). Prüft nur die Oberfläche oder Middleware den zweiten Faktor, kann
  ein Angreifer mit gestohlenem Admin-Passwort die Daten direkt über die REST-API lesen.
- **Abhilfe:** Alle Admin-Policies und Admin-Funktionen verlangen `auth.jwt()->>'aal' = 'aal2'`
  (restriktive Policy). TOTP in Staging/Produktion aktivieren. Negativtest: Admin mit `aal1`
  liest keine Admin-Daten.

#### K-04 · Mittel · Interne E-Mail-Kennung für Kinder und Eltern

- **Betroffen:** `DATABASE.md` („interne, nicht zustellbare Kennung“).
- **Auswirkung:** Supabase Auth braucht E-Mail oder Telefonnummer. Wird die Kennung aus dem
  Benutzernamen gebildet (`max.mueller@…`), stehen Klarnamen von Kindern in `auth.users`, in
  Auth-Logs und im Supabase-Dashboard. Außerdem sind öffentliche Auth-Endpunkte wie
  `/auth/v1/recover` oder Magic Link mit dieser Adresse aufrufbar.
- **Abhilfe:** Kennung aus zufälliger UUID (`<uuid>@users.invalid`), Benutzername nur in
  `students`/`parent_access`. E-Mail-basierte Abläufe für diese Konten sperren (Auth-Hook oder
  eigener Login-Endpunkt). Test: Passwort-Reset-Anfrage für ein Schülerkonto bewirkt nichts.

#### K-05 · Mittel · Aktivierungscodes und QR-Codes

- **Betroffen:** `ACCOUNT-FLOWS.md`, `DATABASE.md`.
- **Auswirkung:** Konzept grundsätzlich solide (ca. 60 Bit, einmalig, befristet, gehasht). Offen:
  Steckt der Code im QR-Link als URL-Parameter, landet er in Server-/Proxy-Logs, im
  Browserverlauf und ggf. im `Referer`. Ein verbrauchter Code ist harmlos, ein noch nicht
  eingelöster Elterncode nicht.
- **Abhilfe:** Code im URL-Fragment (`#`) oder nur per Formular (POST) übertragen; Hash mit
  geheimem Pepper (HMAC-SHA-256), konstante Laufzeit beim Vergleich; Rate-Limit je IP und global;
  Lehrkraft sieht Zeitpunkt der Einlösung.

#### K-06 · Mittel · Service-Role-Schlüssel in Lehrkraft-Abläufen

- **Betroffen:** `ARCHITECTURE.md` §2 (Service-Role für Kontoanlage).
- **Auswirkung:** Schüleranlage durch die Lehrkraft braucht `auth.admin.createUser`, also den
  Service-Role-Schlüssel, der RLS vollständig umgeht. Ein Fehler in dieser Server Action (fehlende
  Zuständigkeitsprüfung, IDOR über `teacher_id` im Formular) wirkt wie ein Admin-Zugriff.
- **Abhilfe:** Alle Service-Role-Aufrufe in einem Modul (`platform/admin-client.server.ts`) bündeln;
  Lehrkraft-ID nie aus der Anfrage, nur aus der Sitzung; Prüfung über eine SQL-Funktion mit dem
  Nutzer-JWT **vor** dem privilegierten Aufruf; Audit-Eintrag; ESLint-Regel, die den Import außerhalb
  dieses Moduls verbietet; Negativtests je Aktion.

#### K-07 · Mittel · Server Actions als öffentliche Endpunkte

- **Auswirkung:** Jede Server Action ist per POST direkt aufrufbar, unabhängig davon, ob die
  Oberfläche den Knopf zeigt. Next.js prüft Origin gegen Host; hinter einem Reverse-Proxy muss
  `serverActions.allowedOrigins` bzw. der weitergereichte Host korrekt sein. Route-Handler (`route.ts`)
  haben keinen eingebauten CSRF-Schutz.
- **Abhilfe:** In jeder Server Action: Sitzung prüfen, Eingabe mit Zod prüfen, Berechtigung prüfen
  (Hilfsfunktion, die nicht vergessen werden kann). Route-Handler mit Zustandsänderung nur mit
  Origin-Prüfung. Test: Aufruf jeder Action ohne Sitzung und mit fremder Rolle scheitert.

#### K-08 · Mittel · Rate-Limits brauchen eine Infrastrukturentscheidung

- **Auswirkung:** Rate-Limits (Login, Aktivierung, Upload, Ereignisse) brauchen einen gemeinsamen
  Zähler, der mehrere App-Instanzen übersteht. Weder Speicher (Postgres-Tabelle, Redis o. Ä.) noch
  Werte sind festgelegt.
- **Abhilfe:** Entscheidung in `DECISIONS.md` (Empfehlung: Postgres-Tabelle mit Ablauf, keine
  neue Infrastruktur), vor Phase 2b.

#### K-09 · Mittel · Protokollierung: Inhalt, IP-Adressen, Aufbewahrung

- **Auswirkung:** Supabase speichert in Auth-Audit-Logs IP-Adressen und Kennungen; der Hoster der
  App protokolliert Zugriffe. Welche Logs es gibt, was darin steht, wer sie liest und wann sie
  gelöscht werden, ist nicht festgelegt. Sicherheitsrelevante Ereignisse (fehlgeschlagene Anmeldung,
  Codeeinlösung, Sperre, Rollen-/Lizenzänderung) sind nicht vollständig aufgezählt.
- **Abhilfe:** Log-Konzept: Ereignisliste, Felder (nur IDs), keine Passwörter/Codes/Tokens, IP
  gekürzt oder befristet, Aufbewahrung, Zugriff. Test: kein Passwort oder Code im Log.

#### K-10 · Niedrig · Signierte URLs und Speicherlöschung

- **Auswirkung:** Signierte URLs bleiben bis zum Ablauf gültig, auch nach Entzug der Berechtigung.
  Das Löschen von Zeilen in `storage.objects` per SQL löscht die Datei nicht zuverlässig.
- **Abhilfe:** Kurze Laufzeit (z. B. 60 bis 300 s); Löschen nur über die Storage-API; Storage-
  Policies mit pgTAP testen (fremder Pfad, geratener Pfad).

#### K-11 · Niedrig · Trennung der Umgebungen ohne technische Absicherung

- **Auswirkung:** Staging und Produktion existieren noch nicht. Es fehlt ein Mechanismus, der
  verhindert, dass `db:reset` oder Tests gegen ein entferntes Projekt laufen, oder dass Staging
  echte Daten erhält.
- **Abhilfe:** Skripte prüfen, dass die URL lokal ist; getrennte Secrets je GitHub-Environment mit
  Freigabepflicht für Produktion; Claude-Hook, der Befehle gegen Produktion blockiert (bereits geplant).

#### K-12 · Hinweis · Schulen-Zuordnung darf keine Rechte vermitteln

- Konzept korrekt („gleiche Schule gibt keinen Zugriff“). Pflicht-Negativtest ist vorgesehen; bei
  der Implementierung darauf achten, dass keine Policy über `school_teachers` verknüpft.

#### K-13 · Hinweis · Lehrkraft-Limits und parallele Anlage

- Konzept sieht `SELECT … FOR UPDATE` vor. Test mit parallelen Transaktionen (zwei gleichzeitige
  Anlagen beim letzten freien Platz) ergänzen.

### 3.3 Datenschutzbefunde

#### DS-01 · Mittel · Verzeichnis personenbezogener Daten unvollständig

`DATA-PROTECTION.md` nennt die fachlichen Daten, aber nicht: Passwort-Hashes, Sitzungs- und
Refresh-Tokens, IP-Adressen und User-Agents (Auth-Logs, Hoster-Logs), interne Auth-Kennung (K-04),
Aktivierungscode-Hashes und Einlösezeitpunkte, Elternbenutzername (enthält Namen des Kindes),
gedruckte Zugangskarten (Papier), Fehlerberichte, Backups, Einladungs-E-Mails samt Mailanbieter.
Ergänzte Fassung siehe 6.1.

#### DS-02 · Mittel · Löschung in Backups und Wiederherstellung nicht geregelt

Gelöschte Daten bleiben je nach Supabase-Plan 7 bis 30 Tage in Backups bzw. PITR. Nach einer
Wiederherstellung könnten bereits gelöschte Kinderdaten zurückkehren. Fristen, Verfahren
(Löschungen nach Restore erneut anwenden) und Information der Betroffenen sind nicht festgelegt.

#### DS-03 · Niedrig · Kein Verfahren für Datenschutzverletzungen

Es gibt kein dokumentiertes Verfahren zur Erkennung, Bewertung, Meldung (72 Stunden, Art. 33) und
Benachrichtigung (Art. 34), keine Zuständigkeiten, keine Vorlage. Erforderlich vor Produktivbetrieb.

### 3.4 Soll-Testmatrix für Datenbanktabellen

Die Tabellen existieren noch nicht; die Tests können erst mit den Migrationen ausgeführt werden.
Die Matrix ist die Abnahmegrundlage für Phase 2b bis 5. Zeichen: **✓** erlaubt (nur genannte
Zeilen), **✗** muss scheitern (0 Zeilen bzw. Fehler), **F** nur über SQL-Funktion.
Spalten: Anon = nicht angemeldet; S = Schüler; E = Eltern; L = Lehrkraft; A = Admin (`aal2`).
„eigen“ = eigene Zeilen bzw. Zeilen eigener Schüler; „fremd“ = Zeilen anderer Schüler/Lehrkräfte.
Für **jede** Zelle mit ✗ ist ein negativer pgTAP-Test Pflicht, zusätzlich: A mit `aal1` = ✗ überall.

| Tabelle | Op | Anon | S eigen | S fremd | E eigen | E fremd | L eigen | L fremd | A |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| profiles | SELECT | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ (eigene Schüler) | ✗ | ✓ |
| profiles | INSERT/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F | ✗ | F |
| profiles | UPDATE role/status | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | F |
| schools, school_teachers | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ eigene | ✗ | ✓ |
| schools, school_teachers | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| teachers | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ sich selbst | ✗ | ✓ |
| teachers | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | F |
| license_plans | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ eigener Plan | ✗ | ✓ |
| license_plans | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| teacher_licenses | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| teacher_licenses | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | F |
| students | SELECT | ✗ | ✓ | ✗ | ✓ (Anzeigename) | ✗ | ✓ | ✗ | ✗ (nur F mit Begründung) |
| students | INSERT | ✗ | ✗ | ✗ | ✗ | ✗ | F (Limit, Lizenz) | ✗ | ✗ |
| students | UPDATE | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ Namen; ✗ teacher_id | ✗ | ✗ |
| students | DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F | ✗ | F |
| parent_access | SELECT | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| parent_access | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F (sperren, neuer Code) | ✗ | ✗ |
| activation_codes | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | Status über F/View | ✗ | ✗ |
| activation_codes | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F | ✗ | ✗ |
| student_access | SELECT | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| student_access | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F (innerhalb Lizenz) | ✗ | ✗ |
| groups, group_members | SELECT | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| groups, group_members | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (nur eigene Schüler, Trigger) | ✗ | ✗ |
| games | SELECT | ✗ | ✓ aktive | – | ✓ aktive | – | ✓ aktive | – | ✓ alle |
| games | INSERT/UPDATE/DELETE | ✗ | ✗ | – | ✗ | – | ✗ | – | ✓ |
| game_licenses | SELECT | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ (aggregiert F) |
| game_licenses | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | F (Plan, Zeitraum) | ✗ | ✗ |
| game_configs | SELECT | ✗ | Snapshot über Sitzung | ✗ | ✗ | ✗ | ✓ eigener Scope + global | ✗ | ✓ |
| game_configs | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ eigener Scope, wenn erlaubt | ✗ | ✓ global |
| media_assets (+ storage.objects) | SELECT | ✗ | signierte URL nach F | ✗ | ✗ | ✗ | ✓ eigener Scope | ✗ | ✓ |
| media_assets (+ storage.objects) | INSERT/UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | über Server, eigener Scope | ✗ | über Server |
| game_sessions | SELECT | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| game_sessions | INSERT | ✗ | F (`can_play`) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| game_sessions | UPDATE/DELETE | ✗ | F (beenden) | ✗ | ✗ | ✗ | ✗ | ✗ | F (Löschung) |
| game_events | SELECT | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ | ✗ | ✗ |
| game_events | INSERT | ✗ | F (`can_play` bei jedem Ereignis) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| game_events | UPDATE/DELETE | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | F (nur Löschjob) |
| platform_settings | alle | ✗ | ✗ | – | ✗ | – | ✗ | – | ✓ |
| audit_log | SELECT | ✗ | ✗ | – | ✗ | – | ✗ | – | ✓ |
| audit_log | INSERT | ✗ | ✗ | – | ✗ | – | ✗ | – | F (nur Funktionen) |
| audit_log | UPDATE/DELETE | ✗ | ✗ | – | ✗ | – | ✗ | – | ✗ (nur Löschjob nach Frist) |
| game_\<slug\>.* | je Spiel | ✗ | wie game_events | ✗ | lesend wie Statistik | ✗ | ✓ eigener Scope | ✗ | ✓ Inhalte |

Zusätzliche Pflichtfälle je Lizenzstatus (für `can_play`, Sitzungsstart und Ereignis): Lehrkraftlizenz
abgelaufen, gesperrt, widerrufen; Schülerzugang abgelaufen, gesperrt, entzogen; Spiellizenz vor Beginn,
nach Ende, widerrufen; Spiel deaktiviert; Spiel nicht im Plan; Schüler gesperrt; Elternkonto ruft
`start_game_session` auf. Jeweils: keine Sitzung, kein Ereignis, auch per direktem REST-/RPC-Aufruf
und mit noch gültigem JWT (K-02).

---

## 4. Befunddetails

Die Angaben je Befund (betroffene Datei/Funktion/Konfiguration, Auswirkung, Nachweis, Abhilfe) stehen
direkt bei den Befunden in Abschnitt 3. Nachweisdateien liegen in `docs/audit/nachweise/`:

| Datei | Inhalt | Ausführung |
| --- | --- | --- |
| `t2.sql` | Gegenprobe: Tabelle ohne RLS lässt Basistest scheitern | `psql -At -f t2.sql` im Verzeichnis mit `000_baseline.test.sql` |
| `t3.sql` | Standardrechte, View, `SECURITY DEFINER` (A-02) | wie oben |
| `t4.sql` | View umgeht RLS, Test grün (A-01) | wie oben |
| `t5.sql` | Namensabgleich Test 2 (A-03) | wie oben |
| `t6.sql` | Schema außerhalb `public`/`game_*` (A-03) | wie oben |
| `header-pruefung.log` | Antwort-Header des Produktions-Builds (A-05, A-09) | `pnpm build && pnpm start`, dann `curl -D -` |
| `pnpm-audit-alle.log` | Dev-Abhängigkeitslücke (A-07) | `pnpm audit` |

Umgebung für die SQL-Proben: `docker run -e POSTGRES_PASSWORD=… -p 127.0.0.1:55432:5432 supabase/postgres:17.6.1.011`,
nur lokal, ohne Daten, danach gelöscht. Alle Proben enden ohne `COMMIT`.

---

## 5. Nicht geprüfte Bereiche und verbleibende Risiken

| Bereich | Grund | Restrisiko |
| --- | --- | --- |
| Tabellen, Migrationen, RLS-Policies, Funktionen | existieren nicht | Hauptrisiko der Plattform liegt hier; vollständige Prüfung nach Phase 2b, 3, 5 nötig |
| Authentifizierung, Sitzungen, Passwort-Reset, Kontoverwaltung | nicht implementiert | K-01 bis K-04 |
| Lizenzdurchsetzung (Ablauf, Sperre, Widerruf) | nicht implementiert | K-02, Testmatrix 3.4 |
| API-Endpunkte, Server Actions, IDOR | keine vorhanden | K-06, K-07 |
| Uploads, Storage-Policies | nicht implementiert | K-10 |
| Rate-Limits, Missbrauchsschutz | nicht implementiert | K-01, K-08 |
| Fehlerbehandlung und Logs zur Laufzeit | nur Env-Validierung vorhanden | K-09 |
| Deployment, TLS, Reverse-Proxy, Hoster-Logs | kein Deployment | A-09, K-07, K-11 |
| Staging/Produktion, Backups, Wiederherstellung | existieren nicht | DS-02, K-11 |
| GitHub-Einstellungen (Sichtbarkeit, Secret Scanning, Dependabot-Alerts, Zugriffe Dritter) | nicht abrufbar | A-04, A-08; von Alois in den Einstellungen zu prüfen |
| Anbieter-Sicherheit (Supabase, Hoster, Mail) | außerhalb des Codes | Vertrags- und Zertifikatsprüfung |
| Dynamische Tests (DAST) | keine Logik vorhanden | nach Phase 2b mit OWASP ZAP gegen Staging |
| Lokaler Entwicklungsrechner (Windows/macOS), Docker | nicht Teil des Repos | `.env.local` mit Service-Role-Schlüssel nur lokal; Rechner-Sicherheit liegt beim Entwickler |

Allgemeines Restrisiko: Abhängigkeit von der Sicherheit von Supabase, Next.js und npm-Paketen;
Fehlbedienung durch Lehrkräfte (Karten weitergegeben); geteilte Geräte in Schule und Familie.

---

## 6. Datenschutz: außerhalb des Codes zu klärende Fragen

> Alles in diesem Abschnitt ist **nicht aus dem Code prüfbar**. Es muss vom Betreiber (Alois) und
> einer qualifizierten Datenschutzfachperson beurteilt werden. Die Hinweise sind keine
> Rechtsberatung.

### 6.1 Verzeichnis personenbezogener Daten (ergänzter Entwurf)

| Daten | Betroffene | Zweck | Speicherort | Empfänger / Zugriff | Löschung (Entwurf) | Status |
| --- | --- | --- | --- | --- | --- | --- |
| E-Mail, Name, 2FA-Faktor | Admin, Lehrkraft | Konto, Einladung | Supabase Auth, `profiles` | Admin; Mailanbieter | 90 Tage nach Lizenzende | Konzept |
| Vor- und Nachname, Benutzername | Kind | Anmeldung, Zuordnung | `students` | Lehrkraft, Eltern, Kind | mit Konto | Konzept |
| Elternbenutzername (enthält Kindernamen) | Eltern, Kind | Anmeldung | `parent_access` | Lehrkraft | mit Kinderkonto | **neu ergänzt** |
| Interne Auth-Kennung | Kind, Eltern | technische Anmeldung | `auth.users` | Supabase | mit Konto | **neu ergänzt**, K-04 |
| Passwort-Hash | alle | Anmeldung | `auth.users` | Supabase | mit Konto | **neu ergänzt** |
| Sitzungen, Refresh-Tokens | alle | Anmeldung | `auth.sessions`, Cookies | Supabase | Ablauf | **neu ergänzt** |
| IP-Adresse, User-Agent | alle | Sicherheit, Betrieb | Supabase-Auth-Logs, Hoster-Logs, Rate-Limit-Speicher | Supabase, Hoster | festzulegen | **neu ergänzt**, K-09 |
| Aktivierungscode (Hash), Einlösezeit | Kind, Eltern | Aktivierung | `activation_codes` | Lehrkraft (Status) | nach Einlösung/Ablauf | Konzept |
| Gedruckte Zugangskarte | Kind, Eltern | Aktivierung | Papier | Lehrkraft, Familie | Hinweis zur Vernichtung | **neu ergänzt** |
| Freischaltungen | Kind | Lizenzprüfung | `game_licenses`, `student_access` | Lehrkraft, Kind, Eltern | mit Konto | Konzept |
| Spielsitzungen, Ereignisse, Kennzahlen | Kind | Lernstatistik | `game_sessions`, `game_events`, `game_<slug>` | Lehrkraft, Eltern; Admin zweckgebunden | Roh 12 Monate, Aggregate bis Kontolöschung | Konzept; mögliche Art.-9-Nähe (6.2) |
| Audit- und Sicherheitslogs | alle | Nachvollziehbarkeit | `audit_log` | Admin | 12 Monate | Konzept |
| Fehlerberichte | alle | Fehlerbehebung | Monitoring-Dienst (offen) | Anbieter | festzulegen | **neu ergänzt** |
| Backups / PITR | alle | Wiederherstellung | Supabase (Region?) | Supabase | Planabhängig 7 bis 30 Tage | **neu ergänzt**, DS-02 |
| Hochgeladene Medien | ggf. Lehrkraft | Spielinhalte | Storage | nach Scope | mit Inhalt | Konzept; keine Kinderfotos |

### 6.2 Offene rechtliche und betriebliche Entscheidungen

1. **Verantwortlicher (E-8):** Schule/Lehrkraft als Verantwortliche und Betreiber als
   Auftragsverarbeiter, Betreiber als Verantwortlicher, oder gemeinsame Verantwortung. Davon hängen
   AV-Verträge, Informationspflichten und Zuständigkeit für Betroffenenanfragen ab. **Blockiert den
   Produktivbetrieb.**
2. **Rechtsgrundlage** je Nutzergruppe und Land: schulgesetzliche Grundlage (AT, DE-Länder) oder
   Einwilligung der Erziehungsberechtigten; bei Nachhilfe/Therapie vermutlich Vertrag oder
   Einwilligung. Altersgrenzen (Art. 8, AT 14, DE 16) nur bei Diensten der Informationsgesellschaft
   mit Einwilligung relevant.
3. **Besondere Kategorien (Art. 9):** Im Therapiekontext (LRS) können Lerndaten Rückschlüsse auf
   Diagnosen erlauben. Bewerten, ob Therapeuten-Lizenzen anders behandelt werden müssen.
4. **Datenschutz-Folgenabschätzung (Art. 35):** Kinderdaten, systematische Leistungsbewertung,
   möglicherweise großer Umfang. Nach den Positivlisten der Aufsichtsbehörden (AT DSB, DE DSK)
   **wahrscheinlich erforderlich**. Vor Produktivbetrieb durchführen.
5. **Auftragsverarbeiter und Drittland:** Supabase (US-Unternehmen, Unterauftragsverarbeiter u. a.
   AWS), App-Hoster, Mailanbieter, ggf. Fehler-Monitoring: AVV, Unterauftragsverarbeiterlisten,
   Support-Zugriffe aus Drittländern, Rechtsgrundlage für Übermittlungen (EU-US Data Privacy
   Framework bzw. SCC und Transfer-Impact-Assessment), Backup-Standort. Konkrete Regionen
   **schriftlich bestätigen lassen**.
6. **Informationspflichten (Art. 12 bis 14):** Datenschutzhinweise für Lehrkräfte, Eltern und eine
   kindgerechte Fassung; Impressum; Nutzungsbedingungen; Hinweis auf der Elternkarte.
7. **Betroffenenrechte:** Wer beantwortet Auskunft, Berichtigung, Löschung, Datenübertragbarkeit
   (je nach Rolle Schule oder Betreiber), in welcher Frist, mit welcher Identitätsprüfung (Eltern
   ohne E-Mail).
8. **Aufbewahrung:** Fristen (12 Monate, 90 Tage) rechtlich bestätigen lassen; schulrechtliche
   Aufbewahrungspflichten prüfen; Backups (DS-02).
9. **Datenpannen:** Meldeprozess, Zuständigkeiten, Kontakt zur Aufsichtsbehörde, Vorlage (DS-03).
10. **TOMs:** Dokumentation der technischen und organisatorischen Maßnahmen für AVV und DSFA,
    einschließlich Zugangsschutz der Entwicklerrechner und der Konten bei GitHub, Supabase, Hoster
    (2FA für alle Betreiberkonten).
11. **Datenschutzbeauftragter:** Ob eine Benennungspflicht besteht (Art. 37), bewerten.

### 6.3 Was das Konzept bereits gut löst (nicht abschließend geprüft)

Keine Kinder-E-Mails, keine Geburtsdaten, keine Fotos/Sprache; Pseudonymisierung der Statistik
über UUID; kein Tracking, keine externen Laufzeit-Abrufe; Admin-Zugriff auf Lerndaten nur
begründet und protokolliert; keine öffentliche Registrierung; Suchmaschinen ausgeschlossen
(`noindex`, im Test bestätigt).

---

## 7. Priorisierter Maßnahmenplan

Keine Maßnahme ist freigegeben. Reihenfolge nach Risiko und Abhängigkeit.

| Prio | Maßnahme | Befunde | Zeitpunkt | Akzeptanzkriterium |
| --- | --- | --- | --- | --- |
| 1 | `main` anlegen, Branch-Schutz/Ruleset mit Pflicht-Checks | A-04 | sofort | Direkter Push auf `main` wird abgelehnt; PR ohne grüne CI kann nicht gemergt werden |
| 2 | RLS-Basistest erweitern (Views, Schema-Verknüpfung, Schema-Positivliste, Funktionsrechte) | A-01, A-03 | vor erster Migration | Proben t4, t5, t6 lassen den Test scheitern; t2 weiterhin; CI grün auf leerer DB |
| 3 | Erste Migration: Standardrechte entziehen, Funktionsrechte nur ausdrücklich | A-02 | erste Migration (2b) | Probe t3 zeigt keine Rechte für `anon`; pgTAP-Test „keine Funktion für anon ausführbar außer Positivliste“ grün |
| 4 | Entwurf Login- und Rate-Limit-Konzept (eigener Endpunkt, Limits je Benutzername, Passwortregeln, Speicherort) in `DECISIONS.md` | K-01, K-08 | vor 2b | Entscheidung von Alois; Negativtest „20 Fehlversuche aus 20 IPs werden gebremst“ definiert |
| 5 | Rollen/Status nur aus Tabellen prüfen, Token-Laufzeit festlegen | K-02 | 2b | pgTAP: gesperrter Nutzer mit gültigem JWT liest 0 Zeilen und startet keine Sitzung |
| 6 | Admin-Policies mit `aal2`, TOTP in Staging/Prod | K-03 | 2b | pgTAP: Admin mit `aal1` liest/ändert nichts; E2E: Admin ohne 2. Faktor kommt nicht in den Adminbereich |
| 7 | Auth-Kennung aus UUID, E-Mail-Abläufe für Kinder/Eltern gesperrt | K-04 | 2b | Kein Klarname in `auth.users`; Recover-Anfrage für Schülerkonto ohne Wirkung |
| 8 | Service-Role-Modul, Server-Action-Muster, Lint-Regel | K-06, K-07 | 2b | Import des Admin-Clients außerhalb des Moduls bricht Lint; jede Action hat Negativtest ohne Sitzung und mit fremder Rolle |
| 9 | CSP mit Nonces, COOP, no-store für personenbezogene Seiten | A-05, A-09 | 2b | E2E prüft CSP-Header und `no-store` auf geschützten Seiten; keine CSP-Verstöße in der Konsole |
| 10 | Testmatrix 3.4 vollständig als pgTAP umsetzen | 3.4 | je Phase 2b bis 5 | Jede ✗-Zelle hat einen Test, der in CI läuft und grün ist |
| 11 | CI-Härtung: gitleaks, `pnpm audit` alle Pakete mit Ausnahmeliste, Actions per SHA, Dependabot reparieren | A-06, A-07, A-08, A-12 | vor Deploy-Secrets | CI-Job findet einen Test-Schlüssel in einem Probe-Branch; Dependabot-Läufe grün |
| 12 | Aktivierungscode-Details (HMAC, Fragment/POST, Limits) | K-05 | 2b | Kein Code in Server-Logs nach E2E-Aktivierung; Rate-Limit-Test |
| 13 | Log-Konzept, Verzeichnis 6.1 übernehmen | K-09, DS-01 | Phase 6, spätestens vor Staging | `DATA-PROTECTION.md` enthält alle Zeilen aus 6.1; Test: kein Passwort/Code im Log |
| 14 | Umgebungen trennen, Konfigurationstest für Produktion | A-11, K-11 | vor Staging | Skript prüft Region EU, Signup aus, MFA an, Redirect-URLs; Produktion nur mit GitHub-Environment-Freigabe |
| 15 | Backup-/Restore-Konzept mit Löschnachführung, Wiederherstellungstest | DS-02 | vor Produktivbetrieb | Dokumentierter Restore-Test auf Staging; Löschliste wird nach Restore erneut angewendet |
| 16 | Rechtliche Klärungen 6.2 (E-8, Rechtsgrundlage, DSFA, AVV, Hinweise, Datenpannen-Verfahren) | DS-03, 6.2 | vor Produktivbetrieb | Schriftliche Ergebnisse, geprüft von Datenschutzfachperson |
| 17 | Doku-Widersprüche bereinigen | A-13 | vor 2b | D-009 und D-014 widerspruchsfrei; Tabelle in `DATABASE.md` korrekt |
| 18 | Unabhängiges Audit / Penetrationstest | alle | vor Produktivbetrieb | Bericht einer externen Stelle liegt vor, kritische und hohe Befunde behoben |

---

## 8. Ergebnisse der erneuten Prüfung nach Fehlerbehebung

*Noch nicht durchgeführt.* Nach Freigabe und Umsetzung der Maßnahmen wird hier je Befund
eingetragen: Maßnahme, Commit, ausgeführter Nachweis (Befehl, Ergebnis), Status (behoben /
teilweise / offen / akzeptiertes Risiko mit Begründung und Freigabe durch Alois).

| Befund | Maßnahme | Commit | Nachweis | Status |
| --- | --- | --- | --- | --- |
| K-01 | D-017 (Anmeldeschutz) | – | Abnahmetests T-K1-1 bis T-K1-5 (siehe unten) | freigegeben 2026-10-15, Umsetzung Phase 2b |
| K-02 | D-017 (Sperrwirkung) | – | T-K2-1 bis T-K2-3 | freigegeben 2026-10-15, Umsetzung Phase 2b |
| K-03 | D-017 (Admin-2FA) | – | T-K3-1, T-K3-2 | freigegeben 2026-10-15, Umsetzung Phase 2b |

Abnahmetests zu D-017:

| Nr. | Test | Art |
| --- | --- | --- |
| T-K1-1 | 6 Fehlversuche auf ein Konto, auch aus 6 verschiedenen IPs: 6. Versuch wird mit Wartezeit abgelehnt, auch mit richtigem Passwort | Integration/E2E |
| T-K1-2 | 30 Kinder einer Klasse melden sich von einer IP korrekt an: keiner wird gebremst | Integration |
| T-K1-3 | Direkter Login gegen `/auth/v1/token` mit Schüler-Zugangsdaten scheitert | Integration |
| T-K1-4 | Passwort „12345678“ und Passwort = Benutzername werden abgelehnt | Unit |
| T-K1-5 | Kein Passwort im Log nach Fehlversuch | Integration |
| T-K2-1 | Gesperrter Schüler mit noch gültigem Token liest 0 Zeilen und startet keine Sitzung | pgTAP |
| T-K2-2 | Gesperrter Elternzugang mit gültigem Token liest keine Lerndaten | pgTAP |
| T-K2-3 | Lehrkraft mit abgelaufener Lizenz und gültigem Token kann nichts freischalten | pgTAP |
| T-K3-1 | Admin mit `aal1` liest und ändert keine Admin-Daten | pgTAP |
| T-K3-2 | Admin ohne zweiten Faktor kommt nicht in den Adminbereich | E2E |


---

## Anhang: Freigabe-Checkliste für den Produktivbetrieb

Siehe separate Datei `FREIGABE-CHECKLISTE.md`.
