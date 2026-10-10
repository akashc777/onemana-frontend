import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Margin, MarginHeading, Section, SectionHeading } from "@/components/ui/Section";
import CostCalculator from "@/components/site/CostCalculator";
import type { Pricing } from "@/lib/pricing";
import { ButtonLink } from "@/components/ui/Button";
import {
    AGENTS_CHECKED,
    CLAIMS_CHECKED,
    RECORD_KEEPING_IN_FORCE,
    agentsYouBring,
    RECORD_KEEPING_SOURCE,
    cancels,
    countWord,
    killQuestion,
    onecampRow,
    recordKeeping,
    rivals,
    rivalsLine,
} from "@/lib/compare";
import { site } from "@/lib/site";

/**
 * The comparison page.
 *
 * The homepage deliberately does not argue "replaces Slack, Notion, Asana,
 * Zoom" any more. This is where that argument lives, because the person who
 * lands here typed the comparison into a search box and is owed a real answer
 * rather than a redirect to a product tour.
 *
 * It is ordered the way a sceptic reads: the concession first, then the claim,
 * then the way to check the claim without talking to anyone. Leading with where
 * the rivals win is not modesty. It is the only thing that makes the next
 * section worth reading, and every rival's row in the table is one link away
 * from the page it was read from. The concessions are our judgement, dated, and
 * the page does not pretend they are sourced.
 *
 * No count is typed here: rivalsLine and countWord work them out from the list
 * in lib/compare.ts, so a rival added or dropped cannot leave a wrong number.
 */
