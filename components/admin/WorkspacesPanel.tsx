"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminInstance, type AdminInstanceEvent } from "@/lib/adminApi";
import { AsyncState } from "./ui";

// What the operator can see about managed workspaces.
//
// The data existed and there was no way to look at it without curl. That matters
// most in the one situation this is for: a provision that has stopped, where the
// question is which step failed and what it said, and the answer was sitting in a
// column nobody could reach.

const POLL_MS = 20000;

function badge(state: string) {
  if (state === "live") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (state === "failed") return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (state === "awaiting_hardware") return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  if (state === "terminated" || state === "exporting") return "bg-slate-500/20 text-foreground/80";
  return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
}

function ago(iso?: string | null) {
  if (!iso) return "";
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function WorkspacesPanel() {
  const [rows, setRows] = useState<AdminInstance[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await adminApi.instances());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load workspaces");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Polls only while something is mid-flight, so an idle admin page is idle.
  const working = (rows ?? []).some((r) =>
    ["adopting", "provisioning", "verifying", "migrating"].includes(r.state),
  );
  useEffect(() => {
    if (!working) return;
    const t = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(t);
  }, [working, load]);

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    setNote("");
    try {
      const out = await fn();
      setNote(typeof out === "object" && out ? JSON.stringify(out) : `${label} done`);
      await load();
    } catch (e) {
      setNote(e instanceof Error ? e.message : `${label} failed`);
    } finally {
      setBusy("");
    }
  }

  if (!rows || error) return <AsyncState loading={!rows && !error} error={error} onRetry={load} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => void run("Sweep", () => adminApi.sweepServers())}
          disabled={busy !== ""}
          className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
        >
          {busy === "Sweep" ? "…" : "Look for a delivered server"}
        </button>
        <button onClick={() => void load()} className="btn-ghost px-3 py-2 text-xs">
          Refresh
        </button>
        {note && <span className="text-xs text-muted-foreground">{note}</span>}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No managed workspaces yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{r.custom_domain || r.slug}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge(r.state)}`}>
                      {r.state}
                    </span>
                    {r.attempts > 0 && (
                      <span className="text-xs text-amber-700 dark:text-amber-300">
                        {r.attempts} failed {r.attempts === 1 ? "attempt" : "attempts"}
                      </span>
                    )}
                  </div>

                  {/* The reason, which the customer is deliberately not shown. */}
                  {r.state_detail && (
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {r.failed_check && <span className="font-medium">{r.failed_check}: </span>}
                      {r.state_detail}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.server_ip ? `${r.provider} ${r.provider_ref} (${r.server_ip})` : "no machine yet"}
                    {" · "}
                    {r.tier}
                    {" · updated "}
                    {ago(r.updated_at)}
                    {r.next_action_at ? ` · next action ${ago(r.next_action_at)}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => void run("Step", () => adminApi.stepInstance(r.id))}
                    disabled={busy !== ""}
                    className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
                  >
                    Step now
                  </button>
                  <button
                    onClick={() => setOpen(open === r.id ? null : r.id)}
                    className="btn-ghost px-3 py-2 text-xs"
                  >
                    {open === r.id ? "Hide history" : "History"}
                  </button>
                </div>
              </div>

              {open === r.id && <Timeline id={r.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Timeline({ id }: { id: string }) {
  const [events, setEvents] = useState<AdminInstanceEvent[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi
      .instanceEvents(id)
      .then(setEvents)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load history"));
  }, [id]);

  if (error) return <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>;
  if (!events) return <p className="mt-3 text-sm text-muted-foreground">Loading history…</p>;
  if (events.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">Nothing recorded yet.</p>;
  }

  return (
    <ol className="mt-4 space-y-2 border-l border-border pl-4">
      {events.map((e) => (
        <li key={e.id} className="text-sm">
          <span className="text-foreground/80">
            {e.from_state} → {e.to_state}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">{ago(e.created_at)}</span>
          {e.detail && (
            <p className="mt-0.5 break-words text-xs text-muted-foreground">
              {e.step && <span className="font-medium">{e.step}: </span>}
              {e.detail}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
