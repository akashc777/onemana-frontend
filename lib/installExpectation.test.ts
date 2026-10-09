import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { installerAsks, selfHostNeeds, steps } from "@/lib/content"

/**
 * What a buyer is told before they pay, or claim a free key, must match what
 * the installer actually does.
 *
 * Two ways this went wrong:
 * - The machine floor (now 4 GB) appeared only deep in the scaling docs, so the
 *   first anyone heard of it was an install that fell over.
 * - Since v2.34.0 the installer serves the web app itself, but the site kept
 *   warning about a "second deploy" that no longer exists: friction on the
 *   exact path to paying.
 *
 * Every place that sets the expectation is pinned to both facts.
 */
const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8").toLowerCase()
/** The purchase receipt: the page, and the key and install block it shows. */
const receipt = () => read("app/buy/success/page.tsx") + read("components/site/LicenseInstall.tsx")

describe("what a buyer is told before they pay", () => {
    it("names the machine floor in the install steps and the needs list", () => {
        expect(steps[0].body).toContain("4 GB")
        expect(selfHostNeeds.join(" ")).toMatch(/4 GB of RAM and 40 GB of disk/)
        expect(receipt()).toContain("4 gb of ram")
    })

    it("says the install serves the web app, and warns of no second deploy", () => {
        for (const [where, text] of [
            ["install step one", steps[0].body.toLowerCase()],
            ["the receipt", receipt()],
            ["the free page", read("app/free/page.tsx")],
        ] as const) {
            expect(text, `${where} still describes a second deploy`).not.toContain("second deploy")
        }
        expect(steps[0].body.toLowerCase()).toContain("web app")
        expect(receipt()).toContain("web app")
    })

    it("shows the free page's visitor what they need before the form", () => {
        expect(read("app/free/page.tsx")).toContain("selfhostneeds")
    })
})

/**
 * What the installer asks, said once and the same everywhere. The site said
 * it "asks one email" and needed no domain, and the receipt that the server had
 * to be "Docker-capable"; the installer asks for a domain first (Enter gives a
 * free address), then the edition, then the first admin's email, and installs
 * Docker itself.
 */
describe("what a buyer is told the installer asks", () => {
    it("is the same words in the steps, the receipt and the free page", () => {
        expect(steps[0].body).toContain(installerAsks)
        expect(read("components/site/LicenseInstall.tsx")).toContain("{installerasks}")
        expect(read("app/free/page.tsx")).toContain("{installerasks}")
    })

    it("names the questions in the order the installer asks them", () => {
        const at = (w: string) => installerAsks.indexOf(w)
        expect(at("a domain")).toBeGreaterThanOrEqual(0)
        expect(at("a domain")).toBeLessThan(at("the edition"))
        expect(at("the edition")).toBeLessThan(at("first admin's email"))
        expect(installerAsks).toContain("press Enter")
    })

    it("no longer says it asks only an email, or that Docker must be there first", () => {
        for (const [where, text] of [
            ["install step one", steps[0].body.toLowerCase()],
            ["the needs list", selfHostNeeds.join(" ").toLowerCase()],
            ["the receipt", receipt()],
            ["the free page", read("app/free/page.tsx")],
        ] as const) {
            expect(text, where).not.toMatch(/asks (for )?(one|your) email|docker-capable|with docker,/)
        }
        expect(selfHostNeeds.join(" ")).toContain("the installer adds Docker")
    })
})

// The installer installs with apt and refuses a server without it
// (onecamp_install.sh, require_apt), so the site names the systems it runs on
// rather than promising any Linux server.
describe("the systems the installer runs on", () => {
  it("are named as Ubuntu and Debian, never just Linux", () => {
    const server = selfHostNeeds.find((n) => /server with/i.test(n)) ?? "";
    expect(server).toMatch(/Ubuntu or Debian/);
    expect(server).not.toMatch(/\bLinux\b/);
  });
});
