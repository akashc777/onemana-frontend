"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type ServerOrderPreview, type ServerOrderRow } from "@/lib/adminApi";

// What a new customer's machine would cost right now, and the margin it leaves.
//
// Auto-order buys the cheapest in-stock machine that keeps the margin floor,
// priced from the OVH account's own catalogue. This is the same decision made
// on demand: the machine it would pick, what it costs a month with tax, and
// how that compares with the floor and the target. Priced through the real
// cart and never bought.

const SIZES = ["team", "business"] as const;

function marginTone(p: ServerOrderPreview): string {
  if (p.margin_pct === undefined) return "text-muted-foreground";
  if (p.margin_pct >= p.target_pct) return "text-emerald-700 dark:text-emerald-300";
  if (p.margin_pct >= p.floor_pct) return "text-amber-700 dark:text-amber-300";
  return "text-rose-700 dark:text-rose-300";
}

function PreviewCard({ p }: { p: ServerOrderPreview }) {
  const refused = (p.skipped ?? []).filter((s) => !/not sold to this account/.test(s));
  return (
    <div className="card space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold capitalize text-foreground">{p.size}</span>
        {p.margin_pct !== undefined && (
          <span className={`text-sm font-semibold tabular-nums ${marginTone(p)}`}>{p.margin_pct}% margin</span>
        )}
      </div>
      {p.offer ? (
        <>
          <p className="text-sm text-foreground/80">
            {p.offer.PlanCode} · {p.offer.Memory.replace(/^ram-/, "")} · {p.offer.Storage} in {p.offer.Datacenter.toUpperCase()}
          </p>
          <p className="text-xs text-muted-foreground">
            {p.monthly_text ? `${p.monthly_text} a month with tax` : "monthly cost unknown"}
            {p.order?.PriceText ? ` · first order ${p.order.PriceText} (month and setup)` : ""}
          </p>
        </>
      ) : (
        <p className="text-sm text-rose-700 dark:text-rose-300">Nothing would be bought: {p.reason || "no reason given"}</p>
      )}
      <p className="text-xs text-muted-foreground">
        Floor {p.floor_pct}% · target {p.target_pct}%
      </p>
      {refused.length > 0 && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer">Passed over ({refused.length})</summary>
          <ul className="mt-1 space-y-0.5">
            {refused.slice(0, 12).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function MachinesPanel() {
  const [previews, setPreviews] = useState<ServerOrderPreview[] | null>(null);
  const [orders, setOrders] = useState<ServerOrderRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [p, o] = await Promise.all([Promise.all(SIZES.map((s) => adminApi.serverOrderPreview(s))), adminApi.serverOrders()]);
      setPreviews(p);
      setOrders(o.slice(0, 8));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not price machines");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Machines and margin</h2>
        <button onClick={() => void load()} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">
          {busy ? "Pricing…" : "Price again"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {previews && (
        <div className="grid gap-3 sm:grid-cols-2">
          {previews.map((p) => (
            <PreviewCard key={p.size} p={p} />
          ))}
        </div>
      )}
      {orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-3 font-medium">Placed</th>
                <th className="py-1 pr-3 font-medium">Size</th>
                <th className="py-1 pr-3 font-medium">Machine</th>
                <th className="py-1 pr-3 font-medium">Price</th>
                <th className="py-1 font-medium">State</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-border" title={o.detail}>
                  <td className="py-1 pr-3">{new Date(o.placed_at).toLocaleDateString()}</td>
                  <td className="py-1 pr-3 capitalize">{o.size}</td>
                  <td className="py-1 pr-3">{o.server_name || `${o.plan_code} in ${o.datacenter}`}</td>
                  <td className="py-1 pr-3">{o.price_text}</td>
                  <td className="py-1">{o.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
