"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

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
        className={variant === "primary" ? "lv-btn lv-btn-primary" : "lv-btn lv-btn-quiet text-sm"}
      >
        {submitLabel}
      </button>
      {state.error ? (
        <p className="w-full text-sm font-semibold" style={{ color: "var(--lv-hint)" }}>
          {state.error}
        </p>
      ) : null}
      {state.ok && !state.error ? <p className="w-full text-sm">{state.ok}</p> : null}
      {state.codes ? (
        <div
          className="w-full rounded-xl border-2 p-4"
          style={{ borderColor: "var(--lv-yellow)", background: "#fffbea" }}
        >
          <p className="mb-2 font-semibold">
            Zugangskarten – die Codes werden nur jetzt angezeigt (gespeichert ist nur ein Prüfwert):
          </p>
          <ul className="flex flex-col gap-1">
            {state.codes.map((card) => (
              <li key={card.label}>
                {card.label}: Benutzername <strong>{card.username}</strong> · Code{" "}
                <code className="font-mono text-lg">{card.code}</code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
