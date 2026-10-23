import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-4xl font-semibold">Lernversum</h1>
      <p style={{ color: "var(--color-muted)" }}>Die Plattform befindet sich im Aufbau.</p>
      <Link
        href="/spiele"
        className="self-start rounded-full px-6 py-3 text-lg font-semibold"
        style={{ background: "var(--color-accent)", color: "var(--color-bg)" }}
      >
        Spiele ausprobieren
      </Link>
      <Link href="/login" className="self-start underline">
        Anmelden (Demo)
      </Link>
    </main>
  );
}
