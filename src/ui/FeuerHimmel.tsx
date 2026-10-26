// Eigener Hintergrund für den Feuerplaneten (Alois, 2026-10-26: farbig, passend zum Planeten):
// Galaxie, Ringplanet, kleiner Mond, funkelnde Sterne und eine Lava-Landschaft unten, auf der
// Funki steht. Rein dekorativ.

const STERNE: [number, number, number][] = [
  [80, 120, 9],
  [260, 60, 6],
  [420, 210, 7],
  [610, 90, 10],
  [760, 300, 6],
  [940, 150, 8],
  [1120, 260, 9],
  [1290, 110, 7],
  [1380, 380, 6],
  [180, 420, 6],
  [520, 470, 7],
  [1010, 460, 6],
];

function Funkeln({ x, y, r }: { x: number; y: number; r: number }) {
  const k = r * 0.18;
  return (
    <path
      d={`M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r} Z`}
      fill="#FFE58A"
    />
  );
}

export function FeuerHimmel() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="fh-himmel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B1F7A" />
          <stop offset="0.45" stopColor="#3A1D86" />
          <stop offset="0.8" stopColor="#6A2380" />
          <stop offset="1" stopColor="#8A2E5E" />
        </linearGradient>
        <radialGradient id="fh-nebel1" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#E66BD8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#E66BD8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fh-nebel2" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#3FA8FF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#3FA8FF" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fh-glut" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#FF7A1A" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FF7A1A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fh-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7FD3FF" />
          <stop offset="1" stopColor="#5A6CFF" />
        </linearGradient>
        <radialGradient id="fh-ringplanet" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9AA8FF" />
          <stop offset="1" stopColor="#4B3FC4" />
        </radialGradient>
        <radialGradient id="fh-mond" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9FD8FF" />
          <stop offset="1" stopColor="#2F6FD6" />
        </radialGradient>
        <linearGradient id="fh-fels" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5B2E66" />
          <stop offset="1" stopColor="#2C1336" />
        </linearGradient>
        <filter id="fh-weich">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>
      <rect width="1440" height="900" fill="url(#fh-himmel)" />
      <ellipse cx="1180" cy="170" rx="360" ry="220" fill="url(#fh-nebel1)" />
      <ellipse cx="220" cy="140" rx="380" ry="230" fill="url(#fh-nebel2)" />
      {/* Galaxie oben rechts */}
      <g transform="translate(1210 165) rotate(-20)" filter="url(#fh-weich)" opacity="0.85">
        <ellipse rx="150" ry="60" fill="#C86BE6" opacity="0.6" />
        <ellipse rx="80" ry="34" fill="#F3A6F0" opacity="0.8" />
        <ellipse rx="26" ry="14" fill="#FFF0FF" />
      </g>
      <g
        transform="translate(1210 165) rotate(-20)"
        fill="none"
        stroke="#F6C6FF"
        strokeOpacity="0.5"
        strokeWidth="6"
      >
        <path d="M0 0 C60 -30 130 -10 140 30" />
        <path d="M0 0 C-60 30 -130 10 -140 -30" />
      </g>
      {/* Ringplanet oben links */}
      <g transform="translate(150 150)">
        <ellipse
          rx="110"
          ry="26"
          fill="none"
          stroke="url(#fh-ring)"
          strokeWidth="10"
          transform="rotate(-14)"
          opacity="0.8"
        />
        <circle r="64" fill="url(#fh-ringplanet)" />
        <path
          d="M-60 -12 Q0 -26 60 -6 M-62 12 Q0 0 62 18"
          stroke="#B9C2FF"
          strokeWidth="6"
          fill="none"
          opacity="0.5"
        />
      </g>
      {/* Kleiner Mond rechts */}
      <circle cx="1360" cy="420" r="40" fill="url(#fh-mond)" opacity="0.9" />
      {/* Sternschnuppe */}
      <path
        d="M980 70 L1080 40"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="1080" cy="40" r="4" fill="#fff" />
      {STERNE.map(([x, y, r], i) => (
        <Funkeln key={i} x={x} y={y} r={r} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 397) % 1440}
          cy={(i * 211) % 620}
          r={i % 5 === 0 ? 2 : 1.2}
          fill="#fff"
          opacity={0.5 + (i % 3) * 0.2}
        />
      ))}
      {/* Glühen vom Boden */}
      <rect y="520" width="1440" height="380" fill="url(#fh-glut)" />
      {/* Lava-Landschaft */}
      <path
        d="M0 760 L90 712 L170 736 L250 690 L360 724 L470 700 L560 740 L680 706 L800 732 L930 694 L1050 728 L1160 700 L1280 736 L1440 704 V900 H0 Z"
        fill="url(#fh-fels)"
      />
      <path
        d="M0 820 L140 790 L300 812 L470 784 L640 816 L820 788 L1000 820 L1180 790 L1440 814 V900 H0 Z"
        fill="#24102E"
      />
      <g stroke="#FF8A1E" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M60 860 L170 838 L240 864" />
        <path d="M420 850 L520 828 L600 852 L700 836" />
        <path d="M860 862 L960 836 L1080 860" />
        <path d="M1180 846 L1290 828 L1400 852" />
      </g>
      <g stroke="#FFD84D" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M110 760 L190 748" />
        <path d="M520 760 L590 748" />
        <path d="M940 752 L1020 740" />
        <path d="M1220 760 L1300 746" />
      </g>
    </svg>
  );
}
