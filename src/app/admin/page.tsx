import type { Metadata } from "next";
import { spiele } from "@/games/registry";
import { adminStore, today } from "@/lib/demo-admin/server";
import { licenseActive } from "@/lib/demo-admin/store";
import { hasActiveSession, requireRole } from "@/lib/demo-auth/server";

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
    { label: "Elternzugänge", value: store.parents.size },
    { label: "Freischaltungen", value: store.grants.size },
    { label: "Spiele", value: spiele.length },
    { label: "Themen", value: store.topics.size },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold">Adminbereich</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <li key={stat.label} className="rounded-xl border p-4">
            <p className="text-3xl font-semibold">{stat.value}</p>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              {stat.label}
            </p>
          </li>
        ))}
      </ul>
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
            {[
              { name: "admin", rolle: "Admin" },
              { name: "testuser", rolle: "Benutzer" },
            ].map((konto) => (
              <tr key={konto.name} className="border-t">
                <td className="py-2">{konto.name}</td>
                <td className="py-2">{konto.rolle}</td>
                <td className="py-2">{hasActiveSession(konto.name) ? "ja" : "nein"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
