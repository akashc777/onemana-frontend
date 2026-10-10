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

  it("drops the grid, the glow, the orange rule and the heavy weight", () => {
    expect(html).not.toMatch(/linear-gradient\(#e8eaed|radial-gradient/)
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
