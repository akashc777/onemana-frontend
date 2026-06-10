import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/site/Reveal";
import { cloudBenefits, lifetimeBenefits } from "@/lib/content";
import { fmtINR, fmtUSD, type Pricing as PricingData } from "@/lib/pricing";

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-cyan" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Two-plan pricing grid: Lifetime self-host + OneCamp Cloud (managed).
 *  USD is shown prominently; INR (the charge currency) is the secondary line. */
export function Pricing({ pricing }: { pricing: PricingData }) {
  return (
    <div className="mt-14 grid gap-6 lg:grid-cols-2">
      {/* Lifetime */}
      <Reveal>
        <div className="ring-border h-full">
          <div className="card flex h-full flex-col">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Self-Host · Lifetime</p>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">{fmtUSD(pricing.lifetime_usd)}</span>
              <span className="pb-1.5 text-sm text-slate-400">one-time</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {fmtINR(pricing.lifetime_inr)} · billed in INR · all taxes included
            </p>
            <ul className="mt-7 space-y-3 text-sm text-slate-300">
              {lifetimeBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <ButtonLink href="/buy" variant="ghost" size="lg" className="w-full">
                Buy lifetime license
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-slate-500">GST invoice + license key emailed instantly</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Cloud — featured */}
      <Reveal delay={80}>
        <div className="relative h-full rounded-2xl bg-gradient-to-b from-brand/60 to-accent-cyan/30 p-px shadow-[0_30px_80px_-30px_rgba(109,94,252,0.6)]">
          <div className="card flex h-full flex-col bg-canvas-raised">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">OneCamp Cloud · Managed</p>
              <span className="rounded-full bg-brand/20 px-2.5 py-1 text-xs font-semibold text-brand-light">Popular</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-bold text-white">{fmtUSD(pricing.cloud_usd)}</span>
              <span className="pb-1.5 text-sm text-slate-400">/ month</span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {fmtINR(pricing.cloud_inr)}/mo · billed in INR · up to {pricing.cloud_seats} users
            </p>
            <ul className="mt-7 space-y-3 text-sm text-slate-200">
              {cloudBenefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <Check /> {b}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <ButtonLink href="/buy?plan=cloud" variant="primary" size="lg" className="w-full">
                Start with OneCamp Cloud
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-slate-500">We&apos;ll set up your workspace within 12 hours</p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
