// Lernwelt als schwebende Insel, gezeichnet nach dem Illustrationsstil im UI-Konzept des
// Designpakets (eigene Zeichnung, siehe assets/LICENSES.md). Rein dekorativ: Name und Status
// stehen als Text daneben.

export type Motiv = "lesen" | "mathe" | "rechtschreibung" | "logik" | "spiele";

const MOTIVE: Motiv[] = ["rechtschreibung", "lesen", "mathe", "logik", "spiele"];

// Ordnet ein Thema anhand seines Namens einem Motiv zu; unbekannte Themen reihum.
export function motivFuer(themenName: string, index: number): Motiv {
  const name = themenName.toLowerCase();
  if (/rechtschreib|schreibung|endung|wort|buchstab/.test(name)) return "rechtschreibung";
  if (/lesen|silbe|text|geschicht/.test(name)) return "lesen";
  if (/mathe|zahl|rechn|plus|minus|mal/.test(name)) return "mathe";
  if (/logik|denk|rätsel/.test(name)) return "logik";
  return MOTIVE[index % MOTIVE.length]!;
}

const BODEN: Record<Motiv, { gras: string; kante: string; licht: string }> = {
  lesen: { gras: "#4CC36B", kante: "#2E9A4E", licht: "#8BE29C" },
  mathe: { gras: "#9B6BF0", kante: "#6E43C9", licht: "#C7AEFF" },
  rechtschreibung: { gras: "#FF8FB0", kante: "#D9608A", licht: "#FFC4D6" },
  logik: { gras: "#5CCB7A", kante: "#349A57", licht: "#A2E9B4" },
  spiele: { gras: "#FFD84D", kante: "#E5B82D", licht: "#FFF0B0" },
};

function Buch() {
  return (
    <g>
      <path
        d="M100 74 Q82 64 62 70 V40 Q82 34 100 44 Z"
        fill="#fff"
        stroke="#173D83"
        strokeWidth="3"
      />
      <path
        d="M100 74 Q118 64 138 70 V40 Q118 34 100 44 Z"
        fill="#fff"
        stroke="#173D83"
        strokeWidth="3"
      />
      <path
        d="M70 48 Q84 44 94 50 M70 56 Q84 52 94 58 M106 50 Q116 44 130 48 M106 58 Q116 52 130 56"
        stroke="#8FA6CC"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M58 72 Q80 64 100 78 Q120 64 142 72"
        fill="none"
        stroke="#2799F5"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </g>
  );
}

function Zahlen() {
  const wuerfel = [
    { x: 58, y: 48, farbe: "#2799F5", z: "1" },
    { x: 86, y: 34, farbe: "#FF777E", z: "2" },
    { x: 114, y: 48, farbe: "#38C9CE", z: "3" },
  ];
  return (
    <g fontFamily="var(--font-fredoka), var(--font-nunito), Arial, sans-serif" fontWeight="700">
      {wuerfel.map((w) => (
        <g key={w.z}>
          <rect
            x={w.x}
            y={w.y}
            width="28"
            height="28"
            rx="7"
            fill={w.farbe}
            stroke="#173D83"
            strokeWidth="2.5"
          />
          <text x={w.x + 14} y={w.y + 21} textAnchor="middle" fontSize="20" fill="#fff">
            {w.z}
          </text>
        </g>
      ))}
    </g>
  );
}

function Stift() {
  return (
    <g>
      <g transform="rotate(30 100 50)">
        <rect
          x="90"
          y="18"
          width="20"
          height="50"
          rx="3"
          fill="#FFD84D"
          stroke="#173D83"
          strokeWidth="2.5"
        />
        <rect
          x="90"
          y="12"
          width="20"
          height="10"
          rx="3"
          fill="#FF777E"
          stroke="#173D83"
          strokeWidth="2.5"
        />
        <path
          d="M90 68 L100 84 L110 68 Z"
          fill="#F7D7BE"
          stroke="#173D83"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M97 79 L100 84 L103 79 Z" fill="#173D83" />
      </g>
      <text
        x="66"
        y="72"
        fontFamily="var(--font-fredoka), var(--font-nunito), Arial, sans-serif"
        fontWeight="700"
        fontSize="26"
        fill="#fff"
        stroke="#173D83"
        strokeWidth="1.5"
      >
        Aa
      </text>
    </g>
  );
}

