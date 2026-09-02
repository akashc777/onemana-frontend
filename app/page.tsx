import Link from "next/link";
import CostCalculator from "@/components/site/CostCalculator";
import SwitchingCosts from "@/components/site/SwitchingCosts";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { features, steps, faqs, requirements, requirementsIntro, trustPoints, whyBuilt, governance, enterpriseControls } from "@/lib/content";
import { site } from "@/lib/site";
import { getPricing } from "@/lib/pricing";
import { getGithubStars } from "@/lib/github";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/site/Reveal";
import { Pricing } from "@/components/site/Pricing";
import { GitHubStars } from "@/components/site/GitHubStars";
import { HeroMedia } from "@/components/site/HeroMedia";
import { HeroReceipt } from "@/components/site/HeroReceipt";
import { GuaranteeList } from "@/components/site/GuaranteeList";
import { HeroProductVideo } from "@/components/site/HeroProductVideo";

import { StackConvergence } from "@/components/site/StackConvergence";
import { WorkspaceShowcase } from "@/components/site/showcase/WorkspaceShowcase";
import { FeatureCard, StepCard, StatStrip, FaqItem, ControlGroup } from "@/components/site/marketing";
import { StepsConnector } from "@/components/site/StepsConnector";
import { HeroAmbient, ShimmerText, TrustStrip } from "@/components/site/PremiumVisuals";
import { StickyBuyCta } from "@/components/site/StickyBuyCta";
import { SocialProof } from "@/components/site/SocialProof";
import { SectionAmbient } from "@/components/site/SectionAmbient";
import { HeroThreeLazy } from "@/components/site/HeroThreeLazy";
import { ScrollParallax } from "@/components/site/ScrollParallax";

export const revalidate = 300;