export function CompareView({ pricing }: { pricing: Pricing }) {
    return (
        <>
            <PageHeader
                title="Where OneCamp wins, and where it does not"
                subtitle={`${rivalsLine()}, compared on how they bill you and what limits their agents. Each rival's name in the table links to the page its row came from.`}
                divider
            />

            {/* The concession, first and unhedged. */}
            <Section>
                <Margin
                    aside={
                        <MarginHeading
                            title="What the others do better"
                            subtitle={`Each of these is a real reason to buy something else. Checked ${CLAIMS_CHECKED}.`}
                        />
                    }
                >
                {/* A list with the product in the margin: four boxes of equal
                    weight made an honest concession look like a feature grid. */}
                <dl className="divide-y divide-border border-y border-border">
                    {rivals.map((r) => (
                        <div key={r.name} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-8">
                            <dt className="font-medium text-foreground">{r.name}</dt>
                            <dd className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{r.theyWin}</dd>
                        </div>
                    ))}
                </dl>
                </Margin>
            </Section>

            {/* The table. Structural claims only: how you pay, and what exists. */}
            <Section divider>
                <SectionHeading
                    align="left"
                    title="How you pay, and what governs the agents"
                    subtitle="Billing shape rather than today's price, because the shape is what you live with. Prices move; who you are billed for does not."
                />
                <div className="mt-8">
                    {/* The table is the only element on the site allowed to scroll
                        sideways, and it does so inside its own box so the page
                        itself never does. */}
                    <div className="-mx-4 overflow-x-auto border-y border-border px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                            <caption className="sr-only">
                                {`OneCamp compared with ${countWord(rivals.length)} alternatives on billing and agent governance`}
                            </caption>
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Product</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">What it is</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">How you pay</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Agent governance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-border bg-muted">
                                    <th scope="row" className="px-4 py-4 align-top font-semibold text-foreground">
                                        {onecampRow.name}
                                    </th>
                                    <td className="px-4 py-4 align-top text-muted-foreground">{onecampRow.what}</td>
                                    <td className="px-4 py-4 align-top text-muted-foreground">{onecampRow.billing}</td>
                                    <td className="px-4 py-4 align-top text-muted-foreground">{onecampRow.agents}</td>
                                </tr>
                                {rivals.map((r) => (
                                    <tr key={r.name} className="border-b border-border last:border-0">
                                        <th scope="row" className="px-4 py-4 align-top font-semibold text-foreground">
                                            <a
                                                href={r.source}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                                            >
                                                {r.name}
                                            </a>
                                        </th>
                                        <td className="px-4 py-4 align-top text-muted-foreground">
                                            {r.what}
                                            {/* A part of the row its own page does not say, sourced where it is said. */}
                                            {r.also && (
                                                <>
                                                    {" ("}
                                                    <a
                                                        href={r.also.href}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="underline decoration-border-strong underline-offset-4 hover:text-foreground hover:decoration-foreground"
                                                    >
                                                        {r.also.label}
                                                    </a>
                                                    )
                                                </>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{r.billing}</td>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{r.agents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    Each rival&apos;s name links to the page its row was read from, in {CLAIMS_CHECKED}. If one of these
                    is out of date, it is our error and worth telling us about.
                </p>
            </Section>

            {/* The question. This is the page's actual argument. */}
            <Section tone="muted">
                <SectionHeading
                    align="left"
                    title="Ask every one of us the same thing"
                    subtitle="You can check OneCamp's answer yourself, in the demo, in about a minute."
                />
                <div className="mt-10 max-w-3xl border-l-2 border-foreground pl-6">
                    <blockquote className="m-0">
                        <p className="text-balance font-display text-[1.5rem] leading-[2rem] tracking-[-0.01em] text-foreground sm:text-[1.75rem] sm:leading-[2.25rem]">{killQuestion}</p>
                    </blockquote>
                </div>
                <div className="mt-6">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        OneCamp answers yes, and the demo shows it: the drill sends an agent at a channel its person is
                        not in, and hands back the refusal with its position in the chain and the hash of the row before
                        it. The row is written to the same log an admin exports.
                    </p>
                </div>
                {/* The step past "we will show you": you check it, with our
                    software nowhere in the loop. A claim a reader can only
                    watch is still a claim; this is the one place on the site
                    where they can settle it themselves. */}
                <div className="mt-4">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Then take it away and check it. Download the record from the demo and drop it on{" "}
                        <a href="/verify" className="underline underline-offset-4 hover:text-foreground">
                            the verifier
                        </a>
                        , which recomputes every row in your browser. It needs no account and uploads nothing.
                    </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                    <ButtonLink href={site.demoDrillUrl()} external variant="brand" size="lg">
                        Run the drill in the demo
                    </ButtonLink>
                    <ButtonLink href="/verify" variant="ghost" size="lg">
                        Check a record yourself
                    </ButtonLink>
                </div>
            </Section>

            {/* The agents a buyer already pays for are not the competition. They
                are what arrives here, and this is how. */}
            <Section>
                <SectionHeading
                    align="left"
                    title="Already paying for an agent? Bring it."
                    subtitle="Hosted or your own, each arrives as a named agent acting for a person. It reaches no further than that person can, shows up in the agent inventory, and stops when you pause it."
                />
                <div className="mt-8">
                    <div className="-mx-4 overflow-x-auto border-y border-border px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
                            <caption className="sr-only">How the agents you already pay for connect to OneCamp</caption>
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Agent</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">How it is billed</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">How it joins OneCamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentsYouBring.map((a) => (
                                    <tr key={a.name} className="border-b border-border last:border-0">
                                        <th scope="row" className="px-4 py-4 align-top font-semibold text-foreground">
                                            <a
                                                href={a.source}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                                            >
                                                {a.name}
                                            </a>
                                        </th>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{a.billing}</td>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{a.connects}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    No token to paste: the agent signs in, and whoever approves it picks the agent it acts as and what
                    it may do. OneCamp itself is one licence with unlimited people, so an agent is never another seat.
                    Checked {AGENTS_CHECKED}.
                </p>
            </Section>

            {/* Why the question above stopped being a matter of taste. */}
            <Section divider>
                <Margin
                    aside={
                        <MarginHeading
                            title="What a deployer is now asked to keep"
                            subtitle={`The EU AI Act's record-keeping obligations came into full application on ${RECORD_KEEPING_IN_FORCE}. Until then "our agents are audited" was a preference you could weigh against price.`}
                        />
                    }
                >
                <div>
                    <div className="-mx-4 overflow-x-auto border-y border-border px-4 sm:mx-0 sm:px-0">
                        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                            <caption className="sr-only">
                                Record-keeping obligations and what OneCamp produces against each
                            </caption>
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">Asked for</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-foreground">What this produces</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recordKeeping.map((r) => (
                                    <tr key={r.asked} className="border-b border-border last:border-0">
                                        <th scope="row" className="px-4 py-4 align-top font-normal text-muted-foreground">
                                            {r.asked}
                                        </th>
                                        <td className="px-4 py-4 align-top text-foreground">{r.produced}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        No software can make you compliant. Compliance is a property of your deployment
                        and what you use it for, and anyone selling you the word is selling you
                        something they cannot deliver. Every line in the right-hand column is a thing
                        you can check on a running install in about a minute. Whether that satisfies
                        an obligation is for you and your counsel.{" "}
                        <a
                            href={RECORD_KEEPING_SOURCE}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                        >
                            Read Article 12
                        </a>
                        .
                    </p>
                </div>
                </Margin>
            </Section>

            {/* The SEO block, which is also the honest answer to "what do I cancel". */}
            <Section divider>
                <SectionHeading
                    align="left"
                    title="The subscriptions this usually cancels"
                    subtitle="Not a feature-for-feature swap with any of them. Each surface is good enough that a small team stops paying for the separate tool."
                />
                <div className="mt-8">
                    <CostCalculator lifetimeUsd={pricing.lifetime_usd} pricing={pricing} />
                </div>
                <div className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {cancels.map((c) => (
                        <div key={c.tool}>
                            <div className="flex flex-wrap items-baseline gap-x-2 border-b border-border/60 pb-3">
                                <span className="text-sm font-semibold text-foreground">{c.tool}</span>
                                <span className="text-sm text-muted-foreground">{c.surface}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        If your team lives in one of those tools and nothing else, buy that tool. OneCamp is worth it
                        when the work crosses four of them and you want one set of permissions over the lot, including
                        the permissions an agent inherits.{" "}
                        <Link href="/pricing" className="link">
                            See what it costs
                        </Link>
                        .
                    </p>
                </div>
            </Section>
        </>
    );
}
