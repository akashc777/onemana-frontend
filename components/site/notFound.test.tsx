import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import NotFound from "@/app/not-found"

/**
 * A missing page is written down like everything else, and is a little
 * playful about it: the ring with a piece out, and three ways on as cards.
 */
describe("the 404", () => {
    const html = renderToString(<NotFound />)

    it("shows the missing ring, the app's own picture for something gone", () => {
        // SpotError's broken ring: the arc that stops short of closing.
        expect(html).toContain("M65.3 38A20 20 0 1 1 51.5 28.3")
    })

    it("keeps the record row of the request", () => {
        expect(html).toContain("page.not_found")
    })

    // Design v3 (site.md N1): a fourth card, the docs' search.
    it("offers the usual destinations as cards that answer the pointer", () => {
        const cards = html.match(/<a[^>]*class="lift[^"]*"[^>]*>/g) ?? []
        expect(cards.map((a) => a.match(/href="([^"]+)"/)?.[1])).toEqual(["/", "/pricing", "/docs", "/docs#search"])
    })
})
