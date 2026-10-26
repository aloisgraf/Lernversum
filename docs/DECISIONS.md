# Entscheidungen

Status: **verbindlich** (von Alois bestätigt), **vorläufig** (Vorschlag) oder **ersetzt**.
Vorläufige Entscheidungen zu Sicherheit, Datenmodell, Kosten, Lizenzen oder Grundarchitektur
sind keine Grundlage für Implementierung. Größere Entscheidungen bekommen später eigene ADRs
in `docs/adr/`.

## D-001 Projektregeln — verbindlich (2026-10-14)

Die Entwicklungsregeln von Alois gelten für das gesamte Projekt (Kurzfassung `CLAUDE.md`).

## D-002 Master-Prompt als fachliche Grundlage — verbindlich (2026-10-14)

Rollen Admin/Lehrkraft/Schüler, drei Lizenzebenen, Spiele als Produktmodule, EU-Hosting.

## D-003 Tech-Stack — vorläufig

Next.js + TypeScript, Supabase (Postgres, RLS, Auth, Storage), Zod, Tailwind + Radix, Vitest,
pgTAP, Playwright, pnpm, GitHub Actions. Begründung und verworfene Alternativen:
`ARCHITECTURE.md` Abschnitt 1.

## D-004 Lizenzpläne statt verteilter Limits — vorläufig

Limits stehen in `license_plans` und werden nur in SQL-Funktionen geprüft.

## D-005 Zugriffsprüfung in einer SQL-Funktion `can_play` — vorläufig

Genutzt bei Bibliothek, Sitzungsstart und jedem Ereignis.

## D-006 Statistik als Sitzungen + versionierte Ereignisse, Kennzahlen pro Spiel — vorläufig

## D-007 Spielspezifische Daten in eigenem DB-Schema `game_<slug>` — vorläufig

## D-008 Hosting: Supabase Cloud Frankfurt + App-Container bei EU-Hoster — Richtung verbindlich (D-011), Anbieterprüfung offen

## D-009 Zugang in Version 1: Admin legt Lehrkräfte an — teilweise ersetzt durch D-018 (2026-10-21)

Keine Selbstregistrierung und keine Zahlung in V1. Eltern und Lerntherapeuten werden als
Lehrkraft mit eigenem Lizenzplan angelegt (z. B. „Eltern“: max. 1 Schüler, keine Gruppen).
Online-Kauf kann später einen geprüften Zahlungs-Webhook als Ersatz für den Admin-Schritt ergänzen.

## D-010 Einrichtungen mit Schulcode — ersetzt durch D-012

## D-012 Schüler mit mehreren Lehrkräften, Schulen optional — ersetzt durch D-014 (Schulen bleiben optional)

Ein Schüler hat ein Konto und kann mit mehreren Lehrkräften verknüpft sein. Lehrkräfte haben einen
eindeutigen Lehrercode und gehören zu keiner, einer oder mehreren Schulen. Jede Lehrkraft sieht nur
Daten aus ihren eigenen Freischaltungen. Verknüpfungsablauf und Schüler-Login: Entwurf/offen (E-13, E-14).

## D-011 Weitere Festlegungen — verbindlich (2026-10-14)

- App-Hosting bei einem EU-Container-Hoster statt Vercel (E-3); Supabase Cloud Frankfurt nach
  Vertragsprüfung (E-4). Konkrete Anbieter erst nach Prüfung der Bedingungen.
- Ablauf Lehrkraftlizenz: Spielen gesperrt, Lehrkraft 90 Tage nur lesend, dann Löschung (E-5).
- Fristen: Rohereignisse 12 Monate, Logs 12 Monate, Konten 90 Tage nach Lizenzende (E-6).
- Admin-Zugriff auf Lerndaten nur mit Begründung, befristet, protokolliert (E-7).
- Klassen/Gruppen optional (E-9).
- Inhalte zuerst je Spiel, da jedes Spiel andere Anforderungen hat (E-10).
- Repository privat (E-11). Windows-Entwicklung mit WSL 2 (E-12).

## D-013 Schüler-Login mit eigenem Login-Namen — ersetzt durch D-014

Eindeutiger Login-Name + Passwort, unabhängig von Lehrkräften und Schulen. Lehrercodes dienen nur
zum Verknüpfen.

