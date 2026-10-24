"use client";

import { useActionState } from "react";
import { AVATAR_IDS, SPITZNAME_MAX, type AvatarId } from "@/lib/demo-profile/core";
import { Avatar, AVATARE } from "@/ui/Avatar";
import { speichereProfilAction, type ProfilState } from "./actions";

export function ProfilForm({ spitzname, avatar }: { spitzname: string; avatar: AvatarId }) {
  const [state, formAction, pending] = useActionState<ProfilState, FormData>(
    speichereProfilAction,
    {},
  );
  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-2 text-xl font-bold">
        Mein Spitzname
        <input
          name="spitzname"
          defaultValue={spitzname}
          maxLength={SPITZNAME_MAX}
          autoComplete="off"
          className="lv-input text-xl font-normal"
          aria-describedby="spitzname-hinweis"
        />
        <span
          id="spitzname-hinweis"
          className="text-base font-normal"
          style={{ color: "var(--lv-muted)" }}
        >
          Nur Buchstaben, höchstens {SPITZNAME_MAX} Zeichen. Bitte nicht deinen ganzen Namen.
        </span>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-xl font-bold">Mein Avatar</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {AVATAR_IDS.map((id) => (
            <label key={id} className="lv-avatar-wahl">
              <input
                type="radio"
                name="avatar"
                value={id}
                defaultChecked={id === avatar}
                className="sr-only"
                aria-label={AVATARE[id].name}
              />
              <Avatar id={id} className="h-20 w-20" />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="lv-btn lv-btn-reward min-h-12 text-xl">
          Speichern
        </button>
        <p role="status" className="text-lg font-bold">
          {state.error ? <span style={{ color: "var(--lv-hint)" }}>{state.error}</span> : state.ok}
        </p>
      </div>
    </form>
  );
}
