import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { APP, CAMP, INTERACTION, SHARED, hexToTriple } from "@/lib/appSystem"
import { colourTokens, interactionTokens, nightTokens } from "@/lib/tailwindAppSystem"

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

/**
 * The interaction layer is the app's too (INTERACTION_SPEC.md §2, approved as
 * canonical on 14 Oct 2026): the same --ix-* names and numbers, written once
 * in lib/appSystem.ts (INTERACTION) and pinned here literally, as the colours
 * are above. The app's interaction.css carries the same values; change both
 * or neither.
 */
describe("shared interaction tokens", () => {
  it("are the spec's §2, exactly", () => {
    expect(INTERACTION.ease).toBe("cubic-bezier(0.22, 1, 0.36, 1)")
    expect(INTERACTION.spring).toBe("cubic-bezier(0.3, 1.35, 0.5, 1)")
    expect(INTERACTION.ms).toEqual({ colour: 120, press: 90, lift: 160, settle: 200, pop: 180, panel: 240, tipDelay: 400 })
    expect(INTERACTION.alpha.light).toEqual({ hover: 6, hoverQuiet: 4, press: 10, sel: 12, selHover: 15, drop: 8, halo: 18 })
    expect(INTERACTION.alpha.dark).toEqual({ hover: 7, hoverQuiet: 5, press: 11, sel: 14, selHover: 17, drop: 10, halo: 22 })
    expect(INTERACTION.scale).toEqual({ press: 0.98, pressTouch: 0.96, icon: 0.92, card: 0.99, cardTouch: 0.985, lift: 1.02 })
    expect(INTERACTION.ring).toEqual({ width: 2, offset: 2, bar: 2 })
    expect(INTERACTION.disabledOpacity).toBe(0.5)
  })

  it(":root carries every token under the app's names; .dark only its tints", () => {
    const root = interactionTokens("light")
    expect(root).toMatchObject({
      "--ix-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
      "--ix-spring": "cubic-bezier(0.3, 1.35, 0.5, 1)",
      "--ix-colour": "120ms",
      "--ix-press": "90ms",
      "--ix-lift": "160ms",
      "--ix-settle": "200ms",
      "--ix-pop": "180ms",
      "--ix-panel": "240ms",
      "--ix-tip-delay": "400ms",
      "--ix-hover-a": "6%",
      "--ix-hover-quiet-a": "4%",
      "--ix-press-a": "10%",
      "--ix-sel-a": "12%",
      "--ix-sel-hover-a": "15%",
      "--ix-drop-a": "8%",
      "--ix-halo-a": "18%",
      "--ix-press-scale": "0.98",
      "--ix-press-scale-touch": "0.96",
      "--ix-press-scale-icon": "0.92",
      "--ix-press-scale-card": "0.99",
      "--ix-press-scale-card-touch": "0.985",
      "--ix-lift-scale": "1.02",
      "--ix-ring": "2px",
      "--ix-ring-offset": "2px",
      "--ix-bar": "2px",
      "--ix-disabled": "0.5",
    })
    expect(interactionTokens("dark")).toEqual({
      "--ix-hover-a": "7%",
      "--ix-hover-quiet-a": "5%",
      "--ix-press-a": "11%",
      "--ix-sel-a": "14%",
      "--ix-sel-hover-a": "17%",
      "--ix-drop-a": "10%",
      "--ix-halo-a": "22%",
    })
  })

  it("the night ground, dark in either theme, takes the dark tints", () => {
    for (const theme of ["light", "dark"] as const) expect(nightTokens(theme)).toMatchObject(interactionTokens("dark"))
  })

  it("the colour step and the curve are the layer's, never typed twice", () => {
    expect(APP.motion.duration).toBe(INTERACTION.ms.colour)
    expect(APP.motion.durations.hover).toBe(INTERACTION.ms.colour)
    expect(APP.motion.durations.press).toBe(INTERACTION.ms.press)
    expect(APP.motion.ease).toBe(INTERACTION.ease)
    expect(APP.motion.spring).toBe(INTERACTION.spring)
  })

  it("globals.css writes no --ix- token of its own", () => {
    const css = readFileSync(resolve(__dirname, "globals.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
    expect(css).not.toMatch(/--ix-[\w-]+\s*:/)
  })
})
