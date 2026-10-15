import type { ReactElement } from "react";

// Gezeichnete Bilder aus dem Entwurf „Wald-Wesen füttern“ (Design-Canvas von Alois, 2026-10-13).
// Wörter ohne Zeichnung zeigen vorerst ihr Emoji aus der Konfiguration.

type Bild = (props: { groesse: number }) => ReactElement;

const Gabel: Bild = ({ groesse }) => (
  <svg role="img" aria-label="Bild" width={groesse} height={groesse} viewBox="0 0 200 200">
    <g fill="#8d98a6" stroke="#5f6b79" strokeWidth="3" strokeLinejoin="round">
      <rect x="90" y="86" width="20" height="100" rx="10" />
      <path d="M62 24 H74 V70 H86 V24 H98 V70 H102 V24 H114 V70 H126 V24 H138 V78 Q138 98 100 98 Q62 98 62 78 Z" />
    </g>
    <rect x="94" y="110" width="5" height="64" rx="2.5" fill="#d4dae1" />
  </svg>
);

const Eimer: Bild = ({ groesse }) => (
  <svg role="img" aria-label="Bild" width={groesse} height={groesse} viewBox="0 0 200 200">
    <path
      d="M46 70 Q100 8 154 70"
      fill="none"
      stroke="#5f6b79"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <path
      d="M40 66 H160 L146 176 Q100 188 54 176 Z"
      fill="#4f9bd9"
      stroke="#2f6aa0"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <ellipse cx="100" cy="66" rx="60" ry="12" fill="#2f6aa0" />
    <ellipse cx="100" cy="66" rx="52" ry="8" fill="#a8d6f2" />
    <path d="M62 100 H138 M66 134 H134" stroke="#8cc4ea" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Besen: Bild = ({ groesse }) => (
  <svg role="img" aria-label="Bild" width={groesse} height={groesse} viewBox="0 0 200 200">
    <rect
      x="94"
      y="10"
      width="12"
      height="110"
      rx="6"
      fill="#a9754a"
      stroke="#7a4f2e"
      strokeWidth="3"
    />
    <rect x="74" y="112" width="52" height="16" rx="5" fill="#c9402f" />
    <path
      d="M70 128 H130 L152 188 H48 Z"
      fill="#e6c25a"
      stroke="#b5902a"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M70 140 L62 184 M86 140 L82 186 M100 140 V186 M114 140 L118 186 M130 140 L138 184"
      stroke="#b5902a"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const Ball: Bild = ({ groesse }) => (
  <svg role="img" aria-label="Bild" width={groesse} height={groesse} viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="76" fill="#f26b4f" stroke="#a83d27" strokeWidth="3" />
    <path
      d="M30 78 Q100 120 170 78"
      fill="none"
      stroke="#fff7e6"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <path
      d="M30 124 Q100 164 170 124"
      fill="none"
      stroke="#fff7e6"
      strokeWidth="12"
      strokeLinecap="round"
    />
    <ellipse
      cx="72"
      cy="56"
      rx="16"
      ry="9"
      fill="#ffffff"
      opacity="0.35"
      transform="rotate(-30 72 56)"
    />
  </svg>
);

/** Zeichnungen nach Wort-ID. */
export const bilder: Partial<Record<string, Bild>> = {
  gabel: Gabel,
  eimer: Eimer,
  besen: Besen,
  ball: Ball,
};
