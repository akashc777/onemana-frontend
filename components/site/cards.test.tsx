import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AudienceView } from "@/components/site/AudienceView"
import { PlanColumns } from "@/components/site/PlanColumns"
import { alternatives } from "@/lib/alternatives"
import { defaultPricing } from "@/lib/pricing"

/**
 * A card lifts because it opens something, and only then (the interaction
 * layer's card kind). Storefront audit H16 and A5: the plan cards and the
 * audience pages' mini price cards lifted though they were not links, while
 * the button inside had a hover of its own; A3: a point's tile turned when
 * its row, which does nothing, was hovered.
 */
const read = (rel: string) => readFileSync(resolve(__dirname, "../..", rel), "utf8")
const opening = (html: string, re: RegExp) => html.match(re) ?? []

describe("cards that are not links", () => {
  it("the plan cards hold still; the button in each is what answers", () => {
    const html = renderToString(<PlanColumns pricing={defaultPricing} />)
    const cards = opening(html, /<div[^>]*data-plan="[a-z]+"[^>]*>/g)
    expect(cards).toHaveLength(3)
    for (const c of cards) {
      expect(c.split(/[\s"]+/).filter((t) => /^(lift|lift-2|lift-move|hover:ring.*)$/.test(t))).toEqual([])
      expect(c).not.toContain("data-interactive")
    }
    // The licence is still raised as the plan to buy, at e3 with its ring.
    expect(cards.find((c) => c.includes('data-plan="lifetime"'))).toMatch(/shadow-e3 ring-1 ring-brand\/45/)
  })

  it("the audience pages' price cards hold still, with md buttons, and a point's tile no longer turns", () => {
    const html = renderToString(<AudienceView a={alternatives[0]!} pricing={{ ...defaultPricing, cloud_configured: true }} />)
    const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1]!.split(/\s+/))
    expect(classes.filter((c) => /^(lift|lift-2|lift-move|hover-lift)$/.test(c))).toEqual([])
    expect(html).not.toMatch(/group-hover:-rotate-6/)
    const buy = opening(html, /<a[^>]*href="\/buy(\?plan=cloud)?"[^>]*>/g)
    expect(buy).toHaveLength(2)
    for (const b of buy) {
      expect(b).toContain("ui-btn-md")
      expect(b).not.toContain("ui-btn-sm")
    }
  })
})

describe("cards that open something", () => {
  // B1: the featured post lifted and zoomed its cover at once.
  it("the featured post lifts, and its cover holds still", () => {
    const src = read("app/blog/page.tsx")
    expect(src).toMatch(/data-topic=\{topic\.key\} \{\.\.\.ix\("card"\)\}/)
    expect(src).not.toMatch(/scale-\[1\.02\]/)
    // A card's lift is drawn outside it; overflow-hidden on the card cut it off.
    expect(src).not.toMatch(/\{\.\.\.ix\("card"\)\} className="[^"]*overflow-hidden/)
  })

  // T1: the template bars filled over about 530 ms, and under reduced motion too.
  it("the template cards' week bars fill in a pop with a 20 ms step, only where motion is welcome", () => {
    const src = read("app/templates/page.tsx")
    expect(src).toContain("motion-safe:group-hover:scale-x-100")
    expect(src).toContain("duration-pop")
    expect(src).toContain("transitionDelay: `${i * 20}ms`")
    expect(src).toContain('{...ix("card", { hue: hueFor(t.id) })}')
  })

  // H1: the release pill answered a hover with a shadow and nothing else.
  it("the home page's release pill is a card", () => {
    const pill = /function ReleasePill[\s\S]*?<\/Link>/.exec(read("app/page.tsx"))?.[0] ?? ""
    expect(pill).toContain('{...ix("card")}')
    expect(pill).not.toMatch(/hover:shadow-e2/)
  })
})
