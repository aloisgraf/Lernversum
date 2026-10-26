import { describe, expect, it } from "vitest";
import { ERSTES_SPIEL, LOB, funkiSagt } from "@/lib/welten/funki";

describe("funkiSagt", () => {
  it("begrüßt beim ersten Besuch mit Namen und bittet um das erste Spiel", () => {
    const [gruss, bitte] = funkiSagt({ name: "Mia", runden: 0, geradeGeschafft: false });
    expect(gruss).toContain("Hallo Mia!");
    expect(gruss).toContain("Feuerplaneten gelandet");
    expect(bitte).toBe(ERSTES_SPIEL);
  });

  it("lobt nach einem Spiel und wechselt die Sätze", () => {
    const saetze = new Set(
      Array.from(
        { length: LOB.length },
        (_, i) => funkiSagt({ name: "Mia", runden: i + 1, geradeGeschafft: true })[0],
      ),
    );
    expect(saetze.size).toBe(LOB.length);
    expect(funkiSagt({ name: "Mia", runden: 1, geradeGeschafft: true })[0]).toBe(
      "Super gemacht, Mia! Weiter so!",
    );
  });

  it("lobt nicht ohne gespielte Runde, auch wenn die Adresse es verlangt", () => {
    const [gruss] = funkiSagt({ name: "Mia", runden: 0, geradeGeschafft: true });
    expect(gruss).toContain("Hallo Mia!");
  });

  it("vergleicht nie mit anderen Kindern", () => {
    for (let runden = 0; runden < 20; runden++) {
      for (const satz of funkiSagt({ name: "Mia", runden, geradeGeschafft: runden % 2 === 0 })) {
        expect(satz).not.toMatch(/ander(e|en) Kind|besser als|Platz|Rang/i);
      }
    }
  });
});
