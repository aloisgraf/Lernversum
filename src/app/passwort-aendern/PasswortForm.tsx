"use client";

import { useActionState } from "react";
import { passwortAendernAction, type PasswortState } from "./actions";

export function PasswortForm({ minLaenge }: { minLaenge: number }) {
  const [state, formAction, pending] = useActionState<PasswortState, FormData>(
    passwortAendernAction,
    {},
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-lg font-bold">
        Passwort von deinem Zettel
        <input
          name="aktuell"
          type="password"
          required
          autoComplete="current-password"
          className="lv-input font-normal"
        />
      </label>
      <label className="flex flex-col gap-1 text-lg font-bold">
        Dein neues Passwort
        <input
          name="neu"
          type="password"
          required
          minLength={minLaenge}
          autoComplete="new-password"
          className="lv-input font-normal"
          aria-describedby="passwort-hinweis"
        />
        <span
          id="passwort-hinweis"
          className="text-base font-normal"
          style={{ color: "var(--lv-muted)" }}
        >
          Mindestens {minLaenge} Zeichen. Ein Satz aus mehreren Wörtern ist gut zu merken.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-lg font-bold">
        Neues Passwort noch einmal
        <input
          name="wiederholung"
          type="password"
          required
          minLength={minLaenge}
          autoComplete="new-password"
          className="lv-input font-normal"
        />
      </label>
      <button type="submit" disabled={pending} className="lv-btn lv-btn-reward min-h-12 text-xl">
        Passwort speichern
      </button>
      {state.error ? (
        <p role="alert" className="text-lg font-bold" style={{ color: "var(--lv-hint)" }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
