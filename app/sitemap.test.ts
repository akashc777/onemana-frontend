import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

import { describe, expect, it } from "vitest"

/**
 * Every public page is in the sitemap.
 *
 * /free, the free install that the nav and every page's second button point
 * to, was missing from it while pages around it were listed. The routes are
 * read from app/ here, so the next page added cannot be missed the same way.
 * Pages made from data (posts, docs, /for, /alternatives, templates) are
 * listed by the sitemap from that data and are not checked here.
 */
const APP = join(process.cwd(), "app")
/** Signed-in or after-payment pages, kept out of search on purpose, and the
 *  design showcase, which is a 404 in every production build. */
const PRIVATE = new Set(["admin", "account", "buy/success", "playful-dev"])

function pages(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry)
        if (statSync(p).isDirectory()) pages(p, out)
        else if (entry === "page.tsx") out.push(p)
    }
    return out
}

describe("the sitemap", () => {
    it("lists every public page that is not generated from data", () => {
        const sitemap = readFileSync(join(APP, "sitemap.ts"), "utf8")
        const routes = pages(APP)
            .map((p) => relative(APP, p).split(sep).slice(0, -1).join("/"))
            .filter((route) => route !== "" && !route.includes("[") && !PRIVATE.has(route))
        expect(routes, "no pages found: the walk is broken").toContain("free")
        expect(routes.filter((route) => !sitemap.includes(`"/${route}"`))).toEqual([])
    })
})
