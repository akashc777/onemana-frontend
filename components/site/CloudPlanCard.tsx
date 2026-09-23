"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { choiceLabel, choicePrice, cloudBuyHref, cloudChoices, storageOffered, type Billing } from "@/lib/paymentTerms";
import { cloudBenefits } from "@/lib/content";
import { dual, fmtINR, fmtUSD, type Pricing } from "@/lib/pricing";

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
    <div className="pricing-card card relative flex h-full flex-col border border-border p-6 sm:p-7">
      <header>
        <p className="text-sm font-medium text-muted-foreground">OneCamp Cloud · Managed</p>
        {choices.length > 1 && (
          <div
            role="radiogroup"
            aria-label="Cloud plan"
            className={`mt-4 grid gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-xs ${choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {choices.map((b) => (
              <button
                key={b}
                type="button"
                role="radio"
                aria-checked={choice === b}
                onClick={() => setChoice(b)}
                className={`rounded-md px-2 py-1.5 font-medium transition-colors ${choice === b ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {choiceLabel(b, pricing).split(" · ")[0]}
              </button>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-[2.75rem]">{fmtUSD(price.usd)}</span>
          <span className="text-sm text-muted-foreground">{price.per === "/yr" ? "/ year" : "/ month"}</span>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {fmtINR(price.inr)}
          {price.per} billed in INR · {seats} users included
          {choice === "yearly" && pricing.cloud_yearly_free_months > 0 ? ` · ${pricing.cloud_yearly_free_months} months free` : ""}
          {choice === "business" ? " · a larger machine" : ""}
        </p>
      </header>
      <ul className="mt-8 flex-1 space-y-3 text-sm text-foreground">
        {cloudBenefits.map((b) => (
          <li key={b} className="flex items-start gap-2.5">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>
      <footer className="mt-8 border-t border-border/60 pt-6">
        <ButtonLink href={cloudBuyHref(choice)} variant="ghost" size="lg" className="w-full">
          Start with OneCamp Cloud
        </ButtonLink>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Move between plans any time from your account.
          {storageOffered(pricing) ? ` Add ${pricing.storage_addon_gb} GB for ${dual(pricing.storage_addon_usd, pricing.storage_addon_inr)} a month when you need it.` : ""}
        </p>
      </footer>
    </div>
  );
}
