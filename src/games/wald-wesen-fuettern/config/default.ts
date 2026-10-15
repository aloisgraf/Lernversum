import type { WaldWesenConfig } from "./schema";

// Vorläufige Standardkonfiguration. Die Wörter sind Platzhalter, bis Alois die Wortliste
// aus den Basisgraphemen liefert (offener Punkt im Spielkonzept). Bilder: Zeichnungen aus media/bilder.tsx,
// wo vorhanden, sonst vorerst Emojis (bis Unicode 12, damit auch Windows 10 sie anzeigt).
export const defaultConfig: WaldWesenConfig = {
  schemaVersion: 1,
  woerter: [
    // -el
    { id: "gabel", wort: "Gabel", endung: "el", artikel: "die", bild: "🍴" },
    { id: "apfel", wort: "Apfel", endung: "el", artikel: "der", bild: "🍎" },
    { id: "vogel", wort: "Vogel", endung: "el", artikel: "der", bild: "🐦" },
    { id: "loeffel", wort: "Löffel", endung: "el", artikel: "der", bild: "🥄" },
    { id: "schluessel", wort: "Schlüssel", endung: "el", artikel: "der", bild: "🔑" },
    { id: "wuerfel", wort: "Würfel", endung: "el", artikel: "der", bild: "🎲" },
    { id: "pinsel", wort: "Pinsel", endung: "el", artikel: "der", bild: "🖌️" },
    { id: "mantel", wort: "Mantel", endung: "el", artikel: "der", bild: "🧥" },
    // -en
    { id: "besen", wort: "Besen", endung: "en", artikel: "der", bild: "🧹" },
    { id: "kuchen", wort: "Kuchen", endung: "en", artikel: "der", bild: "🍰" },
    { id: "regen", wort: "Regen", endung: "en", artikel: "der", bild: "🌧️" },
    { id: "faden", wort: "Faden", endung: "en", artikel: "der", bild: "🧵" },
    { id: "knochen", wort: "Knochen", endung: "en", artikel: "der", bild: "🦴" },
    { id: "schlitten", wort: "Schlitten", endung: "en", artikel: "der", bild: "🛷" },
    { id: "bogen", wort: "Bogen", endung: "en", artikel: "der", bild: "🏹" },
    { id: "daumen", wort: "Daumen", endung: "en", artikel: "der", bild: "👍" },
    // -er
    { id: "messer", wort: "Messer", endung: "er", artikel: "das", bild: "🔪" },
    { id: "tiger", wort: "Tiger", endung: "er", artikel: "der", bild: "🐅" },
    { id: "hammer", wort: "Hammer", endung: "er", artikel: "der", bild: "🔨" },
    { id: "koffer", wort: "Koffer", endung: "er", artikel: "der", bild: "🧳" },
    { id: "wecker", wort: "Wecker", endung: "er", artikel: "der", bild: "⏰" },
    { id: "anker", wort: "Anker", endung: "er", artikel: "der", bild: "⚓" },
    { id: "feuer", wort: "Feuer", endung: "er", artikel: "das", bild: "🔥" },
    { id: "wasser", wort: "Wasser", endung: "er", artikel: "das", bild: "💧" },
    { id: "eimer", wort: "Eimer", endung: "er", artikel: "der", bild: "🪣" },
    // ohne diese Endungen (Schlafhöhle)
    { id: "hund", wort: "Hund", endung: null, artikel: "der", bild: "🐕" },
    { id: "ball", wort: "Ball", endung: null, artikel: "der", bild: "⚽" },
    { id: "haus", wort: "Haus", endung: null, artikel: "das", bild: "🏠" },
    { id: "baum", wort: "Baum", endung: null, artikel: "der", bild: "🌳" },
    { id: "fisch", wort: "Fisch", endung: null, artikel: "der", bild: "🐟" },
    { id: "stern", wort: "Stern", endung: null, artikel: "der", bild: "⭐" },
    { id: "mond", wort: "Mond", endung: null, artikel: "der", bild: "🌙" },
    { id: "hut", wort: "Hut", endung: null, artikel: "der", bild: "🎩" },
  ],
  stufen: [
    {
      id: "stufe-1",
      titel: "Stufe 1",
      beschreibung: "Zwei Wald-Wesen: Igel (-el) und Fuchs (-er)",
      endungen: ["el", "er"],
      schlafhoehle: false,
      anzeige: "bild",
      aufgabenProRunde: 8,
    },
    {
      id: "stufe-2",
      titel: "Stufe 2",
      beschreibung: "Drei Wald-Wesen und die Schlafhöhle",
      endungen: ["el", "en", "er"],
      schlafhoehle: true,
      anzeige: "bild",
      aufgabenProRunde: 9,
    },
    {
      id: "stufe-3",
      titel: "Stufe 3",
      beschreibung: "Wörter lesen statt Bilder",
      endungen: ["el", "en", "er"],
      schlafhoehle: true,
      anzeige: "wort",
      aufgabenProRunde: 9,
    },
  ],
};
