import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import postcss, { type Root } from "postcss"
import tailwindcss from "tailwindcss"
import ts from "typescript"
import { describe, expect, it } from "vitest"

import config from "../tailwind.config"

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

