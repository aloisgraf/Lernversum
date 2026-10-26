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
import planet from "@/ui/bilder/feuerplanet.webp";
import funki from "@/ui/bilder/funki.webp";
import { FeuerHimmel } from "@/ui/FeuerHimmel";
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

  // Feuerplanet: Planet und Funki aus den Bildern von Alois, freigestellt, vor eigenem
  // Hintergrund; Funki steht am rechten Rand, die Sprechblase über ihm.
  return (
    <main className="lv-space relative flex min-h-screen flex-col gap-4 overflow-hidden px-4 pt-6 sm:px-8">
      <FeuerHimmel />
      {kopf}
      <div className="relative grid flex-1 items-end gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="order-2 flex flex-col items-center gap-5 self-center pb-10 text-center lg:order-1">
          <div>
            <h1 className="font-display text-5xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
              {thema.name}
            </h1>
            <p className="text-xl" style={{ color: "var(--lv-on-dark-muted)" }}>
              {kategorie.name}
            </p>
          </div>
          <h2 className="font-display text-3xl">Deine Spiele</h2>
          {spielListe}
        </section>
        <div className="relative order-1 min-h-[22rem] sm:min-h-[30rem] lg:order-2 lg:min-h-[40rem]">
          <Image
            src={planet}
            alt=""
            priority
            sizes="(min-width: 1024px) 40vw, 70vw"
            className="absolute top-[6%] left-0 h-auto w-[68%] lg:top-[2%] lg:w-[64%]"
            style={{ filter: "drop-shadow(0 0 28px rgba(255, 140, 30, 0.55))" }}
          />
          <div className="absolute right-0 bottom-0 flex flex-col items-end">
            <div
              className="lv-card relative z-10 mb-3 w-56 p-3 text-base text-[var(--lv-text)] sm:w-72 sm:p-4 sm:text-lg lg:mr-6"
              role="status"
              aria-live="polite"
              aria-label="Funki sagt"
            >
              {saetze.map((satz) => (
                <p key={satz}>{satz}</p>
              ))}
              <span
                aria-hidden="true"
                className="absolute right-[30%] -bottom-3 h-6 w-6 rotate-45 bg-white"
                style={{
                  borderRight: "1px solid var(--lv-border)",
                  borderBottom: "1px solid var(--lv-border)",
                }}
              />
            </div>
            <Image
              src={funki}
              alt=""
              sizes="(min-width: 1024px) 240px, 140px"
              className="h-auto w-32 sm:w-44 lg:w-60"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
