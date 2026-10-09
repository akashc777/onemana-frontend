"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { seatsLine } from "@/lib/seatsLine";
import { diskLine } from "@/lib/diskLine";
import { backupLine } from "@/lib/backupLine";
import { capacityLine } from "@/lib/capacityLine";
import { moveLine, sizeLabel } from "@/lib/moveLine";
import { StorageAddon } from "@/components/account/StorageAddon";
import {
  portalApi,
  type PortalInstance,
  type PortalEdition,
  type PortalSubscription,
} from "@/lib/portalApi";
import { failedLine, paidWithoutWorkspace, stateBadgeClass } from "@/lib/instanceState";
import { WORKSPACE_ZONE, editionLabel, slugFromInput } from "@/lib/workspaceAddress";
import { usePoll } from "@/hooks/usePoll";

// The customer's view of the workspace their subscription bought.
//
// THE NAME FORM BELOW IS THE ONLY THING THE WHOLE FLOW WAITS ON. A subscription is
// charged, an instance is created, and nothing else happens until somebody chooses
// an address, and until this existed there was no way to. The endpoint had been
// there for some time with nothing calling it, which is the same as not having it.

const POLL_MS = 15000;


export function WorkspaceSection({
  onReload,
  subscriptions = [],
}: {
  onReload: () => void;
  /** The account's subscriptions, to tell "no workspace" from "not created yet". */
  subscriptions?: PortalSubscription[];
}) {
  const [instances, setInstances] = useState<PortalInstance[] | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      setInstances(await portalApi.instances());
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load your workspace.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Paid for, and not created yet: the payment's webhook is on its way, or being
  // recovered from Razorpay. Said, and looked for again, rather than shown as nothing.
  const onItsWay = instances !== null && paidWithoutWorkspace(subscriptions, instances.length);

  // The backend says which instances are still moving, so this never has to guess.
  usePoll((instances ?? []).some((i) => i.working) || onItsWay, POLL_MS, load);

  if (err) return <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>;
  if (!instances) return <p className="text-sm text-muted-foreground">Loading your workspace…</p>;
  if (onItsWay) {
    return (
      <section className="card">
        <h2 className="mb-2 font-semibold text-foreground">Your workspace</h2>
        <p className="text-sm text-muted-foreground">
          Your payment has reached us and your workspace is being set up. It appears here within a few
          minutes, and this page checks by itself.
        </p>
      </section>
    );
  }
  // Nothing to say to a customer who has no managed workspace, and most do not.
  if (instances.length === 0) return null;

  return (
    <section className="card">
      <h2 className="mb-4 font-semibold text-foreground">Your workspace</h2>
      <div className="space-y-6">
        {instances.map((inst) => (
          <Workspace
            key={inst.id}
            inst={inst}
            onChanged={() => {
              void load();
              onReload();
            }}
          />
        ))}
      </div>
    </section>
  );
}

/** Fetches a short-lived link on click and opens it. The link is signed per
 *  request, so nothing about the store is in the page until the owner asks. */
function BackupDownload({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <button
        type="button"
        disabled={busy}
        className="font-medium text-brand underline underline-offset-4 disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          setErr("");
          try {
            const link = await portalApi.backupLink(id);
            window.location.assign(link.url);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "The download could not be prepared.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Preparing download…" : "Download the copy"}
      </button>
      {err && <span className="ml-2 text-destructive">{err}</span>}
    </>
  );
}

/** Starts a ready move at once. The workspace pauses for the copy, so the
 *  owner confirms first. */
function MoveNowButton({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <>
      <button
        type="button"
        disabled={busy}
        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
        onClick={async () => {
          if (!window.confirm("Move now? Your workspace pauses while the last backup is copied and restored, usually 10 to 30 minutes, then carries on at the same address.")) return;
          setBusy(true);
          try {
            setMsg(await portalApi.moveNow(id));
            window.setTimeout(onChanged, 3000);
          } catch (e) {
            setMsg(e instanceof Error ? e.message : "The move could not be started.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Starting…" : "Move now"}
      </button>
      {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
    </>
  );
}

function Workspace({ inst, onChanged }: { inst: PortalInstance; onChanged: () => void }) {
  if (inst.needs_name) return <ChooseAddress inst={inst} onChanged={onChanged} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stateBadgeClass(inst.state)}`}>
          {inst.status}
        </span>
        {inst.edition && (
          <span className="text-xs text-muted-foreground">
            {sizeLabel(inst.size)} · {editionLabel(inst.has_ai)}
          </span>
        )}
      </div>

      {inst.state === "live" ? (
        <p className="text-sm">
          <a
            href={`https://${inst.address}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-brand underline underline-offset-4"
          >
            {inst.address}
          </a>
        </p>
      ) : (
        <p className="text-sm text-foreground/80">{inst.address}</p>
      )}

      {/* Only ever what the backend judged safe to show. */}
      {inst.detail && <p className="text-sm text-muted-foreground">{inst.detail}</p>}

      {inst.state === "live" && seatsLine(inst.seats_used, inst.seats_included, inst.seats_as_of) && (
        <p className="text-sm text-muted-foreground">
          {seatsLine(inst.seats_used, inst.seats_included, inst.seats_as_of)}
        </p>
      )}

      {inst.state === "live" && diskLine(inst.disk_used_pct) && (
        <p className="text-sm text-muted-foreground">{diskLine(inst.disk_used_pct)}</p>
      )}

      {backupLine(inst.backups_nightly, inst.offsite_configured, inst.offsite_backup_at) && (
        <p className="text-sm text-muted-foreground">
          {backupLine(inst.backups_nightly, inst.offsite_configured, inst.offsite_backup_at)}
          {inst.offsite_backup_at && (
            <>
              {" · "}
              <BackupDownload id={inst.id} />
            </>
          )}
        </p>
      )}

      {inst.state === "live" && capacityLine(inst.capacity_verdict, inst.capacity_reason) && (
        <p className="text-sm text-amber-700 dark:text-amber-400">{capacityLine(inst.capacity_verdict, inst.capacity_reason)}</p>
      )}

      {moveLine(inst.move) && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-foreground">{moveLine(inst.move)}</p>
          {inst.move?.can_move_now && <MoveNowButton id={inst.id} onChanged={onChanged} />}
        </div>
      )}

      <StorageAddon inst={inst} onChanged={onChanged} />

      {inst.working && (
        <p className="text-xs text-muted-foreground">
          {inst.estimate && `${inst.estimate} `}
          We will email you when it is ready, and there is nothing for you to do until then.
        </p>
      )}

      {inst.state === "failed" && (
        <p className="text-sm text-muted-foreground">{failedLine(inst.retry_at, inst.max_attempts)}</p>
      )}

      {inst.state === "live" && <UseOwnDomain inst={inst} />}
    </div>
  );
}

