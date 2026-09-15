import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { steps } from "@/lib/content"

/**
 * A buyer must learn about the second deploy BEFORE they pay for the first.
 *
 * The workspace people open is a separate deployment, built from the
 * open-source frontend. The installer prints that command when it finishes,
 * which is a fine place to repeat it and the wrong place to learn it: the page
 * said "run one command", the site description says "one Docker deploy", and
 * somebody whose model was "one command" meets an unexpected step at the moment
 * they expected to be done.
 *
 * Both places that set the expectation are pinned, because either one alone
 * leaves a path where the buyer is surprised.
 */
const ROOT = process.cwd()

describe("what a buyer is told before they pay", () => {
    it("names the second deploy in the install steps", () => {
        const first = steps[0]
        expect(first.body.toLowerCase(), "step one still implies one command is all of it").toContain(
            "second deploy",
        )
        expect(first.body.toLowerCase()).toContain("frontend")
    })

    it("names it again on the page that hands over the install command", () => {
        const success = readFileSync(join(ROOT, "app/buy/success/page.tsx"), "utf8")
        expect(success.toLowerCase(), "the receipt hands over one command and stops there").toContain(
            "second deploy",
        )
    })

    // Not a promise that it is easy, just that it exists. If the install ever
    // does serve the app itself, this test is what will fail and say so.
    it("does not claim the installer finishes the job on its own", () => {
        const first = steps[0].body.toLowerCase()
        expect(first).not.toMatch(/that is (it|all)|nothing else to (do|deploy)/)
    })
})
