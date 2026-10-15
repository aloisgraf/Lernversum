import type { ReactElement } from "react";
import type { Ziel } from "../logic/runde";

// Grafiken aus dem Entwurf „Wald-Wesen füttern“ (Design-Canvas von Alois, 2026-10-13).

/** Hintergrund: Nachthimmel, Mond, Wolkeninseln, Wald, Leuchtpilze. Füllt die Fläche (cover). */
export function Hintergrund() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1180 760"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="wwf-himmel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1633" />
          <stop offset="0.55" stopColor="#1c3f63" />
          <stop offset="1" stopColor="#2f6a5c" />
        </linearGradient>
        <radialGradient id="wwf-mondschein" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="wwf-leuchten" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1180" height="760" fill="url(#wwf-himmel)" />
      <g fill="#fff7e6">
        {[
          [90, 70, 2],
          [210, 40, 1.6],
          [330, 90, 2.2],
          [420, 36, 1.5],
          [560, 62, 2],
          [690, 34, 1.6],
          [780, 92, 2.2],
          [880, 48, 1.8],
          [960, 200, 1.6],
          [1100, 60, 2],
          [60, 210, 1.8],
          [270, 250, 1.5],
          [1120, 260, 1.7],
          [640, 130, 1.4],
          [150, 120, 1.5],
        ].map(([cx, cy, r]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <circle cx="1030" cy="130" r="120" fill="url(#wwf-mondschein)" />
      <circle cx="1030" cy="130" r="46" fill="#f8ebbd" />
      <circle cx="1016" cy="118" r="8" fill="#efdca0" />
      <circle cx="1046" cy="146" r="6" fill="#efdca0" />
      <g>
        <ellipse cx="170" cy="190" rx="110" ry="22" fill="#e8f1f5" opacity="0.18" />
        <path d="M96 200 Q170 250 244 200 Z" fill="#3f6f5a" />
        <ellipse cx="170" cy="198" rx="74" ry="12" fill="#58946f" />
        <path d="M150 192 L162 150 L174 192 Z" fill="#2c6a4a" />
        <path d="M172 192 L186 140 L200 192 Z" fill="#245a3f" />
      </g>
      <g>
        <ellipse cx="760" cy="300" rx="120" ry="22" fill="#e8f1f5" opacity="0.14" />
        <path d="M690 306 Q760 352 830 306 Z" fill="#3f6f5a" />
        <ellipse cx="760" cy="304" rx="68" ry="11" fill="#58946f" />
        <rect x="748" y="272" width="26" height="22" fill="#a9754a" />
        <path d="M742 274 L761 256 L780 274 Z" fill="#7a4a2c" />
        <rect x="756" y="280" width="9" height="14" fill="#ffd98a" />
      </g>
      <ellipse cx="500" cy="170" rx="70" ry="14" fill="#e8f1f5" opacity="0.1" />
      <path d="M0 500 Q200 430 420 490 T820 480 T1180 470 L1180 760 L0 760 Z" fill="#1e4f3d" />
      <path d="M0 580 Q260 520 520 575 T1180 560 L1180 760 L0 760 Z" fill="#163b2f" />
      <g>
        <rect x="62" y="330" width="26" height="240" fill="#2d1f17" />
        <polygon points="75,170 20,300 130,300" fill="#1a4a37" />
        <polygon points="75,230 8,370 142,370" fill="#17402f" />
        <polygon points="75,300 -6,450 156,450" fill="#123628" />
      </g>
      <g>
        <rect x="1088" y="340" width="30" height="240" fill="#2d1f17" />
        <polygon points="1103,170 1040,300 1166,300" fill="#1a4a37" />
        <polygon points="1103,240 1030,380 1176,380" fill="#17402f" />
        <polygon points="1103,310 1016,460 1190,460" fill="#123628" />
        <rect x="1050" y="402" width="52" height="38" fill="#b07a4c" />
        <polygon points="1044,404 1076,380 1108,404" fill="#6f3f26" />
        <rect x="1068" y="414" width="16" height="26" fill="#ffd98a" />
        <circle cx="1076" cy="427" r="40" fill="url(#wwf-leuchten)" opacity="0.5" />
      </g>
      <g>
        <circle cx="40" cy="648" r="34" fill="url(#wwf-leuchten)" />
        <rect x="36" y="650" width="8" height="22" fill="#f4e2c1" />
        <path d="M20 652 Q40 622 60 652 Z" fill="#ffb86b" />
        <circle cx="1140" cy="650" r="34" fill="url(#wwf-leuchten)" />
        <rect x="1136" y="652" width="8" height="22" fill="#f4e2c1" />
        <path d="M1120 654 Q1140 624 1160 654 Z" fill="#ff9d8a" />
        <circle cx="1100" cy="700" r="20" fill="url(#wwf-leuchten)" />
        <rect x="1097" y="700" width="6" height="14" fill="#f4e2c1" />
        <path d="M1087 702 Q1100 682 1113 702 Z" fill="#ffb86b" />
      </g>
      <g fill="#ffe9a0">
        <circle cx="300" cy="420" r="3" />
        <circle cx="880" cy="400" r="3" />
        <circle cx="190" cy="500" r="2.5" />
        <circle cx="980" cy="520" r="2.5" />
        <circle cx="420" cy="480" r="2" />
        <circle cx="760" cy="470" r="2" />
      </g>
    </svg>
  );
}

function Baumstumpf() {
  return (
    <>
      <ellipse cx="80" cy="166" rx="62" ry="9" fill="#000" opacity="0.25" />
      <rect x="34" y="138" width="92" height="26" rx="6" fill="#8a6240" />
      <ellipse cx="80" cy="138" rx="46" ry="9" fill="#b98d5e" />
    </>
  );
}

function Igel() {
  return (
    <>
      <Baumstumpf />
      <ellipse cx="62" cy="132" rx="12" ry="7" fill="#3f2f25" />
      <ellipse cx="102" cy="132" rx="12" ry="7" fill="#3f2f25" />
      <path
        d="M22 118 L14 82 L34 96 L34 60 L54 82 L62 48 L78 76 L94 44 L102 78 L124 52 L124 88 L146 74 L138 120 Q80 142 22 118 Z"
        fill="#5b4636"
      />
      <path
        d="M30 108 L28 88 M50 104 L50 84 M72 102 L74 80 M96 102 L100 82"
        stroke="#3f2f25"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse cx="112" cy="106" rx="36" ry="28" fill="#ecd0a6" />
      <circle cx="98" cy="84" r="9" fill="#ecd0a6" />
      <path d="M86 116 Q112 132 140 114 L140 124 Q112 142 86 128 Z" fill="#2f6fd0" />
      <circle cx="114" cy="100" r="5" fill="#2b2118" />
      <circle cx="115.5" cy="98.5" r="1.6" fill="#fff" />
      <circle cx="144" cy="106" r="7" fill="#2b2118" />
    </>
  );
}

function Eule() {
  return (
    <>
      <Baumstumpf />
      <ellipse cx="64" cy="134" rx="11" ry="6" fill="#f0a830" />
      <ellipse cx="96" cy="134" rx="11" ry="6" fill="#f0a830" />
      <ellipse cx="80" cy="84" rx="48" ry="56" fill="#3f9a63" />
      <polygon points="40,48 46,16 68,40" fill="#3f9a63" />
      <polygon points="120,48 114,16 92,40" fill="#3f9a63" />
      <ellipse cx="32" cy="96" rx="14" ry="34" fill="#2e7c4e" />
      <ellipse cx="128" cy="96" rx="14" ry="34" fill="#2e7c4e" />
      <ellipse cx="80" cy="102" rx="30" ry="34" fill="#d3ecdc" />
      <path
        d="M62 96 Q70 104 78 96 M82 96 Q90 104 98 96 M64 114 Q72 122 80 114 M80 114 Q88 122 96 114"
        fill="none"
        stroke="#8fc9a6"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="60" cy="64" r="17" fill="#fff7e6" />
      <circle cx="100" cy="64" r="17" fill="#fff7e6" />
      <circle cx="62" cy="65" r="8" fill="#1b2b22" />
      <circle cx="98" cy="65" r="8" fill="#1b2b22" />
      <circle cx="65" cy="62" r="2.6" fill="#fff" />
      <circle cx="101" cy="62" r="2.6" fill="#fff" />
      <polygon points="72,78 88,78 80,94" fill="#f0a830" />
      <path d="M58 118 Q80 132 102 118 L102 126 Q80 140 58 126 Z" fill="#23794a" />
    </>
  );
}

function Fuchs() {
  return (
    <>
      <Baumstumpf />
      <path d="M118 132 Q158 130 150 100 Q140 122 112 118 Z" fill="#e0603a" />
      <path d="M148 104 Q154 118 142 124 Q152 114 148 104 Z" fill="#fbefe0" />
      <ellipse cx="80" cy="116" rx="34" ry="24" fill="#e0603a" />
      <path
        d="M30 70 L38 14 L66 42 L94 42 L122 14 L130 70 Q130 122 80 128 Q30 122 30 70 Z"
        fill="#e0603a"
      />
      <polygon points="42,38 44,26 56,40" fill="#7a2a1a" />
      <polygon points="118,38 116,26 104,40" fill="#7a2a1a" />
      <path d="M32 82 Q80 104 128 82 Q126 120 80 128 Q34 120 32 82 Z" fill="#fbefe0" />
      <circle cx="58" cy="78" r="5.5" fill="#2b1a14" />
      <circle cx="102" cy="78" r="5.5" fill="#2b1a14" />
      <circle cx="60" cy="76" r="1.8" fill="#fff" />
      <circle cx="104" cy="76" r="1.8" fill="#fff" />
      <ellipse cx="80" cy="106" rx="8" ry="6" fill="#2b1a14" />
      <path
        d="M80 112 V118 M70 122 Q80 128 90 122"
        fill="none"
        stroke="#2b1a14"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <polygon points="58,128 102,128 80,150" fill="#c9402f" />
    </>
  );
}

function Hoehle() {
  return (
    <>
      <ellipse cx="80" cy="166" rx="66" ry="9" fill="#000" opacity="0.25" />
      <path d="M8 160 Q14 36 80 24 Q146 36 152 160 Z" fill="#46566a" />
      <path d="M26 150 Q34 60 80 44 Q70 90 60 150 Z" fill="#566a80" opacity="0.6" />
      <ellipse cx="80" cy="134" rx="40" ry="46" fill="#0f1722" />
      <circle cx="68" cy="124" r="4.5" fill="#ffd25e" />
      <circle cx="92" cy="124" r="4.5" fill="#ffd25e" />
      <path
        d="M72 138 Q80 144 88 138"
        fill="none"
        stroke="#ffd25e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text x="108" y="54" fontSize="22" fontWeight="700" fill="#fff7e6">
        z
      </text>
      <text x="122" y="38" fontSize="16" fontWeight="700" fill="#fff7e6" opacity="0.8">
        z
      </text>
      <circle cx="30" cy="58" r="3" fill="#ffe9a0" />
      <circle cx="130" cy="86" r="2.5" fill="#ffe9a0" />
    </>
  );
}

const FIGUR: Record<Ziel, () => ReactElement> = { el: Igel, en: Eule, er: Fuchs, hoehle: Hoehle };

export const WESEN: Record<
  Ziel,
  {
    name: string;
    schild: string;
    ariaLabel: string;
    farbe: string;
    schatten: string;
    schrift: string;
  }
> = {
  el: {
    name: "Igel",
    schild: "-el",
    ariaLabel: "Igel, Endung el",
    farbe: "#2f6fd0",
    schatten: "#1c4a96",
    schrift: "#fff",
  },
  en: {
    name: "Eule",
    schild: "-en",
    ariaLabel: "Eule, Endung en",
    farbe: "#23794a",
    schatten: "#15532f",
    schrift: "#fff",
  },
  er: {
    name: "Fuchs",
    schild: "-er",
    ariaLabel: "Fuchs, Endung er",
    farbe: "#c9402f",
    schatten: "#8f2a1d",
    schrift: "#fff",
  },
  hoehle: {
    name: "Schlafhöhle",
    schild: "Schlafhöhle",
    ariaLabel: "Schlafhöhle, keine dieser Endungen",
    farbe: "#46566a",
    schatten: "#2c3947",
    schrift: "#fff7e6",
  },
};

/** Ein Wald-Wesen (oder die Schlafhöhle) als Zeichnung. */
export function WesenFigur({ ziel, className }: { ziel: Ziel; className?: string }) {
  const Figur = FIGUR[ziel];
  return (
    <svg aria-hidden="true" viewBox="0 0 160 175" className={className}>
      <Figur />
    </svg>
  );
}
