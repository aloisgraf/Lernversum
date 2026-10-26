import type { Endung, Stufe, WaldWesenConfig, Wort } from "../config/schema";

// Reine Spiellogik ohne Oberfläche. Kein Speichern, keine Netzwerkzugriffe; das Ergebnis
// einer Runde meldet die Spieloberfläche an die Plattform.

/** Wohin ein Bild gehört: zu einem Wald-Wesen (Endung) oder in die Schlafhöhle. */
export type Ziel = Endung | "hoehle";

export type Zufall = () => number;

export function zielFuer(wort: Wort): Ziel {
  return wort.endung ?? "hoehle";
}

export function zieleDerStufe(stufe: Stufe): Ziel[] {
  return stufe.schlafhoehle ? [...stufe.endungen, "hoehle"] : [...stufe.endungen];
}

/** Zerlegt ein Wort für die Anzeige in Wortanfang und Endung. Wörter ohne Endung bleiben ganz. */
export function zerlege(wort: Wort): { anfang: string; endung: string } {
  if (wort.endung === null) return { anfang: wort.wort, endung: "" };
  return { anfang: wort.wort.slice(0, -2), endung: wort.wort.slice(-2) };
}

function mische<T>(liste: readonly T[], zufall: Zufall): T[] {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j]!, kopie[i]!];
  }
  return kopie;
}

/**
 * Stellt eine Runde zusammen: Jedes Ziel der Stufe kommt möglichst gleich oft vor,
 * kein Wort doppelt, Reihenfolge gemischt.
 */
export function erstelleRunde(
  config: WaldWesenConfig,
  stufe: Stufe,
  zufall: Zufall = Math.random,
): Wort[] {
  const ziele = zieleDerStufe(stufe);
  const toepfe = new Map<Ziel, Wort[]>(
    ziele.map((ziel) => [
      ziel,
      mische(
        config.woerter.filter((w) => zielFuer(w) === ziel),
        zufall,
      ),
    ]),
  );
  const auswahl: Wort[] = [];
  // Reihum aus jedem Topf ziehen, bis die Runde voll ist oder alle Töpfe leer sind.
  while (auswahl.length < stufe.aufgabenProRunde) {
    let gezogen = false;
    for (const ziel of mische(ziele, zufall)) {
      if (auswahl.length >= stufe.aufgabenProRunde) break;
      const wort = toepfe.get(ziel)?.pop();
      if (wort) {
        auswahl.push(wort);
        gezogen = true;
      }
    }
    if (!gezogen) break;
  }
  return mische(auswahl, zufall);
}

export type SpielZustand = {
  aufgaben: Wort[];
  index: number;
  /** Wörter, die das Kind schon richtig zugeordnet hat (für Sterne und Abschluss). */
  geschafft: Wort[];
  /** Ergebnis der letzten Zuordnung, für die Rückmeldung in der Oberfläche. */
  letzte: { richtig: boolean; ziel: Ziel } | null;
  /** Anzahl falscher Zuordnungen in dieser Runde (für das Ergebnis, ohne Abzug im Spiel). */
  fehler: number;
};

export function starteSpiel(aufgaben: Wort[]): SpielZustand {
  return { aufgaben, index: 0, geschafft: [], letzte: null, fehler: 0 };
}

export function aktuelleAufgabe(zustand: SpielZustand): Wort | undefined {
  return zustand.aufgaben[zustand.index];
}

export function istFertig(zustand: SpielZustand): boolean {
  return zustand.index >= zustand.aufgaben.length;
}

/**
 * Das Kind gibt das aktuelle Bild einem Ziel. Richtig: weiter zur nächsten Aufgabe.
 * Falsch: Die Aufgabe bleibt, es gibt keinen Abzug (Spielprinzip „kein Fehlerdruck“).
 */
export function ordneZu(zustand: SpielZustand, ziel: Ziel): SpielZustand {
  const aufgabe = aktuelleAufgabe(zustand);
  if (!aufgabe) return zustand;
  const richtig = zielFuer(aufgabe) === ziel;
  if (!richtig) return { ...zustand, letzte: { richtig: false, ziel }, fehler: zustand.fehler + 1 };
  return {
    ...zustand,
    index: zustand.index + 1,
    geschafft: [...zustand.geschafft, aufgabe],
    letzte: { richtig: true, ziel },
  };
}

const WESEN_NOMINATIV: Record<Endung, string> = {
  el: "Der Igel",
  en: "Die Eule",
  er: "Der Fuchs",
};

const AKKUSATIV = { der: "den", die: "die", das: "das" } as const;

/** Lobender Satz nach einer richtigen Zuordnung, z. B. „Mmh, lecker! Der Igel mag die Gabel.“ */
export function lobFuer(wort: Wort): string {
  if (wort.endung === null) return "Dieses Wort passt zu keinem Wesen. Die Höhle behält es.";
  return `Mmh, lecker! ${WESEN_NOMINATIV[wort.endung]} mag ${AKKUSATIV[wort.artikel]} ${wort.wort}.`;
}
