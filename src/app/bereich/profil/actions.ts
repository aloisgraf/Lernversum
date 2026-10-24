"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/demo-auth/server";
import { ProfilFehler } from "@/lib/demo-profile/core";
import { profilSpeicher } from "@/lib/demo-profile/server";

export type ProfilState = { error?: string; ok?: string };

// Server-Aktionen sind von außen per POST aufrufbar: Rolle und Eingaben werden hier geprüft.
// Gespeichert wird immer nur das Profil des angemeldeten Kontos, nie ein anderes.
export async function speichereProfilAction(_: ProfilState, form: FormData): Promise<ProfilState> {
  const session = await requireRole("user");
  const eingabe = z
    .object({ spitzname: z.string().max(200), avatar: z.string().max(40) })
    .safeParse({ spitzname: form.get("spitzname") ?? "", avatar: form.get("avatar") ?? "" });
  if (!eingabe.success) return { error: "Eingaben ungültig." };
  try {
    profilSpeicher().set(session.username, eingabe.data);
  } catch (error) {
    if (error instanceof ProfilFehler) return { error: error.message };
    throw error;
  }
  revalidatePath("/bereich", "layout");
  return { ok: "Gespeichert!" };
}
