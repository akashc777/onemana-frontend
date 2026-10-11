import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FACT_HUES, FactsStrip } from "@/components/site/FactsStrip"

/**
 * The proof strip (site.md H3): four facts, each after a hue dot in chart
 * order, the release fact read live and nothing claimed without it, and a
 * "Star on GitHub" with no number beside it (until it reads in the
 * hundreds, a small count is anti-proof).
 */
describe("the facts strip", () => {
  const release = { version: "v2.71", date: "10 Oct", last30: 42 }

  it("has four facts with dots in the chart's order", () => {
    const html = renderToString(<FactsStrip release={release} />)
    expect(html.match(/<dt /g)).toHaveLength(4)
    expect(FACT_HUES).toEqual(["moss", "sky", "sun", "berry"])
    for (const h of FACT_HUES) expect(html).toContain(`hue-${h}`)
    expect(html).toContain("42 releases in 30 days")
  })

  it("claims no release when GitHub does not answer", () => {
    const html = renderToString(<FactsStrip release={null} />)
    expect(html).toContain("Released in the open")
    expect(html).not.toMatch(/releases in 30 days/)
  })

  it("puts no number beside the star", () => {
    const html = renderToString(<FactsStrip release={release} />)
    const star = html.slice(html.indexOf("Star on GitHub") - 400, html.indexOf("Star on GitHub") + 40)
    expect(star).not.toMatch(/\d+\s*(stars|★)/i)
    expect(html).toMatch(/Star on GitHub<\/a>/)
  })
})
