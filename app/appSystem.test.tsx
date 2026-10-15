import { describe, expect, it } from "vitest"
import { readFileSync, readdirSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"

import { buttonClasses } from "@/components/ui/Button"
import { LogoRing } from "@/components/ui/v3"
import { ALPHA, APP, ELEVATION, tracking } from "@/lib/appSystem"
import { appComponents, appTheme, colourTokens } from "@/lib/tailwindAppSystem"

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

  // Design v3 reversed "nothing in the page has a shadow": every surface
  // sits on the app's ladder, per mode, and the old names fold onto it.
  it("the elevation ladder, per mode, and the old names folded onto it", () => {
    for (const mode of ["light", "dark"] as const) {
      const tokens = colourTokens(mode)
      for (const [step, value] of Object.entries(ELEVATION[mode])) expect(tokens[`--e-${step}`], `${mode} --e-${step}`).toBe(value)
    }
    expect(ELEVATION.light.e1).toBe("0 0 0 1px rgb(16 18 26 / 0.09), 0 1px 2px rgb(16 18 26 / 0.05)")
    expect(ELEVATION.dark.e1).toMatch(/^inset 0 1px 0 rgb\(255 255 255 \/ 0\.04\)/)
    const s = appTheme.boxShadow
    expect([s.e1, s.sel, s.e2, s.e3, s.e4, s.sheet]).toEqual(["var(--e-e1)", "var(--e-sel)", "var(--e-e2)", "var(--e-e3)", "var(--e-e4)", "var(--e-sheet)"])
    expect([s.card, s.popover, s.dialog, s.product]).toEqual(["var(--e-e1)", "var(--e-e3)", "var(--e-e4)", "var(--e-e4)"])
  })

  it("the alpha lines and overlays, with their alphas", () => {
    for (const mode of ["light", "dark"] as const) {
      const tokens = colourTokens(mode)
      for (const [name, [rgb, a]] of Object.entries(ALPHA[mode])) {
        expect(tokens[`--${name}`]).toBe(rgb.join(" "))
        expect(tokens[`--${name}-a`]).toBe(String(a))
        expect(tokens[`--${name}-c`]).toBe(`rgb(${rgb.join(" ")} / ${a})`)
      }
    }
    expect(ALPHA.light.line[1]).toBe(0.075)
    expect(ALPHA.dark.line[1]).toBe(0.065)
  })

  it("motion", () => {
    expect(appTheme.transitionDuration.DEFAULT).toBe(`${APP.motion.duration}ms`)
    expect(appTheme.transitionTimingFunction.DEFAULT).toBe(APP.motion.ease)
    expect(appTheme.transitionTimingFunction.spring).toBe(APP.motion.spring)
  })

  it("the app's text steps under the site's names, with Inter's tracking", () => {
    const pairs = { caption: "xs", small: "sm" } as const
    for (const [site, app] of Object.entries(pairs)) {
      const [size, { lineHeight, letterSpacing }] = appTheme.fontSize[site as keyof typeof pairs]
      expect([rem(size), rem(lineHeight)], `text-${site} is the app's text-${app}`).toEqual(APP.type[app])
      expect(letterSpacing).toBe(`${tracking(rem(size))}em`)
    }
    const [h3, { lineHeight, letterSpacing, fontWeight }] = appTheme.fontSize.h3
    expect([rem(h3), rem(lineHeight)]).toEqual(APP.marketing.h3.desktop)
    expect(letterSpacing).toBe("-0.019em")
    expect(fontWeight).toBe("590")
  })

  it("Inter's tracking formula, at the spec's table", () => {
    const table: Array<[number, number]> = [[11, 0.005], [12, 0], [13, -0.003], [14, -0.006], [15, -0.009], [16, -0.011], [20, -0.017], [24, -0.019], [32, -0.021], [44, -0.022]]
    for (const [px, em] of table) expect(Math.abs(tracking(px) - em), `${px}px`).toBeLessThanOrEqual(0.001)
  })

  it("tailwind.config.ts takes them from the table rather than writing its own", () => {
    const config = read("tailwind.config.ts")
    for (const key of ["borderRadius", "boxShadow", "transitionDuration", "transitionTimingFunction"]) {
      expect(config, key).toMatch(new RegExp(`${key}: appTheme\\.${key}`))
    }
    for (const key of ["small", "caption", "h3"]) expect(config).toContain(`${key}: appTheme.fontSize.${key}`)
    expect(config).toMatch(/plugins: \[[^\]]*appSystem\]/)
    // Display sizes: the hero's three steps take the spec's -0.024em, every
    // other size Inter's own tracking for it, from the table's formula.
    for (const m of config.matchAll(/"?([\w-]+)"?: \["([\d.]+)rem", \{ lineHeight: "[\d.]+rem", letterSpacing: `\$\{([^}]+)\}em` \}\]/g)) {
      const want = m[1].startsWith("display") ? "APP.marketing.hero.tracking" : `tracking(${rem(m[2])})`
      expect(m[3], `text-${m[1]}`).toBe(want)
    }
  })
})

