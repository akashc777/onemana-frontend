"use client"

/**
 * ModuleIndex — the twelve modules as an index, not twelve cards.
 *
 * What was here: a 3×4 grid of identical cards, each with a rounded pastel icon
 * chip. Twelve chips in twelve different colours, assigned by position rather
 * than meaning, so purple meant "AI agents" only in the sense that AI agents
 * happened to be first. Card heights were set by the longest paragraph, so short
 * entries like "Tasks" sat in a box two thirds empty next to "Tables" spilling
 * over. Nothing was emphasised because everything was.
 *
 * The honest job of this section is smaller than a grid implies. The
 * differentiators are argued above it, in the hero and the guarantees. This one
 * answers "does it actually have all the pieces", and the right form for that
 * question is an index: dense, scannable, and finite.
 *
 * The heading carries the module name and the line beneath it says what it
 * replaces or what is unusual about it. A reader scanning for "does it do
 * whiteboards" finds the word in a fraction of the time a card grid takes,
 * because names in a single column are a list rather than a search.
 */

import React from "react"

import { Reveal } from "@/components/site/Reveal"

export interface Module {
    title: string
    body: string
}

export const ModuleIndex: React.FC<{ items: readonly Module[] }> = ({ items }) => (
    <div className="mt-12 border-t border-border">
        <dl className="m-0 grid gap-x-12 md:grid-cols-2">
            {items.map((m, i) => (
                <Reveal key={m.title} delay={Math.min(i, 6) * 40}>
                    <div className="grid grid-cols-[minmax(6.5rem,8rem)_1fr] items-baseline gap-x-4 border-b border-border py-4 sm:gap-x-6">
                        <dt className="text-sm font-semibold tracking-[-0.01em] text-foreground">{m.title}</dt>
                        <dd className="m-0 text-sm leading-relaxed text-muted-foreground">{m.body}</dd>
                    </div>
                </Reveal>
            ))}
        </dl>
    </div>
)

export default ModuleIndex
