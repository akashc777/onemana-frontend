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
import Link from "next/link"
import type { Pricing } from "@/lib/pricing"
import { cloudYearFor } from "@/lib/cloudYear"
import { teamCost } from "@/lib/teamCost"
import { FREE_SEATS } from "@/lib/freePlan"

/**
 * List prices per user per month, billed annually, shown so the arithmetic is
 * checkable. Checked October 2026; PRICES_CHECKED says so on screen.
 *
 * Every line is a plan someone can buy today. AI is not an add-on any more:
 * Notion AI comes only with Notion Business, so wanting AI swaps Notion Plus
 * ($10) for Business ($20) rather than adding a retired $10 add-on, which a
 * careful buyer rightly picked at (buyer review, 4 Oct 2026). Where sources
 * disagree, the lower price is used: Zoom Pro moved twice in 2026, so $13.33.
 */
const SEAT_COSTS = [
    { name: "Slack Pro", usd: 7.25, when: "always" },
    { name: "Notion Plus", usd: 10, when: "noAi" },
    { name: "Notion Business, which includes Notion AI", usd: 20, when: "ai" },
    { name: "Zoom Pro", usd: 13.33, when: "always" },
] as const

const PRICES_CHECKED = "October 2026"

/** A VPS that comfortably runs a team of this size, from the hardware FAQ. */
const SERVER_USD_PER_MONTH = 12

const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
// Per-seat prices keep their cents ($7.25), so the sum can be checked.
const fmtSeat = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })

export const CostCalculator: React.FC<{ lifetimeUsd: number; pricing?: Pricing }> = ({ lifetimeUsd, pricing }) => {
    // 40, not 20: above the free plan's 25, so the comparison beside the $259
    // licence is about the licence. At 20 it priced the free plan and claimed
    // "70x less" next to a price it was not about (buyer review, 3 Oct 2026).
    const [people, setPeople] = useState(40)
    const [withAi, setWithAi] = useState(true)

    // First year, so a licence is included rather than amortised away; a team
    // within the free plan pays none (lib/teamCost).
    const { saasYear, oneCampYear, multiple, lines, free } = useMemo(
        () => teamCost(people, withAi, lifetimeUsd, SERVER_USD_PER_MONTH, SEAT_COSTS),
        [people, lifetimeUsd, withAi],
    )

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
                                {t.name}, {fmtSeat(t.usd)}/user/mo
                            </li>
                        ))}
                        <li>List prices, billed annually, checked {PRICES_CHECKED}</li>
                    </ul>
                </div>

                <div className="rounded-md border border-brand/40 bg-brand/[0.04] p-4">
                    <div className="text-xs uppercase tracking-wide text-brand">OneCamp, self-hosted</div>
                    <div className="mt-1 text-3xl font-semibold tabular-nums">{fmt(oneCampYear)}</div>
                    <div className="text-xs text-foreground/50">first year, and it does not grow with the team</div>
                    <ul className="mt-3 space-y-0.5 text-xs text-foreground/50">
                        <li>{free ? `Free plan, up to ${FREE_SEATS} people` : `${fmt(lifetimeUsd)} license, paid once, unlimited users`}</li>
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
                        with every person you add.
                    </>
                ) : (
                    <>
                        At this size the difference is small, and honestly the subscriptions may be less hassle. The
                        maths turns around quickly as you add people.
                    </>
                )}
            </p>

            {/* The objection the buyer already has, and it must be named: published
                guidance on this market is explicit that acknowledging the operational
                cost helps close, because the buyer knows and is checking whether you
                do. Named in ONE line here and answered in full in Switching above,
                rather than the same paragraph in both places. */}
            <p className="mt-3 text-xs leading-relaxed text-foreground/50">
                Not counted: someone has to run the server. What that takes is above.
                {(() => {
                    const cloud = pricing && cloudYearFor(Math.max(1, Math.min(1000, people)), pricing)
                    return cloud ? (
                        <>
                            {" "}Or nobody does:{" "}
                            <Link href={cloud.href} className="underline underline-offset-2 hover:text-foreground">
                                OneCamp Cloud ({cloud.plan}) is {fmt(cloud.usdYear)} a year
                            </Link>
                            , hosted, backed up and updated for you.
                        </>
                    ) : null
                })()}
            </p>
        </div>
    )
}

export default CostCalculator
