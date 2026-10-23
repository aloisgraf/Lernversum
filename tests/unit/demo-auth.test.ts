import { describe, expect, it } from "vitest";
import {
  FREE_ATTEMPTS,
  LoginThrottle,
  SESSION_TTL_MS,
  SessionStore,
  findUser,
  parseDemoAuthConfig,
} from "@/lib/demo-auth/core";

const env = {
  DEMO_LOGIN: "on",
  DEMO_ADMIN_PASSWORD: "admin-passwort-lang",
  DEMO_USER_PASSWORD: "user-passwort-lang",
};

describe("parseDemoAuthConfig", () => {
  it("ist ohne Einstellungen ausgeschaltet", () => {
    expect(parseDemoAuthConfig({}).enabled).toBe(false);
  });

  it("bleibt aus, wenn DEMO_LOGIN nicht 'on' ist", () => {
    expect(parseDemoAuthConfig({ ...env, DEMO_LOGIN: "true" }).enabled).toBe(false);
    expect(parseDemoAuthConfig({ ...env, DEMO_LOGIN: "" }).enabled).toBe(false);
  });

  it("bleibt aus bei zu kurzen oder gleichen Passwörtern", () => {
    expect(parseDemoAuthConfig({ ...env, DEMO_USER_PASSWORD: "kurz" }).enabled).toBe(false);
    expect(
      parseDemoAuthConfig({ ...env, DEMO_USER_PASSWORD: env.DEMO_ADMIN_PASSWORD }).enabled,
    ).toBe(false);
  });

  it("nennt die Gründe, ohne Werte preiszugeben", () => {
    const config = parseDemoAuthConfig({ DEMO_LOGIN: "on", DEMO_ADMIN_PASSWORD: "kurz" });
    expect(config).toEqual({
      enabled: false,
      reasons: ["ADMIN_PASSWORT_ZU_KURZ", "USER_PASSWORT_ZU_KURZ"],
    });
    expect(JSON.stringify(config)).not.toContain('kurz"');
  });

  it("toleriert Groß-/Kleinschreibung und Leerzeichen am Rand", () => {
    expect(parseDemoAuthConfig({ ...env, DEMO_LOGIN: " On " }).enabled).toBe(true);
    const config = parseDemoAuthConfig({
      ...env,
      DEMO_ADMIN_PASSWORD: ` ${env.DEMO_ADMIN_PASSWORD}\n`,
    });
    expect(findUser(config, "admin", env.DEMO_ADMIN_PASSWORD)?.role).toBe("admin");
  });

  it("ist mit allen Einstellungen an", () => {
    expect(parseDemoAuthConfig(env).enabled).toBe(true);
  });
});

describe("findUser", () => {
  const config = parseDemoAuthConfig(env);

  it("erkennt richtige Zugangsdaten mit der passenden Rolle", () => {
    expect(findUser(config, "admin", env.DEMO_ADMIN_PASSWORD)?.role).toBe("admin");
    expect(findUser(config, "testuser", env.DEMO_USER_PASSWORD)?.role).toBe("user");
  });

  it("lehnt falsches Passwort, fremdes Passwort und unbekannte Namen ab", () => {
    expect(findUser(config, "admin", "falsch")).toBeNull();
    expect(findUser(config, "admin", env.DEMO_USER_PASSWORD)).toBeNull();
    expect(findUser(config, "testuser", env.DEMO_ADMIN_PASSWORD)).toBeNull();
    expect(findUser(config, "unbekannt", env.DEMO_ADMIN_PASSWORD)).toBeNull();
  });

  it("lässt bei ausgeschaltetem Login niemanden hinein", () => {
    expect(findUser({ enabled: false, reasons: [] }, "admin", env.DEMO_ADMIN_PASSWORD)).toBeNull();
  });
});

describe("SessionStore", () => {
  const admin = { username: "admin", role: "admin" as const };

  it("findet eine neue Sitzung und lehnt unbekannte Tokens ab", () => {
    const store = new SessionStore();
    const token = store.create(admin, 0);
    expect(store.get(token, 1)?.role).toBe("admin");
    expect(store.get("erfunden", 1)).toBeNull();
    expect(store.get(undefined, 1)).toBeNull();
  });

  it("beendet die alte Sitzung bei neuer Anmeldung (nur eine Sitzung je Konto)", () => {
    const store = new SessionStore();
    const first = store.create(admin, 0);
    const second = store.create(admin, 1);
    expect(store.get(first, 2)).toBeNull();
    expect(store.get(second, 2)).not.toBeNull();
  });

  it("lässt Sitzungen ablaufen", () => {
    const store = new SessionStore();
    const token = store.create(admin, 0);
    expect(store.get(token, SESSION_TTL_MS)).toBeNull();
    expect(store.hasActiveSession("admin", SESSION_TTL_MS)).toBe(false);
  });

  it("macht ein Token nach dem Abmelden ungültig", () => {
    const store = new SessionStore();
    const token = store.create(admin, 0);
    store.delete(token);
    expect(store.get(token, 1)).toBeNull();
  });
});

describe("LoginThrottle", () => {
  it("lässt die ersten Fehlversuche ohne Wartezeit zu", () => {
    const throttle = new LoginThrottle();
    for (let i = 0; i < FREE_ATTEMPTS - 1; i += 1) throttle.recordFailure("admin", 0);
    expect(throttle.waitMs("admin", 0)).toBe(0);
  });

  it("verlangt danach 1 Minute, dann doppelt so lang, höchstens 15 Minuten", () => {
    const throttle = new LoginThrottle();
    for (let i = 0; i < FREE_ATTEMPTS; i += 1) throttle.recordFailure("admin", 0);
    expect(throttle.waitMs("admin", 0)).toBe(60_000);
    throttle.recordFailure("admin", 0);
    expect(throttle.waitMs("admin", 0)).toBe(120_000);
    for (let i = 0; i < 10; i += 1) throttle.recordFailure("admin", 0);
    expect(throttle.waitMs("admin", 0)).toBe(15 * 60_000);
  });

  it("setzt nach erfolgreicher Anmeldung zurück und trennt Benutzernamen", () => {
    const throttle = new LoginThrottle();
    for (let i = 0; i < FREE_ATTEMPTS; i += 1) throttle.recordFailure("admin", 0);
    expect(throttle.waitMs("testuser", 0)).toBe(0);
    throttle.recordSuccess("admin");
    expect(throttle.waitMs("admin", 0)).toBe(0);
  });
});
