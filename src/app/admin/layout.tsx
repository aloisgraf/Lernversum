import { LogoutButton } from "@/app/login/LogoutButton";
import { requireRole } from "@/lib/demo-auth/server";
import { Wortmarke } from "@/ui/Wortmarke";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin");
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className="md:w-64 md:shrink-0"
        style={{ background: "var(--lv-navy)", color: "#fff" }}
      >
        <div className="flex flex-col gap-6 p-4 md:sticky md:top-0 md:h-screen">
          <Wortmarke onDark showClaim={false} className="h-auto w-44" />
          <AdminNav />
          <div className="mt-auto hidden flex-col gap-3 md:flex">
            <p className="text-sm" style={{ color: "var(--lv-on-dark-muted)" }}>
              Angemeldet als {session.username}
            </p>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 md:hidden">
          <p className="text-sm" style={{ color: "var(--lv-muted)" }}>
            Angemeldet als {session.username}
          </p>
          <LogoutButton />
        </div>
        <p
          className="rounded-xl border-2 p-3 text-sm"
          style={{ borderColor: "var(--lv-yellow)", background: "#fffbea" }}
        >
          Prototyp: Daten liegen nur im Speicher des Servers und sind nach jedem Neustart weg. Nur
          erfundene Namen eingeben.
        </p>
        <main className="flex flex-col gap-8">{children}</main>
      </div>
    </div>
  );
}
