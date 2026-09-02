"use client"

/**
 * ControlIndex — the enterprise controls as a checklist, not four cards.
 *
 * The last of the three card grids. Four cards, each with an uppercase label and
 * a tick list, sitting four across so on a laptop they compressed into narrow
 * columns with four-word lines. The heading above them is "the boxes
 * procurement makes you tick", which is exactly right and describes a checklist,
 * not a set of cards.
 *
 * So it is a checklist. The group name sits in the margin, the items run in a
 * single readable column, and the ticks are gone: in a section titled "already
 * in the box", a tick beside every line is noise, because there is nothing
 * unticked to contrast with.
 */

import React from "react"

import { Reveal } from "@/components/site/Reveal"

export interface ControlGroupData {
    label: string
    items: readonly string[]
}

export const ControlIndex: React.FC<{ groups: readonly ControlGroupData[] }> = ({ groups }) => (
    <div className="mx-auto mt-12 max-w-3xl border-t border-border">
        {groups.map((g, i) => (
            <Reveal key={g.label} delay={Math.min(i, 4) * 50}>
                <section className="grid grid-cols-1 gap-x-6 border-b border-border py-6 sm:grid-cols-[9rem_1fr] sm:py-7">
                    <h3 className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-brand sm:pt-0.5">
                        {g.label}
                    </h3>
                    <ul className="mt-3 grid gap-x-8 gap-y-1.5 sm:mt-0 sm:grid-cols-2">
                        {g.items.map((item) => (
                            <li key={item} className="text-sm leading-relaxed text-foreground/80">
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            </Reveal>
        ))}
    </div>
)

export default ControlIndex
