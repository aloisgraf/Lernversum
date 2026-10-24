// Wortmarke nach Lernversum_Wortmarke.svg aus dem Designpaket, ohne Hintergrundfläche und in
// der runden Schrift Fredoka statt Trebuchet MS (nicht frei mitlieferbar).
type Props = { className?: string; onDark?: boolean; showClaim?: boolean };

export function Wortmarke({ className, onDark = false, showClaim = true }: Props) {
  const ink = onDark ? "#ffffff" : "#173d83";
  return (
    <svg
      viewBox="40 20 780 180"
      role="img"
      aria-label="Lernversum"
      className={className}
      style={{ fontFamily: "var(--font-fredoka), var(--font-nunito), Arial, sans-serif" }}
    >
      <text x="70" y="125" fontSize="104" fontWeight="700" letterSpacing="-2" fill={ink}>
        Lernversum
      </text>
      {/* Stern und Planeten näher an den Schriftzug, weil Fredoka schmaler läuft als Trebuchet MS */}
      <g transform="translate(-145 0)">
        <path
          d="M820 35 L830 58 L855 60 L836 76 L841 100 L820 87 L799 100 L804 76 L785 60 L810 58 Z"
          fill="#FFD84D"
          stroke="#E5B82D"
          strokeWidth="3"
        />
        <circle cx="895" cy="68" r="13" fill="#38C9CE" />
        <circle cx="925" cy="48" r="8" fill="#FF777E" />
        <circle cx="950" cy="80" r="10" fill="#8050E8" />
      </g>
      {showClaim ? (
        <>
          <path
            d="M80 155 Q110 177 140 155"
            fill="none"
            stroke="#38C9CE"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <text x="160" y="178" fontSize="30" fontWeight="600" fill={ink}>
            Entdecken. Lernen. Wachsen.
          </text>
        </>
      ) : null}
    </svg>
  );
}
