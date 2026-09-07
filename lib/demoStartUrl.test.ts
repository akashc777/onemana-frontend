import { describe, expect, it } from "vitest"
import { execSync } from "child_process"
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

  // Every "go to the demo" link should start it. A placement left on the bare
  // URL sends that visitor to the sign-in page this change exists to skip, and
  // it would be invisible: the link still works, it is just the old experience.
  //
  // Exhaustive rather than a list of known files. The first version of this
  // named four files and passed while the footer, the about page and the social
  // proof block were all still on the bare URL.
  //
  // VisitorTracker is the one legitimate holder: it matches a demo click with
  // startsWith(site.demoUrl), so it needs the prefix, not the start URL.
  it("is used by every link that sends someone to the demo", () => {
    const TRACKER = "components/site/VisitorTracker.tsx"
    const offenders = execSync(
      "grep -rln 'site\\.demoUrl' app components lib --include='*.ts' --include='*.tsx' || true",
      { cwd: ROOT, encoding: "utf8" },
    )
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)
      .filter((f) => f !== TRACKER && !f.endsWith(".test.ts"))

    expect(offenders, `these still link the bare demo URL: ${offenders.join(", ")}`).toEqual([])
  })
})
