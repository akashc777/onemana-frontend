"use client";

import type { ReactNode } from "react";
import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { displayPrice, taxWords, type Pricing } from "@/lib/pricing";
import { useDayPricing } from "@/hooks/useDayPricing";
import { About } from "@/components/site/MoneyText";

/** How a price's cadence is said to a screen reader, where it is drawn short. */
const CADENCE_SAID: Record<Cadence, string> = { "one-time": "one-time", "/mo": "a month", "/yr": "a year" };
type Cadence = "one-time" | "/mo" | "/yr";

/**
 * A plan's price, as one block (plan cards, Cloud's sizes, the rival and
 * audience pages' two prices, the checkout's price card):
 *
 *   ≈ $258 one-time                      the reader's money at the price step,
 *                                        "≈" small and muted, the cadence in ink
 *   Charged as ₹24,999 · why rupees?     14 px, ink: what the card is charged
 *   ≈ $3.44 per person a month           Cloud only: its month for one person
 *
 * In India: "₹24,999 one-time" over "GST included". With no rate to estimate
 * with: the rupees, over "Billed in Indian rupees". The licence charged in
 * dollars abroad: the dollars, over "Charged in US dollars". Free: "Free" over
 * its own line. Every figure is lib/pricing displayPrice's, at the day's
 * rates (hooks/useDayPricing), so every page gives a plan one figure.
 *
 * The server's HTML is in dollars, before the reader is known; their own
 * money arrives after mount and cross-fades in place (opacity only). Each
 * line keeps its height through the swap (one line each, reserved), so it
 * moves nothing. `children` goes under the lines and outside the fade: the
 * Cloud size control, which must keep its focus while the price changes.
 */
export function PlanPrice({
  pricing: page,
  inr = 0,
  cadence,
  free,
  licence,
  perPerson = 0,
  why = "#currency",
  size = "card",
  live,
  className,
  children,
}: {
  pricing: Pricing;
  /** The rupee price. */
  inr?: number;
  cadence?: Cadence;
  /** The free plan's line under "Free" (no price at all). */
  free?: string;
  /** The licence: charged in dollars abroad when the backend says so (charge_usd). */
  licence?: boolean;
  /** Rupees a person a month, for the third line (lib/paymentTerms choicePerPerson). */
  perPerson?: number;
  /** Where "why rupees?" goes: #currency on /pricing, /pricing#currency elsewhere. */
  why?: string;
  /** "mini": the rival and audience pages' smaller cards. */
  size?: "card" | "mini";
  /** Say a changed price aloud (the Cloud sizes switch it in place). */
  live?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const region = useVisitorRegion();
  const pricing = useDayPricing(page);
  const price = free ? null : displayPrice(pricing, inr, region, { licence });
  const each = !free && perPerson > 0 ? displayPrice(pricing, perPerson, region, { cents: true }) : null;
  const card = size === "card";
  let charged: ReactNode;
  if (free) charged = free;
  else if (region?.inIndia) charged = taxWords(true).priceLine;
  else if (price?.approx)
    charged =
      price.chargedIn === "INR" ? (
        <>
          Charged as {price.charge} ·{" "}
          <a href={why} className="link">
            why rupees?
          </a>
        </>
      ) : (
        <>Charged as {price.charge}</>
      );
  else if (price?.chargedIn === "USD") charged = "Charged in US dollars";
  else
    charged = (
      <>
        <a href={why} className="link">
          Billed in Indian rupees
        </a>
        , your card converts
      </>
    );
  return (
    <div className={className}>
      <div aria-live={live ? "polite" : undefined}>
        <div key={`${price?.figure ?? free}|${region?.country ?? ""}`} className={region ? "fx-fade" : undefined}>
          <p className={card ? "flex min-h-10 flex-wrap items-baseline gap-x-1.5 sm:min-h-12" : "flex min-h-8 flex-wrap items-baseline gap-x-1.5"}>
            <span className="tabular-nums">
              {price?.approx && <About className={`font-sans font-[510] text-muted-foreground ${card ? "text-body-lg" : "text-body"}`} />}
              <span className={`font-display tabular-nums text-foreground ${card ? "text-price" : "text-price-sm"}`}>{price ? price.figure : "Free"}</span>
            </span>
            {cadence &&
              (cadence === "one-time" ? (
                <span className="text-body font-[510] text-foreground">one-time</span>
              ) : (
                <span className="text-body font-[510] text-foreground">
                  <span aria-hidden="true">{cadence}</span>
                  <span className="sr-only">{CADENCE_SAID[cadence]}</span>
                </span>
              ))}
          </p>
          <p className="mt-1 min-h-5 text-small text-foreground">{charged}</p>
          {each && (
            <p className="m-0 mt-0.5 text-small tabular-nums text-muted-foreground">
              {each.approx && <About />}
              {each.figure} per person a month
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
