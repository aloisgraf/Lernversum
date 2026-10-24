// Einfacher Planet als Platzhalter, bis Einzelillustrationen mit Lizenz vorliegen
// (docs/DESIGN-SYSTEM.md, Bilder). Rein dekorativ: Name und Status stehen als Text daneben.
const FARBEN = [
  ["#8050E8", "#B79BFF"],
  ["#FF777E", "#FFC0C3"],
  ["#38C9CE", "#A8F0F2"],
  ["#2799F5", "#A6D6FF"],
  ["#FFD84D", "#FFF0B0"],
] as const;

export function Planet({ index, gesperrt }: { index: number; gesperrt: boolean }) {
  const [grund, licht] = FARBEN[index % FARBEN.length]!;
  const id = `planet-${index}`;
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className="h-28 w-28">
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={licht} />
          <stop offset="100%" stopColor={grund} />
        </radialGradient>
      </defs>
      <g opacity={gesperrt ? 0.45 : 1}>
        <ellipse cx="60" cy="64" rx="56" ry="14" fill="none" stroke={licht} strokeWidth="5" />
        <circle cx="60" cy="58" r="36" fill={`url(#${id})`} />
        <circle cx="46" cy="48" r="6" fill={licht} opacity="0.7" />
        <circle cx="72" cy="70" r="4" fill={licht} opacity="0.6" />
        <path d="M8 66 A56 14 0 0 0 112 66" fill="none" stroke={licht} strokeWidth="5" />
      </g>
      {gesperrt ? (
        <g transform="translate(46 42)">
          <rect x="0" y="12" width="28" height="22" rx="5" fill="#173D83" />
          <path d="M6 12 V8 a8 8 0 0 1 16 0 V12" fill="none" stroke="#173D83" strokeWidth="4" />
        </g>
      ) : null}
    </svg>
  );
}
