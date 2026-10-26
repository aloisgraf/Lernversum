import { describe, expect, it } from "vitest";
import { pruefePasswort } from "@/lib/demo-auth/password";
import {
  DemoAdminError,
  DemoAdminStore,
  addMonths,
  pruefeBenutzername,
  seedStore,
  sterne,
  type Stufe,
} from "@/lib/demo-admin/store";

const NOW = new Date("2026-10-26T10:00:00Z");
const TODAY = "2026-10-26";
const GAME = "wald-wesen-fuettern";
const GAME2 = "zweites-spiel";
const PW = "Sternen-Reise-7";

function setup(type: "lehrkraft" | "therapeut" | "eltern" = "therapeut", pkg = "therapie-6") {
  const store = new DemoAdminStore([GAME, GAME2]);
  const holder = store.createHolder({ name: "Test Person", email: "t@example.org", type });
  store.assignLicense(holder.id, pkg, 6, TODAY);
  return { store, holder };
}

function mitKindUndKategorie() {
  const { store, holder } = setup();
  const child = store.addChild(holder.id, "sternchen", PW, NOW);
  const cat = store.createCategory("Rechtschreibung");
  store.placeGame(cat.id, "mittel", GAME);
  return { store, holder, child, cat };
}

const tag = (offsetTage: number) => new Date(NOW.getTime() + offsetTage * 86_400_000);

describe("Hilfsfunktionen", () => {
  it("rechnet Laufzeiten in Monaten", () => {
    expect(addMonths("2026-10-23", 3)).toBe("2027-01-23");
    expect(addMonths("2026-10-23", -12)).toBe("2025-10-23");
  });

  it("prüft frei gewählte Benutzernamen", () => {
    expect(pruefeBenutzername(" Sternchen_7 ")).toBe("sternchen_7");
    for (const falsch of ["ab", "7stern", "mia muster", "mia@x", "a".repeat(31), "<b>"]) {
      expect(() => pruefeBenutzername(falsch)).toThrow(DemoAdminError);
    }
  });

  it("vergibt Sterne nach Fehlversuchen", () => {
    expect(sterne(9, 0)).toBe(3);
    expect(sterne(9, 3)).toBe(2);
    expect(sterne(9, 4)).toBe(1);
  });
});

describe("Passwortregeln", () => {
  const opts = { benutzername: "sternchen", minLaenge: 8 };
  it("verlangt Mindestlänge und lehnt häufige Passwörter ab", () => {
    expect(pruefePasswort("kurz", opts).ok).toBe(false);
    expect(pruefePasswort("12345678", opts).ok).toBe(false);
    expect(pruefePasswort("Passwort", opts).ok).toBe(false);
    expect(pruefePasswort("aaaaaaaaaa", opts).ok).toBe(false);
    expect(pruefePasswort("x-sternchen-x", opts).ok).toBe(false);
    expect(pruefePasswort("a".repeat(129) + "b", opts).ok).toBe(false);
  });
  it("nimmt lange Passwörter ohne Sonderzeichen an", () => {
    expect(pruefePasswort("blauer hund springt", opts).ok).toBe(true);
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
    for (let i = 0; i < 7; i++) store.addChild(holder.id, `kind${i}`, PW, NOW);
    expect(() => store.assignLicense(holder.id, "therapie-6", 6, TODAY)).toThrow(/7 Kinder/);
  });
});

