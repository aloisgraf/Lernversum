import type { Metadata } from "next";
import { spiele } from "@/games/registry";
import { adminStore, today } from "@/lib/demo-admin/server";
import { licenseActive } from "@/lib/demo-admin/store";
import { hasActiveSession, requireRole } from "@/lib/demo-auth/server";
import { Abschnitt, Status, Tabelle, Titel } from "./ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Adminbereich · Lernversum" };

export default async function AdminPage() {
  await requireRole("admin");
  const store = adminStore();
  const holders = [...store.holders.values()];
  const stats = [
    { label: "Lizenznehmer", value: holders.length },
    {
      label: "mit gültiger Lizenz",
      value: holders.filter((h) => licenseActive(h.license, today())).length,
    },
    { label: "Kinder", value: store.children.size },
    {
      label: "laufende Lernpakete",
      value: [...store.packages.values()].filter((p) => store.packageStatus(p, today()) === "läuft")
        .length,
    },
    { label: "Spielrunden", value: store.rounds.size },
    { label: "Spiele", value: spiele.length },
    { label: "Kategorien", value: store.categories.size },
  ];

  return (
    <>
      <Titel>Adminbereich</Titel>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="lv-card p-4">
            <p className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
              {stat.value}
            </p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
      <section className="flex flex-col gap-3">
        <Abschnitt>Testkonten</Abschnitt>
        <Tabelle label="Testkonten" spalten={["Benutzername", "Rolle", "Gerade angemeldet"]}>
          {[
            { name: "admin", rolle: "Admin" },
            { name: "testuser", rolle: "Benutzer" },
          ].map((konto) => (
            <tr key={konto.name}>
              <td className="font-bold">{konto.name}</td>
              <td>{konto.rolle}</td>
              <td>
                {hasActiveSession(konto.name) ? (
                  <Status art="ok">ja</Status>
                ) : (
                  <Status art="neutral">nein</Status>
                )}
              </td>
            </tr>
          ))}
        </Tabelle>
      </section>
    </>
  );
}
