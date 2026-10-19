import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import vm from "node:vm"
import { afterEach, describe, expect, it, vi } from "vitest"

import { THEME_SCRIPT, applyTheme } from "@/components/providers/ThemeProvider"

/**
 * The theme is on <html> before the page paints, and nothing touches <html>
 * again until the theme really changes. next-themes put it on a second time
 * once React had loaded (the class off and on, a stylesheet added and taken
 * away), and each restyled every element: two long tasks after the first
 * paint on a throttled phone, the longest on home (12 Oct 2026).
 */

type Html = { classes: Set<string>; colorScheme: string; attrs: Record<string, string> }

function fakeHtml(classes: string[], colorScheme = ""): Html & { el: unknown } {
  const h = { classes: new Set(classes), colorScheme, attrs: {} as Record<string, string> }
  const el = {
    setAttribute: (k: string, v: string) => (h.attrs[k] = v),
    classList: {
      contains: (c: string) => h.classes.has(c),
      add: (c: string) => h.classes.add(c),
      remove: (...cs: string[]) => cs.forEach((c) => h.classes.delete(c)),
    },
    style: {
      get colorScheme() {
        return h.colorScheme
      },
      set colorScheme(v: string) {
        h.colorScheme = v
      },
    },
  }
  return Object.assign(h, { el })
}

describe("the theme script, before the page paints", () => {
  const run = (stored: string | null | Error, systemDark: boolean) => {
    const html = fakeHtml(["__variable_a"])
    vm.runInNewContext(THEME_SCRIPT, {
      document: { documentElement: html.el, querySelectorAll: () => [] },
      localStorage: {
        getItem: () => {
          if (stored instanceof Error) throw stored
          return stored
        },
      },
      matchMedia: (q: string) => ({ matches: q === "(prefers-color-scheme: dark)" && systemDark }),
    })
    return `${[...html.classes].join(" ")} / ${html.colorScheme} / ${html.attrs["data-theme-choice"]}`
  }

  it("puts the reader's choice on <html>, or the system's, and names the choice", () => {
    expect(run("dark", false)).toBe("__variable_a dark / dark / dark")
    expect(run("light", true)).toBe("__variable_a light / light / light")
    expect(run("system", true)).toBe("__variable_a dark / dark / system")
    expect(run(null, false)).toBe("__variable_a light / light / system")
    expect(run(null, true)).toBe("__variable_a dark / dark / system")
  })

  it("follows the system when the stored choice is unreadable or unknown", () => {
    expect(run(new Error("storage refused"), true)).toBe("__variable_a dark / dark / system")
    expect(run("solarized", true)).toBe("__variable_a dark / dark / system")
  })
})

describe("applyTheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const stub = (html: { el: unknown }) => {
    const added: string[] = []
    const removed: string[] = []
    vi.stubGlobal("document", {
      documentElement: html.el,
      head: { appendChild: (n: { text: string }) => added.push(n.text) },
      createElement: () => {
        const n = { text: "", appendChild: (t: { data: string }) => (n.text += t.data), remove: () => removed.push(n.text) }
        return n
      },
      createTextNode: (data: string) => ({ data }),
    })
    vi.stubGlobal("window", { setTimeout: (f: () => void) => setTimeout(f, 1) })
    return { added, removed }
  }

  it("leaves <html> alone when it already wears the theme, as it does on load", () => {
    const html = fakeHtml(["__variable_a", "dark"], "dark")
    const { added } = stub(html)
    applyTheme("dark")
    expect([...html.classes]).toEqual(["__variable_a", "dark"])
    expect(added).toEqual([])
  })

  it("changes the theme with transitions held off, and lets them go after", () => {
    vi.useFakeTimers()
    const html = fakeHtml(["__variable_a", "light"], "light")
    const { added, removed } = stub(html)
    applyTheme("dark")
    expect([...html.classes].sort()).toEqual(["__variable_a", "dark"])
    expect(html.colorScheme).toBe("dark")
    expect(added).toEqual(["*,*::before,*::after{transition:none!important}"])
    expect(removed).toEqual([])
    vi.runAllTimers()
    expect(removed).toEqual(added)
  })
})

describe("next-themes", () => {
  const ROOT = path.resolve(__dirname, "../..")
  const sources = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const p = path.join(dir, name)
      if (statSync(p).isDirectory()) return name === "node_modules" ? [] : sources(p)
      return /\.(ts|tsx|mjs)$/.test(name) ? [p] : []
    })

  it("is gone: one theme provider, which writes to <html> only on a change", () => {
    const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"))
    expect({ ...pkg.dependencies, ...pkg.devDependencies }).not.toHaveProperty("next-themes")
    const users = ["app", "components", "lib", "hooks"].flatMap((d) => sources(path.join(ROOT, d))).filter((f) => /from ["']next-themes["']/.test(readFileSync(f, "utf8")))
    expect(users.map((f) => path.relative(ROOT, f))).toEqual([])
  })
})
