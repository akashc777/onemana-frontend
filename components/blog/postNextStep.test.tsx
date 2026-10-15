import { readFileSync } from "node:fs"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { PostNextStep } from "@/components/blog/PostNextStep"
import { FREE_SEATS } from "@/lib/freePlan"
import { site } from "@/lib/site"

/**
 * A post's way into the product (the funnel read of 15 Oct 2026: 321
 * visitors began on a post in 30 days and none opened a second page).
 */
describe("the end of a post", () => {
  const html = renderToString(<PostNextStep />)

  it("names the product and offers the two ways in, the demo first", () => {
    expect(html).toContain("The product behind these posts")
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>/g)]
    expect(links.map((m) => m[1])).toEqual([site.demoStartUrl.replace(/&/g, "&amp;"), "/free"])
    expect(links[0]![0]).toContain("ui-btn-primary")
    expect(links[0]![0]).toContain('target="_blank"')
    expect(links[1]![0]).toContain("ui-btn-secondary")
    // Each is a 44 px target on a phone (ui-btn-md).
    for (const [a] of links) expect(a).toContain("ui-btn-md")
    expect(html).toContain(`Free for up to <!-- -->${FREE_SEATS}<!-- --> people`)
  })

  it("comes after the post and before the email form", () => {
    const page = readFileSync("app/blog/[slug]/page.tsx", "utf8")
    const prose = page.indexOf("<Prose ")
    const next = page.indexOf("<PostNextStep />")
    const form = page.indexOf("<SubscribeForm")
    expect(prose).toBeGreaterThan(-1)
    expect(next).toBeGreaterThan(prose)
    expect(form).toBeGreaterThan(next)
  })
})
