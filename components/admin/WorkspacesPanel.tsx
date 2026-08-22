"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminApi,
  type AdminInstance,
  type AdminInstanceEvent,
  type ServerReconciliation,
  type WorkspaceResetResult,
} from "@/lib/adminApi";
import { AsyncState } from "./ui";
import { stateBadgeClass, isWorkingState } from "@/lib/instanceState";
import { timeAgo } from "@/lib/format";
import { usePoll } from "@/hooks/usePoll";

// What the operator can see about managed workspaces.
//
// The data existed and there was no way to look at it without curl. That matters
// most in the one situation this is for: a provision that has stopped, where the
// question is which step failed and what it said, and the answer was sitting in a
// column nobody could reach.

const POLL_MS = 20000;



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

  // Which states count as mid-flight is one definition now, shared with the
  // customer's view; the list used to be spelled out here and could drift.
  usePoll((rows ?? []).some((r) => isWorkingState(r.state)), POLL_MS, load);

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
        <ReconcileButton />
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
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateBadgeClass(r.state)}`}>
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

                  {/* Seats, and only for workspaces we run. Never counted reads
                      differently from counted and empty, so an uncounted
                      workspace says nothing rather than showing a zero. */}
                  {typeof r.seats_total === "number" && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{r.seats_total}</span>
                      {r.seats_total === 1 ? " person" : " people"}
                      {typeof r.seats_active_30d === "number" && (
                        <>
                          {", "}
                          <span className="font-medium text-foreground">{r.seats_active_30d}</span>
                          {" active in 30 days"}
                        </>
                      )}
                      {r.seats_counted_at ? ` · counted ${timeAgo(r.seats_counted_at)}` : ""}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.server_ip ? `${r.provider} ${r.provider_ref} (${r.server_ip})` : "no machine yet"}
                    {" · "}
                    {r.tier}
                    {" · updated "}
                    {timeAgo(r.updated_at)}
                    {r.next_action_at ? ` · next action ${timeAgo(r.next_action_at)}` : ""}
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
                  <ResetPasswordButton
                    id={r.id}
                    address={r.custom_domain || r.slug}
                    /* Terminated keeps its server_ip, and that machine was wiped
                       and released — it may be running somebody else's workspace
                       now. The backend refuses it too; this stops the click. */
                    hasServer={Boolean(r.server_ip) && r.state !== "terminated"}
                  />
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

/**
 * The support answer to "I have lost my workspace login".
 *
 * IT IS NOT A RESEND, and the wording says so, because that is what an operator
 * will be asked for and it is the one thing that cannot be done: the workspace
 * password is delivered once and never stored anywhere we can read. This mints a
 * new one-time link on the customer's machine and mails it to them.
 *
 * CONFIRMED FIRST. It sends mail to a customer, and an outward-facing action one
 * misclick away from a row of Step buttons is one that will eventually be clicked
 * by accident.
 */
function ResetPasswordButton({
  id,
  address,
  hasServer,
}: {
  id: string;
  address: string;
  hasServer: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<WorkspaceResetResult | null>(null);
  const [error, setError] = useState("");

  async function issue() {
    if (!window.confirm(`Email a password reset link to the owner of ${address}?`)) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      setResult(await adminApi.resetWorkspacePassword(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not issue a reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => void issue()}
        disabled={busy || !hasServer}
        title={hasServer ? "" : "No machine to act on: not built yet, or terminated and released"}
        className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
      >
        {busy ? "…" : "Reset password"}
      </button>

      {error && <span className="max-w-xs text-right text-xs text-rose-600">{error}</span>}

      {result && (
        <div className="max-w-xs space-y-1 text-right text-xs">
          <p className={result.emailed ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}>
            {result.emailed ? `Link emailed to ${result.email}` : `Link created but NOT emailed to ${result.email}`}
          </p>
          {/* Shown whether or not the mail went, because a customer locked out of
              their workspace may be locked out of their mail as well. */}
          <p className="break-all font-mono text-[11px] text-muted-foreground">{result.link}</p>
          {result.needs_second_factor && (
            <div className="space-y-1 text-amber-700 dark:text-amber-300">
              <p>
                This account has two-factor turned on, so the link alone will not sign them in. They need a
                recovery code first.
              </p>
              {/* Offered only once a reset has reported it, so the destructive option
                  appears at the moment it is the answer rather than sitting next to
                  every workspace waiting to be clicked. */}
              <ClearTwoFactorButton id={id} address={address} />
            </div>
          )}
          {result.notes && <p className="text-muted-foreground">{result.notes}</p>}
        </div>
      )}
    </div>
  );
}

/**
 * The last resort, for when the authenticator AND every recovery code are gone.
 *
 * Never a side effect of the reset above. "I lost my phone, please turn off my
 * second factor" is the oldest pretext in support, and folding this into a password
 * reset would make every recovery a full account takeover for anyone who asked.
 */
function ClearTwoFactorButton({ id, address }: { id: string; address: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function clear() {
    if (
      !window.confirm(
        `Turn OFF two-factor for the admin of ${address}?\n\nOnly do this if they have lost their authenticator AND all recovery codes, and you are sure who you are talking to.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      setDone(await adminApi.clearWorkspace2FA(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not clear two-factor");
    } finally {
      setBusy(false);
    }
  }

  if (done) return <p className="text-emerald-700 dark:text-emerald-300">{done}</p>;

  return (
    <>
      <button
        onClick={() => void clear()}
        disabled={busy}
        className="btn-ghost px-2 py-1 text-[11px] disabled:opacity-40"
      >
        {busy ? "…" : "Clear two-factor"}
      </button>
      {error && <p className="text-rose-600">{error}</p>}
    </>
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
          <span className="ml-2 text-xs text-muted-foreground">{timeAgo(e.created_at)}</span>
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


// Where our record and the OVH account disagree.
//
// On demand rather than always on screen: it costs an API call, and the answer is
// only interesting when something looks wrong or when somebody is wondering what
// they are paying for.
function ReconcileButton() {
  const [res, setRes] = useState<ServerReconciliation | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    try {
      setRes(await adminApi.reconcileServers());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not reach OVH");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button onClick={run} disabled={busy} className="btn-ghost px-3 py-2 text-xs disabled:opacity-40">
        {busy ? "…" : "Check OVH account"}
      </button>
      {err && <span className="text-xs text-rose-600 dark:text-rose-400">{err}</span>}
      {res && (
        <div className="mt-3 w-full space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          {res.lost.length > 0 && (
            <div>
              <p className="font-medium text-rose-700 dark:text-rose-300">
                A workspace machine is missing at OVH
              </p>
              <p className="text-xs text-muted-foreground">
                The workspace still reads as running here, so nothing else will notice. Its
                data was on that machine.
              </p>
              <p className="mt-1 font-mono text-xs">{res.lost.join(", ")}</p>
            </div>
          )}
          {res.vanished.length > 0 && (
            <div>
              <p className="font-medium text-foreground/80">Removed from the pool: gone at OVH</p>
              <p className="mt-1 font-mono text-xs">{res.vanished.join(", ")}</p>
            </div>
          )}
          {res.unused.length > 0 && (
            <div>
              <p className="font-medium text-foreground/80">Provisioned by OneMana, no longer used</p>
              <p className="mt-1 font-mono text-xs">{res.unused.join(", ")}</p>
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                Each of these ran a workspace that has since been terminated, and is still
                billing. Check before cancelling: a machine also looks like this in the
                minutes between buying it and adding it to the pool.
              </p>
            </div>
          )}
          {/* Shown, never alerted on. These are the operator's own machines, and
              naming them in an email every month is what made that alert ignorable. */}
          {res.foreign.length > 0 && (
            <div>
              <p className="font-medium text-foreground/80">Other machines on this account</p>
              <p className="mt-1 font-mono text-xs">{res.foreign.join(", ")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                OneMana has never provisioned these, so they are yours to manage. Listed for
                completeness only; you will not be emailed about them.
              </p>
            </div>
          )}
          {res.lost.length === 0 && res.vanished.length === 0 && res.unused.length === 0 && (
            <p className="text-muted-foreground">
              Nothing to act on. Your OVH account and OneMana agree.
            </p>
          )}
        </div>
      )}
    </>
  );
}