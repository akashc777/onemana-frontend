import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { OpenSourceFacts } from "@/lib/github"

// The page's one read, answered here: no network in a test.
const read = vi.hoisted(() => ({ facts: null as OpenSourceFacts | null }))
vi.mock("@/lib/github", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/github")>()),
  getOpenSource: async () => read.facts,
}))

import OpenSourcePage, { metadata } from "@/app/open-source/page"
import { Footer } from "@/components/site/Footer"
import { FREE_SEATS } from "@/lib/freePlan"
import { OPEN_SOURCE_LINKS, REPO_COPY } from "@/lib/openSource"
import { site } from "@/lib/site"

/**
 * /open-source (the owner's ask, 15 Oct 2026): what is open, with each
 * repository's stars and newest release from GitHub, how to run it, why two
 * licences, and how to help, pointing to the repositories' own files; and
 * the same page, every word of it, when GitHub does not answer.
 */
const facts: OpenSourceFacts = {
  stars: 68,
  repos: REPO_COPY.map((c, i) => ({
    repo: c.repo,
    url: `https://github.com/${c.repo}`,
    stars: i === 1 ? 68 : 0,
    licence: c.licence,
    release: i === 0 ? { tag: "v2.72.2", publishedAt: "2026-10-15T07:37:00Z", url: "https://github.com/x" } : null,
    pushedAt: "2026-10-04T06:25:59Z",
  })),
}

async function page(f: OpenSourceFacts | null) {
  read.facts = f
  return renderToString(await OpenSourcePage())
}
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ").trim()
const hrefs = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]!)

afterEach(() => {
  read.facts = null
})

describe("the page's metadata", () => {
  it("has its own title, description, canonical address and share card", () => {
    expect(metadata.title).toBe("Open source, end to end")
    expect(metadata.description).toMatch(/AGPL-3\.0.*MIT/)
    expect(String(metadata.description).length).toBeLessThanOrEqual(170)
    expect(metadata.alternates?.canonical).toBe("/open-source")
    expect(metadata.openGraph).toMatchObject({ title: "Open source, end to end", url: `${site.url}/open-source` })
    expect(metadata.openGraph?.images).toBeTruthy()
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: "Open source, end to end" })
  })

  it("is in the sitemap", () => {
    expect(readFileSync(join(__dirname, "sitemap.ts"), "utf8")).toContain('"/open-source"')
  })
})

describe("what the page says", () => {
  it("shows the four repositories with what GitHub says of them now", async () => {
    const html = await page(facts)
    for (const c of REPO_COPY) expect(text(html)).toContain(c.role)
    expect(text(html)).toContain("68 stars")
    expect(text(html)).toContain("Released 15 Oct 2026")
    expect(html).not.toContain("v2.72.2")
  })

  it("says all of it, with no number, when GitHub does not answer", async () => {
    const quiet = text(await page(null))
    for (const c of REPO_COPY) expect(quiet).toContain(c.line)
    expect(quiet).not.toMatch(/\d+ stars?\b|Released|Updated/)
    for (const heading of ["Run it yourself", "Why two licences", "Help build it"]) expect(quiet).toContain(heading)
  })

  it("asks for a star on the server, and offers the free install, up to the free plan's seats", async () => {
    const html = await page(facts)
    const star = /<a [^>]*>(?:(?!<\/a>).)*Star OneCamp on GitHub/.exec(html)?.[0] ?? ""
    expect(star).toContain(`href="${site.serverGithubUrl}"`)
    expect(star).toContain("ui-btn-primary")
    expect(text(html)).toContain(`Install free, up to ${FREE_SEATS} people`)
    expect(html.match(/ui-btn-primary/g)).toHaveLength(1)
  })

  it("links the install guide and the free install, and the source build in the server's README", async () => {
    const links = hrefs(await page(null))
    expect(links).toContain("/docs/installation")
    expect(links).toContain("/free")
    expect(links).toContain(OPEN_SOURCE_LINKS.readme)
  })

  it("points to the licences, CONTRIBUTING.md and SECURITY.md in the repositories, inventing no process of its own", async () => {
    const html = await page(null)
    const links = hrefs(html)
    for (const l of Object.values(OPEN_SOURCE_LINKS)) expect(links, l).toContain(l)
    expect(OPEN_SOURCE_LINKS).toMatchObject({
      serverLicence: "https://github.com/OneMana-Soft/OneCamp/blob/HEAD/LICENSE",
      commercialLicence: "https://github.com/OneMana-Soft/OneCamp/blob/HEAD/COMMERCIAL-LICENSE.md",
      webLicence: "https://github.com/OneMana-Soft/OneCamp-fe/blob/HEAD/LICENSE",
      contributing: "https://github.com/OneMana-Soft/OneCamp/blob/HEAD/CONTRIBUTING.md",
      security: "https://github.com/OneMana-Soft/OneCamp/blob/HEAD/SECURITY.md",
      privateReport: "https://github.com/OneMana-Soft/OneCamp/security/advisories/new",
    })
    // Every link out is to OneCamp's own repositories, and says it opens a new tab.
    const out = [...html.matchAll(/<a [^>]*href="(https:[^"]+)"[^>]*>((?:(?!<\/a>).)*)<\/a>/g)]
    expect(out.length).toBeGreaterThan(12)
    for (const [, href, inner] of out) {
      expect(site.githubRepos.some((r) => href!.startsWith(`https://github.com/${r}`)), href).toBe(true)
      expect(inner, href).toContain("(opens in a new tab)")
    }
  })

  it("keeps the copy rules: no price, no trial or refund, no version, never compliant, British spelling", async () => {
    const words = text(await page(facts))
    expect(words).not.toMatch(/[₹$]\s?\d|\btrial|\brefund|\bVAT\b|complian|\bv[12]\.\d/i)
    expect(words).not.toMatch(/\blicense\b/i)
    expect(words).toContain("licence")
    expect(words).not.toContain("—")
  })
})

describe("the footer", () => {
  it("links the page, and GitHub's organisation where all four live", () => {
    const html = renderToString(<Footer />)
    expect(html).toMatch(/<a [^>]*href="\/open-source"[^>]*>Open source<\/a>/)
    expect(html).toMatch(new RegExp(`<a [^>]*href="${site.githubOrgUrl}"[^>]*target="_blank"[^>]*>GitHub</a>`))
  })
})
