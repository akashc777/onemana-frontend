"use client";

import { useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { site } from "@/lib/site";

/**
 * Email capture.
 *
 * WHY THIS EXISTS. Over a thousand people looked at OneCamp in three months and
 * not one could be contacted afterwards, because the only address the system
 * ever recorded was on an invoice. Everything above the purchase was anonymous,
 * so the only marketing available was to shout again and hope the same people
 * were listening.
 *
 * Deliberately not a popup or an exit-intent overlay. The audience here is people
 * who self-host their own software; an overlay is the fastest way to lose them.
 *
 * THE OFFER IS A PROP BECAUSE ONE OFFER DOES NOT FIT EVERY PAGE. In sixty days
 * 610 people saw this form on the home page and none of them filled it in. The
 * ask was "Keep me posted", and a few emails a year is not a reason to hand over
 * an address. Somebody standing on the checkout page has a different question
 * than somebody who has just finished a blog post, so the caller says what the
 * reason is. Defaults are the existing wording, so nothing changes where nobody
 * has thought about it yet.
 *
 * It looks like the site's other forms: a 6 px input on the card surface with
 * the global focus ring, and an outline button, because the orange is kept for
 * the one primary action of each view and this is never it. The answer, or
 * the error, is announced where it appears.
 */
export function SubscribeForm({
    source,
    compact = false,
    cta = "Email me updates",
    hint = "Occasional product announcements. Unsubscribe in one click.",
}: {
    source: string
    compact?: boolean
    cta?: string
    hint?: string
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(`${site.backendUrl}/onecamp/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Something went wrong. Try again?");
      setState("done");
      setMsg(data?.msg || "You're on the list.");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong. Try again?");
    }
  };

  if (state === "done") {
    return (
      <p role="status" className={`text-small text-foreground ${compact ? "" : "mt-2"}`}>
        {msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`sub-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`sub-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="ui-field"
        />
        <button type="submit" disabled={state === "sending"} className={buttonClasses("ghost", "md", "shrink-0")}>
          {state === "sending" ? "Adding…" : cta}
        </button>
      </div>
      <p aria-live="polite" className="mt-2 text-caption text-muted-foreground">
        {state === "error" ? (
          <span className="text-danger-ink">{msg}</span>
        ) : (
          hint
        )}
      </p>
    </form>
  );
}
