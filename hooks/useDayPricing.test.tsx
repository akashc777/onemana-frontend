// @vitest-environment jsdom
import { act, type ReactNode } from "react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { defaultPricing, type Pricing } from "@/lib/pricing"
import { regionFor } from "@/lib/visitorCurrency"

/**
 * ONE PAGE, ONE DAY'S RATES, ONE ASK (11 Nov 2026). A page nobody has
 * opened for a while keeps the rates it was rendered with, so every island
 * that draws a price in the reader's money (the plan's price block, a price
 * in a sentence, the rival stack's cost and the calculator) draws through
 * useDayPricing: a page whose rates are a day old or more asks the backend
 * once, and every island on it then draws the day's figure. The pure parts
 * (newerPricing, ratesOutOfDate) are pinned in app/oneFigure.test.tsx; this
 * mounts the islands in a browser's document, as a reader's page does, so an
 * island that draws the page's own rates, a page that asks once per island,
 * or a page that asks when its rates are already the day's, fails here.
 * The calculator is the case that matters most: its totals sit in one
 * sentence with its licence, so two days' rates there are read side by side.
 */

/** Rupees to one unit a week apart; test fixtures, not prices. The move is big enough that every figure, rounded as a reader says it, changes. */
const OLD: Pricing = {
  ...defaultPricing,
  cloud_configured: true,
  usd_rate: 94.1145,
  usd_rate_at: "2026-11-08T22:09:50Z",
  rates: { AUD: 64.7249, CAD: 66.778, EUR: 105.0628, GBP: 125.9102, SGD: 73.4382, USD: 94.1145 },
  rates_at: "2026-11-08T22:09:50Z",
}
const DAY: Pricing = {
  ...OLD,
  usd_rate: 88.6,
  usd_rate_at: "2026-11-15T22:09:54Z",
  rates: { AUD: 60.9, CAD: 62.8, EUR: 98.7, GBP: 116.4, SGD: 69.1, USD: 88.6 },
  rates_at: "2026-11-15T22:09:54Z",
}
/** An hour after the day's rates were fetched: OLD is a week old, DAY is the day's. */
const NOW = new Date("2026-11-15T23:09:54Z")

const london = regionFor("GB", "en-GB")
const ISLANDS = ["plan-price", "money-text", "stack-cost", "cost-calculator"] as const

// React's act, as a test drives it.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

let root: Root | undefined

afterEach(async () => {
  if (root) await act(async () => root?.unmount())
  root = undefined
  document.body.innerHTML = ""
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  vi.resetModules()
})

/** The backend, answering with the day's pricing. */
function backend() {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(NOW)
  const fetch = vi.fn(async () => new Response(JSON.stringify({ data: DAY }), { status: 200 }))
  vi.stubGlobal("fetch", fetch)
  return fetch
}

/** The four islands, from a fresh module graph, so the one ask belongs to this page alone. */
async function islands() {
  vi.resetModules()
  const [{ PlanPrice }, { MoneyText }, { StackCost }, { CostCalculator }, { RegionProvider }] = await Promise.all([
    import("@/components/site/PlanPrice"),
    import("@/components/site/MoneyText"),
    import("@/components/site/RegionalMoney"),
    import("@/components/site/CostCalculator"),
    import("@/hooks/useVisitorRegion"),
  ])
  const island = (name: (typeof ISLANDS)[number], node: ReactNode) => <div data-island={name}>{node}</div>
  const page = (pricing: Pricing) => (
    <RegionProvider region={london}>
      {island("plan-price", <PlanPrice pricing={pricing} inr={pricing.cloud_inr} cadence="/mo" />)}
      {island("money-text", <MoneyText pricing={pricing} inr={pricing.lifetime_inr} per=" once" licence />)}
      {island("stack-cost", <StackCost pricing={pricing} usd={8300} />)}
      {island("cost-calculator", <CostCalculator lifetimeUsd={pricing.lifetime_usd} pricing={pricing} />)}
    </RegionProvider>
  )
  return page
}

/** What each island says, by its name. */
function says(el: ParentNode): Record<string, string> {
  return Object.fromEntries(ISLANDS.map((n) => [n, el.querySelector(`[data-island="${n}"]`)?.textContent ?? ""]))
}

/** The server's HTML for a page, as an element. */
function served(page: ReactNode): HTMLElement {
  const el = document.createElement("div")
  el.innerHTML = renderToString(page)
  return el
}

/** A reader's browser: the server's HTML in the document, hydrated, with the effects run and the backend's answer drawn. */
async function open(page: ReactNode): Promise<HTMLElement> {
  const el = document.body.appendChild(served(page))
  await act(async () => {
    root = hydrateRoot(el, page)
  })
  return el
}

describe("one day's rates on every island of a page", () => {
  it("draws the day's figure in every island of a day-old page, from one ask of the backend", async () => {
    const fetch = backend()
    const errors = vi.spyOn(console, "error")
    const page = await islands()

    const day = says(served(page(DAY)))
    const old = says(served(page(OLD)))
    // The two days' rates give every island a different figure, so a figure
    // from the page's own rates is told apart from the day's.
    for (const n of ISLANDS) expect(old[n], n).not.toBe(day[n])

    const el = await open(page(OLD))
    expect(says(el)).toEqual(day)
    // One ask for the page, however many islands draw a price.
    expect(fetch).toHaveBeenCalledTimes(1)
    // The first render is the server's, so hydration finds nothing to mend.
    expect(errors).not.toHaveBeenCalled()
  })

  it("asks nothing when the page's own rates are the day's", async () => {
    const fetch = backend()
    const page = await islands()

    const el = await open(page(DAY))
    expect(says(el)).toEqual(says(served(page(DAY))))
    expect(fetch).not.toHaveBeenCalled()
  })
})
