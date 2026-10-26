"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";
import { LoginzettelAnsicht } from "./LoginzettelAnsicht";

type Props = {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  submitLabel: string;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "quiet";
};

export function ActionForm({
  action,
  submitLabel,
  children,
  className,
  variant = "primary",
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={className ?? "flex flex-wrap items-end gap-3"}>
      {children}
      <button
        type="submit"
        disabled={pending}
        className={
          variant === "primary" ? "lv-btn lv-btn-primary" : "lv-btn lv-btn-quiet lv-btn-sm"
        }
      >
        {submitLabel}
      </button>
      {state.error ? (
        <p className="w-full text-sm font-semibold" style={{ color: "var(--lv-hint)" }}>
          {state.error}
        </p>
      ) : null}
      {state.ok && !state.error ? <p className="w-full text-sm">{state.ok}</p> : null}
      {state.zettel && !state.error ? <LoginzettelAnsicht zettel={state.zettel} /> : null}
    </form>
  );
}
