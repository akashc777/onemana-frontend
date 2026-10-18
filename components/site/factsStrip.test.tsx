import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FactsStrip } from "@/components/site/FactsStrip"
import { defaultPricing } from "@/lib/pricing"
import type { ReleaseFacts } from "@/lib/releases"

/**
 * The proof strip (site.md H3): four facts, each after a neutral glyph (v3.1:
 * colour names an area, and none of these is one), the release fact read
 * live and nothing claimed without it, a "Star on GitHub" with no number
 * beside it (until it reads in the hundreds, a small count is anti-proof),
 * and the two prices a team chooses between, so a phone reader meets a price
 * two screens down instead of twelve.
 */
describe("the facts strip", () => {
  const release: ReleaseFacts = { last30: 34, pill: { headline: "A calmer workspace", href: "/changelog/2026-10-10-a-calmer-workspace" } }

  it("has four facts, each after a glyph in ink, and no camp hue on any of them", () => {
    const html = renderToString(<FactsStrip release={release} pricing={defaultPricing} />)
    expect(html.match(/<dt /g)).toHaveLength(4)
    const facts = html.slice(html.indexOf("<dl"), html.indexOf("</dl>"))
    expect(facts.match(/<svg/g)).toHaveLength(4)
    expect(facts).not.toMatch(/hue-(sky|moss|sun|lake|dusk|berry)/)
    expect(html).toContain("34 releases in 30 days")
  })

  it("names the free plan and the licence's price, each after a neutral dot (a plan is no area)", () => {
    const html = renderToString(<FactsStrip release={release} pricing={defaultPricing} />)
    const prices = html.slice(html.indexOf("</dl>"))
    expect(prices).not.toMatch(/hue-(sky|moss|sun|lake|dusk|berry)/)
    expect(prices.match(/bg-ink-4/g)).toHaveLength(2)
    expect(prices).toMatch(/Free<\/b> for up to <!-- -->25<!-- --> people/)
    // Rupees from the pricing the page reads, never typed here; the estimate follows after mount.
    expect(prices).toContain("₹24,999 once")
    expect(prices).toMatch(/<a [^>]*href="\/pricing"[^>]*>See pricing/)
  })

  // RELEASES.md: a count this high reads as "I'll be updating all the time"
  // to someone who runs their own server, so it opens the changelog and its
  // detail says how updating goes. No price and no version beside it.
  it("opens the changelog from the count, and answers the pace with how updating goes", () => {
    const html = renderToString(<FactsStrip release={release} pricing={defaultPricing} />)
    expect(html).toMatch(/<a [^>]*href="\/changelog"[^>]*>34 releases in 30 days<\/a>/)
    expect(html).toContain("Update when you like: one command, backup first.")
    const fact = html.slice(html.indexOf("34 releases"), html.indexOf("Runs on 4 GB"))
    expect(fact).not.toMatch(/₹|\$\d|\bv\d+\.\d+/)
    expect(fact).not.toContain("github.com")
  })

  it("claims no release when GitHub does not answer, or when releases have stopped", () => {
    for (const r of [null, { last30: 1 }, { last30: 0 }]) {
      const html = renderToString(<FactsStrip release={r} pricing={defaultPricing} />)
      expect(html).toContain("Released in the open")
      expect(html).not.toMatch(/releases? in 30 days/)
    }
  })

  it("puts no number beside the star", () => {
    const html = renderToString(<FactsStrip release={release} pricing={defaultPricing} />)
    const star = html.slice(html.indexOf("Star on GitHub") - 400, html.indexOf("Star on GitHub") + 40)
    expect(star).not.toMatch(/\d+\s*(stars|★)/i)
    expect(html).toMatch(/Star on GitHub<\/a>/)
  })
})
