"use client";

import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { site } from "@/lib/site";
import { trackEvent } from "@/lib/track";
import { FREE_SEATS, freeClaimPayload, freeIncludes } from "@/lib/freePlan";
import { selfHostNeeds } from "@/lib/content";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 sm:text-sm";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; msg: string };

export default function FreePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

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
        eyebrow="Free plan"
        title={`Free for up to ${FREE_SEATS} people`}
        subtitle="Run OneCamp on your own server with every feature. We email you a licence key and one command to install it. No card."
        align="left"
        className="!pb-0"
      />
      <section className="pb-16 sm:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="card-premium card bg-card/90 lg:col-start-2 lg:row-start-1">
            {state.kind === "sent" ? (
              <div role="status" className="space-y-3">
                <p className="text-lg font-medium text-foreground">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Your licence key and the install command are on their way to <strong className="text-foreground">{state.email}</strong>.
                  Run the command on your server; it serves the whole workspace, web app included.
                </p>
                <p className="text-sm text-muted-foreground">
                  Nothing after a few minutes? Look in spam, or submit again and we send the same key.
                </p>
                <ButtonLink href="/docs/installation" variant="ghost" size="sm">Read the install guide</ButtonLink>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Work email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="you@company.com"
                  />
                  <span className="mt-1 block text-xs text-muted-foreground">The key is sent here, so use one you can open. See our <a href="/privacy-policy" className="underline underline-offset-2">privacy policy</a>.</span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Name or team (optional)</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="organization" className={inputCls} placeholder="Acme" />
                </label>
                {state.kind === "error" && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.msg}</p>
                )}
                <Button type="submit" variant="brandPremium" size="lg" className="w-full" disabled={state.kind === "sending"}>
                  {state.kind === "sending" ? "Sending…" : "Email me my free licence"}
                </Button>
              </form>
            )}
          </div>

          <aside className="space-y-6 lg:col-start-1 lg:row-start-1">
            <ul className="space-y-3 text-sm text-foreground">
              {freeIncludes.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span aria-hidden className="mt-0.5 text-brand">✓</span> {item}
                </li>
              ))}
            </ul>
            <div className="space-y-2 rounded-lg border border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">What you need</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {selfHostNeeds.map((need) => (
                  <li key={need} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-0.5">·</span> {need}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                No server? <a href="/buy" className="font-medium text-foreground underline underline-offset-4">OneCamp Cloud</a> runs it for you.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Past {FREE_SEATS} people? A lifetime licence removes the limit, and the workspace you already run keeps working:
              re-run the same install command after buying.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={site.demoStartUrl} external variant="ghost" size="sm">Try the live demo first</ButtonLink>
              <ButtonLink href="/buy" variant="ghost" size="sm">See paid plans</ButtonLink>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
