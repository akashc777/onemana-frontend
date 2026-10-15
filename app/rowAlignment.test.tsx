import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The checkout asks for the app router, which a string render has not mounted.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}))

import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { DocsPager } from "@/components/docs/DocsShell"
import { CompareView } from "@/components/site/CompareView"
import { GuaranteeList } from "@/components/site/GuaranteeList"
import { QuestionList } from "@/components/site/marketing"
import { governance } from "@/lib/content"
import { defaultPricing } from "@/lib/pricing"

/**
 * Things side by side line up part by part, the way the plan cards do: each
 * card or item's title, text, list and button start level with its
 * neighbours' whatever wraps. Measured before (1440 and 768 px): the Safe AI
 * guarantees' explanations 28 px apart, the home FAQ's answers 26 apart at
 * 768, /verify's two kinds of file 24 apart, the licence and Cloud cards'
 * prices 56 apart and buttons 18, a docs pager card's "Previous" 10 px below
 * "Next", /buy's AI choices 9 apart, and /compare's tools with a hairline
 * wherever each one's text ended.
 *
 * The cure is the plan cards': each item takes its parts' rows of one
 * subgrid, or, for a lone line, starts at the top rather than the middle.
 */

/** The tag names of an element's direct children, from server HTML. */
function childTags(html: string, openAt: number): string[] {
  const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source"])
  const re = /<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/g
  re.lastIndex = openAt
  const out: string[] = []
  let depth = 0
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, close, name, self] = m
    if (close) {
      depth--
      if (depth === 0) break
      continue
    }
    if (depth === 1) out.push(name!)
    if (!self && !VOID.has(name!)) depth++
  }
  return out
}

describe("things side by side line up", () => {
  it("the guarantees in a row: each claim and its explanation are two rows of one subgrid", () => {
    const html = renderToString(<GuaranteeList items={governance.points} layout="row" hue="dusk" />)
    expect(html).toMatch(/^<ol class="[^"]*md:grid-cols-3 md:gap-y-0/)
    const items = [...html.matchAll(/<li class="([^"]*)"/g)]
    expect(items).toHaveLength(governance.points.length)
    for (const m of items) {
      expect(m[1]).toContain("md:row-span-2 md:grid-rows-subgrid md:gap-y-0")
      // The number, the claim and the explanation, each a cell of the grid.
      expect(childTags(html, m.index!)).toEqual(["span", "h3", "p"])
    }
    expect(html).toMatch(/<p class="col-start-2 /)
  })

  it("questions in two columns: each question and answer are two rows of one subgrid", () => {
    const two = renderToString(<QuestionList items={[{ q: "A?", a: "Yes." }, { q: "B?", a: "No." }]} columns={2} />)
    for (const m of two.matchAll(/<li class="([^"]*)"/g)) expect(m[1]).toContain("md:row-span-2 md:grid md:grid-rows-subgrid md:gap-y-0")
    const one = renderToString(<QuestionList items={[{ q: "A?", a: "Yes." }]} />)
    expect(one).not.toContain("subgrid")
  })

  it("/verify's two kinds of file share one subgrid", () => {
    const src = readFileSync(join(__dirname, "verify/page.tsx"), "utf8")
    expect(src).toContain('<dl className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0">')
    expect(src.match(/<div className="sm:row-span-2 sm:grid sm:grid-rows-subgrid">/g)).toHaveLength(2)
  })

  it("a docs pager card and /buy's AI choices start at the top, not the middle", () => {
    const pager = renderToString(<DocsPager prev={{ slug: "a", title: "A guide with a long name" }} next={{ slug: "b", title: "B" }} />)
    for (const m of pager.matchAll(/<a [^>]*class="([^"]*)"/g)) {
      expect(m[1]).toContain("justify-start")
      expect(m[1]).not.toContain("justify-center")
    }
    // The AI choice cards, rendered: each starts its words at the top.
    const buy = renderToString(<BuyCheckout initialPlan="cloud" initialBilling="monthly" initialPricing={defaultPricing} initialCountry="US" />)
    const at = buy.indexOf('aria-label="AI features"')
    const cards = buy.slice(at).match(/<button[^>]*role="radio"[^>]*class="([^"]*)"/g) ?? []
    expect(cards).toHaveLength(2)
    for (const c of cards) {
      expect(c).toContain("flex-col justify-start")
      expect(c).not.toContain("justify-center")
    }
  })

  it("/compare's tools: each tool over its line, the hairline under the cell", () => {
    const html = renderToString(<CompareView pricing={defaultPricing} />)
    const cells = [...html.matchAll(/<div class="border-b border-border\/60 pb-3">/g)]
    expect(cells.length).toBeGreaterThan(4)
    for (const m of cells) expect(childTags(html, m.index!)).toEqual(["p", "p"])
  })
})
