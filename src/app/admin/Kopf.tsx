"use client";

import { useId, useState } from "react";

// Seitenkopf mit Titel und Pill-Knopf rechts („+ Neuen … anlegen“), der das Formular
// darunter auf- und zuklappt. Reine Anzeige: Die Aktion prüft der Server.
export function Kopf({
  titel,
  unterzeile,
  knopf,
  children,
}: {
  titel: React.ReactNode;
  unterzeile?: React.ReactNode;
  knopf?: string;
  children?: React.ReactNode;
}) {
  const [offen, setOffen] = useState(false);
  const panelId = useId();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
            {titel}
          </h1>
          {unterzeile ? <p style={{ color: "var(--lv-muted)" }}>{unterzeile}</p> : null}
        </div>
        {knopf && children ? (
          <button
            type="button"
            className="lv-btn lv-btn-primary"
            aria-expanded={offen}
            aria-controls={panelId}
            onClick={() => setOffen((o) => !o)}
          >
            {offen ? "Schließen" : `+ ${knopf}`}
          </button>
        ) : null}
      </div>
      {knopf && children ? (
        <div id={panelId} hidden={!offen} className="lv-card flex flex-col gap-3 p-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
