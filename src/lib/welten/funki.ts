// Sätze von Funki, dem Lava-Alien auf dem Feuerplaneten. Freundlich, ohne Druck und ohne
// Vergleich mit anderen Kindern (DESIGN-SYSTEM, Regeln). Die Auswahl hängt von der Zahl der
// gespielten Runden ab: kein Zufall, damit Server-Darstellung und Tests stabil bleiben.

export const BEGRUESSUNG = (name: string) =>
  `Hallo ${name}! Schön, dass du auf dem Feuerplaneten gelandet bist. Ich bin Funki. Ich habe hier ein paar Spiele für dich vorbereitet. Lass uns loslegen!`;

export const ERSTES_SPIEL = "Wähle das erste Spiel.";

export const WILLKOMMEN_ZURUECK: ((name: string) => string)[] = [
  (name) => `Schön, dass du wieder da bist, ${name}! Die Vulkane haben schon auf dich gewartet.`,
  (name) => `Hallo ${name}! Bereit für das nächste Abenteuer auf dem Feuerplaneten?`,
  (name) => `Da bist du ja, ${name}! Meine Antennen glühen schon vor Freude.`,
];

export const LOB: ((name: string) => string)[] = [
  (name) => `Super gemacht, ${name}! Weiter so!`,
  () => "Wow, das war stark! Die Lava blubbert vor Freude.",
  (name) => `Klasse, ${name}! Du wirst immer besser.`,
  () => "Toll gespielt! Darauf kannst du stolz sein.",
  () => "Heiß, heißer, du! Das hast du prima gemacht.",
  () => "Spitze! Meine Antennen leuchten wie ein Vulkan.",
  (name) => `Bravo, ${name}! Das war richtig gut.`,
  () => "Juhu, geschafft! Du bist ein echter Feuer-Forscher.",
];

export const WEITER = [
  "Welches Spiel möchtest du als Nächstes spielen?",
  "Spiel es nochmal oder such dir ein anderes Spiel aus.",
  "Auf geht's zum nächsten Spiel!",
];

export function funkiSagt(opts: {
  name: string;
  runden: number;
  geradeGeschafft: boolean;
}): string[] {
  const { name, runden } = opts;
  if (opts.geradeGeschafft && runden > 0) {
    return [LOB[(runden - 1) % LOB.length]!(name), WEITER[(runden - 1) % WEITER.length]!];
  }
  if (runden === 0) return [BEGRUESSUNG(name), ERSTES_SPIEL];
  return [WILLKOMMEN_ZURUECK[runden % WILLKOMMEN_ZURUECK.length]!(name), WEITER[0]!];
}
