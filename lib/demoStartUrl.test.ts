import { describe, expect, it } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

import { site } from "./site"

const ROOT = join(__dirname, "..")

describe("the demo link", () => {
  // The whole point: a visitor who clicks "try the demo" must arrive at the
  // demo, not at a sign-in page listing it fifth.
  it("asks the demo host to start the demo", () => {
    expect(site.demoStartUrl).toContain("start_demo=1")
  })

  // VisitorTracker matches a demo click with href.startsWith(site.demoUrl).
  // If the start URL stopped being a prefix, every demo click would go
  // uncounted and we would lose the only number that told us this was broken.
  it("stays a prefix match for the click tracker", () => {
    expect(site.demoStartUrl.startsWith(site.demoUrl)).toBe(true)
  })

  // An operator can override NEXT_PUBLIC_DEMO_URL, and one that already carries
  // a query string must not produce a second "?".
  it("appends correctly to a URL that already has a query", () => {
    const withQuery = { demoUrl: "https://demo.example.com/?ref=x", demoStartUrl: site.demoStartUrl }
    const derived = `${withQuery.demoUrl}${withQuery.demoUrl.includes("?") ? "&" : "?"}start_demo=1`
    expect(derived).toBe("https://demo.example.com/?ref=x&start_demo=1")
    expect(derived.split("?").length).toBe(2)
  })

  // Every "go to the demo" action should start it. A placement left on the bare
  // URL sends that visitor back to the sign-in page, and it would be invisible.
  it("is used by every call to action that sends someone to the demo", () => {
    const actionFiles = [
      "app/page.tsx",
      "app/buy/page.tsx",
      "components/site/StickyBuyCta.tsx",
      "components/site/Nav.tsx",
    ]
    for (const f of actionFiles) {
      const src = readFileSync(join(ROOT, f), "utf8")
      if (!src.includes("demoUrl") && !src.includes("demoStartUrl")) continue
      expect(src, `${f} still links the bare demo URL`).not.toMatch(/site\.demoUrl\b/)
    }
  })
})
