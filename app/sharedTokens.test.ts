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

  // Design v3 (DESIGN_V3.md §3.2 to §3.5), the values onecamp-fe's
  // app/sharedTokens.test.ts pins on the app's side, under this site's names.
  it("is design v3's table", () => {
    const hex = (t: [number, number, number]) => "#" + t.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()
    const want = {
      light: { background: "#FFFFFF", foreground: "#16171B", card: "#FFFFFF", pop: "#FFFFFF", muted: "#F8F9FA", "muted-foreground": "#5B5D65", faint: "#8A8C92", "ink-4": "#B9BBC0", canvas: "#F3F4F6", brand: "#CC4A0B", "brand-ink": "#C2410C", "brand-soft": "#FCEFE6", agent: "#5B63D6", "agent-muted": "#EEEFFC", "agent-ink": "#3B3FA6" },
      dark: { background: "#0B0C0E", foreground: "#EEEEF0", card: "#1B1C1F", pop: "#1F2024", muted: "#0F1012", "muted-foreground": "#A8ABB1", faint: "#72747B", "ink-4": "#4A4C52", canvas: "#0B0C0E", brand: "#FF7A33", "brand-ink": "#FF8A4C", "brand-soft": "#2A1A10", "brand-foreground": "#0B0C0E", agent: "#9AA2F6", "agent-muted": "#1E2040", "agent-ink": "#C9CDFB" },
    } as const
    for (const mode of ["light", "dark"] as const) {
      for (const [name, value] of Object.entries(want[mode])) expect(hex(SHARED[mode][name]), `${mode} --${name}`).toBe(value)
    }
  })

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
