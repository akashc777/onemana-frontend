import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { CompareView } from "@/components/site/CompareView"
import { Footer } from "@/components/site/Footer"
import { HomeComparison } from "@/components/site/HomeComparison"
import { Nav } from "@/components/site/Nav"
import { PRODUCT_SERIES, SERIES_HUES, productHue } from "@/components/site/productHues"
import { alternatives } from "@/lib/alternatives"
import { hueFor } from "@/lib/campHue"
import { rivals } from "@/lib/compare"
import { defaultPricing } from "@/lib/pricing"

/**
 * Products are named with their marks in the comparisons: OneCamp's logo, and
 * each rival's identity square in its product hue, the same on every page.
 */
describe("names in the comparison table", () => {
    const html = renderToString(<HomeComparison pricing={defaultPricing} />)
    const head = html.slice(html.indexOf("<thead"), html.indexOf("</thead>"))

    it("puts OneCamp's logo on its column and a hued square on each rival's", () => {
        // The one logo: the ring in the campfire gradient, as in the nav.
        expect(head).toMatch(/<linearGradient id="ring[^"]*"/)
        expect(head).not.toContain('stroke="#c84f00"')
        for (const rival of ["Slack + Notion + Zoom", "Mattermost", "Huly"]) {
            expect(head).toContain(`data-hue="${productHue(rival)}"`)
        }
    })

    // The nav's and the footer's rings are drawn in the campfire gradient
    // (design v3, site.md S1); each gradient's id comes from useId, so two on
    // one page can never share one.
    it("draws the one mark in the table, and gives every gradient on a page its own id", () => {
        const page = renderToString(
            <>
                <Nav />
                <HomeComparison pricing={defaultPricing} />
                <Footer />
            </>,
        )
        const ids = [...page.matchAll(/<linearGradient id="([^"]+)"/g)].map((m) => m[1])
        expect(ids.length).toBeGreaterThanOrEqual(2)
        expect(new Set(ids).size).toBe(ids.length)
        // The nav, the table's column and the footer: three gradient rings, no flat one.
        expect(ids.length).toBeGreaterThanOrEqual(3)
        expect(page).not.toContain('stroke="#c84f00"')
    })
})

/** Each product's mark hue, by the name that follows the mark. */
const marks = (html: string) =>
    new Map(
        [...html.matchAll(/data-hue="([a-z]+)"[^>]*>(?:(?!<\/svg>).)*<\/svg>(?:<a [^>]*>)?([^<]+)/g)].map(
            (m) => [m[2]!.trim(), m[1]!] as const,
        ),
    )

/** Neighbours differ, and any six in a row are six hues. */
function readsAsSeries(hues: string[]) {
    expect(hues.every((h, i) => i === 0 || h !== hues[i - 1])).toBe(true)
    const span = Math.min(6, hues.length)
    for (let i = 0; i + span <= hues.length; i++) {
        expect(new Set(hues.slice(i, i + span)).size).toBe(span)
    }
}

/**
 * The products are a categorical series and take the palette in order. The
 * hash of the name put five of the seven /alternatives rivals on lake and
 * /compare's first two rows on sun.
 */
describe("product hues", () => {
    const compare = renderToString(<CompareView pricing={defaultPricing} />)

    it("lists the products as the pages list them", () => {
        expect(PRODUCT_SERIES).toEqual([
            rivals.map((r) => r.name),
            alternatives.flatMap((a) => (a.rival ? [a.rival.name] : [])),
        ])
    })

    it("colours /compare's rivals, in the table's order, as a series", () => {
        const list = compare.slice(compare.indexOf("What the others do better"))
        const hues = [...list.slice(0, list.indexOf("</dl>")).matchAll(/data-hue="([a-z]+)"/g)].map((m) => m[1]!)
        expect(hues).toEqual(rivals.map((r) => productHue(r.name)))
        readsAsSeries(hues)
    })

    it("colours the /alternatives rivals, in the site's order, as a series", () => {
        const hues = alternatives.flatMap((a) => (a.rival ? [productHue(a.rival.name)] : []))
        expect(hues.length).toBeGreaterThanOrEqual(6)
        readsAsSeries(hues)
    })

    it("gives a product the same hue on every page", () => {
        const home = marks(renderToString(<HomeComparison pricing={defaultPricing} />))
        const there = marks(compare)
        const shared = [...home.keys()].filter((name) => there.has(name))
        expect(shared).toEqual(expect.arrayContaining(["Mattermost", "Huly"]))
        for (const name of shared) {
            expect(home.get(name)).toBe(productHue(name))
            expect(there.get(name)).toBe(productHue(name))
        }
    })

    // The charts' order changed in integration (sky, berry, sun, lake, dusk,
    // moss: neighbours ΔE 8 apart for colour-blind readers, where the first
    // order reached 6); the products follow it, as the doc says they do.
    it("takes the hues in the charts' order", () => {
        expect(SERIES_HUES).toEqual(["sky", "berry", "sun", "lake", "dusk", "moss"])
        for (const names of PRODUCT_SERIES) names.forEach((name, i) => expect(productHue(name)).toBe(SERIES_HUES[i % 6]))
    })

    it("leaves a name in neither list on its hash", () => {
        expect(productHue("Slack + Notion + Zoom")).toBe(hueFor("Slack + Notion + Zoom"))
    })
})
