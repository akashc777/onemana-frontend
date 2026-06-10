import type { ReactNode } from "react";

/** A table shell with sticky header styling, used by all admin lists. */
export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
  return <td className={`px-3 py-2.5 text-slate-700 ${mono ? "font-mono text-xs" : ""}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="border-t border-slate-100">{children}</tr>;
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700",
  created: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-slate-200 text-slate-600",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"}`}>
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
        <p className="text-red-600">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-ghost mt-3 px-4 py-2 text-xs">
            Retry
          </button>
        )}
      </div>
    );
  if (empty) return <p className="py-8 text-center text-sm text-slate-400">Nothing here yet.</p>;
  return null;
}
