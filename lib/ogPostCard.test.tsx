import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { OG } from "@/lib/og-card"
import { PostOgCard } from "@/lib/og-post-card"

/**
 * A post's or a guide's link preview looks like the site's (version 5): the
 * page's ground, the words at 600, the topic or group as a chip in its camp
 * hue, the logo's rings. It kept what the site card dropped: a line grid, an
 * orange glow, an orange rule and an orange uppercase eyebrow over a 700
 * weight title, which is the template DESIGN.md names.
 */
describe("the post and guide card", () => {
  const html = renderToString(<PostOgCard eyebrow="Running it" title="The demo worked" meta="Akash Hadagali · 2026" hue="sun" />)

  // Design v3 (site.md OG3): the topic's canvas in the right third is lit
  // by its own hue, once; the old grid, orange rule and heavy weight stay gone.
  it("drops the grid, the orange rule and the heavy weight, and lights only the topic's canvas", () => {
    expect(html).not.toMatch(/linear-gradient\(#e8eaed/)
    expect(html.match(/radial-gradient/g) ?? []).toHaveLength(1)
    expect(html).not.toMatch(/font-weight:(700|800)/)
    expect(html.toLowerCase()).not.toContain("#cc4a0b")
  })

  it("names the topic in sentence case, in its hue's chip", () => {
    expect(html).not.toMatch(/text-transform:uppercase/)
    expect(html.toLowerCase()).toContain(`background:${OG.camp.sun.tint.toLowerCase()}`)
    expect(html.toLowerCase()).toContain(`color:${OG.camp.sun.ink.toLowerCase()}`)
    expect(html).toContain("Running it")
  })

  it("keeps the orange for the address alone, in the link ink", () => {
    expect(html.toLowerCase()).toContain(`color:${OG.link.toLowerCase()}`)
  })
})

/**
 * A card for a post or guide that cannot be read (deleted, or the backend
 * down) still makes a sentence-case card whose line stays clear of the
 * corner's rings: it read "OneCamp Blog" over the site's whole tagline, which
 * ran into the rings.
 */
describe("the fallback cards", () => {
  for (const file of ["blog/[slug]/opengraph-image.tsx", "blog/[slug]/twitter-image.tsx", "docs/[slug]/opengraph-image.tsx", "docs/[slug]/twitter-image.tsx"]) {
    it(`${file} falls back in sentence case, briefly`, () => {
      const src = readFileSync(join(process.cwd(), "app", file), "utf8")
      expect(src).not.toMatch(/"OneCamp (Blog|Docs)"/)
      expect(src).not.toContain("|| site.tagline")
    })
  }
})
