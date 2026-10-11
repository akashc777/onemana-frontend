import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { marketingUtilities } from "@/lib/tailwindAppSystem"

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
  // The marketing scale (site.md G2): each step its phone, tablet and
  // desktop sizes, from the one table, with the spec's tracking.
  it("names a step for every size a heading needs, the smaller screens' included", () => {
    const u = marketingUtilities()
    const want: Record<string, [number, number, number]> = { hero: [42, 56, 68], page: [34, 44, 52], h2: [32, 38, 44], close: [36, 48, 56], "title-read": [30, 36, 40], lead: [18, 19, 20], price: [36, 44, 44], "price-sm": [28, 28, 28] }
    for (const [step, [phone, tablet, desktop]] of Object.entries(want)) {
      const r = u[`.text-${step}`] as Record<string, Record<string, string> | string>
      expect(r, step).toBeTruthy()
      const px = (v: unknown) => Number(String(v).replace("rem", "")) * 16
      expect(px(r.fontSize), `${step} phone`).toBe(phone)
      expect(px((r["@media (min-width: 640px)"] as Record<string, string>).fontSize), `${step} tablet`).toBe(tablet)
      expect(px((r["@media (min-width: 1024px)"] as Record<string, string>).fontSize), `${step} desktop`).toBe(desktop)
    }
    expect((u[".text-hero"] as Record<string, string>).letterSpacing).toBe("-0.024em")
    expect((u[".text-hero"] as Record<string, string>).fontWeight).toBe("600")
    // h3 is the app's text-xl, from the one table (lib/appSystem.ts).
    const config = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8")
    expect(config).toContain("h3: appTheme.fontSize.h3")
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
