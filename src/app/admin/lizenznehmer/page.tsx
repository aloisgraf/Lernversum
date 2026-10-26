import type { Metadata } from "next";
import Link from "next/link";
import { adminStore, today } from "@/lib/demo-admin/server";
import { licenseActive, packageById } from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../ActionForm";
import { Kopf } from "../Kopf";
import { createHolderAction } from "../actions";
import { Field, Status, Tabelle, inputClass } from "../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lizenznehmer · Lernversum" };

const typeLabel = { lehrkraft: "Lehrkraft/Schule", therapeut: "Lerntherapie", eltern: "Eltern" };

export default async function HoldersPage() {
  await requireRole("admin");
  const store = adminStore();
  const holders = [...store.holders.values()];
  const now = today();

  return (
    <>
      <Kopf titel="Lizenznehmer" knopf="Neuen Lizenznehmer anlegen">
        <p className="text-sm" style={{ color: "var(--lv-muted)" }}>
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
      </Kopf>
      {holders.length === 0 ? (
        <p>Noch keine Lizenznehmer.</p>
      ) : (
        <Tabelle label="Lizenznehmer" spalten={["Name", "Typ", "Kinder", "Lizenz"]}>
          {holders.map((holder) => {
            const pkg = holder.license ? packageById(holder.license.packageId) : undefined;
            const active = licenseActive(holder.license, now);
            const kinder = store.childrenOf(holder.id).length;
            return (
              <tr key={holder.id}>
                <td>
                  <Link href={`/admin/lizenznehmer/${holder.id}`}>{holder.name}</Link>
                </td>
                <td>{typeLabel[holder.type]}</td>
                <td>{pkg ? `${kinder} von ${pkg.maxChildren}` : kinder}</td>
                <td>
                  {!holder.license ? (
                    <Status art="neutral">keine Lizenz</Status>
                  ) : active ? (
                    <Status art="ok">{`gültig bis ${holder.license.validUntil}`}</Status>
                  ) : holder.license.validUntil <= now ? (
                    <Status art="aus">{`abgelaufen am ${holder.license.validUntil}`}</Status>
                  ) : (
                    <Status art="neutral">{`ab ${holder.license.validFrom}`}</Status>
                  )}
                </td>
              </tr>
            );
          })}
        </Tabelle>
      )}
    </>
  );
}
