import type { CSSProperties } from "react";
import Link from "next/link";
import { QuestionAccordion } from "@/components/site/marketing";
import { ProductName } from "@/components/site/ProductName";
import { FEATURE_MARK } from "@/components/site/featureMarks";
import { PLAN_HUE } from "@/components/site/planHues";
import { Scene } from "@/components/site/showcase/Scene";
import { AUDIENCE_SCENES, type AudienceSceneKind } from "@/components/site/showcase/audience";
import { ButtonLink } from "@/components/ui/Button";
import { Tile } from "@/components/ui/graphics/Tile";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { SpotImported } from "@/components/ui/graphics/spots";
import { productHue } from "@/components/site/productHues";
import { Margin, MarginHeading, SECTION_END, Section } from "@/components/ui/Section";
import { Arrow, CampCanvas, Dot } from "@/components/ui/v3";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { fmtINR, type Pricing } from "@/lib/pricing";
import { PriceLines } from "@/components/site/RegionalMoney";
import type { Audience } from "@/lib/audiences";
import type { CampHue } from "@/lib/campHue";
import { ALTERNATIVES_CHECKED } from "@/lib/alternatives";
import { RecordRows } from "@/components/site/RecordRows";
import { attemptAndRefusal } from "@/lib/recordExcerpt";

/** The audiences' own hues (site.md §9): agencies berry, compliance dusk, India sun. */
const AUDIENCE_HUE: Record<string, CampHue> = { agencies: "berry", compliance: "dusk", india: "sun" };

/** The surface nearest each page's subject, drawn as the app draws it on a phone. */
function sceneFor(a: Audience): AudienceSceneKind {
  const r = a.rival?.name ?? "";
  if (a.slug === "compliance") return "agents";
  if (/Notion/.test(r)) return "docs";
  if (/Asana|ClickUp|monday|Basecamp|Toggl/.test(r)) return "tasks";
  if (a.slug === "india") return "calendar";
  return "chat";
}

/**
 * One page for one kind of buyer, or for people leaving one rival (site.md
 * §9): the page's camp canvas with the claim and the product beside it (the
 * app's own phone scene for the subject, components/site/showcase), the
 * points as a specification with a tile in each feature's hue, where the
 * rival is better and how to move (on the rival's own band, in two raised
 * cards), the record on a night card for compliance, the price as two mini
 * plan cards, and questions as accordions. The page hue is the rival's
 * identity colour or the audience's; the canvas's glow takes it.
 */
