"use client";

import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { trackEvent } from "@/lib/track";
import { FREE_SEATS, freeClaimPayload, freeIncludes } from "@/lib/freePlan";
import { installerAsks, selfHostNeeds } from "@/lib/content";
import { cloudBuyHref } from "@/lib/paymentTerms";

const inputCls =
  "h-10 w-full rounded-md border border-border-strong bg-card px-3 text-base text-foreground transition-colors duration-150 placeholder:text-faint focus:border-brand sm:text-sm";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; msg: string };

interface Instant {
  key: string;
  install_command: string;
  seat_limit: number;
}

/**
 * The free plan, with the install command on the face of the page.
 *
 * The command carries a licence key, and a key is minted per click by the
 * backend (customer and order rows included), so it is not minted on page
 * load for every visitor and crawler. Instead the command's shape is on the
 * page from the start, with the key's place shown, and one click fills it
 * in: no form, no email, no card.
 */
export default function FreePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });
  const [instant, setInstant] = useState<Instant | null>(null);
  const [instantBusy, setInstantBusy] = useState(false);
  const [instantError, setInstantError] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

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
    <>
      <PageHeader
        title={`Install OneCamp free, for up to ${FREE_SEATS} people`}
        subtitle="Chat, docs, tasks, calls and AI teammates on your own server. Paste one command into it. No email, no card."
        className="!pb-0"
      >
        {/* THE COMMAND, ON THE FACE OF THE PAGE. */}
        <div className="mt-8 max-w-3xl">
          {/* The page's own surface, like every code block on the site: a block
              hard-coded dark in a light page reads as a different website. */}
          <div className="overflow-hidden rounded-lg border border-border bg-muted text-foreground">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
              <span className="text-caption text-muted-foreground">Run on your server, as root</span>
              {instant ? (
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-sm border border-border-strong bg-card px-2 py-1 text-caption font-medium text-foreground transition-colors duration-150 hover:bg-accent"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              ) : null}
            </div>
            <pre role={instant ? "status" : undefined} className="overflow-x-auto whitespace-pre-wrap break-all p-4 font-mono text-[0.8125rem] leading-6">
              {instant ? (
                instant.install_command
              ) : (
                <>
                  /bin/bash -c &quot;$(curl -fsSL {site.backendUrl}/onecamp/download/
                  <span className="rounded-sm border border-dashed border-border-strong px-1 text-muted-foreground">your-key</span>)&quot;
                </>
              )}
            </pre>
          </div>

          {instant ? (
            <p className="mt-3 text-small text-muted-foreground">
              It asks for {installerAsks}, then installs the whole workspace, web app included, for up to {instant.seat_limit} people.
              Your licence key is <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-caption text-foreground">{instant.key}</code>; keep
              it to install again.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="button" variant="brand" size="lg" onClick={getInstant} disabled={instantBusy}>
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
      </PageHeader>

      <section className="pb-20 pt-14">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-h3 text-foreground">What you need</h2>
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {selfHostNeeds.map((need) => (
                <li key={need} className="text-small text-foreground">
                  {need}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-muted-foreground">
              No server? <a href={cloudBuyHref("monthly")} className="link">OneCamp Cloud</a> runs it for you.{" "}
              <a href="/docs/installation" className="link">Read the install guide</a>
            </p>

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
                <button type="button" onClick={() => setEmailOpen(true)} className="link text-small font-medium">
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
          </div>

          <div>
            <h2 className="text-h3 text-foreground">What the free plan includes</h2>
            <ul className="mt-4 space-y-3 border-t border-border pt-4">
              {freeIncludes.map((item) => (
                <li key={item} className="text-small text-foreground">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small text-muted-foreground">
              Past {FREE_SEATS} people? A licence removes the limit, and the workspace you already run keeps working:
              re-run the install with the key from your purchase email.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href={site.demoStartUrl} external variant="ghost">
                Try the live demo first
              </ButtonLink>
              <ButtonLink href="/pricing" variant="subtle">
                See paid plans
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
