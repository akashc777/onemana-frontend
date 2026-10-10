import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Inter Tight is the display face, drawn for 20 px and up, and globals.css
 * gives it to every h1 to h3 with a tight -0.02em. A heading set at a text
 * size (a template's task, an aside's title, a post's "Read next") took it
 * too, and at 14 px its words ran together: the template pages read
 * "Firstdraft", "Finaldelivery" and "Ataglance". Some call sites remembered
 * `font-sans tracking-normal` and some did not, so the size class decides it
 * now, in one rule.
 */
const css = readFileSync(join(__dirname, "globals.css"), "utf8")

describe("a heading set at a text size", () => {
  const rule = css.match(/:is\(h1, h2, h3, h4\):is\(([^)]*)\)\s*\{([^}]*)\}/)

  it("is caught by one rule for every text size on the scale", () => {
    expect(rule).not.toBeNull()
    const sizes = rule![1].split(",").map((s) => s.trim())
    for (const size of [".text-body", ".text-small", ".text-caption"]) expect(sizes).toContain(size)
  })

  it("takes the text face at normal tracking", () => {
    expect(rule![2]).toMatch(/font-family:\s*var\(--font-rupee\),\s*var\(--font-sans\)/)
    expect(rule![2]).toMatch(/letter-spacing:\s*normal/)
  })
})
