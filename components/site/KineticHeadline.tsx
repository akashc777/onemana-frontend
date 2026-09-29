/**
 * The hero headline, set in once: its words rise in turn, then a line in the
 * brand colour draws under the phrase the whole page argues for.
 *
 * Kinetic, not decorative (DESIGN.md, Motion): it plays once, it points at the
 * claim, and nothing about it loops. It is CSS only and rendered on the server,
 * so it costs no script and the words are in the HTML for search and for
 * readers without JavaScript. It sits outside Reveal, which holds content back
 * until the page's script runs and so would hide the words while they move.
 * Screen readers get the sentence as one label
 * rather than word by word. prefers-reduced-motion shows it finished.
 */
import React from "react"

export function KineticHeadline({
  before,
  emphasis,
  after,
  className,
}: {
  /** Words before the emphasised phrase. */
  before: string
  /** The phrase underlined once the words are in. */
  emphasis: string
  /** Words after it, punctuation included. */
  after: string
  className?: string
}) {
  let i = 0
  const words = (text: string) =>
    text
      .split(" ")
      .filter(Boolean)
      .map((w) => (
        <span key={i} className="kinetic-word" style={{ "--i": i++ } as React.CSSProperties}>
          {w}
        </span>
      ))
  // Each word is its own inline-block, so the spaces between them are put
  // back explicitly; without them the line read "Anagentcanonlydo".
  const spaced = (list: React.ReactNode[]) => list.flatMap((w, n) => (n ? [" ", w] : [w]))
  const first = spaced(words(before))
  const marked = spaced(words(emphasis))
  const last = spaced(words(after))
  const full = `${before} ${emphasis}${after.startsWith(".") ? "" : " "}${after}`.replace(/\s+/g, " ").trim()
  return (
    <h1 className={className} aria-label={full}>
      <span aria-hidden="true" className="kinetic-headline">
        {first}{" "}
        <span className="kinetic-underline" style={{ "--i": i } as React.CSSProperties}>
          {marked}
        </span>
        {after.startsWith(".") || after.startsWith(",") ? "" : " "}
        {last}
      </span>
    </h1>
  )
}
