"use client";

import { Wortmarke } from "@/ui/Wortmarke";
import type { Loginzettel } from "./actions";

// Druckbarer Loginzettel für das Kind. Das Erstpasswort steht nur hier, solange die Seite
// offen ist; neu laden oder weiterklicken, dann ist es weg.
export function LoginzettelAnsicht({ zettel }: { zettel: Loginzettel }) {
  const n = zettel.qr.length;
  const rand = 4;
  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className="lv-zettel flex max-w-2xl flex-col gap-6 rounded-2xl bg-white p-6 sm:flex-row sm:items-center"
        style={{ border: "2px dashed var(--lv-navy)" }}
      >
        <svg
          viewBox={`0 0 ${n + 2 * rand} ${n + 2 * rand}`}
          role="img"
          aria-label={`QR-Code zur Anmeldeseite ${zettel.adresse}`}
          className="h-36 w-36 shrink-0"
          shapeRendering="crispEdges"
        >
          <rect width="100%" height="100%" fill="#fff" />
          {zettel.qr.flatMap((zeile, r) =>
            [...zeile].map((z, c) =>
              z === "1" ? (
                <rect
                  key={`${r}-${c}`}
                  x={c + rand}
                  y={r + rand}
                  width="1"
                  height="1"
                  fill="#000"
                />
              ) : null,
            ),
          )}
        </svg>
        <div className="flex min-w-0 flex-1 flex-col gap-2 text-[var(--lv-text)]">
          <Wortmarke showClaim={false} className="h-auto w-40" />
          <p
            className="text-2xl"
            style={{ color: "var(--lv-navy)", fontFamily: "var(--font-patrick-hand), sans-serif" }}
          >
            Dein Zugang zu Lernversum
          </p>
          <p className="text-sm break-all">{zettel.adresse}</p>
          <p>
            Benutzername: <strong className="font-mono text-lg">{zettel.benutzername}</strong>
          </p>
          <p>
            Passwort: <strong className="font-mono text-lg">{zettel.passwort}</strong>
          </p>
          <p className="text-sm">
            Beim ersten Anmelden wählst du ein eigenes Passwort. Danach gilt dieser Zettel nicht
            mehr. Bitte gut aufheben und niemandem zeigen.
          </p>
        </div>
      </div>
      <div className="lv-nicht-drucken flex flex-wrap items-center gap-3">
        <button type="button" className="lv-btn lv-btn-reward" onClick={() => window.print()}>
          Loginzettel drucken
        </button>
        <p className="text-sm" style={{ color: "var(--lv-muted)" }}>
          Das Passwort wird nur jetzt angezeigt und nicht gespeichert.
        </p>
      </div>
    </div>
  );
}
