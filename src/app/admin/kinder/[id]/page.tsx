import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { spiele } from "@/games/registry";
import { adminStore, today } from "@/lib/demo-admin/server";
import { STUFEN, sterne, type LearningPackage } from "@/lib/demo-admin/store";
import { requireRole } from "@/lib/demo-auth/server";
import { ActionForm } from "../../ActionForm";
import {
  createPackageAction,
  endPackageAction,
  removeChildAction,
  resetPasswordAction,
} from "../../actions";
import { Kopf } from "../../Kopf";
import { Abschnitt, Field, Status, Tabelle, inputClass } from "../../ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Kind · Lernversum" };

const stufenName = { einfach: "Einfach", mittel: "Mittel", schwer: "Schwer" } as const;

// Anzeige in österreichischer Zeit, unabhängig von der Serverzeitzone.
const zeit = new Intl.DateTimeFormat("de-AT", {
  timeZone: "Europe/Vienna",
  dateStyle: "medium",
  timeStyle: "short",
});
const datum = new Intl.DateTimeFormat("de-AT", { timeZone: "UTC", dateStyle: "medium" });
const zeigeZeit = (iso: string) => zeit.format(new Date(iso));
const zeigeDatum = (isoTag: string) => datum.format(new Date(`${isoTag}T00:00:00Z`));

function dauer(sek: number): string {
  const min = Math.floor(sek / 60);
  return min > 0 ? `${min} min ${sek % 60} s` : `${sek} s`;
}

