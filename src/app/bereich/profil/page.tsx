import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/demo-auth/server";
import { profilSpeicher } from "@/lib/demo-profile/server";
import { Avatar } from "@/ui/Avatar";
import { ProfilForm } from "./ProfilForm";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mein Profil · Lernversum" };

export default async function ProfilPage() {
  const session = await requireRole("user");
  const profil = profilSpeicher().get(session.username);
  return (
    <main className="lv-space flex min-h-screen flex-col items-center gap-6 px-4 py-6 sm:px-8">
      <div className="w-full max-w-2xl">
        <Link href="/bereich" className="lv-btn lv-btn-quiet">
          ← Zurück zur Weltkarte
        </Link>
      </div>
      <section className="lv-card flex w-full max-w-2xl flex-col gap-6 p-6 text-[var(--lv-text)]">
        <div className="flex items-center gap-4">
          <Avatar id={profil.avatar} className="h-20 w-20" />
          <div>
            <h1 className="font-display text-4xl" style={{ color: "var(--lv-navy)" }}>
              Mein Profil
            </h1>
            <p className="text-lg">
              Mein Name zum Anmelden: <strong>{session.username}</strong>
            </p>
          </div>
        </div>
        <ProfilForm spitzname={profil.spitzname ?? ""} avatar={profil.avatar} />
      </section>
    </main>
  );
}