describe("the components are the app's shapes", () => {
  for (const [name, s] of Object.entries(APP.button.sizes)) {
    it(`ui-btn-${name}: ${s.height}px from md, ${s.phoneHeight}px on a phone`, () => {
      const c = comps[`.ui-btn-${name}`] as Record<string, unknown>
      expect(rem((c[MD] as Record<string, unknown>).minHeight)).toBe(s.height)
      expect(rem(c.minHeight)).toBe(s.phoneHeight)
      const [py, pxv] = String(c.padding).split(" ").map(rem)
      expect(pxv).toBe(s.paddingX)
      expect([rem(c.fontSize), rem(c.lineHeight)]).toEqual(APP.type[s.text])
      expect(2 * py + APP.type[s.text][1]).toBeLessThanOrEqual(s.height)
    })
  }

  it("the spec's sizes: sm 28, md 32, lg 40, xl 46 at r10", () => {
    expect(Object.values(APP.button.sizes).map((s) => s.height)).toEqual([28, 32, 40, 46])
    expect(rem((comps[".ui-btn-xl"] as Record<string, unknown>).borderRadius)).toBe(10)
  })

  it("ui-btn: radius 8, weight 510, a half-pixel press in 90ms, disabled fade, the 2px ring 2px off", () => {
    const c = comps[".ui-btn"] as Record<string, unknown>
    expect(rem(c.borderRadius)).toBe(8)
    expect(c.fontWeight).toBe("510")
    expect(c["&:active"]).toEqual({ transform: "translateY(0.5px)", transitionDuration: "90ms" })
    expect((c["&:disabled, &[aria-disabled='true']"] as Record<string, string>).opacity).toBe(String(APP.button.disabledOpacity))
    // A colour change takes the interaction layer's 120 ms (INTERACTION_SPEC.md §2.1).
    expect(c.transitionDuration).toBe("120ms")
    expect(c["&:focus-visible"]).toEqual({ outline: "2px solid rgb(var(--ring))", outlineOffset: "2px" })
  })

  it("ui-btn-primary: the accent with its inner highlight, light and dark; ui-btn-secondary: raised at e1, e2 on hover", () => {
    const p = comps[".ui-btn-primary"] as Record<string, unknown>
    expect(p.backgroundColor).toBe("rgb(var(--brand))")
    expect(p.boxShadow).toBe(APP.button.primaryShadow.light)
    expect(String(p.boxShadow)).toMatch(/^inset 0 1px 0 rgb\(255 255 255 \/ 0\.2\)/)
    expect((comps[".dark .ui-btn-primary"] as Record<string, unknown>).boxShadow).toBe(APP.button.primaryShadow.dark)
    const sec = comps[".ui-btn-secondary"] as Record<string, unknown>
    expect(sec.boxShadow).toBe("var(--e-e1)")
    expect(sec["&:hover"]).toEqual({ boxShadow: "var(--e-e2)" })
  })

  // The storefront's forms are 40px from md and 44 on a phone (site.md S10).
  it("ui-field: the app's Input, raised at e1 with a halo on focus, 40px for the site's forms", () => {
    const f = comps[".ui-field"] as Record<string, unknown>
    expect(rem(f.height)).toBe(APP.field.phoneHeight)
    expect(rem((f[MD] as Record<string, unknown>).height)).toBe(40)
    expect(rem(f.fontSize)).toBe(APP.type[APP.field.phoneText][0])
    expect(rem((f[MD] as Record<string, unknown>).fontSize)).toBe(APP.type[APP.field.text][0])
    expect(rem(f.paddingLeft)).toBe(10)
    expect(rem(f.borderRadius)).toBe(8)
    expect(f.backgroundColor).toBe("rgb(var(--card))")
    expect(f.boxShadow).toBe("var(--e-e1)")
    expect((f["&:focus-visible"] as Record<string, string>).boxShadow).toBe("0 0 0 1px color-mix(in oklab, rgb(var(--brand)) 50%, transparent), 0 0 0 3px color-mix(in oklab, rgb(var(--brand)) 12%, transparent)")
  })

  it("ui-chip: the app's chip, 22px r6 12/510 on the hover overlay in a hairline", () => {
    const c = comps[".ui-chip"] as Record<string, unknown>
    expect(rem(c.height)).toBe(22)
    expect(rem(c.borderRadius)).toBe(6)
    expect(rem(c.fontSize)).toBe(12)
    expect(c.fontWeight).toBe("510")
    expect(c.backgroundColor).toBe("var(--hover-c)")
    expect(c.boxShadow).toBe("inset 0 0 0 1px var(--line-c)")
  })

  it("ui-card: r12 at e1, no border", () => {
    const c = comps[".ui-card"] as Record<string, unknown>
    expect(rem(c.borderRadius)).toBe(12)
    expect(c.boxShadow).toBe("var(--e-e1)")
    expect(c.border).toBeUndefined()
  })
})

