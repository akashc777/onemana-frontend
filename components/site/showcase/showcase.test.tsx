import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { APP, ELEVATION } from "@/lib/appSystem"
import { HeroScene } from "@/components/site/showcase/HeroScene"
import { Scene } from "@/components/site/showcase/Scene"
import { AUDIENCE_SCENES } from "@/components/site/showcase/audience"
import { firstTourScene } from "@/components/site/showcase/tour"
import { LATER_SCENES } from "@/components/site/showcase/tourLater"
import { TourScene } from "@/components/site/showcase/TourScene"
import { heroDesktop, heroPhone } from "@/components/site/showcase/scenes/hero"
import { agentsDesktop, agentsPhone } from "@/components/site/showcase/scenes/agents"
import { chatDesktop, chatPhone } from "@/components/site/showcase/scenes/chat"
import { docDesktop, docPhone } from "@/components/site/showcase/scenes/doc"
import { boardDesktop, boardPhone } from "@/components/site/showcase/scenes/board"
import { calendarDesktop, calendarPhone } from "@/components/site/showcase/scenes/calendar"
import { paletteDesktop, palettePhone } from "@/components/site/showcase/scenes/palette"
import type { SceneSpec } from "@/components/site/showcase/scenes/types"
import { HeroAgentTyping, HeroPhoneRow, HeroPhoneThread, HeroPointer, HeroRow, HeroSplit } from "@/components/site/showcase/scenes/heroLater"

/**
 * THE SHOWCASE'S GUARDS (owner direction of 11 Oct 2026: the site shows the
 * product drawn by its own components, animated, not screenshots).
 *
 *   - the home page draws no product <img>, and the old screenshots are gone;
 *   - a scene uses only the design's tokens: colours through the one table's
 *     custom properties, type in the app's roles;
 *   - motion is transform and opacity, and stands still for reduced motion;
 *   - the hero has at most one annotation;
 *   - every scene is one picture to a screen reader, with nothing in it to
 *     focus, complete before it plays, and its script names only what it
 *     draws.
 */
const ROOT = process.cwd()
const DIR = join(ROOT, "components/site/showcase")
const files = (ext: string) =>
  [DIR, join(DIR, "scenes"), join(DIR, "motion")].flatMap((d) => readdirSync(d).filter((f) => f.endsWith(ext) && !f.includes(".test.")).map((f) => join(d, f)))
/** A list split at its own commas, not at those inside var() or cubic-bezier(). */
function topLevel(list: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ""
  for (const ch of list) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      out.push(cur)
      cur = ""
    } else cur += ch
  }
  return [...out, cur]
}
const uncomment = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

const SPECS: [string, SceneSpec][] = [
  ["hero", heroDesktop],
  ["hero phone", heroPhone],
  ["agents", agentsDesktop],
  ["agents phone", agentsPhone],
  ["chat", chatDesktop],
  ["chat phone", chatPhone],
  ["docs", docDesktop],
  ["docs phone", docPhone],
  ["tasks", boardDesktop],
  ["tasks phone", boardPhone],
  ["calendar", calendarDesktop],
  ["calendar phone", calendarPhone],
  ["ask", paletteDesktop],
  ["ask phone", palettePhone],
  ...Object.entries(AUDIENCE_SCENES).map(([k, s]) => [`audience ${k}`, s] as [string, SceneSpec]),
]

const draw = (s: SceneSpec) =>
  renderToString(
    <Scene w={s.w} h={s.h} label={s.label} script={s.script}>
      {s.render()}
    </Scene>,
  )

describe("the home page shows the product drawn, not photographed", () => {
  it("renders no product image in the hero or the product tabs", async () => {
    expect(renderToString(<HeroScene />)).not.toMatch(/<img\b/)
    expect(renderToString(<>{firstTourScene()}</>)).not.toMatch(/<img\b/)
    for (const load of Object.values(LATER_SCENES)) {
      const { desktop, phone } = await load()
      expect(renderToString(<TourScene desktop={desktop} phone={phone} />)).not.toMatch(/<img\b/)
    }
  })

  it("imports no screenshot component and no product file", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8")
    expect(page).not.toMatch(/ProductShot|ProductWindow|next\/image|\/product\//)
    expect(page).toContain("<HeroScene")
    expect(existsSync(join(ROOT, "components/site/ProductShot.tsx"))).toBe(false)
    expect(existsSync(join(ROOT, "public/product")), "screenshots left behind drift from the app").toBe(false)
  })
})

