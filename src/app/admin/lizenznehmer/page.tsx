import type { Metadata } from "next";
import Link from "next/link";
import { adminStore, today } from "@/lib/demo-admin/server";
import { licenseActive, packageById } from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../ActionForm";
import { createHolderAction } from "../actions";
import { Field, inputClass } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lizenznehmer · Lernversum" };

const typeLabel = { lehrkraft: "Lehrkraft", therapeut: "Lerntherapie", eltern: "Eltern" };

export default async function HoldersPage() {
  await requireRole("admin");
  const store = adminStore();
  const holders = [...store.holders.values()];

  return (
    <>
      <h1 className="text-3xl font-semibold">Lizenznehmer und Kinder</h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Neuen Lizenznehmer anlegen</h2>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          Später entsteht dieser Schritt automatisch beim Online-Kauf (D-018).
        </p>
        <ActionForm action={createHolderAction} submitLabel="Anlegen">
          <Field label="Name">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="E-Mail">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Art">
            <select name="type" className={inputClass}>
              <option value="lehrkraft">Lehrkraft / Schule</option>
              <option value="therapeut">Lerntherapie</option>
              <option value="eltern">Eltern (Elternlizenz)</option>
            </select>
          </Field>
        </ActionForm>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Alle Lizenznehmer</h2>
        {holders.length === 0 ? <p>Noch keine.</p> : null}
        <ul className="flex flex-col gap-2">
          {holders.map((holder) => {
            const pkg = holder.license ? packageById(holder.license.packageId) : undefined;
            const active = licenseActive(holder.license, today());
            return (
              <li key={holder.id}>
                <Link
                  href={`/admin/lizenznehmer/${holder.id}`}
                  className="flex flex-wrap justify-between gap-2 rounded-xl border p-4"
                >
                  <span>
                    <strong>{holder.name}</strong> · {typeLabel[holder.type]}
                  </span>
                  <span style={{ color: "var(--color-muted)" }}>
                    {pkg
                      ? `${pkg.name} · ${store.childrenOf(holder.id).length}/${pkg.maxChildren} Kinder · ${active ? `gültig bis ${holder.license!.validUntil}` : "nicht gültig"}`
                      : "keine Lizenz"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
