"use client";

import { useState } from "react";
import { adminApi, type GSTFilingItem, type GSTFilingMonth } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { AsyncState } from "./ui";

// Current Indian financial year start (April-March).
function currentFYStart(): number {
  const d = new Date();
  return d.getMonth() + 1 < 4 ? d.getFullYear() - 1 : d.getFullYear();
}

function fyLabel(start: number): string {
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

// GSTFilingTracker shows, for each month of a financial year, which GST returns
// are due and whether they have been filed. The admin records the filing
// acknowledgement (ARN + date) per return so the year stays auditable.
export function GSTFilingTracker() {
  const [fy, setFy] = useState(currentFYStart());
  const { data, loading, error, reload } = useAsync(() => adminApi.gstFilings(fy), [fy]);
  const [editing, setEditing] = useState<GSTFilingItem | null>(null);

  const fyOptions: number[] = [];
  for (let y = currentFYStart(); y >= 2017; y--) fyOptions.push(y);

  return (
    <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-sm font-semibold">GST filing tracker</div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Financial year
          <select
            value={fy}
            onChange={(e) => setFy(Number(e.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {fyOptions.map((y) => (
              <option key={y} value={y}>{fyLabel(y)}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Returns due each month for FY {fyLabel(fy)}, with due dates. Mark each one filed with its portal ARN once done. Overdue and pending returns are highlighted.
      </p>

      {loading || error ? (
        <AsyncState loading={loading} error={error} onRetry={reload} />
      ) : (
        <div className="space-y-2">
          {(data?.months ?? []).map((m) => (
            <MonthRow key={`${m.year}-${m.month}`} month={m} onEdit={setEditing} onChanged={reload} />
          ))}
        </div>
      )}

      {editing ? (
        <MarkFiledDialog
          item={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null);
            reload();
          }}
        />
      ) : null}
    </div>
  );
}

function MonthRow({ month, onEdit, onChanged }: { month: GSTFilingMonth; onEdit: (i: GSTFilingItem) => void; onChanged: () => void }) {
  const allFiled = month.returns.every((r) => r.filed);
  const anyOverdue = month.returns.some((r) => r.overdue);
  return (
    <div
      className={`rounded-lg border p-3 ${
        anyOverdue
          ? "border-red-500/40 bg-red-500/5"
          : allFiled
            ? "border-green-500/30 bg-green-500/5"
            : "border-border bg-background"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold text-foreground">{month.label}</span>
        {month.nil_eligible ? (
          <span
            className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300"
            title="No invoices or credit notes this month - you can file NIL returns."
          >
            NIL eligible
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground">
            {month.invoice_count} invoice(s){month.credit_note_count ? `, ${month.credit_note_count} credit note(s)` : ""}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {month.returns.map((r) => (
          <ReturnChip key={r.return_type} item={r} onEdit={onEdit} onChanged={onChanged} />
        ))}
      </div>
    </div>
  );
}

function ReturnChip({ item, onEdit, onChanged }: { item: GSTFilingItem; onEdit: (i: GSTFilingItem) => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  async function unmark() {
    if (!window.confirm(`Unmark ${item.return_type} for ${item.period} as filed?`)) return;
    setBusy(true);
    try {
      await adminApi.unmarkGSTFiled(item.return_type, item.year, item.month);
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const tone = item.filed
    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
    : item.overdue
      ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
      : "border-border bg-muted/40 text-muted-foreground";

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${tone}`}>
      <span className="font-medium">{item.return_type}</span>
      {item.filed ? (
        <span title={item.arn ? `ARN ${item.arn}` : undefined}>
          filed{item.filed_on ? ` ${item.filed_on}` : ""}{item.arn ? ` · ${item.arn}` : ""}
        </span>
      ) : (
        <span>
          due {item.due_date}{item.overdue ? " (overdue)" : ""}{item.nil_eligible ? " · can file NIL" : ""}
        </span>
      )}
      {item.filed ? (
        <button onClick={unmark} disabled={busy} className="underline opacity-70 hover:opacity-100">
          {busy ? "…" : "undo"}
        </button>
      ) : (
        <button onClick={() => onEdit(item)} className="font-medium underline">
          mark filed
        </button>
      )}
    </div>
  );
}

function MarkFiledDialog({ item, onClose, onDone }: { item: GSTFilingItem; onClose: () => void; onDone: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [arn, setArn] = useState("");
  const [filedOn, setFiledOn] = useState(today);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      await adminApi.markGSTFiled({
        return_type: item.return_type,
        year: item.year,
        month: item.month,
        arn: arn.trim(),
        filed_on: filedOn,
        note: note.trim(),
      });
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to mark filed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 text-sm font-semibold">
          Mark {item.return_type} filed — {item.period}
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Record that you filed this return on the GST portal. Due {item.due_date}.
          {item.nil_eligible ? " This month has no invoices or credit notes, so it can be filed as a NIL return (GSTR-3B nil also requires no ITC or reverse charge)." : ""}
        </p>
        <div className="space-y-3">
          <label className="block text-xs text-muted-foreground">
            ARN (acknowledgement reference number)
            <input
              value={arn}
              onChange={(e) => setArn(e.target.value)}
              placeholder="e.g. AA2906260000000"
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Filed on
            <input
              type="date"
              value={filedOn}
              onChange={(e) => setFiledOn(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="block text-xs text-muted-foreground">
            Note (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>
          {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
            <button onClick={submit} disabled={busy} className="btn-primary px-4 py-2 text-sm">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
