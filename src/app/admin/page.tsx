import type { Metadata } from "next";
import { spiele } from "@/games/registry";
import { LogoutButton } from "@/app/login/LogoutButton";
import { hasActiveSession, requireRole } from "@/lib/demo-auth/server";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Adminbereich · Lernversum" };

// Lizenzpakete laut D-018 (vorläufig). Später aus der Tabelle license_plans.
const pakete = [
  { name: "Elternlizenz", kinder: 1 },
  { name: "Lerntherapie 6", kinder: 6 },
  { name: "Lerntherapie 12", kinder: 12 },
  { name: "Lerntherapie 20", kinder: 20 },
  { name: "Schule / Lehrperson", kinder: 20 },
];

export default async function AdminPage() {
  const session = await requireRole("admin");
  const konten = [
    { name: "admin", rolle: "Admin" },
    { name: "testuser", rolle: "Benutzer" },
  ];

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Adminbereich</h1>
          <p style={{ color: "var(--color-muted)" }}>
            Angemeldet als {session.username} · Demo ohne Datenbank
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Testkonten</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2">Benutzername</th>
              <th className="py-2">Rolle</th>
              <th className="py-2">Gerade angemeldet</th>
            </tr>
          </thead>
          <tbody>
            {konten.map((konto) => (
              <tr key={konto.name} className="border-t">
                <td className="py-2">{konto.name}</td>
                <td className="py-2">{konto.rolle}</td>
                <td className="py-2">{hasActiveSession(konto.name) ? "ja" : "nein"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Lizenzpakete (Entwurf D-018)</h2>
        <p style={{ color: "var(--color-muted)" }}>Laufzeit jeweils 3, 6 oder 12 Monate.</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {pakete.map((paket) => (
            <li key={paket.name} className="rounded-xl border p-4">
              <p className="font-semibold">{paket.name}</p>
              <p>
                {paket.kinder} {paket.kinder === 1 ? "Kind" : "Kinder"}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Spiele</h2>
        <ul className="flex flex-col gap-2">
          {spiele.map((spiel) => (
            <li key={spiel.slug} className="rounded-xl border p-4">
              <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel} · Version{" "}
              {spiel.version} · aktiv
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
