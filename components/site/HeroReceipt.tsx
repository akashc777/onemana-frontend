"use client"

/**
 * HeroReceipt — the hero visual is the evidence, not a screenshot.
 *
 * The hero this replaces was the default SaaS template: centred pill badge,
 * centred headline with one word in the accent colour, centred subhead, two
 * centred buttons, a star pill, a row of four icon cards. Every element
 * symmetrical, every element the same as everyone else's, and the actual claim
 * asserted in prose that a reader has no reason to believe.
 *
 * The claim is falsifiable, which is unusual and worth using: an agent cannot
 * exceed the person who authorised it, and the action is recorded BEFORE it
 * happens. So the hero shows the record, including a refusal.
 *
 * THE REFUSAL IS THE POINT. Every competitor's marketing shows an agent
 * succeeding. Showing one being stopped is the thing only a product with real
 * authorisation can put on its front page, and it is the row a sceptical
 * engineer will look at first.
 *
 * Static by design. This is a specimen of a real record, not a live feed and not
 * a fake one that animates to look busy: an invented ticker would undermine the
 * exact quality the section exists to demonstrate.
 */

import React from "react"

interface Row {
    time: string
    actor: string
    action: string
    detail: string
    outcome: "allowed" | "refused"
    note?: string
}

const ROWS: Row[] = [
    {
        time: "09:14:02",
        actor: "Release Captain",
        action: "task.create",
        detail: "#engineering · “Cut 2.7.0 release notes”",
        outcome: "allowed",
    },
    {
        time: "09:14:02",
        actor: "Release Captain",
        action: "doc.read",
        detail: "Release checklist",
        outcome: "allowed",
    },
    {
        time: "09:14:03",
        actor: "Release Captain",
        action: "channel.post",
        detail: "#finance",
        outcome: "refused",
        note: "Priya cannot post in #finance, so neither can her agent",
    },
]

export const HeroReceipt: React.FC = () => (
    <figure className="m-0 overflow-hidden rounded-lg border border-border bg-canvas-raised">
        <figcaption className="flex items-baseline justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground/45">
                Audit log · workspace
            </span>
            <span className="font-mono text-[0.65rem] text-foreground/35">acting as Priya N.</span>
        </figcaption>

        <ol className="m-0 list-none p-0">
            {ROWS.map((r, i) => (
                <li
                    key={i}
                    className="grid grid-cols-[auto_1fr] gap-x-3 border-b border-border/60 px-4 py-3 last:border-b-0"
                >
                    <span className="font-mono text-[0.68rem] tabular-nums text-foreground/40">{r.time}</span>
                    <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                            <span className="font-mono text-[0.72rem] text-foreground/80">{r.action}</span>
                            <span
                                className={
                                    r.outcome === "refused"
                                        ? "rounded-sm bg-brand/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-brand"
                                        : "rounded-sm bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-foreground/45"
                                }
                            >
                                {r.outcome}
                            </span>
                        </span>
                        <span className="mt-0.5 block truncate text-[0.78rem] text-foreground/55">{r.detail}</span>
                        {r.note && (
                            <span className="mt-1 block text-[0.72rem] leading-snug text-brand/90">{r.note}</span>
                        )}
                    </span>
                </li>
            ))}
        </ol>

        <div className="border-t border-border px-4 py-2.5">
            <p className="m-0 text-[0.72rem] leading-relaxed text-foreground/45">
                Each entry hashes the one before it. Written before the action, so a refusal is on the record too.
            </p>
        </div>
    </figure>
)

export default HeroReceipt
