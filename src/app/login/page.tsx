import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentSession, demoAuthConfig } from "@/lib/demo-auth/server";
import { loginAction } from "./actions";

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
  const enabled = demoAuthConfig().enabled;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <Link href="/" className="self-start underline">
        ← Startseite
      </Link>
      <h1 className="text-3xl font-semibold">Anmelden</h1>
      <p className="rounded-lg border p-3 text-sm" style={{ borderColor: "var(--color-muted)" }}>
        Demo-Login für die Testumgebung. Keine echten Daten eingeben.
      </p>
      {!enabled ? (
        <p role="status">Der Demo-Login ist auf diesem Server nicht eingerichtet.</p>
      ) : (
        <form action={loginAction} className="flex flex-col gap-4">
          {fehler ? (
            <p role="alert" className="rounded-lg border p-3" style={{ borderColor: "#b45309" }}>
              Benutzername oder Passwort stimmt nicht.
            </p>
          ) : null}
          {Number.isFinite(waitSeconds) && waitSeconds > 0 ? (
            <p role="alert" className="rounded-lg border p-3" style={{ borderColor: "#b45309" }}>
              Zu viele Versuche. Bitte warte etwa {Math.ceil(waitSeconds / 60)} Minute(n).
            </p>
          ) : null}
          <label className="flex flex-col gap-1">
            Benutzername
            <input
              name="username"
              autoComplete="username"
              required
              className="rounded-lg border px-3 py-3 text-lg"
            />
          </label>
          <label className="flex flex-col gap-1">
            Passwort
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-lg border px-3 py-3 text-lg"
            />
          </label>
          <button
            type="submit"
            className="rounded-full px-6 py-3 text-lg font-semibold"
            style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
          >
            Anmelden
          </button>
        </form>
      )}
    </main>
  );
}
