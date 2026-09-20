import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { StackConvergence } from "@/components/site/StackConvergence";
import { ButtonLink } from "@/components/ui/Button";
import {
    CLAIMS_CHECKED,
    RECORD_KEEPING_IN_FORCE,
    RECORD_KEEPING_SOURCE,
    cancels,
    killQuestion,
    onecampRow,
    recordKeeping,
    rivals,
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
 * section worth reading, and everything on this page is one link away from a
 * source a reader can open in another tab.
 */
export function CompareView() {
    return (
        <>
            <PageHeader
                eyebrow="Compare"
                title="Where OneCamp wins, and where it does not"
                subtitle="Four open alternatives, the subscriptions all of them replace, and one question that separates them. Claims about other products link to the page they came from."
                divider
            />

            {/* The concession, first and unhedged. */}
            <Section>
                <SectionHeading
                    align="left"
                    eyebrow="Start here"
                    title="What the others do better"
                    subtitle={`Every one of these is a real reason to buy something else. Checked ${CLAIMS_CHECKED}.`}
                />
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {rivals.map((r, i) => (
                        <Reveal key={r.name} delay={i * 60}>
                            <div className="h-full rounded-xl border border-border bg-card p-5">
                                <p className="text-sm font-semibold text-foreground">{r.name}</p>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.theyWin}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </Section>

            {/* The table. Structural claims only: how you pay, and what exists. */}
            <Section divider>
                <SectionHeading
                    align="left"
                    eyebrow="Side by side"
                    title="How you pay, and what governs the agents"
                    subtitle="Billing shape rather than today's price, because the shape is what you live with. Prices move; who you are billed for does not."
                />
                <Reveal className="mt-8">
                    {/* The table is the only element on the site allowed to scroll
                        sideways, and it does so inside its own box so the page
                        itself never does. */}
                    <div className="overflow-x-auto rounded-xl border border-border">
                        <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                            <caption className="sr-only">
                                OneCamp compared with four open alternatives on billing and agent governance
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
                                <tr className="border-b border-border bg-brand/5">
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
                                                className="underline underline-offset-4 decoration-border hover:decoration-foreground"
                                            >
                                                {r.name}
                                            </a>
                                        </th>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{r.what}</td>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{r.billing}</td>
                                        <td className="px-4 py-4 align-top text-muted-foreground">{r.agents}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Reveal>
                <p className="mt-4 text-xs text-muted-foreground">
                    Each rival name links to the pricing page the row was read from, {CLAIMS_CHECKED}. If one of these is
                    out of date, it is our error and worth telling us about.
                </p>
            </Section>

            {/* The question. This is the page's actual argument. */}
            <Section divider>
                <SectionHeading
                    align="left"
                    eyebrow="One question"
                    title="Ask all five of us the same thing"
                    subtitle="A governance claim you cannot check in an afternoon is a brochure. This one you can."
                />
                <Reveal className="mt-8">
                    <blockquote className="rounded-xl border border-border bg-card p-6">
                        <p className="text-balance text-lg leading-relaxed text-foreground">{killQuestion}</p>
                    </blockquote>
                </Reveal>
                <Reveal className="mt-6" delay={80}>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        OneCamp answers yes, and the demo will show you rather than tell you: the drill sends an agent at
                        a channel its human principal is not in, and hands back the refusal with its position in the
                        chain and the hash of the row before it. Nothing is staged. The row is written to the same log an
                        admin exports.
                    </p>
                </Reveal>
                {/* The step past "we will show you": you check it, with our
                    software nowhere in the loop. A claim a reader can only
                    watch is still a claim; this is the one place on the site
                    where they can settle it themselves. */}
                <Reveal className="mt-4" delay={110}>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Then take it away and check it. Download the record from the demo and drop it on{" "}
                        <a href="/verify" className="underline underline-offset-4 hover:text-foreground">
                            the verifier
                        </a>
                        , which recomputes every row in your browser. It needs no account and nothing is uploaded, so
                        what you are trusting is a page you can read the source of, not us.
                    </p>
                </Reveal>
                <Reveal className="mt-8 flex flex-wrap gap-3" delay={140}>
                    <ButtonLink href={site.demoStartUrl} external variant="brandPremium" size="lg">
                        Run the drill in the demo
                    </ButtonLink>
                    <ButtonLink href="/verify" variant="ghost" size="lg">
                        Check a record yourself
                    </ButtonLink>
                </Reveal>
            </Section>

            {/* Why the question above stopped being a matter of taste. */}
            <Section divider>
                <SectionHeading
                    align="left"
                    eyebrow="Since August"
                    title="What a deployer is now asked to keep"
                    subtitle={`The EU AI Act's record-keeping obligations came into full application on ${RECORD_KEEPING_IN_FORCE}. Until then "our agents are audited" was a preference you could weigh against price.`}
                />
                <Reveal className="mt-8">
                    <div className="overflow-x-auto rounded-xl border border-border">
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
                </Reveal>
                <Reveal className="mt-6" delay={80}>
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
                            className="underline underline-offset-4 decoration-border hover:decoration-foreground"
                        >
                            Read Article 12
                        </a>
                        .
                    </p>
                </Reveal>
            </Section>

            {/* The SEO block, which is also the honest answer to "what do I cancel". */}
            <Section divider>
                <SectionHeading
                    align="left"
                    eyebrow="What it replaces"
                    title="The subscriptions this usually cancels"
                    subtitle="Not a feature-for-feature swap with any of them. Each surface is good enough that a small team stops paying for the separate tool."
                />
                <Reveal className="mt-8">
                    <StackConvergence />
                </Reveal>
                <div className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                    {cancels.map((c, i) => (
                        <Reveal key={c.tool} delay={i * 40}>
                            <div className="flex flex-wrap items-baseline gap-x-2 border-b border-border/60 pb-3">
                                <span className="text-sm font-semibold text-foreground">{c.tool}</span>
                                <span className="text-sm text-muted-foreground">{c.surface}</span>
                            </div>
                        </Reveal>
                    ))}
                </div>
                <Reveal className="mt-8" delay={120}>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        If your team lives in one of those tools and nothing else, buy that tool. OneCamp is worth it
                        when the work crosses four of them and you want one set of permissions over the lot, including
                        the permissions an agent inherits.{" "}
                        <Link href="/#pricing" className="text-brand underline underline-offset-4">
                            See what it costs
                        </Link>
                        .
                    </p>
                </Reveal>
            </Section>
        </>
    );
}
