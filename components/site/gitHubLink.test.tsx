import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { GitHubLink, githubLabel } from "@/components/site/GitHubLink"
import { Nav } from "@/components/site/Nav"
import { site } from "@/lib/site"

/**
 * The nav's way to the code (the owner's ask, 15 Oct 2026): GitHub's mark and
 * the four repositories' stars, opening the organisation; beside Install free
 * on a computer and a row of the menu on a phone; "GitHub" and no number when
 * GitHub did not answer.
 */
const tag = (html: string, re: RegExp) => re.exec(html)?.[0] ?? ""
const text = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&#x27;/g, "'")

describe("the GitHub link", () => {
  it("shows the mark and the stars, and says both in its name", () => {
    const html = renderToString(<GitHubLink stars={68} />)
    const a = tag(html, /<a [^>]*>/)
    expect(a).toContain(`href="${site.githubOrgUrl}"`)
    expect(a).toContain('target="_blank"')
    expect(a).toContain('rel="noreferrer"')
    expect(a).toContain('aria-label="OneCamp on GitHub, 68 stars (opens in a new tab)"')
    expect(text(html)).toBe("68")
    expect(html.match(/<svg/g)).toHaveLength(2) // the mark and the star
    expect(html).toContain("tabular-nums")
  })

  it("with no answer from GitHub, says GitHub and shows no number", () => {
    const html = renderToString(<GitHubLink stars={null} />)
    expect(text(html)).toBe("GitHub")
    expect(html).not.toMatch(/\d+\s*stars?|\bstar\b/)
    expect(tag(html, /<a [^>]*>/)).toContain('aria-label="OneCamp on GitHub (opens in a new tab)"')
    expect(html.match(/<svg/g)).toHaveLength(1)
  })

  it("its name holds the words it shows, a short count said in full", () => {
    for (const [stars, shown, said] of [
      [1, "1", "1 star"],
      [1234, "1.2k", "1,234 stars"],
    ] as const) {
      const html = renderToString(<GitHubLink stars={stars} />)
      expect(text(html)).toBe(shown)
      expect(githubLabel(stars)).toContain(said)
    }
    expect(githubLabel(null)).toContain("GitHub")
  })

  it("is a quiet button in the bar and a nav row in the menu, each answering a finger", () => {
    const bar = tag(renderToString(<GitHubLink stars={68} />), /<a [^>]*>/)
    expect(bar).toMatch(/class="ui-btn ui-btn-subtle ui-btn-md /)
    const menu = renderToString(<GitHubLink stars={68} look="menu" />)
    const row = tag(menu, /<a [^>]*>/)
    expect(row).toContain('data-interactive="nav"')
    expect(row).toContain("min-h-12")
    expect(row).not.toMatch(/\b(bg-|hover:)/)
    expect(text(menu)).toBe("GitHub68")
  })
})

describe("in the nav", () => {
  it("sits beside Install free on a computer, after the live demo", () => {
    const html = renderToString(<Nav stars={68} />)
    const bar = html.slice(0, html.indexOf('id="mobile-menu"'))
    const github = bar.indexOf('aria-label="OneCamp on GitHub, 68 stars')
    expect(github).toBeGreaterThan(bar.indexOf("Live demo"))
    expect(github).toBeLessThan(bar.indexOf(">Install free<"))
  })

  it("is a row of the phone menu, after Sign in and before the theme", () => {
    const html = renderToString(<Nav stars={68} />)
    const menu = html.slice(html.indexOf('id="mobile-menu"'))
    const row = menu.indexOf('aria-label="OneCamp on GitHub, 68 stars')
    expect(row).toBeGreaterThan(menu.indexOf("Sign in"))
    expect(row).toBeLessThan(menu.indexOf(">Theme<"))
  })

  it("shows no number in either place when the layout has none to give", () => {
    const html = renderToString(<Nav />)
    expect(html.match(/aria-label="OneCamp on GitHub \(opens in a new tab\)"/g)).toHaveLength(2)
  })

  it("gets the four repositories' total from the root layout's one read", () => {
    const layout = readFileSync(resolve(__dirname, "../../app/layout.tsx"), "utf8")
    expect(layout).toMatch(/Promise\.all\(\[getPricing\(\), getOpenSource\(\)\]\)/)
    expect(layout).toContain("<Nav stars={openSource?.stars ?? null} />")
  })
})
