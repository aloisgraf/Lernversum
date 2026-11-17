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
import funki from "@/ui/bilder/funki.webp";
import weltall from "@/ui/bilder/universum/weltall.webp";
import { Planet, motivFuer } from "@/ui/Planet";
import { StartplanetBild, startplanetFuer } from "@/ui/Startplanet";
import { Sternenhimmel, type AufgabenStern } from "@/ui/Sternenhimmel";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Lernwelt · Lernversum" };

// Eine Lernwelt (Kategorie) von innen (Alois, 2026-11-17): unten der Planet, darüber der Himmel
// mit Aufgaben-Sternen; ein Stern öffnet einen Toast mit seinen Spielen. In der ersten Welt
// begrüßt Funki das Kind. Welche Spiele erscheinen, entscheidet allein das laufende Lernpaket
// (serverseitig). Sterne und Hintergrund sind Platzhalter, bis die Bilder von Alois kommen.
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
  // Spiele nach dem Stern gruppieren, den der Admin beim Zuordnen gewählt hat.
  const gruppen = new Map<number, AufgabenStern>();
  for (const s of weltSpiele) {
    const nummer = store.sternVon(id, s.slug);
    const gruppe = gruppen.get(nummer) ?? { nummer, spiele: [] };
    gruppe.spiele.push({
      slug: s.slug,
      titel: s.titel,
      vorschau: s.vorschau,
      besteSterne: besteSterne(s.slug),
    });
    gruppen.set(nummer, gruppe);
  }
  const sterneAmHimmel = [...gruppen.values()].sort((a, b) => a.nummer - b.nummer);
  const mitFunki = weltThema(index).art === "feuer";
  const startplanet = startplanetFuer(kategorie.name);
  const saetze = funkiSagt({ name, runden: runden.length, geradeGeschafft: geschafft === "1" });

  return (
    <main className="lv-space relative flex min-h-screen flex-col overflow-hidden px-4 pt-6 sm:px-8">
      <Image
        src={weltall}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3">
        <Link href="/bereich" className="lv-btn lv-btn-quiet">
          ← Zur Weltkarte
        </Link>
        <LogoutButton />
      </header>
      <h1 className="font-display relative z-10 mt-2 text-center text-4xl drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] sm:text-5xl">
        {startplanet?.name ?? kategorie.name}
      </h1>
      <section
        aria-label="Himmel mit Aufgaben"
        className="relative z-10 mx-auto min-h-[22rem] w-full max-w-5xl flex-1"
      >
        <Sternenhimmel sterne={sterneAmHimmel} weltId={id} />
      </section>
      {startplanet?.welt ? (
        <div className="pointer-events-none relative z-0 -mx-4 sm:-mx-8">
          <Image
            src={startplanet.welt}
            alt=""
            priority
            sizes="100vw"
            className="h-[clamp(14rem,34vw,50vh)] w-full object-cover object-top"
          />
        </div>
      ) : (
        <div className="pointer-events-none relative z-0 mx-auto -mb-[12vh] w-[min(90vw,36rem)]">
          {startplanet ? (
            <StartplanetBild planet={startplanet} />
          ) : (
            <Planet
              id={id}
              motiv={motivFuer(kategorie.name, index)}
              gesperrt={false}
              className="h-72 w-full"
            />
          )}
        </div>
      )}
      {mitFunki ? (
        <div className="absolute right-2 bottom-0 z-0 flex flex-col items-end sm:right-6">
          <div
            className="lv-card relative z-10 mb-3 w-52 p-3 text-base text-[var(--lv-text)] sm:w-72 sm:p-4 sm:text-lg"
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
            sizes="(min-width: 1024px) 200px, 120px"
            className="h-auto w-28 sm:w-40 lg:w-48"
          />
        </div>
      ) : null}
    </main>
  );
}
