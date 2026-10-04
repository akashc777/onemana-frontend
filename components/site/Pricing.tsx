import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { beforeYouPay, lifetimeBenefits } from "@/lib/content";
import { currencyNote, fmtINR, fmtUSD, type Pricing as PricingData } from "@/lib/pricing";
import { CloudPlanCard } from "@/components/site/CloudPlanCard";
import { FREE_SEATS } from "@/lib/freePlan";

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pricing section - the only place on the landing page that shows dollar amounts.
 */
export function Pricing({ pricing }: { pricing: PricingData }) {
  return (
    <div className="mt-10 space-y-10">
      <Reveal>
        <div className="card flex flex-col items-start justify-between gap-4 border-brand/20 bg-brand/[0.03] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <p className="text-sm font-medium text-foreground">Free for up to {FREE_SEATS} people</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything a team uses, on your own server. No card.
            </p>
          </div>
          <ButtonLink href="/free" variant="ghost" size="md" className="shrink-0">
            Start free
          </ButtonLink>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Reveal>
          <div className="pricing-card pricing-card-featured card relative flex h-full flex-col overflow-hidden border-brand/25 bg-gradient-to-b from-brand/[0.04] to-card p-6 dark:from-brand/[0.08] sm:p-7">
            <div className="premium-frame-accent absolute inset-x-0 top-0 h-px" aria-hidden />
            <header>
              {/* No "Popular" badge: nothing on the page backs it, and a site that
                  sources every claim about competitors should not make an
                  unsourced one about itself. */}
              <p className="text-sm font-medium text-foreground">Self-Host · Lifetime</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
                  {fmtUSD(pricing.lifetime_usd)}
                </span>
                <span className="text-sm text-muted-foreground">once</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {pricing.charge_usd
                  ? `Charged in US dollars · ${fmtINR(pricing.lifetime_inr)} in India`
                  : `${fmtINR(pricing.lifetime_inr)} billed in INR · taxes included`}
              </p>
            </header>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground">
              {lifetimeBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check /> {b}
                </li>
              ))}
            </ul>
            <footer className="mt-8 border-t border-border/60 pt-6">
              <ButtonLink href="/buy" variant="brandPremium" size="lg" className="w-full">
                Buy lifetime license
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-muted-foreground">License key + GST invoice emailed instantly</p>
            </footer>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <CloudPlanCard pricing={pricing} />
        </Reveal>
      </div>
      <Reveal>
        <div className="mx-auto max-w-4xl border-t border-border pt-8">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Before you pay</p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {beforeYouPay.map((b) => (
              <div key={b.title}>
                <dt className="text-sm font-medium text-foreground">{b.title}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {b.body}
                  {"href" in b && (
                    <>
                      {" "}
                      <a href={b.href} className="underline underline-offset-2 hover:text-foreground">
                        {b.link}
                      </a>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
      <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">{currencyNote(pricing)}</p>
    </div>
  );
}