import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AudienceView } from "@/components/site/AudienceView"
import { PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
import { alternatives } from "@/lib/alternatives"
import { audiences } from "@/lib/audiences"
import { defaultPricing } from "@/lib/pricing"

/**
 * One name for the action (storefront audit §5.2 and P3): every button that
 * buys the licence says "Buy a licence", on the plan cards, in "Which
 * OneCamp is for you" and on the audience and alternative pages. The table
 * said "Buy once" under the cards' "Buy a licence", so a reader met two names
 * for one purchase. "Once" belongs to the price line, never to the button.
 */
const LICENCE_LINK = /<a[^>]*href="\/buy(?:\?plan=lifetime)?"[^>]*>([\s\S]*?)<\/a>/g

function licenceButtons(html: string): string[] {
  return [...html.matchAll(LICENCE_LINK)].map((m) => m[1]!.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim())
}

describe("the licence's button", () => {
  const surfaces: [string, string][] = [
    ["the plan cards", renderToString(<PlanColumns pricing={defaultPricing} />)],
    ["the plan table", renderToString(<PlanComparison pricing={defaultPricing} />)],
    ...[...audiences, ...alternatives].map((a): [string, string] => [`/${a.slug}`, renderToString(<AudienceView a={a} pricing={defaultPricing} />)]),
  ]

  it("is on every surface that sells it", () => {
    for (const [name, html] of surfaces) expect(licenceButtons(html).length, name).toBeGreaterThan(0)
  })

  it('says "Buy a licence" wherever it is, and never "Buy once"', () => {
    for (const [name, html] of surfaces) {
      for (const label of licenceButtons(html)) expect(label, name).toBe("Buy a licence")
      expect(html, name).not.toContain("Buy once")
    }
  })
})
