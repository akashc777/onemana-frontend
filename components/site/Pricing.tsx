import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { TiltCard } from "@/components/site/TiltCard";
import { PricingComparison } from "@/components/site/PricingComparison";
import { cloudBenefits, lifetimeBenefits, savingsPitch } from "@/lib/content";
import { fmtINR, fmtUSD, type Pricing as PricingData } from "@/lib/pricing";

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Pricing section — the only place on the landing page that shows dollar amounts.
 */
export function Pricing({ pricing }: { pricing: PricingData }) {
  return (
    <div className="mt-10 space-y-10">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-brand">{savingsPitch.eyebrow}</p>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground">{savingsPitch.body}</p>
          <p className="mt-3 text-sm font-semibold tracking-tight text-foreground">{savingsPitch.highlight}</p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <PricingComparison />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <Reveal>
          <TiltCard className="pricing-card pricing-card-featured card-premium card relative flex h-full flex-col overflow-hidden border-brand/25 bg-gradient-to-b from-brand/[0.04] to-card p-6 dark:from-brand/[0.08] sm:p-7">
            <div className="premium-frame-accent absolute inset-x-0 top-0 h-px" aria-hidden />
            <header>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">Self-Host · Lifetime</p>
                <span className="rounded border border-brand/30 bg-brand/[0.08] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                  Popular
                </span>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
                  {fmtUSD(pricing.lifetime_usd)}
                </span>
                <span className="text-sm text-muted-foreground">once</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {fmtINR(pricing.lifetime_inr)} · INR · taxes included
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
          </TiltCard>
        </Reveal>

        <Reveal delay={100}>
          <TiltCard className="pricing-card card-premium card relative flex h-full flex-col p-6 sm:p-7">
            <header>
              <p className="text-sm font-medium text-muted-foreground">OneCamp Cloud · Managed</p>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">
                  {fmtUSD(pricing.cloud_usd)}
                </span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {fmtINR(pricing.cloud_inr)}/mo · up to {pricing.cloud_seats} users
              </p>
            </header>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground">
              {cloudBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check /> {b}
                </li>
              ))}
            </ul>
            <footer className="mt-8 border-t border-border/60 pt-6">
              <ButtonLink href="/buy?plan=cloud" variant="ghost" size="lg" className="w-full">
                Start with OneCamp Cloud
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-muted-foreground">Workspace live within 12 hours</p>
            </footer>
          </TiltCard>
        </Reveal>
      </div>
    </div>
  );
}