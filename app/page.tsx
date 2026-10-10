import Link from "next/link";
import type { ShotNote } from "@/components/site/ProductShot";
import type { OrbitThing } from "@/components/ui/graphics/HeroOrbit";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { faqs, governance } from "@/lib/content";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { getPricing } from "@/lib/pricing";
import { getReleaseFacts } from "@/lib/releases";
import { Margin, MarginHeading, Section, SectionHeading } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { GuaranteeList } from "@/components/site/GuaranteeList";
import { GovernedDemo } from "@/components/site/GovernedDemo";
import { HeroShot } from "@/components/site/ProductShot";
import { ProductTabs } from "@/components/site/ProductTabs";
import { FactsStrip } from "@/components/site/FactsStrip";
import { RunSpec } from "@/components/site/RunSpec";
import { HomeComparison } from "@/components/site/HomeComparison";
import { PlanColumns } from "@/components/site/PlanColumns";
import { QuestionList } from "@/components/site/marketing";
import { RecordRows } from "@/components/site/RecordRows";
import { SpotWelcome } from "@/components/ui/graphics/spots";
import { attemptAndRefusal, recordDay } from "@/lib/recordExcerpt";

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
 * a "See pricing" text link beside them, then buying, in the plan columns.
 * Nothing is centred but the final call.
 *
 * The two ideas that make it OneCamp's own page rather than a well-kept
 * template (design/audit/storefront.md): the hero's image is two real rows of
 * the product's record, chained by a hash; and the screenshots are figures,
 * on a stage, with numbered notes saying what to look at.
 */

/** What to look at in the hero screenshot, placed in percent of the wide image. */
const HERO_NOTES: ShotNote[] = [
  { x: 40, y: 32.9, text: "Release Captain is an agent, and every message it posts says so." },
  { x: 94.6, y: 35.4, text: "It reports what is done and leaves the load test open until someone posts the numbers." },
  // The demo's check-in runs Monday to Friday (oneCamp business/DemoSeed/checkins.go).
  { x: 35.6, y: 65.8, text: "A check-in asks the channel every weekday, and the answers collect in one thread." },
];
/** Real things in the hero's screenshot, named on its canvas: the channel, a person in the thread, and the agent. */
const HERO_THINGS: OrbitThing[] = [
  { label: "#engineering", kind: "channel" },
  { label: "Maya Chen", kind: "person" },
  { label: "Release Captain", kind: "agent" },
];

