import { describe, expect, it } from "vitest";
import {
  DemoAdminError,
  DemoAdminStore,
  addMonths,
  generateCode,
  hashCode,
  usernamePart,
} from "@/lib/demo-admin/store";

const TODAY = "2026-10-23";
const GAME = "wald-wesen-fuettern";

function setup(type: "lehrkraft" | "therapeut" | "eltern" = "therapeut", pkg = "therapie-6") {
  const store = new DemoAdminStore([GAME]);
  const holder = store.createHolder({ name: "Test Person", email: "t@example.org", type });
  store.assignLicense(holder.id, pkg, 6, TODAY);
  return { store, holder };
}

describe("Hilfsfunktionen", () => {
  it("bildet Benutzernamen mit umgeschriebenen Umlauten", () => {
    expect(usernamePart("Jürgen")).toBe("juergen");
    expect(usernamePart(" Öz-Größe ")).toBe("oezgroesse");
    expect(usernamePart("René")).toBe("rene");
  });

  it("erzeugt Codes im Format XXXX-XXXX-XXXX ohne verwechselbare Zeichen", () => {
    const code = generateCode();
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    expect(hashCode(code)).not.toContain(code);
  });

  it("rechnet Laufzeiten in Monaten", () => {
    expect(addMonths("2026-10-23", 3)).toBe("2027-01-23");
    expect(addMonths("2026-10-23", 12)).toBe("2027-10-23");
  });
});

describe("Lizenznehmer und Lizenzen", () => {
  it("lehnt doppelte E-Mail und ungültige Eingaben ab", () => {
    const { store } = setup();
    expect(() =>
      store.createHolder({ name: "Andere", email: "T@example.org", type: "lehrkraft" }),
    ).toThrow(DemoAdminError);
    expect(() => store.createHolder({ name: "X", email: "kein-mail", type: "lehrkraft" })).toThrow(
      DemoAdminError,
    );
  });

  it("lehnt ein Paket ab, das nicht zur Art passt, und unbekannte Laufzeiten", () => {
    const { store, holder } = setup();
    expect(() => store.assignLicense(holder.id, "schule-20", 6, TODAY)).toThrow(/passt nicht/);
    expect(() => store.assignLicense(holder.id, "therapie-6", 5, TODAY)).toThrow(/Laufzeit/);
  });

  it("verbietet ein kleineres Paket, wenn schon mehr Kinder angelegt sind", () => {
    const { store, holder } = setup("therapeut", "therapie-12");
    for (let i = 0; i < 7; i += 1)
      store.addChild(holder.id, "Kind", `Nummer${"x".repeat(i)}`, TODAY);
    expect(() => store.assignLicense(holder.id, "therapie-6", 6, TODAY)).toThrow(/erlaubt 6/);
  });
});

describe("Kinder und Elternzugang", () => {
  it("legt Kind und Elternzugang mit eigenen Codes an, speichert nur Prüfwerte", () => {
    const { store, holder } = setup();
    const result = store.addChild(holder.id, "Max", "Müller", TODAY);
    expect(result.child.username).toBe("max.mueller");
    expect(result.parent?.username).toBe("eltern.max.mueller");
    expect(result.childCode).not.toBe(result.parentCode);
    expect(result.child.codeHash).toBe(hashCode(result.childCode));
    expect(JSON.stringify([...store.children.values()])).not.toContain(result.childCode);
  });

  it("hängt bei gleichem Namen eine Zahl an", () => {
    const { store, holder } = setup();
    store.addChild(holder.id, "Max", "Müller", TODAY);
    expect(store.addChild(holder.id, "Max", "Mueller", TODAY).child.username).toBe("max.mueller2");
  });

  it("legt bei der Elternlizenz keine Elternkarte an und erlaubt nur ein Kind", () => {
    const { store, holder } = setup("eltern", "eltern-1");
    const result = store.addChild(holder.id, "Ida", "Beispiel", TODAY);
    expect(result.parent).toBeNull();
    expect(() => store.addChild(holder.id, "Zweites", "Kind", TODAY)).toThrow(/Kinderlimit/);
  });

  it("lehnt Kinder ohne gültige Lizenz ab", () => {
    const store = new DemoAdminStore([GAME]);
    const holder = store.createHolder({ name: "Ohne", email: "o@example.org", type: "lehrkraft" });
    expect(() => store.addChild(holder.id, "A", "B", TODAY)).toThrow(/Keine gültige Lizenz/);
    store.assignLicense(holder.id, "schule-20", 3, "2025-01-01");
    expect(() => store.addChild(holder.id, "A", "B", TODAY)).toThrow(/Keine gültige Lizenz/);
  });

  it("entfernt mit dem Kind auch Elternzugang und Freischaltungen", () => {
    const { store, holder } = setup();
    const { child } = store.addChild(holder.id, "Max", "Muster", TODAY);
    store.grantGame(child.id, GAME, TODAY, "2026-12-01");
    store.removeChild(child.id);
    expect(store.parents.size).toBe(0);
    expect(store.grants.size).toBe(0);
  });
});

describe("Spiele freischalten", () => {
  it("schaltet ein Spiel im Lizenzzeitraum frei und zeigt es als spielbar", () => {
    const { store, holder } = setup();
    const { child } = store.addChild(holder.id, "Max", "Muster", TODAY);
    store.grantGame(child.id, GAME, TODAY, "2026-12-01");
    expect(store.playableGames(child.id, TODAY)).toEqual([GAME]);
    expect(store.playableGames(child.id, "2026-12-01")).toEqual([]);
  });

  it("lehnt unbekannte Spiele, verkehrte Zeiträume, Zeiträume außerhalb der Lizenz und Doppelte ab", () => {
    const { store, holder } = setup();
    const { child } = store.addChild(holder.id, "Max", "Muster", TODAY);
    expect(() => store.grantGame(child.id, "gibt-es-nicht", TODAY, "2026-12-01")).toThrow(
      /Unbekannt/,
    );
    expect(() => store.grantGame(child.id, GAME, "2026-12-01", TODAY)).toThrow(/Zeitraum/);
    expect(() => store.grantGame(child.id, GAME, TODAY, "2030-01-01")).toThrow(/Lizenzlaufzeit/);
    store.grantGame(child.id, GAME, TODAY, "2026-12-01");
    expect(() => store.grantGame(child.id, GAME, TODAY, "2026-11-01")).toThrow(/schon/);
  });

  it("lässt nach Ablauf der Lizenz nichts mehr spielen", () => {
    const { store, holder } = setup();
    const { child } = store.addChild(holder.id, "Max", "Muster", TODAY);
    store.grantGame(child.id, GAME, TODAY, "2027-04-23");
    expect(store.playableGames(child.id, "2027-04-23")).toEqual([]);
  });
});

describe("Themen", () => {
  it("legt Themen an, ordnet sie Spielen zu und lehnt Unbekanntes ab", () => {
    const store = new DemoAdminStore([GAME]);
    const topic = store.createTopic("Silben");
    expect(() => store.createTopic("silben")).toThrow(/gibt es schon/);
    store.setGameTopics(GAME, [topic.id, topic.id]);
    expect(store.gameTopics.get(GAME)).toEqual([topic.id]);
    expect(() => store.setGameTopics(GAME, ["0000000000000000"])).toThrow(/Unbekanntes Thema/);
    expect(() => store.setGameTopics("gibt-es-nicht", [])).toThrow(/Unbekanntes Spiel/);
  });
});
