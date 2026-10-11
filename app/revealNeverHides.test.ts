import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { motionCss } from "@/lib/tailwindAppSystem"

/**
 * Nothing is hidden at load (site.md G5). The entrances that may carry an
 * LCP candidate or text (the hero's copy lift, the window's rise, a
 * section's reveal) move with transform alone: an element at opacity 0 is
 * not painted, so fading the H1 or the hero image would hold back the LCP,
 * and a crawler, a link preview, a print or a browser without scroll
 * timelines would meet an empty page. Opacity is for decoration only (a
 * floating chip, a stamp, a ring).
 */
const css = motionCss() as Record<string, Record<string, unknown>>
const frames = (name: string) => JSON.stringify(css[`@keyframes ${name}`])

describe("entrances never hide", () => {
  it("lift, rise, pop and reveal move with transform alone", () => {
    for (const name of ["v3-lift", "v3-rise", "v3-pop", "v3-reveal"]) {
      expect(frames(name), name).not.toMatch(/opacity|visibility/)
      expect(frames(name), name).toMatch(/transform/)
    }
  })

  it("the classes that carry text use those keyframes", () => {
    expect(String(css[".in-lift"]?.animation)).toMatch(/^v3-lift /)
    expect(String(css[".in-rise"]?.animation)).toMatch(/^v3-rise /)
    const supports = css["@supports (animation-timeline: view())"] as Record<string, Record<string, string>>
    expect(supports[".reveal"]?.animation).toMatch(/^v3-reveal /)
  })

  it("everything moving stops for reduced motion", () => {
    const reduced = css["@media (prefers-reduced-motion: reduce)"] as Record<string, Record<string, string>>
    const stilled = Object.keys(reduced).join(",")
    for (const cls of [".in-lift", ".in-rise", ".in-chip", ".reveal", ".spin-40", ".spin-60", ".spin-90r", ".bob", ".fx-shake", ".fx-stamp"]) {
      expect(stilled, cls).toContain(cls)
    }
  })

  it("the hero's H1 and lead never take a fading class", () => {
    const page = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8")
    const h1 = page.match(/<h1 className="([^"]*)"/)?.[1] ?? ""
    expect(h1).toContain("in-lift")
    expect(h1).not.toMatch(/fx-fade|in-chip|fx-slide/)
  })

  it("the hero's product window has one entrance, a rise and a fade, stilled for reduced motion", () => {
    // The window is drawn in markup now (components/site/showcase), and the H1
    // is the page's LCP, so the window may fade in: 12px over 520ms, its glow
    // with it, once. Text a reader is reading never fades.
    const css = readFileSync(join(process.cwd(), "components/site/showcase/hero.css"), "utf8")
    expect(css).toMatch(/@keyframes sc-hero-rise \{\s*from \{\s*opacity: 0;\s*transform: translateY\(12px\);/)
    expect(css).toMatch(/\.sc-hero-rise \{\s*animation: sc-hero-rise 520ms/)
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toMatch(/\.sc-hero-rise,\s*\.sc-hero-glow \{\s*animation: none;/)
  })
})
