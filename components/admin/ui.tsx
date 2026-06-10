import type { ReactNode } from "react";

/** A table shell with sticky header styling, used by all admin lists. */
export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
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
  return <td className={`px-3 py-2.5 text-slate-300 ${mono ? "font-mono text-xs" : ""}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-t border-white/5">{children}</tr>;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300",
  active: "bg-emerald-500/15 text-emerald-300",
  created: "bg-amber-500/15 text-amber-300",
  failed: "bg-red-500/15 text-red-300",
  cancelled: "bg-slate-500/20 text-slate-400",
  refunded: "bg-slate-500/20 text-slate-400",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-white/10 text-slate-400"}`}>
      {status}
    </span>
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
  if (loading) return <p className="py-8 text-center text-sm text-slate-500">Loading…</p>;
  if (error)
    return (
      <div className="py-8 text-center text-sm">
        <p className="text-red-400">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost mt-3 px-4 py-2 text-xs">
            Retry
          </button>
        )}
      </div>
    );
  if (empty) return <p className="py-8 text-center text-sm text-slate-500">Nothing here yet.</p>;
  return null;
}
