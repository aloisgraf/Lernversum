export const inputClass = "lv-input";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

export function Titel({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-display text-3xl font-bold" style={{ color: "var(--lv-navy)" }}>
      {children}
    </h1>
  );
}

export function Abschnitt({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl font-semibold" style={{ color: "var(--lv-navy)" }}>
      {children}
    </h2>
  );
}

// Datentabelle im Admin-Stil; `spalten` sind die Kopfzeilen.
export function Tabelle({
  spalten,
  label,
  children,
}: {
  spalten: string[];
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lv-table-wrap">
      <table className="lv-table" aria-label={label}>
        <thead>
          <tr>
            {spalten.map((s) => (
              <th key={s} scope="col">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Status({ art, children }: { art: "ok" | "aus" | "neutral"; children: string }) {
  const zeichen = art === "ok" ? "✓" : art === "aus" ? "✗" : "•";
  return (
    <span className={`lv-status lv-status-${art}`}>
      <span aria-hidden="true">{zeichen}</span>
      {children}
    </span>
  );
}
