/**
 * The first-year cost of OneCamp against the per-seat tools it replaces, for
 * a team of a given size. Pure, so the arithmetic the homepage shows is tested.
 *
 * A team within the free plan pays no licence at all, only the server that
 * runs it. The calculator predated the free plan and charged every team the
 * lifetime licence, understating the gap for exactly the small teams most
 * visitors are.
 */
import { FREE_SEATS } from "./freePlan"

export interface SeatCost {
    name: string
    usd: number
    /**
     * When the line counts: always, only when the visitor wants AI, or only
     * when they do not. A plan that bundles AI replaces the plan without it
     * (Notion Plus becomes Notion Business), so AI is a swap, not an add-on.
     */
    when: "always" | "ai" | "noAi"
}

export interface TeamCost {
    seats: number
    saasYear: number
    licenceUsd: number
    oneCampYear: number
    free: boolean
    multiple: number
    lines: SeatCost[]
}

export function teamCost(
    people: number,
    withAi: boolean,
    lifetimeUsd: number,
    serverUsdPerMonth: number,
    seatCosts: readonly SeatCost[],
): TeamCost {
    const seats = Math.max(1, Math.min(1000, Math.floor(people) || 1))
    const lines = seatCosts.filter((t) => t.when === "always" || (t.when === "ai") === withAi)
    const saasYear = lines.reduce((n, t) => n + t.usd, 0) * seats * 12
    const free = seats <= FREE_SEATS
    const licenceUsd = free ? 0 : lifetimeUsd
    const oneCampYear = licenceUsd + serverUsdPerMonth * 12
    return { seats, saasYear, licenceUsd, oneCampYear, free, multiple: saasYear / oneCampYear, lines }
}

/**
 * List prices per user per month, billed annually, for the tools OneCamp is
 * most often bought instead of. Facts about other companies' prices, stated so
 * the arithmetic can be checked; checked October 2026 (PRICES_CHECKED).
 *
 * Every line is a plan someone can buy today. AI is not an add-on any more:
 * Notion AI comes only with Notion Business, so wanting AI swaps Notion Plus
 * ($10) for Business ($20) rather than adding a retired $10 add-on (buyer
 * review, 4 Oct 2026). Zoom Pro is $14.16 a user a month billed annually,
 * as zoom.us/pricing lists it (read 10 Oct 2026; it moved twice in 2026).
 */
export const SEAT_COSTS: readonly SeatCost[] = [
    { name: "Slack Pro", usd: 7.25, when: "always" },
    { name: "Notion Plus", usd: 10, when: "noAi" },
    { name: "Notion Business, which includes Notion AI", usd: 20, when: "ai" },
    { name: "Zoom Pro", usd: 14.16, when: "always" },
]

export const PRICES_CHECKED = "October 2026"

/** Where each list price above can be checked. */
export const SEAT_COST_SOURCES = [
    { name: "Slack", href: "https://slack.com/pricing" },
    { name: "Notion", href: "https://www.notion.com/pricing" },
    { name: "Zoom", href: "https://zoom.us/pricing" },
] as const

/** A VPS that comfortably runs a team of this size, from the hardware FAQ. */
export const SERVER_USD_PER_MONTH = 12

/**
 * What the per-seat stack costs a team for a year, in rupees at the day's
 * rate, rounded to the thousand: an estimate, and it says so where it is shown.
 */
export function stackYearInr(people: number, withAi: boolean, usdRate: number): number {
    const lines = SEAT_COSTS.filter((t) => t.when === "always" || (t.when === "ai") === withAi)
    const usd = lines.reduce((n, t) => n + t.usd, 0) * people * 12
    return Math.round((usd * usdRate) / 1000) * 1000
}
