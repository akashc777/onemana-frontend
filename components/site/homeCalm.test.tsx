import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { FactsStrip } from "@/components/site/FactsStrip"
import { defaultPricing } from "@/lib/pricing"
import { CloseOrbit } from "@/components/ui/graphics/v3marks"

/**
 * The home page moves only where the visitor asks it to, but for its one
 * ambient element, the hero's story (INTERACTION_SPEC.md §1.1). The audit
 * found a second (the close's orbit, turning for as long as it was in view),
 * a spark burst on scroll with nothing asked, and tiles and a dot that
 * popped and pinged on load (storefront audit H19, H4, H7).
 */
const read = (rel: string) => readFileSync(resolve(__dirname, "../..", rel), "utf8")

describe("the home page's calm", () => {
  it("the close's orbit holds still", () => {
    const html = renderToString(<CloseOrbit />)
    expect(html).not.toMatch(/spin-(40|60|90r)/)
    expect(html.match(/<circle/g)?.length).toBe(8)
  })

  it("the close bursts on intent (a way in under the pointer or reached by key), never on scroll", () => {
    const src = read("components/site/CloseSpot.tsx")
    expect(src).not.toContain("IntersectionObserver")
    expect(src).toContain('addEventListener("pointerover", onIntent)')
    expect(src).toContain('addEventListener("focusin", onIntent)')
    expect(src).toMatch(/closest\("a, button"\)/)
    expect(src).toContain("prefers-reduced-motion: reduce")
  })

  it("nothing in the hero pops or pings on load", () => {
    const page = read("app/page.tsx")
    expect(page).not.toMatch(/\bin-pop\b/)
    expect(renderToString(<FactsStrip release={null} pricing={defaultPricing} />)).not.toMatch(/\bin-ping\b/)
  })
})
