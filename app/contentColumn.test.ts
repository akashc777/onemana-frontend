import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * One content column per page: every section starts on the nav's left edge
 * (container-x). A max width added to container-x itself re-centres the
 * column, because container-x centres with mx-auto: /tour's film and its
 * buttons began 112 px to the right of the page's title at 1440 px. A
 * narrower block goes inside container-x, where it starts on the edge.
 *
 * The one column that is centred on purpose is a blog post's reading column
 * (components/reading), the same on every post.
 */
const ROOT = resolve(__dirname, "..")
const ALLOWED = new Set(["app/blog/[slug]/page.tsx"])

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) {
      if (!["node_modules", ".next", "admin"].includes(e.name)) tsx(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.")) out.push(f)
  }
  return out
}

describe("one content column", () => {
  it("no section narrows container-x itself, which would centre it off the page's edge", () => {
    const offenders: string[] = []
    for (const f of [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))]) {
      const rel = f.slice(ROOT.length + 1)
      if (ALLOWED.has(rel)) continue
      for (const m of readFileSync(f, "utf8").matchAll(/className=[{`"]+([^"`}]*)/g)) {
        const cls = m[1]!.split(/\s+/)
        if (cls.includes("container-x") && cls.some((c) => /^max-w-/.test(c))) offenders.push(`${rel}: ${m[1]}`)
      }
    }
    expect(offenders).toEqual([])
  })

  // Inside the column, a page's two-column parts sit on one 12-column grid
  // with 32 px gutters, so their second columns share lines: /alternatives
  // put a claim's text at 617 px, the prices' second figure at 668 and the
  // band's second list at 752, each from its own fr split and 40 or 64 px
  // gutter, where /pricing, /about and the home page start theirs at 555.
  it("two-column parts sit on the shared 12-column grid", () => {
    const offenders: string[] = []
    for (const rel of ["components/site/AudienceView.tsx", "app/free/page.tsx", "app/page.tsx", "app/pricing/page.tsx", "app/verify/page.tsx", "components/site/AboutView.tsx"]) {
      const src = readFileSync(join(ROOT, rel), "utf8")
      for (const m of src.matchAll(/\b(?:sm|md|lg):(?:grid-cols-\[[^\]]*fr\)[^\]]*\]|gap-(?:x-)?(?:10|12|16|20)\b|grid-cols-\[repeat)/g)) offenders.push(`${rel}: ${m[0]}`)
    }
    expect(offenders).toEqual([])
  })

  it("the film's play control is the player's own, not a second filled orange button in view", () => {
    // /tour showed "Watch the film" and "Try the live demo" filled in the
    // accent in one view, and the "1:32" in 80% white on orange read at 3.5:1.
    const src = readFileSync(join(ROOT, "components/site/HeroProductVideo.tsx"), "utf8")
    const pill = /<span className="absolute bottom-3[^"]*"/.exec(src)?.[0] ?? ""
    expect(pill).not.toBe("")
    expect(pill).not.toMatch(/\bbg-brand\b/)
    expect(src).not.toMatch(/tabular-nums opacity-\d+/)
  })
})