## D-014 Ein Lehrer pro Schüler, Code-Login, Elternzugang — verbindlich (2026-10-14)

Ersetzt D-012 und D-013. Die Lehrkraft legt ihre Klasse und Schüler an. Jeder Schüler erhält einen
Schülercode zum Anmelden; gleichzeitig wird ein Elterncode erzeugt, mit dem die Eltern nur lesend
den Fortschritt ihres Kindes sehen. Ein Schüler gehört vorerst genau einer Lehrkraft und seinen
Eltern. Mehrere Lehrkräfte pro Schüler bleiben als spätere Erweiterung möglich.

## D-015 Aktivierung per Code, danach Benutzername + eigenes Passwort — verbindlich (2026-10-14)

Ergänzt D-014. Schüler- und Elterncode werden einmal eingelöst. Danach meldet sich der Schüler mit
`vorname.nachname` und selbst gewähltem Passwort an. Benutzername der Eltern: Vorschlag
`eltern.vorname.nachname` des Kindes (noch zu bestätigen).

## D-016 Werkzeugversionen im Grundgerüst — verbindlich (2026-10-14)

- Node 22 LTS, pnpm 10 (über Corepack), Next.js 16.3, React 19, Tailwind 4, Zod 4.
- TypeScript 5 statt 7: `typescript-eslint` unterstützt TypeScript 7 noch nicht.
- ESLint 9 statt 10: `eslint-plugin-react` (über `eslint-config-next`) läuft noch nicht mit ESLint 10.
- Paketversionen müssen mindestens 14 Tage alt sein (`minimumReleaseAge`).
- Kein `output: "standalone"` vorerst; kommt mit dem Docker-Deployment.

## D-017 Anmeldeschutz, Sperrwirkung und Admin-2FA — verbindlich (2026-10-15)

Aus dem Sicherheitsaudit (`SECURITY-AUDIT.md`, K-01 bis K-03). Umsetzung mit Phase 2b.

- **Anmeldeschutz (K-01):** Schüler und Eltern melden sich nur über einen eigenen Server-Endpunkt
  an; der direkte Passwort-Login gegen die Supabase-Auth-API wird für sie unterbunden. Je
  Benutzername nach 5 Fehlversuchen 1 Minute Wartezeit, danach jeweils doppelt so lang, höchstens
  15 Minuten, keine Dauersperre. Je IP-Adresse 100 Versuche in 5 Minuten. Zähler in einer
  Postgres-Tabelle (keine neue Infrastruktur). Passwörter: Kinder mindestens 8, Eltern mindestens
  12 Zeichen, keine häufigen Passwörter, nicht der eigene Benutzername. Gleiche Fehlermeldung für
  falschen Namen und falsches Passwort; Fehlversuche nur mit IDs protokolliert.
- **Sperrwirkung (K-02):** Rolle, Konto- und Lizenzstatus werden in RLS, `can_play` und
  Server-Code immer aus den Tabellen gelesen; der Rollen-Claim im Token dient nur der Oberfläche.
  Zugriffstoken gelten 10 Minuten (`jwt_expiry = 600`). Sperre und neuer Aktivierungscode beenden
  alle Sitzungen.
- **Admin-2FA (K-03):** Alle Admin-Policies und Admin-Funktionen verlangen `aal2`. TOTP ist in
  Staging und Produktion aktiviert und für Admins Pflicht.
- **Abnahme:** Tests T-K1-1 bis T-K3-2 laut `SECURITY-AUDIT.md`, Abschnitt 8, in CI grün.

## D-018 Lizenzpakete, Laufzeiten und Einzelanmeldung — vorläufig (2026-10-21)

Vorgabe von Alois; Details in `ACCOUNT-FLOWS.md`, Abschnitte 0, 2a und 4a.

- Pakete: Elternlizenz (1 Kind), Lerntherapie (6, 12 oder 20 Kinder), Schule/Lehrperson
  (20 Kinder). Laufzeiten 3, 6 oder 12 Monate. Umsetzung über `license_plans`.
- Bei der Elternlizenz ist der Elternteil Lizenznehmer und legt sein Kind selbst an.
- Je Konto höchstens eine aktive Sitzung; Weitergabe der Zugangsdaten kann zur Sperre führen
  (AGB).
