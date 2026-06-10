"use client";

import { useState } from "react";
import { adminApi, downloadWithToken, type Invoice } from "@/lib/adminApi";
import { useAsync } from "@/hooks/useAsync";
import { formatINR, formatDateTime } from "@/lib/format";
import { AsyncState, DataTable, Td, Tr } from "./ui";

export function InvoicesTable() {
  const { data, loading, error, reload } = useAsync<Invoice[]>(() => adminApi.invoices());
  const [exporting, setExporting] = useState(false);
  const [downloadErr, setDownloadErr] = useState("");
  const invoices = data ?? [];

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
        {downloadErr ? <p className="text-sm text-red-600">{downloadErr}</p> : <span />}
        <button onClick={exportCsv} disabled={exporting} className="btn-ghost px-4 py-2 text-sm">
          {exporting ? "Exporting…" : "Export CSV (for filings)"}
        </button>
      </div>
      <DataTable head={["Invoice No", "Date", "Buyer", "Place of Supply", "Taxable", "CGST", "SGST", "IGST", "Total", ""]}>
        {invoices.length === 0 ? (
          <Tr>
            <td colSpan={10} className="px-3 py-8 text-center text-sm text-slate-400">No invoices yet.</td>
          </Tr>
        ) : (
          invoices.map((i) => (
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
                <button onClick={() => downloadPdf(i)} className="text-brand hover:underline">PDF</button>
              </Td>
            </Tr>
          ))
        )}
      </DataTable>
    </div>
  );
}
