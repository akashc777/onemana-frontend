"use client";

import { useEffect, useState } from "react";
import { adminApi, type AdminMetrics } from "@/lib/adminApi";
import { formatINR } from "@/lib/format";

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${accent ? "border-brand/30 bg-brand/[0.07]" : "border-border bg-muted/30"}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** A funnel step. The drop from the step above is the number worth reading, so
 *  it is shown rather than left to be worked out. */
function Step({ label, value, of, note }: { label: string; value: number; of?: number; note?: string }) {
  const pct = of && of > 0 ? (value / of) * 100 : null;
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex items-baseline gap-2">
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
        {pct !== null && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {pct < 1 && pct > 0 ? pct.toFixed(2) : pct.toFixed(0)}%
          </span>
        )}
        <span className="w-16 text-right text-sm font-semibold tabular-nums text-foreground">
          {value.toLocaleString()}
        </span>
      </span>
    </div>
  );
}

export function MetricsPanel() {
  const [m, setM] = useState<AdminMetrics | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    adminApi
      .metrics()
      .then(setM)
      .catch((e) => setErr(e instanceof Error ? e.message : "could not load metrics"));
  }, []);

  if (err) return <p className="text-sm text-danger">{err}</p>;
  if (!m) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const f = m.funnel;
  const peak = Math.max(1, ...m.months.map((x) => x.visitors));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Money</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Revenue to date"
            value={formatINR(m.revenue.gross_paise)}
            hint={`${m.revenue.paid_orders} paid ${m.revenue.paid_orders === 1 ? "order" : "orders"}`}
            accent
          />
          <Stat
            label="MRR"
            value={formatINR(m.revenue.mrr_paise)}
            hint={`${m.revenue.active_subscriptions} active ${
              m.revenue.active_subscriptions === 1 ? "subscription" : "subscriptions"
            }${m.revenue.cancelling_subscriptions > 0 ? `, ${m.revenue.cancelling_subscriptions} cancelling` : ""}`}
          />
          <Stat label="ARR run rate" value={formatINR(m.revenue.arr_paise)} hint="MRR × 12" />
          <Stat
            label="Average order"
            value={m.revenue.paid_orders > 0 ? formatINR(m.revenue.avg_order_paise) : "—"}
            hint={m.revenue.first_paid_at ? `first sale ${m.revenue.first_paid_at}` : "no sales yet"}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">People</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Paying customers" value={String(m.customers.paying)} hint="orders that took money" accent />
          <Stat
            label="Comped"
            value={String(m.customers.comped)}
            hint="gifted licences, counted separately on purpose"
          />
          <Stat
            label="End users in workspaces"
            value={m.workspaces.workspaces_counted > 0 ? String(m.workspaces.seats_total) : "—"}
            hint={
              m.workspaces.workspaces_counted > 0
                ? `${m.workspaces.seats_active_30d} active in 30 days`
                : "managed workspaces only, none counted yet"
            }
          />
          <Stat
            label="AI agents"
            value={m.workspaces.workspaces_counted > 0 ? String(m.workspaces.bots_total) : "—"}
            hint="never billed as seats"
          />
        </div>
        {m.workspaces.workspaces_counted === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            End-user counts exist for managed workspaces only. Self-hosted installs are never counted: the licence is
            sold with unlimited users and the product makes no outbound call to us.
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Funnel, all time
        </h2>
        <div className="rounded-2xl border border-border bg-muted/30 px-5 py-2">
          <Step label="Unique visitors" value={f.unique_visitors} note={`${f.pageviews.toLocaleString()} views`} />
          <Step label="Reached the buy page" value={f.buy_page_visitors} of={f.unique_visitors} />
          <Step label="Started checkout" value={f.orders_created} of={f.buy_page_visitors} />
          <Step label="Paid something" value={m.revenue.paid_orders} of={f.orders_created} />
          <Step label="Licences issued" value={f.licences_issued} note="incl. gifts and tests" />
          <Step label="Reported an install" value={f.licences_installed} of={f.licences_issued} />
          <Step
            label="Paying customers who installed"
            value={f.paid_licences_installed}
            of={f.paid_licences}
            note={`of ${f.paid_licences} paid ${f.paid_licences === 1 ? "licence" : "licences"}`}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Installs are a floor, not a census: an install that never reached us looks the same as one that never
          happened.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">By month</h2>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[30rem] text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Month</th>
                <th className="px-4 py-2 text-right font-medium">Visitors</th>
                <th className="px-4 py-2 text-right font-medium">Paid orders</th>
                <th className="px-4 py-2 text-right font-medium">Revenue</th>
                <th className="px-4 py-2 text-left font-medium">Traffic</th>
              </tr>
            </thead>
            <tbody>
              {m.months.map((x) => (
                <tr key={x.month} className="border-t border-border">
                  <td className="px-4 py-2 tabular-nums text-foreground">{x.month}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">{x.visitors.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">{x.orders}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-foreground">
                    {x.gross_paise > 0 ? formatINR(x.gross_paise) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <div className="h-2 rounded-full bg-brand/70" style={{ width: `${(x.visitors / peak) * 100}%` }} />
                  </td>
                </tr>
              ))}
              {m.months.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No traffic or orders recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
