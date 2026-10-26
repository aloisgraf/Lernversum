import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { defaultConfig } from "@/games/wald-wesen-fuettern/config/default";
import { parseConfig } from "@/games/wald-wesen-fuettern/config/schema";
import { manifest } from "@/games/wald-wesen-fuettern/manifest";
import { WaldWesenSpiel } from "@/games/wald-wesen-fuettern/player/WaldWesenSpiel";
import { adminStore } from "@/lib/demo-admin/server";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";
import { WELT_ID } from "@/lib/welten/thema";
import { speichereRundeAction } from "../actions";

// Geschützte Seite: nie statisch vorrendern, Freigabe bei jeder Anfrage prüfen.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: `${manifest.titel} · Lernversum` };

export default async function WaldWesenFuetternPage({
  searchParams,
}: {
  searchParams: Promise<{ welt?: string }>;
}) {
  // Nur angemeldete Kinder mit laufendem Lernpaket, das dieses Spiel enthält. Sonst 404, damit
  // nicht verraten wird, welche Spiele es gibt.
  const session = await requireRole("user");
  const child = kindDerSitzung(session);
  if (!child || !adminStore().canPlay(child.id, manifest.slug, new Date())) notFound();

  // Die Konfiguration wird auf dem Server geprüft und als Snapshot an das Spiel übergeben,
  // wie es später die Plattform tut (docs/GAME-MODULES.md).
  const config = parseConfig(defaultConfig);
  // Rückweg in die Lernwelt, aus der das Kind kommt; nur bekannte Welten, sonst Weltkarte.
  const { welt } = await searchParams;
  const weltHref =
    welt && WELT_ID.test(welt) && adminStore().categories.has(welt)
      ? `/bereich/welt/${welt}`
      : null;
  return (
    <WaldWesenSpiel
      config={config}
      zurueckHref={weltHref ?? "/bereich"}
      fertigHref={weltHref ? `${weltHref}?geschafft=1` : undefined}
      onRundeFertig={speichereRundeAction.bind(null, manifest.slug)}
    />
  );
}
