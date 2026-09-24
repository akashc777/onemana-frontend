import Link from "next/link";
import CostCalculator from "@/components/site/CostCalculator";
import SwitchingCosts from "@/components/site/SwitchingCosts";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { features, MODULES_ON_HOMEPAGE, steps, faqs, requirements, trustPoints, governance, enterpriseControls } from "@/lib/content";
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
import { ModuleIndex } from "@/components/site/ModuleIndex";
import { ControlIndex } from "@/components/site/ControlIndex";
import { GovernedDemo } from "@/components/site/GovernedDemo";
import { HeroProductVideo } from "@/components/site/HeroProductVideo";

import { WorkspaceShowcase } from "@/components/site/showcase/WorkspaceShowcase";
import { StepCard, FaqItem } from "@/components/site/marketing";
import { StepsConnector } from "@/components/site/StepsConnector";
import { HeroAmbient, ShimmerText, TrustStrip } from "@/components/site/PremiumVisuals";
import { StickyBuyCta } from "@/components/site/StickyBuyCta";
import { SocialProof } from "@/components/site/SocialProof";
import { SectionAmbient } from "@/components/site/SectionAmbient";

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
        {/* No WebGL. The particle sphere was the one thing on the page that
            explained nothing about the product, and it pulled three + gsap onto
            the critical path of a site whose whole job is to load fast. The
            audit receipt beside the headline is the hero artefact. */}
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
                  Chat · Docs · Tasks · Calls · AI agents, on your server
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
                  {/* The demo leads: of thirty visitors who reached checkout in
                      sixty days none bought, and the demo is the step that needs
                      no card and no server. Buying is one click further on. */}
                  <ButtonLink href={site.demoStartUrl} external variant="brandPremium" size="lg" className="w-full sm:w-auto">
                    Try the live demo
                  </ButtonLink>
                  <ButtonLink href="/buy" variant="ghost" size="lg" className="w-full sm:w-auto">
                    Get OneCamp
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
                          <HeroMedia />
          </Reveal>
        </div>
      </section>

      <Section id="tour" divider className="overflow-hidden">
        <SectionAmbient variant="tour" />
        <SectionHeading
          eyebrow="Product tour"
          title="See it before you commit"
          subtitle="Walk through the app: channels, AI, docs, tasks, and more. Built from the same components we ship."
        />
        <Reveal direction="scale" className="mt-12">
          <div className="tour-video-glow relative">
            <HeroProductVideo />
          </div>
        </Reveal>
      </Section>

      {/* Evidence straight after the tour, before any argument: two buyers in
          their own words and the one checkable fact about who runs it. It used
          to sit six sections down, under an essay on why the product exists. */}
      <Section divider spacing="compact">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          What buyers say
        </p>
        <SocialProof />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          OneMana runs its own workspace on this: {requirements[0].spec}.
        </p>
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
        {/* What used to be four more numbered essays. One line, because the
            three above carry the argument and seven of equal weight flattened
            them. The detail is a click away rather than a scroll away. */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          {governance.alsoShipped}{" "}
          <Link href={governance.alsoShippedHref} className="underline underline-offset-4 hover:text-foreground">
            Read the docs
          </Link>
        </p>
      </Section>

      {/* Section 5 of the redesign plan's IA: one path, Channel to Agent to
          Refusal to Audit. The critique's finding was a mismatch, that the site
          sells a refusal on the record and the demo it linked to opened on a
          chatbot panel, so the claim was argued in prose and then not shown.
          This is the claim itself, on the page that makes it, with the action
          name and the refusal sentence the product actually produces. */}
      <Section id="demo" divider>
        <SectionHeading
          eyebrow="The one path"
          title="Watch an agent get stopped"
          subtitle="Priya can't post in #finance. Neither can her agent, and the refusal is written down."
        />
        <Reveal className="mt-10">
          <GovernedDemo />
        </Reveal>
        {/* THE SAME PROOF PATH THE COMPARE PAGE HAS, on the page people
            actually see. Of the last 400 visitors, 361 opened this page and
            nothing else, so a route that only exists on /compare is a route
            almost nobody is offered. The drill link lands on the drill and runs
            it, rather than signing somebody in and leaving them on a home
            screen to find it; the second link is what makes the refusal
            checkable by the reader instead of asserted at them.

            On the word budget: these are link labels and clauses, all under the
            twelve-word prose floor, so app/landingWordBudget.test.ts does not
            see them and its proxy does not move. That is the systematic
            under-count its own header describes, not headroom. The rendered
            addition is about twenty words against a hand measurement of 1,042
            prose words and an aim of 1,150-1,600, so the page stays inside the
            plan's budget on the measure that counts. */}
        <p className="mt-6 text-sm text-muted-foreground">
          The live demo runs the same check.{" "}
          <Link
            href={site.demoDrillUrl()}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Run the drill yourself
          </Link>
          , then{" "}
          <Link href="/verify" className="underline underline-offset-4 hover:text-foreground">
            check the record it wrote
          </Link>
          . No account, nothing to install.
        </p>
      </Section>

      <Section id="enterprise" divider>
        <SectionHeading
          eyebrow={enterpriseControls.eyebrow}
          title={enterpriseControls.title}
          subtitle={enterpriseControls.subtitle}
        />
        {/* The heading above this is "the boxes procurement makes you tick",
            which describes a checklist rather than four cards compressed into
            narrow columns. The ticks are gone with the cards: in a section
            titled "already in the box", a tick beside every line contrasts with
            nothing. */}
        <ControlIndex groups={enterpriseControls.groups} />
      </Section>

      <Section id="features" divider className="overflow-hidden">
        <SectionHeading
          eyebrow="What's inside"
          title="The work the AI is governed over"
          subtitle="Governance is only worth something if there is real work behind it."
        />
        {/* An index rather than twelve cards. The differentiators are argued
            above this, so the honest job here is "does it have all the pieces",
            and that question wants a list somebody can scan, not a grid of
            equally weighted boxes with twelve pastel chips in twelve colours
            assigned by position. */}
        <ModuleIndex items={features.slice(0, MODULES_ON_HOMEPAGE)} />
        {/* The remaining modules are NAMED rather than hidden. A reader scanning
            for "does it do whiteboards" must not conclude it does not, and a
            "+5 more" with no names invites exactly that. */}
        <p className="mt-6 text-sm text-muted-foreground">
          Also{" "}
          {features.slice(MODULES_ON_HOMEPAGE).map((f, i, a) => (
            <span key={f.title}>
              {f.title.toLowerCase()}
              {i < a.length - 2 ? ", " : i === a.length - 2 ? " and " : ""}
            </span>
          ))}
          .{" "}
          <Link href="/docs" className="underline underline-offset-4 hover:text-foreground">
            All of it in the docs
          </Link>
        </p>
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
          subtitle="Most teams are up in under ten minutes."
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
          subtitle="Neither is price. You would lose your history, and somebody has to run it."
        />
        <SwitchingCosts />
      </Section>

      <Section id="pricing" divider className="overflow-hidden">
        <SectionAmbient variant="pricing" />
        <SectionHeading
          eyebrow="Pricing"
          title="Buy once, or let us host it"
          subtitle="One lifetime license for self-hosting, or fully managed OneCamp Cloud."
        />
        <Pricing pricing={pricing} />

        {/* The comparison used to live as prose in the twelfth FAQ item. Cost at
            scale is the first reason teams leave per-seat tools, and what
            converts is specific arithmetic rather than adjectives, so it belongs
            under the price with the visitor's own headcount in it. */}
        <div className="container-x mt-10">
          <CostCalculator lifetimeUsd={pricing.lifetime_usd} pricing={pricing} />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sizing: {requirements.map((r) => `${r.label.toLowerCase()}, ${r.spec}`).join("; ")}.{" "}
            <Link href="/docs/scale-self-hosted" className="underline underline-offset-4 hover:text-foreground">
              How it grows
            </Link>
          </p>
        </div>

        {/* Right after the price, where somebody who just decided not to buy
            today is still on the page. That is the whole audience this list
            is for: interested, not yet convinced. */}
        <div className="container-x mt-10 max-w-xl">
          <SubscribeForm
            source="pricing"
            cta="Send me the setup guide"
            hint="One email: what running your own takes, and what moves across from Jira, Slack or Asana. Unsubscribe in one click."
          />
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
            {/* Specified verbatim by the redesign plan's §3.4, which is why it is here
                and not cut. It WAS cut, as "the thesis a fourth time", and that was a
                word-count decision overriding the brief: at the close, the reader who
                scrolled past the hero without reading it needs the claim once more,
                and the plan says so. */}
            <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
              Bounded by your permissions. Audited before it acts. On hardware you own.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href={site.demoStartUrl} external variant="brandPremium" size="lg">
                Try the live demo
              </ButtonLink>
              <ButtonLink href="/buy" variant="ghost" size="lg">
                Get OneCamp
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