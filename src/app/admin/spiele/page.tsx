import type { Metadata } from "next";
import { spiele } from "@/games/registry";
import { adminStore } from "@/lib/demo-admin/server";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../ActionForm";
import { createTopicAction, setGameTopicsAction } from "../actions";
import { Field, inputClass } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Spiele und Themen · Lernversum" };

export default async function GamesPage() {
  await requireRole("admin");
  const store = adminStore();
  const topics = [...store.topics.values()];

  return (
    <>
      <h1 className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
        Spiele und Themen
      </h1>
      <section className="flex flex-col gap-3 lv-card p-4">
        <h2 className="text-xl font-semibold">Themen</h2>
        <ul className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="rounded-full px-3 py-1 font-semibold"
              style={{ background: "var(--lv-border)" }}
            >
              {topic.name}
            </li>
          ))}
        </ul>
        <ActionForm action={createTopicAction} submitLabel="Thema anlegen">
          <Field label="Neues Thema">
            <input name="name" required className={inputClass} />
          </Field>
        </ActionForm>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Spiele</h2>
        {spiele.map((spiel) => {
          const assigned = new Set(store.gameTopics.get(spiel.slug) ?? []);
          return (
            <article key={spiel.slug} className="flex flex-col gap-3 lv-card p-4">
              <h3 className="text-lg font-semibold">
                <span aria-hidden="true">{spiel.vorschau}</span> {spiel.titel}
              </h3>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                {spiel.beschreibung} · Version {spiel.version} · aktiv
              </p>
              <ActionForm
                action={setGameTopicsAction}
                submitLabel="Themen speichern"
                className="flex flex-col gap-2"
              >
                <input type="hidden" name="gameSlug" value={spiel.slug} />
                <fieldset className="flex flex-wrap gap-4">
                  <legend className="mb-1 text-sm">Gehört zu den Themen:</legend>
                  {topics.map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="topicIds"
                        value={topic.id}
                        defaultChecked={assigned.has(topic.id)}
                      />
                      {topic.name}
                    </label>
                  ))}
                </fieldset>
              </ActionForm>
            </article>
          );
        })}
      </section>
    </>
  );
}
