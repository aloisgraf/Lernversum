import { manifest as waldWesenFuettern } from "./wald-wesen-fuettern/manifest";

// Alle Spielmodule der Plattform. Spielbar ist ein Spiel nur nach Anmeldung und mit laufendem
// Lernpaket (im Prototyp: DemoAdminStore.canPlay, später can_play in der Datenbank).
export const spiele = [waldWesenFuettern] as const;