// Moving a live workspace to a domain the customer already owns.
//
// SET UP WITH A PERSON FOR NOW. The automated move rewrote the server for the
// new name alone and rebuilt the web app for the old one, so a workspace that
// went through it would have answered on neither; it is being replaced, and the
// backend no longer starts it. Until then the panel says how to get it done
// with us, with the request already written.
function UseOwnDomain({ inst }: { inst: PortalInstance }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-brand underline underline-offset-4">
        Use my own domain
      </button>
    );
  }
  const current = inst.address;
  const subject = `Own domain for ${current}`;
  const body = `Hello,\n\nPlease move my workspace ${current} to: \n(for example team.yourcompany.com)\n`;
  return (
    <div className="mt-2 space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
      <p>
        Moving to your own domain is set up with our help for now. Tell us the address you want, for example{" "}
        <span className="font-mono">team.yourcompany.com</span>, and we do it with you.
      </p>
      <p className="text-muted-foreground">Your {current} address keeps working throughout.</p>
      <a
        href={`mailto:support@onemana.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
        className="btn-ghost inline-block px-3 py-2"
      >
        Write to support@onemana.dev
      </a>
    </div>
  );
}

// The one decision a subscriber makes.
function ChooseAddress({ inst, onChanged }: { inst: PortalInstance; onChanged: () => void }) {
  // Filled in with what was chosen at checkout, when that could not be given
  // to the workspace as the payment arrived; choice_note says why.
  const [slug, setSlug] = useState(inst.chosen_slug ?? "");
  const [edition, setEdition] = useState("");
  const [editions, setEditions] = useState<PortalEdition[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Offered from the same table the provisioner builds from, so a customer can
    // never pick something that cannot actually be built.
    portalApi
      .editions()
      .then((list) => {
        setEditions(list);
        const chosen = list.find((e) => e.name === inst.chosen_edition);
        setEdition(chosen?.name ?? list.find((e) => e.default)?.name ?? list[0]?.name ?? "");
      })
      .catch(() => setEditions([]));
  }, [inst.chosen_edition]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await portalApi.setAddress(inst.id, slug.trim(), edition);
      onChanged();
    } catch (e2) {
      // The backend's wording is the useful one, because it knows whether the name is
      // taken, reserved, or clashes with another workspace's hostname.
      setErr(e2 instanceof Error ? e2.message : "Could not set that address.");
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="font-medium text-foreground">Choose your workspace address</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          One step left. Everything after this is automatic: we build your workspace and
          email you when it is ready.
        </p>
        {inst.choice_note && (
          <p role="status" className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            {inst.choice_note}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-foreground/80">
          Address
        </label>
        <div className="flex items-center gap-2">
          <input
            id="slug"
            ref={inputRef}
            value={slug}
            onChange={(e) => setSlug(slugFromInput(e.target.value))}
            placeholder="your-company"
            autoComplete="off"
            spellCheck={false}
            className="w-full max-w-xs rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <span className="text-sm text-muted-foreground">.{WORKSPACE_ZONE}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Letters, numbers and hyphens. You can move to your own domain later, with our help.
        </p>
      </div>

      {editions.length > 1 && (
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-foreground/80">AI features</legend>
          <div className="space-y-2">
            {editions.map((e) => (
              <label key={e.name} className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="edition"
                  value={e.name}
                  checked={edition === e.name}
                  onChange={() => setEdition(e.name)}
                  className="mt-1"
                />
                <span className="font-medium">{editionLabel(e.has_ai)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}

      <button
        type="submit"
        disabled={busy || slug.trim().length < 3}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
      >
        {busy ? "Setting up…" : "Create my workspace"}
      </button>
    </form>
  );
}
