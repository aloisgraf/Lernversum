import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore } from "@/lib/demo-admin/server";
import { requireRole } from "@/lib/demo-auth/server";
import { Planet } from "@/ui/Planet";
import { Wortmarke } from "@/ui/Wortmarke";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Bereich · Lernversum" };

// Kinderbereich als Weltkarte: jedes Thema ist ein Planet (Designpaket, Kinder-Startseite).
// Im Prototyp kommen die Themen aus dem Test-Admin; ein Planet ist offen, wenn ihm mindestens
// ein Spiel zugeordnet ist.
export default async function BereichPage() {
  const session = await requireRole("user");
  const store = adminStore();
  const planeten = [...store.topics.values()].map((thema) => ({
    thema,
    spiele: spiele.filter((s) => (store.gameTopics.get(s.slug) ?? []).includes(thema.id)),
  }));

  return (
    <main className="lv-space flex min-h-screen flex-col gap-8 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Wortmarke onDark showClaim={false} className="h-auto w-44" />
        <LogoutButton />
      </header>

      <section className="lv-card max-w-xl p-5 text-[var(--lv-text)]">
        <h1 className="text-3xl font-extrabold" style={{ color: "var(--lv-navy)" }}>
          Hallo {session.username}!
        </h1>
        <p className="text-xl">Wohin reist du heute? Tippe auf einen Planeten.</p>
      </section>

      <section aria-labelledby="weltkarte" className="flex flex-col gap-4">
        <h2 id="weltkarte" className="text-2xl font-extrabold">
          Meine Lernwelten
        </h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {planeten.map(({ thema, spiele: themenSpiele }, index) => {
            const gesperrt = themenSpiele.length === 0;
            return (
              <li
                key={thema.id}
                className="flex flex-col items-center gap-3 rounded-[var(--lv-radius-card)] p-4 text-center"
                style={{
                  background: "rgba(8, 26, 67, 0.75)",
                  border: "1px solid rgba(216,229,247,0.25)",
                }}
              >
                <Planet index={index} gesperrt={gesperrt} />
                <h3 className="text-xl font-extrabold">{thema.name}</h3>
                {gesperrt ? (
                  <p className="text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
                    🔒 Noch nicht entdeckt – hier kommen bald Spiele.
                  </p>
                ) : (
                  <ul className="flex w-full flex-col gap-2">
                    {themenSpiele.map((spiel) => (
                      <li key={spiel.slug}>
                        <Link
                          href={`/spiele/${spiel.slug}`}
                          className="lv-btn lv-btn-reward min-h-12 w-full text-xl"
                          style={{ minHeight: 56 }}
                        >
                          <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="lv-card max-w-xl p-5 text-[var(--lv-text)]">
        <h2 className="text-xl font-extrabold" style={{ color: "var(--lv-navy)" }}>
          Mein Fortschritt
        </h2>
        <p className="text-xl">Kommt später. In dieser Demo werden keine Ergebnisse gespeichert.</p>
      </section>
    </main>
  );
}
