import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The home page ends in one section of its own, not two template blocks.
 *
 * It ended on a centred band (claim, two buttons) and then a separate email
 * strip, the last two blocks of every SaaS template, after a pricing grid and
 * an accordion. The close is now one section on the page's grid: the claim on
 * the left, the two ways in on the right, and the release-notes form under
 * them as the quieter option.
 */
const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8")
const close = page.slice(page.indexOf('<Section id="start"'))

describe("the close of the home page", () => {
    // The one centred line is the phone's shared hint under the stacked
    // buttons (site.md H1); every heading and block is left-aligned.
    it("is one section, left-aligned, with nothing centred but the phone's hint", () => {
        expect(close.length, "no close section").toBeGreaterThan(100)
        expect(page.match(/text-center/g) ?? []).toHaveLength(1)
        expect(page).toMatch(/text-center text-\[12\.5px\][^"]*sm:hidden/)
        expect(page).not.toMatch(/justify-center/)
    })

    it("sits on the neutral muted ground (v3.1: no area's hue) with the 280px welcome spot", () => {
        expect(page).toMatch(/<Section id="start" tone="muted">/)
        expect(close.indexOf("<CloseSpot")).toBeGreaterThan(-1)
        expect(close.indexOf("<CloseSpot")).toBeLessThan(close.indexOf("this is for you."))
    })

    it("holds the claim, both ways in and the email form, in that order", () => {
        const claim = close.indexOf("this is for you.")
        const demo = close.indexOf("Try the live demo")
        const form = close.indexOf("<SubscribeForm")
        expect(claim).toBeGreaterThan(-1)
        expect(demo).toBeGreaterThan(claim)
        expect(form).toBeGreaterThan(demo)
        // Nothing after it: the email strip that followed it is gone.
        expect(close.indexOf("<section", form)).toBe(-1)
    })
})
