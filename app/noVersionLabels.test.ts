import { readdirSync, readFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * No version numbers in the site's copy (owner rule, 11 Oct 2026): a buyer
 * reads what OneCamp does, not "v2.71" or "v1 and v2". The release pill
 * shows the release's headline, the facts strip the date of the latest
 * release, and the editions are named for what they are ("the edition with
 * AI teammates", "the one with no AI").
 *
 * Read from the source, comments stripped. Paths (/v1/mcp, Razorpay's
 * /v1/checkout.js), the admin pages and the files that hold editions or
 * tags as data are not copy.
 */
const ROOT = resolve(__dirname, "..")
const SKIP_DIRS = ["node_modules", ".next", "admin"]
const NOT_COPY = ["lib/releases.ts", "lib/workspaceAddress.ts", "components/admin/SettingsForm.tsx"]

function files(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`
    if (e.isDirectory()) {
      if (!SKIP_DIRS.includes(e.name)) files(rel, out)
    } else if (/\.(tsx?|md)$/.test(e.name) && !e.name.includes(".test.")) out.push(rel)
  }
  return out
}

const LABEL = /(?<![\w/.-])v[12](?:\.\d+)*(?![\w/-])/g

describe("version labels", () => {
  it("never appear in the site's copy", () => {
    const offenders: string[] = []
    for (const rel of [...files("app"), ...files("components"), ...files("lib"), ...files("content")]) {
      if (NOT_COPY.includes(rel)) continue
      const src = readFileSync(join(ROOT, rel), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:"'`])\/\/.*$/gm, "$1")
      for (const m of src.matchAll(LABEL)) offenders.push(`${rel}: ${src.slice(Math.max(0, m.index! - 30), m.index! + 12).replace(/\s+/g, " ")}`)
    }
    expect(offenders).toEqual([])
  })

  it("the release pill and the facts strip carry no version", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8")
    expect(page).not.toContain("release.version")
    const facts = readFileSync(join(ROOT, "components/site/FactsStrip.tsx"), "utf8")
    expect(facts).not.toContain("release.version")
  })

  // RELEASES.md: the pill names the newest feature release by its headline
  // and opens its entry on /changelog, in the site's own design. It went to
  // the raw GitHub release page, which left the site for a developer's view.
  // The changelog shows a release's tags only in its foot line, for an admin
  // matching the admin panel's update check (components/changelog/changelog.test.tsx).
  it("the release pill opens the changelog on this site, never GitHub", () => {
    const page = readFileSync(join(ROOT, "app/page.tsx"), "utf8")
    const pill = /function ReleasePill[\s\S]*?\n}\n/.exec(page)?.[0] ?? ""
    expect(pill).toContain("href={release.pill.href}")
    expect(pill).not.toMatch(/github|target="_blank"|html_url|\.url\b/i)
  })
})
