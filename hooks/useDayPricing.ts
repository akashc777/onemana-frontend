import { useEffect, useState } from "react";
import { fetchPricingClient, newerPricing, ratesOutOfDate, type Pricing } from "@/lib/pricing";

/**
 * A page's pricing with the day's exchange rates, for every island that
 * draws a price in the reader's money (PlanPrice, MoneyText, the stack's
 * cost, the calculator).
 *
 * WHY. Each page is rendered at its own moment, and a page nobody has
 * opened since keeps the rates it was rendered with, while the backend's
 * move once a day. So on the day they moved, one reader read the same
 * ₹9,999 month as "≈ £80" on /pricing and "≈ £79" on a rival page. The
 * backend fetches new rates only once the stored ones are a day old, so a
 * page whose rates are younger than a day has the day's; one whose rates
 * are older asks the backend once, and every island on the page draws the
 * newer of the two (lib/pricing newerPricing). Until the answer comes, and
 * if it never does, the page's own pricing stands.
 *
 * The page's own pricing on the first render, as the server drew it, so
 * nothing differs at hydration. Not a module of "use client": only client
 * islands import it.
 */
let live: Promise<Pricing> | undefined;

/** The backend's pricing now, asked once per page load and shared by every island (and the checkout) that asks. */
export function livePricing(): Promise<Pricing> {
  return (live ??= fetchPricingClient());
}

export function useDayPricing(pricing: Pricing): Pricing {
  const [fresh, setFresh] = useState<Pricing | null>(null);
  useEffect(() => {
    if (!ratesOutOfDate(pricing)) return;
    let on = true;
    livePricing().then((p) => on && setFresh(p));
    return () => {
      on = false;
    };
  }, [pricing]);
  return newerPricing(pricing, fresh);
}
