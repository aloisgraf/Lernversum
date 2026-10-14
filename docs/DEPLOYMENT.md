# Hosting und Deployment (EU)

**Stand:** Konzept Phase 1. Kein Anbieter ist gewählt. Verträge, Regionen, Unterauftragnehmer
und Drittlandzugriffe müssen vor der Wahl anhand der aktuellen Anbieterunterlagen geprüft werden;
die folgenden Kandidaten sind **ungeprüft**.

## Betriebsarten

| Betriebsart | Datenbank/Auth/Storage | App | Zweck |
| --- | --- | --- | --- |
| Lokale Entwicklung | Supabase-CLI (Docker) | `pnpm dev` | Entwicklung, Tests |
| Lokaler Produktivbetrieb | Supabase self-hosted (Docker Compose) | Next.js als Docker-Container | z. B. Schulserver |
| Gehosteter Produktivbetrieb | Supabase Cloud, EU-Region | Node-Hosting in der EU | Regelbetrieb |
| Staging | eigenes Supabase-Projekt, EU | eigene App-Instanz | Abnahme, Migrationstests |

## Kandidaten (zu prüfen)

| Dienst | Kandidat | Region | Zu prüfen |
| --- | --- | --- | --- |
| Datenbank, Auth, Storage | Supabase Cloud | Frankfurt (eu-central-1) | DPA, Unterauftragnehmer (u. a. AWS), Support-Zugriffe aus Drittländern, Backup-Standort |
| Datenbank (Alternative) | Supabase self-hosted bei EU-Hoster (z. B. Hetzner) | DE/FI | Betriebsaufwand, Backups, Updates selbst |
| App-Hosting | EU-Anbieter mit Container-Hosting (z. B. Hetzner, Scaleway, OVHcloud) | DE/FR | AV-Vertrag, TLS, Logs |
| App-Hosting (Alternative) | Vercel mit EU-Functions | fra1 | US-Anbieter, globales CDN und Logs, Drittlandübermittlung |
| App-Hosting (Alternative) | Render | Frankfurt | US-Anbieter (Drittlandzugriff, CLOUD Act), sonst einfachstes Deployment |
| App-Hosting (Alternative) | EU-PaaS, z. B. Scalingo oder Clever Cloud | FR | EU-Anbieter, Git-Deployment wie Render; Preise und AVV prüfen |
| E-Mail (Einladungen) | EU-Mailanbieter | EU | AV-Vertrag, nur Lehrkraft-/Admin-E-Mails |
| Fehler-Monitoring | Sentry EU-Region oder selbst gehostet | EU | keine personenbezogenen Daten in Fehlerberichten |

**Empfehlung vorläufig:** Supabase Cloud Frankfurt + App als Container bei einem EU-Hoster.
Das hält alle Daten in der EU und lässt den Wechsel zu self-hosted ohne Code-Änderung zu.

## Je Dienst zu dokumentieren

Anbieter · konkrete Region · Art der Daten · Zugriffsmöglichkeiten (inkl. Support) ·
Backup-Standorte · DPA/AVV und Unterauftragnehmer · Ergebnis der Prüfung.

## Deployment-Ablauf (geplant)

1. PR → CI (Lint, Typen, Unit, DB-Tests, E2E gegen lokale Supabase).
2. Merge auf `main` → Migrationen auf Staging, Deploy Staging, Smoke-Tests.
3. Freigabe durch Alois → Migrationen auf Produktion (nach Backup), Deploy Produktion.
4. Geheimnisse nur in der Secret-Verwaltung des Hosters bzw. GitHub Actions Secrets.
