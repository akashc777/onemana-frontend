import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ICON_NAMES, ICON_STROKE, Icon } from "@/components/ui/icons"

/**
 * ONE ICON SET, ONE STROKE (design v3, DESIGN_V3 §3.12; site.md G9).
 *
 * The app's Lucide icons render one 1.25px line at every size (stroke-width
 * = 30 / size). The site drew forty icons inline, each with its own stroke
 * on its own grid, and the guard here checked only the stroke on the grid,
 * not on the screen: measured on onemana.dev on 11 Oct 2026, a 14px arrow
 * came out at 1.09px, the templates' 18px glyph at 1.41, the menu and the
 * docs' 20px tiles at 1.56 and a template's 22px tile at 1.72
 * (design/site-polish/AUDIT.md, I1).
 *
 * Now every icon is drawn by components/ui/icons.tsx with a non-scaling
 * stroke of 1.25px, so its size cannot change its weight, and no other file
 * draws one. The drawings keep their own weights and live in their own
 * modules: the spots, rings and marks (components/ui/graphics), the logo
 * ring, the spark and the agent's square (components/ui/v3.tsx).
 */
const ROOT = resolve(__dirname, "..")

/** Files that may contain an <svg>: the icon set and the drawings. */
const DRAWINGS = ["components/ui/icons.tsx", "components/ui/v3.tsx", "components/ui/graphics/"]

/**
 * The replicas of the app (components/site/showcase): they draw the APP'S
 * icons, Lucide, as the app does, and its marks (the workspace ring, the
 * spark, status glyphs), so the picture is the product's and not the site's
 * redrawing of it. Lucide is set at the same one rendered 1.25px stroke
 * (absoluteStrokeWidth), and showcase.test.tsx holds the replicas to the
 * table. The home page, the facts strip and the tabs draw with the set like
 * every other page. Nothing else may join this list.
 */
const SHOWCASE = ["components/site/showcase/"]

/** Not the public site: the admin console and the playful layer's dev page. */
const NOT_THE_SITE = ["app/admin/", "components/admin/", "app/playful-dev/"]

function tsx(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) tsx(rel, out)
    else if (rel.endsWith(".tsx") && !rel.includes(".test.")) out.push(rel)
  }
  return out
}

const allowed = (rel: string) => [...DRAWINGS, ...SHOWCASE, ...NOT_THE_SITE].some((p) => rel === p || rel.startsWith(p))

describe("icons", () => {
  it("come from the one set: no other page or component draws an <svg>", () => {
    const offenders: string[] = []
    for (const rel of [...tsx("app"), ...tsx("components")]) {
      if (allowed(rel)) continue
      const src = readFileSync(join(ROOT, rel), "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
      const n = src.match(/<svg\b/g)?.length ?? 0
      if (n) offenders.push(`${rel}: ${n} inline <svg>; draw it with <Icon> from components/ui/icons`)
    }
    expect(offenders).toEqual([])
  })

  it("the lists above name files that exist, so a moved file cannot slip through", () => {
    for (const p of [...DRAWINGS, ...SHOWCASE.filter((s) => !s.endsWith("/"))]) expect(existsSync(join(ROOT, p)), p).toBe(true)
  })

  it.each(ICON_NAMES)("%s: every line a non-scaling 1.25px stroke, on the 24 grid", (name) => {
    for (const size of [14, 16, 20, 24]) {
      const svg = renderToStaticMarkup(createElement(Icon, { name, size }))
      expect(svg).toMatch(/^<svg viewBox="0 0 24 24"/)
      expect(svg).toContain(`stroke-width="${ICON_STROKE}"`)
      expect(svg).toContain(`width="${size}"`)
      // Every stroked shape keeps its width on screen whatever the size.
      for (const shape of svg.match(/<(path|circle|rect)\b[^>]*>/g) ?? []) {
        if (/stroke="none"/.test(shape)) continue
        expect(shape, `${name} ${shape}`).toContain('vector-effect="non-scaling-stroke"')
      }
      expect(svg).toContain('aria-hidden="true"')
    }
  })

  it("is 1.25px, the app's one rendered stroke", () => {
    expect(ICON_STROKE).toBe(1.25)
  })

  it("a path from a data table takes the same stroke", () => {
    const svg = renderToStaticMarkup(createElement(Icon, { d: "M4 20V10M10 20V4" }))
    expect(svg).toContain('vector-effect="non-scaling-stroke"')
    expect(svg).toContain(`stroke-width="${ICON_STROKE}"`)
  })

  it("beside text are 16 px", () => {
    const plan = readFileSync(join(ROOT, "components/site/PlanCard.tsx"), "utf8")
    expect(plan).toContain('<Glyph className="size-4 shrink-0 text-hue" />')
    const buy = readFileSync(join(ROOT, "app/buy/BuyCheckout.tsx"), "utf8")
    expect(buy).not.toMatch(/Glyph className="size-5/)
  })
})
