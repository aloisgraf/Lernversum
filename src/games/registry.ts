import { manifest as waldWesenFuettern } from "./wald-wesen-fuettern/manifest";

// Alle Spielmodule der Plattform. Freischaltung und Lizenzen kommen später aus der
// Plattform (can_play); in der Testphase sind die hier eingetragenen Spiele frei spielbar.
export const spiele = [waldWesenFuettern] as const;
