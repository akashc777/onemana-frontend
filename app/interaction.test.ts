import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import postcss, { type Root } from "postcss"
import tailwindcss from "tailwindcss"
import ts from "typescript"
import { describe, expect, it } from "vitest"

import config from "../tailwind.config"
import { TINT_SELECTOR } from "../lib/tailwindAppSystem"

/**
 * THE INTERACTION LAYER'S GUARD (INTERACTION_SPEC.md §9.4, for the site).
 *
 * The spec gives the site and the app one state language: hover only where a
 * pointer hovers, a press that answers a finger, a focus ring that is never
 * removed without a replacement. These rules read what the site really
 * ships: the CSS Tailwind compiles from globals.css and the plugin, and every
 * public component's JSX, parsed with TypeScript rather than matched by eye.
 *
 * The admin pages are an internal tool the storefront audit left out, and are
 * left out here.
 */

const ROOT = resolve(__dirname, "..")

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(resolve(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) {
      if (e.name !== "admin" && e.name !== "node_modules") sources(rel, out)
    } else if (/\.tsx$/.test(e.name) && !e.name.includes(".test.")) out.push(rel)
  }
  return out
}

const FILES = [...sources("app"), ...sources("components")]

/** An element as JSX writes it: its tag, its class list (as source text) and its other attributes. */
interface JsxElement {
  file: string
  line: number
  tag: string
  className: string
  attrs: Map<string, string>
  spreads: string[]
}

