"use client";

import { useEffect, useState } from "react";
import { Celebration } from "@/components/site/Celebration";
import { Button } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { trackEvent } from "@/lib/track";
import { freeClaimPayload } from "@/lib/freePlan";
import { installerAsks } from "@/lib/content";

/**
 * The two parts of /free that do something: the command with its one-click
 * key, and the key by email. The rest of the page is drawn on the server
 * (app/free/page.tsx), so these are the only parts that ship JavaScript, and
 * each redraws only itself.
 */

const inputCls =
  "ui-field";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; msg: string };

interface Instant {
  key: string;
  install_command: string;
  seat_limit: number;
}

/**
 * The install command, on the face of the page.
 *
 * The command carries a licence key, and a key is minted per click by the
 * backend (customer and order rows included), so it is not minted on page
 * load for every visitor and crawler. Instead the command's shape is on the
 * page from the start, with the key's place shown, and one click fills it
 * in: no form, no email, no card.
 */
export function FreeCommand() {
  const [instant, setInstant] = useState<Instant | null>(null);
  const [instantBusy, setInstantBusy] = useState(false);
  const [instantError, setInstantError] = useState("");
  const [copied, setCopied] = useState(false);
  // The key types into its place (site.md S11): 18ms a character, never
  // more than 600ms, and all at once for a reader who asked for less motion.
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (!instant) return;
    const n = instant.key.length;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(n);
      return;
    }
    const step = Math.max(1, Math.ceil(n / (600 / 18)));
    const t = window.setInterval(() => setTyped((c) => (c + step >= n ? (window.clearInterval(t), n) : c + step)), 18);
    return () => window.clearInterval(t);
  }, [instant]);

  // The quickest way in: the install command now, no email. The key it uses
  // is tied to no address, so it always installs the free plan.
  const getInstant = async () => {
    setInstantBusy(true);
    setInstantError("");
    try {
      const res = await fetch(`${site.backendUrl}/onecamp/free-license/instant`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.data?.install_command) {
        setInstantError(body?.msg || "We couldn't make your licence just now. Try again in a minute, or use your email instead.");
        return;
      }
      trackEvent("free-instant");
      setInstant(body.data as Instant);
    } catch {
      setInstantError("No connection. Check your network and try again.");
    } finally {
      setInstantBusy(false);
    }
  };

  const copy = async () => {
    if (!instant) return;
    try {
      await navigator.clipboard.writeText(instant.install_command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* the command stays selectable */
    }
  };

  return (
    <div className="in-lift at-120 mt-8 max-w-[760px]">
      {/* The night terminal (site.md S11): the page's anchor, the same in
          both themes, with the key's place ringed in sun until it is filled
          in, and in moss once it is. */}
      <div className="night overflow-hidden rounded-xl shadow-e3">
        <div className="flex h-9 items-center justify-between gap-3 border-b border-border pl-4 pr-1.5">
          <span className="text-caption text-muted-foreground">Run on your server, as root</span>
          {instant ? (
            <button
              type="button"
              onClick={copy}
              // Drawn 28 px tall in the box's header; its hit area reaches
              // 44 px, inside the header's own padding. The inset counts
              // from inside the 1 px border, hence 9 px for 8 around it.
              className="relative inline-flex h-7 items-center gap-1.5 rounded-md bg-white/[0.08] px-2.5 text-caption font-[510] text-foreground transition-colors after:absolute after:-inset-[9px] after:content-[''] hover:bg-white/[0.12]"
            >
              {copied ? (
                <span key="done" className="fx-spring inline-flex items-center gap-1.5 text-camp-moss">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  Copied
                </span>
              ) : (
                "Copy"
              )}
            </button>
          ) : null}
        </div>
        <span aria-live="polite" className="sr-only">
          {copied ? "Copied" : ""}
        </span>
        <pre role={instant ? "status" : undefined} className="overflow-x-auto whitespace-pre-wrap p-4 font-mono text-[0.875rem] leading-6 text-foreground [overflow-wrap:anywhere]">
          {instant ? (
            <>
              /bin/bash -c &quot;$(curl -fsSL {site.backendUrl}/onecamp/download/
              <span className="rounded-[4px] px-1 text-camp-moss ring-1 ring-camp-moss/70">
                {instant.key.slice(0, typed)}
                <span className="sr-only">{instant.key.slice(typed)}</span>
              </span>
              )&quot;
            </>
          ) : (
            <>
              /bin/bash -c &quot;$(curl -fsSL {site.backendUrl}/onecamp/download/
              <span className="rounded-[4px] border border-dashed border-camp-sun px-1 text-camp-sun-ink">your-key</span>)&quot;
            </>
          )}
        </pre>
      </div>

      {instant ? (
        <p className="mt-3 flex items-start gap-2 text-small text-muted-foreground">
          <Celebration>
            <span className="hue-moss inline-flex size-5 items-center justify-center rounded-full bg-hue text-white">
              <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.875" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          </Celebration>
          <span>
          It asks for {installerAsks}, then installs the whole workspace, web app included, for up to {instant.seat_limit} people.
          Your licence key is <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-caption text-foreground">{instant.key}</code>; keep
          it to install again.
          </span>
        </p>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="button" variant="brand" size="lg" onClick={getInstant} disabled={instantBusy} className="w-full sm:w-auto">
            {instantBusy ? "Making your key…" : "Fill in my key"}
          </Button>
          <span className="text-small text-muted-foreground">One click makes a free key. Nothing to fill in.</span>
        </div>
      )}
      {instantError && (
        <p role="alert" className="mt-3 text-small text-danger-ink">
          {instantError}
        </p>
      )}
    </div>
  );
}

