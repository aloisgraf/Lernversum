import type { Metadata } from "next";
import { defaultConfig } from "@/games/wald-wesen-fuettern/config/default";
import { parseConfig } from "@/games/wald-wesen-fuettern/config/schema";
import { manifest } from "@/games/wald-wesen-fuettern/manifest";
import { WaldWesenSpiel } from "@/games/wald-wesen-fuettern/player/WaldWesenSpiel";

export const metadata: Metadata = { title: `${manifest.titel} · Lernversum` };

export default function WaldWesenFuetternPage() {
  // Die Konfiguration wird auf dem Server geprüft und als Snapshot an das Spiel übergeben,
  // wie es später die Plattform tut (docs/GAME-MODULES.md).
  const config = parseConfig(defaultConfig);
  return <WaldWesenSpiel config={config} />;
}
