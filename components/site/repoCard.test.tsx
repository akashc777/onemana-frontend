import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { RepoCard, RepoCards, repoFactsLine } from "@/components/site/RepoCard"
import type { RepoFacts } from "@/lib/github"
import { REPO_COPY } from "@/lib/openSource"

/**
 * One repository's card (the owner's ask, 15 Oct 2026), on /open-source and
 * the home page: what it is, its licence, its stars and its newest release,
 * and no number when GitHub did not answer. The full card holds still and
 * carries two links; the compact one is itself the link and lifts.
 */
const server = REPO_COPY[0]!
const web = REPO_COPY[1]!
const facts = (over: Partial<RepoFacts> = {}): RepoFacts => ({
  repo: server.repo,
  url: "https://github.com/OneMana-Soft/OneCamp",
  stars: 68,
  licence: "AGPL-3.0",
  release: { tag: "v2.72.2", publishedAt: "2026-10-15T07:37:00Z", url: "https://github.com/OneMana-Soft/OneCamp/releases/tag/v2.72.2" },
  pushedAt: "2026-10-15T07:36:54Z",
  ...over,
})
const links = (html: string) => html.match(/<a [^>]*>/g) ?? []
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

describe("the full card", () => {
  const html = renderToString(<RepoCard copy={server} facts={facts()} />)

  it("says what the repository is, where it lives, what it does, and its licence", () => {
    expect(html).toMatch(/<h3 [^>]*>.*Server<\/h3>/)
    expect(html).toContain("OneMana-Soft/OneCamp")
    expect(html).toContain(server.line)
    expect(html).toMatch(/class="ui-chip[^"]*"><span class="sr-only">Licence: <\/span>AGPL-3.0<\/span>/)
    expect(html).toContain("hue-sky")
  })

  it("shows its stars and the day of its newest release, and never the release's version", () => {
    expect(text(html)).toContain("68 stars")
    expect(text(html)).toContain("Released 15 Oct 2026")
    expect(html).not.toContain("v2.72.2")
  })

  it("holds still, and carries two ways out to the code, each saying it opens a new tab", () => {
    expect(html).toMatch(/^<article /)
    expect(html).not.toContain("data-interactive")
    const [read, star] = links(html)
    expect(links(html)).toHaveLength(2)
    for (const a of [read!, star!]) {
      expect(a).toContain('href="https://github.com/OneMana-Soft/OneCamp"')
      expect(a).toContain('target="_blank"')
    }
    expect(read).toContain('class="go tap-target"')
    expect(star).toContain("ui-btn ui-btn-sm ui-btn-secondary max-md:min-h-11")
    expect(text(html)).toContain("Read the code of the server (opens in a new tab)")
    expect(text(html)).toContain("Star the server on GitHub (opens in a new tab)")
  })
})

describe("what the card shows of the read", () => {
  it("no stars yet shows no number, not a zero", () => {
    const html = renderToString(<RepoCard copy={server} facts={facts({ stars: 0 })} />)
    expect(text(html)).not.toMatch(/\b\d+ stars?\b/)
    // The star icon is drawn once, on "Star on GitHub", and not beside a count.
    expect(html.match(/M12 3\.5l2\.6/g)).toHaveLength(1)
    expect(text(html)).toContain("Released 15 Oct 2026")
    expect(repoFactsLine(facts({ stars: 0 })).stars).toBeNull()
  })

  it("a repository with no release shows when it last changed instead", () => {
    const html = renderToString(<RepoCard copy={web} facts={facts({ repo: web.repo, release: null, pushedAt: "2026-10-04T06:25:59Z", licence: "MIT" })} />)
    expect(text(html)).toContain("Updated 4 Oct 2026")
    expect(text(html)).not.toContain("Released")
  })

  it("with no answer from GitHub, keeps everything that does not change and shows no number", () => {
    for (const compact of [false, true]) {
      const html = renderToString(<RepoCard copy={web} compact={compact} />)
      expect(text(html)).toContain("Web app")
      expect(text(html)).toContain("MIT")
      expect(text(html)).not.toMatch(/\d/)
      expect(html).toContain('href="https://github.com/OneMana-Soft/OneCamp-fe"')
    }
    expect(repoFactsLine(undefined)).toEqual({ stars: null, when: null })
  })

  it("GitHub's own reading of the licence wins over the copy's", () => {
    const html = renderToString(<RepoCard copy={server} facts={facts({ licence: "GPL-3.0" })} />)
    expect(html).toContain("GPL-3.0")
    expect(renderToString(<RepoCard copy={server} facts={facts({ licence: null })} />)).toContain("AGPL-3.0")
  })
})

describe("the compact card", () => {
  const html = renderToString(<RepoCard copy={server} facts={facts()} compact />)

  it("is one link to the code, which lifts in the repository's hue", () => {
    expect(links(html)).toHaveLength(1)
    const a = links(html)[0]!
    expect(a).toContain('data-interactive="card"')
    expect(a).toContain('data-hue="sky"')
    expect(a).toContain('href="https://github.com/OneMana-Soft/OneCamp"')
    expect(a).toContain('target="_blank"')
    expect(text(html)).toContain("Read the code of the server (opens in a new tab)")
  })

  it("sets its line aside on a phone, and shows the stars and the release", () => {
    expect(html).toMatch(/<p class="[^"]*hidden[^"]*sm:block[^"]*">The workspace itself/)
    expect(text(html)).toContain("68 stars")
    expect(text(html)).toContain("Released 15 Oct 2026")
    expect(html).not.toContain("OneMana-Soft/OneCamp<")
  })
})

describe("the four cards", () => {
  it("come in the site's order, each in its own hue, two across from sm and four when compact", () => {
    const full = renderToString(<RepoCards copies={REPO_COPY} facts={() => undefined} />)
    expect([...full.matchAll(/<h3 [^>]*>.*?<\/span>([^<]+)<\/h3>/g)].map((m) => m[1])).toEqual(["Server", "Web app", "Desktop app", "Omarchy kit"])
    for (const hue of ["sky", "moss", "sun", "dusk"]) expect(full).toContain(`hue-${hue}`)
    expect(full).toMatch(/<ul class="[^"]*sm:grid-cols-2/)
    expect(full).not.toContain("lg:grid-cols-4")
    const compact = renderToString(<RepoCards compact copies={REPO_COPY} facts={() => undefined} />)
    expect(compact).toContain("lg:grid-cols-4")
    expect(links(compact)).toHaveLength(4)
  })

  it("hand each card its own facts", () => {
    const html = renderToString(<RepoCards copies={REPO_COPY} facts={(repo) => (repo === web.repo ? facts({ repo, stars: 68 }) : undefined)} />)
    expect(text(html).match(/68 stars/g)).toHaveLength(1)
    expect(text(html).indexOf("68 stars")).toBeGreaterThan(text(html).indexOf("Web app"))
    expect(text(html).indexOf("68 stars")).toBeLessThan(text(html).indexOf("Desktop app"))
  })
})
