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
 *
 * It sits on the page, not in a card: the two totals are the cards, side by
 * side as a pair, and a frame round them made a card holding cards, two
 * borders deep, where the rest of the site separates with space.
 */

import React, { useMemo, useState } from "react"
import Link from "next/link"
import type { Pricing } from "@/lib/pricing"
import { cloudYearFor } from "@/lib/cloudYear"
import { DEFAULT_USD_RATE, defaultPricing, fmtINR, fromUsd, priceWithEstimate } from "@/lib/pricing"
import { PRICES_CHECKED, SEAT_COSTS, SERVER_USD_PER_MONTH, teamCost } from "@/lib/teamCost"
import { FREE_SEATS } from "@/lib/freePlan"
import { useVisitorRegion } from "@/hooks/useVisitorRegion"
import { Icon } from "@/components/ui/icons"
import { ix } from "@/lib/interactive"

/** The calculator's team, 1 to 1000 people. */
const clampTeam = (n: number) => Math.min(1000, Math.max(1, n))

// The totals are in the reader's money. In India, rupees: the rivals' dollar
// list prices at the day's rate (pricing.usd_rate), rounded to the hundred.
// Elsewhere the rivals' prices are dollars to begin with, so a dollar reader
// sees them as they are and a euro or pound reader at the day's rate, never
// in lakh-grouped rupees they would have to convert back (plan A4).
const inrAt = (usd: number, rate: number) => fmtINR(Math.round((usd * rate) / 100) * 100)
// Per-seat prices keep their cents ($7.25), so the sum can be checked.
const fmtSeat = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 })