- **Online-Kauf in Selbstbedienung (von Alois entschieden, 2026-10-21):** Privatpersonen und
  Unternehmen kaufen ihre Lizenz online; Konto und Lizenz entstehen erst nach vom
  Zahlungsanbieter bestätigter Zahlung. Ersetzt in D-009 „keine Selbstregistrierung, keine
  Zahlung in V1“. Der Admin kann weiterhin manuell anlegen.
- Zahlungsanbieter ist neue Infrastruktur: Auswahl mit Kosten, AVV und Anbieterbindung wird
  hier dokumentiert, bevor er eingebunden wird (L-5).
- Offene Punkte L-2 bis L-7 in `ACCOUNT-FLOWS.md`; erst danach insgesamt verbindlich.

## D-019 Demo-Login für die DEV-Seite — vorläufig (2026-10-23)

Auf Wunsch von Alois: ein Test-Login mit groben Admin- und Benutzerseiten, bevor es eine
Datenbank gibt. Zwei feste Konten (`admin`, `testuser`); Passwörter nur als
Server-Umgebungsvariablen in Coolify, nie im Repository. Ohne `DEMO_LOGIN=on` und gültige
Passwörter ist der Login aus. Sitzungen nur im Speicher des Servers (Neustart meldet alle ab),
je Konto eine Sitzung (D-018), Anmeldeschutz nach D-017. Geschützte Seiten prüfen die Rolle
serverseitig bei jeder Anfrage. Kein Ersatz für Phase 2b: wird mit der echten Anmeldung über
Supabase entfernt. Nur Testdaten.

## D-020 Ausnahme von der 14-Tage-Regel für Sicherheitsupdates — verbindlich nach Freigabe (2026-10-23)

Next.js 16.0 bis 16.4.0 hat kritische Lücken (u. a. Codeausführung ohne Anmeldung,
GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr; DoS GHSA-p3m5-59mp-jv5r). Die behobene Version
16.4.2 ist jünger als 14 Tage. Das Risiko einer bekannten, öffentlich ausnutzbaren Lücke auf dem
DEV-Server wiegt schwerer als das Risiko einer kompromittierten Neuveröffentlichung des
Herstellers. Darum `minimumReleaseAgeExclude` nur für `next`, `@next/*` und `eslint-config-next`;
nach dem 2026-10-29 wieder entfernen. Regel für künftige Fälle: Ausnahmen nur für behobene
kritische oder hohe Lücken, auf die betroffenen Pakete begrenzt und befristet.

Nachtrag 2026-10-24 (nach dieser Regel): Zod unter 4.6.6 hat eine hohe Lücke
(GHSA-mrhx-c7xc-m3w5, Speichererschöpfung bei übergroßen begrenzten Sammlungen). Die behobene
Version ist jünger als 14 Tage; `zod` steht deshalb ebenfalls bis 2026-10-29 in der Ausnahme.

## D-021 Test-Admin als Prototyp — vorläufig (2026-10-23)

Alois hat „Prototyp“ gewählt: ein klickbarer Adminbereich auf der DEV-Seite, um die Abläufe
auszuprobieren (Lizenznehmer anlegen, Lizenz mit Paket und Laufzeit zuweisen, Kinder mit
Kinder- und Elternkarte anlegen, Spiele freischalten, Themen anlegen und Spielen zuordnen).
Daten nur im Speicher des Servers, nach jedem Neustart weg; Beispieldaten frei erfunden. Regeln
wie geplant: Paket passt zur Art des Lizenznehmers, Kinderlimit, Freischaltung nur innerhalb
der Lizenzlaufzeit, Codes nur einmal angezeigt und nur als Prüfwert gespeichert, jede Aktion
prüft serverseitig die Admin-Rolle. Kein Ersatz für Phase 2b/3: Datenmodell und Oberfläche
dienen als Vorlage, die Umsetzung erfolgt dann in Supabase mit RLS und pgTAP-Tests.

## D-022 Designpaket übernommen (Schritt 1 und 2) — vorläufig (2026-10-24)

