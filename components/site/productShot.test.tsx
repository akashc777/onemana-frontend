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
        const html = renderToString(<ProductShot name="docs" hue="dusk" alt="The Q4 launch plan in the editor." />)
        const found = imgs(html)
        expect(found).toHaveLength(2)
        for (const img of found) {
            expect(altOf(img), img).toBe("The Q4 launch plan in the editor.")
            expect(img, "a theme's image is hidden from screen readers").not.toMatch(/aria-hidden/)
        }
    })

    it("describes the hero in both themes", () => {
        const html = renderToString(<HeroShot alt="The #engineering channel." phoneAlt="The channel on a phone." />)
        for (const img of imgs(html)) expect(img).not.toMatch(/aria-hidden/)
    })
})

/**
 * The hero (site.md H2, S18, G8): each breakpoint's picture is eager and at
 * high priority, because it is the LCP candidate; a <picture> chooses the
 * theme by the system setting and resolves to a 1px gif at the other
 * breakpoint, so one screenshot downloads. Each width's <img> carries its
 * own alt, which a <source> could not. A reader who chose the other theme
 * gets a lazy copy, shown by CSS only then.
 */
describe("the hero on a phone and on a wide screen", () => {
    const html = renderToString(<HeroShot alt="The #engineering channel." phoneAlt="The channel on a phone." />)
    const found = imgs(html)
    const srcOf = (img: string) => img.match(/\bsrc="([^"]*)"/)?.[1] ?? ""

    it("gives the phone screenshot the phone description", () => {
        const phone = found.filter((img) => srcOf(img).includes("channel-phone-"))
        expect(phone).toHaveLength(3)
        for (const img of phone) expect(altOf(img), img).toBe("The channel on a phone.")
    })

    it("gives the wide screenshot the wide description", () => {
        const wide = found.filter((img) => !srcOf(img).includes("channel-phone-"))
        expect(wide).toHaveLength(3)
        for (const img of wide) expect(altOf(img), img).toBe("The #engineering channel.")
    })

    it("loads the hero eagerly, once: each picture's other breakpoint is a 1px gif", () => {
        const pictures = html.match(/<picture[\s\S]*?<\/picture>/g) ?? []
        expect(pictures).toHaveLength(2)
        for (const p of pictures) {
            expect(p).toMatch(/<source media="\((max|min)-width: 6(39|40)px\)" srcset="data:image\/gif/i)
            expect(p).toMatch(/<source media="\(prefers-color-scheme: dark\)"/)
            expect(p).toMatch(/fetchpriority="high"/)
            expect(p).toMatch(/loading="eager"/)
        }
        const alts = found.filter((img) => /hero-alt/.test(img))
        expect(alts).toHaveLength(4)
        for (const img of alts) expect(img).toMatch(/loading="lazy"/)
    })

    it("draws the shot at 1:1 with its size set, never scaled", () => {
        for (const img of found) expect(img).toMatch(/width="(1120|390)"/)
        expect(html).not.toContain("w-[220%]")
    })
})

/**
 * The camp canvas: at most two floating chips, each naming a real thing in
 * the shot, and no numbered markers.
 */
describe("the hero's canvas", () => {
    const html = renderToString(<HeroShot alt="The #engineering channel, with the Release Captain agent." phoneAlt="The channel on a phone." />)

    it("is the camp canvas, with its grain", () => {
        expect(html).toContain("camp-canvas")
        expect(html).toContain("camp-grain")
    })

    it("names at most two of the shot's own things, and carries no markers", () => {
        expect(html.match(/in-chip/g)).toHaveLength(2)
        for (const t of ["Release Captain", "engineering"]) expect(html).toContain(t)
        expect(html).not.toMatch(/font-mono text-caption font-medium text-background/)
    })
})