describe("Kinder mit Erstpasswort", () => {
  it("legt ein Kind an, speichert nur einen Hash und verlangt den Passwortwechsel", () => {
    const { store, holder } = setup();
    const child = store.addChild(holder.id, "Sternchen", PW, NOW);
    expect(child.username).toBe("sternchen");
    expect(child.mustChangePassword).toBe(true);
    expect(child.passwordHash).not.toContain(PW);
    expect(child.passwordHash).toMatch(/^scrypt\$/);
  });

  it("lehnt vergebene, reservierte Namen und schwache Erstpasswörter ab", () => {
    const { store, holder } = setup();
    store.addChild(holder.id, "sternchen", PW, NOW);
    expect(() => store.addChild(holder.id, "Sternchen", PW, NOW)).toThrow(/vergeben/);
    expect(() => store.addChild(holder.id, "admin", PW, NOW)).toThrow(/vergeben/);
    expect(() => store.addChild(holder.id, "neu1", "12345678", NOW)).toThrow(/Erstpasswort/);
  });

  it("ohne gültige Lizenz und über dem Limit kein neues Kind", () => {
    const { store, holder } = setup("eltern", "eltern-1");
    store.addChild(holder.id, "einzig", PW, NOW);
    expect(() => store.addChild(holder.id, "zweites", PW, NOW)).toThrow(/Kinderlimit/);
    const ohne = store.createHolder({ name: "Ohne", email: "o@example.org", type: "eltern" });
    expect(() => store.addChild(ohne.id, "kind", PW, NOW)).toThrow(/Lizenz/);
  });

  it("Anmeldung nur mit richtigem Passwort; unbekannte Namen und Testkonto scheitern", () => {
    const { store, holder } = setup();
    const child = store.addChild(holder.id, "sternchen", PW, NOW);
    store.addTestkonto(holder.id, "testuser", NOW);
    expect(store.verifyLogin("sternchen", PW)?.id).toBe(child.id);
    expect(store.verifyLogin("sternchen", "falsch-falsch")).toBeNull();
    expect(store.verifyLogin("gibtsnicht", PW)).toBeNull();
    expect(store.verifyLogin("testuser", "")).toBeNull();
  });

  it("Passwortwechsel: altes Passwort nötig, neues muss anders und stark sein", () => {
    const { store, holder } = setup();
    const child = store.addChild(holder.id, "sternchen", PW, NOW);
    expect(() => store.changePassword(child.id, "falsch-falsch", "ganz neues pw")).toThrow(
      /stimmt nicht/,
    );
    expect(() => store.changePassword(child.id, PW, PW)).toThrow(/neues/);
    expect(() => store.changePassword(child.id, PW, "1234")).toThrow(/mindestens/);
    store.changePassword(child.id, PW, "ganz neues pw");
    expect(child.mustChangePassword).toBe(false);
    expect(store.verifyLogin("sternchen", PW)).toBeNull();
    expect(store.verifyLogin("sternchen", "ganz neues pw")?.id).toBe(child.id);
  });

  it("neues Erstpasswort verlangt wieder den Wechsel; Testkonto ist ausgenommen", () => {
    const { store, holder } = setup();
    const child = store.addChild(holder.id, "sternchen", PW, NOW);
    store.changePassword(child.id, PW, "ganz neues pw");
    store.resetPassword(child.id, "noch-ein-start");
    expect(child.mustChangePassword).toBe(true);
    const test = store.addTestkonto(holder.id, "testuser", NOW);
    expect(() => store.resetPassword(test.id, "noch-ein-start")).toThrow(DemoAdminError);
  });
});

describe("Kategorien und Stufen", () => {
  it("ordnet Spiele Stufen zu, auch mehrfach, aber nicht doppelt in derselben Stufe", () => {
    const { store, cat } = mitKindUndKategorie();
    const lesen = store.createCategory("Lesen");
    store.placeGame(cat.id, "schwer", GAME);
    store.placeGame(lesen.id, "einfach", GAME);
    expect(() => store.placeGame(cat.id, "mittel", GAME)).toThrow(/schon/);
    expect(() => store.placeGame(cat.id, "extrem", GAME)).toThrow(/Stufe/);
    expect(() => store.placeGame(cat.id, "mittel", "unbekannt")).toThrow(/Spiel/);
    expect(() => store.createCategory("rechtschreibung")).toThrow(/gibt es schon/);
  });
});

describe("Lernpakete", () => {
  it("ganze Stufe: das Kind darf ihre Spiele spielen, auch später hinzugefügte", () => {
    const { store, child, cat } = mitKindUndKategorie();
    store.createPackage(
      child.id,
      {
        name: "Paket A",
        validUntil: null,
        items: [{ art: "stufe", categoryId: cat.id, stufe: "mittel" }],
      },
      NOW,
    );
    expect(store.canPlay(child.id, GAME, NOW)).not.toBeNull();
    expect(store.canPlay(child.id, GAME2, NOW)).toBeNull();
    store.placeGame(cat.id, "mittel", GAME2);
    expect(store.canPlay(child.id, GAME2, NOW)).not.toBeNull();
  });

  it("einzelnes Spiel: nur dieses Spiel, nicht der Rest der Stufe", () => {
    const { store, child, cat } = mitKindUndKategorie();
    store.placeGame(cat.id, "mittel", GAME2);
    store.createPackage(
      child.id,
      {
        name: "Paket B",
        validUntil: null,
        items: [{ art: "spiel", categoryId: cat.id, gameSlug: GAME }],
      },
      NOW,
    );
    expect(store.canPlay(child.id, GAME, NOW)).not.toBeNull();
    expect(store.canPlay(child.id, GAME2, NOW)).toBeNull();
  });

  it("nach Ablauf oder Beenden ist das Spiel weg, das Paket bleibt vermerkt", () => {
    const { store, child, cat } = mitKindUndKategorie();
    const item = { art: "stufe" as const, categoryId: cat.id, stufe: "mittel" as Stufe };
    const befristet = store.createPackage(
      child.id,
      { name: "Kurz", validUntil: "2026-10-30", items: [item] },
      NOW,
    );
    expect(store.canPlay(child.id, GAME, tag(4))).toBe(befristet.id);
    expect(store.canPlay(child.id, GAME, tag(5))).toBeNull();
    expect(store.packageStatus(befristet, "2026-10-31")).toBe("abgelaufen");

    const offen = store.createPackage(
      child.id,
      { name: "Offen", validUntil: null, items: [item] },
      NOW,
    );
    store.endPackage(offen.id, NOW);
    expect(store.packageStatus(offen, TODAY)).toBe("beendet");
    expect(store.canPlay(child.id, GAME, tag(5))).toBeNull();
    expect(store.packagesOf(child.id)).toHaveLength(2);
  });

  it("unbefristet heißt bis Lizenzende, nicht darüber hinaus", () => {
    const { store, child, cat } = mitKindUndKategorie();
    store.createPackage(
      child.id,
      {
        name: "Lang",
        validUntil: null,
        items: [{ art: "stufe", categoryId: cat.id, stufe: "mittel" }],
      },
      NOW,
    );
    expect(store.canPlay(child.id, GAME, tag(180))).not.toBeNull();
    expect(store.canPlay(child.id, GAME, tag(182))).toBeNull();
  });

  it("lehnt ungültige Pakete ab", () => {
    const { store, child, cat } = mitKindUndKategorie();
    const item = { art: "stufe" as const, categoryId: cat.id, stufe: "mittel" as Stufe };
    expect(() =>
      store.createPackage(child.id, { name: "Leer", validUntil: null, items: [] }, NOW),
    ).toThrow(/mindestens/);
    expect(() =>
      store.createPackage(child.id, { name: "Alt", validUntil: "2026-10-25", items: [item] }, NOW),
    ).toThrow(/heute/);
    expect(() =>
      store.createPackage(
        child.id,
        { name: "Zu lang", validUntil: "2027-12-01", items: [item] },
        NOW,
      ),
    ).toThrow(/Lizenzende/);
    expect(() =>
      store.createPackage(
        child.id,
        {
          name: "Fremd",
          validUntil: null,
          items: [{ art: "stufe", categoryId: "0".repeat(16), stufe: "mittel" }],
        },
        NOW,
      ),
    ).toThrow(/Kategorie/);
  });
});

