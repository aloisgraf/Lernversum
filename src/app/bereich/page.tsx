import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore } from "@/lib/demo-admin/server";
import { requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { Avatar } from "@/ui/Avatar";
import { Planet, motivFuer } from "@/ui/Planet";
import { Wortmarke } from "@/ui/Wortmarke";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Bereich · Lernversum" };

// Kinderbereich als Weltkarte: jedes Thema ist eine schwebende Insel (Designpaket,
// Kinder-Startseite). Im Prototyp kommen die Themen aus dem Test-Admin; eine Insel ist offen,
// wenn ihr mindestens ein Spiel zugeordnet ist.
export default async function BereichPage() {
  const session = await requireRole("user");
  const profil = profilSpeicher().get(session.username);
  const anzeigeName = profil.spitzname ?? session.username;
  const store = adminStore();
  const planeten = [...store.topics.values()].map((thema) => ({
    thema,
    spiele: spiele.filter((s) => (store.gameTopics.get(s.slug) ?? []).includes(thema.id)),
  }));

  return (
    <main className="lv-space flex min-h-screen flex-col gap-8 px-4 py-6 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Wortmarke onDark className="h-auto w-56" />
        <div className="flex items-center gap-3">
          <Link
            href="/bereich/profil"
            className="flex min-h-12 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-1 font-bold text-[var(--lv-navy)]"
          >
            <Avatar id={profil.avatar} className="h-11 w-11" />
            Mein Profil
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="flex max-w-2xl items-end gap-4">
        <Avatar id={profil.avatar} className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
        <div className="lv-card relative p-5 text-[var(--lv-text)]">
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
            Hallo, {anzeigeName}!
          </h1>
          <p className="text-xl">Bereit für dein nächstes Abenteuer? Tippe auf eine Lernwelt.</p>
        </div>
      </section>

      <section aria-labelledby="weltkarte" className="flex flex-col gap-4">
        <h2 id="weltkarte" className="font-display text-2xl font-bold">
          Meine Lernwelten
        </h2>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {planeten.map(({ thema, spiele: themenSpiele }, index) => {
            const gesperrt = themenSpiele.length === 0;
            return (
              <li
                key={thema.id}
                className={`flex flex-col items-center gap-3 text-center ${index % 2 === 1 ? "lg:mt-12" : ""}`}
              >
                <Planet
                  id={thema.id}
                  motiv={motivFuer(thema.name, index)}
                  gesperrt={gesperrt}
                  className="h-52 w-60"
                />
                <h3
                  className="font-display max-w-xs rounded-2xl px-5 py-2 text-xl font-bold"
                  style={{
                    background: "rgba(23, 61, 131, 0.85)",
                    border: "2px solid rgba(166, 214, 255, 0.6)",
                  }}
                >
                  {thema.name}
                </h3>
                {gesperrt ? (
                  <p className="text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
                    🔒 Noch nicht entdeckt – hier kommen bald Spiele.
                  </p>
                ) : (
                  <ul className="flex w-full max-w-xs flex-col gap-2">
                    {themenSpiele.map((spiel) => (
                      <li key={spiel.slug}>
                        <Link
                          href={`/spiele/${spiel.slug}`}
                          className="lv-btn lv-btn-reward min-h-12 w-full text-xl"
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
