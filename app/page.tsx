import Link from "next/link";
import { features, steps, faqs, requirements, requirementsIntro, trustPoints, whyBuilt } from "@/lib/content";
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
import { HeroProductVideo } from "@/components/site/HeroProductVideo";

import { StackConvergence } from "@/components/site/StackConvergence";
import { WorkspaceShowcase } from "@/components/site/showcase/WorkspaceShowcase";
import { FeatureCard, StepCard, StatStrip, FaqItem } from "@/components/site/marketing";
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
          <div className="mx-auto max-w-4xl text-center">
            <Reveal>
              <Badge dot>Built by OneMana · Self-hosted · Open-source frontend</Badge>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-7 text-4xl font-semibold leading-[1.04] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.5rem]">
                <span className="block">
                  The workspace for the <ShimmerText>AI era</ShimmerText>.
                </span>
                <span className="hero-line-2 mt-1 block tracking-[-0.04em]">Yours forever.</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                One workspace that remembers what your team decides and nudges you when something slips. Chat, docs, tasks, whiteboards, video, calendar, and a local AI assistant in one Docker deploy on your server. No per-seat fees, and your data never leaves.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-9 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mx-auto sm:max-w-none sm:flex-row">
                <ButtonLink href="/buy" variant="brandPremium" size="lg" className="w-full sm:w-auto">
                  Get OneCamp
                </ButtonLink>
                <ButtonLink href={site.demoUrl} external variant="ghost" size="lg" className="w-full sm:w-auto">
                  Try live demo
                </ButtonLink>
              </div>
              <p className="mt-4 flex justify-center text-xs text-muted-foreground">
                <GitHubStars className="!py-1.5" stars={stars} />
              </p>
            </Reveal>
            <Reveal delay={240}>
              <TrustStrip points={trustPoints} />
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
          title="The modules, briefly"
          subtitle="Nine things we got tired of paying for separately. They share one login and one server."
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
          subtitle="Ask the AI to brainstorm a mind map on the whiteboard. Calendars with a live now-line. Docs with someone else's cursor in them. The same UI we use at OneMana."
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

      <Section id="pricing" divider className="overflow-hidden">
        <SectionAmbient variant="pricing" />
        <SectionHeading
          eyebrow="Pricing"
          title="Buy once, or let us host it"
          subtitle="One lifetime license for self-hosting, or fully managed OneCamp Cloud. Cloud includes a self-host license if you ever want to move."
        />
        <Pricing pricing={pricing} />
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
              If your tab bar is full of subscriptions, this is for you.
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
              One workspace on your server. No renting it forever.
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
            <p className="relative mt-5 text-xs text-muted-foreground">
              Instant license key · GST invoice ·{" "}
              <Link href="/refund-policy" className="underline-offset-2 hover:text-foreground hover:underline">
                30-day refund policy
              </Link>
            </p>
          </div>
        </Reveal>
      </Section>
    </>
  );
}