function Gluehbirne() {
  return (
    <g>
      <path
        d="M68 76 V52 A32 32 0 0 1 132 52 V76 Z"
        fill="#CFE9FF"
        opacity="0.55"
        stroke="#A6D6FF"
        strokeWidth="3"
      />
      <circle cx="100" cy="48" r="16" fill="#FFD84D" stroke="#E5B82D" strokeWidth="3" />
      <path
        d="M94 50 Q100 40 106 50"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect
        x="92"
        y="62"
        width="16"
        height="12"
        rx="3"
        fill="#8FA6CC"
        stroke="#173D83"
        strokeWidth="2"
      />
      <path
        d="M86 30 L80 24 M114 30 L120 24 M100 24 V16"
        stroke="#FFD84D"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Spielpad() {
  return (
    <g>
      <path
        d="M70 48 Q72 36 86 38 H114 Q128 36 130 48 L136 70 Q138 80 128 80 Q122 80 116 70 H84 Q78 80 72 80 Q62 80 64 70 Z"
        fill="#173D83"
        stroke="#0B2453"
        strokeWidth="2.5"
      />
      <path d="M82 52 V64 M76 58 H88" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="114" cy="54" r="4" fill="#FF777E" />
      <circle cx="122" cy="62" r="4" fill="#38C9CE" />
      <circle cx="106" cy="62" r="4" fill="#FFD84D" />
    </g>
  );
}

const MOTIV_ZEICHNUNG: Record<Motiv, () => React.ReactElement> = {
  lesen: Buch,
  mathe: Zahlen,
  rechtschreibung: Stift,
  logik: Gluehbirne,
  spiele: Spielpad,
};

export function Planet({
  motiv,
  gesperrt,
  id,
  className = "h-40 w-48",
}: {
  motiv: Motiv;
  gesperrt: boolean;
  id: string;
  className?: string;
}) {
  const boden = BODEN[motiv];
  const Zeichnung = MOTIV_ZEICHNUNG[motiv];
  const filterId = `grau-${id}`;
  const felsId = `fels-${id}`;
  return (
    <svg viewBox="0 0 200 175" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={felsId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7D6BB0" />
          <stop offset="100%" stopColor="#3D2F6B" />
        </linearGradient>
        <filter id={filterId}>
          <feColorMatrix type="saturate" values="0.15" />
        </filter>
      </defs>
      <g filter={gesperrt ? `url(#${filterId})` : undefined} opacity={gesperrt ? 0.6 : 1}>
        {/* kleine schwebende Steine */}
        <path d="M14 128 l8 -6 l8 4 l-2 9 l-10 2 Z" fill="#5B4A8A" />
        <path d="M178 136 l6 -5 l7 3 l-2 7 l-8 1 Z" fill="#5B4A8A" />
        {/* Felsunterseite */}
        <path
          d="M16 96 C26 122 50 128 66 140 C80 150 90 168 100 170 C112 168 120 150 134 140 C150 128 174 122 184 96 Z"
          fill={`url(#${felsId})`}
        />
        <path
          d="M46 112 L60 132 L74 118 Z M118 120 L132 138 L146 116 Z M88 140 L100 160 L108 138 Z"
          fill="#9A89CF"
          opacity="0.5"
        />
        {/* Kristalle */}
        <path d="M30 104 l6 -16 l6 16 l-6 8 Z" fill="#38C9CE" stroke="#1E9CA1" strokeWidth="1.5" />
        <path d="M160 108 l5 -12 l5 12 l-5 6 Z" fill="#A6D6FF" stroke="#2799F5" strokeWidth="1.5" />
        {/* Boden */}
        <ellipse cx="100" cy="98" rx="86" ry="22" fill={boden.kante} />
        <ellipse cx="100" cy="90" rx="86" ry="22" fill={boden.gras} />
        <ellipse cx="88" cy="84" rx="50" ry="10" fill={boden.licht} opacity="0.6" />
        {/* Büsche */}
        <circle cx="34" cy="86" r="9" fill={boden.kante} />
        <circle cx="42" cy="82" r="7" fill={boden.licht} />
        <circle cx="166" cy="88" r="8" fill={boden.kante} />
        <g transform="translate(100 80) scale(1.15) translate(-100 -80)">
          <Zeichnung />
        </g>
        {/* Funkelsterne */}
        <path d="M168 40 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#FFD84D" />
        <path d="M26 46 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill="#fff" />
      </g>
      {gesperrt ? (
        <g transform="translate(78 58)">
          <circle cx="22" cy="22" r="24" fill="#173D83" stroke="#fff" strokeWidth="3" />
          <rect x="11" y="20" width="22" height="16" rx="4" fill="#fff" />
          <path d="M15 20 V15 a7 7 0 0 1 14 0 V20" fill="none" stroke="#fff" strokeWidth="4" />
        </g>
      ) : null}
    </svg>
  );
}
