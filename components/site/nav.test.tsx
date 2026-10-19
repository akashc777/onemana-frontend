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
        // The label sits in a span that holds its 510 width (data-label).
        expect(phoneBar).toMatch(/<a[^>]*href="\/pricing"[^>]*><span data-label="Pricing">Pricing<\/span><\/a>/)
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

    it("is drawn before any script runs, with every name and icon for CSS to choose", () => {
        // It rendered an empty square until a mounted flag flipped, and the
        // icon popped in after hydration. Three states since 19 Oct 2026:
        // System, Light and Dark (themeChoice.test.tsx).
        expect(html).toMatch(/^<button/)
        expect(html).toMatch(/<span class="sr-only \[html\[data-theme-choice=light\]_&amp;\]:hidden \[html\[data-theme-choice=dark\]_&amp;\]:hidden">Theme follows your device\. Change theme<\/span>/)
        expect(html).toContain('<span class="sr-only hidden [html[data-theme-choice=light]_&amp;]:inline">Theme is light. Change theme</span>')
        expect(html).toContain('<span class="sr-only hidden [html[data-theme-choice=dark]_&amp;]:inline">Theme is dark. Change theme</span>')
        expect(html.match(/<svg/g)).toHaveLength(3)
    })
})
