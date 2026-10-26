// Gestaltung der Lernwelten. Die erste Kategorie ist der Feuerplanet mit Funki (Alois,
// 2026-10-26); weitere Welten folgen. Reine Anzeige, keine Berechtigung hängt daran.
export type WeltThema = { art: "feuer"; name: string } | { art: "standard" };

export function weltThema(index: number): WeltThema {
  return index === 0 ? { art: "feuer", name: "Feuerplanet" } : { art: "standard" };
}

export const WELT_ID = /^[0-9a-f]{16}$/;
