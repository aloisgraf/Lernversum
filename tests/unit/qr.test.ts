import { describe, expect, it } from "vitest";
import { qrZeilen } from "@/lib/qr";

describe("qrZeilen", () => {
  it("liefert ein quadratisches Muster mit Suchmarken", () => {
    const zeilen = qrZeilen("https://lernversum.example/login");
    expect(zeilen.length).toBeGreaterThanOrEqual(21);
    for (const zeile of zeilen) expect(zeile).toMatch(new RegExp(`^[01]{${zeilen.length}}$`));
    // Suchmarke oben links: 7 dunkle Felder in der ersten Zeile.
    expect(zeilen[0]!.slice(0, 7)).toBe("1111111");
  });

  it("ist für dieselbe Adresse immer gleich", () => {
    expect(qrZeilen("https://a.example/login")).toEqual(qrZeilen("https://a.example/login"));
  });

  it("lehnt leere und übergroße Inhalte ab", () => {
    expect(() => qrZeilen("")).toThrow();
    expect(() => qrZeilen("x".repeat(201))).toThrow();
  });
});
