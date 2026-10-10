import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HeroShot, ProductShot } from "@/components/site/ProductShot"

/**
 * Every screenshot is in the page twice, once per theme, and CSS shows one.
 *
 * The dark copy was alt="" and aria-hidden, so in dark mode a screen reader
 * met the hero and every product tab as nothing at all: the light copy, the
 * only one with words, was display:none. Both copies now carry the alt, and
 * display:none is what keeps the hidden one from being read twice.
 */
const imgs = (html: string) => html.match(/<img\b[^>]*>/g) ?? []
const altOf = (img: string) => img.match(/\balt="([^"]*)"/)?.[1]

describe("screenshots in both themes", () => {
    it("gives the light and the dark product shot the same description", () => {
        const html = renderToString(<ProductShot name="docs" alt="The Q4 launch plan in the editor." />)
        const found = imgs(html)
        expect(found).toHaveLength(2)
        for (const img of found) {
            expect(altOf(img), img).toBe("The Q4 launch plan in the editor.")
            expect(img, "a theme's image is hidden from screen readers").not.toMatch(/aria-hidden/)
        }
    })

    it("describes the hero in both themes", () => {
        const html = renderToString(<HeroShot alt="The #engineering channel." phoneAlt="The channel on a phone." />)
        const found = imgs(html)
        expect(found).toHaveLength(2)
        for (const img of found) {
            expect(altOf(img), img).toBe("The #engineering channel.")
            expect(img).not.toMatch(/aria-hidden/)
        }
    })
})
