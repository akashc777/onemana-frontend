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
        for (const img of imgs(html)) expect(img).not.toMatch(/aria-hidden/)
    })
})

/**
 * The phone hero is described as the phone screenshot it is.
 *
 * It was one <picture> per theme with a <source> for phones, which kept the
 * download to one file but could not carry an alt: a <source> has none, so a
 * phone reader heard the desktop description, sidebar and all. Now each width
 * is its own <img> with its own alt, and CSS shows one per theme and width.
 */
describe("the hero on a phone and on a wide screen", () => {
    const html = renderToString(<HeroShot alt="The #engineering channel." phoneAlt="The channel on a phone." />)
    const found = imgs(html)
    const srcOf = (img: string) => img.match(/\bsrc="([^"]*)"/)?.[1] ?? ""

    it("gives the phone screenshot the phone description", () => {
        const phone = found.filter((img) => srcOf(img).includes("channel-phone-"))
        expect(phone).toHaveLength(2)
        for (const img of phone) expect(altOf(img), img).toBe("The channel on a phone.")
    })

    it("gives the wide screenshot the wide description", () => {
        const wide = found.filter((img) => !srcOf(img).includes("channel-phone-"))
        expect(wide).toHaveLength(2)
        for (const img of wide) expect(altOf(img), img).toBe("The #engineering channel.")
    })

    it("has no <source>, which could pick a file but never describe it", () => {
        expect(html).not.toMatch(/<source\b/)
    })

    it("still downloads one image: every copy is lazy, and CSS hides all but one", () => {
        // A lazy image that is display:none is never fetched. Eager would
        // download all four on every visit, as preloading them once did.
        for (const img of found) {
            expect(img, img).toMatch(/loading="lazy"/)
            expect(img, img).not.toMatch(/fetchpriority="high"[^>]*loading="eager"/)
        }
        // One width per breakpoint...
        for (const img of found) {
            const cls = img.match(/\bclass="([^"]*)"/)?.[1] ?? ""
            if (srcOf(img).includes("channel-phone-")) expect(cls).toMatch(/\bsm:hidden\b/)
            else expect(cls).toMatch(/\bhidden sm:block\b/)
        }
        // ...and one theme per class on <html>.
        expect(html).toMatch(/<div class="dark:hidden">/)
        expect(html).toMatch(/<div class="hidden dark:block">/)
    })
})

/**
 * The hero sits on its canvas: the camp tint with the ring and orbit turning
 * behind the shot, and real things from the shot named on it. The notes stay
 * under the canvas, where the chips cannot cover them.
 */
describe("the hero's canvas", () => {
    const html = renderToString(
        <HeroShot
            alt="The #engineering channel."
            phoneAlt="The channel on a phone."
            hue="sky"
            notes={[{ x: 10, y: 10, text: "A note." }]}
            things={[
                { label: "#engineering", kind: "channel" },
                { label: "Maya Chen", kind: "person" },
                { label: "Release Captain", kind: "agent" },
            ]}
        />,
    )

    it("frames the shot on the orbit, in the hue it is given", () => {
        expect(html).toMatch(/class="hue-sky relative isolate overflow-hidden rounded-2xl bg-hue-tint/)
        expect(html).toContain("orbit-turn")
    })

    it("names the shot's own things on it", () => {
        for (const t of ["#engineering", "Maya Chen", "Release Captain"]) expect(html).toContain(t)
    })

    it("keeps the notes outside the canvas", () => {
        const canvasEnd = html.lastIndexOf("</div>", html.indexOf("<figcaption"))
        expect(html.indexOf("<figcaption")).toBeGreaterThan(canvasEnd)
        expect(html.slice(html.indexOf("<figcaption"))).toContain("A note.")
    })
})
