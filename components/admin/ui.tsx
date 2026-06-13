import type { ReactNode } from "react";

/** A table shell with sticky header styling, used by all admin lists. */
export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, mono = false }: { children: ReactNode; mono?: boolean }) {
  return <td className={`px-3 py-2.5 text-foreground/80 ${mono ? "font-mono text-xs" : ""}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-t border-border">{children}</tr>;
}

export const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  created: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  paused: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  halted: "bg-red-500/15 text-red-700 dark:text-red-300",
  failed: "bg-red-500/15 text-red-700 dark:text-red-300",
  cancelled: "bg-slate-500/20 text-muted-foreground",
  completed: "bg-slate-500/20 text-muted-foreground",
  expired: "bg-slate-500/20 text-muted-foreground",
  refunded: "bg-slate-500/20 text-muted-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

/** Small destructive action button for admin row deletes. */
export function RowDeleteButton({ onClick, busy = false }: { onClick: () => void; busy?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 transition hover:bg-red-500/20 disabled:opacity-50 dark:text-red-300"
    >
      {busy ? "…" : "Delete"}
    </button>
  );
}

/** Renders loading / error / empty states consistently; returns null when there's data. */
export function AsyncState({
  loading,
  error,
  empty,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  empty?: boolean;
  onRetry?: () => void;
}) {
  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return (
      <div className="py-8 text-center text-sm">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost mt-3 px-4 py-2 text-xs">
            Retry
          </button>
        )}
      </div>
    );
  if (empty) return <p className="py-8 text-center text-sm text-muted-foreground">Nothing here yet.</p>;
  return null;
}
