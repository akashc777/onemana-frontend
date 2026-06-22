"use client";

import { useState } from "react";
import { adminApi, downloadWithToken, type GSTR1Summary, type GSTR1Exception } from "@/lib/adminApi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Default to the PREVIOUS calendar month (the period you file this month).
function defaultPeriod(): { year: number; month: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function rupees(n: number): string {
  return "₹" + (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// GSTR1Panel — generate the GSTN-schema GSTR-1 JSON for a filing month, preview
// the section roll-up + any exceptions, then download the JSON to upload on the
// GST portal (or the Returns Offline Tool).
export function GSTR1Panel() {
  const init = defaultPeriod();
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [summary, setSummary] = useState<GSTR1Summary | null>(null);
  const [exceptions, setExceptions] = useState<GSTR1Exception[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState("");

  const years: number[] = [];
  for (let y = new Date().getFullYear(); y >= 2017; y--) years.push(y);

  async function preview() {
    setLoading(true);
    setErr("");
    setSummary(null);
    try {
      const { summary, exceptions } = await adminApi.gstr1Summary(year, month);
      setSummary(summary);
      setExceptions(exceptions);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate GSTR-1 preview.");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    setDownloading(true);
    setErr("");
    try {
      await downloadWithToken(adminApi.gstr1JsonUrl(year, month), `GSTR1_${year}-${String(month).padStart(2, "0")}.json`);
    } catch {
      setErr("Download failed. Please retry.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-1 text-sm font-semibold">GSTR-1 export (GST portal upload)</div>
      <p className="mb-3 text-xs text-muted-foreground">
        Generate the GSTN-format JSON for a month, review it, then upload on the GST portal / Returns Offline Tool and file with DSC/EVC.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-xs text-muted-foreground">
          Month
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="mt-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-muted-foreground">
          Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <button onClick={preview} disabled={loading} className="btn-ghost px-4 py-2 text-sm">
          {loading ? "Generating…" : "Preview"}
        </button>
        <button onClick={download} disabled={downloading} className="btn-primary px-4 py-2 text-sm">
          {downloading ? "Downloading…" : "Download JSON"}
        </button>
      </div>

      {err ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      {summary ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Stat label="GSTIN" value={summary.gstin} mono />
            <Stat label="Period" value={`${summary.period} (FP ${summary.fp})`} />
            <Stat label="Invoices" value={String(summary.invoice_count)} />
            <Stat label="Taxable" value={rupees(summary.taxable_value)} />
            <Stat label="CGST" value={rupees(summary.cgst)} />
            <Stat label="SGST" value={rupees(summary.sgst)} />
            <Stat label="IGST" value={rupees(summary.igst)} />
            <Stat label="Total" value={rupees(summary.total)} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Pill>B2B: {summary.b2b_count}</Pill>
            <Pill>B2C Large: {summary.b2cl_count}</Pill>
            <Pill>B2C Small: {summary.b2cs_count}</Pill>
            <Pill>Exports: {summary.export_count}</Pill>
          </div>

          {exceptions.length > 0 ? (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
              <div className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                {exceptions.length} invoice(s) excluded — fix before filing
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {exceptions.map((ex) => (
                  <li key={ex.invoice_no}>
                    <span className="font-mono text-foreground">{ex.invoice_no}</span>: {ex.reason}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-green-700 dark:text-green-400">All invoices classified cleanly — no exceptions.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-sm text-foreground ${mono ? "font-mono break-all" : ""}`}>{value}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-background px-2.5 py-1">{children}</span>;
}
