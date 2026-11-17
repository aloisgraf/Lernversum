import Image, { type StaticImageData } from "next/image";
import geschichten from "./bilder/universum/planet-geschichten.webp";
import lesen from "./bilder/universum/planet-lesen.webp";
import mathe from "./bilder/universum/planet-mathe.webp";
import mein from "./bilder/universum/planet-mein.webp";
import schreiben from "./bilder/universum/planet-schreiben.webp";
import weltMathe from "./bilder/universum/welt-mathe.webp";

// Planeten der Kinder-Startseite (Alois, 2026-11-16). Lernwelt-Planeten gehören über den Namen
// zu einer Kategorie; „Mein Planet“ (kategorie: null) ist keine Lernwelt. Bilder von Alois
// (assets/LICENSES.md). Reine Anzeige: Ob ein Planet offen ist, entscheidet der Server.
export type Platz = "oben-links" | "oben-rechts" | "mitte" | "unten-links" | "unten-rechts";
export type Startplanet = {
  kategorie: string | null;
  name: string;
  bild: StaticImageData;
  platz: Platz;
  /** Landschaft für die Planetenseite (unten, Himmel darüber); ohne sie steht dort der Planet. */
  welt?: StaticImageData;
};

// Reihenfolge = Lesereihenfolge am Handy und für Vorleseprogramme.
export const STARTPLANETEN: Startplanet[] = [
  { kategorie: null, name: "Mein Planet", bild: mein, platz: "mitte" },
  { kategorie: "Mathe", name: "Matheplanet", bild: mathe, platz: "oben-links", welt: weltMathe },
  { kategorie: "Rechtschreibung", name: "Schreibplanet", bild: schreiben, platz: "oben-rechts" },
  { kategorie: "Geschichten", name: "Geschichtenplanet", bild: geschichten, platz: "unten-links" },
  { kategorie: "Lesen", name: "Leseplanet", bild: lesen, platz: "unten-rechts" },
];

export function startplanetFuer(kategorieName: string): Startplanet | undefined {
  const name = kategorieName.trim().toLowerCase();
  return STARTPLANETEN.find((p) => p.kategorie?.toLowerCase() === name);
}

// Dekorativ: Name und Status stehen als Text daneben.
export function StartplanetBild({
  planet,
  gesperrt = false,
  leuchtet = false,
  className = "w-full",
}: {
  planet: Startplanet;
  gesperrt?: boolean;
  /** Offene Aufgaben: goldenes, pulsierendes Leuchten statt des ruhigen Scheins. */
  leuchtet?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative block ${className}`}>
      <Image
        src={planet.bild}
        alt=""
        priority
        sizes="(min-width: 768px) 18rem, 45vw"
        className={`aspect-square h-auto w-full object-contain ${leuchtet ? "lv-leuchten" : ""}`}
        style={
          leuchtet
            ? undefined
            : {
                filter: gesperrt
                  ? "grayscale(0.9) opacity(0.6)"
                  : "drop-shadow(0 0 18px rgba(150, 120, 255, 0.55))",
              }
        }
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

// Planetenname im Bogen unter dem Planeten, ohne Rahmen (Alois, 2026-11-17). Der Name
// ist echter SVG-Text und zugleich der Name der Grafik für Vorleseprogramme.
export function PlanetSchild({ name }: { name: string }) {
  const bogenId = `bogen-${name.replace(/[^a-z]/gi, "")}`;
  return (
    <span className="-mt-[12%] block w-full">
      <svg
        viewBox="0 0 300 76"
        role="img"
        aria-label={name}
        className="block h-auto w-full overflow-visible"
      >
        <path id={bogenId} d="M 26 18 Q 150 76 274 18" fill="none" />
        <text
          className="font-display"
          fill="#fff"
          stroke="rgba(8, 20, 60, 0.85)"
          strokeWidth="7"
          strokeLinejoin="round"
          paintOrder="stroke"
          fontSize="34"
          textAnchor="middle"
          dominantBaseline="central"
        >
          <textPath href={`#${bogenId}`} startOffset="50%">
            {name}
          </textPath>
        </text>
      </svg>
    </span>
  );
}
