import type { Metadata } from "next";
import { MIN_LAENGE_KIND } from "@/lib/demo-auth/password";
import { requireKindFuerPasswortwechsel } from "@/lib/demo-auth/server";
import { LogoutButton } from "@/app/login/LogoutButton";
import { Wortmarke } from "@/ui/Wortmarke";
import { PasswortForm } from "./PasswortForm";

// Geschützte Seite: nie statisch vorrendern, Prüfung bei jeder Anfrage.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Passwort ändern · Lernversum" };

export default async function PasswortAendernPage() {
  const { child } = await requireKindFuerPasswortwechsel();
  return (
    <main className="lv-space flex min-h-screen flex-col items-center gap-6 px-4 py-8">
      <Wortmarke onDark showClaim={false} className="h-auto w-48" />
      <section className="lv-card flex w-full max-w-md flex-col gap-4 p-6 text-[var(--lv-text)]">
        <h1 className="font-display text-4xl" style={{ color: "var(--lv-navy)" }}>
          {child.mustChangePassword ? "Wähle dein eigenes Passwort" : "Passwort ändern"}
        </h1>
        <p className="text-lg">
          Hallo <strong>{child.username}</strong>!{" "}
          {child.mustChangePassword
            ? "Bevor es losgeht, brauchst du ein Passwort, das nur du kennst."
            : null}
        </p>
        <PasswortForm minLaenge={MIN_LAENGE_KIND} />
      </section>
      <LogoutButton />
    </main>
  );
}
