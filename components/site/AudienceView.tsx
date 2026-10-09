import { PageHeader } from "@/components/site/PageHeader";
import { FaqItem } from "@/components/site/marketing";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Section";
import { site } from "@/lib/site";
import { FREE_SEATS } from "@/lib/freePlan";
import { dual, fmtINR, type Pricing } from "@/lib/pricing";
import type { Audience } from "@/lib/audiences";
import { ALTERNATIVES_CHECKED } from "@/lib/alternatives";

/**
 * One page for one kind of buyer, or for people leaving one rival: what fits
 * them, the price, and where to go next. Rival pages add where the rival is
 * better (with its pricing page as the source) and how to move.
 *
 * The points are a specification, not a card grid: each is a claim with the
 * mechanism behind it, so the claim sits in the margin and the detail beside
 * it. The six icon chips they used to carry said nothing the titles did not.
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

      <section className="pb-16 sm:pb-20">
        <div className="container-x">
          <dl className="border-t border-border">
            {a.points.map((p) => (
              <div key={p.title} className="grid gap-1 border-b border-border py-6 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-16">
                <dt className="font-display text-h3 font-semibold text-foreground">{p.title}</dt>
                <dd className="text-body text-muted-foreground">{p.body}</dd>
              </div>
            ))}
          </dl>

          {(a.rival || a.move) && (
            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
              {a.rival && (
                <section aria-labelledby="they-win">
                  <h2 id="they-win" className="text-h3 text-foreground">
                    Where {a.rival.name} is better
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
                <section aria-labelledby="move">
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
          )}

          <div className="mt-16 grid overflow-hidden rounded-lg border border-border bg-card sm:grid-cols-3">
            <div className="p-6">
              <p className="text-small font-medium text-muted-foreground">Own it</p>
              <p className="mt-2 font-display text-h3 font-semibold text-foreground">{lifetime} once</p>
              <p className="mt-1 text-small text-muted-foreground">Everyone on your server, for good.</p>
            </div>
            {pricing.cloud_configured && (
              <div className="border-t border-border p-6 sm:border-l sm:border-t-0">
                <p className="text-small font-medium text-muted-foreground">Or we run it</p>
                <p className="mt-2 font-display text-h3 font-semibold text-foreground">{cloud}</p>
                <p className="mt-1 text-small text-muted-foreground">Cloud, for {pricing.cloud_seats} people.</p>
              </div>
            )}
            <div className="flex items-center border-t border-border p-6 sm:border-l sm:border-t-0">
              <ButtonLink href="/pricing" variant="ghost">
                See every plan
              </ButtonLink>
            </div>
          </div>
          <p className="mt-3 text-caption text-muted-foreground">{a.priceNote} No trials or refunds: the demo and the free plan are how to try it.</p>

          <div className="mt-16 grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
            <SectionHeading title="Questions" />
            <div className="border-t border-border">
              {a.faqs.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>

          {a.proof && (
            <p className="mt-10 text-small text-muted-foreground">
              More detail:{" "}
              <a href={a.proof.href} className="link">
                {a.proof.label}
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
