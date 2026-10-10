import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { CloudPlanCard } from "@/components/site/CloudPlanCard"
import { PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
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

    it("say what each plan delivers", () => {
        expect(html.match(/You get: /g)).toHaveLength(3)
    })

    // At 768 px the headers and descriptions wrapped to different heights and
    // the prices and "You get" lines drifted out of line. Side by side, the
    // cards now share a subgrid of seven rows, one per part, so each part
    // lines up across the three whatever wraps.
    it("share one row grid side by side, a row per part", () => {
        const cards = html.match(/<div class="hue-[a-z]+ flex flex-col[^"]*"/g) ?? []
        expect(cards).toHaveLength(3)
        for (const c of cards) expect(c).toContain("md:row-span-7 md:grid md:grid-rows-subgrid md:gap-y-0")
        const first = html.slice(html.indexOf(cards[0]!), html.indexOf(cards[1]!))
        // header, price, estimate, who it is for, what it is, what you get, button
        expect(first.match(/^<div class="hue-[^"]*">(<div|<p)/)).not.toBeNull()
        expect((first.match(/<\/p><(p|div) class=/g) ?? []).length + 1).toBeGreaterThanOrEqual(6)
    })
})

/**
 * A plan keeps its hue wherever it appears: the Cloud card under the columns,
 * and each option's name in the plan table.
 */

describe("a plan's colour follows it", () => {
    it("draws the Cloud card as Cloud's plan card", () => {
        const html = renderToString(<CloudPlanCard pricing={defaultPricing} />)
        expect(html).toMatch(new RegExp(`^<div class="hue-${PLAN_HUE.cloud} flex flex-col`))
        // The estimate and the seats are lines of their own, not middle dots.
        expect(html).not.toContain(" · ")
    })

    it("marks each option in the plan table with its plan's hue", () => {
        const html = renderToString(<PlanComparison pricing={defaultPricing} />)
        const head = html.slice(html.indexOf("<thead"), html.indexOf("</thead>"))
        const hues = [...head.matchAll(/data-hue="([a-z]+)"/g)].map((m) => m[1])
        expect(hues).toEqual([PLAN_HUE.source, PLAN_HUE.free, PLAN_HUE.lifetime, PLAN_HUE.cloud])
    })
})

/**
 * Stacked on a phone, the free plan's card showed a blank line where the
 * others show "≈ $258 at today's rate": its estimate line is empty and held
 * a minimum height. It is hidden while empty below md and keeps its subgrid
 * row from md, where the cards sit side by side.
 */
describe("the free plan's card on a phone", () => {
    it("has no blank line for the estimate it does not have", () => {
        const html = renderToString(<PlanColumns pricing={defaultPricing} />)
        const estimates = html.match(/<p class="mt-1 px-6 text-caption[^"]*">[^<]*<\/p>/g) ?? []
        expect(estimates).toHaveLength(3)
        for (const e of estimates) expect(e).toContain("empty:hidden md:empty:block")
        expect(estimates[0]).toMatch(/"><\/p>$/)
        expect(html).not.toContain("min-h-5 px-6")
    })
})
