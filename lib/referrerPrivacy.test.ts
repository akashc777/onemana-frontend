import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { referrerToSend } from "./track"

/**
 * The visit counter keeps each pageview's referrer for 13 months, and a
 * referrer is the full address of the page that linked here.
 *
 * WHY THIS EXISTS. The purchase receipt's address carried the buyer's licence
 * key and email, and any page opened from it in a new tab reported that address
 * as its referrer. The counter only ever reports the referrer's host, so the
 * query and fragment are dropped before the beacon is sent.
 */

describe("the referrer a pageview sends", () => {
  it("drops the query string and the fragment", () => {
    expect(referrerToSend("https://onemana.dev/buy/success?email=a%40b.example&key=3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"))
      .toBe("https://onemana.dev/buy/success")
    expect(referrerToSend("https://onemana.dev/account?email=a%40b.example&signin=123456#top")).toBe("https://onemana.dev/account")
    expect(referrerToSend("https://www.google.com/search?q=onecamp")).toBe("https://www.google.com/search")
    expect(referrerToSend("https://news.ycombinator.com/item#42")).toBe("https://news.ycombinator.com/item")
  })

  it("keeps what the reports read: the host, and a referrer that has nothing to drop", () => {
    for (const ref of ["", "https://t.co/abc123", "android-app://com.reddit.frontpage/", "https://onemana.dev/"]) {
      expect(referrerToSend(ref)).toBe(ref)
    }
  })

  it("is what the beacon actually sends", () => {
    // Source-level: the beacon reads document.referrer in one place, and that
    // place must go through the filter.
    const src = readFileSync("lib/track.ts", "utf8")
    expect(src).toContain("referrerToSend(document.referrer)")
    expect(src.match(/document\.referrer/g)?.length).toBe(1)
  })
})
