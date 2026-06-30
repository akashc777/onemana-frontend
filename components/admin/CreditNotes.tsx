"use client";

import { useMemo, useState } from "react";
import { adminApi, type CreditNote, type Invoice } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, Td, Tr } from "./ui";

// CreditNoteDialog issues a GST credit/debit note against an invoice (refund,
// cancellation, or downward price revision). Full credit reverses the whole
// remaining balance; partial credit re-derives the tax split from the original.
export function CreditNoteDialog({
  invoice,
  onClose,
  onDone,
}: {
  invoice: Invoice;
  onClose: () => void;
  onDone: () => void;
}) {
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [ntty, setNtty] = useState<"C" | "D">("C");
  const [amount, setAmount] = useState(""); // rupees
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    let amountPaise = 0;
    if (mode === "partial") {
      const rupees = Number(amount);
      if (!Number.isFinite(rupees) || rupees <= 0) {
        setErr("Enter a valid amount in rupees.");
        return;
      }
      amountPaise = Math.round(rupees * 100);
    }
    setBusy(true);
    try {
      await adminApi.createCreditNote({
        invoice_id: invoice.id,
        reason: reason.trim(),
        amount_paise: amountPaise,
        ntty,
      });
      onDone();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to issue credit note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 text-sm font-semibold">Issue credit note</div>
        <p className="mb-4 text-xs text-muted-foreground">
          Against invoice <span className="font-mono text-foreground">{invoice.invoice_no}</span> ({formatINR(invoice.gross_amount)} total).
          This records the GST document and reflects it in GSTR-1; it does not move money.
        </p>

        <div className="space-y-3">
          <div className="flex gap-2">
            <TypeButton active={ntty === "C"} onClick={() => setNtty("C")}>Credit note</TypeButton>
            <TypeButton active={ntty === "D"} onClick={() => setNtty("D")}>Debit note</TypeButton>
          </div>

          <div className="flex gap-2">
            <TypeButton active={mode === "full"} onClick={() => setMode("full")}>Full</TypeButton>
            <TypeButton active={mode === "partial"} onClick={() => setMode("partial")}>Partial</TypeButton>
          </div>

          {mode === "partial" ? (
            <label className="block text-xs text-muted-foreground">
              Amount (₹, GST-inclusive)
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 500.00"
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
              />
            </label>
          ) : null}

          <label className="block text-xs text-muted-foreground">
            Reason (optional)
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Refund, cancellation, price revision…"
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            />
          </label>

          {err ? <p className="text-sm text-red-600 dark:text-red-400">{err}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
            <button onClick={submit} disabled={busy} className="btn-primary px-4 py-2 text-sm">
              {busy ? "Issuing…" : "Issue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-brand bg-brand/10 text-brand"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}

// CreditNotesTable lists issued credit/debit notes. reloadKey forces a refresh
// when a new note is issued from the invoices table.
export function CreditNotesTable({ reloadKey = 0 }: { reloadKey?: number }) {
  const { data, loading, error, reload } = useAsync<CreditNote[]>(() => adminApi.creditNotes(), [reloadKey]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionErr, setActionErr] = useState("");

  const notes = useMemo(() => data ?? [], [data]);

  async function remove(cn: CreditNote) {
    if (!window.confirm(`Delete credit note ${cn.credit_note_no}? For real notes this breaks your filing sequence. Only do this for test data.`)) return;
    setDeletingId(cn.id);
    try {
      await adminApi.deleteCreditNote(cn.id);
      reload();
    } catch {
      setActionErr("Failed to delete credit note.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading || error) return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div className="mt-8">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Credit / debit notes</h3>
        {actionErr ? <p className="text-sm text-red-600 dark:text-red-400">{actionErr}</p> : null}
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Issued on refunds, cancellations, or price revisions. These flow into GSTR-1 (cdnr / cdnur) and net your outward supply. Refunds create one automatically.
      </p>
      <DataTable head={["Note No", "Date", "Type", "Original Invoice", "Buyer", "Reason", "Taxable", "Tax", "Total", ""]}>
        {notes.length === 0 ? (
          <Tr>
            <td colSpan={10} className="px-3 py-8 text-center text-sm text-muted-foreground">No credit notes yet.</td>
          </Tr>
        ) : (
          notes.map((cn) => (
            <Tr key={cn.id}>
              <Td mono>{cn.credit_note_no}</Td>
              <Td>{formatDateTime(cn.note_date)}</Td>
              <Td>{cn.ntty === "D" ? "Debit" : "Credit"}</Td>
              <Td mono>{cn.original_invoice_no}</Td>
              <Td>{cn.buyer_name || cn.buyer_gstin || "-"}</Td>
              <Td>{cn.reason || "-"}</Td>
              <Td>{formatINR(cn.taxable_value)}</Td>
              <Td>{formatINR(cn.cgst_amount + cn.sgst_amount + cn.igst_amount)}</Td>
              <Td>{formatINR(cn.gross_amount)}</Td>
              <Td>
                <RowDeleteButton onClick={() => remove(cn)} busy={deletingId === cn.id} />
              </Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
