import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import FreePage from "@/app/free/page"
import { GuaranteeList } from "@/components/site/GuaranteeList"
import { PLAN_HUE } from "@/components/site/planHues"

/**
 * A plan's hue follows it onto the pages where it is chosen, and a band's hue
 * onto the numbers inside it.
 */
describe("hues that follow a thing", () => {
    // Ticks are a 16px moss check everywhere (site.md H9).
    // Since v3.1 a plan is no area: its checks take the meaning colour for
    // "included" (success), its ground is neutral, and the areas it holds
    // show as one row of tiles in their own colours.
    it("ticks the free plan's list on /free with the included check, on a neutral ground, under the areas", () => {
        const html = renderToString(<FreePage />)
        const list = html.slice(html.indexOf("What the free plan includes"))
        expect(list).toMatch(/<svg viewBox="0 0 24 24" width="16" height="16"[^>]*class="icon shrink-0 mt-0\.5 text-success"/)
        expect(list).toContain("Includes chat, calls, docs, projects, calendar, tables and agents.")
        expect(html).not.toContain("data-band=")
    })

    it("shows the areas and the ticks in the checkout summary, with no plan hue", () => {
        // The checkout needs the app router to render, so its source is read.
        const src = readFileSync(join(process.cwd(), "app/buy/BuyCheckout.tsx"), "utf8")
        expect(src).not.toContain("PLAN_HUE")
        expect(src).toContain("<AreaRow")
        expect(src).toContain("<PlanBenefit key={b}>{b}</PlanBenefit>")
        expect(src).not.toContain("✓")
    })

    it("numbers the guarantees in the band's ink when they sit on one", () => {
        const html = renderToString(<GuaranteeList items={[{ title: "A", body: "B" }]} layout="row" hue="dusk" />)
        expect(html).toContain("hue-dusk flex size-7 items-center justify-center rounded-md bg-card")
    })
})
