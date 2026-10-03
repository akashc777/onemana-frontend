import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

/**
 * The storefront and the workspace are one product to a visitor: the page they
 * read before paying must look like the app they get after. The workspace
 * (onecamp-fe) writes its palette in OKLCH; this site writes the same colours as
 * sRGB triples. Both repos pin this table: onecamp-fe's app/sharedTokens.test.ts
 * converts its OKLCH and checks it against the same numbers. Change a shared
 * colour in both places, or neither.
 */
export const SHARED: Record<"light" | "dark", Record<string, [number, number, number]>> = {
  light: {
    brand: [185, 74, 0],
    background: [254, 253, 252],
    foreground: [22, 19, 16],
    card: [255, 255, 254],
    muted: [246, 244, 241],
    "muted-foreground": [111, 105, 99],
    accent: [246, 243, 240],
    "accent-foreground": [29, 26, 22],
    border: [230, 227, 224],
    "agent": [81, 82, 193],
    "agent-foreground": [251, 251, 255],
    "agent-muted": [236, 239, 255],
  },
  dark: {
    brand: [242, 140, 92],
    background: [18, 15, 12],
    foreground: [248, 247, 244],
    card: [25, 22, 18],
    muted: [41, 38, 34],
    "muted-foreground": [168, 162, 155],
    accent: [44, 40, 36],
    "accent-foreground": [248, 247, 244],
    border: [42, 39, 35],
    "agent": [167, 176, 253],
    "agent-foreground": [18, 20, 40],
    "agent-muted": [38, 41, 68],
  },
}

function tokens(css: string, selector: string): Record<string, string> {
  const at = css.search(new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "m"))
  if (at < 0) return {}
  const body = css.slice(at, css.indexOf("}", at))
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
}

describe("shared tokens", () => {
  const css = readFileSync(resolve(__dirname, "globals.css"), "utf8")
  for (const [theme, selector] of [["light", ":root"], ["dark", ".dark"]] as const) {
    it(`${theme} matches the workspace`, () => {
      const got = tokens(css, selector)
      for (const [name, rgb] of Object.entries(SHARED[theme])) {
        expect(got[name], `--${name}`).toBe(rgb.join(" "))
      }
    })
  }
})
