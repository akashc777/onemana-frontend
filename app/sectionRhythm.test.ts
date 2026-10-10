import { readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

import { SECTION_END, SECTION_SPACING } from "@/components/ui/Section"

/**
 * One vertical rhythm between sections, on every page: 144 px between two
 * sections' content on a phone and 208 on a wide screen (a section's 80/112
 * below, the next one's 64/96 above), and a band's edge 64/96 above its
 * content and 80/112 below. Measured before at 1440: the home hero 96 above
 * the product section, /pricing 177 and 161, /verify 128, /buy and the
 * audience pages 144 and 160, the rival bands 56 inside, /free's band 56
 * inside and 56 below the command, and pages ending 64, 81, 96 or 128 above
 * the footer.
 *
 * Pages keep it by using Section, or SECTION_END for a first section that
 * follows a PageHeader; no page wrapper sets a bottom padding of its own.
 */
const ROOT = resolve(__dirname, "..")
const PAGES = [
  "app/page.tsx",
  "app/pricing/page.tsx",
  "app/buy/BuyCheckout.tsx",
  "app/free/page.tsx",
  "app/verify/page.tsx",
  "app/not-found.tsx",
  "app/tour/page.tsx",
  "app/templates/page.tsx",
  "components/site/AudienceView.tsx",
  "components/site/PlanComparison.tsx",
  "components/site/AboutView.tsx",
  "components/site/TemplateView.tsx",
  "components/site/CompareView.tsx",
]

describe("the section rhythm", () => {
  it("is one pair of paddings, shared", () => {
    expect(SECTION_SPACING.default).toBe("pt-16 pb-20 sm:pt-24 sm:pb-28")
    expect(SECTION_END).toBe("pb-20 sm:pb-28")
    expect(SECTION_SPACING.default).toContain(SECTION_END.split(" ")[0]!)
  })

  it("no page wrapper sets a bottom padding of its own", () => {
    const offenders: string[] = []
    for (const file of PAGES) {
      const src = readFileSync(join(ROOT, file), "utf8")
      for (const m of src.matchAll(/<(section|div)\b[^>]*?className=\{?[`"]([^`"]*)[`"]/g)) {
        const cls = m[2]!
        const wrapper = m[1] === "section" || /\bcontainer-x\b/.test(cls)
        if (!wrapper || !/(^|\s)(sm:)?(pb|py)-\d/.test(cls)) continue
        if (/(^|\s)pb-20 sm:pb-28(\s|$)/.test(cls)) continue
        // /about's rows are one document's rows, 40 px either side of a
        // hairline, inside a section that keeps the rhythm.
        if (file === "components/site/AboutView.tsx" && /(^|\s)py-10(\s|$)/.test(cls)) continue
        offenders.push(`${file}: ${cls}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it("a band keeps the section's padding", () => {
    for (const file of PAGES) {
      const src = readFileSync(join(ROOT, file), "utf8")
      expect(src, file).not.toMatch(/<Section\b[^>]*\bband=[^>]*spacing="compact"/)
    }
  })
})
