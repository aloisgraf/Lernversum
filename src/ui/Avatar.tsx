import type { AvatarId } from "@/lib/demo-profile/core";

// Avatare als eigene Zeichnungen im Stil des UI-Konzepts (Kinder im Raumanzug, Alien, Roboter).
// Bewusst nur gezeichnete Figuren aus fester Auswahl, nie Fotos (DATA-PROTECTION.md).

type Frisur = "kurz" | "zoepfe" | "locken" | "lang";
type KindDaten = { art: "kind"; haut: string; haar: string; frisur: Frisur; grund: string };
type AvatarDaten = KindDaten | { art: "alien"; grund: string } | { art: "roboter"; grund: string };

export const AVATARE: Record<AvatarId, AvatarDaten & { name: string }> = {
  "kind-1": {
    art: "kind",
    haut: "#F2C6A0",
    haar: "#6B3E26",
    frisur: "kurz",
    grund: "#8050E8",
    name: "Kind mit kurzen braunen Haaren",
  },
  "kind-2": {
    art: "kind",
    haut: "#E0A878",
    haar: "#2B2118",
    frisur: "zoepfe",
    grund: "#38C9CE",
    name: "Kind mit dunklen Zöpfen",
  },
  "kind-3": {
    art: "kind",
    haut: "#8D5A3B",
    haar: "#1E1712",
    frisur: "locken",
    grund: "#FFD84D",
    name: "Kind mit dunklen Locken",
  },
  "kind-4": {
    art: "kind",
    haut: "#F7D7BE",
    haar: "#E9B949",
    frisur: "lang",
    grund: "#FF777E",
    name: "Kind mit langen blonden Haaren",
  },
  "kind-5": {
    art: "kind",
    haut: "#C68A5E",
    haar: "#C2492B",
    frisur: "zoepfe",
    grund: "#2799F5",
    name: "Kind mit roten Zöpfen",
  },
  "kind-6": {
    art: "kind",
    haut: "#5C3A26",
    haar: "#120D0A",
    frisur: "kurz",
    grund: "#B79BFF",
    name: "Kind mit kurzen schwarzen Haaren",
  },
  alien: { art: "alien", grund: "#173D83", name: "Freundliches Alien" },
  roboter: { art: "roboter", grund: "#38C9CE", name: "Kleiner Roboter" },
};

function Augen({ y = 62 }: { y?: number }) {
  return (
    <g>
      <ellipse cx="51" cy={y} rx="4" ry="5" fill="#1B1B2F" />
      <ellipse cx="69" cy={y} rx="4" ry="5" fill="#1B1B2F" />
      <circle cx="52.5" cy={y - 2} r="1.5" fill="#fff" />
      <circle cx="70.5" cy={y - 2} r="1.5" fill="#fff" />
    </g>
  );
}

function Haare({ frisur, farbe }: { frisur: Frisur; farbe: string }) {
  switch (frisur) {
    case "kurz":
      return (
        <path
          d="M37 60 Q36 36 60 35 Q84 36 83 60 Q78 46 66 47 Q56 42 46 48 Q40 52 37 60 Z"
          fill={farbe}
        />
      );
    case "zoepfe":
      return (
        <g fill={farbe}>
          <circle cx="34" cy="62" r="8" />
          <circle cx="86" cy="62" r="8" />
          <path d="M37 62 Q35 35 60 35 Q85 35 83 62 Q80 48 60 46 Q40 48 37 62 Z" />
        </g>
      );
    case "locken":
      return (
        <g fill={farbe}>
          {[
            [40, 50],
            [46, 41],
            [55, 37],
            [65, 37],
            [74, 41],
            [80, 50],
            [37, 59],
            [83, 59],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="8" />
          ))}
        </g>
      );
    case "lang":
      return (
        <path
          d="M36 82 Q32 40 60 35 Q88 40 84 82 L78 82 Q80 56 72 48 Q60 54 46 48 Q40 56 42 82 Z"
          fill={farbe}
        />
      );
  }
}

