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
import { choiceLabel, cloudCheckoutDescription, cloudChoices, LICENCE_CHECKOUT_DESCRIPTION, MONEY_RULE } from "@/lib/paymentTerms"
import { FREE_SEATS, PEOPLE } from "@/lib/freePlan"
import { CLOUD_CHOICE, CLOUD_SIZE, PLAN, planOptions } from "@/lib/plans"
import { defaultPricing } from "@/lib/pricing"
import { seatsLine } from "@/lib/seatsLine"

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

/**
 * Cloud's choice had three sets of names (10 Nov 2026): /pricing said "Team
 * monthly | Team yearly | Business", "Monthly | Yearly | Business" on a
 * phone, and the checkout "Team (30 users) | Team yearly | Business (100
 * users)", where every other line on the site says "people". One set now,
 * from the glossary (CLOUD_CHOICE), drawn the same at every width on both
 * pages: the name, and under it what the choice adds.
 */
describe("the Cloud choice", () => {
  const sizes = { ...onSale, cloud_yearly_free_months: 2 }
  /** Each choice of a radio group, as read: name and line under it. */
  const choices = (html: string, group: string) => {
    const at = html.indexOf(`role="radiogroup" aria-label="${group}"`)
    expect(at, group).toBeGreaterThan(-1)
    const body = html.slice(at, html.indexOf("</div>", at))
    return [...body.matchAll(/<button[^>]*role="radio"[^>]*>([\s\S]*?)<\/button>/g)].map((m) => text(m[1]!))
  }
  const SET = ["Team monthly 30 people", "Team yearly 2 months free", "Business 100 people"]

  it("names each choice one way on /pricing and the checkout, at every width", () => {
    expect(Object.values(CLOUD_CHOICE)).toEqual(["Team monthly", "Team yearly", "Business"])
    expect(cloudChoices(sizes).map((b) => choiceLabel(b, sizes))).toEqual([
      { name: "Team monthly", detail: "30 people" },
      { name: "Team yearly", detail: "2 months free" },
      { name: "Business", detail: "100 people" },
    ])
    const pricing = renderToString(<PlanColumns pricing={sizes} detailed headingLevel="h2" />)
    const checkout = renderToString(<BuyCheckout initialPlan="cloud" initialBilling="monthly" initialPricing={sizes} initialCountry="US" />)
    // One group name, and no second label set for a phone (a short form drawn beside the long one).
    expect(choices(pricing, "Cloud plan")).toEqual(SET)
    expect(choices(checkout, "Cloud plan")).toEqual(SET)
  })

  it("says what Team yearly covers when the yearly price earns no free months", () => {
    expect(choiceLabel("yearly", { ...sizes, cloud_yearly_free_months: 0 })).toEqual({ name: "Team yearly", detail: "30 people" })
  })

  it("says people, not users, on the checkout's Cloud card", () => {
    const checkout = (billing: "monthly" | "yearly" | "business") =>
      text(renderToString(<BuyCheckout initialPlan="cloud" initialBilling={billing} initialPricing={sizes} initialCountry="US" />))
    for (const b of ["monthly", "yearly", "business"] as const) expect(checkout(b), b).not.toMatch(/\busers\b/)
    expect(checkout("monthly")).toContain("A machine sized for 30 people and a self-host licence included")
    expect(checkout("yearly")).toContain("2 months free, a machine sized for 30 people and a self-host licence included")
    expect(checkout("business")).toContain("A larger machine sized for 100 people and a self-host licence included")
  })

  // A Cloud plan's number is the people its machine is sized for: nobody
  // past it is turned away and nothing is charged per person. "Up to 30
  // people" read as a cap, and "100 people ... included" as a price step, so
  // each place says it the glossary's way (lib/freePlan PEOPLE.cloud). The free
  // plan's "up to 25 people" is a real limit, and stays. The licence's people
  // are said one way too, in the table as on the cards.
  it("says what a Cloud plan's number means one way, wherever a buyer reads it", () => {
    const [team, business] = [sizes.cloud_seats, sizes.business_seats]
    expect([team, business]).not.toContain(FREE_SEATS)
    const asCap = new RegExp(`\\bup to (${team}|${business})\\b|(?<!sized for )\\b(${team}|${business}) people\\b[^.]*\\bincluded\\b`, "i")
    const says = (where: string, read: string, n: number) => {
      expect(read, where).not.toMatch(asCap)
      expect(read.toLowerCase(), where).toContain(PEOPLE.cloud(n).toLowerCase())
    }
    const cards = text(renderToString(<PlanColumns pricing={sizes} />))
    says("cards", cards, team)
    expect(cards, "the free plan's limit").toContain(`Up to ${FREE_SEATS} people`)
    const table = text(renderToString(<PlanComparison pricing={sizes} />))
    says("table", table, team)
    expect(table, "table: Business's number").toMatch(new RegExp(`\\b${business} on Business\\b`))
    expect(table, "the licence's people in the table").toContain(PEOPLE.licence)
    says("audience page", text(renderToString(<AudienceView a={alternatives[0]!} pricing={sizes} />)), team)
    for (const [b, n] of [["monthly", team], ["yearly", team], ["business", business]] as const) {
      says(`checkout ${b}`, text(renderToString(<BuyCheckout initialPlan="cloud" initialBilling={b} initialPricing={sizes} initialCountry="US" />)), n)
    }
    says("workspace card", seatsLine(team - 1, team), team)
    says("workspace card, past it", seatsLine(team + 1, team), team)
  })

  // On a 390 px phone the choice is 310 px across, a third each. "Team
  // monthly" is 82 px of words at 12 px and about 89 at 13. /pricing draws
  // it at 12 px in a 102 px choice with 4 px a side (94 px for words). The
  // checkout drew it in its caption size, 13 px, in a 98 px choice (its
  // choices stand 4 px apart) with 8 px a side: 82 px for 89 px of words,
  // so the name broke over two lines there. Same sizes now, and 2 px a
  // side on the checkout, which leaves it the 94 px /pricing has.
  it("draws each choice in one size on a phone, with room for its name on one line", () => {
    /** How a phone draws a group's choices: the classes with no breakpoint, for the name, the line under it and the sides. */
    const onPhone = (html: string) => {
      const at = html.indexOf('role="radiogroup" aria-label="Cloud plan"')
      expect(at).toBeGreaterThan(-1)
      const radio = html.slice(at).match(/<button[^>]*role="radio"[^>]*class="([^"]*)"[^>]*>([\s\S]*?)<\/button>/)!
      const last = (classes: string | undefined, re: RegExp, inherited: string) => (classes ?? "").split(" ").filter((c) => re.test(c)).pop() ?? inherited
      const size = (classes: string | undefined, inherited: string) => last(classes, /^text-\[\d+px\]$/, inherited)
      const [name, detail] = [...radio[2]!.matchAll(/<span(?: class="([^"]*)")?>/g)].map((m) => m[1])
      const own = size(radio[1], "the card's size")
      return { name: size(name, own), detail: size(detail, own), sides: last(radio[1], /^px-[\d.]+$/, "none") }
    }
    const pricing = onPhone(renderToString(<PlanColumns pricing={sizes} detailed headingLevel="h2" />))
    const checkout = onPhone(renderToString(<BuyCheckout initialPlan="cloud" initialBilling="monthly" initialPricing={sizes} initialCountry="US" />))
    expect(pricing).toEqual({ name: "text-[12px]", detail: "text-[11px]", sides: "px-1" })
    expect(checkout).toEqual({ name: "text-[12px]", detail: "text-[11px]", sides: "px-0.5" })
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

  // How many people a plan takes is said in people, one way per plan: never
  // "unlimited users" beside a Cloud plan "for 100 users", which read as a cap.
  // Read over the whole source (comments out), so JSX text after an
  // expression is read too. Rivals' own billing ("Per user, per month") is
  // about them, and is not matched.
  const ALLOWANCE_IN_USERS = /\b(unlimited|any number of) (users|seats)\b|\b(users|seats) included\b|\$\{[^}]*\} (users|seats)\b/gi
  // A Cloud plan's number is the people its machine is sized for, not a cap:
  // never "up to" it, and never written beside "people" outside the glossary
  // (lib/freePlan PEOPLE). The free plan's "up to ${FREE_SEATS} people" is a
  // real limit and is not matched. The licence's people are "any number".
  const CLOUD_AS_A_CAP = /\bup to \$?\{[^}\n]*\b(cloud|business)_seats\b[^}\n]*\}|\$?\{[^}\n]*\b(cloud|business)_seats\b[^}\n]*\} people\b|\bunlimited people\b/gi

  it("says how many people a plan takes in people, one way: never users or seats, and never up to a Cloud plan's number", () => {
    const offenders: string[] = []
    for (const file of ROOTS.flatMap((r) => walk(r))) {
      const code = readFileSync(join(process.cwd(), file), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1")
      for (const hit of [...code.matchAll(ALLOWANCE_IN_USERS), ...code.matchAll(CLOUD_AS_A_CAP)]) offenders.push(`${file}: "${hit[0]}"`)
    }
    expect(offenders).toEqual([])
  })

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
