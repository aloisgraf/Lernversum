import type { Metadata } from "next";
import Link from "next/link";
import { Wortmarke } from "@/ui/Wortmarke";
import { redirect } from "next/navigation";
import { currentSession, demoAuthConfig } from "@/lib/demo-auth/server";
import type { DisabledReason } from "@/lib/demo-auth/core";
import { loginAction } from "./actions";

const reasonText: Record<DisabledReason, string> = {
  DEMO_LOGIN_NICHT_ON: "DEMO_LOGIN ist nicht auf „on“ gesetzt.",
  ADMIN_PASSWORT_ZU_KURZ: "DEMO_ADMIN_PASSWORD fehlt oder hat weniger als 12 Zeichen.",
  USER_PASSWORT_ZU_KURZ: "DEMO_USER_PASSWORD fehlt oder hat weniger als 12 Zeichen.",
  PASSWOERTER_GLEICH: "DEMO_ADMIN_PASSWORD und DEMO_USER_PASSWORD sind gleich.",
};

export const metadata: Metadata = { title: "Anmelden · Lernversum" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string; warten?: string }>;
}) {
  const session = await currentSession();
  if (session) redirect(session.role === "admin" ? "/admin" : "/bereich");

  const { fehler, warten } = await searchParams;
  const waitSeconds = Number(warten);
  const config = demoAuthConfig();

  return (
    <main className="lv-space flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="w-56" aria-label="Zur Startseite">
        <Wortmarke onDark showClaim={false} className="h-auto w-full" />
      </Link>
      <div className="lv-card flex w-full max-w-sm flex-col gap-5 p-6 text-[var(--lv-text)]">
        <h1 className="text-3xl font-extrabold" style={{ color: "var(--lv-navy)" }}>
          Anmelden
        </h1>
        <p
          className="rounded-xl border p-3 text-sm"
          style={{ borderColor: "var(--lv-border)", background: "var(--lv-white)" }}
        >
          Demo-Login für die Testumgebung. Keine echten Daten eingeben.
        </p>
        {!config.enabled ? (
          <div role="status" className="flex flex-col gap-2">
            <p>Der Demo-Login ist auf diesem Server nicht eingerichtet.</p>
            <ul className="list-disc pl-5 text-sm" style={{ color: "var(--lv-muted)" }}>
              {config.reasons.map((reason) => (
                <li key={reason}>{reasonText[reason]}</li>
              ))}
            </ul>
          </div>
        ) : (
          <form action={loginAction} className="flex flex-col gap-4">
            {fehler ? (
              <p role="alert" className="text-sm font-semibold" style={{ color: "var(--lv-hint)" }}>
                Benutzername oder Passwort stimmt nicht.
              </p>
            ) : null}
            {Number.isFinite(waitSeconds) && waitSeconds > 0 ? (
              <p role="alert" className="text-sm font-semibold" style={{ color: "var(--lv-hint)" }}>
                Zu viele Versuche. Bitte warte etwa {Math.ceil(waitSeconds / 60)} Minute(n).
              </p>
            ) : null}
            <label className="flex flex-col gap-1 font-semibold">
              Benutzername
              <input
                name="username"
                autoComplete="username"
                required
                className="lv-input text-lg"
              />
            </label>
            <label className="flex flex-col gap-1 font-semibold">
              Passwort
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="lv-input text-lg"
              />
            </label>
            <button type="submit" className="lv-btn lv-btn-primary text-lg">
              Anmelden
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
