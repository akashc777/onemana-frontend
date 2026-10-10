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

  it("draws a person as tint, ink initials and a hairline of the strong cut", () => {
    const html = renderToString(<IdentityMark variant="avatar" id="Maya Chen" label="Maya Chen" />)
    expect(html).toContain(">MC<")
    for (const cls of [`hue-${hueFor("Maya Chen")}`, "bg-hue-tint", "text-hue-ink", "ring-hue/40", "rounded-full"]) {
      expect(html).toContain(cls)
    }
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
  it("sits on the card radius at 32 and 40, and the control radius at 24", () => {
    expect(renderToString(<Tile hue="moss" />)).toContain("rounded-lg")
    expect(renderToString(<Tile hue="moss" size="sm" />)).toContain("rounded-md")
  })
})
