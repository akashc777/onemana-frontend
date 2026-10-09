import { describe, expect, it } from "vitest"

import { summariseReleases } from "./releases"

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
