import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { EntryDigest, FIXES_SHOWN, FoldedFixes } from "@/components/changelog/Entry"
import type { ChangelogEntry } from "@/lib/changelog"

/**
 * The changelog on a phone, the fifth of the audit's five least premium
 * places (§7 row 5): an entry ran 12,323 px, most of it an ungrouped wall of
 * fixes, and the list's entry titles were 29 px tall links (L1).
 */
const fixes = (n: number) => Array.from({ length: n }, (_, i) => `Fix number ${i + 1} is a sentence; fixed.`)

describe("a release's fixes", () => {
  it("show the first ten and fold the rest under one disclosure that says how many", () => {
    const html = renderToString(<FoldedFixes items={fixes(52)} />)
    const before = html.slice(0, html.indexOf("<details"))
    expect(before.match(/<li>/g)).toHaveLength(FIXES_SHOWN)
    expect(FIXES_SHOWN).toBe(10)
    expect(html).toContain("Show 42 more fixes")
    const folded = html.slice(html.indexOf("<details"))
    expect(folded.match(/<li>/g)).toHaveLength(42)
    // Closed by default, and a native disclosure: no script, find in page reaches it.
    expect(html).toMatch(/<details class="group\/fold mt-1">/)
    expect(html).toMatch(/<summary data-interactive="row"/)
  })

  it("fold nothing when there are ten or fewer", () => {
    expect(renderToString(<FoldedFixes items={fixes(10)} />)).not.toContain("<details")
    expect(renderToString(<FoldedFixes items={fixes(11)} />)).toContain("Show 1 more fix<")
  })
})

describe("an entry on /changelog", () => {
  it("its title is a 44 px target on a phone", () => {
    const entry = { slug: "e", title: "A calmer workspace", publishedAt: "2026-10-10T00:00:00Z", sections: [], notices: [], fixes: [], tag: "v2.71.0", headlined: true } as unknown as ChangelogEntry
    const html = renderToString(<EntryDigest entry={entry} />)
    expect(html).toMatch(/<h2[^>]*><a[^>]*class="tap-target [^"]*"[^>]*>A calmer workspace<\/a><\/h2>/)
  })
})
