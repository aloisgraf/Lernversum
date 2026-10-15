"use client";

import { Lexend } from "next/font/google";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import type { Stufe, WaldWesenConfig, Wort } from "../config/schema";
import {
  aktuelleAufgabe,
  erstelleRunde,
  istFertig,
  lobFuer,
  ordneZu,
  starteSpiel,
  zerlege,
  zieleDerStufe,
  type SpielZustand,
  type Ziel,
} from "../logic/runde";
import { bilder } from "../media/bilder";
import { Hintergrund, WESEN, WesenFigur } from "./szene";
import styles from "./spiel.module.css";
import { useVorlesen } from "./vorlesen";

// Die Schrift wird beim Build geladen und von der eigenen Domain ausgeliefert,
// das Kind ruft zur Laufzeit nichts bei Google ab.
const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const RING_STANDARD = "#f2c14e";
const RING_HOEHLE = "#c9b78a";

const gelberKnopf =
  "rounded-full bg-[#ffd25e] font-semibold text-[#3b2a12] shadow-[0_5px_0_#c99a2c] active:translate-y-[3px] active:shadow-[0_2px_0_#c99a2c]";

/** Wort mit farbig hervorgehobener Endung. */
function FarbWort({ wort }: { wort: Wort }) {
  const { anfang, endung } = zerlege(wort);
  return (
    <span>
      <span style={{ color: "#2a2018" }}>{anfang}</span>
      {wort.endung && <span style={{ color: WESEN[wort.endung].farbe }}>{endung}</span>}
    </span>
  );
}

