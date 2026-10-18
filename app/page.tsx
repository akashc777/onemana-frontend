import Link from "next/link";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { faqs, governance, whyRupees } from "@/lib/content";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { getPricing } from "@/lib/pricing";
import { getReleaseFacts, type ReleaseFacts } from "@/lib/releases";
import { Margin, MarginHeading, SECTION_END, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { GuaranteeList } from "@/components/site/GuaranteeList";
import { GovernedDemo } from "@/components/site/GovernedDemo";
import { HeroScene } from "@/components/site/showcase/HeroScene";
import { ProductTabs } from "@/components/site/ProductTabs";
import { firstTourScene } from "@/components/site/showcase/tour";
import { FactsStrip } from "@/components/site/FactsStrip";
import { AreaLegend } from "@/components/site/Areas";
import { RunSpec } from "@/components/site/RunSpec";
import { HomeComparison } from "@/components/site/HomeComparison";
import { PlanColumns } from "@/components/site/PlanColumns";
import { QuestionGroups } from "@/components/site/marketing";
import { RecordRows } from "@/components/site/RecordRows";
import { AlsoInTheBox } from "@/components/site/AlsoInTheBox";
import { CloseSpot } from "@/components/site/CloseSpot";
import { Arrow } from "@/components/ui/v3";
import { Icon } from "@/components/ui/icons";
import { SunStroke } from "@/components/ui/graphics/v3marks";
import { RepoCards } from "@/components/site/RepoCard";
import { attemptAndRefusal, recordDay } from "@/lib/recordExcerpt";
import { factsFor, getOpenSource } from "@/lib/github";
import { REPO_COPY } from "@/lib/openSource";
import { ix } from "@/lib/interactive";

export const revalidate = 300;

/**
 * The home page, design v3 (design/v3-areas/site.md §4): what it is, with the
 * product itself on the camp canvas; the facts; the product by surface; what
 * else is in the box; the argument, shown, on the page's one night section;
 * what running it involves; that it is open source, end to end; how it
 * compares; the price; the questions people ask before paying; and the
 * close, on the page's one band.
 *
 * Calls to action, in rank: the live demo (the one primary per screen),
 * Install free (secondary), then buying, in the plan columns. "See pricing"
 * moved to the nav and the facts strip. Nothing is centred.
 *
 * Motion (G5, design/site-polish/MOTION.md): the hero's copy lifts 8px on
 * load (transform only, the H1 is the LCP) and the sun stroke draws; the
 * product window rises 12px and fades in with its glow, then plays one story
 * in the app's own components (components/site/showcase) while it is on
 * screen; each section's heading rises 8px as it enters, never from hidden.
 */

/**
 * The release pill (site.md H1): the newest feature release's own headline,
 * read from GitHub, with no version number (owner rule: no version labels in
 * the copy). It opens that release's entry on /changelog, on this site and in
 * its design, never GitHub; a patch never takes it over (RELEASES.md).
 * Nothing when GitHub is silent or no release names itself. Not prefetched:
 * it is on the first screen, and the first load stays the page's own.
 */
function ReleasePill({ release }: { release: ReleaseFacts | null }) {
  if (!release?.pill) return null;
  return (
    <Link
      href={release.pill.href}
      prefetch={false}
      {...ix("card")}
      className="tap-target in-lift group mb-[22px] inline-flex h-[30px] max-w-full items-center gap-2 rounded-full bg-card pl-1 pr-3 text-caption text-muted-foreground shadow-e1"
    >
      <span className="rounded-full bg-muted px-2 text-[12px] font-[510] leading-5 text-foreground shadow-[inset_0_0_0_1px_var(--line-c)]">New</span>
      <span className="truncate">{release.pill.headline}</span>
      <Icon name="chevron-right" size={14} className="go-arrow" />
    </Link>
  );
}

/** "Open source" in a hint: the hint's own ink over a hairline, to the page that says what is open. */
function OpenSourceHint() {
  return (
    <Link href="/open-source" className="link-quiet tap-target">
      Open source
    </Link>
  );
}

/**
 * The two ways in, each with its hint (site.md H1, H11); on a phone, stacked
 * full width with one shared hint. Install free's hint says what it is free
 * to take: open source, and free for up to 25 people (the owner's ask, 15 Oct
 * 2026), "Open source" opening /open-source. Nothing else joined the hero.
 */
function WaysIn() {
  return (
    <div className="grid gap-2.5 sm:flex sm:items-start sm:gap-3">
      <div className="grid gap-2">
        <ButtonLink href={site.demoStartUrl} external variant="brand" size="xl" arrow>
          Try the live demo
        </ButtonLink>
        <span className="hidden pl-0.5 text-[12.5px] leading-4 text-muted-foreground sm:block">No sign-up · Opens in seconds</span>
      </div>
      <div className="grid gap-2">
        <ButtonLink href="/free" variant="ghost" size="xl">
          Install free
        </ButtonLink>
        <span className="hidden pl-0.5 text-[12.5px] leading-4 text-muted-foreground sm:block">
          <OpenSourceHint /> · Free for up to {FREE_SEATS} people
        </span>
      </div>
      <span className="mt-1 text-center text-[12.5px] leading-4 text-muted-foreground sm:hidden">
        <OpenSourceHint /> · No sign-up · Free for up to {FREE_SEATS} people
      </span>
    </div>
  );
}

export default async function HomePage() {
  const [pricing, release, openSource] = await Promise.all([getPricing(), getReleaseFacts(), getOpenSource()]);
  const byQ = (q: string) => faqs.find((f) => f.q === q)!;

  return (
    <>
      {/* 1. What it is (H1), with the product on the camp canvas (H2) and the facts (H3). */}
      <section className={`overflow-x-clip pt-10 sm:pt-[72px] ${SECTION_END}`}>
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
            <div className="lg:col-span-8">
              <ReleasePill release={release} />
              {/* Two tones (G2, H1): the soft half in ink-3, the claim in ink,
                  and one hand-drawn sun stroke under "own." */}
              <h1 className="in-lift at-60 max-w-[900px] text-hero text-foreground">
                <span className="text-faint dark:text-muted-foreground/80">Your team&apos;s chat, docs and calls,</span>{" "}
                <span>
                  on a server you{" "}
                  <span className="relative inline-block whitespace-nowrap">
                    own.
                    <SunStroke />
                  </span>
                </span>
              </h1>
              <p className="in-lift at-120 mt-6 max-w-[600px] text-lead text-muted-foreground">
                Like Slack, Notion and Zoom in one open-source app, with AI agents that can only do what you can.
              </p>
              <div className="in-lift at-180 mt-8">
                <WaysIn />
              </div>
            </div>

            {/* The key to the colours (v3.1): the seven areas, each in the hue it
                wears down the page. The facts it replaced are the strip's,
                under the product, so the first screen no longer says them twice. */}
            <AreaLegend className="hidden lg:col-span-4 lg:grid" />
          </div>

          <div className="mt-10 sm:mt-14 lg:pb-[104px]">
            <HeroScene />
          </div>

          <div className="mt-14">
            <FactsStrip release={release} pricing={pricing} />
          </div>
        </div>
      </section>

      {/* 2. The product, by surface (H4). Old links to #features and #tour land here. */}
      <Section id="product">
        <span id="features" aria-hidden />
        <span id="tour" aria-hidden />
        <SectionHeading
          layout="split"
          eyebrow="One app"
          title="Chat, docs, projects, calendar and agents in one app"
          subtitle="Every screen here shows the live demo's own data. Open any of them without an account."
          className="mb-8 lg:mb-10"
        />
        <ProductTabs first={firstTourScene()} />
      </Section>

      {/* 3. The breadth (H5). */}
      <Section id="also">
        <SectionHeading title="Also in the box" className="mb-10" />
        <AlsoInTheBox />
      </Section>

      {/* 4. The argument, shown, on the page's one night section (H6). The id
          is the one the nav's "Safe AI" and old links use. */}
      <Section id="demo" night>
        <span id="governance" aria-hidden />
        <SectionHeading
          layout="split"
          eyebrow="Safe AI"
          eyebrowDot="agent"
          title="Watch an agent get stopped"
          subtitle="Priya can't post in #finance. Neither can her AI agent, and the attempt is written down."
          className="mb-10"
        />
        <GovernedDemo />
        <GuaranteeList items={governance.points} layout="row" night className="mt-16" />
        <div className="mt-14 grid gap-8 border-t border-border pt-8 lg:grid-cols-12 lg:gap-x-8">
          <p className="m-0 text-body text-muted-foreground lg:col-span-5">
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
          <RecordRows
            tone="night"
            className="lg:col-span-7"
            rows={attemptAndRefusal}
            caption={<>From the live demo&apos;s record, {recordDay(attemptAndRefusal[1].at)}. Each row carries the hash of the one before it.</>}
          />
        </div>
      </Section>

      {/* 5. What running it involves (H7). Old links to #enterprise land here. */}
      <Section id="run">
        <span id="enterprise" aria-hidden />
        <Margin
          aside={
            <MarginHeading
              title="What you are signing up to run"
              subtitle="Self-hosting means somebody on your team looks after a server. This is what that involves."
            />
          }
        >
          <RunSpec />
        </Margin>
      </Section>

      {/* 6. Open source, end to end (the owner's ask, 15 Oct 2026): the four
          repositories, each a card with what GitHub says of it now, after
          what running it involves. Below the fold, drawn on the server with
          no script, so the first screen weighs what it did. */}
      <Section id="open-source">
        <SectionHeading
          layout="split"
          title="Open source, end to end"
          subtitle="The server, the web app, the desktop app and the Omarchy kit are all on GitHub."
          className="mb-8 lg:mb-10"
        />
        <RepoCards compact copies={REPO_COPY} facts={(repo) => factsFor(openSource, repo)} />
        <p className="mt-6 text-small">
          <Link href="/open-source" className="go tap-target">
            How it is licensed, and how to help <Arrow size={14} />
          </Link>
        </p>
      </Section>

      {/* 7. How it compares, including where it loses (H8). */}
      <Section id="compare">
        <SectionHeading
          title="Against a Slack and Notion stack, Mattermost and Huly"
          subtitle="The last row is the one OneCamp loses."
          className="mb-10"
        />
        <HomeComparison pricing={pricing} />
      </Section>

      {/* 8. The price (H9). */}
      <Section id="pricing">
        <SectionHeading eyebrow="Pricing" title="Free for small teams. Pay once when you grow." className="mb-10" />
        <PlanColumns pricing={pricing} />
        <p className="mt-6 text-small">
          <Link href="/pricing" className="go tap-target">
            Compare every plan <Arrow size={14} />
          </Link>
        </p>
      </Section>

      {/* 9. Before you pay (H10): three groups, answers open. */}
      <Section id="faq">
        <SectionHeading title="Before you pay" className="mb-10" />
        <QuestionGroups
          groups={[
            { label: "Paying", dot: "bg-ink-4", items: [whyRupees, byQ("I pay once. What is included?")] },
            { label: "Running it", dot: "bg-ink-4", items: [byQ("What if OneMana shuts down?"), byQ("Do you support SSO and SCIM?")] },
            { label: "AI and data", dot: "bg-agent", items: [byQ("Where does the model run?"), byQ("Can the assistant I already use work in OneCamp?")] },
          ]}
        />
      </Section>

      {/* The close (H11): the page's one band, the welcome spot with the six
          hues turning round the ring, the claim, both ways in, and a quieter
          way to keep in touch. The footer's camp flag follows straight on. */}
      <Section id="start" tone="muted">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-x-8">
          <div className="lg:col-span-4">
            <CloseSpot />
          </div>
          <div className="lg:col-span-8">
            <h2 className="reveal text-balance text-close text-foreground">
              If you can&apos;t say what your AI is allowed to do, this is for you.
            </h2>
            {/* Specified verbatim by the redesign plan's §3.4 (landingDiet.test.ts pins it). */}
            <p className="mt-5 max-w-[620px] text-lead text-muted-foreground">
              It can only do what you can. It writes down everything it does. It runs on your own server.
            </p>
            <div className="mt-8">
              {/* Try the live demo, Install free: the two ways in. */}
              <WaysIn />
            </div>
            <div className="mt-10 max-w-[560px] border-t border-border pt-6">
              <h3 className="font-sans text-caption font-[590] tracking-normal text-foreground">Release notes by email</h3>
              <div className="mt-3">
                <SubscribeForm
                  source="pricing"
                  cta="Email me updates"
                  hint="New releases and price changes, a few times a year. Unsubscribe in one click."
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
