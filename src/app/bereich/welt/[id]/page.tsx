import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore } from "@/lib/demo-admin/server";
import { sterne } from "@/lib/demo-admin/store";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { funkiSagt } from "@/lib/welten/funki";
import { WELT_ID, weltThema } from "@/lib/welten/thema";
import Image from "next/image";
import szene from "@/ui/bilder/feuerplanet-szene.webp";
import { Planet, motivFuer } from "@/ui/Planet";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Lernwelt · Lernversum" };

// Eine Lernwelt (Kategorie) von innen: freigegebene Spiele, beim Feuerplaneten mit Funki.
// Welche Spiele erscheinen, entscheidet allein das laufende Lernpaket (serverseitig).
export default async function WeltPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ geschafft?: string }>;
}) {
  const session = await requireRole("user");
  const { id } = await params;
  const { geschafft } = await searchParams;
  if (!WELT_ID.test(id)) notFound();
  const store = adminStore();
  const kategorien = [...store.categories.values()];
  const index = kategorien.findIndex((k) => k.id === id);
  if (index < 0) notFound();
  const kategorie = kategorien[index]!;
  const child = kindDerSitzung(session);
  const spielbar = child
    ? store.playable(child.id, new Date()).filter((g) => g.categoryId === id)
    : [];
  // Gesperrte Welt: zurück zur Karte, ohne zu verraten, was darin wäre.
  if (spielbar.length === 0) redirect("/bereich");

  const profil = profilSpeicher().get(session.username);
  const name = profil.spitzname ?? session.username;
  const slugs = new Set(spielbar.map((g) => g.gameSlug));
  const runden = child
    ? store
        .packagesOf(child.id)
        .flatMap((p) => store.roundsOf(p.id))
        .filter((r) => slugs.has(r.gameSlug))
    : [];
  const besteSterne = (slug: string) =>
    Math.max(
      0,
      ...runden.filter((r) => r.gameSlug === slug).map((r) => sterne(r.aufgaben, r.fehler)),
    );
  const weltSpiele = spiele.filter((s) => slugs.has(s.slug));
  const thema = weltThema(index);
  const feuer = thema.art === "feuer";
  const saetze = funkiSagt({ name, runden: runden.length, geradeGeschafft: geschafft === "1" });

  const spielListe = (
    <ul className="flex w-full max-w-md flex-col gap-3">
      {weltSpiele.map((spiel) => {
        const n = besteSterne(spiel.slug);
        return (
          <li key={spiel.slug}>
            <Link
              href={`/spiele/${spiel.slug}?welt=${id}`}
              className="lv-btn lv-btn-reward min-h-16 w-full justify-between text-2xl"
            >
              <span>
                <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel}
              </span>
              <span aria-label={`${n} von 3 Sternen`} className="text-xl">
                <span style={{ color: "#C2410C" }}>{"★".repeat(n)}</span>
                <span style={{ color: "rgba(23, 61, 131, 0.3)" }}>{"★".repeat(3 - n)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  const kopf = (
    <header className="relative z-10 flex flex-wrap items-center justify-between gap-3">
      <Link href="/bereich" className="lv-btn lv-btn-quiet">
        ← Zur Weltkarte
      </Link>
      <LogoutButton />
    </header>
  );

  if (!feuer) {
    return (
      <main className="lv-space flex min-h-screen flex-col gap-6 px-4 py-6 sm:px-8">
        {kopf}
        <section className="flex flex-col items-center gap-5 text-center">
          <h1 className="font-display text-5xl">{kategorie.name}</h1>
          <Planet
            id={id}
            motiv={motivFuer(kategorie.name, index)}
            gesperrt={false}
            className="h-52 w-60"
          />
          <h2 className="font-display text-3xl">Deine Spiele</h2>
          {spielListe}
        </section>
      </main>
    );
  }

  // Feuerplanet: Bild von Alois als Szene am rechten Rand, Funki darin; Sprechblase darüber.
  return (
    <main className="lv-space lv-feuer flex min-h-screen flex-col gap-4 overflow-x-hidden px-4 pt-6 sm:px-8">
      {kopf}
      <div className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="order-2 flex flex-col items-center gap-5 pb-10 text-center lg:order-1">
          <div>
            <h1 className="font-display text-5xl">{thema.name}</h1>
            <p className="text-xl" style={{ color: "var(--lv-on-dark-muted)" }}>
              {kategorie.name}
            </p>
          </div>
          <h2 className="font-display text-3xl">Deine Spiele</h2>
          {spielListe}
        </section>
        <div className="relative order-1 -mx-4 sm:-mx-8 lg:order-2 lg:mx-0 lg:-mr-8">
          <div
            className="lv-card relative z-10 mx-4 mb-4 p-4 text-lg text-[var(--lv-text)] sm:mx-8 lg:absolute lg:top-[3%] lg:right-[3%] lg:m-0 lg:w-[44%]"
            role="status"
            aria-live="polite"
            aria-label="Funki sagt"
          >
            {saetze.map((satz) => (
              <p key={satz}>{satz}</p>
            ))}
            <span
              aria-hidden="true"
              className="absolute right-[18%] -bottom-3 h-6 w-6 rotate-45 bg-white"
              style={{
                borderRight: "1px solid var(--lv-border)",
                borderBottom: "1px solid var(--lv-border)",
              }}
            />
          </div>
          <Image
            src={szene}
            alt=""
            priority
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="h-auto w-full"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, #000 14%), linear-gradient(to bottom, transparent 0%, #000 8%)",
              maskComposite: "intersect",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, #000 14%), linear-gradient(to bottom, transparent 0%, #000 8%)",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
      </div>
    </main>
  );
}
