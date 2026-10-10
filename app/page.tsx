import Link from "next/link";
import type { ShotNote } from "@/components/site/ProductShot";
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
import { FaqItem } from "@/components/site/marketing";
import { RecordRows } from "@/components/site/RecordRows";
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
 * then buying, in the plan columns. Nothing is centred but the final call.
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
  { x: 35.6, y: 65.8, text: "A check-in asks the channel each day, and the answers collect in one thread." },
];
export default async function HomePage() {
  const [pricing, release] = await Promise.all([getPricing(), getReleaseFacts()]);

  return (
    <>
      {/* 1. What it is, with the evidence beside it. */}
      <section className="pt-14 sm:pt-20 lg:pt-24">
        <div className="container-x">
          <h1 className="max-w-[16ch] text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-foreground sm:max-w-[20ch] sm:text-[3.5rem] lg:max-w-none lg:text-display">
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
            <HeroShot
              alt="OneCamp's #engineering channel: a release thread where the Release Captain agent reports checklist status, with the sidebar of channels, projects and docs."
              phoneAlt="OneCamp on a phone: the #engineering channel, with a reply from the Release Captain agent."
              notes={HERO_NOTES}
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

      {/* 4. The argument, shown. The id is the one the nav's "Safe AI" and old links use. */}
      <Section id="demo" tone="muted">
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
        <GuaranteeList items={governance.points} layout="row" className="mt-16" />
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
          title="Against Slack, Mattermost and Huly, row by row"
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
          <Link href="/pricing" className="link">
            Compare every plan, side by side
          </Link>
        </p>
      </Section>

      <Section id="faq" divider>
        <h2 className="text-h2 text-foreground">Before you pay</h2>
        <div className="mt-8 grid gap-x-12 md:grid-cols-2">
          {[faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))].map((col, i) => (
            <div key={i} className={`border-border ${i === 0 ? "border-t" : "md:border-t"}`}>
              {col.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          ))}
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
