import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { PostCard } from "@/components/blog/PostCard"
import { EntryRows } from "@/components/changelog/Entry"
import { DocsNav } from "@/components/docs/DocsShell"
import { OnThisPage } from "@/components/reading/OnThisPage"
import { AlsoInTheBox } from "@/components/site/AlsoInTheBox"
import { QuestionAccordion } from "@/components/site/marketing"
import type { ChangelogEntry } from "@/lib/changelog"

/**
 * Rows that open something answer the hand as the interaction layer's row
 * kind: the accent's tint under the pointer (the quiet step for a large
 * row), the press tint under a finger, the focus ring inset. Before, the
 * rows of "Also in the box", the blog and the changelog had no tint and no
 * press, the docs index hovered grey, and an accordion answered only on its
 * disc (storefront audit H11, B3, D3, P2).
 */
const opening = (html: string, re: RegExp) => html.match(re) ?? []
const ROW = /data-interactive="row"/

describe("the rows", () => {
  it("Also in the box: every feature is a chip of the layer in its area's hue, 44 px under a finger", () => {
    const html = renderToString(<AlsoInTheBox />)
    const chips = opening(html, /<a[^>]*data-interactive="chip"[^>]*>/g)
    expect(chips.length).toBe(16)
    for (const c of chips) {
      expect(c).toMatch(/data-hue="(sky|berry|dusk|moss|sun|lake)"/)
      expect(c).toContain("min-h-11")
    }
  })

  it("a post and a changelog entry are rows, with no hover of their own", () => {
    const post = { slug: "a-post", title: "A post", excerpt: "Two sentences. Of excerpt.", tags: [], published_at: "2026-10-10T00:00:00Z", content: "" } as never
    const full = renderToString(<ul><PostCard post={post} /></ul>)
    const compact = renderToString(<ul><PostCard post={post} compact /></ul>)
    const entry = { slug: "e", title: "An entry", publishedAt: "2026-10-10T00:00:00Z", sections: [], notices: [], fixes: [], tag: "v1", headlined: true } as unknown as ChangelogEntry
    const rows = renderToString(<EntryRows entries={[entry]} />)
    for (const html of [full, compact, rows]) {
      const a = opening(html, /<a[^>]*>/g)[0] ?? ""
      expect(a).toMatch(ROW)
      expect(a).not.toMatch(/hover:bg-/)
    }
    expect(opening(full, /<a[^>]*>/g)[0]).toContain("data-quiet")
  })

  it("the docs index's rows tint in the accent, not grey, and the arrow moves only where motion is welcome", () => {
    const src = readFileSync(resolve(__dirname, "../../app/docs/page.tsx"), "utf8")
    expect(src).toContain('{...ix("row", { quiet: true })}')
    expect(src).not.toContain("hover:bg-hover")
    expect(src).toContain("motion-safe:group-hover:translate-x-0.5")
  })

  it("an accordion's whole question is the row; its disc no longer answers alone", () => {
    const html = renderToString(<QuestionAccordion items={[{ q: "Does it?", a: "It does." }]} />)
    const summary = opening(html, /<summary[^>]*>/g)[0] ?? ""
    expect(summary).toMatch(ROW)
    expect(html).not.toMatch(/group-hover\/q|group-active\/q/)
  })
})

describe("navigation that holds its width", () => {
  // D4: the open guide turned 510 and its label grew.
  it("the docs sidebar: nav rows, the open guide raised by the layer, every label's 510 width held", () => {
    const html = renderToString(<DocsNav groups={[{ category: "Setup", items: [{ slug: "a", title: "Install it" }, { slug: "b", title: "Back it up" }] as never }]} activeSlug="a" />)
    const links = opening(html, /<a[^>]*>/g)
    expect(links.length).toBe(3)
    for (const l of links) {
      expect(l).toContain('data-interactive="nav"')
      expect(l).not.toMatch(/nav-active|nav-idle|font-medium/)
    }
    expect(html).toContain('<span data-label="Install it">Install it</span>')
    expect(links.filter((l) => l.includes('aria-current="page"'))).toHaveLength(1)
  })

  // D6: the heading in view turned 510 and could rewrap and move the list.
  it("On this page: each heading's 510 width is held, and the bar slides on the one curve", () => {
    const html = renderToString(<OnThisPage headings={[{ id: "one", text: "First heading", level: 2 }, { id: "two", text: "Second", level: 3 }]} />)
    expect(html).toContain('<span data-label="First heading">First heading</span>')
    expect(html).toContain('<span data-label="Second">Second</span>')
    const src = readFileSync(resolve(__dirname, "../reading/OnThisPage.tsx"), "utf8")
    expect(src).not.toContain("ease-in-out")
  })
})
