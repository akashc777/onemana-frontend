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
