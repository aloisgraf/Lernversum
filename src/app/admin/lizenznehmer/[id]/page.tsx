import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminStore, today } from "@/lib/demo-admin/server";
import { DURATIONS_MONTHS, PACKAGES, licenseActive, packageById } from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../../ActionForm";
import { Kopf } from "../../Kopf";
import { addChildAction, assignLicenseAction } from "../../actions";
import { Abschnitt, Field, Status, Tabelle, inputClass } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lizenznehmer · Lernversum" };

const typeLabel = { lehrkraft: "Lehrkraft/Schule", therapeut: "Lerntherapie", eltern: "Eltern" };

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

  return (
    <>
      <Link href="/admin/lizenznehmer" className="lv-link self-start">
        ← alle Lizenznehmer
      </Link>
      <Kopf
        titel={holder.name}
        unterzeile={`${typeLabel[holder.type]} · ${holder.email}`}
        knopf="Kind anlegen"
      >
        <p className="text-sm" style={{ color: "var(--lv-muted)" }}>
          Benutzername frei wählbar, am besten ein Spitzname statt des vollen Namens. Das
          Erstpasswort (mindestens 8 Zeichen) muss das Kind beim ersten Anmelden ändern.
        </p>
        <ActionForm action={addChildAction} submitLabel="Kind speichern">
          <input type="hidden" name="holderId" value={holder.id} />
          <Field label="Benutzername">
            <input
              name="username"
              required
              maxLength={30}
              autoComplete="off"
              className={inputClass}
            />
          </Field>
          <Field label="Erstpasswort">
            <input
              name="erstpasswort"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>
        </ActionForm>
      </Kopf>

      <section className="lv-card flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <Abschnitt>Lizenz</Abschnitt>
          {holder.license ? (
            active ? (
              <Status art="ok">gültig</Status>
            ) : (
              <Status art="aus">nicht gültig</Status>
            )
          ) : null}
        </div>
        <p>
          {pkg
            ? `${pkg.name}, ${holder.license!.months} Monate, ${holder.license!.validFrom} bis ${holder.license!.validUntil} · ${children.length} von ${pkg.maxChildren} Kindern`
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

      <section className="flex flex-col gap-3">
        <Abschnitt>Kinder ({children.length})</Abschnitt>
        {children.length === 0 ? (
          <p>Noch keine Kinder.</p>
        ) : (
          <Tabelle label="Kinder" spalten={["Benutzername", "Konto", "Laufende Lernpakete"]}>
            {children.map((child) => {
              const laufend = store
                .packagesOf(child.id)
                .filter((p) => store.packageStatus(p, now) === "läuft").length;
              return (
                <tr key={child.id}>
                  <td>
                    <Link href={`/admin/kinder/${child.id}`}>{child.username}</Link>
                  </td>
                  <td>
                    {child.testkonto ? (
                      <Status art="neutral">Testkonto</Status>
                    ) : child.mustChangePassword ? (
                      <Status art="neutral">Erstpasswort noch nicht geändert</Status>
                    ) : (
                      <Status art="ok">aktiv</Status>
                    )}
                  </td>
                  <td>{laufend}</td>
                </tr>
              );
            })}
          </Tabelle>
        )}
      </section>
    </>
  );
}