describe("scenes use only the design's tokens", () => {
  // White and black at an alpha are light and shade (an edge's highlight, a
  // scrim), the same in every theme; every hue is a token.
  const LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*(?!var\()(?!255 255 255\b)(?!0 0 0\b)[\d.]/g

  it("writes no colour of its own, in any stylesheet or component", () => {
    const found: string[] = []
    for (const f of [...files(".css"), ...files(".tsx"), ...files(".ts")]) {
      let src = uncomment(readFileSync(f, "utf8"))
      // A mask is alpha only: its colour is not drawn.
      src = src.replace(/(?:-webkit-)?mask-image:[^;]+;/g, "")
      for (const m of src.matchAll(LITERAL)) found.push(`${f.slice(ROOT.length + 1)}: ${m[0]}`)
    }
    expect(found).toEqual([])
  })

  it("keeps the elevation's shadow ink, the one ink it names", () => {
    const css = readFileSync(join(DIR, "showcase.css"), "utf8")
    expect(css).toMatch(/--sc-shade: 16 18 26;/)
    expect(JSON.stringify(Object.values(ELEVATION.light))).toContain("16 18 26")
  })

  it("sets type in the app's roles (APP.roles), exactly", () => {
    const css = readFileSync(join(DIR, "showcase.css"), "utf8")
    for (const [role, [size, line, track, weight]] of Object.entries(APP.roles)) {
      const rule = css.match(new RegExp(`\\.sc \\.t-${role} \\{([^}]*)\\}`))?.[1] ?? ""
      expect(rule, `.t-${role}`).toContain(`font-size: ${size}px`)
      expect(rule, `.t-${role}`).toContain(`line-height: ${line}px`)
      expect(rule, `.t-${role}`).toContain(`letter-spacing: ${track}em`)
      if (weight !== 400) expect(rule, `.t-${role}`).toContain(`font-weight: ${weight}`)
    }
  })

  it("uses no size off the app's type scale in its stylesheets", () => {
    const sizes = new Set<number>([
      ...Object.values(APP.type).map(([s]) => s),
      ...Object.values(APP.roles).map(([s]) => s),
      // The app's own exceptions, each named where it is set: the search
      // pill's 13.5 (shell S4), a foot pill's 12.5 (shell T3), a rail
      // badge's 10 (shell S13), a project tile's 9 (shell S9), a phone
      // doc's title 26 (minimal-tiptap partials/doc.css .doc-title).
      13.5, 12.5, 10, 9, 26,
    ])
    const off: string[] = []
    for (const f of files(".css")) {
      for (const m of uncomment(readFileSync(f, "utf8")).matchAll(/font-size:\s*([\d.]+)px/g)) {
        if (!sizes.has(Number(m[1]))) off.push(`${f.slice(ROOT.length + 1)}: ${m[0]}`)
      }
    }
    expect(off).toEqual([])
  })
})

describe("motion is transform and opacity, and stands still for reduced motion", () => {
  const css = files(".css").map((f) => [f, uncomment(readFileSync(f, "utf8"))] as const)

  it("transitions and animates nothing but transform and opacity", () => {
    const bad: string[] = []
    for (const [f, src] of css) {
      for (const m of src.matchAll(/transition:\s*([^;]+);/g)) {
        if (m[1].trim() === "none") continue
        for (const part of topLevel(m[1])) {
          const prop = part.trim().split(/\s+/)[0]
          if (!["opacity", "transform"].includes(prop)) bad.push(`${f.slice(ROOT.length + 1)}: transition ${prop}`)
        }
      }
      for (const m of src.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)) {
        for (const p of m[2].matchAll(/([\w-]+)\s*:/g)) {
          if (!["opacity", "transform"].includes(p[1])) bad.push(`${f.slice(ROOT.length + 1)}: @keyframes ${m[1]} sets ${p[1]}`)
        }
      }
    }
    expect(bad).toEqual([])
  })

  it("stills every animation it declares for a reader who asked for less motion", () => {
    const missing: string[] = []
    for (const [f, src] of css) {
      const reduced = [...src.matchAll(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?\}\s*)\}/g)].map((m) => m[1]).join("\n")
      const rest = src.replace(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\}\s*\}/g, "")
      for (const m of rest.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!/(^|[;\s])animation:\s*(?!none)/.test(m[2])) continue
        const selector = m[1].trim().split("\n").pop()!.trim()
        if (!reduced.includes(selector)) missing.push(`${f.slice(ROOT.length + 1)}: ${selector}`)
      }
    }
    expect(missing).toEqual([])
  })

  it("plays scripts through data attributes and the track's one offset, from idle, never forever", () => {
    const src = readFileSync(join(DIR, "SceneDirector.tsx"), "utf8")
    const props = [...src.matchAll(/style\.setProperty\("([^"]+)"/g)].map((m) => m[1])
    expect(new Set(props)).toEqual(new Set(["--sc-k", "--sc-shift", "--sc-delay"]))
    expect(src).toContain("prefers-reduced-motion: reduce")
    expect(src).toMatch(/requestIdleCallback/)
    expect(src).toMatch(/IntersectionObserver/)
    expect(src).toMatch(/visibilitychange/)
    for (const [name, s] of SPECS) expect(s.script.plays ?? 1, name).toBeLessThanOrEqual(3)
  })

  it("moves things by transform and types by paint: the engine writes nothing else", () => {
    const src = uncomment(readFileSync(join(DIR, "motion/engine.ts"), "utf8"))
    const props = [...src.matchAll(/style\.setProperty\("([^"]+)"/g)].map((m) => m[1])
    expect(new Set(props)).toEqual(new Set(["--sc-rows", "--sc-rows-all"]))
    const styles = [...src.matchAll(/\.style\.(\w+)\s*=/g)].map((m) => m[1])
    expect(new Set(styles)).toEqual(new Set(["transform"]))
    // Typing hides by highlight (paint), never by moving letters between nodes.
    expect(src).toMatch(/CSS\.highlights|highlights/)
    expect(src).not.toMatch(/\.innerHTML|insertBefore|appendChild|\.remove\(\)/)
  })

  it("never runs forever, never times itself by an interval, never draws a random number", () => {
    for (const f of [...files(".ts"), ...files(".tsx")]) {
      const src = uncomment(readFileSync(f, "utf8"))
      expect(src, f).not.toMatch(/\.animate\(|setInterval|Math\.random/)
    }
    for (const f of files(".css")) {
      for (const m of uncomment(readFileSync(f, "utf8")).matchAll(/animation:\s*([^;]+);/g)) expect(m[1], f).not.toMatch(/\binfinite\b/)
    }
  })
})

describe("the hero", () => {
  const html = renderToString(<HeroScene />)

  it("has at most one annotation, outside the window and hidden from screen readers", () => {
    const notes = html.match(/data-sc-scope="/g) ?? []
    expect(notes.length).toBeLessThanOrEqual(1)
    expect(html).toMatch(/<div aria-hidden="true" class="sc sc-hero-note[^"]*" data-sc-scope="hero">/)
  })

  it("carries no chips, orbits or rings over its window", () => {
    expect(html).not.toMatch(/in-chip|orbit|camp-canvas|CanvasRings|drift/)
  })

  it("draws a desktop window and the phone's own, one glow behind them", () => {
    expect(html.match(/data-scene=""/g)).toHaveLength(2)
    expect(html.match(/class="sc-hero-glow"/g)).toHaveLength(1)
  })
})

describe("every scene", () => {
  // The hero's story parts the browser draws once the page is idle (Later).
  const later = renderToString(
    <>
      <HeroSplit />
      <HeroPointer />
      <HeroPhoneThread />
      <HeroRow />
      <HeroPhoneRow />
      <HeroAgentTyping />
    </>,
  )
  for (const [name, spec] of SPECS) {
    const page = draw(spec)
    const body = page.slice(page.indexOf(">") + 1)
    // What the scene draws in the end: the page's picture, and for the hero the parts drawn later.
    const html = name.startsWith("hero") ? page + later : page

    it(`${name}: is one picture with words, and nothing in it takes focus`, () => {
      expect(page).toMatch(/^<div role="img" aria-label="[^"]{40,}" data-scene=""/)
      expect(body).not.toMatch(/<(button|a|input|select|textarea)\b|tabindex=/)
    })

    it(`${name}: is whole before it plays (only what a script brings starts out of sight)`, () => {
      for (const m of body.matchAll(/<[^>]*data-sc-state="off"[^>]*>/g)) expect(m[0], name).toMatch(/data-sc-item="/)
      expect(body.replace(/<[^>]+>/g, " ").trim().length).toBeGreaterThan(200)
    })

    it(`${name}: its script names only what it draws`, () => {
      const drawn = new Set([...html.matchAll(/data-sc-item="([^"]+)"/g)].map((m) => m[1]))
      if (spec.script.scope === "hero") drawn.add("record")
      for (const s of spec.script.steps) for (const k of [...(s.on ?? []), ...(s.off ?? []), ...(s.rise ?? [])]) expect(drawn, `${name} step at ${s.at}: ${k}`).toContain(k)
      const typed = new Set([...html.matchAll(/data-sc-type="([^"]+)"/g)].map((m) => m[1]))
      for (const s of spec.script.steps) for (const k of s.type ?? []) expect(typed, `${name} types ${k}`).toContain(k)
      const moved = new Set([...html.matchAll(/data-sc-path="([^"]+)"/g)].map((m) => m[1]))
      const targets = new Set([...html.matchAll(/data-sc-target="([^"]+)"/g)].map((m) => m[1]))
      for (const [id, keys] of Object.entries(spec.script.paths ?? {})) {
        expect(moved, `${name} moves ${id}`).toContain(id)
        for (const k of keys) if (k.to) expect(targets, `${name} aims ${id} at ${k.to}`).toContain(k.to)
      }
    })

    it(`${name}: its steps are in time order, and its label stays one sentence or two`, () => {
      const at = spec.script.steps.map((s) => s.at)
      expect(at, name).toEqual([...at].sort((a, b) => a - b))
      expect(spec.label.length, name).toBeLessThan(400)
    })
  }
})
