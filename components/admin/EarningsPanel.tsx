"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type EarningsSummary, type TaxPayment } from "@/lib/adminApi";
import { formatINR, formatDate } from "@/lib/format";

const inputCls =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-brand/30 bg-brand/[0.07]" : "border-white/10 bg-white/[0.03]"}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function EarningsPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [payments, setPayments] = useState<TaxPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([adminApi.earnings(from || undefined, to || undefined), adminApi.taxPayments()])
      .then(([e, p]) => {
        setData(e);
        setPayments(p);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  // Add-payment form state.
  const [fy, setFy] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState("gst");
  const [period, setPeriod] = useState("");
  const [paidOn, setPaidOn] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();
    const rupees = parseFloat(amount);
    if (!fy.trim() || Number.isNaN(rupees) || rupees <= 0 || !paidOn) {
      window.alert("Enter financial year, a positive amount, and the paid-on date.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createTaxPayment({
        financial_year: fy.trim(),
        amount: Math.round(rupees * 100),
        kind,
        period: period.trim(),
        paid_on: paidOn,
        reference: reference.trim(),
        note: note.trim(),
      });
      setFy(""); setAmount(""); setKind("gst"); setPeriod(""); setPaidOn(""); setReference(""); setNote("");
      load();
    } catch {
      window.alert("Failed to add payment.");
    } finally {
      setSaving(false);
    }
  }

  async function removePayment(id: string) {
    if (!window.confirm("Delete this tax payment record?")) return;
    try {
      await adminApi.deleteTaxPayment(id);
      load();
    } catch {
      window.alert("Failed to delete.");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </label>
        {(from || to) && (
          <button onClick={() => { setFrom(""); setTo(""); }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10">
            All time
          </button>
        )}
      </div>

      {loading && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
      {error && (
        <div className="py-8 text-center text-sm">
          <p className="text-red-400">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 px-4 py-2 text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Gross revenue" value={formatINR(data.gross)} hint={`${data.count} invoice${data.count === 1 ? "" : "s"}${data.refunded_count ? ` · ${data.refunded_count} refunded` : ""}`} accent />
            <StatCard label="Taxable value" value={formatINR(data.taxable)} />
            <StatCard label="GST collected" value={formatINR(data.total_gst)} hint={`CGST ${formatINR(data.cgst)} · SGST ${formatINR(data.sgst)} · IGST ${formatINR(data.igst)}`} />
            <StatCard label="GST remitted" value={formatINR(data.total_gst_paid)} hint={`Outstanding ${formatINR(data.total_gst - data.total_gst_paid)}`} />
          </div>

          {data.refunded_count > 0 && (
            <p className="text-xs text-slate-500">
              Net of {data.refunded_count} refunded order{data.refunded_count === 1 ? "" : "s"} ({formatINR(data.refunded_amount)}), which are excluded from revenue and GST above. Record a credit note with your CA to reconcile GST filings.
            </p>
          )}

          {/* Per-financial-year breakdown */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Financial Year</th>
                  <th className="px-3 py-2.5 font-semibold">Invoices</th>
                  <th className="px-3 py-2.5 font-semibold">Gross</th>
                  <th className="px-3 py-2.5 font-semibold">Taxable</th>
                  <th className="px-3 py-2.5 font-semibold">GST collected</th>
                  <th className="px-3 py-2.5 font-semibold">GST remitted</th>
                  <th className="px-3 py-2.5 font-semibold">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {(data.by_fy ?? []).length === 0 ? (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-500">No earnings in this range.</td></tr>
                ) : (
                  (data.by_fy ?? []).map((fyRow) => (
                    <tr key={fyRow.financial_year} className="border-t border-white/5">
                      <td className="px-3 py-2.5 font-medium text-white">{fyRow.financial_year}</td>
                      <td className="px-3 py-2.5 text-slate-400">{fyRow.count}</td>
                      <td className="px-3 py-2.5 text-slate-300">{formatINR(fyRow.gross)}</td>
                      <td className="px-3 py-2.5 text-slate-300">{formatINR(fyRow.taxable)}</td>
                      <td className="px-3 py-2.5 text-slate-300">{formatINR(fyRow.total_gst)}</td>
                      <td className="px-3 py-2.5 text-slate-300">{formatINR(fyRow.gst_paid)}</td>
                      <td className={`px-3 py-2.5 font-medium ${fyRow.gst_outstanding > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                        {formatINR(fyRow.gst_outstanding)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tax payment ledger */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-white">Tax filings &amp; payments</h3>
            <p className="mt-1 text-xs text-slate-500">Record what you remit so you can reconcile collected vs paid. GST is monthly; MCA/ROC is annual — use the Period field (e.g. &quot;Jun 2026&quot; or &quot;FY 2026-27&quot;).</p>

            <form onSubmit={addPayment} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
              <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputCls}>
                <option value="gst">GST (monthly)</option>
                <option value="mca">MCA / ROC (annual)</option>
                <option value="income_tax">Income tax</option>
                <option value="tds">TDS</option>
                <option value="other">Other</option>
              </select>
              <input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Period e.g. Jun 2026" className={inputCls} />
              <input value={fy} onChange={(e) => setFy(e.target.value)} placeholder="FY e.g. 2026-27" className={inputCls} />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount ₹" type="number" min="0" step="0.01" className={inputCls} />
              <input value={paidOn} onChange={(e) => setPaidOn(e.target.value)} type="date" className={inputCls} />
              <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ref / challan no" className={inputCls} />
              <button type="submit" disabled={saving} className="btn-primary px-4 py-2 text-sm">
                {saving ? "Adding…" : "Add"}
              </button>
            </form>

            <div className="mt-5 space-y-2">
              {payments.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">No payments recorded yet.</p>
              ) : (
                payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium text-white">{formatINR(p.amount)}</span>
                      <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase text-slate-400">{p.kind}</span>
                      {p.period && <span className="ml-2 text-slate-400">{p.period}</span>}
                      <span className="ml-2 text-slate-500">{p.financial_year}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(p.paid_on)}</span>
                      {p.reference && <span className="truncate">{p.reference}</span>}
                      <button onClick={() => removePayment(p.id)} className="text-red-300 hover:underline">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
