"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { adminStore } from "@/lib/demo-admin/server";
import { DemoAdminError } from "@/lib/demo-admin/store";
import { requireKindFuerPasswortwechsel } from "@/lib/demo-auth/server";

export type PasswortState = { error?: string };

// Nur das angemeldete Kind ändert sein eigenes Passwort; das bisherige Passwort ist nötig.
export async function passwortAendernAction(
  _: PasswortState,
  form: FormData,
): Promise<PasswortState> {
  const { child } = await requireKindFuerPasswortwechsel();
  const eingabe = z
    .object({
      aktuell: z.string().min(1).max(200),
      neu: z.string().min(1).max(200),
      wiederholung: z.string().min(1).max(200),
    })
    .safeParse({
      aktuell: form.get("aktuell") ?? "",
      neu: form.get("neu") ?? "",
      wiederholung: form.get("wiederholung") ?? "",
    });
  if (!eingabe.success) return { error: "Bitte alle Felder ausfüllen." };
  if (eingabe.data.neu !== eingabe.data.wiederholung) {
    return { error: "Die beiden neuen Passwörter sind nicht gleich." };
  }
  try {
    adminStore().changePassword(child.id, eingabe.data.aktuell, eingabe.data.neu);
  } catch (error) {
    if (error instanceof DemoAdminError) return { error: error.message };
    throw error;
  }
  redirect("/bereich");
}
