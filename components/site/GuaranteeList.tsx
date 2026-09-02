"use client"

/**
 * GuaranteeList — the governance claims as a specification, not a card grid.
 *
 * What was here: seven identical cards, each with a rounded pastel icon chip in
 * an arbitrary colour, laid out three across so the last row held one orphan.
 * Card heights were set by whichever paragraph happened to be longest, leaving
 * ragged whitespace, and because every card looked equally important, nothing
 * was. That pattern is the single most recognisable shape on the AI-built web,
 * and this site used it in three separate sections.
 *
 * The content is not a grid of features. It is a list of guarantees, each of
 * which is a claim followed by the mechanism that backs it, and that has a
 * natural typographic form: a numbered specification. Numbering is not
 * decoration here, it is true, because these are the conditions that hold
 * together and a reader can refer to one of them.
 *
 * No icons. Seven pastel chips carried no information at all: the shield next to
 * "an agent can only do what its author could" said nothing the sentence did not
 * already say, and the colours were assigned by position rather than meaning.
 * The only colour left is on the number, and the only weight is on the claim.
 */

import React from "react"

import { Reveal } from "@/components/site/Reveal"

export interface Guarantee {
    title: string
    body: string
}

export const GuaranteeList: React.FC<{ items: readonly Guarantee[] }> = ({ items }) => (
    <ol className="mx-auto mt-12 max-w-3xl list-none border-t border-border p-0">
        {items.map((g, i) => (
            <li key={g.title} className="border-b border-border">
                <Reveal delay={Math.min(i, 4) * 50}>
                    <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-x-6 sm:py-7">
                        <span
                            aria-hidden
                            className="pt-1 font-mono text-sm tabular-nums text-brand"
                        >
                            {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-lg font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-xl">
                                {g.title}
                            </h3>
                            <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
                                {g.body}
                            </p>
                        </div>
                    </div>
                </Reveal>
            </li>
        ))}
    </ol>
)

export default GuaranteeList