describe("Spielrunden und Aufbewahrung", () => {
  function mitPaket() {
    const ctx = mitKindUndKategorie();
    const pkg = ctx.store.createPackage(
      ctx.child.id,
      {
        name: "Paket",
        validUntil: null,
        items: [{ art: "stufe", categoryId: ctx.cat.id, stufe: "mittel" }],
      },
      NOW,
    );
    return { ...ctx, pkg };
  }

  it("speichert Runden nur für freigegebene Spiele und gültige Werte", () => {
    const { store, child, pkg } = mitPaket();
    const runde = store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 2, dauerSek: 95 }, NOW);
    expect(runde.packageId).toBe(pkg.id);
    expect(runde.startedAt).toBe("2026-10-26T09:58:25.000Z");
    expect(() =>
      store.recordRound(child.id, GAME2, { aufgaben: 9, fehler: 0, dauerSek: 5 }, NOW),
    ).toThrow(/nicht freigegeben/);
    for (const falsch of [
      { aufgaben: 0, fehler: 0, dauerSek: 5 },
      { aufgaben: 9, fehler: -1, dauerSek: 5 },
      { aufgaben: 9, fehler: 0, dauerSek: 99999 },
      { aufgaben: 9.5, fehler: 0, dauerSek: 5 },
    ]) {
      expect(() => store.recordRound(child.id, GAME, falsch, NOW)).toThrow(/ungültig/);
    }
  });

  it("nach Ablauf keine neuen Runden, Ergebnisse bleiben", () => {
    const { store, child, pkg } = mitPaket();
    store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 0, dauerSek: 60 }, NOW);
    store.endPackage(pkg.id, NOW);
    expect(() =>
      store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 0, dauerSek: 60 }, NOW),
    ).toThrow();
    expect(store.summary(pkg.id)?.runden).toBe(1);
  });

  it("löscht Runden nach 12 Monaten und behält die Zusammenfassung", () => {
    const { store, child, pkg } = mitPaket();
    store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 1, dauerSek: 60 }, NOW);
    store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 3, dauerSek: 60 }, tag(30));
    expect(store.pruneRounds(tag(366))).toBe(1);
    expect(store.roundsOf(pkg.id)).toHaveLength(1);
    expect(store.summary(pkg.id)).toMatchObject({ runden: 2, aufgaben: 18, fehler: 4 });
  });

  it("Kind löschen entfernt seine Pakete und Runden", () => {
    const { store, child } = mitPaket();
    store.recordRound(child.id, GAME, { aufgaben: 9, fehler: 0, dauerSek: 60 }, NOW);
    store.removeChild(child.id);
    expect(store.packages.size).toBe(0);
    expect(store.rounds.size).toBe(0);
  });
});

describe("Beispieldaten", () => {
  it("legt das Testkonto ohne Lernpaket an", () => {
    const store = new DemoAdminStore([GAME]);
    seedStore(store, NOW, GAME);
    const test = store.childByUsername("testuser");
    expect(test?.testkonto).toBe(true);
    expect(store.canPlay(test!.id, GAME, NOW)).toBeNull();
  });
});