describe("nothing is written around the table", () => {
  it("every Button is ui-btn, in one of the table's sizes, with only colour in its variant", () => {
    for (const variant of ["brand", "primary", "ghost", "subtle"] as const) {
      for (const size of ["sm", "md", "lg", "xl"] as const) {
        const cls = buttonClasses(variant, size).split(/\s+/)
        expect(cls).toContain("ui-btn")
        expect(cls).toContain(`ui-btn-${size}`)
        expect(cls.filter((c) => /^(min-h-|h-|px-|py-|text-(xs|sm|small|caption|base)$|rounded|font-)/.test(c)), `${variant} ${size}`).toEqual([])
      }
    }
  })

  it("the accent button is the app's primary, and the others its secondary and ghost", () => {
    expect(buttonClasses("brand", "md")).toContain("ui-btn-primary")
    expect(buttonClasses("primary", "md")).toContain("ui-btn-secondary")
    expect(buttonClasses("ghost", "md")).toContain("ui-btn-secondary")
    expect(buttonClasses("subtle", "md")).toMatch(/hover:bg-hover/)
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

  it("the focus ring is the app's: 2px of the accent, 2px off", () => {
    const css = read("app/globals.css")
    const at = css.indexOf("\n:focus-visible {")
    const rule = css.slice(at, css.indexOf("}", at))
    expect(rule).toContain(`outline: ${APP.button.focus.width}px solid rgb(var(--ring))`)
    expect(rule).toContain(`outline-offset: ${APP.button.focus.offset}px`)
  })

  it("text is drawn as the app draws Inter: features, optical sizes, word gap, no optimizeLegibility", () => {
    const css = read("app/globals.css")
    expect(css).toContain(`font-feature-settings: ${APP.text.featureSettings};`)
    expect(css).toContain(`word-spacing: ${APP.text.wordSpacing};`)
    expect(css).toContain("font-optical-sizing: auto;")
    expect(css.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/optimizeLegibility|"calt" 0/)
  })

  it("headings are Inter Display at 600", () => {
    const css = read("app/globals.css")
    const at = css.indexOf("\nh1, h2, h3 {")
    const rule = css.slice(at, css.indexOf("}", at))
    expect(rule).toContain(`font-weight: ${APP.heading.weight};`)
    expect(css).toMatch(new RegExp(`h1, h2, h3, \\.font-display \\{[^}]*"opsz" ${APP.heading.opsz}`))
    expect(css.replace(/\/\*[\s\S]*?\*\//g, ""), "a heading weight under 600 overrides it").not.toMatch(/\nh1 \{\s*font-weight: [1-5]00/)
  })
})

describe("the logo is the app's mark", () => {
  // Design v3 (site.md S1): on the page the mark is the ring in the campfire
  // gradient, the one LogoRing, everywhere it appears: the nav, the footer,
  // the comparison tables' OneCamp column, the 404 and the cards. A flat
  // second ring (BrandMarks' OneCampLogo) drew it in two ways on one page.
  it("on the page: a bare ring in the logo's gradient, with no tile", () => {
    const svg = renderToString(<LogoRing size={24} />)
    expect(svg).toContain(`stop-color="${APP.logoGradient[0]}"`)
    expect(svg).toContain(`stop-color="${APP.logoGradient[1]}"`)
    expect(svg.match(/<circle/g)).toHaveLength(1)
    expect(svg).not.toContain("<rect")
  })

  it("the favicon is the same ring", () => {
    const icon = read("app/icon.svg")
    expect(icon).toContain(`r="${APP.logo.r}"`)
    expect(icon).toContain(`stroke-width="${APP.logo.stroke}"`)
    expect(icon.toLowerCase()).toContain(APP.logo.colour)
    expect(icon).not.toContain("<rect")
  })
})

// Design v3 for the storefront (site.md S1, G4): the page is the sheet,
// edge to edge, and the nav is transparent at the top of it, 64px, taking
// the page under a blur only once the page has scrolled.
describe("the frame is the storefront's", () => {
  it("the nav: 56px on a phone and 64 from lg, a class toggle for the blur, never a border", () => {
    const nav = read("components/site/Nav.tsx")
    expect(nav).toContain("h-14 ")
    expect(nav).toContain("lg:h-16")
    const parts = read("components/site/NavParts.tsx")
    expect(parts).toMatch(/<header data-scrolled=\{scrolled \? "" : undefined\} className="nav-bar sticky top-0 z-50">/)
    expect(parts).toContain("window.scrollY > 40")
    const css = read("app/globals.css")
    expect(css).toMatch(/\.nav-bar\[data-scrolled\] \{[^}]*backdrop-filter: blur\(12px\)/)
    expect(css).not.toMatch(/\.nav-bar \{[^}]*backdrop-filter/)
  })

  it("the page is the sheet: white or #0B0C0E, edge to edge, no cream frame", () => {
    expect(read("app/layout.tsx")).toMatch(/<body className="[^"]*\bbg-background\b/)
    const css = read("app/globals.css")
    expect(css).not.toMatch(/\.site-sheet \{[^}]*shadow-sheet/)
    expect(css).not.toContain("rgb(var(--canvas))")
  })
})
