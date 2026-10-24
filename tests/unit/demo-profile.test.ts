import { describe, expect, it } from "vitest";
import {
  AVATAR_IDS,
  ProfilFehler,
  ProfilSpeicher,
  STANDARD_AVATAR,
  pruefeSpitzname,
} from "@/lib/demo-profile/core";

describe("pruefeSpitzname", () => {
  it("nimmt Buchstaben, Umlaute, Leerzeichen und Bindestrich an und kürzt Leerraum", () => {
    expect(pruefeSpitzname("  Sternen   Fee ")).toBe("Sternen Fee");
    expect(pruefeSpitzname("Jürgen-Max")).toBe("Jürgen-Max");
    expect(pruefeSpitzname("Ana")).toBe("Ana");
  });

  it("leer heißt kein Spitzname", () => {
    expect(pruefeSpitzname("")).toBeNull();
    expect(pruefeSpitzname("   ")).toBeNull();
  });

  it.each([
    ["zu kurz", "A"],
    ["zu lang", "A".repeat(21)],
    ["Ziffern (Telefon, Alter)", "Mia2015"],
    ["Link", "www.beispiel.at"],
    ["Zeichen für Schadcode", "<script>"],
    ["E-Mail", "mia@example.org"],
    ["beginnt mit Bindestrich", "-Mia"],
  ])("lehnt ab: %s", (_, wert) => {
    expect(() => pruefeSpitzname(wert)).toThrow(ProfilFehler);
  });
});

describe("ProfilSpeicher", () => {
  it("liefert ohne Eintrag den Standard-Avatar und keinen Spitznamen", () => {
    expect(new ProfilSpeicher().get("testuser")).toEqual({
      spitzname: null,
      avatar: STANDARD_AVATAR,
    });
  });

  it("speichert Spitzname und Avatar je Benutzername getrennt", () => {
    const speicher = new ProfilSpeicher();
    speicher.set("testuser", { spitzname: "Sternchen", avatar: "alien" });
    expect(speicher.get("testuser")).toEqual({ spitzname: "Sternchen", avatar: "alien" });
    expect(speicher.get("anderes.kind").spitzname).toBeNull();
  });

  it("lehnt unbekannte Avatare ab und ändert dabei nichts", () => {
    const speicher = new ProfilSpeicher();
    speicher.set("testuser", { spitzname: "Sternchen", avatar: "roboter" });
    expect(() => speicher.set("testuser", { spitzname: "Neu", avatar: "../../foto.png" })).toThrow(
      ProfilFehler,
    );
    expect(speicher.get("testuser")).toEqual({ spitzname: "Sternchen", avatar: "roboter" });
  });

  it("lehnt ungültige Spitznamen ab und ändert dabei nichts", () => {
    const speicher = new ProfilSpeicher();
    speicher.set("testuser", { spitzname: "Sternchen", avatar: "roboter" });
    expect(() => speicher.set("testuser", { spitzname: "<b>x</b>", avatar: "alien" })).toThrow(
      ProfilFehler,
    );
    expect(speicher.get("testuser").avatar).toBe("roboter");
  });

  it("begrenzt die Zahl der Profile", () => {
    const speicher = new ProfilSpeicher();
    for (let i = 0; i < 500; i++)
      speicher.set(`kind${i}`, { spitzname: "", avatar: AVATAR_IDS[0] });
    expect(() => speicher.set("noch.eins", { spitzname: "", avatar: "alien" })).toThrow(
      ProfilFehler,
    );
    expect(() => speicher.set("kind1", { spitzname: "Neu", avatar: "alien" })).not.toThrow();
  });
});
