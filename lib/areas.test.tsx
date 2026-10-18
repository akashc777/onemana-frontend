import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AREA, AREAS, areaHue, isArea } from "./areas"
import { CAMP_HUES } from "./campHue"
import { TABS } from "@/components/site/ProductTabs"
import { AlsoInTheBox, BOX_AREAS } from "@/components/site/AlsoInTheBox"
import { AreaLegend } from "@/components/site/Areas"
import { FLAG } from "@/components/site/Footer"

/**
 * COLOUR NAMES AN AREA (design v3.1, 18 Oct 2026). Each part of OneCamp keeps
 * one hue wherever it appears, so a hue is learned the second time it is seen.
 * These hold the table to that, and every place the site marks an area to the
 * table: the hero's key, the tour's tabs, the box's panels and the footer's
 * flag. The workspace keeps the same file (onecamp-fe lib/areas.ts).
 */
const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8")
const hueClass = (h: string) => (h === "agent" ? "[--hue:var(--agent)]" : `hue-${h}`)

describe("the areas' table", () => {
  it("names seven areas: the six camp hues one to an area, and the agents in the agent's indigo", () => {
    expect(AREAS).toEqual(["chat", "calls", "docs", "projects", "calendar", "tables", "agents"])
    const camp = AREAS.filter((a) => a !== "agents").map(areaHue)
    expect([...camp].sort()).toEqual([...CAMP_HUES].sort())
    expect(areaHue("agents")).toBe("agent")
  })

  it("pins each area's hue, so moving one is a decision in both repos", () => {
    expect(Object.fromEntries(AREAS.map((a) => [a, AREA[a].hue]))).toEqual({
      chat: "sky",
      calls: "berry",
      docs: "dusk",
      projects: "moss",
      calendar: "sun",
      tables: "lake",
      agents: "agent",
    })
  })

  it("names each area in sentence case, and says what belongs to it", () => {
    for (const a of AREAS) {
      expect(AREA[a].label).toMatch(/^[A-Z][a-z]+$/)
      expect(AREA[a].covers.length).toBeGreaterThan(10)
      expect(isArea(a)).toBe(true)
    }
    expect(isArea("security")).toBe(false)
  })

  it("is a file the app can copy: it imports nothing but campHue's type", () => {
    const imports = [...read("lib/areas.ts").matchAll(/^import .*$/gm)].map((m) => m[0])
    expect(imports).toEqual(['import type { CampHue } from "./campHue"'])
  })
})

describe("every mark of an area takes the area's hue", () => {
  it("the tour's tabs", () => {
    for (const t of TABS) expect(t.area, t.label).toBeTruthy()
    expect(TABS.map((t) => [t.label, AREA[t.area].hue])).toEqual([
      ["Docs", "dusk"],
      ["Projects", "moss"],
      ["Calendar", "sun"],
      ["Chat", "sky"],
      ["Agents", "agent"],
      ["Ask", "agent"],
    ])
    const src = read("components/site/ProductTabs.tsx")
    // A tab's hue is read from its area, never written beside it.
    expect(src).not.toMatch(/\bhue: "(sky|moss|sun|lake|dusk|berry|agent)"/)
  })

  it("the box's panels, one per area in the areas' order, each in its hue", () => {
    expect(BOX_AREAS.map((b) => b.area)).toEqual(AREAS.filter((a) => a !== "agents"))
    const html = renderToString(<AlsoInTheBox />)
    const panels = [...html.matchAll(/<li id="box-([a-z]+)" class="([^ "]+)/g)].map((m) => [m[1], m[2]])
    expect(panels).toEqual(BOX_AREAS.map((b) => [b.area, hueClass(AREA[b.area].hue)]))
  })

  it("the hero's key, all seven in order, each tile in its hue", () => {
    const html = renderToString(<AreaLegend />)
    const tiles = [...html.matchAll(/<span aria-hidden="true" class="([^ "]+)[^"]*\binline-flex shrink-0 items-center justify-center bg-hue-tint/g)].map((m) => m[1])
    expect(tiles).toEqual(AREAS.map((a) => hueClass(AREA[a].hue)))
  })

  it("the footer's flag", () => {
    expect([...FLAG]).toEqual(AREAS.filter((a) => a !== "agents").map(areaHue))
  })
})

describe("no list cycles through the palette where the site says what OneCamp is", () => {
  // A hue handed out by position (the chart's order, the camp list) names
  // nothing: twelve rows came out in twelve colours. Rivals in a comparison
  // are a categorical series and keep their own order (productHues.ts).
  const files = [
    "app/page.tsx",
    "components/site/AlsoInTheBox.tsx",
    "components/site/Areas.tsx",
    "components/site/AreaMoments.tsx",
    "components/site/FactsStrip.tsx",
    "components/site/RunSpec.tsx",
    "components/site/ProductTabs.tsx",
    "components/site/Footer.tsx",
  ]
  for (const f of files) {
    it(f, () => {
      const src = read(f)
      expect(src).not.toMatch(/CAMP_HUES\s*\[|%\s*CAMP_HUES\.length|SERIES_HUES|FACT_HUES/)
    })
  }
})

describe("area colours come from the tokens", () => {
  // Raw palette classes and colour literals step around the one table
  // (lib/appSystem.ts), and with it the contrast the guards measure.
  const rawPalette = /\b(?:bg|text|fill|stroke|ring|border|from|via|to|shadow|outline|decoration)-(?:red|blue|green|yellow|purple|pink|indigo|teal|cyan|orange|amber|lime|emerald|violet|fuchsia|rose|sky|slate|gray|zinc|neutral|stone)-\d{2,3}\b/
  for (const f of ["components/site/AlsoInTheBox.tsx", "components/site/Areas.tsx", "components/site/AreaMoments.tsx", "lib/areas.ts"]) {
    it(f, () => {
      const src = read(f).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
      expect(src).not.toMatch(rawPalette)
      expect(src).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(src).not.toMatch(/\brgba?\(\s*\d/)
    })
  }
})
