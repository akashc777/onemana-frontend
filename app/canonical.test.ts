import { readFileSync, readdirSync, statSync, existsSync } from "node:fs"
import { dirname, join, relative } from "node:path"

import type { Metadata } from "next"
import { describe, expect, it } from "vitest"

/**
 * Every indexed page names itself as canonical.
 *
 * WHY THIS EXISTS. The root layout sets `alternates: { canonical: "/" }`, and a
 * page that sets nothing inherits it. The five legal pages set only a title, so
 * each one told search engines it was a copy of the home page, while the
 * sitemap listed it as a page in its own right. Google then drops it from the
 * index, which is the last thing a privacy policy or the terms should be.
 */

const LEGAL = ["privacy-policy", "refund-policy", "terms-of-service", "taxes-on-services", "account-ownership-policy"]

describe("the legal pages", () => {
  for (const slug of LEGAL) {
    it(`/${slug} is its own canonical page`, async () => {
      const { metadata } = (await import(`./${slug}/page`)) as { metadata: Metadata }
      expect(metadata.alternates?.canonical).toBe(`/${slug}`)
    })
  }
})

/** Says where a page's canonical comes from: its own metadata, or a layout on the way up. */
const SETS_CANONICAL = /canonical|landingMetadata\(|index:\s*false/

function pages(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) pages(p, out)
    else if (entry === "page.tsx") out.push(p)
  }
  return out
}

describe("every other page", () => {
  it("sets a canonical of its own, or sits under a layout that does, instead of inheriting the home page's", () => {
    const root = join(process.cwd(), "app")
    const inheriting: string[] = []
    for (const page of pages(root)) {
      const rel = relative(root, page)
      // The home page is "/", and the admin area is kept from crawlers by robots.ts.
      if (rel === "page.tsx" || rel.startsWith("admin/")) continue
      let sets = SETS_CANONICAL.test(readFileSync(page, "utf8"))
      for (let dir = dirname(page); !sets && dir !== root; dir = dirname(dir)) {
        const layout = join(dir, "layout.tsx")
        sets = existsSync(layout) && SETS_CANONICAL.test(readFileSync(layout, "utf8"))
      }
      if (!sets) inheriting.push(rel)
    }
    expect(inheriting, "these pages tell search engines they are the home page").toEqual([])
  })
})
