import Link from "next/link";
import { Wortmarke } from "@/ui/Wortmarke";

export default function HomePage() {
  return (
    <main className="lv-space flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-10">
      <h1 className="w-full max-w-xl">
        <Wortmarke onDark className="h-auto w-full" />
      </h1>
      <p className="max-w-md text-center text-lg" style={{ color: "var(--lv-on-dark-muted)" }}>
        Die Plattform befindet sich im Aufbau.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/spiele" className="lv-btn lv-btn-reward text-lg">
          Spiele ausprobieren
        </Link>
        <Link href="/login" className="lv-btn lv-btn-quiet text-lg">
          Anmelden (Demo)
        </Link>
      </div>
    </main>
  );
}
