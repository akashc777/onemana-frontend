import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {} }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}))

import { BuyCheckout } from "@/app/buy/BuyCheckout"
import { AudienceView } from "@/components/site/AudienceView"
import { PlanColumns } from "@/components/site/PlanColumns"
import { PlanComparison } from "@/components/site/PlanComparison"
import { alternatives } from "@/lib/alternatives"
import { audiences } from "@/lib/audiences"
import { cloudCheckoutDescription, LICENCE_CHECKOUT_DESCRIPTION, MONEY_RULE } from "@/lib/paymentTerms"
import { CLOUD_SIZE, PLAN, planOptions } from "@/lib/plans"
import { defaultPricing } from "@/lib/pricing"

/**
 * One name per plan and one word per plan's button (9 Nov 2026). A buyer met
 * the licence as "Licence", "OneCamp licence", "Own it" and "Lifetime
 * self-host licence", Cloud as "Cloud", "OneCamp Cloud" and "Or we run it",
 * and their buttons as "Buy a licence", "Choose Cloud", "Start with Cloud",
 * "Get a free key" and "Get the install command", page by page. Each now
 * reads the glossary in lib/plans: Free · Licence · Cloud (Cloud Team, Cloud
 * Business), and Install free · Buy the licence · Start Cloud.
 */
const onSale = { ...defaultPricing, cloud_configured: true, cloud_yearly_configured: true, cloud_yearly_paise: 9_999_000, business_configured: true }

const text = (html: string) =>
  html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<span class="sr-only">[^<]*<\/span>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/ ([,.;:?!])/g, "$1")
    .trim()