export const CostCalculator: React.FC<{ lifetimeUsd: number; pricing?: Pricing }> = ({ lifetimeUsd, pricing }) => {
    // 40, not 20: above the free plan's 25, so the comparison beside the $259
    // licence is about the licence. At 20 it priced the free plan and claimed
    // "70x less" next to a price it was not about (buyer review, 3 Oct 2026).
    const [people, setPeople] = useState(40)
    const rate = pricing?.usd_rate || DEFAULT_USD_RATE
    const region = useVisitorRegion()
    const p = pricing ?? defaultPricing
    const fmt = (usd: number) => (region?.inIndia ? inrAt(usd, rate) : fromUsd(p, usd, region))
    // OneCamp's own price stays in rupees, the charge, with the estimate beside it.
    const licence = pricing ? priceWithEstimate(pricing, pricing.lifetime_inr, region) : fmt(lifetimeUsd)
    const [withAi, setWithAi] = useState(true)

    // First year, so a licence is included rather than amortised away; a team
    // within the free plan pays none (lib/teamCost).
    const { saasYear, oneCampYear, multiple, lines, free } = useMemo(
        () => teamCost(people, withAi, lifetimeUsd, SERVER_USD_PER_MONTH, SEAT_COSTS),
        [people, lifetimeUsd, withAi],
    )

    return (
        <div>
            <div className="flex flex-wrap items-center gap-3">
                <label htmlFor="team-size" className="text-small text-foreground">
                    Our team is
                </label>
                {/* A stepper: the number between a step down and a step up,
                    the browser's spin buttons gone (storefront audit C5). */}
                <span className="inline-flex items-center gap-1">
                    <button
                        type="button"
                        aria-label="One person fewer"
                        aria-controls="team-size"
                        disabled={people <= 1}
                        onClick={() => setPeople((n) => clampTeam(n - 1))}
                        {...ix("icon")}
                        className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground disabled:opacity-40 sm:size-9"
                    >
                        <Icon name="minus" />
                    </button>
                    <input
                        id="team-size"
                        type="number"
                        min={1}
                        max={1000}
                        value={people}
                        onChange={(e) => setPeople(Number(e.target.value) || 1)}
                        className="ui-field w-20 text-center tabular-nums"
                    />
                    <button
                        type="button"
                        aria-label="One person more"
                        aria-controls="team-size"
                        disabled={people >= 1000}
                        onClick={() => setPeople((n) => clampTeam(n + 1))}
                        {...ix("icon")}
                        className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground disabled:opacity-40 sm:size-9"
                    >
                        <Icon name="plus" />
                    </button>
                </span>
                <span className="text-small text-foreground">people.</span>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 text-small text-foreground sm:min-h-0">
                    <input
                        type="checkbox"
                        checked={withAi}
                        onChange={(e) => setWithAi(e.target.checked)}
                        className="ui-check"
                    />
                    We want AI too.
                </label>
            </div>
            {/* The same number on a slider (site.md C7), the layer's slider
                kind (ui-range): the brand fills the track up to the team's
                size; the thumb lifts and grows while it is held. */}
            <input
                type="range"
                min={1}
                max={200}
                value={Math.min(200, people)}
                onChange={(e) => setPeople(Number(e.target.value))}
                aria-label="Team size"
                className="ui-range mt-4 w-full max-w-xl"
                style={{ "--fill": `${((Math.min(200, people) - 1) / 199) * 100}%` } as React.CSSProperties}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-card p-6 shadow-e1">
                    <div className="text-small font-[510] text-muted-foreground">Slack + Notion</div>
                    <div key={`s${saasYear}`} className="fx-fade mt-1 font-display text-price tabular-nums">{fmt(saasYear)}</div>
                    <div className="text-caption text-muted-foreground">per year, and it grows with the team</div>
                    <ul className="mt-3 space-y-0.5 text-caption text-muted-foreground">
                        {lines.map((t) => (
                            <li key={t.name}>
                                {t.name}, {fmtSeat(t.usd)}/user/mo
                            </li>
                        ))}
                        <li>
                            List prices, billed annually, checked {PRICES_CHECKED}
                            {region?.inIndia || (region && region.currency !== "USD") ? ", at today's rate" : ""}
                        </li>
                    </ul>
                </div>

                <div className="rounded-2xl bg-card p-6 shadow-e3 ring-1 ring-line-3">
                    <div className="text-small font-[510] text-foreground">OneCamp, self-hosted</div>
                    <div key={`o${oneCampYear}`} className="fx-fade mt-1 font-display text-price tabular-nums">{fmt(oneCampYear)}</div>
                    <div className="text-caption text-muted-foreground">first year, and it does not grow with the team</div>
                    <ul className="mt-3 space-y-0.5 text-caption text-muted-foreground">
                        <li>{free ? `Free plan, up to ${FREE_SEATS} people` : `${licence} licence, paid once, unlimited users`}</li>
                        <li>About {fmt(SERVER_USD_PER_MONTH)} a month for the server that runs it</li>
                        {withAi && <li>AI included: local models, or your own API key billed at cost</li>}
                        <li>Every year after this one is just the server</li>
                    </ul>
                </div>
            </div>

            {/* The chip says the multiple once, and the sentence is one text
                run beside it: it was flex items with a 12px gap, so "49× less"
                floated with a space before its comma, and said twice in one
                line (design/site-polish/AUDIT.md, L6). */}
            <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-small text-foreground">
                {multiple >= 2 && (
                    <span className="hue-moss inline-flex h-7 items-center rounded-full bg-hue-tint px-3 text-caption font-[590] text-hue-ink">
                        {Math.round(multiple)}× less in the first year
                    </span>
                )}
                <span>
                    {multiple >= 2
                        ? `for ${Math.max(1, Math.min(1000, people))} people; the gap widens with every person you add.`
                        : "At this size the difference is small, and honestly the subscriptions may be less hassle. The maths turns around quickly as you add people."}
                </span>
            </p>

            {/* The objection the buyer already has, and it must be named: published
                guidance on this market is explicit that acknowledging the operational
                cost helps close, because the buyer knows and is checking whether you
                do. Named in ONE line here and answered in full in Switching above,
                rather than the same paragraph in both places. */}
            <p className="mt-3 text-caption text-muted-foreground">
                Not counted: someone has to run the server.
                {(() => {
                    const cloud = pricing && cloudYearFor(Math.max(1, Math.min(1000, people)), pricing)
                    return cloud ? (
                        <>
                            {" "}Or nobody does:{" "}
                            <Link href={cloud.href} className="link">
                                OneCamp Cloud ({cloud.plan}) is{" "}
                                {priceWithEstimate(
                                    pricing,
                                    cloud.plan === "Business" ? pricing.business_inr * 12 : cloud.plan === "Team" ? pricing.cloud_inr * 12 : pricing.cloud_yearly_inr,
                                    region,
                                )}{" "}
                                a year
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
