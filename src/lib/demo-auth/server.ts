import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { adminStore } from "@/lib/demo-admin/server";
import type { Child } from "@/lib/demo-admin/store";
import {
  LoginThrottle,
  SESSION_TTL_MS,
  SessionStore,
  findUser,
  parseDemoAuthConfig,
  type DemoRole,
  type DemoSession,
} from "./core";

export const SESSION_COOKIE = "lv_demo_session";

// Ein Speicher pro Serverprozess. Ein Neustart oder neues Deployment meldet alle ab.
const globalStore = globalThis as typeof globalThis & {
  __lvDemoAuth?: { sessions: SessionStore; throttle: LoginThrottle };
};
const state = (globalStore.__lvDemoAuth ??= {
  sessions: new SessionStore(),
  throttle: new LoginThrottle(),
});

export function demoAuthConfig() {
  return parseDemoAuthConfig(process.env);
}

export type LoginResult = { ok: true; role: DemoRole } | { ok: false; waitMs: number };

export async function login(username: string, password: string): Promise<LoginResult> {
  const now = Date.now();
  const waitMs = state.throttle.waitMs(username, now);
  if (waitMs > 0) return { ok: false, waitMs };

  // Zuerst die festen Demo-Konten, dann die im Test-Admin angelegten Kinder.
  const config = demoAuthConfig();
  const envUser = findUser(config, username, password);
  const child = !envUser && config.enabled ? adminStore().verifyLogin(username, password) : null;
  const user = envUser ?? (child ? { username: child.username, role: "user" as const } : null);
  if (!user) {
    state.throttle.recordFailure(username, now);
    return { ok: false, waitMs: state.throttle.waitMs(username, now) };
  }
  state.throttle.recordSuccess(username);
  const token = state.sessions.create(user, now);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return { ok: true, role: user.role };
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) state.sessions.delete(token);
  jar.delete(SESSION_COOKIE);
}

export async function currentSession(): Promise<DemoSession | null> {
  // cookies() zuerst: macht jede aufrufende Seite dynamisch, auch wenn der Login beim Build
  // ausgeschaltet ist. Sonst würde eine geschützte Seite beim Build statisch vorgerendert.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!demoAuthConfig().enabled) return null;
  return state.sessions.get(token, Date.now());
}

// Serverseitige Prüfung für jede geschützte Seite: ohne Sitzung zur Anmeldung, mit falscher
// Rolle 404, damit nicht verraten wird, dass es den Bereich gibt.
export async function requireRole(role: DemoRole): Promise<DemoSession> {
  const session = await currentSession();
  if (!session) redirect("/login");
  if (session.role !== role) notFound();
  if (role === "user") {
    const child = kindZurSitzung(session);
    // Gelöschtes Kind: Sitzung gilt nicht mehr.
    if (child === null) {
      state.sessions.deleteUser(session.username);
      redirect("/login");
    }
    // Erstpasswort: Bis zum Wechsel ist nichts anderes erreichbar.
    if (child?.mustChangePassword) redirect("/passwort-aendern");
  }
  return session;
}

// Kind-Datensatz zur Sitzung. undefined: festes Demo-Konto ohne Datensatz; null: gelöscht.
function kindZurSitzung(session: DemoSession): Child | null | undefined {
  const child = adminStore().childByUsername(session.username);
  if (child) return child;
  const istDemoKonto = demoAuthConfig().enabled && session.username === "testuser";
  return istDemoKonto ? undefined : null;
}

// Für die Seite „Passwort ändern“: angemeldetes Kind, auch wenn der Wechsel noch aussteht.
export async function requireKindFuerPasswortwechsel(): Promise<{
  session: DemoSession;
  child: Child;
}> {
  const session = await currentSession();
  if (!session) redirect("/login");
  if (session.role !== "user") notFound();
  const child = adminStore().childByUsername(session.username);
  if (!child?.passwordHash) notFound();
  return { session, child };
}

// Das Kind zur Sitzung, für Seiten im Kinderbereich (nach requireRole("user")).
export function kindDerSitzung(session: DemoSession): Child | undefined {
  return adminStore().childByUsername(session.username);
}

// Beendet die Sitzung eines Kontos, z. B. wenn der Admin ein Kind löscht.
export function beendeSitzung(username: string): void {
  state.sessions.deleteUser(username);
}

export function hasActiveSession(username: string): boolean {
  return state.sessions.hasActiveSession(username, Date.now());
}
