import { describe, expect, it } from "vitest";
import { defaultConfig } from "../config/default";
import { parseConfig, type WaldWesenConfig } from "../config/schema";

function mitWoertern(woerter: WaldWesenConfig["woerter"]): WaldWesenConfig {
  return { ...defaultConfig, woerter };
}

describe("Konfiguration Wald-Wesen füttern", () => {
  it("die Standardkonfiguration ist gültig", () => {
    expect(() => parseConfig(defaultConfig)).not.toThrow();
  });

  it("jedes Wort endet tatsächlich auf seine Endung", () => {
    for (const w of defaultConfig.woerter) {
      if (w.endung) expect(w.wort.endsWith(w.endung)).toBe(true);
    }
  });

  it("lehnt ein Wort mit falsch angegebener Endung ab", () => {
    const config = mitWoertern([
      ...defaultConfig.woerter,
      { id: "x", wort: "Kegel", endung: "er", artikel: "der", bild: "🎳" },
    ]);
    expect(() => parseConfig(config)).toThrow(/endet nicht auf -er/);
  });

  it("lehnt ein Gegenbeispiel ab, das doch auf -el, -en oder -er endet", () => {
    const config = mitWoertern([
      ...defaultConfig.woerter,
      { id: "x", wort: "Tier", endung: null, artikel: "das", bild: "🐾" },
    ]);
    expect(() => parseConfig(config)).toThrow(/taugt nicht als Gegenbeispiel/);
  });

  it("lehnt Zeichen außer Buchstaben im Wort ab", () => {
    const config = mitWoertern([
      ...defaultConfig.woerter,
      { id: "x", wort: "<b>Kegel</b>", endung: "el", artikel: "der", bild: "🎳" },
    ]);
    expect(() => parseConfig(config)).toThrow();
  });

  it("lehnt doppelte Wörter und IDs ab", () => {
    const erstes = defaultConfig.woerter[0]!;
    expect(() => parseConfig(mitWoertern([...defaultConfig.woerter, erstes]))).toThrow(
      /doppelte id/,
    );
  });

  it("lehnt eine Stufe mit zu wenigen Wörtern ab", () => {
    const config = mitWoertern(defaultConfig.woerter.filter((w) => w.endung !== "el"));
    expect(() => parseConfig(config)).toThrow(/zu wenige Wörter auf -el/);
  });

  it("lehnt Runden außerhalb von 5 bis 10 Aufgaben ab", () => {
    const stufe = { ...defaultConfig.stufen[0]!, aufgabenProRunde: 20 };
    expect(() => parseConfig({ ...defaultConfig, stufen: [stufe] })).toThrow();
  });

  it("lehnt eine unbekannte Schemaversion ab", () => {
    expect(() => parseConfig({ ...defaultConfig, schemaVersion: 2 })).toThrow();
  });
});
