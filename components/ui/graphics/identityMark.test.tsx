import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { hueFor } from "@/lib/campHue"
import { IdentityMark } from "@/components/ui/graphics/IdentityMark"
import { Tile } from "@/components/ui/graphics/Tile"

/**
 * A thing's mark is its hue, in one of four shapes, and the hue comes from
 * the id (or a colour the owner picked): the same channel is the same colour
 * here as in the workspace, which carries the same hueFor.
 */
describe("IdentityMark", () => {
  it("draws a dot in the id's hue, decorative beside the name", () => {
    const html = renderToString(<IdentityMark id="#engineering" />)
    expect(html).toContain(`hue-${hueFor("#engineering")}`)
    expect(html).toContain("fill-hue")
    expect(html).toContain("<circle")
    expect(html).toContain('aria-hidden="true"')
  })

  it("draws a square for a project", () => {
    expect(renderToString(<IdentityMark id="Q4 launch" variant="square" />)).toContain("<rect")
  })

  it("lets a chosen colour win, and an explicit hue win over that", () => {
    expect(renderToString(<IdentityMark id="x" chosen="#EC4899" />)).toContain('data-hue="berry"')
    expect(renderToString(<IdentityMark id="x" chosen="#EC4899" hue="moss" />)).toContain('data-hue="moss"')
  })

  it("draws a person as design v3 does: white initials on the hue's avatar gradient, in the mark's rings", () => {
    const html = renderToString(<IdentityMark variant="avatar" id="Maya Chen" label="Maya Chen" />)
    const hue = hueFor("Maya Chen")
    expect(html).toContain(">MC<")
    expect(html).toContain(`linear-gradient(140deg, rgb(var(--camp-${hue}-a1)), rgb(var(--camp-${hue}-a2)))`)
    for (const cls of ["text-white", "shadow-mark", "rounded-full"]) expect(html).toContain(cls)
    // Never the wave-2 pastel: a tint behind ink initials read as an empty state.
    expect(html).not.toMatch(/bg-hue-tint|text-hue-ink/)
    // One initial below 24px.
    expect(renderToString(<IdentityMark variant="avatar" id="Maya Chen" label="Maya Chen" size={20} />)).toContain(">M<")
  })

  it("names itself only when asked to", () => {
    const html = renderToString(<IdentityMark variant="avatar" id="Sam Rivera" label="Sam Rivera" aria-label="Sam Rivera" />)
    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="Sam Rivera"')
    expect(html).not.toContain("aria-hidden")
  })

  it("puts an icon on a tint tile, or the name's first letter in ink", () => {
    const withIcon = renderToString(<IdentityMark variant="tile" hue="sky" icon={<svg data-glyph="" />} />)
    expect(withIcon).toContain("hue-sky")
    expect(withIcon).toContain("bg-hue-tint")
    expect(withIcon).toContain("data-glyph")
    const letter = renderToString(<IdentityMark variant="tile" hue="sky" label="Design" />)
    expect(letter).toContain("text-hue-ink")
    expect(letter).toContain(">D<")
  })
})

describe("Tile", () => {
  it("is one shape at the spec's four sizes: 28 r8, 32 r9, 36 r10, 44 r12, each with its own icon size", () => {
    const at = (size?: "sm" | "md" | "lg" | "xl") => renderToString(<Tile hue="moss" size={size} />)
    expect(at("sm")).toMatch(/size-7 rounded-md \[&amp;&gt;svg\]:size-4/)
    expect(at()).toMatch(/size-8 rounded-\[9px\] \[&amp;&gt;svg\]:size-\[18px\]/)
    expect(at("lg")).toMatch(/size-9 rounded-ctl \[&amp;&gt;svg\]:size-5/)
    expect(at("xl")).toMatch(/size-11 rounded-xl \[&amp;&gt;svg\]:size-6/)
  })

  it("takes the agent's indigo for an agent (agents are indigo, never dusk)", () => {
    const html = renderToString(<Tile hue="agent" />)
    expect(html).toContain("[--hue:var(--agent)]")
    expect(html).not.toContain("hue-dusk")
  })
})
