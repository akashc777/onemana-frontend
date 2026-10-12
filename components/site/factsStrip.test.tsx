import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FACT_HUES, FactsStrip } from "@/components/site/FactsStrip"
import type { ReleaseFacts } from "@/lib/releases"

/**
 * The proof strip (site.md H3): four facts, each after a hue dot in chart
 * order, the release fact read live and nothing claimed without it, and a
 * "Star on GitHub" with no number beside it (until it reads in the
 * hundreds, a small count is anti-proof).
 */
describe("the facts strip", () => {
  const release: ReleaseFacts = { last30: 34, pill: { headline: "A calmer workspace", href: "/changelog/2026-10-10-a-calmer-workspace" } }

  it("has four facts with dots in the chart's order", () => {
    const html = renderToString(<FactsStrip release={release} />)
    expect(html.match(/<dt /g)).toHaveLength(4)
    expect(FACT_HUES).toEqual(["moss", "sky", "sun", "berry"])
    for (const h of FACT_HUES) expect(html).toContain(`hue-${h}`)
    expect(html).toContain("34 releases in 30 days")
  })

  // RELEASES.md: a count this high reads as "I'll be updating all the time"
  // to someone who runs their own server, so it opens the changelog and its
  // detail says how updating goes. No price and no version beside it.
  it("opens the changelog from the count, and answers the pace with how updating goes", () => {
    const html = renderToString(<FactsStrip release={release} />)
    expect(html).toMatch(/<a [^>]*href="\/changelog"[^>]*>34 releases in 30 days<\/a>/)
    expect(html).toContain("Update when you like: one command, backup first.")
    const fact = html.slice(html.indexOf("34 releases"), html.indexOf("Runs on 4 GB"))
    expect(fact).not.toMatch(/₹|\$\d|\bv\d+\.\d+/)
    expect(fact).not.toContain("github.com")
  })

  it("claims no release when GitHub does not answer, or when releases have stopped", () => {
    for (const r of [null, { last30: 1 }, { last30: 0 }]) {
      const html = renderToString(<FactsStrip release={r} />)
      expect(html).toContain("Released in the open")
      expect(html).not.toMatch(/releases? in 30 days/)
    }
  })

  it("puts no number beside the star", () => {
    const html = renderToString(<FactsStrip release={release} />)
    const star = html.slice(html.indexOf("Star on GitHub") - 400, html.indexOf("Star on GitHub") + 40)
    expect(star).not.toMatch(/\d+\s*(stars|★)/i)
    expect(html).toMatch(/Star on GitHub<\/a>/)
  })
})
