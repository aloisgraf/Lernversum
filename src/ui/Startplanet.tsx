import Image, { type StaticImageData } from "next/image";
import mathe from "./bilder/universum/planet-mathe.webp";

// Planeten der Kinder-Startseite, je einer Kategorie zugeordnet (über ihren Namen). Bilder von
// Alois (assets/LICENSES.md). Reine Anzeige: Ob ein Planet offen ist, entscheidet der Server.
export type Startplanet = { kategorie: string; name: string; bild: StaticImageData };

export const STARTPLANETEN: Startplanet[] = [
  { kategorie: "Mathe", name: "Matheplanet", bild: mathe },
];

export function startplanetFuer(kategorieName: string): Startplanet | undefined {
  const name = kategorieName.trim().toLowerCase();
  return STARTPLANETEN.find((p) => p.kategorie.toLowerCase() === name);
}

// Dekorativ: Name und Status stehen als Text daneben.
export function StartplanetBild({
  planet,
  gesperrt = false,
  className = "w-[min(70vw,22rem)]",
}: {
  planet: Startplanet;
  gesperrt?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src={planet.bild}
        alt=""
        priority
        sizes="(min-width: 640px) 352px, 70vw"
        className="h-auto w-full"
        style={{
          filter: gesperrt
            ? "grayscale(0.9) opacity(0.6)"
            : "drop-shadow(0 0 18px rgba(150, 120, 255, 0.55))",
        }}
      />
      {gesperrt ? (
        <svg
          viewBox="0 0 72 72"
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
        >
          <circle cx="36" cy="36" r="34" fill="#173D83" stroke="#fff" strokeWidth="4" />
          <rect x="20" y="33" width="32" height="23" rx="5" fill="#fff" />
          <path d="M26 33 V25 a10 10 0 0 1 20 0 V33" fill="none" stroke="#fff" strokeWidth="5" />
        </svg>
      ) : null}
    </span>
  );
}
