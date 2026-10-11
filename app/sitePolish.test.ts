import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * The site-wide polish rules (design/site-polish/AUDIT.md, 11 Oct 2026),
 * read from the source so a page cannot drift from them:
 *
 * 1. No raw hex colour outside the token files. Every colour comes from the
 *    one table (lib/appSystem.ts) through a token or a class; GovernedDemo
 *    had typed twenty of the night section's own values by hand.
 * 2. Every image has its width, height and alt: a size the browser can
 *    reserve before it loads (no layout shift) and a true description, or an
 *    empty alt for decoration. The launch film's poster had no size.
 * 3. A decoration never takes a click: anything absolutely placed and hidden
 *    from assistive tech is pointer-events-none, so a ring, a dot or a spark
 *    over a card can never sit between a finger and a link.
 * 4. One icon tile: a call site picks a Tile size and never sets its own
 *    width or radius. A 28px tile at r12 read as a pill on one page and a
 *    squircle on the next.
 */
const ROOT = resolve(__dirname, "..")

/** Not the public site: the admin console and the playful layer's dev page. */
const NOT_THE_SITE = ["app/admin/", "components/admin/", "app/playful-dev/"]

/**
 * The showcase wave (the home hero, the product sections and the live
 * replicas of the app, 11 Oct 2026) has landed, and its files follow these
 * rules like every other; components/site/showcase/showcase.test.tsx holds
 * the replicas to the table besides. Nothing may join this list.
 */
const SHOWCASE: string[] = []

function files(dir: string, ext: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) files(rel, ext, out)
    else if (ext.test(rel) && !rel.includes(".test.")) out.push(rel)
  }
  return out
}

const skipped = (rel: string, extra: string[] = []) => [...NOT_THE_SITE, ...SHOWCASE, ...extra].some((p) => rel === p || rel.startsWith(p))
const source = (rel: string) => readFileSync(join(ROOT, rel), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1")

/** Each JSX opening tag in a source file, read past braces and quotes so a `=>` or `[&>svg]` inside it does not end it. */
function openingTags(src: string): string[] {
  const out: string[] = []
  for (let i = src.indexOf("<"); i >= 0; i = src.indexOf("<", i + 1)) {
    if (!/[A-Za-z]/.test(src[i + 1] ?? "")) continue
    let depth = 0
    let quote = ""
    let j = i + 1
    for (; j < src.length; j++) {
      const ch = src[j]!
      if (quote) {
        if (ch === quote) quote = ""
        continue
      }
      if (ch === '"' || ch === "'" || ch === "`") quote = ch
      else if (ch === "{") depth++
      else if (ch === "}") depth--
      else if (ch === ">" && depth === 0) break
    }
    out.push(src.slice(i, j + 1))
  }
  return out
}

describe("colours come from the table", () => {
  /** The token files, and the one literal a payment provider's API takes. */
  const LITERALS = ["lib/appSystem.ts", "lib/tailwindAppSystem.ts", "lib/razorpayCheckout.ts"]
  // A colour where a colour is written: after a quote, a bracket, a paren, a
  // comma, a colon or a space. "#404" in a page's words, or "#1412" in a
  // record, is not one.
  const HEX = /(?<=["'`[(,:\s])#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?![\w-])/g

  it("no page, component or library writes a hex colour of its own", () => {
    const offenders: string[] = []
    for (const rel of [...files("app", /\.(tsx?|css)$/), ...files("components", /\.tsx?$/), ...files("lib", /\.tsx?$/)]) {
      if (skipped(rel, LITERALS)) continue
      for (const m of source(rel).matchAll(HEX)) offenders.push(`${rel}: ${m[0]}`)
    }
    expect(offenders).toEqual([])
  })

  it("the lists name files that exist", () => {
    for (const p of [...LITERALS, ...SHOWCASE.filter((s) => !s.endsWith("/"))]) expect(existsSync(join(ROOT, p)), p).toBe(true)
  })
})

describe("images", () => {
  it("each has a width, a height (or fills a sized box) and an alt", () => {
    const offenders: string[] = []
    for (const rel of [...files("app", /\.tsx$/), ...files("components", /\.tsx$/)]) {
      if (skipped(rel)) continue
      for (const tag of openingTags(source(rel))) {
        if (!/^<(img|Image)\b/.test(tag)) continue
        const sized = (/\bwidth=/.test(tag) && /\bheight=/.test(tag)) || /\bfill\b/.test(tag)
        if (!sized) offenders.push(`${rel}: no size: ${tag.slice(0, 80)}`)
        if (!/\balt=/.test(tag)) offenders.push(`${rel}: no alt: ${tag.slice(0, 80)}`)
      }
    }
    expect(offenders).toEqual([])
  })
})

describe("decorations", () => {
  it("never take a click: an absolutely placed, aria-hidden element is pointer-events-none", () => {
    const offenders: string[] = []
    for (const rel of [...files("app", /\.tsx$/), ...files("components", /\.tsx$/)]) {
      if (skipped(rel)) continue
      for (const tag of openingTags(source(rel))) {
        if (!/\baria-hidden\b/.test(tag)) continue
        const cls = /className=(?:"([^"]*)"|\{`([^`]*)`\})/.exec(tag)
        const classes = cls?.[1] ?? cls?.[2] ?? ""
        if (/(^|\s)(absolute|fixed)(\s|$)/.test(classes) && !/(^|\s)pointer-events-none(\s|$)/.test(classes)) offenders.push(`${rel}: ${tag.slice(0, 100)}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it("no ring is drawn behind a price or in the footer's corner", () => {
    for (const rel of ["components/site/PlanColumns.tsx", "app/buy/BuyCheckout.tsx"]) expect(source(rel), rel).not.toMatch(/<Rings\b/)
    expect(source("components/site/Footer.tsx")).not.toMatch(/FooterRing/)
  })
})

describe("one icon tile", () => {
  it("a call site picks a Tile size, never its own width or radius", () => {
    const offenders: string[] = []
    for (const rel of [...files("app", /\.tsx$/), ...files("components", /\.tsx$/)]) {
      if (skipped(rel)) continue
      for (const tag of openingTags(source(rel))) {
        if (!/^<Tile\b/.test(tag)) continue
        const cls = /className=(?:"([^"]*)"|\{`([^`]*)`\})/.exec(tag)?.slice(1).find(Boolean) ?? ""
        if (/(^|\s)(size-|w-|h-|rounded)/.test(cls)) offenders.push(`${rel}: ${tag.slice(0, 100)}`)
      }
    }
    expect(offenders).toEqual([])
  })
})
