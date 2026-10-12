import { describe, expect, it } from "vitest"

import { collectReleases, nextLink, summariseReleases, MAX_RELEASE_PAGES, type GithubRelease } from "./releases"

describe("release facts", () => {
  const now = new Date("2026-10-10T06:00:00Z")

  it("counts the server's feature releases of the last 30 days and names the newest that has a headline", () => {
    const facts = summariseReleases(
      [
        { tag_name: "v1.55.0", published_at: "2026-10-09T21:30:59Z", body: "**For the other edition**\n- x" },
        { tag_name: "v2.69.0", published_at: "2026-10-09T03:29:59Z", body: "**Link tables**\n- x" },
        { tag_name: "v2.70.0", published_at: "2026-10-09T21:30:58Z", body: "**New teammates arrive ready to work**\n- x" },
        { tag_name: "v2.70.1", published_at: "2026-10-10T01:30:58Z", body: "**Fixed**\n- y" },
        { tag_name: "v2.10.0", published_at: "2026-08-01T00:00:00Z", body: "**Old**\n- x" },
        { tag_name: "v2.71.0-rc1", published_at: "2026-10-10T00:00:00Z", body: "**Candidate**\n- x" },
        { tag_name: "v2.71.0", published_at: "2026-10-10T01:00:00Z", body: "**Draft**\n- x", draft: true },
      ],
      now,
    )
    expect(facts).toEqual({ last30: 2, pill: { headline: "New teammates arrive ready to work", href: "/changelog/2026-10-09-new-teammates-arrive-ready-to-work" } })
  })

  it("says nothing rather than something wrong when there is no server release", () => {
    expect(summariseReleases([{ tag_name: "v1.2.0", published_at: "2026-10-01T00:00:00Z" }], now)).toBeNull()
    expect(summariseReleases([], now)).toBeNull()
  })

  it("has no pill when no release names itself", () => {
    expect(summariseReleases([{ tag_name: "v2.70.0", published_at: "2026-10-09T00:00:00Z", body: "**Fixes**\n- x" }], now)).toEqual({ last30: 1 })
  })
})

describe("release paging", () => {
  const rel = (n: number, day: string): GithubRelease => ({ tag_name: `v2.${n}.0`, published_at: `${day}T00:00:00Z` })

  it("reads the next page from GitHub's Link header", () => {
    expect(
      nextLink('<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=4>; rel="last"'),
    ).toBe("https://api.github.com/x?page=2")
    expect(nextLink('<https://api.github.com/x?page=1>; rel="prev"')).toBeNull()
    expect(nextLink(null)).toBeNull()
  })

  it("follows every page to the end, so the changelog reaches back as far as the list does", async () => {
    const pages: Record<string, { list: GithubRelease[]; next: string | null }> = {
      p1: { list: [rel(70, "2026-10-09"), rel(69, "2026-10-01")], next: "p2" },
      p2: { list: [rel(68, "2026-09-20"), rel(10, "2026-08-01")], next: "p3" },
      p3: { list: [rel(9, "2026-07-01")], next: null },
    }
    const seen: string[] = []
    const list = await collectReleases("p1", async (u) => (seen.push(u), pages[u]!))
    expect(seen).toEqual(["p1", "p2", "p3"])
    expect(list?.map((r) => r.tag_name)).toEqual(["v2.70.0", "v2.69.0", "v2.68.0", "v2.10.0", "v2.9.0"])
  })

  it("stops after a few pages, keeps what it read when a later page fails, and is null when the first fails", async () => {
    let calls = 0
    const endless = async () => (calls++, { list: [rel(1, "2026-10-09")], next: "again" })
    await collectReleases("p", endless)
    expect(calls).toBe(MAX_RELEASE_PAGES)
    expect(await collectReleases("p", async () => null)).toBeNull()
    const second = await collectReleases("p1", async (u) => (u === "p1" ? { list: [rel(70, "2026-10-09")], next: "p2" } : null))
    expect(second?.map((r) => r.tag_name)).toEqual(["v2.70.0"])
  })
})
