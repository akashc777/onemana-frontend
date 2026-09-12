"use client";

/**
 * The addresses visitors gave us.
 *
 * WHY THIS EXISTS. The capture form has been live on the home page, the buy page,
 * every blog post and inside the demo, and there was no way to see what it
 * collected. The only number anywhere was a count folded into the metrics
 * roll-up, which cannot answer the question that decides what to do next:
 * WHICH placement produced an address. A form nobody fills in and a form nobody
 * sees produce the same total.
 *
 * Opt-outs and people who have since bought are shown rather than filtered.
 * The broadcast query hides both on purpose, because it is deciding who receives
 * mail; an operator is asking a different question and needs exactly those two
 * groups, since one of them is the conversion and the other is the warning.
 */

import { useEffect, useState } from "react";
import { adminApi, type LeadOverview } from "@/lib/adminApi";

function hostOf(referrer: string): string {
  if (!referrer) return "";
  try {
    return new URL(referrer).host;
  } catch {
    return referrer.slice(0, 40);
  }
}

export function LeadsPanel() {
  const [data, setData] = useState<LeadOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    adminApi
      .leads(200)
      .then((d) => live && setData(d))
      .catch((e: unknown) => live && setError(e instanceof Error ? e.message : "Could not load leads"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return null;

  const sources = Object.entries(data.by_source).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="text-2xl font-semibold tabular-nums">{data.total}</div>
          <div className="text-xs text-muted-foreground">addresses captured</div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="text-2xl font-semibold tabular-nums">{data.reachable}</div>
          <div className="text-xs text-muted-foreground">still reachable</div>
        </div>
        <div className="rounded-2xl border border-border bg-muted/30 p-4">
          <div className="text-2xl font-semibold tabular-nums">
            {data.leads.filter((l) => l.is_customer).length}
          </div>
          <div className="text-xs text-muted-foreground">became customers</div>
        </div>
      </div>

      {/* Which placement works. This is the number that decides where to put the
          form next, and it is the one a total cannot give you. */}
      <div className="mb-5 rounded-2xl border border-border bg-muted/30 p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">Where they came from</p>
        {sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No addresses captured yet. The form is live on the home page, the buy page, every blog
            post and inside the demo, so a zero here is about the offer, not the plumbing.
          </p>
        ) : (
          <div className="space-y-2">
            {sources.map(([src, n]) => (
              <div key={src} className="flex items-center justify-between gap-2 text-sm">
                <span className="font-mono text-xs text-foreground/80">{src}</span>
                <span className="tabular-nums text-muted-foreground">{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted/60">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Email</th>
              <th className="px-3 py-2 text-left font-medium">Source</th>
              <th className="px-3 py-2 text-left font-medium">Referrer</th>
              <th className="px-3 py-2 text-left font-medium">Captured</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nothing captured yet.
                </td>
              </tr>
            ) : (
              data.leads.map((l) => (
                <tr key={l.email} className="border-t border-border/60">
                  <td className="px-3 py-1.5 font-mono text-xs">{l.email}</td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">{l.source || "—"}</td>
                  <td className="px-3 py-1.5 text-xs text-muted-foreground">{hostOf(l.referrer) || "—"}</td>
                  <td className="px-3 py-1.5 text-xs tabular-nums text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-1.5 text-xs">
                    {l.is_customer ? (
                      <span className="text-green-600 dark:text-green-400">customer</span>
                    ) : l.unsubscribed ? (
                      <span className="text-muted-foreground">unsubscribed</span>
                    ) : (
                      <span className="text-foreground/70">reachable</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
