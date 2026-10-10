import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Nav } from "@/components/site/Nav"
import { ThemeToggle } from "@/components/site/ThemeToggle"

/**
 * The nav, rendered on the server the way a phone first receives it.
 */
describe("the nav on a phone", () => {
    const html = renderToString(<Nav />)
    const menuStart = html.indexOf('id="mobile-menu"')

    it("keeps Pricing beside the menu button, so the way to buy is one tap away", () => {
        // On a phone every link was inside the closed menu: pricing, and so
        // the buy path, was two taps from any page.
        const phoneBar = html.slice(html.lastIndexOf('lg:hidden"', menuStart), menuStart)
        expect(phoneBar).toMatch(/<a[^>]*href="\/pricing"[^>]*>Pricing<\/a>/)
    })

    it("draws the menu on the server, closed, as a panel the button controls", () => {
        expect(menuStart).toBeGreaterThan(-1)
        expect(html).toMatch(/<div id="mobile-menu" hidden=""/)
        expect(html).toMatch(/aria-controls="mobile-menu"/)
        expect(html).toMatch(/aria-expanded="false"/)
    })
})

describe("the theme switch", () => {
    const html = renderToString(<ThemeToggle />)

    it("is drawn before any script runs, with both names and icons for CSS to choose", () => {
        // It rendered an empty square until a mounted flag flipped, and the
        // icon popped in after hydration.
        expect(html).toMatch(/^<button/)
        expect(html).toContain('<span class="sr-only dark:hidden">Switch to dark mode</span>')
        expect(html).toContain('<span class="sr-only hidden dark:inline">Switch to light mode</span>')
        expect(html.match(/<svg/g)).toHaveLength(2)
    })
})