export function AudienceView({ a, pricing }: { a: Audience; pricing: Pricing }) {
  const hue: CampHue = a.rival ? productHue(a.rival.name) : (AUDIENCE_HUE[a.slug] ?? "sky");
  const scene = AUDIENCE_SCENES[sceneFor(a)];
  return (
    <>
      {/* AU1: the header on the page's camp canvas, its glow in the page hue. */}
      <section className="pt-6 sm:pt-10">
        <div className="container-x">
          <div className={HUE_CLASS[hue]} style={{ "--page-glow": "var(--hue)" } as CSSProperties}>
            <CampCanvas rings="quiet" className="rounded-[20px] px-5 pb-5 pt-10 sm:rounded-4xl sm:px-10 sm:pb-10 sm:pt-14 lg:py-10">
              <div className="grid h-full gap-8 lg:grid-cols-12 lg:items-center lg:gap-x-8">
                <div className="lg:col-span-7">
                  <p className="eyebrow in-lift [--eyebrow-dot:rgb(var(--hue))]">{a.eyebrow}</p>
                  <h1 className="in-lift text-balance text-page text-foreground">{a.title}</h1>
                  <p className="in-lift at-60 mt-5 max-w-[600px] text-lead text-muted-foreground">{a.subtitle}</p>
                  <div className="in-lift at-120 mt-8 grid gap-2.5 sm:flex sm:gap-3">
                    <ButtonLink href={a.demo ? site.demoUrlTo(a.demo) : site.demoStartUrl} external variant="brand" size="xl" arrow>
                      Try the live demo
                    </ButtonLink>
                    <ButtonLink href="/free" variant="ghost" size="xl">
                      Install free, up to {FREE_SEATS} people
                    </ButtonLink>
                  </div>
                </div>
                {/* One window, whole: the phone scene, never cropped. */}
                <div className="flex justify-center lg:col-span-5 lg:justify-end">
                  <div className="in-rise w-full max-w-[400px] lg:max-w-[320px]">
                    <Scene w={scene.w} h={scene.h} label={scene.label} script={scene.script}>
                      {scene.render()}
                    </Scene>
                  </div>
                </div>
              </div>
            </CampCanvas>
          </div>
        </div>
      </section>

      {/* AU2: the points, a claim with its mechanism, each with its feature's tile. */}
      <section className={`pt-16 sm:pt-24 ${SECTION_END}`}>
        <div className="container-x">
          <dl className="m-0 border-t border-border">
            {a.points.map((p) => {
              const mark = FEATURE_MARK[p.icon];
              return (
                <div key={p.title} className="reveal group grid min-h-[72px] gap-2 border-b border-border py-6 md:grid-cols-12 md:gap-x-8">
                  <dt className="flex items-start gap-3.5 md:col-span-4 md:pr-6">
                    <Tile hue={mark.hue} size="lg" className="mt-0.5 transition-transform duration-spring ease-spring group-hover:-rotate-6">
                      <mark.Glyph />
                    </Tile>
                    <span className="pt-1.5 text-[17px] font-[590] leading-6 text-balance text-foreground">{p.title}</span>
                  </dt>
                  <dd className="m-0 text-body text-muted-foreground md:col-span-7 md:pt-1.5">{p.body}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* AU3: where the rival is better and how to move from it, two raised
          cards on the rival's own band; the spot for a finished import heads
          the moving card, where it used to float alone above both. */}
      {(a.rival || a.move) && (
        <Section band={hue}>
          <div className="grid gap-4 lg:grid-cols-12 lg:gap-x-6">
            {a.rival && (
              <section aria-labelledby="they-win" className="reveal rounded-2xl bg-card p-6 shadow-e1 lg:col-span-6">
                <h2 id="they-win" className="text-h3 text-foreground">
                  <ProductName name={a.rival.name}>Where {a.rival.name} is better</ProductName>
                </h2>
                <ul className="m-0 mt-5 list-none border-t border-border p-0">
                  {a.rival.theyWin.map((w, i) => (
                    <li key={w} className="flex items-start justify-between gap-3 border-b border-border py-3 text-small text-foreground last:border-0">
                      <span>{w}</span>
                      {i === 0 && <span className="hue-berry inline-flex h-[22px] shrink-0 items-center rounded-md bg-hue-tint px-2 text-[12px] font-[510] text-hue-ink">We lose this one</span>}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-small text-muted-foreground">
                  <span className="font-[510] text-foreground">How it&apos;s billed:</span> {a.rival.billing}{" "}
                  <a href={a.rival.source} target="_blank" rel="noopener noreferrer" className="link">
                    Their pricing
                  </a>
                  , read {ALTERNATIVES_CHECKED}.
                </p>
              </section>
            )}
            {a.move && (
              <section aria-labelledby="move" className="reveal rounded-2xl bg-card p-6 shadow-e1 lg:col-span-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="move" className="text-h3 text-foreground">
                    {a.move.title}
                  </h2>
                  <SpotImported size={64} hue={hue} className="-my-3 -mr-1 shrink-0" />
                </div>
                <ol className="m-0 mt-5 list-none space-y-4 border-t border-border p-0 pt-5">
                  {a.move.steps.map((step, i) => (
                    <li key={step} className="grid grid-cols-[28px_1fr] gap-3 text-small text-foreground">
                      <span className="hue-moss flex size-7 items-center justify-center rounded-full bg-hue text-caption font-[590] tabular-nums text-white">{i + 1}</span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
                <Link href="/docs/import-from-other-tools" className="go tap-target mt-5">
                  Import guide <Arrow size={14} />
                </Link>
              </section>
            )}
          </div>
        </Section>
      )}

      {/* AU4: the evidence, on the page that sells it, as a compact night card. */}
      {a.slug === "compliance" && (
        <Section>
          <div data-record className="night grid gap-8 rounded-2xl p-6 shadow-e3 sm:p-8 md:grid-cols-12 md:gap-x-8">
            <h2 className="text-h3 text-foreground md:col-span-4 md:pr-6">What the record looks like</h2>
            <div className="min-w-0 md:col-span-8">
              <RecordRows
                tone="night"
                rows={attemptAndRefusal}
                caption={
                  <>
                    Two rows from the live demo. The second carries the first one&apos;s hash.{" "}
                    <Link href="/verify" className="link">
                      Check the file yourself
                    </Link>
                  </>
                }
              />
            </div>
          </div>
        </Section>
      )}

      <Section>
        {/* AU5: the price as two mini plan cards, each in its plan's hue. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lift rounded-xl bg-card p-5 shadow-e1 lg:col-span-5">
            <p data-hue={PLAN_HUE.lifetime} className="m-0 flex items-center gap-2 text-body font-[590] text-foreground">
              <Dot hue={PLAN_HUE.lifetime} />
              Own it
            </p>
            {/* The price at 28/32 and the two-line estimate under it (site.md
                AU5, S14): "(about $258)" at the price's size wrapped a phone
                onto two heavy lines. */}
            <MiniPrice price={fmtINR(pricing.lifetime_inr)} per="once" />
            <div className="mt-1.5">
              <PriceLines pricing={pricing} inr={pricing.lifetime_inr} why="/pricing#currency" />
            </div>
            <p className="mt-2 text-small text-muted-foreground">Everyone on your server, for good.</p>
            <ButtonLink href="/buy" variant="ghost" size="sm" className="mt-4 max-md:min-h-11">
              Buy a licence
            </ButtonLink>
          </div>
          {pricing.cloud_configured && (
            <div className="lift rounded-xl bg-card p-5 shadow-e1 lg:col-span-5">
              <p data-hue={PLAN_HUE.cloud} className="m-0 flex items-center gap-2 text-body font-[590] text-foreground">
                <Dot hue={PLAN_HUE.cloud} />
                Or we run it
              </p>
              <MiniPrice price={fmtINR(pricing.cloud_inr)} per="a month" />
              <div className="mt-1.5">
                <PriceLines pricing={pricing} inr={pricing.cloud_inr} why="/pricing#currency" />
              </div>
              <p className="mt-2 text-small text-muted-foreground">Cloud, for {pricing.cloud_seats} people.</p>
              <ButtonLink href="/buy?plan=cloud" variant="ghost" size="sm" className="mt-4 max-md:min-h-11">
                Choose Cloud
              </ButtonLink>
            </div>
          )}
          <div className="flex items-end sm:col-span-2 lg:col-span-2 lg:justify-end">
            <Link href="/pricing" className="go tap-target">
              See every plan <Arrow size={14} />
            </Link>
          </div>
        </div>
        <p className="mt-5 text-caption text-muted-foreground">{a.priceNote} No trials or refunds: the demo and the free plan are how to try it.</p>

        {/* AU6: questions as accordions, the plus in the page hue. */}
        <Margin className="mt-20" aside={<MarginHeading title="Questions" />}>
          <div className={HUE_CLASS[hue]}>
            <QuestionAccordion items={a.faqs} plus="text-hue" />
          </div>
        </Margin>

        {a.proof && (
          <p className="mt-10 text-small text-muted-foreground">
            More detail:{" "}
            <a href={a.proof.href} className="link">
              {a.proof.label}
            </a>
          </p>
        )}
      </Section>
    </>
  );
}

/** A mini plan card's price (site.md AU5): 28/32 at 600, tabular, with "once" or "a month" on its baseline. */
function MiniPrice({ price, per }: { price: string; per: string }) {
  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
      <span className="font-display text-price-sm tabular-nums text-foreground">{price}</span>
      <span className="text-body text-muted-foreground">{per}</span>
    </p>
  );
}
