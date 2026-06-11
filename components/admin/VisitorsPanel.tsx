"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { adminApi, type VisitStats } from "@/lib/adminApi";
import { countryName, countryFlag } from "@/lib/geo";

// Map is client-only (react-simple-maps fetches its topojson at runtime).
const VisitorMap = dynamic(() => import("./VisitorMap").then((m) => m.VisitorMap), {
  ssr: false,
  loading: () => <p className="py-16 text-center text-sm text-slate-500">Loading map…</p>,
});

const DEVICE_META: Record<string, { label: string; icon: string }> = {
  desktop: { label: "Desktop", icon: "🖥️" },
  mobile: { label: "Mobile", icon: "📱" },
  tablet: { label: "Tablet", icon: "📟" },
  unknown: { label: "Unknown", icon: "❓" },
};

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

  const daily = data?.daily ?? [];
  const topPaths = data?.top_paths ?? [];
  const byCountry = data?.by_country ?? [];
  const byDevice = data?.by_device ?? [];
  const maxDay = daily.reduce((m, d) => Math.max(m, d.views), 0) || 1;
  const countryTotal = byCountry.reduce((s, c) => s + c.views, 0) || 1;
  const deviceTotal = byDevice.reduce((s, d) => s + d.views, 0) || 1;

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
              {daily.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No visits in this range.</p>
              ) : (
                <div className="space-y-1.5">
                  {daily.map((d) => (
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
              {topPaths.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No data.</p>
              ) : (
                <div className="space-y-2">
                  {topPaths.map((p) => (
                    <div key={p.path} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate font-mono text-xs text-slate-300">{p.path || "/"}</span>
                      <span className="flex-shrink-0 text-slate-400">{p.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Devices */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-sm font-semibold text-white">Devices</p>
            {byDevice.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No data.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {byDevice.map((d) => {
                  const meta = DEVICE_META[d.device] ?? DEVICE_META.unknown;
                  const pct = Math.round((d.views / deviceTotal) * 100);
                  return (
                    <div key={d.device} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          <span className="mr-1.5">{meta.icon}</span>{meta.label}
                        </span>
                        <span className="text-xs text-slate-400">{pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded bg-white/5">
                        <div className="h-full rounded bg-gradient-to-r from-brand to-accent-cyan" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">{d.views.toLocaleString()} views · {d.uniques.toLocaleString()} visitors</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Geography */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
              <p className="mb-3 text-sm font-semibold text-white">Where your visitors are</p>
              {byCountry.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">
                  No geographic data yet. Country is read from the CDN geo header - it populates once the backend is behind a geo-aware proxy (e.g. Cloudflare).
                </p>
              ) : (
                <VisitorMap data={byCountry} />
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="mb-3 text-sm font-semibold text-white">Top countries</p>
              {byCountry.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No data.</p>
              ) : (
                <div className="max-h-[380px] space-y-1.5 overflow-y-auto pr-1">
                  {byCountry.map((c) => {
                    const pct = Math.round((c.views / countryTotal) * 100);
                    return (
                      <div key={c.code} className="flex items-center gap-2 text-sm">
                        <span className="w-6 flex-shrink-0 text-base">{countryFlag(c.code)}</span>
                        <span className="w-28 flex-shrink-0 truncate text-slate-300">{countryName(c.code)}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded bg-white/5">
                          <div className="h-full rounded bg-gradient-to-r from-brand to-accent-cyan" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-10 flex-shrink-0 text-right text-xs text-slate-400">{c.views}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
