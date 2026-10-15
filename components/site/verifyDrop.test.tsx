import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { VerifyRecord } from "@/components/site/VerifyRecord"
import { nextDropDepth } from "@/hooks/useFileDrop"

/**
 * /verify, the fourth of the audit's five least premium places (§7 row 4):
 * the drop zone flickered as a dragged file crossed its spot and its words,
 * gave no copy cursor (V1), and the report was the one block on the site
 * drawn with 1 px boxes and a bordered table (V3).
 */
describe("the drop zone", () => {
  it("counts a file in and out, so crossing its children never clears it", () => {
    let depth = 0
    depth = nextDropDepth(depth, "dragenter") // the zone
    depth = nextDropDepth(depth, "dragenter") // its spot
    depth = nextDropDepth(depth, "dragleave") // the zone, as the spot takes it
    expect(depth, "still over the zone").toBeGreaterThan(0)
    depth = nextDropDepth(depth, "dragleave") // out of the zone
    expect(depth).toBe(0)
    expect(nextDropDepth(nextDropDepth(0, "dragleave"), "dragleave")).toBe(0)
    expect(nextDropDepth(3, "drop")).toBe(0)
    expect(nextDropDepth(2, "dragend")).toBe(0)
  })

  it("says copy under a dragged file, and wears the layer's drop look in its hue", () => {
    const hook = readFileSync(resolve(__dirname, "../../hooks/useFileDrop.ts"), "utf8")
    expect(hook).toContain('e.dataTransfer.dropEffect = "copy"')
    expect(hook).toContain('"data-drop": dragging ? ("valid" as const) : undefined')
    const html = renderToString(<VerifyRecord />)
    const zone = /<label[^>]*>/.exec(html)?.[0] ?? ""
    expect(zone).not.toContain("data-drop")
    expect(zone).toContain("[--ix-tint:rgb(var(--hue))]")
  })
})

describe("the report", () => {
  it("is drawn with depth, not lines", () => {
    const src = readFileSync(resolve(__dirname, "VerifyRecord.tsx"), "utf8")
    const report = src.slice(src.indexOf("function Report("))
    expect(report).not.toMatch(/<table|rounded-lg border|border-success\/40|border-danger\/50/)
    expect(report).toMatch(/rounded-2xl border-l-\[3px\] bg-card p-5 shadow-e1/)
    expect(report).toMatch(/<ol aria-label="Each row, recomputed" className="[^"]*shadow-e1/)
    // The error is the site's alert: a raised line with a danger edge, said to a screen reader.
    expect(src).toContain('<p role="alert" className="mt-6 flex gap-2.5 rounded-xl border-l-[3px] border-danger bg-card')
  })
})
