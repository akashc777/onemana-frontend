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

export interface Guarantee {
    title: string
    body: string
}

// The number is neutral: the accent is for actions, not for list markers.
export const GuaranteeList: React.FC<{ items: readonly Guarantee[]; className?: string }> = ({ items, className = "" }) => (
    <ol className={`list-none border-t border-border p-0 ${className}`}>
        {items.map((g, i) => (
            <li key={g.title} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-border py-5">
                <span aria-hidden className="pt-0.5 font-mono text-small tabular-nums text-muted-foreground">
                    {i + 1}
                </span>
                <div className="min-w-0">
                    <h3 className="text-h3 text-foreground">{g.title}</h3>
                    <p className="mt-1.5 text-small text-muted-foreground sm:text-body">{g.body}</p>
                </div>
            </li>
        ))}
    </ol>
)

export default GuaranteeList