export default async function HomePage() {
  const [pricing, release] = await Promise.all([getPricing(), getReleaseFacts()]);

  return (
    <>
      {/* 1. What it is, with the evidence beside it. */}
      <section className="pt-14 sm:pt-20 lg:pt-24">
        <div className="container-x">
          <h1 className="max-w-[16ch] text-display-sm text-foreground sm:max-w-[20ch] sm:text-display-md lg:max-w-none lg:text-display">
            Your team&apos;s chat, docs and calls, on a server you own.
          </h1>

          <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-12 lg:gap-x-8">
            <div className="lg:col-span-6">
              <p className="max-w-xl text-body-lg text-muted-foreground">
                Like Slack, Notion and Zoom in one open-source app, with AI agents that can only do what you can.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex flex-col gap-1.5">
                  <ButtonLink href={site.demoStartUrl} external variant="brand" size="lg">
                    Try the live demo
                  </ButtonLink>
                  <span className="text-caption text-muted-foreground">No sign-up</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <ButtonLink href="/free" variant="ghost" size="lg">
                    Install free
                  </ButtonLink>
                  <span className="text-caption text-muted-foreground">Up to {FREE_SEATS} people, no card</span>
                </div>
                {/* Tertiary, and only a text link: for the visitor who came to
                    see what it costs. Without it the first way to pay was the
                    plan columns, about 5,000 px down. Level with the buttons. */}
                <Link href="/pricing" className="link inline-flex min-h-11 items-center self-start text-small font-medium">
                  See pricing
                </Link>
              </div>
            </div>

            {/* The image is the record: an agent's attempt and its refusal. */}
            <div className="lg:col-span-5 lg:col-start-8">
              <RecordRows
                rows={attemptAndRefusal}
                caption={
                  <>
                    From the live demo&apos;s record, {recordDay(attemptAndRefusal[1].at)}. Each row carries the hash of the
                    one before it.{" "}
                    <Link href="/verify" className="link">
                      Check the file yourself
                    </Link>
                  </>
                }
              />
            </div>
          </div>

          <div className="mt-16 sm:mt-20">
            {/* The canvas is #engineering's own hue (hueFor gives it sky, as the
                app does), and the three things named on it are in the shot. */}
            <HeroShot
              alt="OneCamp's #engineering channel: a release thread where the Release Captain agent reports checklist status, with the sidebar of channels, projects and docs."
              phoneAlt="OneCamp on a phone: the #engineering channel, with a reply from the Release Captain agent."
              notes={HERO_NOTES}
              hue="sky"
              things={HERO_THINGS}
            />
          </div>

          {/* 2. Facts, where a logo wall would go. */}
          <div className="mt-14">
            <FactsStrip release={release} />
          </div>
        </div>
      </section>

      {/* 3. The product, by surface. Old links to #features and #tour land here. */}
      <Section id="product">
        <span id="features" aria-hidden />
        <span id="tour" aria-hidden />
        <SectionHeading
          title="Chat, docs, tasks, calendar and agents in one app"
          subtitle="Each screen is from the live demo, which opens without an account."
          className="mb-10 lg:mb-14"
        />
        <ProductTabs />
      </Section>

      {/* 4. The argument, shown. The id is the one the nav's "Safe AI" and old links use.
          Dusk is the site's colour for agents and the record. */}
      <Section id="demo" band="dusk">
        <span id="governance" aria-hidden />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Safe AI"
              title="Watch an agent get stopped"
              subtitle="Priya can't post in #finance. Neither can her AI agent, and the attempt is written down."
            />
          </div>
          <div className="lg:col-span-7">
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
        <GuaranteeList items={governance.points} layout="row" hue="dusk" className="mt-16" />
      </Section>

      {/* 5. What running it involves. Old links to #enterprise land here. */}
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

      {/* 6. How it compares, including where it loses. */}
      <Section id="compare">
        <SectionHeading
          title="Against a Slack, Notion and Zoom stack, Mattermost and Huly"
          subtitle="The last row is the one OneCamp loses."
          className="mb-10"
        />
        <HomeComparison pricing={pricing} />
      </Section>

      {/* 7. The price, and the questions people ask before paying. */}
      <Section id="pricing">
        <SectionHeading
          eyebrow="Pricing"
          title="Free for small teams. Pay once when you grow."
          className="mb-10"
        />
        <PlanColumns pricing={pricing} />
        <p className="mt-6 text-small">
          <Link href="/pricing" className="link tap-target">
            Compare every plan, side by side
          </Link>
        </p>
      </Section>

      <Section id="faq">
        <h2 className="text-h2 text-foreground">Before you pay</h2>
        <QuestionList items={faqs} columns={2} className="mt-8" />
      </Section>

      {/* The close: the claim, the two ways in, and a quieter way to keep in
          touch. It was a centred band followed by a separate email strip, the
          last two blocks of every template; now one section on the grid, the
          claim on the left and what to do about it on the right. */}
      <Section id="start" band="sky">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-7">
            {/* The workspace's ring with its people and channels round it: the
                close's spot, on the band it sits on. */}
            <SpotWelcome size={72} className="mb-6" />
            <h2 className="text-balance text-h2 text-foreground">
              If you can&apos;t say what your AI is allowed to do, this is for you.
            </h2>
            {/* Specified verbatim by the redesign plan's §3.4 (landingDiet.test.ts pins it). */}
            <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
              It can only do what you can. It writes down everything it does. It runs on your own server.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={site.demoStartUrl} external variant="brand" size="lg">
                Try the live demo
              </ButtonLink>
              <ButtonLink href="/free" variant="ghost" size="lg">
                Install free
              </ButtonLink>
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="font-sans text-small font-medium tracking-normal text-foreground">Release notes by email</h3>
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