function Kind({ haut, haar, frisur }: KindDaten) {
  return (
    <g>
      {/* Raumanzug */}
      <path
        d="M22 120 Q22 92 60 90 Q98 92 98 120 Z"
        fill="#F4F7FC"
        stroke="#B9C6E0"
        strokeWidth="2"
      />
      <rect x="52" y="100" width="16" height="10" rx="3" fill="#FF777E" />
      {/* Helmring */}
      <circle cx="60" cy="60" r="36" fill="#E8EEF8" stroke="#B9C6E0" strokeWidth="2" />
      <circle cx="60" cy="60" r="29" fill="#CFE9FF" />
      {/* Gesicht */}
      <Haare frisur={frisur} farbe={haar} />
      <circle cx="60" cy="63" r="20" fill={haut} />
      {frisur === "kurz" || frisur === "lang" ? (
        <path d="M41 58 Q46 44 60 45 Q72 45 79 58 Q70 50 60 52 Q50 50 41 58 Z" fill={haar} />
      ) : null}
      <Augen y={63} />
      <circle cx="46" cy="70" r="3.5" fill="#FF9AA2" opacity="0.7" />
      <circle cx="74" cy="70" r="3.5" fill="#FF9AA2" opacity="0.7" />
      <path
        d="M53 72 Q60 79 67 72"
        fill="none"
        stroke="#7A2E2E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Glanz auf dem Helm */}
      <path
        d="M36 44 Q42 32 54 28"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  );
}

function Alien() {
  return (
    <g>
      <path
        d="M44 34 Q40 20 32 16"
        stroke="#3FBF6E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M76 34 Q80 20 88 16"
        stroke="#3FBF6E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="32" cy="16" r="5" fill="#FFD84D" />
      <circle cx="88" cy="16" r="5" fill="#FFD84D" />
      <path d="M26 120 Q28 96 60 94 Q92 96 94 120 Z" fill="#3FBF6E" />
      <ellipse cx="60" cy="62" rx="32" ry="30" fill="#5FD88A" stroke="#2E9A4E" strokeWidth="2" />
      <ellipse cx="47" cy="60" rx="10" ry="12" fill="#fff" />
      <ellipse cx="73" cy="60" rx="10" ry="12" fill="#fff" />
      <circle cx="49" cy="62" r="6" fill="#173D83" />
      <circle cx="75" cy="62" r="6" fill="#173D83" />
      <circle cx="51" cy="59" r="2" fill="#fff" />
      <circle cx="77" cy="59" r="2" fill="#fff" />
      <path
        d="M50 80 Q60 88 70 80"
        fill="none"
        stroke="#1E6B3A"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Roboter() {
  return (
    <g>
      <path d="M60 30 V18" stroke="#8FA6CC" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="16" r="5" fill="#FF777E" />
      <path
        d="M28 120 Q30 98 60 96 Q90 98 92 120 Z"
        fill="#DDE6F3"
        stroke="#8FA6CC"
        strokeWidth="2"
      />
      <rect
        x="30"
        y="30"
        width="60"
        height="58"
        rx="18"
        fill="#F4F7FC"
        stroke="#8FA6CC"
        strokeWidth="2.5"
      />
      <rect x="38" y="44" width="44" height="24" rx="12" fill="#173D83" />
      <circle cx="50" cy="56" r="5" fill="#38C9CE" />
      <circle cx="70" cy="56" r="5" fill="#38C9CE" />
      <path d="M50 78 H70" stroke="#8FA6CC" strokeWidth="3" strokeLinecap="round" />
      <rect x="24" y="50" width="8" height="16" rx="3" fill="#8FA6CC" />
      <rect x="88" y="50" width="8" height="16" rx="3" fill="#8FA6CC" />
    </g>
  );
}

// Mit `beschriftet` trägt das Bild seinen Namen für Screenreader; sonst ist es Dekoration.
export function Avatar({
  id,
  className = "h-16 w-16",
  beschriftet = false,
}: {
  id: AvatarId;
  className?: string;
  beschriftet?: boolean;
}) {
  const daten = AVATARE[id];
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      {...(beschriftet ? { role: "img", "aria-label": daten.name } : { "aria-hidden": true })}
    >
      <clipPath id={`avatar-rund-${id}`}>
        <circle cx="60" cy="60" r="60" />
      </clipPath>
      <g clipPath={`url(#avatar-rund-${id})`}>
        <rect width="120" height="120" fill={daten.grund} />
        <circle cx="96" cy="22" r="2" fill="#fff" opacity="0.8" />
        <circle cx="18" cy="34" r="1.5" fill="#fff" opacity="0.8" />
        {daten.art === "kind" ? (
          <Kind {...daten} />
        ) : daten.art === "alien" ? (
          <Alien />
        ) : (
          <Roboter />
        )}
      </g>
    </svg>
  );
}
