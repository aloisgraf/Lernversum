import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore } from "@/lib/demo-admin/server";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { Avatar } from "@/ui/Avatar";
import { PlanetSchild, STARTPLANETEN, StartplanetBild, type Platz } from "@/ui/Startplanet";
import logo from "@/ui/bilder/universum/logo.webp";
import weltall from "@/ui/bilder/universum/weltall.webp";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Lernversum · Lernversum" };

// Kinder-Startseite nach dem Login (Alois, 2026-11-16): Galaxie-Hintergrund, Logo, fünf
// Planeten, dazu „Mein Lernonaut“ (Profil) und Abmelden. Offen ist ein Planet, wenn ein laufendes Lernpaket des Kindes Spiele aus seiner
// Kategorie enthält; das prüft der Server hier und noch einmal auf der Planetenseite.
const PLATZ: Record<Platz, string> = {
  "oben-links": "md:col-start-1 md:row-start-1",
  "oben-rechts": "md:col-start-3 md:row-start-1",
  mitte: "col-span-2 md:col-span-1 md:col-start-2 md:row-start-2 md:-mt-6",
  "unten-links": "md:col-start-1 md:row-start-2 md:mt-[min(6rem,8vh)]",
  "unten-rechts": "md:col-start-3 md:row-start-2 md:mt-[min(6rem,8vh)]",
};

export default async function BereichPage() {
  const session = await requireRole("user");
  const profil = profilSpeicher().get(session.username);
  const anzeigeName = profil.spitzname ?? session.username;
  const store = adminStore();
  const child = kindDerSitzung(session);
  const spielbar = child ? store.playable(child.id, new Date()) : [];
  const kategorien = [...store.categories.values()];
  const planeten = STARTPLANETEN.map((planet) => {
    const kategorie = planet.kategorie
      ? kategorien.find((k) => k.name.trim().toLowerCase() === planet.kategorie!.toLowerCase())
      : undefined;
    const offen = !!kategorie && spielbar.some((g) => g.categoryId === kategorie.id);
    return { planet, kategorie, offen };
  });

  return (
    <main className="lv-space relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <Image
        src={weltall}
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover"
      />
      <h1 className="sr-only">Hallo, {anzeigeName}!</h1>
      <header className="relative z-20 flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/bereich/profil"
          className="flex min-h-12 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-1 text-lg text-[var(--lv-navy)]"
        >
          <Avatar id={profil.avatar} className="h-11 w-11" />
          Mein Lernonaut
        </Link>
        <LogoutButton />
      </header>

      {/* Ab md ein Raster wie die Fünf auf einem Würfel: oben Mathe, Logo, Schreiben; darunter
          „Mein Planet“ mittig, Geschichten und Lesen etwas tiefer an den Rändern. Am Handy das
          Logo oben, darunter alle Planeten gleich groß in zwei Spalten. Alle Planeten haben
          dieselbe quadratische Fläche (Alois, 2026-11-16). */}
      <section
        aria-label="Meine Lernwelten"
        className="relative z-10 mx-auto mt-2 grid max-w-6xl grid-cols-2 justify-items-center gap-x-4 gap-y-6 md:grid-cols-3 md:gap-y-0"
      >
        <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1 md:self-start">
          <Image
            src={logo}
            alt="Einfach Lernen im Lernversum"
            priority
            sizes="(min-width: 768px) 28rem, 90vw"
            className="mx-auto h-auto w-[min(80vw,24rem)] md:w-[80%]"
          />
        </div>
        {planeten.map(({ planet, kategorie, offen }) => {
          const schild = <PlanetSchild name={planet.name} />;
          return (
            <div
              key={planet.name}
              className={`flex flex-col items-center gap-2 text-center ${planet.platz === "mitte" ? "w-[min(56vw,21rem,34vh)]" : "w-[min(42vw,17rem,27vh)]"} ${PLATZ[planet.platz]}`}
            >
              {offen && kategorie ? (
                <Link
                  href={`/bereich/welt/${kategorie.id}`}
                  className="flex w-full flex-col items-center gap-2 rounded-3xl transition-transform hover:-translate-y-1"
                >
                  <StartplanetBild planet={planet} leuchtet />
                  {schild}
                  <span className="text-lg" style={{ color: "#FFE58A" }}>
                    ✨ Aufgaben warten
                  </span>
                </Link>
              ) : planet.kategorie === null ? (
                <>
                  <StartplanetBild planet={planet} />
                  {schild}
                </>
              ) : (
                <>
                  <StartplanetBild planet={planet} gesperrt />
                  {schild}
                  <p className="text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
                    🔒 Noch nicht entdeckt.
                  </p>
                </>
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
