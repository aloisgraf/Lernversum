"use server";

import { z } from "zod";
import { spiele } from "@/games/registry";
import { adminStore } from "@/lib/demo-admin/server";
import { DemoAdminError } from "@/lib/demo-admin/store";
import { kindDerSitzung, requireRole } from "@/lib/demo-auth/server";

const ergebnisSchema = z.object({
  aufgaben: z.number().int().min(1).max(50),
  fehler: z.number().int().min(0).max(500),
  dauerSek: z.number().int().min(0).max(7200),
});

// Speichert das Ergebnis einer Runde für das angemeldete Kind. Server-Aktionen sind von außen
// aufrufbar: Spiel, Freigabe und Werte werden hier geprüft, nichts wird dem Browser geglaubt.
export async function speichereRundeAction(gameSlug: unknown, ergebnis: unknown): Promise<boolean> {
  const session = await requireRole("user");
  const slug = z.enum(spiele.map((s) => s.slug)).safeParse(gameSlug);
  const daten = ergebnisSchema.safeParse(ergebnis);
  const child = kindDerSitzung(session);
  if (!slug.success || !daten.success || !child) return false;
  try {
    adminStore().recordRound(child.id, slug.data, daten.data, new Date());
    return true;
  } catch (error) {
    if (error instanceof DemoAdminError) return false;
    throw error;
  }
}
