import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * The checkout page has to offer something other than paying.
 *
 * MEASURED, NOT ASSUMED. In sixty days 610 people reached the home page, 30
 * reached /buy, and none of them bought. Nineteen of those thirty also opened
 * the refund policy, and exactly one ever came back on another day.
 *
 * That is a page asking for ₹9,999 up front for software the buyer then has to
 * install on their own server, with no trial on the page and no refund. Two
 * things were missing and both already existed elsewhere:
 *
 *   - The live demo, linked from every other page and not from this one.
 *   - Email capture, which sits on the home page and on blog posts but not on
 *     the page where the highest-intent visitors give up.
 *
 * Neither touches the refund policy, which is deliberate: no refunds is a
 * standing business decision and reducing the buyer's risk another way is the
 * only lever that does not contradict it.
 */

const ROOT = join(__dirname, "..")
const BUY = readFileSync(join(ROOT, "app/buy/BuyCheckout.tsx"), "utf8")

describe("the checkout page", () => {
  it("offers the live demo, so paying is not the only way to find out", () => {
    // demoStartUrl, not demoUrl: the plain address lands on a sign-in page where
    // the demo is the last option, and 13 of the 19 people who reached it never
    // came back. Either constant satisfies "there is a demo link", so this
    // asserts the one that actually starts the demo.
    expect(BUY).toContain("site.demoStartUrl")
  })

  it("links the demo by the shared constant, so the click is tracked", () => {
    // VisitorTracker counts a demo-click by comparing href against site.demoUrl
    // with startsWith, and demoStartUrl is that URL plus a parameter, so the
    // match still holds. A hardcoded URL would still work for the visitor and
    // would silently stop being measurable, which defeats the reason for it.
    expect(BUY).not.toMatch(/href="https:\/\/onecamp\./)
  })

  it("captures an address from the people who leave without buying", () => {
    expect(BUY).toContain("SubscribeForm")
    // Tagged so this page's leads are distinguishable from the home page's in
    // onecamp_leads.source. Without that the experiment cannot be read.
    expect(BUY).toMatch(/source="buy"/)
  })

  it("offers the free plan beside the self-host price, before the form", () => {
    // It used to sit below the form, four screens down on a phone, where a team
    // small enough to need nothing else had already been asked to pay.
    const free = BUY.indexOf('href="/free"')
    const form = BUY.indexOf("<form onSubmit={handleSubmit}")
    expect(free, "no link to /free").toBeGreaterThan(-1)
    expect(free, "the free plan comes after the pay form").toBeLessThan(form)
  })

  it("still asks for no refund window anywhere on the page", () => {
    // Standing policy: OneCamp does not offer refunds, and the risk-reduction
    // here is the demo, never a promise the refund policy contradicts.
    expect(BUY.toLowerCase()).not.toMatch(/money.back|refund window|\d+[- ]day refund/)
  })
})

describe("the money sentence", () => {
  const page = readFileSync(join(process.cwd(), "app/buy/BuyCheckout.tsx"), "utf8")

  it("is rendered from paymentTerms at the pay button, for every plan", () => {
    // The refund policy says "no refunds"; the checkout used to say only "you
    // agree to our Refund Policy" with a link. A buyer had to click through to
    // learn the one fact about money that matters. This holds the sentence in
    // place next to the button.
    // The sentence follows the plan chosen: Team monthly, Team yearly or Business.
    expect(page).toContain("paymentTerms(isCloud ? choice : \"lifetime\")")
  })

  it("offers yearly and Business only when the pricing payload says a plan exists", () => {
    // A toggle shown before the Razorpay plan exists would promise a price
    // checkout then refuses; yearlyOffered reads cloud_yearly_configured.
    // Choices come from what the pricing payload says is on sale, and a choice
    // not on sale falls back to Team monthly rather than a refused plan code.
    expect(page).toContain("const choices = cloudChoices(pricing)")
    expect(page).toContain("choices.includes(billing) ? billing : \"monthly\"")
    expect(page).toMatch(/\{showChoices && \(/)
  })
})

// The pay button once read Team's "$99/mo (₹9,999)" with Business selected,
// while the checkout charged ₹24,999. It now takes the chosen plan's price,
// and every price on the page is dollars beside the rupee charge.
describe("the buy page quotes the price it charges", () => {
  const page = readFileSync(join(__dirname, "..", "app", "buy", "BuyCheckout.tsx"), "utf8")

  it("prices the pay button from the chosen plan", () => {
    expect(page).toContain("Subscribe - ${dual(price.usd, price.inr, price.per)}")
    expect(page).not.toMatch(/Subscribe - \$\{fmtUSD\(pricing\.cloud_usd\)/)
  })

  // Rupees in India and for Cloud; dollars for the licence abroad once the
  // backend charges them (charge_usd). The note under the button says which.
  it("says how the charge is made where the money is paid", () => {
    expect(page).toContain("currencyNote(pricing, { inIndia: isIndia, cloud: isCloud })")
  })
})

/**
 * The checkout arrives in the first response, not after the JavaScript.
 *
 * The page was one client component that read the query with useSearchParams
 * under a Suspense boundary, so Next rendered it in the browser: the HTML held
 * "Loading…", and the price, the form and the footer appeared once the script
 * ran, shifting the page by 0.74 on a phone (Lighthouse, 10 Oct 2026). The page
 * is now a server component that reads the query and the pricing, and the
 * client part starts from them.
 */
describe("the buy page renders on the server", () => {
  // Code only: the comments explain the history in the same words.
  const code = (f: string) =>
    readFileSync(join(__dirname, "..", "app", "buy", f), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
  const page = code("page.tsx")
  const checkout = code("BuyCheckout.tsx")

  it("is a server component that reads the plan and the price itself", () => {
    expect(page).not.toMatch(/^["']use client["']/m)
    expect(page).toContain("await getPricing()")
    expect(page).toContain("initialPricing={pricing}")
  })

  it("never asks the browser for the query, which sent the whole page to the browser", () => {
    for (const src of [page, checkout]) {
      expect(src).not.toMatch(/useSearchParams|<Suspense/)
    }
    expect(checkout).toContain("useState<Pricing>(initialPricing)")
    expect(checkout).not.toMatch(/useState<Pricing>\(defaultPricing\)/)
  })

  it("draws the plan table outside the form, so typing does not redraw it", () => {
    expect(page).toContain("<PlanComparison pricing={pricing} />")
    expect(checkout).not.toContain("PlanComparison")
  })
})

/**
 * A failed pricing refresh keeps the live prices the server drew.
 *
 * fetchPricingClient answers a failure with the built-in fallback, the very
 * defaultPricing object. Before the page was drawn on the server that was
 * also its starting point, so nothing changed; now the page starts from live
 * prices, and a refresh that failed (a network error, the backend down)
 * replaced them with the fallback's: the wrong dollar rate, and Cloud's
 * yearly and Business choices gone.
 */
describe("a failed pricing refresh on /buy", () => {
  it("is told apart by identity: the fallback object itself comes back", async () => {
    const { fetchPricingClient, defaultPricing } = await import("@/lib/pricing")
    const real = globalThis.fetch
    try {
      globalThis.fetch = (() => Promise.reject(new Error("offline"))) as typeof fetch
      expect(await fetchPricingClient()).toBe(defaultPricing)
      globalThis.fetch = (() => Promise.resolve(new Response("{}", { status: 503 }))) as typeof fetch
      expect(await fetchPricingClient()).toBe(defaultPricing)
      globalThis.fetch = (() => Promise.resolve(new Response(JSON.stringify({ data: { lifetime_inr: 1 } }), { status: 200 }))) as typeof fetch
      expect(await fetchPricingClient()).not.toBe(defaultPricing)
    } finally {
      globalThis.fetch = real
    }
  })

  it("leaves the server's prices in place", () => {
    const checkout = readFileSync(join(__dirname, "..", "app", "buy", "BuyCheckout.tsx"), "utf8")
    expect(checkout).toContain("if (fresh !== defaultPricing) setPricing(fresh);")
    expect(checkout).not.toContain("fetchPricingClient().then(setPricing)")
  })
})
