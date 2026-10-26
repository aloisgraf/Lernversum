import Image from "next/image";
import planet from "./bilder/feuerplanet-planet.webp";

// Feuerplanet für die Weltkarte, ausgeschnitten aus dem Bild von Alois (assets/LICENSES.md).
// Dekorativ: Name und Status stehen als Text daneben.
export function FeuerplanetBild({
  gesperrt = false,
  className = "h-52 w-52",
}: {
  gesperrt?: boolean;
  className?: string;
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Image
        src={planet}
        alt=""
        sizes="(min-width: 640px) 260px, 208px"
        className="h-full w-full rounded-full"
        style={{
          filter: gesperrt
            ? "grayscale(0.9) opacity(0.6)"
            : "drop-shadow(0 0 18px rgba(255, 150, 40, 0.65))",
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
