import Link from "next/link";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { faqs, governance } from "@/lib/content";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { fmtINR, getPricing } from "@/lib/pricing";
import { getReleaseFacts } from "@/lib/releases";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { GuaranteeList } from "@/components/site/GuaranteeList";
import { GovernedDemo } from "@/components/site/GovernedDemo";
import { HeroShot } from "@/components/site/ProductShot";
import { ProductTabs } from "@/components/site/ProductTabs";
import { FactsStrip } from "@/components/site/FactsStrip";
import { RunSpec } from "@/components/site/RunSpec";
import { HomeComparison } from "@/components/site/HomeComparison";
import { PlanColumns } from "@/components/site/PlanColumns";
import { FaqItem } from "@/components/site/marketing";

export const revalidate = 300;

/**
 * The home page tells one story in seven parts (design direction, 10 Oct 2026):
 * what it is, with the product itself; the facts; the product by surface; the
 * argument, shown rather than told; what running it involves; how it compares;
 * and the price. It used to be eleven sections from one template and 12,700 px
 * tall, with a drawn mockup, a beam grid, scroll reveals, a sticky buy bar and
 * four calls to action at once.
 *
 * Calls to action, in rank: the live demo (filled), Install free (outline),
 * then buying, as a text link. Nothing is centred but the final call.
 */
export default async function HomePage() {
  const [pricing, release] = await Promise.all([getPricing(), getReleaseFacts()]);

  return (
    <>
      {/* 1. What it is, and the product itself. */}
      <section className="pt-14 sm:pt-20">
        <div className="container-x">
          <h1 className="max-w-4xl text-balance text-[2.5rem] leading-[1.08] tracking-[-0.024em] text-foreground sm:text-h1 lg:text-display">
            Slack, Notion and Zoom in one app, on your own server.
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-muted-foreground">
            OneCamp is an open-source workspace for chat, docs, tasks and calls. Its AI agents can do only what
            the person asking could do, and every attempt is on the record. Free for up to {FREE_SEATS} people.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col gap-1.5">
              <ButtonLink href={site.demoStartUrl} external variant="brand" size="lg">
                Try the live demo
              </ButtonLink>
              <span className="text-caption text-muted-foreground sm:text-center">No sign-up, 2 minutes</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <ButtonLink href="/free" variant="ghost" size="lg">
                Install free
              </ButtonLink>
              <span className="text-caption text-muted-foreground sm:text-center">Up to {FREE_SEATS} people, no card</span>
            </div>
          </div>
          <p className="mt-6 text-small text-muted-foreground">
            Ready to buy?{" "}
            <Link href="/buy" className="link">
              Buy a licence, {fmtINR(pricing.lifetime_inr)} once
            </Link>
          </p>

          <div className="mt-12 sm:mt-16">
            <HeroShot
              alt="OneCamp's #engineering channel: a release thread where the Release Captain agent reports checklist status, with the sidebar of channels, projects and docs."
              phoneAlt="OneCamp on a phone: the #engineering channel, with a reply from the Release Captain agent."
            />
          </div>

          {/* 2. Facts, where a logo wall would go. */}
          <div className="mt-12">
            <FactsStrip release={release} />
          </div>
        </div>
      </section>

      {/* 3. The product, by surface. Old links to #features and #tour land here. */}
      <Section id="product">
        <span id="features" aria-hidden />
        <span id="tour" aria-hidden />
        <SectionHeading title="Everything your team works in" subtitle="Real screens from the live demo, in your theme." className="mb-8" />
        <ProductTabs />
      </Section>

      {/* 4. The argument, shown. The id is the one the nav's "Safe AI" and old links use. */}
      <Section id="demo" divider>
        <span id="governance" aria-hidden />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Safe AI"
              title="Watch an agent get stopped"
              subtitle="Priya can't post in #finance. Neither can her AI agent, and the attempt is written down."
            />
            <GuaranteeList items={governance.points} className="mt-8" />
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start lg:pt-2">
            <GovernedDemo />
            {/* The proof path: run the same refusal in the demo, then check its record yourself. */}
            <p className="mt-4 text-small text-muted-foreground">
              The live demo runs the same check.{" "}
              <Link href={site.demoDrillUrl()} className="link">
                Run the drill yourself
              </Link>
              , then{" "}
              <Link href="/verify" className="link">
                check the record it wrote
              </Link>
              . No account, nothing to install.
            </p>
          </div>
        </div>
      </Section>

      {/* 5. What running it involves. Old links to #enterprise land here. */}
      <Section id="run" divider>
        <span id="enterprise" aria-hidden />
        <SectionHeading
          title="What you are signing up to run"
          subtitle="Self-hosting means somebody on your team looks after a server. This is what that involves."
          className="mb-8"
        />
        <RunSpec />
      </Section>

      {/* 6. How it compares, including where it loses. */}
      <Section id="compare" divider>
        <SectionHeading title="How it compares" subtitle="Facts, not ticks, and one row where OneCamp loses." className="mb-8" />
        <HomeComparison pricing={pricing} />
      </Section>

      {/* 7. The price, and the questions people ask before paying. */}
      <Section id="pricing" divider>
        <SectionHeading
          eyebrow="Pricing"
          title="Free for small teams. Pay once when you grow."
          className="mb-8"
        />
        <PlanColumns pricing={pricing} />
        <p className="mt-6 text-small">
          <Link href="/pricing" className="link">
            Compare every plan, side by side
          </Link>
        </p>
      </Section>

      <Section id="faq" divider>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
          <SectionHeading title="Before you buy" subtitle="The questions we are actually asked." />
          <div className="border-t border-border">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </Section>

      {/* The one centred block on the page: the close. */}
      <Section divider>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-h2 text-foreground">
            If you can&apos;t say what your AI is allowed to do, this is for you.
          </h2>
          {/* Specified verbatim by the redesign plan's §3.4 (landingDiet.test.ts pins it). */}
          <p className="mt-4 text-body-lg text-muted-foreground">
            It can only do what you can. It writes down everything it does. It runs on your own server.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href={site.demoStartUrl} external variant="brand" size="lg">
              Try the live demo
            </ButtonLink>
            <ButtonLink href="/free" variant="ghost" size="lg">
              Install free
            </ButtonLink>
          </div>
        </div>
      </Section>

      {/* Updates by email, as the last thing on the page rather than mid-way through it. */}
      <section className="border-t border-border">
        <div className="container-x grid gap-4 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-12">
          <div>
            <h2 className="font-sans text-small font-medium tracking-normal text-foreground">Release notes by email</h2>
            <p className="mt-1 text-small text-muted-foreground">New releases and price changes, a few times a year.</p>
          </div>
          <SubscribeForm
            source="pricing"
            cta="Email me updates"
            hint="Occasional product announcements, such as new releases and price changes. Unsubscribe in one click."
          />
        </div>
      </section>
    </>
  );
}
