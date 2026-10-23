import Link from "next/link";
import { LogoutButton } from "@/app/login/LogoutButton";
import { requireRole } from "@/lib/demo-auth/server";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/lizenznehmer", label: "Lizenznehmer und Kinder" },
  { href: "/admin/spiele", label: "Spiele und Themen" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xl font-semibold">Lernversum · Admin</p>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Angemeldet als {session.username}
          </p>
        </div>
        <LogoutButton />
      </header>
      <p className="rounded-lg border p-3 text-sm" style={{ borderColor: "#b45309" }}>
        Prototyp: Daten liegen nur im Speicher des Servers und sind nach jedem Neustart weg. Nur
        erfundene Namen eingeben.
      </p>
      <nav className="flex flex-wrap gap-2">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-full border px-4 py-2">
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex flex-col gap-8">{children}</main>
    </div>
  );
}
