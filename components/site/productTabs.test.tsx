import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it } from "vitest"

import { ProductTabs, SHOT_SIZES, warm } from "@/components/site/ProductTabs"

/**
 * A tab's screenshot starts downloading when the pointer or the keyboard
 * reaches the tab, not when it is chosen.
 *
 * Choosing a tab used to show an empty frame while a 60 to 90 kB image came
 * down. The warm-up must ask for exactly the file the panel will draw, or the
 * download is wasted and the frame is still empty: same source and the same
 * sizes, so the browser picks the same width from the same srcset.
 */
type FakeImage = { sizes: string; srcset: string; src: string }
const made: FakeImage[] = []
const g = globalThis as Record<string, unknown>

function stubBrowser(dark: boolean) {
    made.length = 0
    g.window = { location: { href: "http://localhost/" } }
    g.document = { documentElement: { classList: { contains: (c: string) => dark && c === "dark" } } }
    g.Image = class {
        sizes = ""
        srcset = ""
        src = ""
        constructor() {
            made.push(this)
        }
    }
}

afterEach(() => {
    delete g.window
    delete g.document
    delete g.Image
})

describe("warming a product tab", () => {
    it("asks for the screenshot the panel will draw, in the theme on screen", () => {
        stubBrowser(true)
        warm("tasks")
        expect(made).toHaveLength(1)
        expect(made[0].sizes).toBe(SHOT_SIZES)
        expect(made[0].srcset).toContain("tasks-dark.webp")
        expect(made[0].srcset).not.toContain("tasks-light.webp")
    })

    it("asks once per file", () => {
        stubBrowser(false)
        warm("calendar")
        warm("calendar")
        expect(made).toHaveLength(1)
    })

    it("draws the panel at the same sizes the warm-up asked for", () => {
        const html = renderToString(<ProductTabs />)
        const img = html.match(/<img\b[^>]*>/)?.[0] ?? ""
        expect(img).toContain(`sizes="${SHOT_SIZES}"`)
    })
})

/**
 * Each surface keeps one camp hue from its tab to its picture: a tile on the
 * tab, the tint on the screenshot's stage.
 */
describe("the product tabs' colour", () => {
    const html = renderToString(<ProductTabs />)

    it("gives every tab a tile in its own hue, in the palette's chart order", () => {
        const tiles = [...html.matchAll(/<span aria-hidden="true" class="(hue-[a-z]+) [^"]*bg-hue-tint/g)].map((m) => m[1])
        expect(tiles).toEqual(["hue-sky", "hue-moss", "hue-sun", "hue-dusk", "hue-berry"])
    })

    it("sets the chosen surface's screenshot on that hue's tint", () => {
        const panel = html.slice(html.indexOf('role="tabpanel"'))
        expect(panel).toMatch(/class="rounded-lg border [^"]*hue-sky border-hue\/25 bg-hue-tint/)
    })
})
