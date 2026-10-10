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

    it("drops the grid, the glow and the heavy weights", () => {
        expect(html).not.toMatch(/linear-gradient\(#e8eaed|radial-gradient/)
        expect(html).not.toMatch(/font-weight:(700|800)/)
    })

    it("draws the workspace's channel, person and agent in the camp hues", () => {
        for (const label of ["engineering", "Priya", "Release Captain"]) expect(html).toContain(label)
        for (const hue of ["sky", "berry", "dusk"] as const) expect(html.toLowerCase()).toContain(OG.camp[hue].strong.toLowerCase())
    })

    it("is a new version, so social caches fetch it again", () => {
        expect(OG_IMAGE_VERSION).toBe("5")
        const buy = readFileSync(join(process.cwd(), "app/buy/layout.tsx"), "utf8")
        expect(buy).toContain("/buy/opengraph-image?v=5")
        expect(buy).not.toContain("?v=4")
    })
})