function jsxElements(file: string): JsxElement[] {
  const src = readFileSync(resolve(ROOT, file), "utf8")
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const out: JsxElement[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attrs = new Map<string, string>()
      const spreads: string[] = []
      for (const p of node.attributes.properties) {
        if (ts.isJsxSpreadAttribute(p)) spreads.push(p.expression.getText(sf))
        else if (ts.isJsxAttribute(p)) {
          const init = p.initializer
          const value = !init ? "true" : ts.isStringLiteral(init) ? init.text : init.getText(sf)
          attrs.set(p.name.getText(sf), value)
        }
      }
      out.push({
        file,
        line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
        tag: node.tagName.getText(sf),
        className: attrs.get("className") ?? "",
        attrs,
        spreads,
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return out
}

const ELEMENTS = FILES.flatMap(jsxElements)
const where = (e: JsxElement) => `${e.file}:${e.line} <${e.tag}>`
/** The class names a class list's source text holds, whatever quotes or template it is written in. */
const tokens = (cls: string) => cls.split(/[\s"'`]+/).filter(Boolean)

let compiled: Promise<Root> | null = null
/** The site's CSS as Tailwind builds it for production: globals.css, the plugin and every utility used. */
function siteCss(): Promise<Root> {
  compiled ??= postcss([
    tailwindcss({ ...config, content: [resolve(ROOT, "app/**/*.{ts,tsx}"), resolve(ROOT, "components/**/*.{ts,tsx}")] }),
  ])
    .process(readFileSync(resolve(ROOT, "app/globals.css"), "utf8"), { from: resolve(ROOT, "app/globals.css") })
    .then((r) => r.root)
  return compiled
}

/** The media queries a rule sits in, innermost first. */
function mediaOf(node: postcss.Node): string[] {
  const out: string[] = []
  for (let p = node.parent; p; p = p.parent) if (p.type === "atrule" && (p as postcss.AtRule).name === "media") out.push((p as postcss.AtRule).params)
  return out
}

describe("the interaction layer's guard", () => {
  // Storefront audit G19: 998 of 1,346 phone controls kept their hover after
  // a tap, and on iOS that reads as a selection.
  it("every :hover the site ships sits in (hover: hover)", async () => {
    const root = await siteCss()
    const offenders: string[] = []
    let hovers = 0
    root.walkRules((rule) => {
      if (!rule.selector.includes(":hover")) return
      hovers++
      if (!mediaOf(rule).some((m) => /\(hover:\s*hover\)/.test(m))) offenders.push(rule.selector)
    })
    expect(hovers, "no :hover rules found: the compile read nothing").toBeGreaterThan(20)
    expect(offenders).toEqual([])
  }, 90_000)

  // Spec §7.1: nothing calls outline-none without drawing its replacement.
  // An element out of the Tab order (tabIndex={-1}, focused only by script)
  // may hide it.
  it("nothing removes the focus outline without drawing a ring of its own", () => {
    expect(ELEMENTS.length, "the JSX scan read nothing").toBeGreaterThan(1000)
    const offenders = ELEMENTS.filter((e) => {
      const t = tokens(e.className)
      if (!t.some((c) => /(^|:)outline-none$/.test(c))) return false
      if (e.attrs.get("tabIndex") === "{-1}") return false
      return !t.some((c) => /^(focus-visible|focus|group-focus-visible):(ring|outline-|shadow|border-)/.test(c))
    }).map(where)
    expect(offenders).toEqual([])
  })

  // Spec §9.4.1: one state system per element. A component on the layer
  // (data-interactive, or ix()) that also paints its own hover or selected
  // background fights the layer, and one of the two silently loses.
  it("an element on the layer paints no state background of its own", () => {
    const onLayer = ELEMENTS.filter((e) => e.attrs.has("data-interactive") || e.spreads.some((x) => /^ix\(/.test(x)))
    expect(onLayer.length, "nothing has adopted the layer").toBeGreaterThan(15)
    const offenders = onLayer
      .filter((e) => tokens(e.className).some((c) => /^(group-)?(hover|active|focus|aria-[^:]+|data-\[[^\]]+\]):(bg|shadow)-/.test(c)))
      .map(where)
    expect(offenders).toEqual([])
  })

  it("the CSS never takes a focus outline away without a box-shadow ring in its place", async () => {
    const root = await siteCss()
    const offenders: string[] = []
    root.walkRules((rule) => {
      if (!/:focus(-visible)?\b/.test(rule.selector)) return
      const removes = rule.nodes.some((d) => d.type === "decl" && /^outline(-style)?$/.test(d.prop) && /^(none|0|2px solid transparent)$/.test(d.value.trim()))
      const ring = rule.nodes.some((d) => d.type === "decl" && d.prop === "box-shadow" && d.value !== "none")
      // A list option's highlight is its focus (spec §2.4), drawn by the list.
      if (removes && !ring && !/data-interactive="item"/.test(rule.selector)) offenders.push(rule.selector)
    })
    expect(offenders).toEqual([])
  }, 90_000)
})


/** Every rule the compiled CSS carries for a selector, with the media it sits in and its place in the sheet. */
async function rulesFor(selector: string): Promise<{ decls: Record<string, string>; media: string[]; at: number }[]> {
  const root = await siteCss()
  const out: { decls: Record<string, string>; media: string[]; at: number }[] = []
  let at = 0
  root.walkRules((rule) => {
    at++
    if (rule.selector.replace(/\s+/g, " ") !== selector) return
    const decls: Record<string, string> = {}
    rule.walkDecls((d) => {
      decls[d.prop] = d.important ? `${d.value} !important` : d.value
    })
    out.push({ decls, media: mediaOf(rule), at })
  })
  return out
}
/** The one rule for a selector: outside any media query, or inside the one named. */
const one = async (selector: string, media?: string) => {
  const found = (await rulesFor(selector)).filter((r) => (media ? r.media.some((m) => m.includes(media)) : r.media.length === 0))
  expect(found, `no single rule for ${selector}${media ? ` in ${media}` : ""}`).toHaveLength(1)
  return found[0]!
}

// INTERACTION_SPEC.md §9.3 on the site: the state language every kind shares.
describe("the interaction layer, as the site ships it", () => {
  const ENABLED = ":not(:disabled, [aria-disabled='true'])"

  it("tints in the accent by default and in an object's hue when it has one", async () => {
    expect((await one("[data-interactive]")).decls).toMatchObject({ "--ix-tint": "rgb(var(--brand))", "--ix-a": "0%", "-webkit-tap-highlight-color": "transparent" })
    expect((await one('[data-interactive][data-hue="sky"]')).decls).toMatchObject({ "--ix-tint": "rgb(var(--camp-sky))", "--ix-mark": "rgb(var(--camp-sky-a2))" })
    expect((await one('[data-interactive][data-hue="agent"]')).decls["--ix-tint"]).toBe("rgb(var(--agent))")
  }, 90_000)

  // The tint is painted by one rule for every kind that tints. At zero
  // specificity (:where) it lost to the reset's button { background-color:
  // transparent }, and no tab, segment or icon button ever showed a tint.
  it("paints the tint over the reset of a button's background, and under any utility", async () => {
    const tint = await one(TINT_SELECTOR)
    expect(tint.decls["background-color"]).toBe("color-mix(in srgb, var(--ix-tint) var(--ix-a), var(--ix-ground, transparent))")
    expect(TINT_SELECTOR).toMatch(/^:is\(/)
    // The reset that it must outweigh is in the same sheet, before it.
    const root = await siteCss()
    let reset = -1
    let at = 0
    root.walkRules((r) => {
      at++
      if (reset < 0 && /(^|,\s*)button(,|$)/.test(r.selector) && r.nodes.some((d) => d.type === "decl" && d.prop === "background-color" && d.value === "transparent")) reset = at
    })
    expect(reset, "the reset's button rule").toBeGreaterThan(0)
    expect(tint.at).toBeGreaterThan(reset)
  }, 90_000)

  it("hovers only where a pointer hovers, presses everywhere, and a press wins over a hover", async () => {
    const hover = await one(`[data-interactive]:hover${ENABLED}`, "hover: hover")
    expect(hover.decls["--ix-a"]).toBe("var(--ix-hover-a)")
    const press = await one(`[data-interactive]:active${ENABLED}`)
    expect(press.media).toEqual([])
    expect(press.decls["--ix-a"]).toBe("var(--ix-press-a)")
    expect(press.at, "the press comes after the hover, or a held pointer shows the hover").toBeGreaterThan(hover.at)
  }, 90_000)

  // Storefront audit G20: 66 of 1,346 phone controls answered a press, and
  // the answer was a half-pixel drop.
  it("answers a finger as the app's F2 does", async () => {
    const coarse = async (sel: string) => (await rulesFor(sel)).find((r) => r.media.some((m) => m.includes("pointer: coarse")))?.decls
    expect(await coarse(`[data-interactive="chip"]:active${ENABLED}`)).toMatchObject({ scale: "var(--ix-press-scale-touch)" })
    expect(await coarse(`[data-interactive="icon"]:active${ENABLED}`)).toMatchObject({ scale: "var(--ix-press-scale-icon)" })
    expect(await coarse(`[data-interactive="card"]:active${ENABLED}`)).toMatchObject({ scale: "var(--ix-press-scale-card-touch)" })
    expect(await coarse('[data-interactive="item"]')).toMatchObject({ "min-height": "2.75rem" })
    expect(await coarse(`.ui-btn:active${ENABLED}`)).toMatchObject({ scale: "var(--ix-press-scale-touch)" })
    expect((await one(`.ui-btn:active${ENABLED}`)).decls).toMatchObject({ scale: "var(--ix-press-scale)" })
  }, 90_000)

  it("lifts a card on its own ::before, never by transitioning a shadow", async () => {
    expect((await one('[data-interactive="card"]::before')).decls).toMatchObject({ "box-shadow": "var(--e-lift)", opacity: "0", "pointer-events": "none" })
    expect((await one(`[data-interactive="card"]:hover${ENABLED}::before`, "hover: hover")).decls).toMatchObject({ opacity: "1" })
    expect((await one('[data-interactive="card"]')).decls["transition-property"]).toBe("translate, scale")
  }, 90_000)

  it("marks what is on with a cue that is not colour", async () => {
    const on = ':is([aria-selected="true"], [aria-checked="true"], [aria-pressed="true"])'
    expect((await one(`[data-interactive="tab"]:not([data-thumb])${on}`)).decls).toMatchObject({ "background-color": "rgb(var(--card))" })
    expect((await one('[data-interactive="nav"]:is([aria-current="page"], [aria-current="true"])')).decls).toMatchObject({ "box-shadow": "var(--e-sel)" })
    expect((await one(`[data-interactive="chip"]${on}`)).decls["box-shadow"]).toMatch(/^inset 0 0 0 1\.5px/)
    expect((await one("[data-label]::after")).decls).toMatchObject({ content: "attr(data-label)", "font-weight": "510", height: "0" })
    expect((await one('[data-interactive="nav"]:is([aria-current="page"], [aria-current="true"])')).decls).toMatchObject({ "font-weight": "510" })
    // A large row hovers at the quiet step (spec D10).
    expect((await one(`[data-interactive="row"][data-quiet]:hover${":not(:disabled, [aria-disabled='true'])"}`, "hover: hover")).decls).toMatchObject({ "--ix-a": "var(--ix-hover-quiet-a)" })
  }, 90_000)

  it("takes every transform away for reduced motion", async () => {
    const reduced = await one("[data-interactive], [data-interactive]::before, .ui-btn, .go-arrow", "prefers-reduced-motion: reduce")
    expect(reduced.decls).toMatchObject({ scale: "none !important", translate: "none !important", rotate: "none !important" })
  }, 90_000)
})
