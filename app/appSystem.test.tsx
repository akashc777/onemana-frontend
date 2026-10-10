import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"

import { buttonClasses } from "@/components/ui/Button"
import { OneCampLogo } from "@/components/site/BrandMarks"
import { APP } from "@/lib/appSystem"
import { appComponents, appTheme } from "@/lib/tailwindAppSystem"

/**
 * The site is built from the one table (lib/appSystem.ts), which mirrors the
 * app and names the app file each value comes from. These tests hold two
 * things: what the build makes from the table is the app's shape, and
 * nothing on the site writes those values around the table. A v3 change to
 * the design lands by editing the table; a failure here means something was
 * written past it.
 */
const ROOT = resolve(__dirname, "..")
const read = (rel: string) => readFileSync(resolve(ROOT, rel), "utf8")
const rem = (v: unknown) => Number(String(v).replace("rem", "")) * 16
const MD = "@media (min-width: 768px)"
const comps = appComponents()

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) sources(rel, out)
    else if (/\.tsx?$/.test(e.name) && !e.name.includes(".test.")) out.push(rel)
  }
  return out
}

describe("the theme is the table's", () => {
  it("radii", () => {
    for (const [name, want] of Object.entries(APP.radius)) {
      expect(rem(appTheme.borderRadius[name as keyof typeof appTheme.borderRadius]), `rounded-${name}`).toBe(want)
    }
  })

  it("shadows, and nothing in the page has one", () => {
    expect(appTheme.boxShadow.popover).toBe(APP.shadow.popover)
    expect(appTheme.boxShadow.dialog).toBe(APP.shadow.dialog)
    for (const flat of ["sm", "card", "product"] as const) expect(appTheme.boxShadow[flat]).toBe("none")
  })

  it("motion", () => {
    expect(appTheme.transitionDuration.DEFAULT).toBe(`${APP.motion.duration}ms`)
    expect(appTheme.transitionTimingFunction.DEFAULT).toBe(APP.motion.ease)
    expect(appTheme.transitionTimingFunction.spring).toBe(APP.motion.spring)
  })

  it("the app's text steps under the site's names", () => {
    const pairs = { caption: "xs", small: "sm", h3: "xl" } as const
    for (const [site, app] of Object.entries(pairs)) {
      const [size, { lineHeight }] = appTheme.fontSize[site as keyof typeof pairs]
      expect([rem(size), rem(lineHeight)], `text-${site} is the app's text-${app}`).toEqual(APP.type[app])
    }
  })

  it("tailwind.config.ts takes them from the table rather than writing its own", () => {
    const config = read("tailwind.config.ts")
    for (const key of ["borderRadius", "boxShadow", "transitionDuration", "transitionTimingFunction"]) {
      expect(config, key).toMatch(new RegExp(`${key}: appTheme\\.${key}`))
    }
    for (const key of ["small", "caption", "h3"]) expect(config).toContain(`${key}: appTheme.fontSize.${key}`)
    expect(config).toMatch(/plugins: \[[^\]]*appSystem\]/)
    // Display sizes: the app's tightening step above its largest title, its
    // own spacing at or under it.
    for (const m of config.matchAll(/"?([\w-]+)"?: \["([\d.]+)rem", \{ lineHeight: "[\d.]+rem", letterSpacing: ([^ }]+) \}\]/g)) {
      const want = rem(m[2]) > APP.heading.largestTitle ? "APP.heading.tightStep" : "APP.heading.tracking"
      expect(m[3], `text-${m[1]}`).toBe(want)
    }
  })
})

describe("the components are the app's shapes", () => {
  for (const [name, s] of Object.entries(APP.button.sizes)) {
    it(`ui-btn-${name}: ${s.height}px from md, ${s.phoneHeight}px on a phone, filled or outlined`, () => {
      const c = comps[`.ui-btn-${name}`] as Record<string, unknown>
      expect(rem((c[MD] as Record<string, unknown>).minHeight)).toBe(s.height)
      expect(rem(c.minHeight)).toBe(s.phoneHeight)
      const [py, pxv] = String(c.padding).split(" ").map(rem)
      expect(pxv).toBe(s.paddingX)
      expect([rem(c.fontSize), rem(c.lineHeight)]).toEqual(APP.type[s.text])
      // An outline's two border pixels still fit, so filled and outlined match.
      expect(2 * py + APP.type[s.text][1] + 2).toBeLessThanOrEqual(s.height)
    })
  }

  it("ui-btn: radius, weight, press, disabled fade and timing", () => {
    const c = comps[".ui-btn"] as Record<string, unknown>
    expect(rem(c.borderRadius)).toBe(APP.radius[APP.button.radius])
    expect(c.fontWeight).toBe(String(APP.button.weight))
    expect((c["&:disabled, &[aria-disabled='true']"] as Record<string, string>).opacity).toBe(String(APP.button.disabledOpacity))
    expect(c.transitionDuration).toBe(`${APP.motion.duration}ms`)
    const filled = comps[".ui-btn-filled:focus-visible"] as Record<string, string>
    expect(filled.outlineWidth).toBe(`${APP.button.filledFocus.width}px`)
    expect(filled.outlineOffset).toBe(`${APP.button.filledFocus.offset}px`)
  })

  it("ui-field: the app's Input", () => {
    const f = comps[".ui-field"] as Record<string, unknown>
    expect(rem(f.height)).toBe(APP.field.phoneHeight)
    expect(rem((f[MD] as Record<string, unknown>).height)).toBe(APP.field.height)
    expect(rem(f.fontSize)).toBe(APP.type[APP.field.phoneText][0])
    expect(rem((f[MD] as Record<string, unknown>).fontSize)).toBe(APP.type[APP.field.text][0])
    expect(rem(f.paddingLeft)).toBe(APP.field.paddingX)
    expect(rem(f.borderRadius)).toBe(APP.radius[APP.field.radius])
    expect(f.backgroundColor).toBe("transparent")
    expect((f["&:focus-visible"] as Record<string, string>).boxShadow).toContain(`/ ${APP.field.ringAlpha})`)
  })

  it("ui-chip: the app's Badge", () => {
    const c = comps[".ui-chip"] as Record<string, unknown>
    expect(rem(c.borderRadius)).toBe(APP.radius[APP.chip.radius])
    expect(String(c.padding).split(" ").map(rem)).toEqual([APP.chip.paddingY, APP.chip.paddingX])
    expect(rem(c.fontSize)).toBe(APP.type[APP.chip.text][0])
    expect(c.backgroundColor).toBe("rgb(var(--highlight))")
  })

  it("ui-card: the app's Card", () => {
    const c = comps[".ui-card"] as Record<string, unknown>
    expect(rem(c.borderRadius)).toBe(APP.radius[APP.card.radius])
    expect(c.border).toBe(`${APP.card.border}px solid rgb(var(--border))`)
  })
})

