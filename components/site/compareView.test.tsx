import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import CostCalculator from "@/components/site/CostCalculator"
import { CompareView } from "@/components/site/CompareView"
import { StackTable } from "@/components/ui/StackTable"
import { appComponents } from "@/lib/tailwindAppSystem"
import { agentsYouBring, recordKeeping, rivals } from "@/lib/compare"
import { defaultPricing } from "@/lib/pricing"

/**
 * /compare on a phone was the least premium place on the site (storefront
 * audit §7 row 1): three tables scrolled sideways in a 390 px box, OneCamp's
 * row cut mid-sentence behind a fade, and the calculator was the plainest
 * control on the site.
 */
const html = renderToString(<CompareView pricing={defaultPricing} />)

describe("the comparison tables", () => {
  it("never scroll sideways: no table sits in a scrolling box, and each has a card per row below its width", () => {
    expect(html).not.toMatch(/overflow-x-auto/)
    expect(html).not.toMatch(/\bfade-x\b/)
    const tables = html.match(/<table class="hidden (md|lg):table/g) ?? []
    expect(tables).toHaveLength(3)
    const lists = html.match(/<ul aria-label="[^"]+" class="(md|lg):hidden/g) ?? []
    expect(lists).toHaveLength(3)
  })

  it("on a phone, the billing table is a card per product, OneCamp's first and raised", () => {
    const at = html.indexOf('class="lg:hidden')
    const cards = (html.slice(at).match(/<li class="rounded-xl bg-card p-4 [^"]*"/g) ?? []).slice(0, rivals.length + 1)
    expect(cards).toHaveLength(rivals.length + 1)
    expect(cards[0]).toContain("ring-brand/45")
    for (const c of cards.slice(1)) expect(c).toContain("shadow-e1")
  })

  it("the agents and the record-keeping tables have a card per row too", () => {
    for (const [caption, n] of [["How the agents you already pay for connect to OneCamp", agentsYouBring.length], ["Record-keeping obligations and what OneCamp produces against each", recordKeeping.length]] as const) {
      const at = html.indexOf(`<ul aria-label="${caption}"`)
      expect(at, caption).toBeGreaterThan(-1)
      const list = html.slice(at, html.indexOf("</ul>", at))
      expect(list.match(/<li /g)).toHaveLength(n)
    }
  })

  // G23: the citations were drawn four ways on this page alone.
  it("draws its citations one way: the quiet link, or the site's link in running text", () => {
    expect(html).not.toMatch(/decoration-border-strong|underline-offset-4/)
    expect(html).toMatch(/class="link-quiet tap-target"/)
  })

  it("a StackTable's first column names each card", () => {
    const t = renderToString(<StackTable caption="c" rows={[{ a: "Row one", b: "x" }]} rowKey={(r) => r.a} columns={[{ key: "a", label: "A", cell: (r) => r.a }, { key: "b", label: "B", cell: (r) => r.b }]} />)
    expect(t).toMatch(/<li[^>]*><p class="m-0 text-body font-\[590\] text-foreground">Row one<\/p><dl/)
    expect(t).toContain('<th scope="row"')
  })
})

describe("the cost calculator", () => {
  const calc = renderToString(<CostCalculator lifetimeUsd={261} pricing={defaultPricing} />)

  // C5: the browser's spin buttons; the slider was the only stepper.
  it("steps its number with two buttons, and the field shows no spin buttons", () => {
    expect(calc).toMatch(/<button[^>]*aria-label="One person fewer"[^>]*data-interactive="icon"/)
    expect(calc).toMatch(/<button[^>]*aria-label="One person more"[^>]*data-interactive="icon"/)
    const field = appComponents()[".ui-field"] as Record<string, Record<string, string>>
    expect(field["&[type='number']"]).toMatchObject({ appearance: "textfield" })
    expect(field["&[type='number']::-webkit-inner-spin-button"]).toMatchObject({ WebkitAppearance: "none" })
  })

  // C7: a flat disc that never answered the hand; a 40 px box under a finger.
  it("its slider is the slider kind: grab, a lift while held, a ring on the thumb, 44 px under a finger", () => {
    expect(calc).toMatch(/<input type="range"[^>]*class="ui-range /)
    const range = appComponents()[".ui-range"] as Record<string, unknown>
    expect(range.cursor).toBe("grab")
    expect(range["&:active"]).toEqual({ cursor: "grabbing" })
    expect(range["&:active::-webkit-slider-thumb"]).toEqual({ scale: "1.1", boxShadow: "var(--e-e3)" })
    expect(String((range["&:focus-visible::-webkit-slider-thumb"] as { boxShadow: string }).boxShadow)).toContain("rgb(var(--ring))")
    expect((range["@media (pointer: coarse)"] as { height: string }).height).toBe("2.75rem")
  })
})