Alois hat das Designpaket geliefert und Schritt 1 und 2 freigegeben: Farb-Tokens, Schrift
Nunito, Wortmarke, Startseite, Login, Test-Admin im Dashboard-Stil, Kinderbereich als
Weltkarte (Themen als Planeten). Abweichungen vom Paket: zusätzliches Aktionsblau `#1C6FC9`
für Knöpfe mit weißer Schrift (Paket-Blau erreicht nur 3,0), Nunito statt Trebuchet MS in der
Wortmarke, Planeten als einfache SVG-Platzhalter. Nunito (SIL OFL) wird beim Build geladen und
selbst ausgeliefert. Die Logo-Schrift und Illustrationen aus dem Paket werden erst eingebaut,
wenn Herkunft und Lizenz geklärt sind. Details in `DESIGN-SYSTEM.md`.
Nachtrag 2026-10-24: Für Wortmarke und große Überschriften Fredoka (SIL OFL) statt Nunito,
weil Alois die Schrift im Vergleich zum UI-Konzept unpassend fand.
Nachtrag 2026-10-26: Auf Wunsch von Alois Patrick Hand (SIL OFL) für die Wortmarke und im
Kinderbereich (Überschriften, Knöpfe), selbst ausgeliefert; der Admin bleibt bei Fredoka und
Nunito, Fließtext überall Nunito. Admin-Bedienelemente im Stil „spielerisches Flat Design mit plastischen
Schatten“: Pill-Buttons, Datentabellen, Status-Pillen.

## D-023 Kinderprofil mit Spitzname und Avatar — vorläufig (2026-10-24)

Alois wünscht: Das angemeldete Kind sieht in seinem Profil seinen Namen, kann einen Spitznamen
vergeben und einen Avatar auswählen; die Zeichnungen (Lernwelten, Avatare) übernimmt vorerst
Claude im Stil des UI-Konzepts. Umsetzung im Prototyp: Seite `/bereich/profil`, nur für die
Rolle Benutzer, Server-Aktion speichert nur das eigene Profil, Spitzname 2 bis 20 Buchstaben,
Avatar aus acht festen Zeichnungen, kein Bild-Upload. Daten nur im Speicher. In Phase 2b/3
kommt das Profil in die Datenbank (eigene Zeile je Schüler, RLS: Kind ändert nur sein Profil).
Lehrkraft und Eltern sehen den Spitznamen und können ihn zurücksetzen (Alois, 2026-10-24);
umgesetzt wird das mit den Lehrkraft- und Elternbereichen.

## D-024 Admin-Aufbau: Benutzername mit Erstpasswort, Kategorien mit Stufen, Lernpakete — vorläufig (2026-10-26)

Alois hat den Aufbau des Adminbereichs vorgegeben und den Plan (`plaene/admin-aufbau.md`)
Punkt für Punkt bestätigt. Umgesetzt im Prototyp (Daten nur im Speicher):

- **Kinderkonten:** Der Admin wählt den Benutzernamen frei (3 bis 30 Zeichen, Kleinbuchstaben,
  Ziffern, `.`, `_`, `-`) und legt ein Erstpasswort fest. Nach der ersten Anmeldung muss das
  Kind das Passwort ändern; vorher erreicht es keine andere Seite. Das ersetzt für vom Admin
  angelegte Kinder vorerst die Aktivierungscodes und Karten aus D-014/D-015. Elternzugang mit
  freiem Benutzernamen kommt mit dem Elternbereich.
- **Passwortregeln** (NIST SP 800-63B, BSI): Kinder mindestens 8, Erwachsene mindestens 12
  Zeichen, höchstens 128; Abgleich mit häufigen Passwörtern, kein Benutzername im Passwort,
  kein Zeichenklassen-Zwang, kein regelmäßiger Zwangswechsel. Gespeichert wird nur ein
  scrypt-Hash, auch das Erstpasswort.
- **Kategorien** mit den Stufen einfach, mittel, schwer; der Admin ordnet Spiele den Stufen
  zu. Ein Spiel darf in mehreren Kategorien und Stufen stehen.
- **Lernpaket:** Freigabe an ein Kind aus ganzen Stufen und/oder einzelnen Spielen,
  unbefristet (dann bis Lizenzende) oder mit Ablaufdatum. Nach Ablauf oder Beenden sieht das
  Kind die Spiele nicht mehr, aber seine Ergebnisse. Das Paket bleibt im Admin mit erstellt,
  gültig bis, beendet, Inhalt und Spielrunden (gespielt am, Dauer, Aufgaben, Fehlversuche).
