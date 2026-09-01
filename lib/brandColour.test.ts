import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * The retired brand colours must not come back.
 *
 * The site's palette was described in its own stylesheet as "Cloudflare
 * inspired" and it was: #F38020 is Cloudflare's orange, and #FF4D00 was the
 * derived accent. Moving to OneCamp's own colour meant changing the tokens, and
 * that alone changed almost nothing a visitor could see, because 41 hardcoded
 * hexes across eight files bypassed the tokens entirely. Canvas visuals, the
 * WebGL hero, the visitor map, and worst of all the OpenGraph card generators,
 * which are the brand surface that ends up in other people's timelines.
 *
 * A hex in a .tsx file cannot be re-themed, cannot respond to dark mode, and
 * cannot be found by looking at the palette. This is the thing that notices.
 */

const ROOT = resolve(__dirname, "..")
const RETIRED = /#(FF4D00|F38020|FF6B2E|E04400)/gi

function sourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", ".git", "dist"].includes(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) sourceFiles(full, acc)
    else if (/\.(ts|tsx|css|svg|json)$/.test(entry.name) && statSync(full).size < 2_000_000) acc.push(full)
  }
  return acc
}

describe("brand colour", () => {
  it("carries no retired hex anywhere in the source", () => {
    const offenders: string[] = []
    for (const dir of ["app", "components", "lib", "public", "content"]) {
      let files: string[] = []
      try {
        files = sourceFiles(join(ROOT, dir))
      } catch {
        continue // the directory is optional
      }
      for (const f of files) {
        const body = readFileSync(f, "utf8")
        // The test names the hexes it forbids, so skip itself.
        if (f.endsWith("brandColour.test.ts")) continue
        const hits = body.match(RETIRED)
        if (hits) offenders.push(`${f.replace(ROOT + "/", "")} (${hits.length})`)
      }
    }
    expect(
      offenders,
      `retired brand hexes are back, and a hardcoded hex cannot be re-themed:\n  ${offenders.join("\n  ")}`,
    ).toEqual([])
  })
})