/** Every button-styled link: [href, label]. */
const buttons = (html: string) =>
  [...html.matchAll(/<a[^>]*class="ui-btn[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[0].match(/href="([^"]*)"/)?.[1] ?? "", text(m[1]!)] as const)

/** The glossary's button for a link: by where it goes. */
function ctaFor(href: string): string | null {
  if (href === "/free") return PLAN.free.cta
  if (href === "/buy" || href === "/buy?plan=lifetime") return PLAN.licence.cta
  if (href.startsWith("/buy?plan=cloud")) return PLAN.cloud.cta
  return null
}

const surfaces: [string, string][] = [
  ["the home plan cards", renderToString(<PlanColumns pricing={onSale} />)],
  ["the /pricing plan cards", renderToString(<PlanColumns pricing={onSale} detailed headingLevel="h2" />)],
  ["the plan table", renderToString(<PlanComparison pricing={onSale} />)],
  ...[...alternatives, ...audiences].map((a): [string, string] => [`the ${a.slug} page`, renderToString(<AudienceView a={a} pricing={onSale} />)]),
]

describe("the plan glossary", () => {
  it("names three plans and one button each", () => {
    expect(Object.values(PLAN).map((p) => p.name)).toEqual(["Free", "Licence", "Cloud"])
    expect(Object.values(PLAN).map((p) => p.cta)).toEqual(["Install free", "Buy the licence", "Start Cloud"])
    expect(Object.values(CLOUD_SIZE)).toEqual(["Cloud Team", "Cloud Business"])
    expect(planOptions(onSale).map((o) => [o.name, o.cta.label])).toEqual(Object.values(PLAN).map((p) => [p.name, p.cta]))
  })

  it("every plan button on every page uses the glossary's words", () => {
    for (const [name, html] of surfaces) {
      const plan = buttons(html).filter(([href]) => ctaFor(href))
      expect(plan.length, name).toBeGreaterThan(0)
      // The glossary's words, alone or with what they cover after a comma ("Install free, up to 25 people").
      for (const [href, label] of plan) expect(label.split(", ")[0], `${name}: ${href}`).toBe(ctaFor(href))
    }
  })

  it("names each plan the glossary's way on the cards, the table, the rival pages and the checkout", () => {
    const cards = renderToString(<PlanColumns pricing={onSale} />)
    expect([...cards.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].map((m) => text(m[1]!))).toEqual(Object.values(PLAN).map((p) => p.name))
    const table = renderToString(<PlanComparison pricing={onSale} />)
    const head = table.slice(table.indexOf("<thead"), table.indexOf("</thead>"))
    expect([...head.matchAll(/<span data-hue="[a-z]+"[^>]*>([\s\S]*?)<\/span><span/g)].map((m) => text(m[1]!))).toEqual(Object.values(PLAN).map((p) => p.name))
    const rival = text(renderToString(<AudienceView a={alternatives[0]!} pricing={onSale} />))
    expect(rival).toContain(`${PLAN.licence.name} ≈`)
    expect(rival).toContain(`${PLAN.cloud.name} ≈`)
    const title = (plan: "lifetime" | "cloud", billing: "monthly" | "business") =>
      text(renderToString(<BuyCheckout initialPlan={plan} initialBilling={billing} initialPricing={onSale} initialCountry="US" />))
    expect(title("lifetime", "monthly")).toMatch(new RegExp(`Up to 25 people\\? OneCamp is free for you\\. ${PLAN.free.cta}, no card or email needed\\.`))
    expect(title("lifetime", "monthly")).toContain(`${PLAN.licence.name} ≈`)
    expect(title("cloud", "monthly")).toContain(`${CLOUD_SIZE.team} ≈`)
    expect(title("cloud", "business")).toContain(`${CLOUD_SIZE.business} ≈`)
  })

  it("names the plan the same way in the payment window", () => {
    expect(LICENCE_CHECKOUT_DESCRIPTION).toBe("OneCamp licence, one-time, for your own server")
    expect(cloudCheckoutDescription(undefined)).toBe(`${CLOUD_SIZE.team}, monthly (includes a self-host licence)`)
    expect(cloudCheckoutDescription("onecamp_cloud_team_yearly")).toBe(`${CLOUD_SIZE.team}, yearly (includes a self-host licence)`)
    expect(cloudCheckoutDescription("onecamp_cloud_business")).toBe(`${CLOUD_SIZE.business}, monthly (includes a self-host licence)`)
    const checkout = readFileSync(join(process.cwd(), "hooks/useCheckout.ts"), "utf8")
    expect(checkout).toContain("description: LICENCE_CHECKOUT_DESCRIPTION")
  })
})

// The money rule (lib/paymentTerms MONEY_RULE): one sentence, offer first,
// wherever a price is, with the demo and the free plan as links.
describe("the money rule on the page", () => {
  it("reads the same sentence under the cards, on the checkout and on every rival and audience page", () => {
    const pages: [string, string][] = [
      ["the plan cards", renderToString(<PlanColumns pricing={onSale} />)],
      ["the checkout", renderToString(<BuyCheckout initialPlan="lifetime" initialBilling="monthly" initialPricing={onSale} initialCountry="US" />)],
      ...[...alternatives, ...audiences].map((a): [string, string] => [a.slug, renderToString(<AudienceView a={a} pricing={onSale} />)]),
    ]
    for (const [name, html] of pages) {
      expect(text(html), name).toContain(MONEY_RULE)
      const rule = html.slice(html.indexOf("Try it first"), html.indexOf("Payments are final"))
      expect(rule, name).toMatch(/<a [^>]*href="https:\/\/[^"]+"[^>]*>live demo<\/a>/)
      expect(rule, name).toMatch(/<a [^>]*href="\/free"[^>]*>free plan<\/a>/)
    }
  })
})

/**
 * Copy is what a reader sees: JSX text and string literals with a space in
 * them (a sentence or a label), after comments are taken out. Code names
 * (`lifetime`, `lifetime_inr`), plan codes, event names and URLs
 * (`/onecamp/free-license`) are not copy and stay. The admin console is the
 * owner's own and keeps its words.
 */
describe("retired plan names", () => {
  const ROOTS = ["app", "components", "lib", "hooks"]
  const SKIP = [/^components\/admin\//, /^app\/admin\//, /^lib\/adminApi\.ts$/, /\.test\.tsx?$/, /^lib\/font-files\//]
  const walk = (dir: string, out: string[] = []): string[] => {
    for (const e of readdirSync(join(process.cwd(), dir))) {
      const rel = `${dir}/${e}`
      if (statSync(join(process.cwd(), rel)).isDirectory()) walk(rel, out)
      else if (/\.tsx?$/.test(rel) && !SKIP.some((s) => s.test(rel))) out.push(rel)
    }
    return out
  }
  const copyOf = (src: string): string[] => {
    const code = src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1")
    const jsx = [...code.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]!)
    const literals = [...code.matchAll(/"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)].map((m) => (m[1] ?? m[2])!)
    return [...jsx, ...literals].filter((s) => /[A-Za-z]\s+[A-Za-z]/.test(s)).map((s) => s.replace(/\S*\/\S*/g, " "))
  }
  // Names and buttons a buyer met before the glossary (case as written), and
  // the US spelling of the noun ("licensed", the British verb, is right).
  const RETIRED = /\b(Own it|Or we run it|Choose Cloud|Start with Cloud|Get a free key|Buy a licence|Get the install command)\b|\blifetime licen[cs]e\b|\bLifetime\b|\b[Ll]icenses?\b/

  it("no retired plan name is left in copy", () => {
    const offenders: string[] = []
    for (const file of ROOTS.flatMap((r) => walk(r))) {
      for (const piece of copyOf(readFileSync(join(process.cwd(), file), "utf8"))) {
        const hit = piece.match(RETIRED)
        if (hit) offenders.push(`${file}: "${hit[0]}" in "${piece.trim().slice(0, 80)}"`)
      }
    }
    expect(offenders).toEqual([])
  })
})
