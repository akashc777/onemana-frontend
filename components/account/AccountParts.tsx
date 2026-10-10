"use client";

import { useState, type ReactNode } from "react";
import type { CampHue } from "@/lib/campHue";
import type { StateTone } from "@/lib/instanceState";
import { Tile } from "@/components/ui/graphics/Tile";

/**
 * The dot for each tone, from the meaning tokens (DESIGN.md: colour that
 * carries meaning comes from a token, never a raw hue). Written here, in
 * components/, because Tailwind reads app/ and components/ and not lib/: a
 * class that only lib/ names is never generated, and the dot would be blank.
 */
const TONE_DOT: Record<StateTone, string> = {
  good: "bg-success",
  bad: "bg-danger",
  waiting: "bg-warning",
  working: "bg-info",
  done: "bg-faint",
};

/** A status as a dot and its word (DESIGN.md: a status is a dot and its word, not a pill). */
export function StatusDot({ tone, children }: { tone: StateTone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-small text-foreground">
      <span aria-hidden className={`size-2 shrink-0 rounded-full ${TONE_DOT[tone]}`} />
      {children}
    </span>
  );
}

/**
 * A value somebody copies (a licence key, an install command): mono, on the
 * muted ground, with its copy button beside it. The button says "Copied" for
 * a moment, and a status line tells a screen reader the same.
 */
export function CopyField({ value, label, wrap = false }: { value: string; label: string; wrap?: boolean }) {
  const [done, setDone] = useState<"" | "copied" | "failed">("");
  return (
    <div className="flex items-start gap-2">
      <code
        className={`min-w-0 flex-1 rounded-md border border-border bg-muted px-3 py-2 font-mono text-caption text-foreground ${
          wrap ? "break-all" : "truncate"
        }`}
      >
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setDone("copied");
          } catch {
            setDone("failed");
          }
          window.setTimeout(() => setDone(""), 1600);
        }}
        className="h-[2.125rem] shrink-0 rounded-md border border-border-strong bg-card px-3 text-caption font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        aria-label={`Copy ${label}`}
      >
        {done === "copied" ? "Copied" : done === "failed" ? "Select it" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {done === "copied" ? `${label} copied` : done === "failed" ? "Copying is not available here. Select the text instead." : ""}
      </span>
    </div>
  );
}

/**
 * One of the overview's three tiles (licences, invoices, Cloud): a hued tile
 * with its glyph, what it is, the one fact that matters, and where to go.
 */
export function SummaryTile({
  hue,
  icon,
  label,
  value,
  detail,
  action,
}: {
  hue: CampHue;
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Tile hue={hue} size="md">
          {icon}
        </Tile>
        <p className="text-small font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="mt-4 font-display text-h3 font-semibold text-foreground">{value}</p>
      <p className="mt-0.5 text-caption text-muted-foreground">{detail}</p>
      {action ? <div className="mt-auto pt-3">{action}</div> : null}
    </div>
  );
}

/** The glyphs the account page draws with: 1.5 px strokes, in the tile's strong cut. */
export const glyphs = {
  key: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="10.5" r="2.75" />
      <path d="M7.5 8.5l5.75-5.75M11.25 4.75l1.5 1.5M9.75 6.25l1.25 1.25" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.75 2.25h8.5v11.5l-2.125-1.25L8 13.75l-2.125-1.25-2.125 1.25z" />
      <path d="M6 5.75h4M6 8.25h4" />
    </svg>
  ),
  cloud: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 12.25h7a2.75 2.75 0 0 0 .4-5.47A4 4 0 0 0 4.2 7.6a2.35 2.35 0 0 0 .3 4.65z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 5v3.25l2 1.25" />
    </svg>
  ),
} as const;
