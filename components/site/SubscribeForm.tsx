"use client";

import { useState } from "react";
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
 */
export function SubscribeForm({ source, compact = false }: { source: string; compact?: boolean }) {
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
    return <p className={`text-sm text-foreground ${compact ? "" : "mt-2"}`}>{msg}</p>;
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`sub-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`sub-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="btn-primary shrink-0 px-4 py-2 text-sm disabled:opacity-60"
        >
          {state === "sending" ? "Adding…" : "Keep me posted"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {state === "error" ? (
          <span className="text-red-600 dark:text-red-400">{msg}</span>
        ) : (
          "A few emails a year, when something ships. Unsubscribe in one click."
        )}
      </p>
    </form>
  );
}
