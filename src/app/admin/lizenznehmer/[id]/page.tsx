import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { spiele } from "@/games/registry";
import { adminStore, today } from "@/lib/demo-admin/server";
import {
  DURATIONS_MONTHS,
  PACKAGES,
  addMonths,
  licenseActive,
  packageById,
} from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../../ActionForm";
import {
  addChildAction,
  assignLicenseAction,
  grantGameAction,
  removeChildAction,
  revokeGrantAction,
} from "../../actions";
import { Field, inputClass } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lizenznehmer · Lernversum" };

const typeLabel = { lehrkraft: "Lehrkraft", therapeut: "Lerntherapie", eltern: "Eltern" };

export default async function HolderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const store = adminStore();
  const holder = store.holders.get(id);
  if (!holder) notFound();

  const now = today();
  const pkg = holder.license ? packageById(holder.license.packageId) : undefined;
  const active = licenseActive(holder.license, now);
  const children = store.childrenOf(holder.id);
  const packages = PACKAGES.filter((p) => p.holderType === holder.type);
  const gameTitle = new Map(spiele.map((s) => [s.slug as string, s.titel as string]));

  return (
    <>
      <Link href="/admin/lizenznehmer" className="lv-link self-start">
        ← alle Lizenznehmer
      </Link>
      <div>
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
          {holder.name}
        </h1>
        <p style={{ color: "var(--color-muted)" }}>
          {typeLabel[holder.type]} · {holder.email}
        </p>
      </div>

      <section className="flex flex-col gap-3 lv-card p-4">
        <h2 className="text-xl font-semibold">Lizenz</h2>
        <p>
          {pkg
            ? `${pkg.name}, ${holder.license!.months} Monate, ${holder.license!.validFrom} bis ${holder.license!.validUntil} · ${active ? "gültig" : "nicht gültig"} · ${children.length}/${pkg.maxChildren} Kinder`
            : "Noch keine Lizenz."}
        </p>
        <ActionForm
          action={assignLicenseAction}
          submitLabel={pkg ? "Lizenz ändern" : "Lizenz zuweisen"}
        >
          <input type="hidden" name="holderId" value={holder.id} />
          <Field label="Paket">
            <select name="packageId" className={inputClass}>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.maxChildren} {p.maxChildren === 1 ? "Kind" : "Kinder"})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Laufzeit">
            <select name="months" defaultValue="12" className={inputClass}>
              {DURATIONS_MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m} Monate
                </option>
              ))}
            </select>
          </Field>
          <Field label="Beginn">
            <input name="from" type="date" defaultValue={now} required className={inputClass} />
          </Field>
        </ActionForm>
      </section>

      <section className="flex flex-col gap-3 lv-card p-4">
        <h2 className="text-xl font-semibold">Kind anlegen</h2>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          {holder.type === "eltern"
            ? "Elternlizenz: Es entsteht nur die Kinderkarte, der Lizenznehmer ist selbst der Elternteil."
            : "Es entstehen eine Kinderkarte und eine Elternkarte."}
        </p>
        <ActionForm action={addChildAction} submitLabel="Kind anlegen">
          <input type="hidden" name="holderId" value={holder.id} />
          <Field label="Vorname">
            <input name="firstName" required className={inputClass} />
          </Field>
          <Field label="Nachname">
            <input name="lastName" required className={inputClass} />
          </Field>
        </ActionForm>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Kinder ({children.length})</h2>
        {children.length === 0 ? <p>Noch keine Kinder.</p> : null}
        {children.map((child) => {
          const parent = store.parentOf(child.id);
          const grants = store.grantsOf(child.id);
          const playable = store.playableGames(child.id, now);
          return (
            <article key={child.id} className="flex flex-col gap-3 lv-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold">
                    {child.firstName} {child.lastName}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Kind: {child.username} ·{" "}
                    {child.activated ? "aktiviert" : "noch nicht aktiviert"}
                    {parent ? ` · Eltern: ${parent.username}` : ""}
                  </p>
                  <p className="text-sm">
                    Darf heute spielen:{" "}
                    {playable.length
                      ? playable.map((s) => gameTitle.get(s) ?? s).join(", ")
                      : "nichts"}
                  </p>
                </div>
                <ActionForm action={removeChildAction} submitLabel="Kind entfernen" variant="quiet">
                  <input type="hidden" name="childId" value={child.id} />
                </ActionForm>
              </div>
              <ul className="flex flex-col gap-1">
                {grants.map((grant) => (
                  <li key={grant.id} className="flex flex-wrap items-center gap-3">
                    <span>
                      {gameTitle.get(grant.gameSlug) ?? grant.gameSlug}: {grant.from} bis{" "}
                      {grant.until}
                    </span>
                    <ActionForm action={revokeGrantAction} submitLabel="entfernen" variant="quiet">
                      <input type="hidden" name="grantId" value={grant.id} />
                    </ActionForm>
                  </li>
                ))}
              </ul>
              <ActionForm action={grantGameAction} submitLabel="Spiel freischalten">
                <input type="hidden" name="childId" value={child.id} />
                <Field label="Spiel">
                  <select name="gameSlug" className={inputClass}>
                    {spiele.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.titel}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Beginn">
                  <input
                    name="from"
                    type="date"
                    defaultValue={now}
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Ende">
                  <input
                    name="until"
                    type="date"
                    defaultValue={addMonths(now, 3)}
                    required
                    className={inputClass}
                  />
                </Field>
              </ActionForm>
            </article>
          );
        })}
      </section>
    </>
  );
}
