"use client"

/**
 * CostCalculator — the argument, done with the visitor's own number.
 *
 * The comparison already existed on this site, as prose, in the twelfth FAQ
 * item, behind a click. Published research on why teams leave Slack is
 * consistent that cost at scale is the first reason and that what converts is
 * SPECIFIC MATH rather than adjectives, so the strongest thing on the page was
 * the thing fewest people saw.
 *
 * The number gets better as the team grows, because one side is per seat and
 * the other is not, and that is precisely the shape a visitor has to feel rather
 * than be told. So they type their own headcount: an arithmetic result you
 * supplied the input to is not a marketing claim, it is a fact about you.
 *
 * The per-seat prices are list prices for the paid tiers these tools are
 * actually bought on, and they are stated on screen so the sum can be checked
 * rather than trusted. Understating them would be the easy way to make this look
 * better and the fastest way to lose someone who knows what they pay.
 */

import React, { useMemo, useState } from "react"

/**
 * List prices per user per month, shown so the arithmetic is checkable.
 *
 * `ai` marks a line that only applies when the visitor wants AI, so the toggle
 * filters this one list rather than maintaining a second set of numbers that
 * could drift from it.
 *
 * The AI line is deliberately conservative. Notion sold its AI add-on at $10
 * per user per month before folding it into higher base prices in 2026, and
 * agent runs are now billed separately at $10 per 1,000 credits with no
 * published per-action rate. Charging the old add-on price understates what a
 * team running agents actually pays, which is the right direction to be wrong in.
 */
const SEAT_COSTS = [
    { name: "Slack Pro", usd: 8.75, ai: false },
    { name: "Notion Business", usd: 10, ai: false },
    { name: "Zoom Pro", usd: 13, ai: false },
    { name: "Notion AI, at its old add-on price", usd: 10, ai: true },
] as const

/** A VPS that comfortably runs a team of this size, from the hardware FAQ. */
const SERVER_USD_PER_MONTH = 12

const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

export const CostCalculator: React.FC<{ lifetimeUsd: number }> = ({ lifetimeUsd }) => {
    const [people, setPeople] = useState(20)
    const [withAi, setWithAi] = useState(true)

    const { saasYear, oneCampYear, multiple, lines } = useMemo(() => {
        const seats = Math.max(1, Math.min(1000, people))
        const lines = SEAT_COSTS.filter((t) => !t.ai || withAi)
        const perSeatMonth = lines.reduce((n, t) => n + t.usd, 0)
        const saasYear = perSeatMonth * seats * 12
        // First year, so the licence is included rather than amortised away.
        const oneCampYear = lifetimeUsd + SERVER_USD_PER_MONTH * 12
        return { saasYear, oneCampYear, multiple: saasYear / oneCampYear, lines }
    }, [people, lifetimeUsd, withAi])

    return (
        <div className="mx-auto max-w-2xl rounded-lg border border-border bg-canvas-raised p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="team-size" className="text-sm text-foreground/80">
                    Our team is
                </label>
                <input
                    id="team-size"
                    type="number"
                    min={1}
                    max={1000}
                    value={people}
                    onChange={(e) => setPeople(Number(e.target.value) || 1)}
                    className="w-24 rounded-md border border-border bg-canvas px-3 py-1.5 text-base tabular-nums focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <span className="text-sm text-foreground/80">people.</span>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                    <input
                        type="checkbox"
                        checked={withAi}
                        onChange={(e) => setWithAi(e.target.checked)}
                        className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                    />
                    We want AI too.
                </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border border-border p-4">
                    <div className="text-xs uppercase tracking-wide text-foreground/50">
                        Slack + Notion + Zoom
                    </div>
                    <div className="mt-1 text-3xl font-semibold tabular-nums">{fmt(saasYear)}</div>
                    <div className="text-xs text-foreground/50">per year, and it grows with the team</div>
                    <ul className="mt-3 space-y-0.5 text-xs text-foreground/50">
                        {lines.map((t) => (
                            <li key={t.name}>
                                {t.name}, {fmt(t.usd)}/user/mo
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-md border border-brand/40 bg-brand/[0.04] p-4">
                    <div className="text-xs uppercase tracking-wide text-brand">OneCamp, self-hosted</div>
                    <div className="mt-1 text-3xl font-semibold tabular-nums">{fmt(oneCampYear)}</div>
                    <div className="text-xs text-foreground/50">first year, and it does not grow with the team</div>
                    <ul className="mt-3 space-y-0.5 text-xs text-foreground/50">
                        <li>{fmt(lifetimeUsd)} licence, paid once, unlimited users</li>
                        <li>{fmt(SERVER_USD_PER_MONTH)}/mo server that runs it</li>
                        {withAi && <li>AI included: local models, or your own API key billed at cost</li>}
                        <li>Every year after this one is just the server</li>
                    </ul>
                </div>
            </div>

            <p className="mt-5 text-sm text-foreground/70">
                {multiple >= 2 ? (
                    <>
                        At {Math.max(1, Math.min(1000, people))} people that is{" "}
                        <strong className="text-foreground">{Math.round(multiple)}× less</strong>, and the gap widens
                        with every person you add, because one side charges per seat and the other does not.
                    </>
                ) : (
                    <>
                        At this size the difference is small, and honestly the subscriptions may be less hassle. The
                        maths turns around quickly as you add people.
                    </>
                )}
            </p>

            {/* The objection the buyer already has. Naming it first is what makes
                the rest credible: published guidance on this market is explicit
                that acknowledging the operational cost helps close, because the
                buyer knows and is checking whether you do. */}
            <p className="mt-3 text-xs leading-relaxed text-foreground/50">
                What this does not count: someone has to run the server. Install is one command and updates,
                backups and restore each have one too, but it is still your machine. If nobody on the team wants
                that job, a subscription is the honest answer and we would rather say so here than after you have paid.
            </p>
        </div>
    )
}

export default CostCalculator
