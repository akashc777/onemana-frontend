import { PageHeader } from "@/components/site/PageHeader";
import { QuestionList } from "@/components/site/marketing";
import { ProductName } from "@/components/site/ProductName";
import { FEATURE_MARK } from "@/components/site/featureMarks";
import { PLAN_HUE } from "@/components/site/planHues";
import { ButtonLink } from "@/components/ui/Button";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
import { Tile } from "@/components/ui/graphics/Tile";
import { SpotImported } from "@/components/ui/graphics/spots";
import { productHue } from "@/components/site/productHues";
import { SECTION_END, Section, SectionHeading } from "@/components/ui/Section";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { dual, fmtINR, type Pricing } from "@/lib/pricing";
import type { Audience } from "@/lib/audiences";
import { ALTERNATIVES_CHECKED } from "@/lib/alternatives";
import { RecordRows } from "@/components/site/RecordRows";
import { attemptAndRefusal } from "@/lib/recordExcerpt";
import Link from "next/link";

/**
 * One page for one kind of buyer, or for people leaving one rival: what fits
 * them, the price, and where to go next. Rival pages add where the rival is
 * better (with its pricing page as the source) and how to move.
 *
 * The points are a specification, not a card grid: each is a claim with the
 * mechanism behind it, the claim in the margin and the detail beside it. Each
 * claim carries a tile in its feature's hue (featureMarks.ts: the same hue for
 * the same kind of feature on every page), the rival carries its identity
 * mark (the colour it has in every comparison table), and the two prices
 * carry their plans' hues. On the compliance page the record sits on the dusk
 * band, the site's colour for agents and the record.
 */
export function AudienceView({ a, pricing }: { a: Audience; pricing: Pricing }) {
  const lifetime = a.prices === "inr" ? fmtINR(pricing.lifetime_inr) : dual(pricing.lifetime_usd, pricing.lifetime_inr);
  const cloud =
    a.prices === "inr" ? `${fmtINR(pricing.cloud_inr)} a month` : dual(pricing.cloud_usd, pricing.cloud_inr, " a month");
  return (
    <>
      <PageHeader eyebrow={a.eyebrow} title={a.title} subtitle={a.subtitle}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={a.demo ? site.demoUrlTo(a.demo) : site.demoStartUrl} external variant="brand" size="lg">
            Try the live demo
          </ButtonLink>
          <ButtonLink href="/free" variant="ghost" size="lg">
            Install free, up to {FREE_SEATS} people
          </ButtonLink>
        </div>
      </PageHeader>

      <section className={SECTION_END}>
        <div className="container-x">
          <dl className="border-t border-border">
            {a.points.map((p) => {
              const mark = FEATURE_MARK[p.icon];
              return (
                <div key={p.title} className="grid gap-2 border-b border-border py-6 md:grid-cols-12 md:gap-x-8">
                  <dt className="flex items-start gap-3 md:col-span-4 md:pr-6">
                    <Tile hue={mark.hue} size="md" className="mt-0.5">
                      <mark.Glyph />
                    </Tile>
                    <span className="font-display text-h3 font-semibold text-balance text-foreground">{p.title}</span>
                  </dt>
                  <dd className="text-body text-muted-foreground md:col-span-8 md:pt-0.5">{p.body}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      {/* Where the rival is better and how to move from it, on the rival's own
          hue (the colour its mark has in every comparison), with the spot for
          an import that finished. */}
      {(a.rival || a.move) && (
        <Section band={a.rival ? productHue(a.rival.name) : "moss"}>
          <SpotImported size={64} hue={a.rival ? productHue(a.rival.name) : "moss"} className="mb-6" />
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-8">
            {a.rival && (
              <section aria-labelledby="they-win" className="lg:col-span-6">
                <h2 id="they-win" className="text-h3 text-foreground">
                  <ProductName name={a.rival.name}>Where {a.rival.name} is better</ProductName>
                </h2>
                <ul className="mt-4 border-t border-border">
                  {a.rival.theyWin.map((w) => (
                    <li key={w} className="border-b border-border py-3 text-small text-foreground">
                      {w}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-small text-muted-foreground">
                  <span className="font-medium text-foreground">How it&apos;s billed:</span> {a.rival.billing}{" "}
                  <a href={a.rival.source} target="_blank" rel="noopener noreferrer" className="link">
                    Their pricing
                  </a>
                  , read {ALTERNATIVES_CHECKED}.
                </p>
              </section>
            )}
            {a.move && (
              <section aria-labelledby="move" className="lg:col-span-6">
                <h2 id="move" className="text-h3 text-foreground">
                  {a.move.title}
                </h2>
                <ol className="mt-4 border-t border-border">
                  {a.move.steps.map((step, i) => (
                    <li key={step} className="grid grid-cols-[2rem_1fr] border-b border-border py-3 text-small text-foreground">
                      <span className="font-mono tabular-nums text-muted-foreground">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        </Section>
      )}

      {/* The evidence, on the page that sells it: rows of the demo's record. */}
      {a.slug === "compliance" && (
        <Section band="dusk">
          <div className="grid gap-8 md:grid-cols-12 md:gap-x-8">
            <h2 className="text-h3 text-foreground md:col-span-4 md:pr-6">What the record looks like</h2>
            <div className="min-w-0 md:col-span-8">
              <RecordRows
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
        {/* The price as two plain figures and a link, each with its plan's
            hue: a three-cell card with a button in the last cell was a
            pricing table in miniature. */}
        <div className="border-t border-border pt-8">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-end sm:gap-x-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="flex items-center gap-2 text-small text-muted-foreground">
                <IdentityMark hue={PLAN_HUE.lifetime} variant="square" />
                Own it
              </p>
              <p className="mt-1 font-display text-h3 font-semibold text-foreground">{lifetime} once</p>
              <p className="mt-0.5 text-small text-muted-foreground">Everyone on your server, for good.</p>
            </div>
            {pricing.cloud_configured && (
              <div className="lg:col-span-5">
                <p className="flex items-center gap-2 text-small text-muted-foreground">
                  <IdentityMark hue={PLAN_HUE.cloud} variant="square" />
                  Or we run it
                </p>
                <p className="mt-1 font-display text-h3 font-semibold text-foreground">{cloud}</p>
                <p className="mt-0.5 text-small text-muted-foreground">Cloud, for {pricing.cloud_seats} people.</p>
              </div>
            )}
            <div className="sm:col-span-2 lg:col-span-3 lg:justify-self-end">
              <Link href="/pricing" className="link tap-target text-small font-medium">
                See every plan
              </Link>
            </div>
          </div>
          <p className="mt-4 text-caption text-muted-foreground">{a.priceNote} No trials or refunds: the demo and the free plan are how to try it.</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:gap-x-8">
          <SectionHeading title="Questions" className="lg:col-span-4" />
          <QuestionList items={a.faqs} className="lg:col-span-8" />
        </div>

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
