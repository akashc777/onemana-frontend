import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { selfHostNeeds, steps } from "@/lib/content"

/**
 * What a buyer is told before they pay, or claim a free key, must match what
 * the installer actually does.
 *
 * Two ways this went wrong:
 * - The machine floor (8 GB) appeared only deep in the scaling docs, so the
 *   first anyone heard of it was an install that fell over.
 * - Since v2.34.0 the installer serves the web app itself, but the site kept
 *   warning about a "second deploy" that no longer exists: friction on the
 *   exact path to paying.
 *
 * Every place that sets the expectation is pinned to both facts.
 */
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8").toLowerCase()

describe("what a buyer is told before they pay", () => {
    it("names the machine floor in the install steps and the needs list", () => {
        expect(steps[0].body).toContain("8 GB")
        expect(selfHostNeeds.join(" ")).toMatch(/8 GB of RAM and 40 GB of disk/)
    })

    it("says the install serves the web app, and warns of no second deploy", () => {
        for (const [where, text] of [
            ["install step one", steps[0].body.toLowerCase()],
            ["the receipt", read("app/buy/success/page.tsx")],
            ["the free page", read("app/free/page.tsx")],
        ] as const) {
            expect(text, `${where} still describes a second deploy`).not.toContain("second deploy")
        }
        expect(steps[0].body.toLowerCase()).toContain("web app")
        expect(read("app/buy/success/page.tsx")).toContain("web app")
    })

    it("shows the free page's visitor what they need before the form", () => {
        expect(read("app/free/page.tsx")).toContain("selfhostneeds")
    })
})