function Stern({ voll, groesse }: { voll: boolean; groesse?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      className={groesse ? undefined : styles.stern}
    >
      <polygon
        points="12,2 15,9 22,9.5 16.5,14 18.5,21.5 12,17.5 5.5,21.5 7.5,14 2,9.5 9,9"
        fill={voll ? "#ffd25e" : "rgba(255,247,230,0.12)"}
        stroke={voll ? "#f0a830" : "rgba(255,247,230,0.5)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lautsprecher() {
  return (
    <svg
      aria-hidden="true"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#3b2a12"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function BildInhalt({ wort, stufe }: { wort: Wort; stufe: Stufe }) {
  if (stufe.anzeige === "wort") {
    return (
      <span className="text-4xl font-semibold tracking-wide text-[#2a2018] sm:text-5xl">
        {wort.wort}
      </span>
    );
  }
  const Zeichnung = bilder[wort.id];
  if (Zeichnung) {
    return (
      <span className={styles.bildFlaeche}>
        <Zeichnung groesse={200} />
      </span>
    );
  }
  return (
    <span className={`${styles.emoji} ${styles.bildEmoji}`} role="img" aria-label="Bild">
      {wort.bild}
    </span>
  );
}

/** Gemeinsamer Rahmen: Zauberwald-Szene, Kopfzeile links (Zurück + Ort), rechts optional. */
function Rahmen({
  children,
  zurueck,
  rechts,
}: {
  children: ReactNode;
  zurueck: ReactNode;
  rechts?: ReactNode;
}) {
  return (
    <main className={`${lexend.className} ${styles.wald} relative min-h-dvh overflow-hidden`}>
      <Hintergrund />
      <div className="relative mx-auto flex min-h-dvh max-w-[1180px] flex-col px-4 pt-4 pb-4 sm:px-8 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className={styles.pille}>
            {zurueck}
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9be3a9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15z" />
              <path d="M5 19L14 10" />
            </svg>
            <span className="hidden lg:inline">Zauberwald-Planet · Lichtung der Wesen</span>
          </div>
          {rechts}
        </div>
        {children}
      </div>
    </main>
  );
}

type Props = { config: WaldWesenConfig };

export function WaldWesenSpiel({ config }: Props) {
  const [stufe, setStufe] = useState<Stufe | null>(null);
  const [zustand, setZustand] = useState<SpielZustand | null>(null);
  // Nach einer richtigen Zuordnung bleibt das gelöste Wort stehen, bis das Kind „Weiter“ tippt.
  const [geloest, setGeloest] = useState<{ wort: Wort; ziel: Ziel } | null>(null);
  const [wackelt, setWackelt] = useState(false);
  const [zug, setZug] = useState<{ x: number; y: number } | null>(null);
  const zugStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const weiterKnopf = useRef<HTMLButtonElement>(null);
  const { sprich, verfuegbar: kannVorlesen } = useVorlesen();

  const offen = zustand ? aktuelleAufgabe(zustand) : undefined;
  const aufgabe = geloest?.wort ?? offen;

  // Neues Wort: einmal vorlesen (nur wenn eine Stimme auf dem Gerät vorhanden ist).
  const offenesWort = geloest ? undefined : offen?.wort;
  useEffect(() => {
    if (offenesWort) sprich(offenesWort);
  }, [offenesWort, sprich]);

  useEffect(() => {
    if (!wackelt) return;
    const timer = setTimeout(() => setWackelt(false), 500);
    return () => clearTimeout(timer);
  }, [wackelt]);

  useEffect(() => {
    if (geloest) weiterKnopf.current?.focus();
  }, [geloest]);

  function starte(neueStufe: Stufe) {
    setStufe(neueStufe);
    setZustand(starteSpiel(erstelleRunde(config, neueStufe)));
    setGeloest(null);
    setWackelt(false);
  }

  function zurStufenwahl() {
    setStufe(null);
    setZustand(null);
    setGeloest(null);
  }

  function zuordnen(ziel: Ziel) {
    if (!zustand || geloest) return;
    const wort = aktuelleAufgabe(zustand);
    if (!wort) return;
    const neu = ordneZu(zustand, ziel);
    setZustand(neu);
    if (neu.letzte?.richtig) {
      setGeloest({ wort, ziel });
      setWackelt(false);
    } else {
      setWackelt(true);
    }
  }

  // Ziehen mit Maus, Finger oder Stift. Alternativ genügt ein Tippen auf das Wald-Wesen.
  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (geloest) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    zugStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    setZug({ x: 0, y: 0 });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const start = zugStart.current;
    if (!start || start.id !== e.pointerId) return;
    setZug({ x: e.clientX - start.x, y: e.clientY - start.y });
  }

  function onPointerEnd(e: ReactPointerEvent<HTMLDivElement>) {
    const start = zugStart.current;
    if (!start || start.id !== e.pointerId) return;
    zugStart.current = null;
    setZug(null);
    const ziel = document
      .elementsFromPoint(e.clientX, e.clientY)
      .map((el) => el.closest<HTMLElement>("[data-ziel]"))
      .find((el) => el !== null)?.dataset.ziel as Ziel | undefined;
    if (ziel && stufe && zieleDerStufe(stufe).includes(ziel)) zuordnen(ziel);
  }

  const zurStufenwahlKnopf = (
    <button
      type="button"
      onClick={zurStufenwahl}
      className={styles.zurueck}
      aria-label="Zurück zur Stufenwahl"
    >
      ←
    </button>
  );

  // Stufenwahl
  if (!stufe || !zustand) {
    return (
      <Rahmen
        zurueck={
          <Link href="/spiele" className={styles.zurueck} aria-label="Zurück zu den Spielen">
            ←
          </Link>
        }
      >
        <div className="flex flex-1 flex-col items-center gap-6 pt-6 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Wald-Wesen füttern</h1>
          <p className="max-w-2xl text-lg sm:text-xl">
            Igel, Eule und Fuchs haben Hunger. Jedes Wesen frisst nur Wörter mit seiner Endung. Tipp
            das passende Wesen an oder zieh das Bild zu ihm.
          </p>
          <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            {config.stufen.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => starte(s)}
                className="flex flex-col items-center gap-2 rounded-[32px] bg-[#fff7e6] p-5 text-[#2a2018] shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-transform hover:-translate-y-1"
              >
                <span className="text-2xl font-semibold">{s.titel}</span>
                <span className="flex justify-center" aria-hidden="true">
                  {zieleDerStufe(s).map((z) => (
                    <WesenFigur key={z} ziel={z} className="h-16 w-14" />
                  ))}
                </span>
                <span className="text-base">{s.beschreibung}</span>
              </button>
            ))}
          </div>
          <p className="text-base text-[#eaf5e4]">
            Testversion: Es wird nichts gespeichert und nichts übertragen.
          </p>
        </div>
      </Rahmen>
    );
  }

  const ziele = zieleDerStufe(stufe);
  const sterne = zustand.aufgaben.map((_, i) => i < zustand.geschafft.length);

  // Abschluss
  if (istFertig(zustand) && !geloest) {
    return (
      <Rahmen zurueck={zurStufenwahlKnopf}>
        <div className="flex flex-1 flex-col items-center gap-6 pt-6 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Geschafft!</h1>
          <p className="text-xl">
            Alle Wesen sind satt. Du hast {zustand.geschafft.length} Sterne gesammelt.
          </p>
          <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
            {sterne.map((voll, i) => (
              <Stern key={i} voll={voll} groesse={36} />
            ))}
          </div>
          <ul className="flex max-w-3xl flex-wrap justify-center gap-3" aria-label="Deine Wörter">
            {zustand.geschafft.map((w) => (
              <li
                key={w.id}
                className="rounded-full bg-[#fff7e6] px-5 py-2 text-3xl font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
              >
                <FarbWort wort={w} />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => starte(stufe)}
              className={`${gelberKnopf} h-14 px-8 text-xl`}
            >
              Nochmal spielen
            </button>
            <button
              type="button"
              onClick={zurStufenwahl}
              className="h-14 rounded-full border-2 border-[#fff7e6] px-8 text-xl font-semibold"
            >
              Andere Stufe
            </button>
          </div>
        </div>
      </Rahmen>
    );
  }

  let nachricht =
    stufe.anzeige === "wort"
      ? "Lies das Wort und füttere das passende Wesen."
      : kannVorlesen
        ? "Hör genau hin und füttere das passende Wesen."
        : "Schau genau hin und füttere das passende Wesen.";
  if (wackelt) nachricht = "Noch nicht ganz. Probier ein anderes Wesen.";
  if (geloest) nachricht = lobFuer(geloest.wort);

  return (
    <Rahmen
      zurueck={zurStufenwahlKnopf}
      rechts={
        <div
          className={styles.pille}
          role="img"
          aria-label={`${zustand.geschafft.length} von ${zustand.aufgaben.length} geschafft`}
        >
          {sterne.map((voll, i) => (
            <Stern key={i} voll={voll} />
          ))}
        </div>
      }
    >
      <div className="flex flex-1 flex-col items-center gap-[1.6vh] pt-[1vh]">
        <h1 className="text-center text-2xl font-semibold sm:text-[34px]">
          Wer bekommt dieses Wort?
        </h1>

        {aufgabe && (
          <div
            data-testid="bildkarte"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
            className={[
              styles.karte,
              zug ? styles.karteZieht : "",
              wackelt ? styles.wackeln : "",
            ].join(" ")}
            style={{
              borderColor: geloest
                ? geloest.wort.endung
                  ? WESEN[geloest.wort.endung].farbe
                  : RING_HOEHLE
                : RING_STANDARD,
              ...(zug ? { transform: `translate(${zug.x}px, ${zug.y}px)` } : {}),
            }}
          >
            <BildInhalt wort={aufgabe} stufe={stufe} />
          </div>
        )}

        <div className="flex w-full max-w-[500px] items-center justify-center gap-4">
          {kannVorlesen && aufgabe && (
            <button
              type="button"
              aria-label="Wort anhören"
              onClick={() => sprich(aufgabe.wort)}
              className={`${gelberKnopf} flex h-[62px] w-[62px] flex-none items-center justify-center`}
            >
              <Lautsprecher />
            </button>
          )}
          {geloest ? (
            <div
              data-testid="loesungswort"
              className="flex h-[min(78px,9vh)] min-h-14 flex-1 items-center justify-center rounded-full bg-[#fff7e6] text-4xl font-semibold tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:text-[46px]"
            >
              <FarbWort wort={geloest.wort} />
            </div>
          ) : (
            <div className="flex h-[min(78px,9vh)] min-h-14 flex-1 items-center justify-center rounded-full border-[3px] border-dashed border-[rgba(255,247,230,0.55)] bg-[rgba(255,247,230,0.08)] px-4 text-center text-lg font-medium sm:text-xl">
              {stufe.anzeige === "wort"
                ? "Lies das Wort"
                : kannVorlesen
                  ? "Hör das Wort an"
                  : "Was siehst du?"}
            </div>
          )}
        </div>

        <div className="flex min-h-12 flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-lg font-medium text-[#eaf5e4] sm:text-xl">
          <span aria-live="polite">{nachricht}</span>
          {geloest && (
            <button
              ref={weiterKnopf}
              type="button"
              onClick={() => setGeloest(null)}
              className={`${gelberKnopf} h-12 px-7 text-lg`}
            >
              {istFertig(zustand) ? "Fertig" : "Weiter"}
            </button>
          )}
        </div>

        <div
          className="mt-auto grid w-full max-w-[1000px] items-end gap-1 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${ziele.length}, minmax(0, 1fr))` }}
        >
          {ziele.map((ziel) => {
            const wesen = WESEN[ziel];
            const gewaehlt = geloest?.ziel === ziel;
            return (
              <button
                key={ziel}
                type="button"
                data-ziel={ziel}
                onClick={() => zuordnen(ziel)}
                disabled={Boolean(geloest)}
                aria-label={wesen.ariaLabel}
                className={styles.wesen}
                style={{
                  transform: gewaehlt ? "translateY(-10px) scale(1.07)" : undefined,
                  opacity: geloest && !gewaehlt ? 0.5 : 1,
                }}
              >
                <WesenFigur
                  ziel={ziel}
                  className={`${styles.figur} ${gewaehlt ? styles.kaut : ""}`}
                />
                <span
                  className={`${styles.schild} ${ziel === "hoehle" ? styles.schildKlein : ""}`}
                  style={{
                    background: wesen.farbe,
                    color: wesen.schrift,
                    boxShadow: `0 5px 0 ${wesen.schatten}`,
                  }}
                >
                  {wesen.schild}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Rahmen>
  );
}
