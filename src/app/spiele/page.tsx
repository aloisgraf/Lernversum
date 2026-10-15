import type { Metadata } from "next";
import Link from "next/link";
import { spiele } from "@/games/registry";

export const metadata: Metadata = { title: "Spiele · Lernversum" };

// Testphase: Spiele sind ohne Anmeldung und ohne Freischaltung spielbar.
// Sobald es Konten gibt, prüft die Plattform hier und auf der Spielseite die Freischaltung.
export default function SpielePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8">
      <Link href="/" className="self-start underline">
        ← Startseite
      </Link>
      <h1 className="text-4xl font-semibold">Spiele</h1>
      <ul className="grid gap-4 sm:grid-cols-2">
        {spiele.map((spiel) => (
          <li key={spiel.slug}>
            <Link
              href={`/spiele/${spiel.slug}`}
              className="flex min-h-32 flex-col gap-2 rounded-2xl border-2 p-5 text-xl hover:border-current"
              style={{ borderColor: "var(--color-accent)" }}
            >
              <span className="text-5xl" aria-hidden="true">
                {spiel.vorschau}
              </span>
              <span className="font-semibold">{spiel.titel}</span>
              <span className="text-base" style={{ color: "var(--color-muted)" }}>
                {spiel.thema}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p style={{ color: "var(--color-muted)" }}>
        Testversion ohne Anmeldung. Es werden keine Ergebnisse gespeichert.
      </p>
    </main>
  );
}
