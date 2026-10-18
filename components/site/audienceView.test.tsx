import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AudienceView } from "@/components/site/AudienceView"
import { FEATURE_MARK } from "@/components/site/featureMarks"
import { hueOrAgent } from "@/components/ui/graphics/hues"
import { alternativeBySlug } from "@/lib/alternatives"
import { audienceBySlug } from "@/lib/audiences"
import { productHue } from "@/components/site/productHues"
import { defaultPricing } from "@/lib/pricing"
import { AREA } from "@/lib/areas"

/**
 * The /for and /alternatives pages carry colour that means something: each
 * claim in its feature's hue, the rival in its own identity colour, and each
 * price in its plan's hue.
 */
describe("an alternatives page", () => {
    const a = alternativeBySlug("slack")!
    const html = renderToString(<AudienceView a={a} pricing={{ ...defaultPricing, cloud_configured: true }} />)

    it("gives every claim a tile in its feature's hue, the hue the home page gives that surface", () => {
        const dl = html.slice(html.indexOf("<dl"), html.indexOf("</dl>"))
        const tiles = [...dl.matchAll(/<span aria-hidden="true" class="([^ "]+)[^"]*\binline-flex shrink-0 items-center justify-center bg-hue-tint/g)].map((m) => m[1])
        expect(tiles).toEqual(a.points.map((p) => hueOrAgent(FEATURE_MARK[p.icon].hue).split(" ")[0]))
        // Design v3.1: each feature takes its area's hue (lib/areas.ts); no area, neutral ink.
        expect(FEATURE_MARK.chat.hue).toBe("sky")
        expect(FEATURE_MARK.video.hue).toBe("berry")
        expect(FEATURE_MARK.docs.hue).toBe("dusk")
        expect(FEATURE_MARK.agent.hue).toBe("agent")
        expect(FEATURE_MARK.ai.hue).toBe("agent")
        expect(FEATURE_MARK.lock.hue).toBe("ink")
    })

    it("marks the rival with the colour it has in every comparison", () => {
        const heading = html.slice(html.indexOf('id="they-win"'), html.indexOf("</h2>", html.indexOf('id="they-win"')))
        expect(heading).toContain(`data-hue="${productHue(a.rival!.name)}"`)
    })

    it("puts where the rival is better, and how to move, on the band of the area it replaces (Slack: chat), with the import spot", () => {
        expect(html).toContain(`data-band="${AREA.chat.hue}"`)
        const band = html.slice(html.indexOf(`data-band="${AREA.chat.hue}"`))
        expect(band.indexOf('id="they-win"')).toBeGreaterThan(-1)
        // The spot for a finished import heads the "Moving from" card, not
        // floating on its own above both cards.
        const start = band.indexOf('aria-labelledby="move"')
        expect(band.slice(start, band.indexOf("</section>", start))).toContain("<svg")
        expect(band.slice(0, band.indexOf('id="they-win"'))).not.toContain("<svg")
    })

    it("draws each price neutral: a plan is no area (v3.1)", () => {
        const prices = html.slice(html.indexOf("Own it") - 400, html.indexOf("Own it") + 2000)
        expect(prices).not.toMatch(/data-hue=/)
    })
})

// Design v3 (site.md AU1, AU4): one camp canvas per page, its product crop
// described; the record on a compact night card, its rows in the night tone.
describe("the compliance page", () => {
    const html = renderToString(<AudienceView a={audienceBySlug("compliance")!} pricing={defaultPricing} />)

    it("opens on one camp canvas, with the product drawn beside it and described", () => {
        expect(html.match(/class="camp-canvas/g)).toHaveLength(1)
        // The record, as the app draws it on a phone (components/site/showcase): one picture, never a screenshot.
        expect(html).not.toMatch(/<img\b/)
        expect(html).toMatch(/<div role="img" aria-label="OneCamp&#x27;s record of what an agent did/)
    })

    it("shows the record on a night card", () => {
        const card = html.slice(html.indexOf("data-record"))
        expect(card).toMatch(/^data-record="true" class="night /)
        expect(card.indexOf("What the record looks like")).toBeGreaterThan(-1)
        expect(card).toContain("border-camp-berry")
    })
})
