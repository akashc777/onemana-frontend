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
import type { CampHue } from "@/lib/campHue"
import { HUE_CLASS } from "@/components/ui/graphics/hues"

export interface Guarantee {
    title: string
    body: string
}

// The number is never the accent: the accent is for actions, not for list
// markers. On a camp band it sits in a small card-coloured square in the
// band's ink (hue), so the numbers read as part of that section's colour.
// "row" sets the guarantees side by side under a hairline, for a section whose
// top half already holds a heading and a figure; "list" stacks them. Side by
// side, each guarantee takes two rows of one subgrid, the claim and its
// explanation, so a claim that wraps to two lines moves its neighbours'
// explanations down with its own and all three start on one line.
export const GuaranteeList: React.FC<{ items: readonly Guarantee[]; className?: string; layout?: "list" | "row"; hue?: CampHue }> = ({ items, className = "", layout = "list", hue }) => (
    <ol className={`list-none p-0 ${layout === "row" ? "grid gap-x-10 gap-y-8 border-t border-border pt-8 md:grid-cols-3 md:gap-y-0" : "border-t border-border"} ${className}`}>
        {items.map((g, i) => (
            <li key={g.title} className={`grid grid-cols-[2rem_1fr] gap-x-3 ${layout === "row" ? "md:row-span-2 md:grid-rows-subgrid md:gap-y-0" : "border-b border-border py-5"}`}>
                {hue ? (
                    <span aria-hidden className={`${HUE_CLASS[hue]} flex size-7 items-center justify-center rounded-md bg-card font-mono text-small tabular-nums text-hue-ink`}>
                        {i + 1}
                    </span>
                ) : (
                    <span aria-hidden className="pt-0.5 font-mono text-small tabular-nums text-muted-foreground">
                        {i + 1}
                    </span>
                )}
                <h3 className="min-w-0 text-h3 text-foreground">{g.title}</h3>
                <p className="col-start-2 mt-1.5 min-w-0 text-small text-muted-foreground sm:text-body">{g.body}</p>
            </li>
        ))}
    </ol>
)

export default GuaranteeList
