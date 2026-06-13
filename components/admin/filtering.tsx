"use client";

export interface RangeFilter {
  q: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
}

export const emptyFilter: RangeFilter = { q: "", from: "", to: "" };

const inputCls =
  "rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

/** Search + date-range filter bar shared by admin tables. */
export function FilterBar({
  value,
  onChange,
  placeholder = "Search…",
  count,
}: {
  value: RangeFilter;
  onChange: (v: RangeFilter) => void;
  placeholder?: string;
  count?: number;
}) {
  const active = value.q || value.from || value.to;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <input
        value={value.q}
        onChange={(e) => onChange({ ...value, q: e.target.value })}
        placeholder={placeholder}
        className={`${inputCls} min-w-[12rem] flex-1`}
        aria-label="Search"
      />
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        From
        <input type="date" value={value.from} onChange={(e) => onChange({ ...value, from: e.target.value })} className={inputCls} aria-label="From date" />
      </label>
      <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
        To
        <input type="date" value={value.to} onChange={(e) => onChange({ ...value, to: e.target.value })} className={inputCls} aria-label="To date" />
      </label>
      {active && (
        <button onClick={() => onChange(emptyFilter)} className="rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground/80 hover:bg-muted">
          Clear
        </button>
      )}
      {typeof count === "number" && <span className="ml-auto text-xs text-muted-foreground">{count} result{count === 1 ? "" : "s"}</span>}
    </div>
  );
}

/** True when an ISO timestamp falls within [from, to] (inclusive, date-only). */
export function withinRange(iso: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  const day = (iso || "").slice(0, 10); // YYYY-MM-DD (ISO is UTC)
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

/** Case-insensitive substring match across the provided fields. */
export function matchesQuery(q: string, ...fields: (string | undefined | null)[]): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((f) => (f || "").toLowerCase().includes(needle));
}
