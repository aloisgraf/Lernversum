import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "@/app/login/LogoutButton";
import { adminStore } from "@/lib/demo-admin/server";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { Avatar } from "@/ui/Avatar";
import { STARTPLANETEN, StartplanetBild } from "@/ui/Startplanet";
import weltall from "@/ui/bilder/universum/weltall.webp";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Lernversum · Lernversum" };

// Kinder-Startseite nach dem Login (Alois, 2026-11-16): Galaxie-Hintergrund, oben links der
// erste Planet, dazu „Mein Lernonaut“ (Profil) und Abmelden. Weitere Planeten und Inhalte
// folgen. Offen ist ein Planet, wenn ein laufendes Lernpaket des Kindes Spiele aus seiner
// Kategorie enthält; das prüft der Server hier und noch einmal auf der Planetenseite.
export default async function BereichPage() {
  const session = await requireRole("user");
  const profil = profilSpeicher().get(session.username);
  const anzeigeName = profil.spitzname ?? session.username;
  const store = adminStore();
  const child = kindDerSitzung(session);
  const spielbar = child ? store.playable(child.id, new Date()) : [];
  const kategorien = [...store.categories.values()];
  const planeten = STARTPLANETEN.map((planet) => {
    const kategorie = kategorien.find(
      (k) => k.name.trim().toLowerCase() === planet.kategorie.toLowerCase(),
    );
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
      <header className="relative z-10 flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/bereich/profil"
          className="flex min-h-12 items-center gap-2 rounded-full bg-white py-1 pr-4 pl-1 text-lg text-[var(--lv-navy)]"
        >
          <Avatar id={profil.avatar} className="h-11 w-11" />
          Mein Lernonaut
        </Link>
        <LogoutButton />
      </header>

      <ul className="relative z-10 mt-2 flex flex-wrap gap-6" aria-label="Meine Lernwelten">
        {planeten.map(({ planet, kategorie, offen }) => {
          const schild = (
            <span
              className="font-display rounded-2xl px-5 py-1 text-3xl"
              style={{
                background: "rgba(23, 61, 131, 0.85)",
                border: "2px solid rgba(166, 214, 255, 0.6)",
              }}
            >
              {planet.name}
            </span>
          );
          return (
            <li key={planet.kategorie} className="flex flex-col items-center gap-2">
              {offen && kategorie ? (
                <Link
                  href={`/bereich/welt/${kategorie.id}`}
                  className="flex flex-col items-center gap-2 rounded-3xl p-1 transition-transform hover:-translate-y-1"
                >
                  <StartplanetBild planet={planet} />
                  {schild}
                </Link>
              ) : (
                <>
                  <StartplanetBild planet={planet} gesperrt />
                  {schild}
                  <p className="text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
                    🔒 Noch nicht entdeckt.
                  </p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
