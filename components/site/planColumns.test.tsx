import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FREE_PILL, PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
import { PLAN_HUE } from "@/components/site/planHues"
import { defaultPricing, fmtINR } from "@/lib/pricing"

/**
 * The plan cards (design v3, site.md H9 and P2): three neutral cards, each
 * plan's identity a dot in its hue, the licence lifted with e3 and a brand
 * ring and no words claiming popularity, Free carrying "Most teams start
 * here", one primary button, and prices from the pricing payload only.
 */
describe("the plan cards", () => {
    const pricing = { ...defaultPricing, lifetime_inr: 31337, cloud_inr: 12345, cloud_seats: 42 }
    const html = renderToString(<PlanColumns pricing={pricing} />)
    const cards = html.match(/<div data-plan="[a-z]+" class="[^"]*"/g) ?? []

    it("are three neutral cards, each plan's hue on its dot", () => {
        expect(cards.map((c) => c.match(/class="(hue-[a-z]+)/)?.[1])).toEqual([`hue-${PLAN_HUE.free}`, `hue-${PLAN_HUE.lifetime}`, `hue-${PLAN_HUE.cloud}`])
        for (const c of cards) expect(c).toMatch(/rounded-2xl bg-card p-6/)
        expect(html).not.toContain("bg-hue-tint px-6")
    })

    it("lift the licence with e3 and a brand ring, and say nothing about popularity", () => {
        expect(cards[1]).toMatch(/shadow-e3 ring-1 ring-brand\/45/)
        expect(cards[0]).toMatch(/shadow-e1/)
        expect(html).toContain(FREE_PILL)
        expect(html).not.toMatch(/most popular|best value|save \d/i)
    })

    it("have one primary button, and Free reads Free, never a rupee zero", () => {
        expect(html.match(/ui-btn-primary/g)).toHaveLength(1)
        expect(html).not.toContain("₹0")
    })

    it("take every price from the pricing payload", () => {
        expect(html).toContain(fmtINR(31337))
        expect(html).toContain(fmtINR(12345))
        expect(html).toContain("Up to 42 people, run by us")
        expect(html).not.toContain(fmtINR(defaultPricing.lifetime_inr))
    })

    it("say what each plan delivers", () => {
        expect(html.match(/You get: /g)).toHaveLength(3)
    })

    // Each part lines up across the three whatever wraps: the cards share a
    // subgrid of eight rows from lg; at a tablet's width they are two and one.
    it("share one row grid side by side, a row per part", () => {
        for (const c of cards) expect(c).toContain("lg:row-span-8 lg:grid lg:grid-rows-subgrid lg:gap-y-0")
        expect(cards[2]).toContain("md:col-span-2 md:mx-auto")
    })

    it("reserve the estimate's two lines on every card, so the currency swap moves nothing", () => {
        expect(html.match(/<span class="block h-9 text-caption/g)).toHaveLength(3)
    })
})

/**
 * A plan keeps its hue wherever it appears: the Cloud card under the columns,
 * and each option's name in the plan table.
 */

describe("a plan's colour follows it", () => {
    it("draws the Cloud column in Cloud's hue", () => {
        const html = renderToString(<PlanColumns pricing={defaultPricing} />)
        expect(html).toMatch(new RegExp(`<div data-plan="cloud" class="hue-${PLAN_HUE.cloud} `))
    })

    it("marks each option in the plan table with its plan's hue", () => {
        const html = renderToString(<PlanComparison pricing={defaultPricing} />)
        const head = html.slice(html.indexOf("<thead"), html.indexOf("</thead>"))
        const hues = [...head.matchAll(/data-hue="([a-z]+)"/g)].map((m) => m[1])
        expect(hues).toEqual([PLAN_HUE.source, PLAN_HUE.free, PLAN_HUE.lifetime, PLAN_HUE.cloud])
    })
})

