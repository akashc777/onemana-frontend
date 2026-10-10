import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Footer } from "@/components/site/Footer"
import { HomeComparison } from "@/components/site/HomeComparison"
import { Nav } from "@/components/site/Nav"
import { hueFor } from "@/lib/campHue"
import { defaultPricing } from "@/lib/pricing"

/**
 * Products are named with their marks in the comparisons: OneCamp's logo, and
 * each rival's identity square, the same hue on every page because it is
 * worked out from the name.
 */
describe("names in the comparison table", () => {
    const html = renderToString(<HomeComparison pricing={defaultPricing} />)
    const head = html.slice(html.indexOf("<thead"), html.indexOf("</thead>"))

    it("puts OneCamp's logo on its column and a hued square on each rival's", () => {
        expect(head).toContain('id="ocLogoGradHomeTable"')
        for (const rival of ["Slack + Notion + Zoom", "Mattermost", "Huly"]) {
            expect(head).toContain(`data-hue="${hueFor(rival)}"`)
        }
    })

    it("never repeats the logo's gradient id on a page that also has the nav and footer", () => {
        const page = renderToString(
            <>
                <Nav />
                <HomeComparison pricing={defaultPricing} />
                <Footer />
            </>,
        )
        const ids = [...page.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1])
        expect(ids.length).toBeGreaterThanOrEqual(3)
        expect(new Set(ids).size).toBe(ids.length)
    })
})
