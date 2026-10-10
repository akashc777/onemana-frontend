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
    it("ticks the free plan's list on /free in the free plan's hue", () => {
        const html = renderToString(<FreePage />)
        const list = html.slice(html.indexOf("What the free plan includes"))
        expect(list).toContain(`hue-${PLAN_HUE.free}`)
        expect(list).toMatch(/<svg class="mt-0\.5 size-4 shrink-0 text-hue"/)
        // ...and the details sit on the free plan's band.
        expect(html).toContain(`data-band="${PLAN_HUE.free}"`)
    })

    it("shows the chosen plan's hue and ticks in the checkout summary", () => {
        // The checkout needs the app router to render, so its source is read.
        const src = readFileSync(join(process.cwd(), "app/buy/BuyCheckout.tsx"), "utf8")
        expect(src).toContain("HUE_CLASS[isCloud ? PLAN_HUE.cloud : PLAN_HUE.lifetime]")
        expect(src).toContain("<PlanBenefit key={b}>{b}</PlanBenefit>")
        expect(src).not.toContain("✓")
    })

    it("numbers the guarantees in the band's ink when they sit on one", () => {
        const html = renderToString(<GuaranteeList items={[{ title: "A", body: "B" }]} layout="row" hue="dusk" />)
        expect(html).toContain("hue-dusk flex size-7 items-center justify-center rounded-md bg-card")
    })
})
