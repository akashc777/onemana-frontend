import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { Sentences } from "@/components/ui/Section"

vi.mock("next/navigation", () => ({ usePathname: () => "/a-missing-page" }))
import { MissingPath } from "@/components/site/MissingPath"

/**
 * The premium pass (13 Oct 2026), read from the source so a page cannot
 * drift back:
 *
 * 1. Words a person reads clear AA. The faint ink (3.4:1 on white) is for a
 *    placeholder, an icon or decoration, and for the hero's soft half, which
 *    is 68px type (large text needs 3:1).
 * 2. Nothing ends on a word alone: everything that wraps is pretty, short
 *    blocks (leads, notes, captions, terms) are balanced, and a heading of
 *    two sentences breaks between them.
 * 3. Type follows Inter's own tracking: a reading page's headings are drawn
 *    tighter than "normal", and no site text uses Tailwind's untracked
 *    text-sm, text-base or text-lg where the site's own steps carry it.
 * 4. The site never says "compliant" or "compliance", not even to disclaim
 *    it (owner rule). The legal pages are the owner's text and are not read.
 * 5. The phone menu fills the screen and holds the page still.
 * 6. The 404 writes the missing path in after hydration, so the first render
 *    matches the one built ahead of time.
 */
const ROOT = resolve(__dirname, "..")
const NOT_THE_SITE = ["app/admin/", "components/admin/", "app/playful-dev/"]

function files(dir: string, ext: RegExp, out: string[] = []): string[] {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) files(rel, ext, out)
    else if (ext.test(rel) && !rel.includes(".test.")) out.push(rel)
  }
  return out
}
const site = (dir: string) => files(dir, /\.tsx$/).filter((f) => !NOT_THE_SITE.some((p) => f.startsWith(p)))
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8")
const css = read("app/globals.css").replace(/\/\*[\s\S]*?\*\//g, "")

describe("words a person reads clear AA", () => {
  it("keeps the faint ink to a placeholder, an icon, a decoration and the hero's large soft half", () => {
    const uses: Record<string, number> = {}
    for (const f of [...site("app"), ...site("components")]) {
      const n = (read(f).match(/\btext-faint\b/g) ?? []).length
      if (n) uses[f] = n
    }
    expect(uses).toEqual({
      "app/page.tsx": 1, // the H1's soft half, 68px
      "app/docs/[slug]/page.tsx": 1, // the breadcrumb's aria-hidden separator
      "app/docs/page.tsx": 1, // a row's arrow icon
      "components/ui/Select.tsx": 1, // the placeholder
      "components/site/Footer.tsx": 1, // the phone accordion's plus icon
    })
  })
})

describe("nothing ends on a word alone", () => {
  it("makes everything that wraps pretty, and balances leads, notes, captions and terms", () => {
    const rule = (selector: RegExp) => new RegExp(`${selector.source}\\s*\\{[^}]*text-wrap:\\s*`)
    expect(css).toMatch(new RegExp(`${rule(/p, li, dd, dt, figcaption, blockquote, td, th, summary, label/).source}pretty`))
    expect(css).toMatch(new RegExp(`${rule(/p\.text-lead,\s*p\.text-caption,\s*figcaption,\s*dt/).source}balance`))
  })

  it("breaks a two-sentence heading between its sentences", () => {
    const two = renderToString(<h2><Sentences>{"Free for small teams. Pay once when you grow."}</Sentences></h2>)
    expect(two).toBe('<h2><span class="inline-block">Free for small teams.</span> <span class="inline-block">Pay once when you grow.</span></h2>')
    expect(renderToString(<h2><Sentences>{"Also in the box"}</Sentences></h2>)).toBe("<h2>Also in the box</h2>")
    expect(renderToString(<h2><Sentences><b>Bold</b></Sentences></h2>)).toBe("<h2><b>Bold</b></h2>")
  })
})

describe("type follows Inter's tracking", () => {
  it("draws a reading page's headings tighter than normal", () => {
    for (const h of ["h2", "h3", "h4"]) {
      const block = new RegExp(`\\.reading :where\\(${h}\\) \\{([^}]*)\\}`).exec(css)?.[1] ?? ""
      expect(block, `.reading ${h}`).toMatch(/letter-spacing:\s*-0\.0\d+em/)
    }
  })

  it("uses the site's own steps, never Tailwind's untracked text-sm, text-base or text-lg", () => {
    const untracked = [...site("app"), ...site("components")].filter((f) => /(?<![\w:-])text-(sm|base|lg)(?![\w-])/.test(read(f)))
    expect(untracked).toEqual([])
  })
})

describe("never compliant, never compliance", () => {
  it("says neither word in anything the site shows", () => {
    const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
    const shown: string[] = []
    for (const f of [...site("app"), ...site("components")]) {
      const src = strip(read(f))
      // JSX text, including a run that ends at an expression ({" "}) rather than a tag.
      for (const m of src.matchAll(/[>}]([^<>{}]+)[<{]/g)) shown.push(m[1]!)
      // Each string literal whole, read left to right, so a match never runs from one literal's end to the next one's start.
      for (const m of src.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/\s/.test(m[1]!)) shown.push(m[1]!)
    }
    for (const f of ["lib/audiences.ts", "lib/alternatives.ts", "lib/compare.ts", "lib/content.ts", "lib/site.ts", "lib/landingMetadata.ts"]) {
      // A sentence or a label, not a slug or a path ("compliance" is the audience's URL).
      for (const m of strip(read(f)).matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) if (/\s|^[A-Z]/.test(m[1]!)) shown.push(m[1]!)
    }
    expect(shown.filter((s) => /complian/i.test(s))).toEqual([])
  })
})

describe("the phone menu", () => {
  it("fills the screen under the header and holds the page still while open", () => {
    const src = read("components/site/NavParts.tsx")
    expect(src).toMatch(/h-\[calc\(100dvh-3\.5rem\)\]/)
    expect(src).toMatch(/root\.style\.overflow = "hidden"/)
    // A tablet turned past lg closes it, or the page would stay held with no menu.
    expect(src).toMatch(/matchMedia\("\(min-width: 1024px\)"\)/)
    expect(css).toMatch(/\.nav-bar:has\(#mobile-menu:not\(\[hidden\]\)\)/)
  })
})

describe("the 404", () => {
  it("draws the same first render as the page built ahead of time, and writes the path in after", () => {
    const html = renderToString(<MissingPath />)
    expect(html).not.toContain("/a-missing-page")
    expect(html).toContain("\u00a0")
  })
})
