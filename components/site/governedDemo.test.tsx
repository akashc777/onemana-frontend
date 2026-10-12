import { readFileSync } from "node:fs"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { GovernedDemo, AUDIT_ROW, OPEN_STEP, STEPS } from "@/components/site/GovernedDemo"

/**
 * Node, no DOM, in this repo's idiom: the data and the one decision are
 * exported, so what must not drift is asserted directly, and the markup is
 * checked by rendering to a string the way the stat-strip bug was.
 */

describe("the governed walkthrough", () => {
    // A walkthrough showing a row shape the product does not write would be the
    // exact failure it exists to answer. The MCP layer writes ONE row per
    // decision (business/MCPServer/audit.go), carrying the tool, the named
    // agent, the human who authorised it and the reason.
    it("quotes the product's own audit row", () => {
        expect(AUDIT_ROW.action).toBe("mcp.tool_call.refused")
        expect(AUDIT_ROW.fields.map(([k]) => k)).toEqual([
            "tool",
            "agent",
            "authorised by",
            "reason",
        ])
        // One hash on its own demonstrates nothing; the link is the claim.
        expect(AUDIT_ROW.hashes).toMatch(/prev .+→ this .+/)
    })

    it("walks one path and ends on the refusal", () => {
        expect(STEPS).toHaveLength(4)
        expect(STEPS[STEPS.length - 1].call).toBe("refused")
        expect(STEPS[0].call).toBeUndefined()
    })

    // The hero plays this same #finance story, so this card is the evidence
    // at rest: it opens finished and never plays by itself, only on Replay.
    it("opens on the evidence and never plays by itself", () => {
        expect(OPEN_STEP).toBe(STEPS.length - 1)
        const src = readFileSync("components/site/GovernedDemo.tsx", "utf8")
        expect(src).not.toMatch(/IntersectionObserver|setInterval/)
        expect(src).toMatch(/setPlaying\(true\)/)
    })

    it("says what it is, and does not claim to be the live app", () => {
        const html = renderToString(<GovernedDemo />)
        expect(html).toContain("Interactive walkthrough")
        expect(html).toMatch(/same permission rules as production/i)
        expect(html).not.toMatch(/live app/i)
    })

    // The server render is what a crawler, a no-JS reader and a reader who
    // asked for less motion get: the refusal, its row and the record's line,
    // with nothing drawing itself in.
    it("renders the evidence, still, on the server", () => {
        const html = renderToString(<GovernedDemo />)
        expect(html).toContain("#finance")
        expect(html).toContain("Priya N.")
        expect(html).toContain("You are not a member of this channel.")
        expect(html).toContain(AUDIT_ROW.action)
        expect(html).toMatch(/<a[^>]*href="\/verify"[^>]*>.*Prove it<\/a>/)
        expect(html).toContain(">Replay<")
        expect(html).not.toMatch(/\bfx-(slide|shake|stamp|spring)\b/)
    })

    // WCAG 2.2 target size: each step was an 8 px button. The dot is still
    // 8 px; the button round it is 24 by 24 (h-6 w-6).
    it("gives every step a 24 px target", () => {
        const html = renderToString(<GovernedDemo />)
        const steps = html.match(/<button[^>]*aria-label="Step \d[^>]*>/g) ?? []
        expect(steps).toHaveLength(STEPS.length)
        for (const b of steps) {
            expect(b).toMatch(/class="[^"]*\bh-6\b/)
            expect(b).toMatch(/class="[^"]*\bw-6\b/)
        }
    })

    it("names every step for a screen reader", () => {
        const html = renderToString(<GovernedDemo />)
        for (const [i, s] of STEPS.entries()) {
            expect(html, `step ${i + 1} has no label`).toContain(`Step ${i + 1}: ${s.label}`)
        }
    })

    // The permission layer's own sentence, quoted rather than paraphrased.
    it("quotes the refusal rather than writing one", () => {
        expect(STEPS.some((s) => s.call === "refused")).toBe(true)
        const html = renderToString(<GovernedDemo />)
        expect(html).not.toContain("denied by policy")
    })
})
