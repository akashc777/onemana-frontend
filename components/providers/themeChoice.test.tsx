import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { renderToString } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import vm from "node:vm"
import { THEME_SCRIPT, ThemeProvider, nextChoice, pinThemeColor } from "@/components/providers/ThemeProvider"
import { ThemeSegments, ThemeToggle } from "@/components/site/ThemeToggle"

/**
 * Light or dark follows the reader's system until they choose (owner, 19 Oct
 * 2026: "if user has not set preference take the system mode as default").
 * System is a choice wherever the theme is offered: the bar's switch on a
 * computer only flipped between Light and Dark, so a reader who pressed it
 * once could never follow their system again there.
 */

describe("the bar's switch", () => {
  it("goes from System to the other look, then to the system's look kept, then back to System", () => {
    // A dark system: System (dark) → Light → Dark → System.
    expect(nextChoice("system", "dark")).toBe("light")
    expect(nextChoice("light", "dark")).toBe("dark")
    expect(nextChoice("dark", "dark")).toBe("system")
    // A light system: System (light) → Dark → Light → System.
    expect(nextChoice("system", "light")).toBe("dark")
    expect(nextChoice("dark", "light")).toBe("light")
    expect(nextChoice("light", "light")).toBe("system")
  })

  it("shows System as one of its three states, each drawn before any script runs", () => {
    const html = renderToString(<ThemeToggle />)
    expect(html.match(/<svg/g)).toHaveLength(3)
    expect(html).toContain("Theme follows your device")
    expect(html).toContain("Theme is light")
    expect(html).toContain("Theme is dark")
    // CSS picks the state from the choice the theme script put on <html>.
    expect(html).toContain("[html[data-theme-choice=light]_&amp;]:")
    expect(html).toContain("[html[data-theme-choice=dark]_&amp;]:")
  })
})

describe("the first render in the browser", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("is the server's, whatever the reader saved, so hydration never keeps a wrong segment", () => {
    // React 18 keeps the server's attributes when the first client render
    // differs: the phone menu's segments said System for a reader who had
    // chosen Dark, because the provider read the choice in its first render.
    const server = renderToString(
      <ThemeProvider>
        <ThemeSegments />
      </ThemeProvider>,
    )
    vi.stubGlobal("window", {
      localStorage: { getItem: () => "dark", setItem: () => {}, removeItem: () => {} },
      matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    })
    vi.stubGlobal("localStorage", (globalThis as unknown as { window: { localStorage: unknown } }).window.localStorage)
    const client = renderToString(
      <ThemeProvider>
        <ThemeSegments />
      </ThemeProvider>,
    )
    expect(client).toBe(server)
  })
})

describe("nothing forces light or dark", () => {
  const ROOT = path.resolve(__dirname, "../..")
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = path.join(dir, name)
      if (statSync(p).isDirectory()) return name === "node_modules" ? [] : sources(p)
      return /\.(ts|tsx|mjs)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [p] : []
    })
  const files = ["app", "components", "lib", "hooks"]
    .flatMap((d) => sources(path.join(ROOT, d)))
    .map((f) => ({ path: path.relative(ROOT, f), text: readFileSync(f, "utf8") }))

  it("only the theme provider puts a theme on <html> or keeps a choice", () => {
    const writers = files
      .filter((f) => /classList\.(add|toggle|replace)\(\s*["'](dark|light)["']|localStorage\.setItem\(\s*["']theme["']/.test(f.text))
      .map((f) => f.path)
    expect(writers).toEqual([])
  })

  it("no markup wears a dark or light class of its own", () => {
    // The one dark section (home's Safe AI) is .night, scoped by its tokens.
    const forced = files.filter((f) => /className=\{?["'`](?:[^"'`]*\s)?(dark|light)(\s|["'`])/.test(f.text)).map((f) => f.path)
    expect(forced).toEqual([])
  })

  it("every place that offers the theme offers System", () => {
    const offers = files.filter((f) => /\bsetTheme\b/.test(f.text) && !/ThemeProvider\.tsx$/.test(f.path))
    expect(offers.map((f) => f.path)).toEqual(["components/site/ThemeToggle.tsx"])
    expect(offers[0].text).toMatch(/"system"/)
    expect(offers[0].text).toMatch(/nextChoice/)
  })
})

describe("the browser's bar", () => {
  afterEach(() => vi.unstubAllGlobals())

  // The layout's two theme-color metas, one per system scheme.
  const metas = () =>
    ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"].map((media) => {
      const a: Record<string, string> = { media }
      return { a, getAttribute: (k: string) => (k in a ? a[k] : null), setAttribute: (k: string, v: string) => void (a[k] = v) }
    })
  const doc = (ms: ReturnType<typeof metas>) => ({
    documentElement: { classList: { remove: () => {}, add: () => {} }, style: {}, setAttribute: () => {} },
    querySelectorAll: () => ms,
  })
  const media = (ms: ReturnType<typeof metas>) => ms.map((m) => m.a.media)

  it("wears the chosen theme's colour before the page paints, and the system's on System", () => {
    for (const [stored, want] of [
      ["light", ["all", "not all"]],
      ["dark", ["not all", "all"]],
      [null, ["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"]],
    ] as const) {
      const ms = metas()
      vm.runInNewContext(THEME_SCRIPT, { document: doc(ms), localStorage: { getItem: () => stored }, matchMedia: () => ({ matches: true }) })
      expect(media(ms)).toEqual(want)
    }
  })

  it("follows a change of choice, and System puts the queries back", () => {
    const ms = metas()
    vi.stubGlobal("document", doc(ms))
    pinThemeColor("dark")
    expect(media(ms)).toEqual(["not all", "all"])
    pinThemeColor("light")
    expect(media(ms)).toEqual(["all", "not all"])
    pinThemeColor("system")
    expect(media(ms)).toEqual(["(prefers-color-scheme: light)", "(prefers-color-scheme: dark)"])
  })
})