/** The same key by email, for someone who would rather install later. */
export function FreeEmailKey() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [emailOpen, setEmailOpen] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = freeClaimPayload(email, name);
    if (!payload) {
      setState({ kind: "error", msg: "That does not look like an email address." });
      return;
    }
    setState({ kind: "sending" });
    try {
      const res = await fetch(`${site.backendUrl}/onecamp/free-license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", msg: body?.msg || "We couldn't send your licence just now. Try again in a minute." });
        return;
      }
      trackEvent("free-claimed");
      setState({ kind: "sent", email: payload.email });
    } catch {
      setState({ kind: "error", msg: "No connection. Check your network and try again." });
    }
  };

  return (
    <div className="mt-10">
      {state.kind === "sent" ? (
        <div role="status" className="space-y-2">
          <p className="font-medium text-foreground">Check your inbox</p>
          <p className="text-small text-muted-foreground">
            Your licence key and the install command are on their way to <strong className="text-foreground">{state.email}</strong>.
            Nothing after a few minutes? Look in spam, or submit again and we send the same key.
          </p>
        </div>
      ) : !emailOpen ? (
        <button type="button" onClick={() => setEmailOpen(true)} className="link tap-target text-small font-medium">
          Or email the key to me
        </button>
      ) : (
        <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
          <label className="block">
            <span className="mb-1.5 block text-small font-medium text-foreground">Work email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@company.com"
            />
            <span className="mt-1 block text-caption text-muted-foreground">
              The key is sent here, so use one you can open. See our{" "}
              <a href="/privacy-policy" className="underline underline-offset-2">privacy policy</a>.
            </span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-small font-medium text-foreground">Name or team (optional)</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" className={inputCls} placeholder="Your team's name…" />
          </label>
          {state.kind === "error" && (
            <p role="alert" className="text-small text-danger-ink">
              {state.msg}
            </p>
          )}
          <Button type="submit" variant="ghost" disabled={state.kind === "sending"}>
            {state.kind === "sending" ? "Sending…" : "Email me my free licence"}
          </Button>
        </form>
      )}
    </div>
  );
}
