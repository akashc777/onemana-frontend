import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import CostCalculator from "@/components/site/CostCalculator"
import { CloudPlanCard } from "@/components/site/CloudPlanCard"
import { LicencePlanCard } from "@/components/site/LicencePlanCard"
import { PlanColumns } from "@/components/site/PlanColumns"
import { TemplateView } from "@/components/site/TemplateView"
import { defaultPricing } from "@/lib/pricing"
import { templates } from "@/lib/templates"

/**
 * Space, not boxes: a card never holds another card. /compare's calculator
 * framed its two totals, each a bordered card, inside a bordered card of its
 * own, two borders deep. A card here is a block (div, section, article,
 * figure, li, aside, nav) with a full border and a rounded corner; a button
 * or a field inside a card is a control, not a card.
 */
const BLOCK = new Set(["div", "section", "article", "figure", "li", "aside", "nav"])
const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "source"])

function nestedCards(html: string): string[] {
  const out: string[] = []
  const stack: boolean[] = []
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*?)(\/?)>/g)) {
    const [, close, name, attrs, self] = m
    if (close) {
      stack.pop()
      continue
    }
    const cls = /class="([^"]*)"/.exec(attrs!)?.[1] ?? ""
    const card = BLOCK.has(name!) && /(^|\s)border(\s|$)/.test(cls) && /(^|\s)rounded-(md|lg|xl|2xl)(\s|$)/.test(cls)
    if (card && stack.some(Boolean)) out.push(`<${name} class="${cls}">`)
    if (!self && !VOID.has(name!)) stack.push(card)
  }
  return out
}

describe("no card in a card", () => {
  it("the calculator's two totals sit on the page, not in a frame", () => {
    const html = renderToString(<CostCalculator lifetimeUsd={258} pricing={defaultPricing} />)
    expect(html.match(/rounded-lg border border-(border|border-strong)/g)).toHaveLength(2)
    expect(nestedCards(html)).toEqual([])
  })

  it("holds for the plan cards and a template's page", () => {
    for (const html of [
      renderToString(<PlanColumns pricing={defaultPricing} />),
      renderToString(<LicencePlanCard pricing={defaultPricing} aligned />),
      renderToString(<CloudPlanCard pricing={defaultPricing} aligned />),
      renderToString(<TemplateView t={templates[0]!} />),
    ]) {
      expect(nestedCards(html)).toEqual([])
    }
  })
})
