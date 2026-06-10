"use client";

import { useMemo, useState } from "react";
import { adminApi, downloadWithToken, type Invoice } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, RowDeleteButton, Td, Tr } from "./ui";
import { FilterBar, emptyFilter, matchesQuery, withinRange, type RangeFilter } from "./filtering";

export function InvoicesTable() {
  const { data, loading, error, reload } = useAsync<Invoice[]>(() => adminApi.invoices());
  const [exporting, setExporting] = useState(false);
  const [downloadErr, setDownloadErr] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<RangeFilter>(emptyFilter);

  const filtered = useMemo(
    () =>
      (data ?? []).filter(
        (i) => withinRange(i.issued_at, filter.from, filter.to) && matchesQuery(filter.q, i.invoice_no, i.buyer_email, i.buyer_name, i.place_of_supply),
      ),
    [data, filter],
  );

  async function remove(inv: Invoice) {
    if (!window.confirm(`Delete invoice ${inv.invoice_no}? For real sales this breaks your filing sequence — only do this for test data. This cannot be undone.`)) return;
    setDeletingId(inv.id);
    try {
      await adminApi.deleteInvoice(inv.id);
      reload();
    } catch {
      setDownloadErr("Failed to delete invoice.");
    } finally {
      setDeletingId(null);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setDownloadErr("");
    try {
      await downloadWithToken(adminApi.invoiceCsvUrl(), "onecamp-invoices.csv");
    } catch {
      setDownloadErr("Export failed. Please retry.");
    } finally {
      setExporting(false);
    }
  }

  async function downloadPdf(inv: Invoice) {
    try {
      await downloadWithToken(adminApi.invoicePdfUrl(inv.id), `${inv.invoice_no.replace(/\//g, "-")}.pdf`);
    } catch {
      setDownloadErr("Could not download the invoice PDF.");
    }
  }

  if (loading || error)
    return <AsyncState loading={loading} error={error} onRetry={reload} />;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        {downloadErr ? <p className="text-sm text-red-400">{downloadErr}</p> : <span />}
        <button onClick={exportCsv} disabled={exporting} className="btn-ghost px-4 py-2 text-sm">
          {exporting ? "Exporting…" : "Export CSV (for filings)"}
        </button>
      </div>
      <FilterBar value={filter} onChange={setFilter} placeholder="Search invoice no, buyer…" count={filtered.length} />
      <DataTable head={["Invoice No", "Date", "Buyer", "Place of Supply", "Taxable", "CGST", "SGST", "IGST", "Total", ""]}>
        {filtered.length === 0 ? (
          <Tr>
            <td colSpan={10} className="px-3 py-8 text-center text-sm text-slate-500">No matching invoices.</td>
          </Tr>
        ) : (
          filtered.map((i) => (
            <Tr key={i.id}>
              <Td mono>{i.invoice_no}</Td>
              <Td>{formatDateTime(i.issued_at)}</Td>
              <Td>{i.buyer_email}</Td>
              <Td>{i.place_of_supply}{i.is_export ? " (export)" : ""}</Td>
              <Td>{formatINR(i.taxable_value)}</Td>
              <Td>{formatINR(i.cgst_amount)}</Td>
              <Td>{formatINR(i.sgst_amount)}</Td>
              <Td>{formatINR(i.igst_amount)}</Td>
              <Td>{formatINR(i.gross_amount)}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <button onClick={() => downloadPdf(i)} className="text-brand-light hover:underline">PDF</button>
                  <RowDeleteButton onClick={() => remove(i)} busy={deletingId === i.id} />
                </div>
              </Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
