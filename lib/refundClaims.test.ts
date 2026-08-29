import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { legalPages } from "./legalPages"

/**
 * Marketing copy may not promise a refund the refund policy does not give.
 *
 * WHY THIS EXISTS. It already went wrong. The landing page carried the line
 * "Instant license key · GST invoice · 30-day refund policy", with the last part
 * linking to /refund-policy, whose first sentence is "We do not provide refunds
 * for our product OneCamp". A promise on the page a buyer decides from,
 * contradicted by the page it links to, is the worst arrangement of those two
 * facts: it is the reason someone buys and the reason they are angry afterwards.
 *
 * THE POLICY IS THE SOURCE OF TRUTH, not a constant in this file. The test reads
 * the published refund policy and only enforces the ban when that policy actually
 * refuses refunds. If the business later offers a 30-day window, editing the
 * policy is what lifts this check, which is the correct order of operations:
 * the promise cannot precede the policy.
 */

/** Where customer-facing copy lives. Admin screens describe refunds we issue manually. */
const COPY_ROOTS = ["app", "components/site", "content"]

/** Directories of internal tooling, which legitimately talk about refunding an order. */
const NOT_MARKETING = ["components/admin", "app/admin"]

/**
 * Claims of a refund window or guarantee. Deliberately about the SHAPE of a
 * promise rather than one sentence, so a reworded version is caught too.
 */
const REFUND_PROMISE = [
    /\b\d+[- ]day\s+(?:money[- ]back|refund)/i,
    /\bmoney[- ]back\s+guarantee/i,
    /\brefund\s+guarantee/i,
    /\bfull\s+refund\b/i,
    /\brisk[- ]free\b/i,
]

/**
 * Remove comments before matching.
 *
 * Without this the check fires on its own history: the comment in app/page.tsx
 * explaining why the "30-day refund policy" line was removed quotes the line, and
 * a scanner that reads it flags the explanation as the offence. Anyone documenting
 * a similar removal would trip it again, and the obvious workaround (reword the
 * comment until the test is happy) makes the codebase worse to read.
 *
 * The line-comment pattern requires whitespace or a line start before the slashes
 * so that a URL keeps its "https://".
 */
function stripComments(src: string): string {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, " ") // block, which also covers JSX {/* ... */}
        .replace(/(^|\s)\/\/[^\n]*/g, "$1") // line, but not the // in a URL
}

function walk(dir: string, out: string[] = []): string[] {
    let entries: string[]
    try {
        entries = readdirSync(dir)
    } catch {
        return out
    }
    for (const entry of entries) {
        if (entry === "node_modules" || entry.startsWith(".")) continue
        const p = join(dir, entry)
        if (NOT_MARKETING.some((skip) => p.startsWith(skip))) continue
        if (statSync(p).isDirectory()) walk(p, out)
        else if (/\.(tsx?|md)$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p)
    }
    return out
}

/** True when the published policy refuses refunds outright. */
function policyRefusesRefunds(): boolean {
    const body = legalPages["refund-policy"]?.bodyHtml ?? ""
    return /\bdo not provide refunds\b|\bno refunds\b/i.test(body)
}

describe("refund claims in customer-facing copy", () => {
    it("promises no refund window while the policy refuses refunds", () => {
        if (!policyRefusesRefunds()) {
            // The policy changed. Update this test deliberately alongside it
            // rather than letting it pass silently on a stale assumption.
            expect(legalPages["refund-policy"]).toBeDefined()
            return
        }

        const offenders: string[] = []
        for (const root of COPY_ROOTS) {
            for (const file of walk(root)) {
                // Markdown has no code comments; the .replace calls are harmless there.
                const src = stripComments(readFileSync(file, "utf8"))
                for (const pattern of REFUND_PROMISE) {
                    const hit = src.match(pattern)
                    if (hit) offenders.push(`${file}: ${hit[0]}`)
                }
            }
        }

        expect(
            offenders,
            "customer-facing copy promises a refund the refund policy does not give. " +
                "Either remove the claim, or change the policy first and then update this test.",
        ).toEqual([])
    })

    it("still has a published refund policy to check against", () => {
        // Without this, deleting the policy would make the test above pass by
        // vacuum rather than by compliance.
        expect(legalPages["refund-policy"]?.bodyHtml ?? "").not.toBe("")
    })
})
