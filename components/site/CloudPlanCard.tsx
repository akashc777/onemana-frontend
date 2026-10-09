"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
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
 */
export function CloudPlanCard({ pricing }: { pricing: Pricing }) {
  const choices = cloudChoices(pricing);
  const [choice, setChoice] = useState<Billing>("monthly");
  const price = choicePrice(choice, pricing);
  const seats = choice === "business" ? pricing.business_seats : pricing.cloud_seats;

  return (
    <div className="flex flex-col rounded-lg border border-border bg-card p-6 sm:p-8">
      <header>
        <p className="text-small font-medium text-muted-foreground">OneCamp Cloud, run by us</p>
        {choices.length > 1 && (
          <div
            role="radiogroup"
            aria-label="Cloud plan"
            className={`mt-4 grid gap-0.5 rounded-md border border-border bg-muted p-0.5 text-caption ${choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {choices.map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={choice === b}
                onClick={() => setChoice(b)}
                className={`rounded-sm px-2 py-1.5 font-medium transition-colors duration-150 ${choice === b ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {choiceLabel(b, pricing).split(" · ")[0]}
              </button>
            ))}
          </div>
        )}
        <p className="mt-5 flex items-baseline gap-2">
          <span className="font-display text-h2 font-semibold text-foreground">{fmtINR(price.inr)}</span>
          <span className="text-small text-muted-foreground">{price.per === "/yr" ? "a year" : "a month"}</span>
        </p>
        <p className="mt-1.5 text-caption text-muted-foreground">
          {usdEstimate(price.usd)}
          {price.usd > 0 ? " · " : ""}
          {seats} people included
          {choice === "yearly" && pricing.cloud_yearly_free_months > 0 ? ` · ${pricing.cloud_yearly_free_months} months free` : ""}
          {choice === "business" ? " · a larger machine" : ""}
        </p>
      </header>
      <ul className="mt-6 space-y-2.5 text-small text-foreground">
        {cloudBenefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
      <footer className="mt-8 border-t border-border pt-6">
        <ButtonLink href={cloudBuyHref(choice)} variant="ghost" className="w-full">
          Start with OneCamp Cloud
        </ButtonLink>
        <p className="mt-3 text-caption text-muted-foreground">
          Move between plans any time from your account.
          {storageOffered(pricing) ? ` Add ${pricing.storage_addon_gb} GB for ${dual(pricing.storage_addon_usd, pricing.storage_addon_inr)} a month when you need it.` : ""}
        </p>
      </footer>
    </div>
  );
}
