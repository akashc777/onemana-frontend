import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

// The checkout routes with the app router, which a string render has not mounted.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { AudienceView } from "@/components/site/AudienceView"
import { CostCalculator } from "@/components/site/CostCalculator"
import { HomeComparison } from "@/components/site/HomeComparison"
import { PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
import { RegionProvider } from "@/hooks/useVisitorRegion"
import { alternatives } from "@/lib/alternatives"
import { audienceBySlug } from "@/lib/audiences"
import { currencyNote, defaultPricing, displayPrice, newerPricing, ratesOutOfDate, type Pricing } from "@/lib/pricing"
import { regionFor, type Region } from "@/lib/visitorCurrency"

/**
 * ONE CHARGE, ONE FIGURE (10 Nov 2026). A reader in London was shown the
 * same ₹9,999 Cloud month as "≈ £80 /mo" on /pricing and "≈ £79 /mo" on
 * /alternatives/slack, five seconds apart. Every price on the site is
 * worked out by one function, lib/pricing displayPrice; the two figures
 * were two days' rates. Each page is rendered at its own moment (every five
 * minutes at most, and a page nobody has opened since keeps the rates it
 * was rendered with), and the backend's rates move once a day: /pricing had
 * 9 November's pound (₹125.6705), the rival page 8 November's (₹125.9102).
 *
 * So the figures are pinned two ways: every page draws a plan's price with
 * displayPrice (the same pricing and the same reader give the same figure
 * on /pricing, /buy, /compare, a rival page, an audience page and the home
 * page), and a page whose rates are a day old asks the backend for the
 * day's before it says a figure in the reader's money (useDayPricing), so
 * two pages rendered on either side of the day's move still agree.
 */

/** The backend's rates on two days running, rupees to one unit; test fixtures, not prices. */
const DAY1: Pricing = {
  ...defaultPricing,
  cloud_configured: true,
  usd_rate: 94.1145,
  usd_rate_at: "2026-11-08T22:09:50Z",
  rates: { AUD: 64.7249, CAD: 66.778, EUR: 105.0628, GBP: 125.9102, SGD: 73.4382, USD: 94.1145 },
  rates_at: "2026-11-08T22:09:50Z",
}
const DAY2: Pricing = {
  ...DAY1,
  usd_rate: 94.0475,
  usd_rate_at: "2026-11-09T22:09:54Z",
  rates: { AUD: 64.6018, CAD: 66.6261, EUR: 104.8562, GBP: 125.6705, SGD: 73.3093, USD: 94.0475 },
  rates_at: "2026-11-09T22:09:54Z",
}

/** The words a reader sees: markup, React's comment markers and screen-reader-only words removed. */
const words = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<span class="sr-only">[^<]*<\/span>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")

/** A figure in a display currency, as drawn: "£80", "€95", "95 €". */
const FIG = String.raw`((?:[SAC]\$|[$£€])[\d.,]+|[\d.,]+ €)`
/** "95 €" and "€95" are one figure in two locales' order (the space is a no-break space as drawn). */
const same = (f: string) => f.replace(/\s+/g, " ").replace(/^([\d.,]+) €$/, "€$1")

/**
 * Every figure a page gives for one rupee charge, wherever it is drawn: a
 * price block ("≈ £80 /mo" over "Charged as ₹9,999"), a price in a sentence
 * or a row ("≈ £199 once (charged ₹24,999)") and a pay button ("Pay ₹24,999
 * (≈ £199)").
 */
function figuresFor(text: string, rupees: string): string[] {
  const r = rupees.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const at = [
    new RegExp(`≈ ${FIG}[^≈₹]{0,40}?Charged as ${r}(?![\\d,])`, "g"),
    new RegExp(`≈ ${FIG}[^≈₹]{0,40}?\\(charged ${r}\\)`, "g"),
    new RegExp(`${r}(?![\\d,])[^≈₹(]{0,20}\\(≈ ${FIG}\\)`, "g"),
  ]
  return at.flatMap((re) => [...text.matchAll(re)].map((m) => same(m[1]!)))
}

const as = (region: Region, node: React.ReactNode) => words(renderToString(<RegionProvider region={region}>{node}</RegionProvider>))

/** Each page's money, as the reader in `country` sees it. */
function pages(p: Pricing, country: string, locale: string): Record<string, string> {
  const region = regionFor(country, locale)
  const buy = (plan: "lifetime" | "cloud") =>
    words(renderToString(<BuyCheckout initialPlan={plan} initialBilling="monthly" initialPricing={p} initialCountry={country} />))
  return {
    "/pricing": as(region, <><PlanColumns pricing={p} headingLevel="h2" detailed /><PlanComparison pricing={p} /></>),
    "/buy": buy("lifetime"),
    "/buy?plan=cloud": buy("cloud"),
    "/compare": as(region, <CostCalculator lifetimeUsd={p.lifetime_usd} pricing={p} />),
    "/alternatives/slack": as(region, <AudienceView a={alternatives.find((a) => a.slug === "slack")!} pricing={p} />),
    "/for/agencies": as(region, <AudienceView a={audienceBySlug("agencies")!} pricing={p} />),
    "/": as(region, <><PlanColumns pricing={p} /><HomeComparison pricing={p} /></>),
  }
}

const READERS: [string, string, string][] = [
  ["London", "GB", "en-GB"],
  ["Berlin", "DE", "de-DE"],
]

/** The plans each page prices: the licence once, Cloud Team a month. */
const DRAWS: Record<string, ("licence" | "month")[]> = {
  "/pricing": ["licence", "month"],
  "/buy": ["licence"],
  "/buy?plan=cloud": ["month"],
  "/compare": ["licence"],
  "/alternatives/slack": ["licence", "month"],
  "/for/agencies": ["licence", "month"],
  "/": ["licence", "month"],
}

describe("one plan, one figure, on every page", () => {
  for (const [city, country, locale] of READERS) {
    it(`gives a reader in ${city} the licence and Cloud's month in one figure each, on every page that prices them`, () => {
      const region = regionFor(country, locale)
      const want = {
        licence: same(displayPrice(DAY2, DAY2.lifetime_inr, region, { licence: true }).figure),
        month: same(displayPrice(DAY2, DAY2.cloud_inr, region).figure),
      }
      const all = pages(DAY2, country, locale)
      expect(Object.keys(all)).toEqual(Object.keys(DRAWS))
      for (const [page, text] of Object.entries(all)) {
        const got = { licence: figuresFor(text, "₹24,999"), month: figuresFor(text, "₹9,999") }
        for (const plan of ["licence", "month"] as const) {
          const drawn = DRAWS[page]!.includes(plan)
          expect([...new Set(got[plan])], `${city} ${page}: ${plan}`).toEqual(drawn ? [want[plan]] : [])
        }
      }
    })
  }
})

describe("one day's rates on every page", () => {
  const london = regionFor("GB", "en-GB")
  /** Two hours after the build that drew both figures. */
  const now = Date.parse("2026-11-10T10:30:00Z")

  it("gives one charge two figures across pages rendered on either side of the day's move", () => {
    expect(displayPrice(DAY1, 9999, london).figure).toBe("£79")
    expect(displayPrice(DAY2, 9999, london).figure).toBe("£80")
  })

  it("asks the backend for the day's rates only when a page's are a day old or more", () => {
    expect(ratesOutOfDate(DAY1, now)).toBe(true)
    expect(ratesOutOfDate(DAY2, now)).toBe(false)
    expect(ratesOutOfDate(DAY2, Date.parse("2026-11-10T22:09:54Z"))).toBe(true)
    // The built-in fallback knows no day: a page drawn with it asks.
    expect(ratesOutOfDate(defaultPricing, now)).toBe(true)
  })

  it("takes the newer of a page's pricing and the backend's answer, by when the rates were fetched", () => {
    expect(newerPricing(DAY1, DAY2)).toBe(DAY2)
    expect(newerPricing(DAY2, DAY1)).toBe(DAY2)
    expect(newerPricing(DAY2, null)).toBe(DAY2)
    // A fetch that failed hands back the fallback, which never replaces a page's live pricing.
    expect(newerPricing(DAY2, defaultPricing)).toBe(DAY2)
    expect(displayPrice(newerPricing(DAY1, DAY2), 9999, london).figure).toBe(displayPrice(DAY2, 9999, london).figure)
  })

  // /pricing answers "Which currency am I charged in?" (when the licence is
  // charged in dollars) on the server, for every reader, from the page's own
  // pricing. It named that pricing's dollar rate as "today's", under cards a
  // reader may read in pounds, at the day's rate. Written before the reader is
  // known, it names no rate; once the reader is known, the rate their figures
  // are at.
  it("answers which currency is charged in the same words on any day, naming no rate, before the reader is known", () => {
    const charged = (p: Pricing) => currencyNote({ ...p, charge_usd: true })
    expect(charged(DAY1)).toBe(charged(DAY2))
    expect(charged(DAY2)).not.toMatch(/₹[\d.]+ to the/)
    expect(charged(DAY2)).toBe(
      "The licence is charged in US dollars outside India and in rupees in India. OneCamp Cloud is billed in rupees: your card converts at its own rate and may add a small foreign transaction fee.",
    )
    expect(currencyNote(newerPricing(DAY1, DAY2), { region: london })).toContain("(₹125.67 to the pound)")
  })

  /** The site's own source files, tests left out. */
  const ROOT = path.resolve(__dirname, "..")
  const sources = (dir: string): string[] =>
    readdirSync(path.join(ROOT, dir)).flatMap((name) => {
      const rel = path.join(dir, name)
      if (statSync(path.join(ROOT, rel)).isDirectory()) return sources(rel)
      return /\.tsx?$/.test(name) && !/\.test\./.test(name) ? [rel] : []
    })

  it("draws a page's prices in the reader's money only through useDayPricing, unless the island asks the backend itself", () => {
    const islands = ["app", "components"]
      .flatMap(sources)
      .filter((f) => {
        const s = readFileSync(path.join(ROOT, f), "utf8")
        return /\buseVisitorRegion\(/.test(s) && /\b(displayPrice|priceWithEstimate|localEstimate|fromUsd)\(/.test(s)
      })
    expect(islands.length).toBeGreaterThanOrEqual(4)
    for (const f of islands) {
      const s = readFileSync(path.join(ROOT, f), "utf8")
      if (/\b(livePricing|fetchPricingClient)\(/.test(s)) continue
      expect(s, f).toMatch(/\buseDayPricing\(/)
    }
  })
})
