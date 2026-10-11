import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AudienceView } from "@/components/site/AudienceView"
import { FEATURE_MARK } from "@/components/site/featureMarks"
import { PLAN_HUE } from "@/components/site/planHues"
import { alternativeBySlug } from "@/lib/alternatives"
import { audienceBySlug } from "@/lib/audiences"
import { productHue } from "@/components/site/productHues"
import { defaultPricing } from "@/lib/pricing"

/**
 * The /for and /alternatives pages carry colour that means something: each
 * claim in its feature's hue, the rival in its own identity colour, and each
 * price in its plan's hue.
 */
describe("an alternatives page", () => {
    const a = alternativeBySlug("slack")!
    const html = renderToString(<AudienceView a={a} pricing={{ ...defaultPricing, cloud_configured: true }} />)

    it("gives every claim a tile in its feature's hue", () => {
        const tiles = [...html.matchAll(/<span aria-hidden="true" class="(hue-[a-z]+) inline-flex shrink-0 items-center justify-center bg-hue-tint/g)].map((m) => m[1])
        expect(tiles).toEqual(a.points.map((p) => `hue-${FEATURE_MARK[p.icon].hue}`))
    })

    it("marks the rival with the colour it has in every comparison", () => {
        const heading = html.slice(html.indexOf('id="they-win"'), html.indexOf("</h2>", html.indexOf('id="they-win"')))
        expect(heading).toContain(`data-hue="${productHue(a.rival!.name)}"`)
    })

    it("puts where the rival is better, and how to move, on the rival's own band with the import spot", () => {
        expect(html).toContain(`data-band="${productHue(a.rival!.name)}"`)
        const band = html.slice(html.indexOf(`data-band="${productHue(a.rival!.name)}"`))
        expect(band.indexOf('id="they-win"')).toBeGreaterThan(-1)
        expect(band.slice(0, band.indexOf('id="they-win"'))).toContain("<svg")
    })

    it("gives each price its plan's hue", () => {
        expect(html).toContain(`data-hue="${PLAN_HUE.lifetime}"`)
        expect(html).toContain(`data-hue="${PLAN_HUE.cloud}"`)
    })
})

// Design v3 (site.md AU1, AU4): one camp canvas per page, its product crop
// described; the record on a compact night card, its rows in the night tone.
describe("the compliance page", () => {
    const html = renderToString(<AudienceView a={audienceBySlug("compliance")!} pricing={defaultPricing} />)

    it("opens on one camp canvas, with a described product crop", () => {
        expect(html.match(/class="camp-canvas/g)).toHaveLength(1)
        expect(html).toMatch(/<img[^>]*alt="OneCamp&#x27;s record of what agents did/)
    })

    it("shows the record on a night card", () => {
        const card = html.slice(html.indexOf("data-record"))
        expect(card).toMatch(/^data-record="true" class="night /)
        expect(card.indexOf("What the record looks like")).toBeGreaterThan(-1)
        expect(card).toContain("border-camp-berry")
    })
})
