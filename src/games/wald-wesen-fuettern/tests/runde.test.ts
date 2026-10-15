import { describe, expect, it } from "vitest";
import { defaultConfig } from "../config/default";
import type { Stufe } from "../config/schema";
import {
  aktuelleAufgabe,
  erstelleRunde,
  istFertig,
  lobFuer,
  ordneZu,
  starteSpiel,
  zerlege,
  zielFuer,
  zieleDerStufe,
} from "../logic/runde";

// Deterministischer Zufall für reproduzierbare Tests.
function zufallMitSeed(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const [stufe1, stufe2] = defaultConfig.stufen as [Stufe, Stufe, Stufe];

describe("Runde zusammenstellen", () => {
  it("hat die eingestellte Anzahl Aufgaben ohne doppelte Wörter", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const runde = erstelleRunde(defaultConfig, stufe2, zufallMitSeed(seed));
      expect(runde).toHaveLength(stufe2.aufgabenProRunde);
      expect(new Set(runde.map((w) => w.id)).size).toBe(runde.length);
    }
  });

  it("enthält nur Wörter, deren Ziel in der Stufe vorkommt", () => {
    const runde = erstelleRunde(defaultConfig, stufe1, zufallMitSeed(7));
    const ziele = zieleDerStufe(stufe1);
    expect(runde.every((w) => ziele.includes(zielFuer(w)))).toBe(true);
    expect(runde.some((w) => w.endung === null)).toBe(false);
  });

  it("verteilt die Ziele gleichmäßig", () => {
    const runde = erstelleRunde(defaultConfig, stufe2, zufallMitSeed(3));
    for (const ziel of zieleDerStufe(stufe2)) {
      const anzahl = runde.filter((w) => zielFuer(w) === ziel).length;
      expect(anzahl).toBeGreaterThanOrEqual(2);
      expect(anzahl).toBeLessThanOrEqual(3);
    }
  });
});

describe("Zuordnen", () => {
  it("richtige Zuordnung geht weiter und sammelt das Wort", () => {
    let zustand = starteSpiel(erstelleRunde(defaultConfig, stufe2, zufallMitSeed(5)));
    const erste = aktuelleAufgabe(zustand)!;
    zustand = ordneZu(zustand, zielFuer(erste));
    expect(zustand.index).toBe(1);
    expect(zustand.geschafft).toEqual([erste]);
    expect(zustand.letzte).toEqual({ richtig: true, ziel: zielFuer(erste) });
  });

  it("falsche Zuordnung bleibt bei derselben Aufgabe, ohne Abzug", () => {
    const zustand = starteSpiel(erstelleRunde(defaultConfig, stufe2, zufallMitSeed(5)));
    const erste = aktuelleAufgabe(zustand)!;
    const falsch = zieleDerStufe(stufe2).find((z) => z !== zielFuer(erste))!;
    const danach = ordneZu(zustand, falsch);
    expect(danach.index).toBe(0);
    expect(danach.geschafft).toHaveLength(0);
    expect(danach.letzte?.richtig).toBe(false);
    expect(aktuelleAufgabe(danach)).toBe(erste);
  });

  it("ist nach allen richtigen Zuordnungen fertig und ignoriert weitere Eingaben", () => {
    let zustand = starteSpiel(erstelleRunde(defaultConfig, stufe1, zufallMitSeed(9)));
    while (!istFertig(zustand)) zustand = ordneZu(zustand, zielFuer(aktuelleAufgabe(zustand)!));
    expect(zustand.geschafft).toHaveLength(stufe1.aufgabenProRunde);
    expect(ordneZu(zustand, "el")).toBe(zustand);
  });
});

describe("Wort zerlegen", () => {
  it("trennt die Endung ab, ohne das Wort zu verändern", () => {
    for (const w of defaultConfig.woerter) {
      const { anfang, endung } = zerlege(w);
      expect(anfang + endung).toBe(w.wort);
      expect(endung).toBe(w.endung ?? "");
    }
  });
});

describe("Lob nach richtiger Zuordnung", () => {
  const finde = (id: string) => defaultConfig.woerter.find((w) => w.id === id)!;

  it("nennt Wesen und Wort mit passendem Artikel", () => {
    expect(lobFuer(finde("gabel"))).toBe("Mmh, lecker! Der Igel mag die Gabel.");
    expect(lobFuer(finde("eimer"))).toBe("Mmh, lecker! Der Fuchs mag den Eimer.");
    expect(lobFuer(finde("besen"))).toBe("Mmh, lecker! Die Eule mag den Besen.");
    expect(lobFuer(finde("messer"))).toBe("Mmh, lecker! Der Fuchs mag das Messer.");
  });

  it("erklärt bei Wörtern ohne Endung die Schlafhöhle", () => {
    expect(lobFuer(finde("ball"))).toBe("Dieses Wort passt zu keinem Wesen. Die Höhle behält es.");
  });
});
