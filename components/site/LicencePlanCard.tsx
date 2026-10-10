import { ButtonLink } from "@/components/ui/Button";
import { KeyGlyph } from "@/components/site/Glyphs";
import { PlanBenefit, PlanCard } from "@/components/site/PlanCard";
import { PLAN_HUE } from "@/components/site/planHues";
import { lifetimeBenefits } from "@/lib/content";
import { fmtINR, usdEstimate, type Pricing } from "@/lib/pricing";
import { TaxText } from "@/components/site/RegionalMoney";

/**
 * The licence, in detail: the licence's plan card (PlanCard, in its sun), the
 * pair of CloudPlanCard on /pricing. Its body is the same six parts as
 * Cloud's (price, estimate, who it is for, the list, the button, the note),
 * so side by side each part starts level with Cloud's.
 */
export function LicencePlanCard({ pricing, aligned = false }: { pricing: Pricing; aligned?: boolean }) {
  return (
    <PlanCard hue={PLAN_HUE.lifetime} Glyph={KeyGlyph} title="The licence" fits="On your own server" titleAs="p" aligned={aligned}>
      <p className="flex items-baseline gap-2">
        <span className="font-display text-h2 font-semibold tabular-nums text-foreground">{fmtINR(pricing.lifetime_inr)}</span>
        <span className="text-small text-muted-foreground">once</span>
      </p>
      <p className="mt-1 min-h-5 text-caption text-muted-foreground">{usdEstimate(pricing.lifetime_usd)}</p>
      <p className="mt-1 text-small text-foreground">Any number of people</p>
      <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5 text-small text-foreground">
        {lifetimeBenefits.map((b) => (
          <PlanBenefit key={b}>{b}</PlanBenefit>
        ))}
      </ul>
      <div className="mt-6">
        <ButtonLink href="/buy" variant="brand" className="w-full">
          Buy a licence
        </ButtonLink>
      </div>
      <p className="mt-3 text-caption text-muted-foreground">The key and <TaxText kind="invoice" /> arrive by email straight away.</p>
    </PlanCard>
  );
}
