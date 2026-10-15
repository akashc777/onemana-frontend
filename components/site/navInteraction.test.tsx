import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({ usePathname: () => "/pricing" }))

import { Nav } from "@/components/site/Nav"
import { ThemeSegments, ThemeToggle } from "@/components/site/ThemeToggle"
import { APP } from "@/lib/appSystem"
import { MOTION_TIMES } from "@/lib/tailwindAppSystem"

/**
 * The nav on the interaction layer (storefront audit G3, G4, G6, G8 to G11),
 * rendered on /pricing.
 */
const html = renderToString(<Nav />)
const menu = html.slice(html.indexOf('id="mobile-menu"'))
const tag = (src: string, re: RegExp) => re.exec(src)?.[0] ?? ""

describe("the phone menu", () => {
  // G10: the current page was ink at 100% beside ink at 90%: unmarked.
  it("marks the page you are on as a nav row, which the layer raises as the chip", () => {
    const pricing = tag(menu, /<a[^>]*href="\/pricing"[^>]*>/)
    expect(pricing).toContain('aria-current="page"')
    expect(pricing).toContain('data-interactive="nav"')
    // Every row is a nav row; only the current one is marked.
    const rows = menu.match(/<a[^>]*data-interactive="nav"[^>]*>/g) ?? []
    expect(rows.length).toBeGreaterThanOrEqual(6)
    expect(rows.filter((r) => r.includes('aria-current="page"'))).toHaveLength(1)
    // No row draws a background or a hover of its own over the layer's.
    for (const r of rows) expect(r).not.toMatch(/\b(bg-|hover:)/)
  })

  it("opens in the panel step, 240 ms at most (G9: it slid in over 280)", () => {
    expect(tag(html, /<div id="mobile-menu"[^>]*>/)).toContain("fx-slide")
    expect(MOTION_TIMES.moment).toBe(APP.interaction.ms.panel)
    expect(MOTION_TIMES.moment).toBeLessThanOrEqual(240)
  })

  it("its button is an icon button: the tint, and .92 under a finger", () => {
    const button = tag(html, /<button[^>]*aria-controls="mobile-menu"[^>]*>/)
    expect(button).toContain('data-interactive="icon"')
    expect(button).not.toMatch(/hover:/)
  })
})

// G11: the theme segments were 36 px tall, a radiogroup without arrow keys.
describe("the phone menu's theme segments", () => {
  const segs = renderToString(<ThemeSegments />)
  const radios = segs.match(/<button[^>]*role="radio"[^>]*>/g) ?? []

  it("are three 44 px segments, the chosen one raised by the layer", () => {
    expect(radios).toHaveLength(3)
    for (const r of radios) {
      expect(r).toContain("min-h-11")
      expect(r).toContain('data-interactive="tab"')
      expect(r).not.toMatch(/\bbg-card\b|shadow-e1/)
    }
  })

  it("are one Tab stop: only the chosen segment is in the Tab order", () => {
    expect(radios.map((r) => /tabindex="(-?\d)"/.exec(r)?.[1])).toEqual(["-1", "-1", "0"])
    expect(radios[2]).toContain('aria-checked="true"')
  })
})

describe("the desktop bar", () => {
  // G3: the current link turns 510, which moved its neighbours.
  it("holds each link's 510 width, so the bar never moves when the page changes", () => {
    for (const label of ["Pricing", "Compare", "Docs"]) {
      expect(html).toContain(`<span data-label="${label}">${label}</span>`)
    }
  })

  // G4: the Live demo link left the site with no word or mark.
  it("says the live demo opens in a new tab", () => {
    const at = html.indexOf('target="_blank"')
    const live = html.slice(at, html.indexOf("</a>", at))
    expect(live).toContain("Live demo")
    expect(live).toContain("(opens in a new tab)")
  })

  // G6: the icon's quarter turn still ran, instantly, for reduced motion.
  it("turns the theme icon only where motion is welcome", () => {
    const toggle = renderToString(<ThemeToggle />)
    expect(toggle).toContain('data-interactive="icon"')
    expect(toggle).toContain("motion-safe:group-active:rotate-90")
    expect(toggle).toContain("motion-safe:group-active:-rotate-90")
    expect(toggle).not.toMatch(/(?<!motion-safe:)group-active:-?rotate/)
  })
})
