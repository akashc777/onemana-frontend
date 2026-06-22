"use client";

import { useState } from "react";
import { adminApi, downloadWithToken, type GSTR3BSummary, type GSTR3BRecon, type GSTR3BManual } from "@/lib/adminApi";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function defaultPeriod(): { year: number; month: number } {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function rupees(n: number): string {
  return "₹" + (n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// GSTR3BPanel - the monthly summary-and-pay return. The outward side (3.1(a),
// 3.1(b), 3.2) is computed automatically from invoices + credit notes and
// reconciled against GSTR-1. ITC, reverse charge, and interest/late fee come
// from the books / GSTR-2B and are entered here to compute the net cash payable.
export function GSTR3BPanel() {
  const init = defaultPeriod();
  const [year, setYear] = useState(init.year);
  const [month, setMonth] = useState(init.month);
  const [manual, setManual] = useState<GSTR3BManual>({});
  const [summary, setSummary] = useState<GSTR3BSummary | null>(null);
  const [recon, setRecon] = useState<GSTR3BRecon | null>(null);
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
      const { summary, recon } = await adminApi.gstr3bSummary(year, month, manual);
      setSummary(summary);
      setRecon(recon);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to generate GSTR-3B preview.");
    } finally {
      setLoading(false);
    }
  }

  async function download() {
    setDownloading(true);
    setErr("");
    try {
      await downloadWithToken(adminApi.gstr3bJsonUrl(year, month, manual), `GSTR3B_${year}-${String(month).padStart(2, "0")}.json`);
    } catch {
      setErr("Download failed. Please retry.");
    } finally {
      setDownloading(false);
    }
  }

  const setField = (k: keyof GSTR3BManual) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value === "" ? undefined : Number(e.target.value);
    setManual((m) => ({ ...m, [k]: v }));
  };

  return (
    <div className="mb-5 rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-1 text-sm font-semibold">GSTR-3B (monthly summary &amp; payment)</div>
      <p className="mb-3 text-xs text-muted-foreground">
        Outward supplies (3.1(a), 3.1(b), 3.2) are computed from your invoices and credit notes and reconciled with GSTR-1. Enter ITC, reverse charge, and interest from your books / GSTR-2B to see the net cash payable, then download the JSON for the portal.
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col text-xs text-muted-foreground">
          Month
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="mt-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            {MONTHS.map((m, i) => (<option key={m} value={i + 1}>{m}</option>))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-muted-foreground">
          Year
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="mt-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            {years.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
        </label>
        <button onClick={preview} disabled={loading} className="btn-ghost px-4 py-2 text-sm">
          {loading ? "Generating…" : "Preview"}
        </button>
        <button onClick={download} disabled={downloading} className="btn-primary px-4 py-2 text-sm">
          {downloading ? "Downloading…" : "Download JSON"}
        </button>
      </div>

      {/* Manual inputs (from books / GSTR-2B) - rupees. */}
      <div className="mt-4">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">Input tax credit &amp; reverse charge (₹, from your books / GSTR-2B)</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <NumIn label="ITC IGST" onChange={setField("itc_igst")} />
          <NumIn label="ITC CGST" onChange={setField("itc_cgst")} />
          <NumIn label="ITC SGST" onChange={setField("itc_sgst")} />
          <NumIn label="ITC Cess" onChange={setField("itc_cess")} />
          <NumIn label="RCM taxable" onChange={setField("rcm_taxable")} />
          <NumIn label="RCM IGST" onChange={setField("rcm_igst")} />
          <NumIn label="RCM CGST" onChange={setField("rcm_cgst")} />
          <NumIn label="RCM SGST" onChange={setField("rcm_sgst")} />
          <NumIn label="Interest" onChange={setField("interest")} />
          <NumIn label="Late fee" onChange={setField("late_fee")} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Reverse charge = import of services (e.g. AWS, OpenAI, Anthropic, Groq, Resend). It is payable in cash and also claimable as ITC. Press Preview after editing.
        </p>
      </div>

      {err ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{err}</p> : null}

      {summary ? (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Stat label="GSTIN" value={summary.gstin} mono />
            <Stat label="Period" value={`${summary.period} (FP ${summary.fp})`} />
            <Stat label="3.1(a) Taxable" value={rupees(summary.outward_taxable)} />
            <Stat label="3.1(b) Zero-rated" value={rupees(summary.zero_rated_value)} />
            <Stat label="Output IGST" value={rupees(summary.output_igst)} />
            <Stat label="Output CGST" value={rupees(summary.output_cgst)} />
            <Stat label="Output SGST" value={rupees(summary.output_sgst)} />
            <Stat label="3.2 Inter-state B2C" value={rupees(summary.inter_unreg_value)} />
          </div>

          <div className="rounded-lg border border-border/60 bg-background p-3">
            <div className="mb-2 text-xs font-semibold">Net tax payable in cash (after credit set-off)</div>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <Stat label="Cash IGST" value={rupees(summary.cash_igst)} />
              <Stat label="Cash CGST" value={rupees(summary.cash_cgst)} />
              <Stat label="Cash SGST" value={rupees(summary.cash_sgst)} />
              <Stat label="Total cash" value={rupees(summary.cash_this_month)} />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Set-off uses IGST credit first, then CGST/SGST against their own head. The portal performs the final authoritative set-off.
            </p>
          </div>

          {recon ? (
            <div
              className={`rounded-lg border p-3 ${
                recon.matches
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              <div className={`text-xs font-semibold ${recon.matches ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
                {recon.matches ? "Reconciled with GSTR-1 ✓" : "Reconciliation check"}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{recon.note}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function NumIn({ label, onChange }: { label: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="flex flex-col text-[11px] text-muted-foreground">
      {label}
      <input
        type="number"
        min="0"
        step="0.01"
        onChange={onChange}
        placeholder="0.00"
        className="mt-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
      />
    </label>
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
