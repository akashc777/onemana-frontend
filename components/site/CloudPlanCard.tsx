"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CloudGlyph } from "@/components/site/Glyphs";
import { PlanBenefit, PlanCard } from "@/components/site/PlanCard";
import { PLAN_HUE } from "@/components/site/planHues";
import { choiceLabel, choicePrice, cloudBuyHref, cloudChoices, storageOffered, type Billing } from "@/lib/paymentTerms";
import { cloudBenefits } from "@/lib/content";
import { dual, fmtINR, usdEstimate, type Pricing } from "@/lib/pricing";

/**
 * The Cloud card, one plan at a time.
 *
 * It used to show Team's price and then three lines of small print for
 * yearly, Business and extra storage, so the one card a buyer compares was
 * the one they had to read closely. The choice is now a switch over the same
 * plans the checkout offers (cloudChoices), with the chosen plan's price at
 * the size of the price, and a button that opens the checkout on that plan.
 *
 * It is Cloud's plan card (PlanCard, in Cloud's sky), so it reads as the same
 * plan as the column above it. The estimate and the seats are two lines, not
 * one line of middle dots.
 */
export function CloudPlanCard({ pricing, aligned = false }: { pricing: Pricing; aligned?: boolean }) {
  const choices = cloudChoices(pricing);
  const [choice, setChoice] = useState<Billing>("monthly");
  const price = choicePrice(choice, pricing);
  const seats = choice === "business" ? pricing.business_seats : pricing.cloud_seats;
  const extra =
    choice === "yearly" && pricing.cloud_yearly_free_months > 0
      ? `, ${pricing.cloud_yearly_free_months} months free`
      : choice === "business"
        ? ", on a larger machine"
        : "";

  return (
    <PlanCard hue={PLAN_HUE.cloud} Glyph={CloudGlyph} title="OneCamp Cloud" fits="Run by us" titleAs="p" aligned={aligned}>
      {/* Six parts, as the licence beside it: the price, the estimate, who
          it is for (the plan switch and its seats), the list, the button
          and the note. */}
      <p className="flex items-baseline gap-2">
        <span className="font-display text-h2 font-semibold tabular-nums text-foreground">{fmtINR(price.inr)}</span>
        <span className="text-small text-muted-foreground">{price.per === "/yr" ? "a year" : "a month"}</span>
      </p>
      <p className="mt-1 min-h-5 text-caption text-muted-foreground">{usdEstimate(price.usd)}</p>
      {/* Who it is for, level with the licence's line beside it; the
          switch under it changes it. */}
      <div className="mt-1">
        <p className="text-small text-foreground">
          {seats} people included{extra}
        </p>
        {choices.length > 1 && (
          <div
            role="radiogroup"
            aria-label="Cloud plan"
            className={`mt-3 grid gap-0.5 rounded-md border border-border bg-muted p-0.5 text-caption ${choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {choices.map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={choice === b}
                onClick={() => setChoice(b)}
                className={`min-h-11 rounded-sm px-2 py-1.5 font-medium transition-colors sm:min-h-0 ${choice === b ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {choiceLabel(b, pricing).split(" · ")[0]}
              </button>
            ))}
          </div>
        )}
      </div>
      <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5 text-small text-foreground">
        {cloudBenefits.map((b) => (
          <PlanBenefit key={b}>{b}</PlanBenefit>
        ))}
      </ul>
      <div className="mt-6">
        <ButtonLink href={cloudBuyHref(choice)} variant="ghost" className="w-full">
          Start with OneCamp Cloud
        </ButtonLink>
      </div>
      <p className="mt-3 text-caption text-muted-foreground">
        Move between plans any time from your account.
        {storageOffered(pricing) ? ` Add ${pricing.storage_addon_gb} GB for ${dual(pricing.storage_addon_usd, pricing.storage_addon_inr)} a month when you need it.` : ""}
      </p>
    </PlanCard>
  );
}
