import { z } from "zod";

// Konfiguration von „Wald-Wesen füttern“, Schemaversion 1.
// Sie ist reine Inhaltskonfiguration (Wörter, Stufen) und enthält keine personenbezogenen Daten.

export const ENDUNGEN = ["el", "en", "er"] as const;
export const endungSchema = z.enum(ENDUNGEN);
export type Endung = z.infer<typeof endungSchema>;

const wortSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/, "id nur aus a-z, 0-9 und -"),
    // Das Wort in richtiger Schreibweise; nur Buchstaben, damit keine Markup-Zeichen hineinkommen.
    wort: z.string().regex(/^[A-Za-zÄÖÜäöüß]{2,20}$/u, "nur Buchstaben, 2 bis 20 Zeichen"),
    // null = Wort ohne diese Endungen (gehört in die Schlafhöhle).
    endung: endungSchema.nullable(),
    // Artikel für die Rückmeldung („Der Igel mag die Gabel.“).
    artikel: z.enum(["der", "die", "das"]),
    // Bild (vorerst ein Emoji als Platzhalter, später eine Grafik aus media/).
    bild: z.string().min(1).max(16),
  })
  .superRefine((eintrag, ctx) => {
    const ende = eintrag.wort.slice(-2).toLowerCase();
    if (eintrag.endung !== null && ende !== eintrag.endung) {
      ctx.addIssue({
        code: "custom",
        message: `„${eintrag.wort}“ endet nicht auf -${eintrag.endung}`,
        path: ["endung"],
      });
    }
    if (eintrag.endung === null && (ENDUNGEN as readonly string[]).includes(ende)) {
      ctx.addIssue({
        code: "custom",
        message: `„${eintrag.wort}“ endet auf -${ende} und taugt nicht als Gegenbeispiel`,
        path: ["endung"],
      });
    }
  });
export type Wort = z.infer<typeof wortSchema>;

const stufeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1).max(40),
  beschreibung: z.string().min(1).max(120),
  // Welche Wald-Wesen (Endungen) in dieser Stufe auftreten.
  endungen: z.array(endungSchema).min(2).max(3),
  // Ob die Schlafhöhle für Wörter ohne Endung dabei ist.
  schlafhoehle: z.boolean(),
  // „bild“: Bild wird gezeigt; „wort“: das geschriebene Wort wird gezeigt.
  anzeige: z.enum(["bild", "wort"]),
  // Kurze Runden laut Spielkonzept: 5 bis 10 Aufgaben.
  aufgabenProRunde: z.number().int().min(5).max(10),
});
export type Stufe = z.infer<typeof stufeSchema>;

export const configSchema = z
  .object({
    schemaVersion: z.literal(1),
    woerter: z.array(wortSchema).min(1),
    stufen: z.array(stufeSchema).min(1),
  })
  .superRefine((config, ctx) => {
    const ids = new Set<string>();
    const woerter = new Set<string>();
    config.woerter.forEach((w, i) => {
      if (ids.has(w.id))
        ctx.addIssue({
          code: "custom",
          message: `doppelte id ${w.id}`,
          path: ["woerter", i, "id"],
        });
      if (woerter.has(w.wort))
        ctx.addIssue({
          code: "custom",
          message: `doppeltes Wort ${w.wort}`,
          path: ["woerter", i, "wort"],
        });
      ids.add(w.id);
      woerter.add(w.wort);
    });
    const stufenIds = new Set<string>();
    config.stufen.forEach((stufe, i) => {
      if (stufenIds.has(stufe.id))
        ctx.addIssue({
          code: "custom",
          message: `doppelte Stufe ${stufe.id}`,
          path: ["stufen", i, "id"],
        });
      stufenIds.add(stufe.id);
      if (new Set(stufe.endungen).size !== stufe.endungen.length) {
        ctx.addIssue({
          code: "custom",
          message: "Endung doppelt",
          path: ["stufen", i, "endungen"],
        });
      }
      // Jedes Wald-Wesen (und die Schlafhöhle) braucht genug eigene Wörter, damit jedes Ziel
      // in der Runde gleich oft vorkommen kann.
      const ziele = stufe.schlafhoehle ? [...stufe.endungen, null] : stufe.endungen;
      const proZiel = Math.ceil(stufe.aufgabenProRunde / ziele.length);
      for (const ziel of ziele) {
        const anzahl = config.woerter.filter((w) => w.endung === ziel).length;
        if (anzahl < proZiel) {
          ctx.addIssue({
            code: "custom",
            message: `Stufe ${stufe.id}: zu wenige Wörter ${ziel ? `auf -${ziel}` : "ohne Endung"} (${anzahl} statt ${proZiel})`,
            path: ["stufen", i, "endungen"],
          });
        }
      }
      // Jede Stufe muss genug verschiedene Wörter haben, damit sich in einer Runde nichts wiederholt.
      const passend = config.woerter.filter((w) =>
        w.endung === null ? stufe.schlafhoehle : stufe.endungen.includes(w.endung),
      ).length;
      if (passend < stufe.aufgabenProRunde) {
        ctx.addIssue({
          code: "custom",
          message: `Stufe ${stufe.id} hat nur ${passend} passende Wörter für ${stufe.aufgabenProRunde} Aufgaben`,
          path: ["stufen", i, "aufgabenProRunde"],
        });
      }
    });
  });

export type WaldWesenConfig = z.infer<typeof configSchema>;

/** Prüft eine Konfiguration und wirft bei Fehlern eine Meldung mit den betroffenen Pfaden. */
export function parseConfig(input: unknown): WaldWesenConfig {
  const result = configSchema.safeParse(input);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Ungültige Konfiguration für Wald-Wesen füttern: ${details}`);
  }
  return result.data;
}
