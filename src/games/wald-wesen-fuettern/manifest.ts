// Kennung und Beschreibung des Spielmoduls (docs/GAME-MODULES.md).
export const manifest = {
  slug: "wald-wesen-fuettern",
  version: "0.1.0",
  titel: "Wald-Wesen füttern",
  beschreibung: "Gib jedem Wald-Wesen die Bilder mit seiner Endung: -el, -en oder -er.",
  thema: "Rechtschreibung: Endungen -el, -en, -er",
  vorschau: "🦔",
  configVersion: 1,
  // Version 1: je fertiger Runde Stufe, Anzahl Aufgaben, Fehlversuche, Dauer (keine Einzeleingaben).
  eventSchemaVersion: 1,
  faehigkeiten: [] as const,
} as const;
