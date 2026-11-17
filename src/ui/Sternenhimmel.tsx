"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Himmel über einem Planeten (Alois, 2026-11-17): große, leuchtende Aufgaben-Sterne zwischen
// Deko-Sternen und Sternschnuppen. Ein Klick auf einen Aufgaben-Stern öffnet unten einen Toast
// mit seinen Spielen. Platzhalter, bis die Bilder von Alois kommen. Reine Anzeige: Welche
// Spiele hier stehen, hat der Server aus dem laufenden Lernpaket bestimmt, und jedes Spiel prüft
// beim Aufruf erneut.
export type HimmelSpiel = { slug: string; titel: string; vorschau: string; besteSterne: number };
export type AufgabenStern = { nummer: number; spiele: HimmelSpiel[] };

// Feste Plätze (in % der Himmelsfläche), damit Server und Browser gleich zeichnen.
const PLAETZE = [
  { top: 30, left: 22 },
  { top: 16, left: 62 },
  { top: 52, left: 78 },
  { top: 58, left: 40 },
  { top: 12, left: 36 },
  { top: 40, left: 8 },
  { top: 28, left: 88 },
  { top: 66, left: 16 },
];

const DEKO = [
  [8, 12],
  [14, 48],
  [22, 74],
  [36, 30],
  [44, 58],
  [48, 92],
  [62, 66],
  [70, 4],
  [6, 84],
  [56, 24],
  [30, 50],
  [72, 86],
] as const;

export function Sternenhimmel({ sterne, weltId }: { sterne: AufgabenStern[]; weltId: string }) {
  const [offen, setOffen] = useState<number | null>(null);
  const toast = useRef<HTMLDivElement>(null);
  const knoepfe = useRef<(HTMLButtonElement | null)[]>([]);
  const zuletzt = useRef<number | null>(null);

  useEffect(() => {
    if (offen !== null) {
      zuletzt.current = offen;
      toast.current?.focus();
    } else if (zuletzt.current !== null) {
      knoepfe.current[zuletzt.current]?.focus();
    }
  }, [offen]);

  useEffect(() => {
    if (offen === null) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOffen(null);
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [offen]);

  const stern = offen !== null ? sterne[offen] : undefined;

  return (
    <>
      <div className="absolute inset-0">
        {DEKO.map(([top, left], i) => (
          <span
            key={`d${i}`}
            aria-hidden="true"
            className="lv-funkeln absolute text-xl"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              color: i % 3 === 0 ? "#FFE58A" : "#CFE6FF",
              animationDelay: `${(i % 5) * 0.6}s`,
            }}
          >
            ✦
          </span>
        ))}
        <span aria-hidden="true" className="lv-schnuppe" style={{ top: "10%", left: "70%" }} />
        <span
          aria-hidden="true"
          className="lv-schnuppe"
          style={{ top: "34%", left: "45%", animationDelay: "3.5s" }}
        />

        <ul aria-label="Aufgaben-Sterne" className="contents">
          {sterne.map((s, i) => {
            const platz = PLAETZE[(s.nummer - 1) % PLAETZE.length]!;
            const anzahl = s.spiele.length;
            return (
              <li
                key={s.nummer}
                className="absolute -translate-x-1/2"
                style={{ top: `${platz.top}%`, left: `${platz.left}%` }}
              >
                <button
                  ref={(el) => {
                    knoepfe.current[i] = el;
                  }}
                  type="button"
                  aria-expanded={offen === i}
                  aria-controls="lv-stern-toast"
                  onClick={() => setOffen(offen === i ? null : i)}
                  className="lv-aufgabenstern flex flex-col items-center gap-1 rounded-full p-1"
                >
                  <svg
                    viewBox="0 0 100 100"
                    aria-hidden="true"
                    className="h-20 w-20 sm:h-24 sm:w-24"
                  >
                    <path
                      d="M50 4 L62 36 L96 38 L69 59 L79 93 L50 73 L21 93 L31 59 L4 38 L38 36 Z"
                      fill="#FFD84D"
                      stroke="#FFF6C8"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span
                    className="font-display rounded-xl px-3 text-lg text-white"
                    style={{ background: "rgba(23, 61, 131, 0.85)" }}
                  >
                    Stern {s.nummer}
                    <span className="sr-only">
                      {`, ${anzahl} ${anzahl === 1 ? "Spiel" : "Spiele"}`}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {stern ? (
        <div
          id="lv-stern-toast"
          ref={toast}
          tabIndex={-1}
          role="region"
          aria-label={`Spiele von Stern ${stern.nummer}`}
          className="lv-card fixed inset-x-3 bottom-3 z-30 mx-auto max-w-lg p-4 text-[var(--lv-text)] sm:bottom-6"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl">Stern {stern.nummer}</h2>
            <button
              type="button"
              onClick={() => setOffen(null)}
              className="lv-btn lv-btn-quiet min-h-11"
            >
              Schließen
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {stern.spiele.map((spiel) => (
              <li key={spiel.slug}>
                <Link
                  href={`/spiele/${spiel.slug}?welt=${weltId}`}
                  className="lv-btn lv-btn-reward min-h-16 w-full justify-between text-2xl"
                >
                  <span>
                    <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel}
                  </span>
                  <span aria-label={`${spiel.besteSterne} von 3 Sternen`} className="text-xl">
                    <span style={{ color: "#C2410C" }}>{"★".repeat(spiel.besteSterne)}</span>
                    <span style={{ color: "rgba(23, 61, 131, 0.3)" }}>
                      {"★".repeat(3 - spiel.besteSterne)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
