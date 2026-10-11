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

    // Design v3 (DESIGN_V3 §3.9, site.md OG1): the page's own mark and
    // people. A person is white initials on her avatar gradient, the agent is
    // its spark square with no initials, a channel carries no hue, and the
    // logo is the gradient ring the nav draws, not the flat one.
    it("draws the workspace's channel, person and agent as the site does", () => {
        for (const label of ["engineering", "Priya", "Release Captain", "Agent"]) expect(html).toContain(label)
        expect(html).toContain(`linear-gradient(140deg, ${OG.camp.berry.a1}, ${OG.camp.berry.a2})`)
        expect(html).toContain(`linear-gradient(140deg, ${OG.agent.a1}, ${OG.agent.a2})`)
        expect(html).not.toContain(">RC<")
        expect(html).toContain('stroke="url(#og-ring)"')
        expect(html).not.toMatch(/#c84f00/i)
        for (const hue of ["sky", "moss", "sun", "lake", "berry"] as const) expect(html.toLowerCase()).toContain(OG.camp[hue].strong.toLowerCase())
    })

    it("takes its palette from the one table: the white sheet and the v3 ink", () => {
        expect(OG.page).toBe("#FFFFFF")
        expect(OG.text).toBe("#16171B")
        expect(OG.text2).toBe("#5B5D65")
        expect(OG.text3).toBe("#8A8C92")
        expect(OG.paper).toBe("#F7F4F1")
    })

    it("is a new version, so social caches fetch it again", () => {
        expect(OG_IMAGE_VERSION).toBe("7")
        const buy = readFileSync(join(process.cwd(), "app/buy/layout.tsx"), "utf8")
        expect(buy).toContain("/buy/opengraph-image?v=7")
        expect(buy).not.toContain("?v=6")
    })
})

/**
 * The buy card's money (site.md OG2): rupees from getPricing, with the sign
 * when its glyph could be fetched and "INR" when not, and en-US grouping,
 * since the card is seen worldwide.
 */
describe("the buy card's prices", () => {
    const src = readFileSync(join(process.cwd(), "app/buy/opengraph-image.tsx"), "utf8")
    it("come from getPricing, in en-US grouping, never lakh", () => {
        expect(src).toContain("getPricing()")
        expect(src).not.toContain('toLocaleString("en-IN")')
        expect(src).toContain('toLocaleString("en-US")')
    })
    it("write the rupee sign only when its glyph is loaded, and INR otherwise", () => {
        expect(src).toContain("loadRupeeFont()")
        expect(src).toMatch(/rupeeFont \? `₹\$\{/)
        expect(src).toContain("`INR ${")
        const fonts = readFileSync(join(process.cwd(), "lib/og-fonts.ts"), "utf8")
        expect(fonts).toContain("text=%E2%82%B9")
        expect(fonts).toMatch(/catch \{\s*return null/)
    })
})