export default async function KindPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const store = adminStore();
  const child = store.children.get(id);
  if (!child) notFound();
  const holder = store.requireHolder(child.holderId);
  const now = today();
  const titel = new Map(spiele.map((s) => [s.slug as string, s.titel as string]));
  const categories = [...store.categories.values()];
  const kategorieName = (catId: string) => store.categories.get(catId)?.name ?? "gelöscht";
  const pakete = store.packagesOf(child.id);

  function inhalt(pkg: LearningPackage): string {
    return pkg.items
      .map((item) =>
        item.art === "stufe"
          ? `${kategorieName(item.categoryId)}: ganze Stufe ${stufenName[item.stufe]}`
          : `${kategorieName(item.categoryId)}: ${titel.get(item.gameSlug) ?? item.gameSlug}`,
      )
      .join(" · ");
  }

  const kontoText = child.testkonto
    ? "Testkonto (Passwort aus den Servereinstellungen)"
    : child.mustChangePassword
      ? "Erstpasswort noch nicht geändert"
      : "Eigenes Passwort gesetzt";

  return (
    <>
      <Link href={`/admin/lizenznehmer/${holder.id}`} className="lv-link self-start">
        ← {holder.name}
      </Link>
      <Kopf
        titel={child.username}
        unterzeile={`${kontoText} · angelegt ${zeigeZeit(child.createdAt)}`}
        knopf="Lernpaket freigeben"
      >
        <ActionForm
          action={createPackageAction}
          submitLabel="Freigeben"
          className="flex flex-col items-start gap-4"
        >
          <input type="hidden" name="childId" value={child.id} />
          <div className="flex flex-wrap gap-3">
            <Field label="Name des Lernpakets">
              <input name="name" required maxLength={60} className={inputClass} />
            </Field>
            <Field label="Ablaufdatum (leer = unbefristet bis Lizenzende)">
              <input name="validUntil" type="date" min={now} className={inputClass} />
            </Field>
          </div>
          {categories.map((category) => (
            <fieldset
              key={category.id}
              className="flex w-full flex-col gap-2 rounded-2xl p-4"
              style={{ border: "1px solid var(--lv-border)", background: "var(--lv-white)" }}
            >
              <legend
                className="font-display px-1 font-semibold"
                style={{ color: "var(--lv-navy)" }}
              >
                {category.name}
              </legend>
              <div className="grid gap-3 md:grid-cols-3">
                {STUFEN.map((stufe) => {
                  const placements = store.placementsOf(category.id, stufe);
                  return (
                    <div key={stufe} className="flex flex-col gap-1">
                      <label className="flex items-center gap-2 font-semibold">
                        <input
                          type="checkbox"
                          name="items"
                          value={`s:${category.id}:${stufe}`}
                          className="lv-check"
                        />
                        Ganze Stufe {stufenName[stufe]} ({placements.length})
                      </label>
                      {placements.map((p) => (
                        <label key={p.id} className="ml-7 flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="items"
                            value={`g:${category.id}:${p.gameSlug}`}
                            className="lv-check"
                          />
                          {titel.get(p.gameSlug) ?? p.gameSlug}
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </ActionForm>
      </Kopf>

      {child.testkonto ? null : (
        <section className="lv-card flex flex-wrap items-end justify-between gap-4 p-5">
          <div className="flex flex-col gap-3">
            <Abschnitt>Passwort vergessen?</Abschnitt>
            <ActionForm action={resetPasswordAction} submitLabel="Neues Erstpasswort setzen">
              <input type="hidden" name="childId" value={child.id} />
              <Field label="Neues Erstpasswort">
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
          </div>
          <ActionForm action={removeChildAction} submitLabel="Kind entfernen" variant="quiet">
            <input type="hidden" name="childId" value={child.id} />
          </ActionForm>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <Abschnitt>Lernpakete ({pakete.length})</Abschnitt>
        {pakete.length === 0 ? <p>Noch keine Lernpakete.</p> : null}
        {pakete.map((pkg) => {
          const status = store.packageStatus(pkg, now);
          const runden = store.roundsOf(pkg.id);
          const summe = store.summary(pkg.id);
          const spieleJetzt = store.gamesOf(pkg);
          return (
            <article key={pkg.id} className="flex flex-col gap-3">
              <div className="lv-card flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="flex flex-col gap-1">
                  <h3
                    className="font-display flex flex-wrap items-center gap-2 text-lg font-semibold"
                    style={{ color: "var(--lv-navy)" }}
                  >
                    {pkg.name} <Status art={status === "läuft" ? "ok" : "neutral"}>{status}</Status>
                  </h3>
                  <p className="text-sm" style={{ color: "var(--lv-muted)" }}>
                    erstellt {zeigeZeit(pkg.createdAt)} ·{" "}
                    {pkg.validUntil ? `spielbar bis ${zeigeDatum(pkg.validUntil)}` : "unbefristet"}
                    {pkg.endedAt ? ` · beendet ${zeigeZeit(pkg.endedAt)}` : ""}
                  </p>
                  <p className="text-sm">Freigegeben: {inhalt(pkg)}</p>
                  <p className="text-sm">
                    Spiele darin:{" "}
                    {spieleJetzt.length
                      ? spieleJetzt.map((g) => titel.get(g.gameSlug) ?? g.gameSlug).join(", ")
                      : "keine"}
                  </p>
                  <p className="text-sm font-semibold">
                    {summe
                      ? `Ergebnisse: ${summe.runden} Runden, ${summe.aufgaben} Aufgaben, ${summe.fehler} Fehlversuche · zuerst gespielt ${zeigeZeit(summe.erste)}, zuletzt ${zeigeZeit(summe.letzte)}`
                      : "Noch nicht gespielt."}
                  </p>
                </div>
                {status === "läuft" ? (
                  <ActionForm action={endPackageAction} submitLabel="Beenden" variant="quiet">
                    <input type="hidden" name="packageId" value={pkg.id} />
                  </ActionForm>
                ) : null}
              </div>
              {runden.length > 0 ? (
                <Tabelle
                  label={`Spielrunden ${pkg.name}`}
                  spalten={["Spiel", "Gespielt am", "Dauer", "Aufgaben", "Fehlversuche", "Sterne"]}
                >
                  {runden.map((r) => {
                    const n = sterne(r.aufgaben, r.fehler);
                    return (
                      <tr key={r.id}>
                        <td>{titel.get(r.gameSlug) ?? r.gameSlug}</td>
                        <td>{zeigeZeit(r.startedAt)}</td>
                        <td>{dauer(r.durationSec)}</td>
                        <td>{r.aufgaben}</td>
                        <td>{r.fehler}</td>
                        <td aria-label={`${n} von 3 Sternen`}>
                          <span style={{ color: "#E5B82D" }}>{"★".repeat(n)}</span>
                          <span style={{ color: "var(--lv-border)" }}>{"★".repeat(3 - n)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </Tabelle>
              ) : null}
            </article>
          );
        })}
      </section>
    </>
  );
}