export default async function HomePage() {
  const pricing = await getPricing();
  const stars = await getGithubStars();

  return (
    <>
      <StickyBuyCta />

      {/* Hero */}
      <section className="relative overflow-hidden pb-8 pt-14 sm:pb-12 sm:pt-20">
        <HeroAmbient />
        <HeroThreeLazy />
        <div className="container-x">
          {/* ASYMMETRIC ON PURPOSE.
              What was here was the default: centred pill badge, centred headline
              with one word in the accent colour, centred subhead, two centred
              buttons, a star pill, four icon cards. Every element symmetrical and
              every element identical to every other product's front page.

              The claim this product makes is falsifiable, which is rare enough to
              build on: an agent cannot exceed the person who authorised it, and
              the action is recorded before it happens. So the right column shows
              the record rather than a screenshot, and it shows a REFUSAL, which
              is the one thing a competitor without real authorisation cannot put
              on their page. */}
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
            <div className="max-w-xl">
              <Reveal>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-brand">
                  Self-hosted · Open-source frontend
                </p>
              </Reveal>
              <Reveal delay={60}>
                <h1 className="mt-5 text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.4rem]">
                  An agent can only do what the person behind it could.
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Checked live on every call, and written to the log before it acts. Chat, docs, tasks,
                  video and calendar come with it, in one Docker deploy, with no per-seat fees and
                  nothing leaving your network.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-center">
                  <ButtonLink href="/buy" variant="brandPremium" size="lg" className="w-full sm:w-auto">
                    Get OneCamp
                  </ButtonLink>
                  <ButtonLink href={site.demoUrl} external variant="ghost" size="lg" className="w-full sm:w-auto">
                    Try live demo
                  </ButtonLink>
                  <span className="hidden text-xs text-muted-foreground sm:ml-1 sm:inline-flex">
                    <GitHubStars className="!py-1.5" stars={stars} />
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={140} className="lg:pt-2">
              <HeroReceipt />
            </Reveal>
          </div>

          <Reveal delay={200} direction="scale" className="mx-auto mt-16 w-full max-w-6xl">
            <ScrollParallax>
              <HeroMedia />
            </ScrollParallax>
          </Reveal>
        </div>
      </section>

      <Section id="tour" divider className="overflow-hidden">
        <SectionAmbient variant="tour" />
        <SectionHeading
          eyebrow="Product tour"
          title="See it before you commit"
          subtitle="Walk through the real app: channels, AI, docs, tasks, and more. No slick mockups."
        />
        <Reveal direction="scale" className="mt-12">
          <div className="tour-video-glow relative">
            <HeroProductVideo />
          </div>
        </Reveal>
      </Section>

      {/*
        The lead argument, placed directly after the tour and BEFORE the module grid.
        Ordering is the reposition: a visitor who scrolls the modules first is being invited to compare
        each one against the category leader they already use, which is a comparison OneCamp loses nine
        times out of twelve and does not need to win. This section is the one thing no competitor here
        offers, so it goes where the modules used to be.
      */}
      <Section id="governance" divider className="overflow-hidden">
        <SectionAmbient variant="features" />
        <SectionHeading
          eyebrow={governance.eyebrow}
          title={governance.title}
          subtitle={governance.subtitle}
        />
        {/* A specification, not a card grid. These are guarantees that hold
            together and a reader can refer to one of them, so numbering is true
            rather than decorative. The pastel icon chips carried no information:
            a shield beside "an agent can only do what its author could" said
            nothing the sentence had not already said. */}
        <GuaranteeList items={governance.points} />
      </Section>

      <Section id="enterprise" divider>
        <SectionHeading
          eyebrow={enterpriseControls.eyebrow}
          title={enterpriseControls.title}
          subtitle={enterpriseControls.subtitle}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {enterpriseControls.groups.map((g, i) => (
            <ControlGroup key={g.label} label={g.label} items={g.items} index={i} />
          ))}
        </div>
      </Section>

      <Section divider className="overflow-hidden">
        <SectionAmbient variant="features" />
        <SectionHeading
          eyebrow={whyBuilt.eyebrow}
          title={whyBuilt.title}
          subtitle={whyBuilt.subtitle}
        />
        <Reveal className="mx-auto mt-8 max-w-2xl">
          <p className="text-center text-base leading-relaxed text-muted-foreground">{whyBuilt.story}</p>
        </Reveal>
        <div className="mt-12">
          <StackConvergence />
        </div>
        <div className="mt-14">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            What buyers say
          </p>
          <SocialProof />
        </div>
      </Section>

      <Section divider spacing="compact">
        <StatStrip />
      </Section>

      <Section id="features" divider className="overflow-hidden">
        <SectionHeading
          eyebrow="What's inside"
          title="The work the AI is governed over"
          subtitle="Governance is only worth something if there is real work behind it. This is the surface the agents operate on, under one login on one server."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} icon={f.icon} title={f.title} body={f.body} index={i} />
          ))}
        </div>
      </Section>

      <Section divider className="overflow-hidden">
        <SectionAmbient variant="product" />
        <SectionHeading
          eyebrow="Inside the product"
          title="What it actually looks like"
          subtitle="Ask the AI to brainstorm a mind map on the whiteboard, or build a table from a sentence. Calendars with a live now-line. Docs with someone else's cursor in them. The same UI we use at OneMana."
        />
        <Reveal direction="left" className="mt-12">
          <WorkspaceShowcase />
        </Reveal>
      </Section>

      <Section divider>
        <SectionHeading
          eyebrow="Getting started"
          title="One person installs. Everyone else logs in."
          subtitle="Most teams are up in under ten minutes. SSL, database, and AI models are handled by the installer."
        />
        <div className="relative mt-12 grid gap-5 md:grid-cols-3">
          <StepsConnector />
          {steps.map((s, i) => (
            <StepCard key={s.n} n={s.n} title={s.title} body={s.body} index={i} />
          ))}
        </div>
        <Reveal className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-center text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Works on every device.</span> Web, PWA with push notifications, no app store required.
          </div>
        </Reveal>
      </Section>

      <Section id="switching" divider>
        <SectionHeading
          eyebrow="Switching"
          title="The two things that actually stop teams moving"
          subtitle="Neither of them is price. You would lose your history, and somebody has to run it. Here are both answers, including the parts that are not flattering."
        />
        <SwitchingCosts />
      </Section>

      <Section id="pricing" divider className="overflow-hidden">
        <SectionAmbient variant="pricing" />
        <SectionHeading
          eyebrow="Pricing"
          title="Buy once, or let us host it"
          subtitle="One lifetime license for self-hosting, or fully managed OneCamp Cloud. Cloud includes a self-host license if you ever want to move."
        />
        <Pricing pricing={pricing} />

        {/* The comparison used to live as prose in the twelfth FAQ item. Cost at
            scale is the first reason teams leave per-seat tools, and what
            converts is specific arithmetic rather than adjectives, so it belongs
            under the price with the visitor's own headcount in it. */}
        <div className="container-x mt-10">
          <CostCalculator lifetimeUsd={pricing.lifetime_usd} />
        </div>

        {/* Right after the price, where somebody who just decided not to buy
            today is still on the page. That is the whole audience this list
            is for: interested, not yet convinced. */}
        <div className="container-x mt-10 max-w-xl">
          <SubscribeForm source="pricing" />
        </div>
      </Section>

      <Section divider>
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            eyebrow="Hardware"
            title="Rough sizing"
            subtitle={requirementsIntro}
          />
          <div className="mt-10 space-y-4">
            {requirements.map((r, i) => (
              <Reveal key={r.label} delay={i * 50}>
                <div className="rounded-lg border border-border bg-card px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">{r.label}</p>
                    <p className="text-sm text-muted-foreground">{r.spec}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section id="faq" divider>
        <div className="mx-auto max-w-2xl">
          <SectionHeading
            eyebrow="Questions"
            title="Before you buy"
            subtitle="The emails we actually get. Short answers."
          />
          <div className="mt-12 space-y-3">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="premium-cta px-8 py-16 text-center sm:px-12">
            <div className="premium-cta-mesh" aria-hidden />
            <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              If you can&apos;t say what your AI is allowed to do, this is for you.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
              Bounded by your permissions. Audited before it acts. On hardware you own.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/buy" variant="brandPremium" size="lg">
                Get OneCamp
              </ButtonLink>
              <ButtonLink href={site.demoUrl} external variant="ghost" size="lg">
                Try live demo
              </ButtonLink>
            </div>
            <p className="relative mt-4 text-xs text-muted-foreground">
              <Link href="#pricing" className="underline-offset-2 hover:text-foreground hover:underline">
                See pricing
              </Link>
              {" "}
              for lifetime and cloud plans
            </p>
            {/* No refund claim here. This line used to advertise a "30-day refund
                policy" and link to /refund-policy, which says in its first
                sentence that we do not provide refunds. A promise on the page a
                buyer decides from, contradicted by the page it links to, is worse
                than no promise. Unlimited users is true and is the thing that
                actually distinguishes this from per-seat pricing. */}
            <p className="relative mt-5 text-xs text-muted-foreground">
              Instant license key · GST invoice · Unlimited users
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}