import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ProductTabs } from "@/components/site/ProductTabs"
import { tourScenes } from "@/components/site/showcase/tour"

/**
 * Each surface wears its hue from its chip to its stage (site.md H4, G7):
 * Docs dusk, Tasks moss, Calendar sun, Agents the agent's indigo (never
 * dusk), Ask lake, Chat sky. The tabs never move on their own, only the chosen panel
 * renders, and the surface is OneCamp drawn by its own components
 * (components/site/showcase), never a screenshot.
 */
describe("the product tabs", () => {
    const html = renderToString(<ProductTabs scenes={tourScenes()} />)
    const panel = html.slice(html.indexOf('role="tabpanel"'))

    it("gives every chip a dot in its own hue, in the tour's order", () => {
        const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*class="([^"]*)"/g)].map((m) => m[1]!.split(" ")[0])
        expect(tabs).toEqual(["hue-dusk", "hue-moss", "hue-sun", "[--hue:var(--agent)]", "hue-lake", "hue-sky"])
    })

    it("sets the chosen surface on that hue's stage", () => {
        expect(panel).toMatch(/class="hue-dusk relative isolate overflow-hidden rounded-3xl bg-hue-tint/)
    })

    it("draws the surface as a scene, one picture with words for a screen reader, and no image", () => {
        expect(panel).not.toMatch(/<img\b/)
        const scenes = [...panel.matchAll(/<div role="img" aria-label="([^"]+)" data-scene=""/g)].map((m) => m[1])
        // The desktop scene and the phone's own; CSS shows one.
        expect(scenes).toHaveLength(2)
        for (const label of scenes) expect(label!.length).toBeGreaterThan(40)
    })

    it("renders only the chosen panel's scenes", () => {
        expect(html.match(/data-scene=""/g)).toHaveLength(2)
    })

    it("draws the page's first surface as it is: no stagger until a reader chooses", () => {
        expect(panel).not.toContain("data-sc-entering")
    })
})
