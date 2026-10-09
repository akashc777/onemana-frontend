import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { audienceBySlug } from "./audiences"
import { legalPages } from "./legalPages"

/**
 * Every page says the same thing about tax: prices include GST.
 *
 * WHY THIS EXISTS. The India page said "Prices exclude GST", the Terms said
 * "All fees are exclusive of all taxes", and the Taxes page said GST was
 * "added as a separate line item" and prices were "exclusive of" it, while the
 * checkout said "all taxes included". The checkout is the one that is true: the
 * backend charges the listed price and splits the GST out of it on the invoice
 * (ComputeGSTInclusive in onemana-backend business/onecamp/tax.go), adding
 * nothing. A buyer told both cannot know what they will pay.
 *
 * content/ is not read: it holds the original Page Builder export, which
 * nothing renders.
 */
const COPY_ROOTS = ["app", "components/site", "lib"]

/** Ways of saying tax comes on top of the price. */
const TAX_ON_TOP = [
  /\bexclusive of\b[^.<]{0,80}\b(tax|gst|vat)/i,
  /\bexclud(e|es|ing)\s+(gst|tax|vat)/i,
  /\b(plus|\+)\s*(gst|tax|vat)\b/i,
  /\b(gst|tax|vat)\s+(is\s+)?(added|extra)\b/i,
  /\badded as a separate line/i,
]

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1")
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
  }
  return out
}

describe("tax in customer-facing copy", () => {
  it("never says tax is added on top of the price", () => {
    const offenders: string[] = []
    for (const root of COPY_ROOTS) {
      for (const file of walk(root)) {
        const src = stripComments(readFileSync(file, "utf8"))
        for (const pattern of TAX_ON_TOP) {
          const hit = src.match(pattern)
          if (hit) offenders.push(`${file}: ${hit[0]}`)
        }
      }
    }
    expect(offenders, "copy says tax comes on top, but the price charged includes GST").toEqual([])
  })

  it("says prices include GST where tax is explained", () => {
    expect(legalPages["terms-of-service"].bodyHtml).toContain("Prices include GST")
    expect(legalPages["taxes-on-services"].bodyHtml).toContain("is included in the price you pay")
    expect(legalPages["taxes-on-services"].bodyHtml).toContain("Prices shown on our website and at checkout include GST")
    expect(audienceBySlug("india")?.priceNote).toMatch(/^Prices include GST/)
  })
})
