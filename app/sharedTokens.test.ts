import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { CAMP, SHARED, hexToTriple } from "@/lib/appSystem"
import { colourTokens } from "@/lib/tailwindAppSystem"

/**
 * The site's colours are the app's. They are written once, in the shared
 * table (lib/appSystem.ts, SHARED and CAMP), which onecamp-fe's own
 * app/sharedTokens.test.ts pins against the app's OKLCH; this site's :root
 * and .dark are built from that table (lib/tailwindAppSystem.ts). So the
 * guard here is that the build writes every entry, exactly, and that nothing
 * writes a colour token around it.
 */
describe("shared tokens", () => {
  for (const theme of ["light", "dark"] as const) {
    it(`${theme} writes the shared table`, () => {
      const got = colourTokens(theme)
      for (const [name, rgb] of Object.entries(SHARED[theme])) {
        expect(got[`--${name}`], `--${name}`).toBe(rgb.join(" "))
      }
      expect(got["--ring"], "the ring is the accent").toBe(SHARED[theme].brand.join(" "))
    })

    it(`${theme} camp palette is the workspace's, exactly`, () => {
      const got = colourTokens(theme)
      expect(Object.keys(CAMP[theme])).toHaveLength(18)
      for (const [name, hex] of Object.entries(CAMP[theme])) {
        expect(got[`--${name}`], `--${name} (${hex})`).toBe(hexToTriple(hex).join(" "))
      }
    })
  }

  it("light and dark carry the same names", () => {
    expect(Object.keys(SHARED.dark).sort()).toEqual(Object.keys(SHARED.light).sort())
  })

  it("globals.css writes no colour token of its own", () => {
    const css = readFileSync(resolve(__dirname, "globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
    const names = [...Object.keys(SHARED.light), ...Object.keys(CAMP.light), "ring"]
    for (const name of names) {
      expect(css, `--${name} is set in globals.css; it belongs in lib/appSystem.ts`).not.toMatch(new RegExp(`--${name}:`))
    }
  })
})
