import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { PlanColumns } from "@/components/site/PlanColumns"
import { PLAN_HUE } from "@/components/site/planHues"
import { defaultPricing, fmtINR } from "@/lib/pricing"

/**
 * The plan cards: each in its own hue, saying who it is for and what arrives,
 * with prices from the pricing payload and nowhere else.
 */
describe("the plan cards", () => {
    const pricing = { ...defaultPricing, lifetime_inr: 31337, cloud_inr: 12345, cloud_seats: 42 }
    const html = renderToString(<PlanColumns pricing={pricing} />)

    it("give each plan a header in its hue, the same hue it has everywhere", () => {
        const heads = [...html.matchAll(/class="(hue-[a-z]+) flex flex-col overflow-hidden/g)].map((m) => m[1])
        expect(heads).toEqual([`hue-${PLAN_HUE.free}`, `hue-${PLAN_HUE.lifetime}`, `hue-${PLAN_HUE.cloud}`])
        expect(html.match(/bg-hue-tint/g)).toHaveLength(3)
    })

    it("take every price from the pricing payload", () => {
        expect(html).toContain(fmtINR(31337))
        expect(html).toContain(fmtINR(12345))
        expect(html).toContain("Up to 42 people, run by us")
        expect(html).not.toContain(fmtINR(defaultPricing.lifetime_inr))
    })

    it("say what each plan delivers, with the buttons on one line at the foot", () => {
        expect(html.match(/You get: /g)).toHaveLength(3)
        expect(html.match(/flex-1 border-t/g)).toHaveLength(3)
    })
})
