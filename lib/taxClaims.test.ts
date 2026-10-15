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
 * The legal pages' words are Markdown in content/legal (lib/legalPages.ts),
 * read here through legalPages; the rest of content/ is the original Page
 * Builder export, which nothing renders.
 */
const COPY_ROOTS = ["app", "components/site", "lib"]

/** Ways of saying tax comes on top of the price. */
const TAX_ON_TOP = [
  /\bexclusive of\b[^.<]{0,80}\b(tax|gst|vat)/i,
  /\bexclud(e|es|ing)\s+(gst|tax|vat)/i,
  /\b(plus|\+)\s*(gst|tax|vat)\b/i,
  // "No tax added at checkout" and "Is tax added at checkout?" (what a buyer
  // outside India reads, lib/pricing taxWords) say the opposite, so a "no"
  // or a question's "is" in front is not a claim that tax comes on top.
  /(?<!\b(?:no|is)\s)\b(gst|tax|vat)\s+(is\s+)?(added|extra)\b/i,
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
    for (const [slug, page] of Object.entries(legalPages)) {
      for (const pattern of TAX_ON_TOP) {
        const hit = page.source.match(pattern)
        if (hit) offenders.push(`content/legal/${slug}.md: ${hit[0]}`)
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
