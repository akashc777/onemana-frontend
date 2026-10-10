import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Headings on one scale. Every heading, and any text set in the display
 * face, takes a step from the marketing scale (tailwind.config.ts and
 * DESIGN.md, Type), never an arbitrary size. Before: the margin headings
 * were 28 px beside 32 px section headings, page titles came in 30, 32, 36,
 * 42 and 44 px on a phone and a post's title was 42 px on a wide screen, and
 * /compare's question 24 and 28: sizes nobody chose, which is what made the
 * same kind of heading look different from page to page.
 */
const ROOT = resolve(__dirname, "..")
const SKIP = ["node_modules", ".next", "admin", "playful-dev"]

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) {
      if (!SKIP.includes(e.name)) tsx(f, out)
    } else if (f.endsWith(".tsx") && !f.includes(".test.")) out.push(f)
  }
  return out
}

describe("the type scale", () => {
  it("names a step for every size a heading needs, the smaller screens' included", () => {
    const config = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8")
    for (const step of ["display", '"display-md"', '"display-sm"', "h1", "title", '"title-sm"', "h2", "h3"]) {
      expect(config).toMatch(new RegExp(`(^|\\s)${step}: \\["[\\d.]+rem", \\{ lineHeight`, "m"))
    }
  })

  // Body text too: nothing below the caption step (13 px), and no line height
  // the scale does not set. /compare's notes were 14 px on Tailwind's relaxed
  // line, its source line 12 px, and the update forms' hints 12 px. The drawn
  // marks (components/ui/graphics) set their own small labels.
  it("no text below the caption, and no line height off the scale", () => {
    const offenders: string[] = []
    const files = [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))].filter(
      (f) => !/components\/(ui\/graphics|admin|account)\//.test(f),
    )
    for (const f of files) {
      for (const m of readFileSync(f, "utf8").matchAll(/\b(text-xs|leading-(?:relaxed|snug|loose|tight))\b/g)) {
        offenders.push(`${f.slice(ROOT.length + 1)}: ${m[1]}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it("no heading, and no display-face text, takes an arbitrary size", () => {
    const offenders: string[] = []
    for (const f of [...tsx(join(ROOT, "app")), ...tsx(join(ROOT, "components"))]) {
      for (const m of readFileSync(f, "utf8").matchAll(/<(h[1-6]|[a-z]+)\b[^>]*?className=\{?[`"]([^`"]*)[`"]/g)) {
        const [, tag, cls] = m
        const heading = /^h[1-6]$/.test(tag!)
        if (!heading && !/\bfont-display\b/.test(cls!)) continue
        if (/(^|\s)([a-z]+:)?text-\[[\d.]+(rem|px)\]/.test(cls!)) offenders.push(`${f.slice(ROOT.length + 1)} <${tag}> ${cls}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
