import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Demo-Login nur für die DEV-Seite (D-019, vorläufig). Ersetzt keine echte Anmeldung:
// keine Datenbank, Sitzungen nur im Speicher des Servers. Wird in Phase 2b durch die
// Anmeldung über Supabase ersetzt und dann entfernt.

export type DemoRole = "admin" | "user";

export type DemoUser = { username: string; role: DemoRole; password: string };

// Gründe, warum der Login aus ist. Enthalten nie Werte, nur welche Bedingung fehlt.
export type DisabledReason =
  "DEMO_LOGIN_NICHT_ON" | "ADMIN_PASSWORT_ZU_KURZ" | "USER_PASSWORT_ZU_KURZ" | "PASSWOERTER_GLEICH";

export type DemoAuthConfig =
  | { enabled: false; reasons: readonly DisabledReason[] }
  | { enabled: true; users: readonly DemoUser[] };

export const MIN_PASSWORD_LENGTH = 12;
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// Eingeschaltet nur mit DEMO_LOGIN=on und zwei ausreichend langen Passwörtern aus der
// Server-Umgebung. Fehlt etwas, bleibt der Login aus (sicherer Standard).
export function parseDemoAuthConfig(env: Record<string, string | undefined>): DemoAuthConfig {
  // Leerzeichen am Rand entfernen: Sie entstehen leicht beim Kopieren in die Servereinstellungen.
  const adminPassword = (env.DEMO_ADMIN_PASSWORD ?? "").trim();
  const userPassword = (env.DEMO_USER_PASSWORD ?? "").trim();
  const reasons: DisabledReason[] = [];
  if ((env.DEMO_LOGIN ?? "").trim().toLowerCase() !== "on") reasons.push("DEMO_LOGIN_NICHT_ON");
  if (adminPassword.length < MIN_PASSWORD_LENGTH) reasons.push("ADMIN_PASSWORT_ZU_KURZ");
  if (userPassword.length < MIN_PASSWORD_LENGTH) reasons.push("USER_PASSWORT_ZU_KURZ");
  if (adminPassword.length > 0 && adminPassword === userPassword) {
    reasons.push("PASSWOERTER_GLEICH");
  }
  if (reasons.length > 0) return { enabled: false, reasons };
  return {
    enabled: true,
    users: [
      { username: "admin", role: "admin", password: adminPassword },
      { username: "testuser", role: "user", password: userPassword },
    ],
  };
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

// Vergleicht immer gegen einen Wert, auch bei unbekanntem Benutzernamen, damit Antwortzeit
// und Ergebnis nicht verraten, ob es den Namen gibt.
export function findUser(
  config: DemoAuthConfig,
  username: string,
  password: string,
): DemoUser | null {
  if (!config.enabled) return null;
  const user = config.users.find((candidate) => candidate.username === username);
  const expected = digest(user?.password ?? "kein-benutzer-vorhanden");
  const passwordMatches = timingSafeEqual(digest(password), expected);
  return user && passwordMatches ? user : null;
}

export type DemoSession = { username: string; role: DemoRole; expiresAt: number };

// Je Konto nur eine Sitzung (D-018): Eine neue Anmeldung beendet die alte.
export class SessionStore {
  private readonly byToken = new Map<string, DemoSession>();
  private readonly tokenByUser = new Map<string, string>();

  create(user: Pick<DemoUser, "username" | "role">, now: number): string {
    const previous = this.tokenByUser.get(user.username);
    if (previous) this.byToken.delete(previous);
    const token = randomBytes(32).toString("base64url");
    this.byToken.set(token, {
      username: user.username,
      role: user.role,
      expiresAt: now + SESSION_TTL_MS,
    });
    this.tokenByUser.set(user.username, token);
    return token;
  }

  get(token: string | undefined, now: number): DemoSession | null {
    if (!token) return null;
    const session = this.byToken.get(token);
    if (!session) return null;
    if (session.expiresAt <= now) {
      this.delete(token);
      return null;
    }
    return session;
  }

  delete(token: string): void {
    const session = this.byToken.get(token);
    if (!session) return;
    this.byToken.delete(token);
    if (this.tokenByUser.get(session.username) === token) {
      this.tokenByUser.delete(session.username);
    }
  }

  hasActiveSession(username: string, now: number): boolean {
    const token = this.tokenByUser.get(username);
    return token !== undefined && this.get(token, now) !== null;
  }
}

// Anmeldeschutz nach D-017: je Benutzername nach 5 Fehlversuchen 1 Minute Wartezeit,
// danach jeweils doppelt so lang, höchstens 15 Minuten, keine Dauersperre.
export const FREE_ATTEMPTS = 5;
const BASE_WAIT_MS = 60 * 1000;
const MAX_WAIT_MS = 15 * 60 * 1000;
const MAX_TRACKED_NAMES = 10_000;

export class LoginThrottle {
  private readonly state = new Map<string, { failures: number; blockedUntil: number }>();

  waitMs(username: string, now: number): number {
    const entry = this.state.get(username);
    return entry ? Math.max(0, entry.blockedUntil - now) : 0;
  }

  recordFailure(username: string, now: number): void {
    // Schutz gegen Speicherüberlauf durch viele erfundene Benutzernamen.
    if (!this.state.has(username) && this.state.size >= MAX_TRACKED_NAMES) this.state.clear();
    const entry = this.state.get(username) ?? { failures: 0, blockedUntil: 0 };
    entry.failures += 1;
    if (entry.failures >= FREE_ATTEMPTS) {
      const step = entry.failures - FREE_ATTEMPTS;
      entry.blockedUntil = now + Math.min(BASE_WAIT_MS * 2 ** step, MAX_WAIT_MS);
    }
    this.state.set(username, entry);
  }

  recordSuccess(username: string): void {
    this.state.delete(username);
  }
}
