"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type VisitStats } from "@/lib/adminApi";

const inputCls =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function VisitorsPanel() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .visitStats(from || undefined, to || undefined)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDay = data?.daily.reduce((m, d) => Math.max(m, d.views), 0) || 1;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end gap-3">
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
            Reset (last 30 days)
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Total views" value={data.total_views.toLocaleString()} />
            <StatCard label="Unique visitors" value={data.unique_visitors.toLocaleString()} />
            <StatCard
              label="Views / visitor"
              value={data.unique_visitors ? (data.total_views / data.unique_visitors).toFixed(1) : "0"}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Daily traffic</p>
              {data.daily.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No visits in this range.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.daily.map((d) => (
                    <div key={d.date} className="flex items-center gap-2 text-xs">
                      <span className="w-20 flex-shrink-0 text-slate-500">{d.date.slice(5)}</span>
                      <div className="h-4 flex-1 overflow-hidden rounded bg-white/5">
                        <div className="h-full rounded bg-gradient-to-r from-brand to-accent-cyan" style={{ width: `${(d.views / maxDay) * 100}%` }} />
                      </div>
                      <span className="w-16 flex-shrink-0 text-right text-slate-400">{d.views} / {d.uniques}u</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-3 text-[10px] text-slate-600">views / unique visitors per day</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Top pages</p>
              {data.top_paths.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No data.</p>
              ) : (
                <div className="space-y-2">
                  {data.top_paths.map((p) => (
                    <div key={p.path} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-mono text-xs text-slate-300">{p.path || "/"}</span>
                      <span className="flex-shrink-0 text-slate-400">{p.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
