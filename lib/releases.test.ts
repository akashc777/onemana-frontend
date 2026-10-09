import { describe, expect, it } from "vitest"

import { collectReleases, nextLink, summariseReleases, MAX_RELEASE_PAGES, type GithubRelease } from "./releases"

describe("release facts", () => {
  const now = new Date("2026-10-10T06:00:00Z")

  it("names the newest server release and counts the last 30 days", () => {
    const facts = summariseReleases(
      [
        { tag_name: "v1.55.0", published_at: "2026-10-09T21:30:59Z" },
        { tag_name: "v2.69.0", published_at: "2026-10-09T03:29:59Z" },
        { tag_name: "v2.70.0", published_at: "2026-10-09T21:30:58Z" },
        { tag_name: "v2.10.0", published_at: "2026-08-01T00:00:00Z" },
        { tag_name: "v2.71.0-rc1", published_at: "2026-10-10T00:00:00Z" },
        { tag_name: "v2.71.0", published_at: "2026-10-10T01:00:00Z", draft: true },
      ],
      now,
    )
    expect(facts).toEqual({ version: "v2.70", date: "9 Oct", last30: 2 })
  })

  it("says nothing rather than something wrong when there is no server release", () => {
    expect(summariseReleases([{ tag_name: "v1.2.0", published_at: "2026-10-01T00:00:00Z" }], now)).toBeNull()
    expect(summariseReleases([], now)).toBeNull()
  })
})

describe("release paging", () => {
  const now = new Date("2026-10-10T06:00:00Z")
  const rel = (n: number, day: string): GithubRelease => ({ tag_name: `v2.${n}.0`, published_at: `${day}T00:00:00Z` })

  it("reads the next page from GitHub's Link header", () => {
    expect(
      nextLink('<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=4>; rel="last"'),
    ).toBe("https://api.github.com/x?page=2")
    expect(nextLink('<https://api.github.com/x?page=1>; rel="prev"')).toBeNull()
    expect(nextLink(null)).toBeNull()
  })

  it("follows pages until one reaches past 30 days, so the count cannot shrink", async () => {
    const pages: Record<string, { list: GithubRelease[]; next: string | null }> = {
      p1: { list: [rel(70, "2026-10-09"), rel(69, "2026-10-01")], next: "p2" },
      p2: { list: [rel(68, "2026-09-20"), rel(10, "2026-08-01")], next: "p3" },
      p3: { list: [rel(9, "2026-07-01")], next: null },
    }
    const seen: string[] = []
    const list = await collectReleases("p1", async (u) => (seen.push(u), pages[u]), now)
    expect(seen).toEqual(["p1", "p2"])
    expect(summariseReleases(list ?? [], now)?.last30).toBe(3)
  })

  it("stops after a few pages, and is null when the first page fails", async () => {
    let calls = 0
    const endless = async () => (calls++, { list: [rel(1, "2026-10-09")], next: "again" })
    await collectReleases("p", endless, now)
    expect(calls).toBe(MAX_RELEASE_PAGES)
    expect(await collectReleases("p", async () => null, now)).toBeNull()
  })
})
