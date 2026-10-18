import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The home page says OneCamp is open source (the owner's ask, 15 Oct 2026),
 * in two places and no more: one quiet line under the ways in, "Open source"
 * opening /open-source, and a compact band of the four repositories' cards
 * after what running it involves, well below the first screen.
 */
const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8")
const waysIn = /function WaysIn[\s\S]*?\n}\n/.exec(page)?.[0] ?? ""

describe("the hero's line", () => {
  it("is Install free's hint on a computer and the shared hint on a phone, with no new element", () => {
    expect(page).toMatch(/function OpenSourceHint[\s\S]*?<Link href="\/open-source" className="link-quiet tap-target">\s*Open source\s*<\/Link>/)
    expect(waysIn).toMatch(/sm:block">\s*<OpenSourceHint \/> · Free for up to \{FREE_SEATS\} people/)
    expect(waysIn).toMatch(/sm:hidden">\s*<OpenSourceHint \/> · No sign-up · Free for up to \{FREE_SEATS\} people/)
    // The hints under the two buttons and the phone's one line: three, as before.
    expect(waysIn.match(/text-\[12\.5px\]/g)).toHaveLength(3)
    expect(waysIn.match(/<ButtonLink/g)).toHaveLength(2)
  })
})

describe("the band", () => {
  const at = (s: string) => page.indexOf(s)

  it("sits after what running it involves and before the comparison, far below the first screen", () => {
    expect(at('<Section id="open-source">')).toBeGreaterThan(at('<Section id="run">'))
    expect(at('<Section id="open-source">')).toBeLessThan(at('<Section id="compare">'))
    expect(at('<Section id="open-source">')).toBeGreaterThan(at("<HeroScene"))
  })

  it("is the compact cards from the same read, and the way to the page that says more", () => {
    const band = page.slice(at('<Section id="open-source">'), at('<Section id="compare">'))
    expect(band).toContain('title="Open source, end to end"')
    expect(band).toContain("<RepoCards compact copies={REPO_COPY} facts={(repo) => factsFor(openSource, repo)} />")
    expect(band).toMatch(/<Link href="\/open-source" className="go tap-target">/)
    expect(page).toMatch(/Promise\.all\(\[getPricing\(\), getReleaseFacts\(\), getOpenSource\(\)\]\)/)
  })

  it("is not a band in the design's sense: the page has no tinted band (the close is neutral since v3.1) and its one night", () => {
    expect(page.match(/band="/g)).toBeNull()
    expect(page.match(/<Section [^>]*\bnight\b/g)).toHaveLength(1)
  })
})
