import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { CloudPlanCard } from "@/components/site/CloudPlanCard"
import { LicencePlanCard } from "@/components/site/LicencePlanCard"
import { PLAN_CARD_PARTS } from "@/components/site/PlanCard"
import { defaultPricing } from "@/lib/pricing"

/**
 * Things side by side line up part by part, the way the plan cards do: each
 * card or item's title, text, list and button start level with its
 * neighbours' whatever wraps. Measured before (1440 and 768 px): the Safe AI
 * guarantees' explanations 28 px apart, the home FAQ's answers 26 apart at
 * 768, /verify's two kinds of file 24 apart, the licence and Cloud cards'
 * prices 56 apart and buttons 18, a docs pager card's "Previous" 10 px below
 * "Next", /buy's AI choices 9 apart, and /compare's tools with a hairline
 * wherever each one's text ended.
 *
 * The cure is the plan cards': each item takes its parts' rows of one
 * subgrid, or, for a lone line, starts at the top rather than the middle.
 */

/** The tag names of an element's direct children, from server HTML. */
function childTags(html: string, openAt: number): string[] {
  const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source"])
  const re = /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/g
  re.lastIndex = openAt
  const out: string[] = []
  let depth = 0
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, close, name, self] = m
    if (close) {
      depth--
      if (depth === 0) break
      continue
    }
    if (depth === 1) out.push(name!)
    if (!self && !VOID.has(name!)) depth++
  }
  return out
}

describe("things side by side line up", () => {
  it("the licence and Cloud cards lay the same six parts on the row's subgrid", () => {
    for (const html of [
      renderToString(<LicencePlanCard pricing={defaultPricing} aligned />),
      renderToString(<CloudPlanCard pricing={{ ...defaultPricing, cloud_yearly_configured: true, business_configured: true }} aligned />),
    ]) {
      expect(html).toMatch(/^<div class="hue-[a-z]+ [^"]*lg:row-span-7 lg:grid lg:grid-rows-subgrid lg:gap-y-0/)
      const body = html.indexOf('<div class="flex flex-1 flex-col px-6 pb-6 pt-5 lg:row-span-6 lg:grid lg:grid-rows-subgrid lg:gap-y-0')
      expect(body).toBeGreaterThan(0)
      // Price, estimate, who it is for, the list, the button, the note.
      expect(childTags(html, body)).toEqual(["p", "p", expect.stringMatching(/^(p|div)$/), "ul", "div", "p"])
      expect(childTags(html, body)).toHaveLength(PLAN_CARD_PARTS)
    }
    // Not aligned, a card is a plain column, as on a phone.
    expect(renderToString(<LicencePlanCard pricing={defaultPricing} />)).not.toContain("subgrid")
  })
})
