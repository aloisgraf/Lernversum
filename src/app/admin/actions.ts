"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/demo-auth/server";
import { adminStore, today } from "@/lib/demo-admin/server";
import { DemoAdminError } from "@/lib/demo-admin/store";

export type ActionState = {
  error?: string;
  ok?: string;
  codes?: { label: string; username: string; code: string }[];
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

export async function addChildAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z.object({ holderId: id, firstName: text(50), lastName: text(50) }).parse({
      holderId: field(form, "holderId"),
      firstName: field(form, "firstName"),
      lastName: field(form, "lastName"),
    });
    const result = adminStore().addChild(input.holderId, input.firstName, input.lastName, today());
    const codes = [
      { label: "Kinderkarte", username: result.child.username, code: result.childCode },
    ];
    if (result.parent && result.parentCode) {
      codes.push({
        label: "Elternkarte",
        username: result.parent.username,
        code: result.parentCode,
      });
    }
    return { ok: `${result.child.firstName} angelegt.`, codes };
  });
}

export async function removeChildAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    adminStore().removeChild(id.parse(field(form, "childId")));
    return { ok: "Kind entfernt." };
  });
}

export async function grantGameAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const input = z.object({ childId: id, gameSlug: text(80), from: date, until: date }).parse({
      childId: field(form, "childId"),
      gameSlug: field(form, "gameSlug"),
      from: field(form, "from"),
      until: field(form, "until"),
    });
    adminStore().grantGame(input.childId, input.gameSlug, input.from, input.until);
    return { ok: "Spiel freigeschaltet." };
  });
}

export async function revokeGrantAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    adminStore().revokeGrant(id.parse(field(form, "grantId")));
    return { ok: "Freischaltung entfernt." };
  });
}

export async function createTopicAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const topic = adminStore().createTopic(text(80).parse(field(form, "name")));
    return { ok: `Thema „${topic.name}“ angelegt.` };
  });
}

export async function setGameTopicsAction(_: ActionState, form: FormData): Promise<ActionState> {
  return run(() => {
    const gameSlug = text(80).parse(field(form, "gameSlug"));
    const topicIds = z.array(id).max(50).parse(form.getAll("topicIds"));
    adminStore().setGameTopics(gameSlug, topicIds);
    return { ok: "Themen gespeichert." };
  });
}
