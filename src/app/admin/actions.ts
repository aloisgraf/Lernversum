"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { beendeSitzung, requireRole } from "@/lib/demo-auth/server";
import { adminStore } from "@/lib/demo-admin/server";
import { DemoAdminError, STUFEN, type PackageItem, type Stufe } from "@/lib/demo-admin/store";
import { anmeldeAdresse } from "@/lib/anmelde-adresse";
import { qrZeilen } from "@/lib/qr";

// Loginzettel: nur in der Antwort auf Anlegen oder Zurücksetzen, nirgends gespeichert. Der
// QR-Code enthält nur die Adresse der Anmeldeseite, keine Zugangsdaten.
export type Loginzettel = { benutzername: string; passwort: string; adresse: string; qr: string[] };

export type ActionState = {
  error?: string;
  ok?: string;
  zettel?: Loginzettel;
};

// Jede Aktion prüft zuerst serverseitig die Admin-Rolle. Server-Aktionen sind von außen per
// POST aufrufbar; die Oberfläche ist keine Sicherheitsgrenze.
async function run(work: () => ActionState): Promise<ActionState> {
  await requireRole("admin");
  try {
    const result = work();
    revalidatePath("/admin", "layout");
    return result;
  } catch (error) {
    if (error instanceof DemoAdminError || error instanceof z.ZodError) {
      return { error: error instanceof z.ZodError ? "Eingaben ungültig." : error.message };
    }
    throw error;
  }
}

const id = z.string().regex(/^[0-9a-f]{16}$/);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const text = (max: number) => z.string().trim().min(1).max(max);
const field = (form: FormData, name: string) => form.get(name) ?? "";

export async function createHolderAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z
      .object({
        name: text(100),
        email: text(200),
        type: z.enum(["lehrkraft", "therapeut", "eltern"]),
      })
      .parse({ name: field(form, "name"), email: field(form, "email"), type: field(form, "type") });
    const holder = adminStore().createHolder(input);
    return { ok: `${holder.name} angelegt.` };
  });
}

export async function assignLicenseAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z
      .object({ holderId: id, packageId: text(40), months: z.coerce.number(), from: date })
      .parse({
        holderId: field(form, "holderId"),
        packageId: field(form, "packageId"),
        months: field(form, "months"),
        from: field(form, "from"),
      });
    const license = adminStore().assignLicense(
      input.holderId,
      input.packageId,
      input.months,
      input.from,
    );
    return { ok: `Lizenz gültig bis ${license.validUntil}.` };
  });
}

async function zettelFuer(benutzername: string, passwort: string): Promise<Loginzettel> {
  const adresse = await anmeldeAdresse();
  return { benutzername, passwort, adresse, qr: qrZeilen(adresse) };
}

export async function addChildAction(_: ActionState, form: FormData): Promise<ActionState> {
  const state = await run(() => {
    const input = z
      .object({ holderId: id, username: text(30), erstpasswort: z.string().min(1).max(200) })
      .parse({
        holderId: field(form, "holderId"),
        username: field(form, "username"),
        erstpasswort: field(form, "erstpasswort"),
      });
    const child = adminStore().addChild(
      input.holderId,
      input.username,
      input.erstpasswort,
      new Date(),
    );
    return {
      ok: `${child.username} angelegt. Beim ersten Anmelden muss das Kind ein eigenes Passwort wählen.`,
      zettel: { benutzername: child.username, passwort: input.erstpasswort, adresse: "", qr: [] },
    };
  });
  return mitZettel(state);
}

// Ergänzt Adresse und QR-Code erst nach erfolgreicher, rollengeprüfter Aktion.
async function mitZettel(state: ActionState): Promise<ActionState> {
  if (!state.zettel) return state;
  return { ...state, zettel: await zettelFuer(state.zettel.benutzername, state.zettel.passwort) };
}

export async function removeChildAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const store = adminStore();
    const child = store.requireChild(id.parse(field(form, "childId")));
    store.removeChild(child.id);
    beendeSitzung(child.username);
    return { ok: "Kind entfernt." };
  });
}

export async function resetPasswordAction(_: ActionState, form: FormData): Promise<ActionState> {
  const state = await run(() => {
    const input = z
      .object({ childId: id, erstpasswort: z.string().min(1).max(200) })
      .parse({ childId: field(form, "childId"), erstpasswort: field(form, "erstpasswort") });
    const store = adminStore();
    store.resetPassword(input.childId, input.erstpasswort);
    const child = store.requireChild(input.childId);
    beendeSitzung(child.username);
    return {
      ok: "Neues Erstpasswort gesetzt. Das Kind muss es beim Anmelden ändern.",
      zettel: { benutzername: child.username, passwort: input.erstpasswort, adresse: "", qr: [] },
    };
  });
  return mitZettel(state);
}

export async function createCategoryAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const category = adminStore().createCategory(text(80).parse(field(form, "name")));
    return { ok: `Kategorie „${category.name}“ angelegt.` };
  });
}

export async function placeGameAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z.object({ categoryId: id, stufe: z.enum(STUFEN), gameSlug: text(80) }).parse({
      categoryId: field(form, "categoryId"),
      stufe: field(form, "stufe"),
      gameSlug: field(form, "gameSlug"),
    });
    adminStore().placeGame(input.categoryId, input.stufe, input.gameSlug);
    return { ok: "Spiel zugeordnet." };
  });
}

export async function removePlacementAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    adminStore().removePlacement(id.parse(field(form, "placementId")));
    return { ok: "Zuordnung entfernt." };
  });
}

// Auswahl im Formular: „s:<kategorie>:<stufe>“ für eine ganze Stufe, „g:<kategorie>:<spiel>“
// für ein einzelnes Spiel.
const auswahl = z.union([
  z
    .string()
    .regex(/^s:[0-9a-f]{16}:(einfach|mittel|schwer)$/)
    .transform((v): PackageItem => {
      const [, categoryId, stufe] = v.split(":") as [string, string, Stufe];
      return { art: "stufe", categoryId, stufe };
    }),
  z
    .string()
    .regex(/^g:[0-9a-f]{16}:[a-z0-9-]{1,80}$/)
    .transform((v): PackageItem => {
      const [, categoryId, gameSlug] = v.split(":") as [string, string, string];
      return { art: "spiel", categoryId, gameSlug };
    }),
]);

export async function createPackageAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z
      .object({
        childId: id,
        name: text(60),
        validUntil: z.union([z.literal(""), date]),
        items: z.array(auswahl).max(50),
      })
      .parse({
        childId: field(form, "childId"),
        name: field(form, "name"),
        validUntil: field(form, "validUntil"),
        items: form.getAll("items"),
      });
    const pkg = adminStore().createPackage(
      input.childId,
      {
        name: input.name,
        validUntil: input.validUntil === "" ? null : input.validUntil,
        items: input.items,
      },
      new Date(),
    );
    return { ok: `Lernpaket „${pkg.name}“ freigegeben.` };
  });
}

export async function endPackageAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    adminStore().endPackage(id.parse(field(form, "packageId")), new Date());
    return { ok: "Lernpaket beendet." };
  });
}
