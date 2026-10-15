import { readdirSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import ts from "typescript"
import { describe, expect, it, vi } from "vitest"

import type { VisitStats } from "@/lib/adminApi"

// The admin draws data it does not control: paths, emails, JSON. On a phone,
// one long unbroken line in a card made the Visitors tab 624 px wide (15 Oct
// 2026). These hold the two rules that keep data from widening the page.

const ROOT = resolve(__dirname, "../..")
const FILES = [
  "app/admin/page.tsx",
  ...readdirSync(resolve(ROOT, "components/admin"))
    .filter((f) => f.endsWith(".tsx") && !f.includes(".test."))
    .map((f) => `components/admin/${f}`),
]

/** Every className in a file, as its source text, with where it is. */
function classNames(file: string): { where: string; text: string }[] {
  const src = readFileSync(resolve(ROOT, file), "utf8")
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const out: { where: string; text: string }[] = []
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(sf) === "className" && node.initializer) {
      const init = node.initializer
      out.push({
        where: `${file}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`,
        text: ts.isStringLiteral(init) ? init.text : init.getText(sf),
      })
    }
    ts.forEachChild(node, visit)
  }
  visit(sf)
  return out
}

const CLASSES = FILES.flatMap(classNames)
const tokens = (text: string) => text.split(/[\s"'`{}()]+|\$\{[^}]*\}/).filter(Boolean)

/** A grid whose column count changes at a breakpoint, but which never sets one below it. */
function baseless(text: string): boolean {
  const t = tokens(text)
  if (!t.includes("grid")) return false
  const responsive = t.some((x) => /^(?:[\w-]+:)+grid-cols-/.test(x))
  const base = t.some((x) => /^grid-cols-/.test(x))
  return responsive && !base
}

/** A column template with a bare fr track: its minimum is the content's, not zero. */
function bareFr(text: string): boolean {
  return tokens(text).some((x) => {
    const m = /grid-cols-\[([^\]]+)\]/.exec(x)
    return m ? /(^|_)\d*\.?\d+fr(_|$)/.test(m[1].replace(/minmax\(0,\d*\.?\d+fr\)/g, "")) : false
  })
}

describe("admin layout: data never widens the page", () => {
  it("reads the admin's class lists", () => {
    expect(CLASSES.length).toBeGreaterThan(200)
    expect(baseless("mt-6 grid gap-6 lg:grid-cols-2")).toBe(true)
    expect(baseless("mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2")).toBe(false)
    expect(bareFr("grid sm:grid-cols-[180px_1fr_auto]")).toBe(true)
    expect(bareFr("grid sm:grid-cols-[180px_minmax(0,1fr)_auto]")).toBe(false)
  })

  it("every grid that changes columns at a breakpoint sets its base column count", () => {
    // grid-cols-1 is repeat(1, minmax(0, 1fr)). Without it a phone gets one
    // implicit auto column, as wide as the longest line inside it.
    expect(CLASSES.filter((c) => baseless(c.text)).map((c) => `${c.where}: ${c.text}`)).toEqual([])
  })

  it("column templates size their fr tracks from zero", () => {
    expect(CLASSES.filter((c) => bareFr(c.text)).map((c) => `${c.where}: ${c.text}`)).toEqual([])
  })
})

const LONG_PATH = "/blog/a-post-whose-address-is-far-longer-than-any-phone-is-wide-and-has-no-spaces"

const STATS: VisitStats = {
  total_views: 31,
  unique_visitors: 31,
  daily: [{ date: "2026-10-15", views: 31, uniques: 31 }],
  top_paths: [
    { path: LONG_PATH, views: 5 },
    { path: "/", views: 3 },
  ],
  by_country: [{ code: "IN", views: 20, uniques: 18 }],
  by_device: [{ device: "mobile", views: 12, uniques: 12 }],
  demo_clicks: 6,
  demo_drop_off: [{ step: "looked around, made nothing", visitors: 6 }],
  checkout_funnel: [
    { step: "reached the buy page", visitors: 12 },
    { step: "opened the payment window", visitors: 0 },
  ],
  free_funnel: [{ step: "opened the free plan", visitors: 13 }],
}

/** The opening tag and class list of each element whose class list has `token`. */
function elementsWith(html: string, token: string): { tag: string; classes: string[] }[] {
  return [...html.matchAll(/<[a-z]+\b[^>]*\bclass="([^"]*)"[^>]*>/g)]
    .map((m) => ({ tag: m[0], classes: m[1].split(/\s+/) }))
    .filter((e) => e.classes.includes(token))
}

describe("the visitors report on a phone", () => {
  it("every grid in it has a base column", async () => {
    const { VisitorsReport } = await import("./VisitorsPanel")
    const html = renderToString(<VisitorsReport data={STATS} />)
    const grids = elementsWith(html, "grid")
    expect(grids.length).toBeGreaterThan(3)
    for (const g of grids) expect(g.classes.some((c) => c.startsWith("grid-cols-")), g.tag).toBe(true)
    // ...and the long path is cut short in its own card, whole on hover.
    expect(elementsWith(html, "truncate").some((e) => e.tag.includes(`title="${LONG_PATH}"`))).toBe(true)
  })

  it("a funnel step takes its own line on a phone, so the bar keeps its room", async () => {
    const { VisitorsReport } = await import("./VisitorsPanel")
    const html = renderToString(<VisitorsReport data={STATS} />)
    const step = /<span class="([^"]*)">reached the buy page<\/span>/.exec(html)
    expect(step, "the step label").not.toBeNull()
    expect(step![1].split(/\s+/)).toEqual(expect.arrayContaining(["col-span-2", "sm:col-span-1"]))
    // No fixed-width label: 14rem only from sm up.
    expect(step![1]).not.toMatch(/(^|\s)w-\d/)
    const row = html.slice(0, step!.index).match(/<div class="([^"]*)"[^>]*>$/)
    expect(row?.[1]).toContain("grid-cols-[minmax(0,1fr)_minmax(5rem,auto)]")
  })
})

vi.mock("@/hooks/useAsync", () => ({
  useAsync: () => ({ data: {}, error: null, status: "success", loading: false, reload: () => {} }),
}))

describe("settings on a phone", () => {
  it("a hint with a long JSON example wraps instead of widening the page", async () => {
    const { SettingsForm } = await import("./SettingsForm")
    const html = renderToString(<SettingsForm />)
    const hint = /<p class="([^"]*)">Optional JSON for multi-product support/.exec(html)
    expect(hint, "the product catalog hint").not.toBeNull()
    expect(hint![1].split(/\s+/)).toContain("break-words")
  })
})
