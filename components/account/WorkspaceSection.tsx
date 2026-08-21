"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { portalApi, type PortalInstance, type PortalEdition } from "@/lib/portalApi";

// The customer's view of the workspace their subscription bought.
//
// THE NAME FORM BELOW IS THE ONLY THING THE WHOLE FLOW WAITS ON. A subscription is
// charged, an instance is created, and nothing else happens until somebody chooses
// an address, and until this existed there was no way to. The endpoint had been
// there for some time with nothing calling it, which is the same as not having it.

const POLL_MS = 15000;

function badge(state: string) {
  if (state === "live") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (state === "failed") return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (state === "terminated" || state === "exporting") return "bg-slate-500/20 text-foreground/80";
  return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
}

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

  // Polling only while something is actually happening. A live workspace does not
  // change on its own, and a page that keeps asking is a page that keeps costing
  // somebody's battery for no news.
  const anyWorking = (instances ?? []).some((i) => i.working);
  useEffect(() => {
    if (!anyWorking) return;
    const t = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(t);
  }, [anyWorking, load]);

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
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge(inst.state)}`}>
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
