import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "",
}))

import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { TopicFilter } from "@/components/blog/TopicFilter"
import { PlanColumns } from "@/components/site/PlanColumns"
import { ProductTabs } from "@/components/site/ProductTabs"
import { firstTourScene } from "@/components/site/showcase/tour"
import { Segmented } from "@/components/ui/Segmented"
import { defaultPricing } from "@/lib/pricing"

/**
 * Every choice of one on the site is one Segmented: a radiogroup that is one
 * Tab stop with the arrow keys (lib/roving), drawn by the interaction layer.
 */
const tags = (html: string, re: RegExp) => html.match(re) ?? []
const radios = (html: string) => tags(html, /<button[^>]*role="radio"[^>]*>/g)
const group = (html: string, label: string) => {
  const at = html.indexOf(`aria-label="${label}"`)
  expect(at, `no group "${label}"`).toBeGreaterThan(-1)
  const open = html.lastIndexOf("<div", at)
  // The group's radios, up to the next group or the end of its markup.
  return radios(html.slice(open, html.indexOf('role="radiogroup"', at + 1) > -1 ? html.indexOf('role="radiogroup"', at + 1) : undefined))
}
/** Only the chosen option is in the Tab order. */
const oneTabStop = (rs: string[]) => {
  const stops = rs.filter((r) => r.includes('tabindex="0"'))
  expect(stops).toHaveLength(1)
  expect(stops[0]).toContain('aria-checked="true"')
  for (const r of rs.filter((r) => !r.includes('tabindex="0"'))) expect(r).toContain('tabindex="-1"')
}

describe("Segmented", () => {
  const html = renderToString(
    <Segmented label="Size" options={["s", "m", "l"] as const} value="m" onChange={() => {}} option={(o) => o.toUpperCase()} hue={(o) => (o === "l" ? "sky" : undefined)} />,
  )

  it("is a labelled radiogroup with one Tab stop, the chosen option", () => {
    expect(html).toMatch(/^<div role="radiogroup" aria-label="Size"/)
    const rs = radios(html)
    expect(rs).toHaveLength(3)
    oneTabStop(rs)
    expect(rs[1]).toContain('aria-checked="true"')
  })

  it("draws every option as the layer's kind, in its hue when it has one, with no states of its own", () => {
    for (const r of radios(html)) {
      expect(r).toContain('data-interactive="tab"')
      expect(r).not.toMatch(/\b(hover:|bg-card|shadow-e)/)
    }
    expect(radios(html)[2]).toContain('data-hue="sky"')
  })
})

describe("the checkout's choices", () => {
  const onSale = { ...defaultPricing, cloud_yearly_configured: true, business_configured: true }
  const cloud = renderToString(<BuyCheckout initialPlan="cloud" initialBilling="monthly" initialPricing={onSale} initialCountry="US" />)

  // K1: two aria-pressed buttons, each its own Tab stop, without arrows.
  it("the plan switch is a radiogroup, one Tab stop, each plan in its hue", () => {
    const rs = group(cloud, "Licence or Cloud")
    expect(rs).toHaveLength(2)
    oneTabStop(rs)
    expect(rs.map((r) => /data-hue="(\w+)"/.exec(r)?.[1])).toEqual(["sun", "sky"])
  })

  // K2: role="radio" with no roving tabindex or arrow keys.
  it("the billing segments are one Tab stop", () => {
    const rs = group(cloud, "Cloud plan")
    expect(rs.length).toBeGreaterThanOrEqual(2)
    oneTabStop(rs)
  })

  // K3: chosen by a brand border and fill alone.
  it("the AI choice is chosen by a tint, a ring and a tick, not by colour alone", () => {
    const rs = group(cloud, "AI features")
    expect(rs).toHaveLength(2)
    oneTabStop(rs)
    for (const r of rs) expect(r).toContain('data-interactive="chip"')
    const chosen = cloud.slice(cloud.indexOf(rs.find((r) => r.includes('aria-checked="true"'))!))
    expect(chosen.slice(0, chosen.indexOf("</button>"))).toContain("<svg")
    expect(cloud).not.toMatch(/border-brand\/60/)
  })
})

describe("the tabs and the Cloud size", () => {
  // P1: the Cloud size had ←→ only, and no hover.
  it("the Cloud size is a Segmented whose knob is the sliding thumb", () => {
    const html = renderToString(<PlanColumns pricing={{ ...defaultPricing, cloud_yearly_configured: true, business_configured: true }} detailed />)
    const rs = group(html, "Cloud size")
    expect(rs.length).toBeGreaterThanOrEqual(2)
    oneTabStop(rs)
    for (const r of rs) {
      expect(r).toContain('data-interactive="tab"')
      expect(r).toContain('data-thumb="true"')
    }
  })

  // H9 and B2: a grey hover, never the tab's own hue.
  it("the product tabs and the blog's topics hover in their own hue", () => {
    const tabs = tags(renderToString(<ProductTabs first={firstTourScene()} />), /<button[^>]*role="tab"[^>]*>/g)
    expect(tabs.map((t) => /data-hue="(\w+)"/.exec(t)?.[1])).toEqual(["dusk", "moss", "sun", "sky", "agent", "agent"])
    const topics = tags(renderToString(<TopicFilter target="x" />), /<button[^>]*aria-pressed[^>]*>/g)
    expect(topics.length).toBeGreaterThan(3)
    for (const t of [...tabs, ...topics]) {
      expect(t).toContain('data-interactive="tab"')
      expect(t).not.toMatch(/\b(hover:|bg-card|shadow-e2 )/)
    }
    expect(topics.slice(1).every((t) => /data-hue="\w+"/.test(t))).toBe(true)
  })
})
