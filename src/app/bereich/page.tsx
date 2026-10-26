import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore, today } from "@/lib/demo-admin/server";
import { sterne } from "@/lib/demo-admin/store";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { Avatar } from "@/ui/Avatar";
import { weltThema } from "@/lib/welten/thema";
import { FeuerplanetBild } from "@/ui/FeuerplanetBild";
import { Planet, motivFuer } from "@/ui/Planet";
import { Wortmarke } from "@/ui/Wortmarke";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Bereich · Lernversum" };

// Kinderbereich als Weltkarte: jede Kategorie ist eine schwebende Insel (Designpaket,
// Kinder-Startseite). Offen ist eine Insel, wenn ein laufendes Lernpaket des Kindes Spiele aus
// ihr enthält. Stufen sieht das Kind nicht, nur die Spiele.
export default async function BereichPage() {
  const session = await requireRole("user");
  const profil = profilSpeicher().get(session.username);
  const anzeigeName = profil.spitzname ?? session.username;
  const store = adminStore();
  const child = kindDerSitzung(session);
  const spielbar = child ? store.playable(child.id, new Date()) : [];
  const planeten = [...store.categories.values()].map((thema) => ({
    thema,
    spiele: spiele.filter((s) =>
      spielbar.some((g) => g.categoryId === thema.id && g.gameSlug === s.slug),
    ),
  }));
  const titel = new Map(spiele.map((s) => [s.slug as string, s.titel as string]));
  const fortschritt = (child ? store.packagesOf(child.id) : []).map((pkg) => {
    const proSpiel = new Map<string, { runden: number; sterne: number }>();
    for (const r of store.roundsOf(pkg.id)) {
      const bisher = proSpiel.get(r.gameSlug) ?? { runden: 0, sterne: 0 };
      proSpiel.set(r.gameSlug, {
        runden: bisher.runden + 1,
        sterne: Math.max(bisher.sterne, sterne(r.aufgaben, r.fehler)),
      });
    }
    return {
      pkg,
      laeuft: store.packageStatus(pkg, today()) === "läuft",
      proSpiel: [...proSpiel.entries()],
      archivRunden: pkg.archiv?.runden ?? 0,
    };
  });

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
          <h1 className="font-display text-4xl" style={{ color: "var(--lv-navy)" }}>
            Hallo, {anzeigeName}!
          </h1>
          <p className="text-xl">Bereit für dein nächstes Abenteuer? Tippe auf eine Lernwelt.</p>
        </div>
      </section>

      <section aria-labelledby="weltkarte" className="flex flex-col gap-4">
        <h2 id="weltkarte" className="font-display text-3xl">
          Meine Lernwelten
        </h2>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {planeten.map(({ thema, spiele: themenSpiele }, index) => {
            const gesperrt = themenSpiele.length === 0;
            const welt = weltThema(index);
            const titelText = welt.art === "feuer" ? welt.name : thema.name;
            const bild =
              welt.art === "feuer" ? (
                <FeuerplanetBild gesperrt={gesperrt} className="h-52 w-52" />
              ) : (
                <Planet
                  id={thema.id}
                  motiv={motivFuer(thema.name, index)}
                  gesperrt={gesperrt}
                  className="h-52 w-60"
                />
              );
            const schild = (
              <span
                className="font-display flex max-w-xs flex-col rounded-2xl px-5 py-2 text-2xl"
                style={{
                  background: "rgba(23, 61, 131, 0.85)",
                  border: "2px solid rgba(166, 214, 255, 0.6)",
                }}
              >
                {titelText}
                {welt.art === "feuer" ? (
                  <span className="text-base" style={{ color: "var(--lv-on-dark-muted)" }}>
                    {thema.name}
                  </span>
                ) : null}
              </span>
            );
            return (
              <li
                key={thema.id}
                className={`flex flex-col items-center gap-3 text-center ${index % 2 === 1 ? "lg:mt-12" : ""}`}
              >
                {gesperrt ? (
                  <>
                    {bild}
                    <h3>{schild}</h3>
                    <p className="text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
                      🔒 Noch nicht entdeckt.
                    </p>
                  </>
                ) : (
                  <Link
                    href={`/bereich/welt/${thema.id}`}
                    className="flex flex-col items-center gap-3 rounded-3xl p-2 transition-transform hover:-translate-y-1"
                  >
                    {bild}
                    <h3>{schild}</h3>
                    <span className="lv-btn lv-btn-reward min-h-12 text-xl">
                      Landen ({themenSpiele.length} {themenSpiele.length === 1 ? "Spiel" : "Spiele"}
                      )
                    </span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="lv-card flex max-w-2xl flex-col gap-3 p-5 text-[var(--lv-text)]">
        <h2 className="font-display text-3xl" style={{ color: "var(--lv-navy)" }}>
          Mein Fortschritt
        </h2>
        {fortschritt.length === 0 ? (
          <p className="text-xl">Hier siehst du bald deine Sterne.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {fortschritt.map(({ pkg, laeuft, proSpiel, archivRunden }) => (
              <li key={pkg.id} className="flex flex-col gap-1">
                <p className="text-xl font-bold">
                  {pkg.name}{" "}
                  <span className="text-base font-normal" style={{ color: "var(--lv-muted)" }}>
                    {laeuft ? "· läuft" : "· vorbei"}
                  </span>
                </p>
                {proSpiel.length === 0 && archivRunden === 0 ? (
                  <p className="text-lg">Noch nicht gespielt.</p>
                ) : null}
                {proSpiel.map(([slug, info]) => (
                  <p key={slug} className="text-lg">
                    {titel.get(slug) ?? slug}:{" "}
                    <span
                      aria-label={`${info.sterne} von 3 Sternen`}
                      style={{ color: "#E5B82D" }}
                      className="text-2xl"
                    >
                      {"★".repeat(info.sterne)}
                      <span style={{ color: "var(--lv-border)" }}>
                        {"★".repeat(3 - info.sterne)}
                      </span>
                    </span>{" "}
                    <span style={{ color: "var(--lv-muted)" }}>
                      ({info.runden} {info.runden === 1 ? "Runde" : "Runden"})
                    </span>
                  </p>
                ))}
                {archivRunden > 0 ? (
                  <p className="text-lg">Früher gespielt: {archivRunden} Runden.</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