describe("nothing is written around the table", () => {
  it("every Button is ui-btn, in one of the table's sizes, with only colour in its variant", () => {
    for (const variant of ["brand", "primary", "ghost", "subtle"] as const) {
      for (const size of ["sm", "md", "lg"] as const) {
        const cls = buttonClasses(variant, size).split(/\s+/)
        expect(cls).toContain("ui-btn")
        expect(cls).toContain(`ui-btn-${size}`)
        expect(cls.filter((c) => /^(min-h-|h-|px-|py-|text-(xs|sm|small|caption|base)$|rounded|font-)/.test(c)), `${variant} ${size}`).toEqual([])
      }
    }
  })

  it("the accent button fills the way the app's default does", () => {
    const cls = buttonClasses("brand", "md")
    expect(cls).toContain("bg-brand-ink")
    expect(cls).toContain(`hover:bg-brand-ink/${APP.button.hoverAlpha * 100}`)
    expect(cls).toContain("ui-btn-filled")
  })

  it("a text field is ui-field, not a hand-drawn box", () => {
    const offenders: string[] = []
    for (const file of [...sources("app"), ...sources("components")]) {
      if (file.includes("admin")) continue
      for (const m of read(file).matchAll(/className=\{?[`"]([^`"]*)[`"]/g)) {
        if (/\brounded-md\b/.test(m[1]) && /\bborder-border-strong\b/.test(m[1]) && /\bpx-3(\.5)?\b/.test(m[1]) && /\b(h-\d+|text-base)\b/.test(m[1]) && !/\bui-field\b/.test(m[1])) offenders.push(`${file}: ${m[1].slice(0, 60)}`)
      }
      for (const m of read(file).matchAll(/const \w+ =\s*\n?\s*"([^"]*)"/g)) {
        if (/border-border-strong/.test(m[1]) && /\bpx-3/.test(m[1]) && /text-base/.test(m[1]) && !/\bui-field\b/.test(m[1])) offenders.push(`${file}: ${m[1].slice(0, 60)}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it("the focus ring is the app's: 2px at 70% of the accent, 1px off", () => {
    const css = read("app/globals.css")
    const at = css.indexOf("\n:focus-visible {")
    const rule = css.slice(at, css.indexOf("}", at))
    expect(rule).toContain(`outline: ${APP.button.focus.width}px solid rgb(var(--ring) / ${APP.button.focus.alpha})`)
    expect(rule).toContain(`outline-offset: ${APP.button.focus.offset}px`)
  })

  it("text is drawn as the app draws Inter", () => {
    expect(read("app/globals.css")).toContain(`font-feature-settings: ${APP.text.featureSettings};`)
  })

  it("headings are the app's weight at the font's own spacing", () => {
    const css = read("app/globals.css")
    const at = css.indexOf("\nh1, h2, h3 {")
    const rule = css.slice(at, css.indexOf("}", at))
    expect(rule).toContain(`font-weight: ${APP.heading.weight};`)
    expect(rule).toContain(`letter-spacing: ${APP.heading.tracking};`)
    expect(css.replace(/\/\*[\s\S]*?\*\//g, ""), "a heading weight under 600 overrides it").not.toMatch(/\nh1 \{\s*font-weight: [1-5]00/)
  })
})

describe("the logo is the app's mark", () => {
  it("a bare ring at the app's proportions, in its colour, with no tile", () => {
    const svg = renderToString(<OneCampLogo />)
    expect(svg).toContain(`viewBox="0 0 ${APP.logo.viewBox} ${APP.logo.viewBox}"`)
    expect(svg).toContain(`r="${APP.logo.r}"`)
    expect(svg).toContain(`stroke-width="${APP.logo.stroke}"`)
    expect(svg).toContain(`stroke="${APP.logo.colour}"`)
    expect(svg).not.toContain("<rect")
    expect(svg).not.toContain("Gradient")
  })

  it("the favicon is the same ring", () => {
    const icon = read("app/icon.svg")
    expect(icon).toContain(`r="${APP.logo.r}"`)
    expect(icon).toContain(`stroke-width="${APP.logo.stroke}"`)
    expect(icon.toLowerCase()).toContain(APP.logo.colour)
    expect(icon).not.toContain("<rect")
  })
})
