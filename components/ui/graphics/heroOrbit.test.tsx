import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HeroOrbit } from "@/components/ui/graphics/HeroOrbit"

/**
 * The hero's frame: the product shot on a hued canvas, the ring and the orbit
 * turning slowly behind it, and real things named on it. The motion pauses off
 * screen and stops for reduced motion; the decoration is hidden from assistive
 * tech and the shot is not.
 */
const css = readFileSync(resolve(__dirname, "../../../app/globals.css"), "utf8")

describe("HeroOrbit", () => {
  const html = renderToString(
    <HeroOrbit
      things={[
        { label: "#engineering", kind: "channel" },
        { label: "Maya Chen", kind: "person" },
        { label: "Release Captain", kind: "agent" },
        { label: "#too-many", kind: "channel" },
      ]}
    >
      <figure data-shot="">The #engineering channel.</figure>
    </HeroOrbit>,
  )

  it("frames the shot on a hued canvas and keeps it readable", () => {
    expect(html).toContain('<figure data-shot="">The #engineering channel.</figure>')
    expect(html).toMatch(/class="hue-sky [^"]*bg-hue-tint/)
  })

  it("names up to three real things, a person by initials and an agent as one", () => {
    expect(html).toContain("#engineering")
    // An 18px face carries one initial (DESIGN_V3 §3.9: two from 24px), white on the avatar gradient.
    expect(html).toContain(">M<")
    expect(html).toContain("text-white")
    expect(html).toContain("Release Captain")
    expect(html).toContain(">Agent<")
    expect(html).not.toContain("#too-many")
  })

  it("turns the ring and orbit behind the shot, hidden from assistive tech", () => {
    expect(html).toMatch(/<div aria-hidden="true"[^>]*><svg[^>]*class="orbit-turn /)
  })

  it("turns slowly, pauses off screen, and stops for reduced motion", () => {
    expect(css).toMatch(/\.orbit-turn \{\s*animation: orbit-turn 160s linear infinite;/)
    expect(css).toMatch(/\[data-paused\] \.orbit-turn \{\s*animation-play-state: paused;/)
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toMatch(/\.orbit-turn \{\s*animation: none !important;/)
  })
})

describe("the one-pixel lift", () => {
  it("lifts a pixel on pointers that hover, and not at all for reduced motion", () => {
    expect(css).toMatch(/@media \(hover: hover\) \{\s*\.hover-lift:hover \{\s*translate: 0 -1px;/)
    const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"))
    expect(reduced).toMatch(/\.hover-lift:hover \{\s*translate: none !important;/)
  })
})
