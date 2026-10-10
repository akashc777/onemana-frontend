import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { buttonClasses } from "@/components/ui/Button"
import { APP } from "@/lib/appSystem"

/**
 * The site's building blocks are the app's (lib/appSystem.ts has the app's
 * numbers and the app file each comes from). A failure here is drift: the
 * site moved off the app, or the app moved and that copy was not updated.
 */
const ROOT = resolve(__dirname, "..")
const read = (rel: string) => readFileSync(resolve(ROOT, rel), "utf8")
const config = read("tailwind.config.ts")
const css = read("app/globals.css")

const REM = 16
const px = (v: string) => (v.endsWith("rem") ? Number(v.slice(0, -3)) * REM : Number(v.replace("px", "")))
const step = (n: string) => Number(n) * 4

/** A block of the Tailwind config, `name: { ... }`, as key: value strings. */
function block(name: string): Record<string, string> {
  const at = config.indexOf(`${name}: {`)
  expect(at, `${name} in tailwind.config.ts`).toBeGreaterThan(-1)
  const body = config.slice(at, config.indexOf("\n      },", at))
  return Object.fromEntries([...body.matchAll(/^\s+"?([\w-]+)"?:\s*(.+?),?$/gm)].map((m) => [m[1], m[2]]))
}

/** The px value a Tailwind class gives, from its classes at one breakpoint. */
function classValue(classes: string[], prefix: string, pattern: RegExp): string | undefined {
  const own = prefix ? classes.filter((c) => c.startsWith(prefix)).map((c) => c.slice(prefix.length)) : []
  return [...own, ...classes.filter((c) => !c.includes(":"))].find((c) => pattern.test(c))
}

const TEXT: Record<string, number> = { "text-caption": 13, "text-xs": 12, "text-sm": 14, "text-small": 14, "text-base": 16 }

describe("the app's radii", () => {
  it("are the site's four radii", () => {
    const radii = block("borderRadius")
    for (const [name, want] of Object.entries(APP.radius)) {
      expect(px(radii[name].replace(/"/g, "")), `rounded-${name}`).toBe(want)
    }
  })
})

describe("the app's shadows", () => {
  it("are the site's popover and dialog layers, and nothing in the page has one", () => {
    const shadows = block("boxShadow")
    expect(shadows.popover).toBe(`"${APP.shadow.popover}"`)
    expect(shadows.dialog).toBe(`"${APP.shadow.dialog}"`)
    for (const flat of ["sm", "card", "product"]) expect(shadows[flat], flat).toBe('"none"')
  })
})

describe("the app's buttons", () => {
  const SIZE = { sm: "sm", md: "default", lg: "lg" } as const
  for (const [site, app] of Object.entries(SIZE) as [keyof typeof SIZE, keyof typeof APP.button.sizes][]) {
    it(`${site} is the app's ${app} from md up`, () => {
      const want = APP.button.sizes[app]
      const classes = buttonClasses("brand", site).split(/\s+/)
      const minH = classValue(classes, "md:", /^min-h-[\d.]+$/)!
      expect(step(minH.slice("min-h-".length)), "height").toBe(want.height)
      const pxClass = classValue(classes, "md:", /^px-[\d.]+$/)!
      expect(step(pxClass.slice("px-".length)), "padding").toBe(want.paddingX)
      expect(TEXT[classValue(classes, "md:", /^text-(caption|xs|sm|small|base)$/)!], "text").toBe(want.text)
    })
  }

  it("share the app's radius, weight, press and disabled fade", () => {
    for (const variant of ["brand", "primary", "ghost", "subtle"] as const) {
      const cls = buttonClasses(variant, "md")
      expect(cls).toContain(APP.button.radius === 6 ? "rounded-md" : "?")
      expect(cls).toContain(APP.button.weight === 500 ? "font-medium" : "?")
      expect(cls).toContain(`disabled:opacity-${APP.button.disabledOpacity * 100}`)
      expect(cls).toContain("active:translate-y-px")
      expect(cls, "named properties, never transition-all").not.toMatch(/transition-all/)
    }
  })

  it("fill the accent the way the app's default does", () => {
    const cls = buttonClasses("brand", "md")
    expect(cls).toContain(`bg-${APP.button.primaryFill}`)
    expect(cls).toContain(`hover:bg-${APP.button.primaryFill}/${APP.button.hoverAlpha * 100}`)
    expect(cls).toContain(`focus-visible:outline-[${APP.button.filledFocus.width}px]`)
    expect(cls).toContain(`focus-visible:outline-offset-${APP.button.filledFocus.offset}`)
  })

  it("outline on the page's ground with the app's hover step", () => {
    const cls = buttonClasses("ghost", "md")
    expect(cls).toContain("border-border-strong")
    expect(cls).toContain("bg-background")
    expect(cls).toContain("hover:bg-highlight")
  })
})

describe("the app's focus ring", () => {
  it("is a 2px ring at 70% of the accent, 1px off the control", () => {
    const at = css.indexOf("\n:focus-visible {")
    expect(at).toBeGreaterThan(-1)
    const rule = css.slice(at, css.indexOf("}", at))
    expect(rule).toContain(`outline: ${APP.button.focus.width}px solid rgb(var(--ring) / ${APP.button.focus.alpha})`)
    expect(rule).toContain(`outline-offset: ${APP.button.focus.offset}px`)
  })
})

describe("the app's motion", () => {
  it("is 120 ms on the house curve by default", () => {
    expect(block("transitionDuration").DEFAULT).toBe(`"${APP.motion.duration}ms"`)
    expect(block("transitionTimingFunction").DEFAULT.replace(/\s/g, "")).toBe(`"${APP.motion.ease}"`.replace(/\s/g, ""))
    expect(block("transitionTimingFunction").spring.replace(/\s/g, "")).toBe(`"${APP.motion.spring}"`.replace(/\s/g, ""))
  })
})
