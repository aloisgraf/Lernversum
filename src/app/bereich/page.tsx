import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { requireRole } from "@/lib/demo-auth/server";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Bereich · Lernversum" };

export default async function BereichPage() {
  const session = await requireRole("user");

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">Hallo {session.username}!</h1>
        <LogoutButton />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Meine Spiele</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {spiele.map((spiel) => (
            <li key={spiel.slug}>
              <Link
                href={`/spiele/${spiel.slug}`}
                className="flex min-h-32 flex-col gap-2 rounded-2xl border-2 p-5 text-xl"
                style={{ borderColor: "var(--color-accent)" }}
              >
                <span className="text-5xl" aria-hidden="true">
                  {spiel.vorschau}
                </span>
                <span className="font-semibold">{spiel.titel}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">Mein Fortschritt</h2>
        <p style={{ color: "var(--color-muted)" }}>
          Kommt später. In dieser Demo werden keine Ergebnisse gespeichert.
        </p>
      </section>
    </main>
  );
}
