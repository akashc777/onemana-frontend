"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  portalApi,
  type PortalInstance,
  type PortalEdition,
  type PortalDomainPlan,
} from "@/lib/portalApi";
import { stateBadgeClass } from "@/lib/instanceState";
import { usePoll } from "@/hooks/usePoll";

// The customer's view of the workspace their subscription bought.
//
// THE NAME FORM BELOW IS THE ONLY THING THE WHOLE FLOW WAITS ON. A subscription is
// charged, an instance is created, and nothing else happens until somebody chooses
// an address, and until this existed there was no way to. The endpoint had been
// there for some time with nothing calling it, which is the same as not having it.

const POLL_MS = 15000;


export function WorkspaceSection({ onReload }: { onReload: () => void }) {
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

  // The backend says which instances are still moving, so this never has to guess.
  usePoll((instances ?? []).some((i) => i.working), POLL_MS, load);

  if (err) return <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>;
  if (!instances) return <p className="text-sm text-muted-foreground">Loading your workspace…</p>;
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
            {inst.edition} · {inst.has_ai ? "with AI" : "without AI"}
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

      {inst.working && (
        <p className="text-xs text-muted-foreground">
          This usually takes under an hour. We will email you when it is ready, and there
          is nothing for you to do until then.
        </p>
      )}

      {inst.state === "failed" && (
        <p className="text-sm text-muted-foreground">
          Something went wrong and we have been alerted. We retry automatically, and will
          email you when it is sorted.
        </p>
      )}

      {inst.state === "live" && <UseOwnDomain inst={inst} onChanged={onChanged} />}
    </div>
  );
}

// Moving a live workspace to a domain the customer already owns.
//
// SHOWN ONLY ONCE LIVE, because the move reconfigures a running workspace and
// there is nothing to move until there is one. Nothing here is started by opening
// it: the first step describes what the change would involve, so somebody can see
// the seven records they would have to create before committing a working
// workspace to a change they may not finish.
function UseOwnDomain({ inst, onChanged }: { inst: PortalInstance; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState<PortalDomainPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");

  async function preview(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setNote("");
    try {
      setPlan(await portalApi.planDomain(inst.id, "custom", domain.trim(), true));
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not check that domain.");
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    setBusy(true);
    setErr("");
    try {
      await portalApi.planDomain(inst.id, "custom", domain.trim(), false);
      setNote("Started. Add the records below, then use Check records.");
      onChanged();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not start that change.");
    } finally {
      setBusy(false);
    }
  }

  async function check() {
    setBusy(true);
    setErr("");
    try {
      const r = await portalApi.checkDomain(inst.id);
      setNote(r.msg);
      onChanged();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Could not check those records.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-brand underline underline-offset-4">
        Use my own domain
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <form onSubmit={preview} className="space-y-2">
        <label htmlFor="domain" className="block text-sm font-medium text-foreground/80">
          Your domain
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value.toLowerCase())}
            placeholder="acme.com"
            autoComplete="off"
            spellCheck={false}
            className="w-full max-w-xs rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={busy || domain.trim().length < 3}
            className="btn-ghost px-3 py-2 text-sm disabled:opacity-40"
          >
            {busy ? "…" : "Show me what is involved"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Nothing changes until you say so. Your current address keeps working either way.
        </p>
      </form>

      {err && <p className="text-sm text-rose-600 dark:text-rose-400">{err}</p>}
      {note && <p className="text-sm text-emerald-700 dark:text-emerald-300">{note}</p>}

      {plan?.dns_records && plan.dns_records.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-foreground/80">
            Create these records with whoever runs your DNS. Your workspace will be at{" "}
            <span className="font-medium">{plan.to_domain}</span>.
          </p>
          {plan.verify_token && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-3 py-2 font-medium">TXT</td>
                    <td className="px-3 py-2 font-mono">_onecamp-verify.{plan.to_domain.split(".").slice(-2).join(".")}</td>
                    <td className="px-3 py-2 font-mono break-all">{plan.verify_token}</td>
                    <td className="px-3 py-2 text-muted-foreground">proves it is yours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Host</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Proxy</th>
                </tr>
              </thead>
              <tbody>
                {plan.dns_records.map((r) => (
                  <tr key={r.host} className="border-t border-border">
                    <td className="px-3 py-2 font-mono">{r.type}</td>
                    <td className="px-3 py-2 font-mono break-all">{r.host}</td>
                    <td className="px-3 py-2 font-mono break-all">{r.value}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {r.proxied ? "either" : "DNS only"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            The rows marked DNS only must not be proxied. Calls will not connect if they are.
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={start} disabled={busy} className="btn-ghost px-3 py-2 text-sm disabled:opacity-40">
              I have added them, start the move
            </button>
            <button onClick={check} disabled={busy} className="btn-ghost px-3 py-2 text-sm disabled:opacity-40">
              Check records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// The one decision a subscriber makes.
function ChooseAddress({ inst, onChanged }: { inst: PortalInstance; onChanged: () => void }) {
  const [slug, setSlug] = useState("");
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
        setEdition(list.find((e) => e.default)?.name ?? list[0]?.name ?? "");
      })
      .catch(() => setEditions([]));
  }, []);

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
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="your-company"
            autoComplete="off"
            spellCheck={false}
            className="w-full max-w-xs rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <span className="text-sm text-muted-foreground">.onemana.dev</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Letters, numbers and hyphens. You can move to your own domain later.
        </p>
      </div>

      {editions.length > 1 && (
        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-foreground/80">Edition</legend>
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
                <span>
                  <span className="font-medium">{e.name}</span>{" "}
                  <span className="text-muted-foreground">
                    {e.has_ai ? "with AI features" : "without AI"}
                  </span>
                </span>
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
