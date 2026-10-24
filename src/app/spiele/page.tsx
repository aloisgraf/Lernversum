import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";
import { Wortmarke } from "@/ui/Wortmarke";

export const metadata: Metadata = { title: "Spiele · Lernversum" };

// Testphase: Spiele sind ohne Anmeldung und ohne Freischaltung spielbar.
// Sobald es Konten gibt, prüft die Plattform hier und auf der Spielseite die Freischaltung.
export default function SpielePage() {
  return (
    <main className="lv-space flex min-h-screen flex-col gap-6 px-4 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link href="/" className="w-44" aria-label="Zur Startseite">
          <Wortmarke onDark showClaim={false} className="h-auto w-full" />
        </Link>
        <h1 className="font-display text-4xl font-bold">Spiele</h1>
        <ul className="grid gap-4 sm:grid-cols-2">
          {spiele.map((spiel) => (
            <li key={spiel.slug}>
              <Link
                href={`/spiele/${spiel.slug}`}
                className="lv-card flex min-h-32 flex-col gap-2 p-5 text-xl text-[var(--lv-text)]"
              >
                <span className="text-5xl" aria-hidden="true">
                  {spiel.vorschau}
                </span>
                <span className="font-extrabold" style={{ color: "var(--lv-navy)" }}>
                  {spiel.titel}
                </span>
                <span className="text-base" style={{ color: "var(--lv-muted)" }}>
                  {spiel.thema}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p style={{ color: "var(--lv-on-dark-muted)" }}>
          Testversion ohne Anmeldung. Es werden keine Ergebnisse gespeichert.
        </p>
      </div>
    </main>
  );
}