- Das Kind sieht nur Spiele, nie Stufen; Ergebnisse als Sterne, ohne Vergleich mit anderen.
- Spielrunden ohne Geräte- oder Ortsdaten; einzelne Runden 12 Monate, danach nur eine
  Zusammenfassung je Paket.
- Die öffentliche Spieleseite ist entfernt; Spiele öffnen nur angemeldete Kinder mit gültiger
  Freigabe (serverseitig geprüft). Zum Testen bekommt `testuser` Lernpakete wie ein Kind.
- **Vorläufig, Rückfrage offen:** Wird einer freigegebenen Stufe später ein Spiel zugeordnet,
  erscheint es beim Kind automatisch (Stufen werden bei jeder Anfrage aufgelöst).

In Phase 2b/3 wird das in Supabase mit RLS umgesetzt; der Prototyp dient als Vorlage.

## D-025 Loginzettel mit QR-Code — vorläufig (2026-10-26)

Alois wünscht: Nach dem Anlegen eines Kindes druckt der Admin einen Loginzettel mit QR-Code
zur Website, Benutzername und Erstpasswort. Umsetzung: Der Zettel erscheint nur in der
Antwort auf „Kind speichern“ oder „Neues Erstpasswort setzen“ und wird über die
Druckfunktion des Browsers gedruckt (nur der Zettel). Das Passwort wird nirgends
gespeichert und ist nach dem Neuladen weg; verloren heißt: neues Erstpasswort setzen. Der
QR-Code enthält nur die Adresse der Anmeldeseite, nie Zugangsdaten. Adresse aus `LOGIN_URL`
oder aus der Anfrage des Admins (Host streng geprüft).

Neue Bibliothek `qrcode-generator` 2.0.4 (MIT, keine Abhängigkeiten, Version älter als
14 Tage): erzeugt nur die QR-Matrix auf dem Server, gezeichnet wird als eigenes SVG ohne
`dangerouslySetInnerHTML`. Nutzen: kein eigener QR-Encoder (fehleranfällig), keine
Bild-Abrufe bei Dritten. Kosten: eine kleine Laufzeitabhängigkeit. Alternative `qrcode`
verworfen, weil sie Kommandozeilen-Abhängigkeiten mitbringt.

## D-026 Feuerplanet mit Funki — vorläufig (2026-10-26)

Alois wünscht: Der erste Planet wird wie seine Vorlage gestaltet (Lavaplanet, passender
Hintergrund), ein Lava-Alien steht am Seitenrand, begrüßt das Kind mit Namen, bittet um das
erste Spiel und lobt nach jedem Spiel mit wechselnden Sätzen. Umsetzung: Planeten der
Weltkarte führen auf eine eigene Seite `/bereich/welt/[id]` mit den freigegebenen Spielen
dieser Kategorie. Die erste Kategorie ist der Feuerplanet mit Funki; weitere Welten zeigen
vorerst die Insel ohne Begleiter. Verwendet wird das Bild von Alois selbst (er hat die
Rechte daran bestätigt, 2026-10-26): als Szene mit Planet und Funki am rechten Rand und als
runder Ausschnitt des Planeten auf der Weltkarte, beide als WebP im Projekt; eine eigene
SVG-Nachzeichnung fand Alois unpassend und wurde verworfen. Funkis Sätze (`src/lib/welten/funki.ts`) wählen nach der Zahl der Runden, nicht nach
Zufall; keine Vergleiche mit anderen Kindern. Die Seite prüft serverseitig, dass ein laufendes
Lernpaket Spiele dieser Welt enthält, sonst geht es zurück zur Weltkarte.

## Ersetzt

- Früheres Konzept „Elternlizenz / Therapeutenlizenz mit Kauf“ und „Themenstruktur mit
  gemeinsamer Wortliste je Thema“: durch D-002 ersetzt bzw. offen (siehe `STATUS.md`, E-1, E-10).
- Frühere Empfehlung Vercel-Hosting: durch D-008 ersetzt (EU-Anforderung).
