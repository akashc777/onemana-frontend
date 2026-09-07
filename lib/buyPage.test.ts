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
const BUY = readFileSync(join(ROOT, "app/buy/page.tsx"), "utf8")

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

  it("still asks for no refund window anywhere on the page", () => {
    // Standing policy: OneCamp does not offer refunds, and the risk-reduction
    // here is the demo, never a promise the refund policy contradicts.
    expect(BUY.toLowerCase()).not.toMatch(/money.back|refund window|\d+[- ]day refund/)
  })
})
