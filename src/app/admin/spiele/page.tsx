import type { Metadata } from "next";
import { spiele } from "@/games/registry";
import { adminStore } from "@/lib/demo-admin/server";
import { STUFEN } from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../ActionForm";
import { createCategoryAction, placeGameAction, removePlacementAction } from "../actions";
import { Kopf } from "../Kopf";
import { Abschnitt, Field, Tabelle, inputClass } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kategorien und Spiele · Lernversum" };

const stufenName = { einfach: "Einfach", mittel: "Mittel", schwer: "Schwer" } as const;

export default async function GamesPage() {
  await requireRole("admin");
  const store = adminStore();
  const categories = [...store.categories.values()];
  const titel = new Map(spiele.map((s) => [s.slug as string, s.titel as string]));

  return (
    <>
      <Kopf
        titel="Kategorien und Spiele"
        unterzeile="Jede Kategorie hat die Stufen einfach, mittel und schwer. Ein Spiel darf in mehreren Kategorien und Stufen stehen. Kinder sehen nur die Spiele, nie die Stufen."
        knopf="Neue Kategorie anlegen"
      >
        <ActionForm action={createCategoryAction} submitLabel="Kategorie speichern">
          <Field label="Name">
            <input name="name" required maxLength={80} className={inputClass} />
          </Field>
        </ActionForm>
      </Kopf>

      {categories.map((category) => (
        <section key={category.id} className="lv-card flex flex-col gap-4 p-5">
          <Abschnitt>{category.name}</Abschnitt>
          <div className="grid gap-3 md:grid-cols-3">
            {STUFEN.map((stufe) => {
              const placements = store.placementsOf(category.id, stufe);
              return (
                <div
                  key={stufe}
                  className="flex flex-col gap-2 rounded-2xl p-3"
                  style={{ border: "1px solid var(--lv-border)", background: "var(--lv-white)" }}
                >
                  <h3 className="font-bold" style={{ color: "var(--lv-navy)" }}>
                    Stufe {stufenName[stufe]}
                  </h3>
                  {placements.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                      Noch keine Spiele.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {placements.map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2"
                        >
                          <span>{titel.get(p.gameSlug) ?? p.gameSlug}</span>
                          <ActionForm
                            action={removePlacementAction}
                            submitLabel="entfernen"
                            variant="quiet"
                          >
                            <input type="hidden" name="placementId" value={p.id} />
                          </ActionForm>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
          <ActionForm action={placeGameAction} submitLabel="Spiel zuordnen">
            <input type="hidden" name="categoryId" value={category.id} />
            <Field label="Spiel">
              <select name="gameSlug" className={inputClass}>
                {spiele.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.titel}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Stufe">
              <select name="stufe" defaultValue="mittel" className={inputClass}>
                {STUFEN.map((stufe) => (
                  <option key={stufe} value={stufe}>
                    {stufenName[stufe]}
                  </option>
                ))}
              </select>
            </Field>
          </ActionForm>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <Abschnitt>Vorhandene Spiele</Abschnitt>
        <Tabelle
          label="Vorhandene Spiele"
          spalten={["Spiel", "Beschreibung", "Version", "Zugeordnet"]}
        >
          {spiele.map((spiel) => {
            const orte = [...store.placements.values()].filter((p) => p.gameSlug === spiel.slug);
            return (
              <tr key={spiel.slug}>
                <td className="font-bold">
                  <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel}
                </td>
                <td>{spiel.beschreibung}</td>
                <td>{spiel.version}</td>
                <td>
                  {orte.length
                    ? orte
                        .map(
                          (p) =>
                            `${store.categories.get(p.categoryId)?.name ?? "?"} · ${stufenName[p.stufe]}`,
                        )
                        .join(", ")
                    : "noch nicht"}
                </td>
              </tr>
            );
          })}
        </Tabelle>
      </section>
    </>
  );
}
