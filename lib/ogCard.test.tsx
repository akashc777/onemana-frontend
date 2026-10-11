import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { OG, OG_IMAGE_VERSION, OgCard } from "@/lib/og-card"

/**
 * The link preview looks like the site: the logo's ring with the workspace's
 * real things around it in the camp hues, the home page's headline at weight
 * 600, and none of the old card's decoration.
 */
describe("the link preview card", () => {
    const html = renderToString(<OgCard />)

    // Design v3 (site.md OG1) brings the camp canvas's light back, once, on
    // the paper at the right; the old grid and heavy weights stay gone.
    it("drops the grid and the heavy weights, and lights only the mini canvas", () => {
        expect(html).not.toMatch(/linear-gradient\(#e8eaed/)
        expect(html).not.toMatch(/font-weight:(700|800)/)
        expect(html.match(/radial-gradient\(circle at 78% -10%/g)).toHaveLength(1)
        expect(html).toContain("background-color:#F7F4F1")
    })

    it("sets the hero's two tones", () => {
        expect(html).toContain("color:#8A8C92")
        expect(html).toContain("on a server you own.")
    })

    it("draws the workspace's channel, person and agent in the camp hues", () => {
        for (const label of ["engineering", "Priya", "Release Captain"]) expect(html).toContain(label)
        for (const hue of ["sky", "berry", "dusk"] as const) expect(html.toLowerCase()).toContain(OG.camp[hue].strong.toLowerCase())
    })

    it("is a new version, so social caches fetch it again", () => {
        expect(OG_IMAGE_VERSION).toBe("6")
        const buy = readFileSync(join(process.cwd(), "app/buy/layout.tsx"), "utf8")
        expect(buy).toContain("/buy/opengraph-image?v=5")
        expect(buy).not.toContain("?v=4")
    })
})
