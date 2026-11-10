"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { fromUsd, taxWords, type Pricing } from "@/lib/pricing";

/**
 * The money words that depend on where the reader is, for pages the server
 * renders once for everybody (the plan columns, the pricing FAQ). Each is a
 * small client island: the server's HTML has the neutral wording, and the
 * reader's own follows after mount. See hooks/useVisitorRegion.
 */

/**
 * The line under the plan cards: what the price includes, said for the
 * reader. India: GST. Everyone else: that nothing is added, and why it is in
 * rupees.
 */
export function PricesFootnote() {
  const region = useVisitorRegion();
  if (region?.inIndia) return <>Prices include GST, and your GST invoice shows it separately.</>;
  return (
    <>
      No tax added at checkout: the rupee amount under each price is the total charged, and your card converts it.{" "}
      <a href="#currency" className="link">
        Why rupees?
      </a>
    </>
  );
}

/** The pricing FAQ's tax question and answer, for the reader. */
export function TaxQuestion({ part }: { part: "q" | "a" }) {
  const region = useVisitorRegion();
  const w = taxWords(region?.inIndia);
  return <>{part === "q" ? w.faqQ : w.faqA}</>;
}

/**
 * The Slack + Notion stack's first year for a team, in the reader's
 * money: the rivals' US-dollar list prices as they are for a dollar reader,
 * converted at the day's rate for a euro, pound or other reader, and rupees
 * for India. Never lakh grouping outside India (plan A4).
 */
export function StackCost({ pricing, usd }: { pricing: Pricing; usd: number }) {
  const region = useVisitorRegion();
  return <>About {fromUsd(pricing, usd, region)}</>;
}

/** How the stack's figure was reached, said for the currency it is shown in. */
export function StackBasis() {
  const region = useVisitorRegion();
  if (region?.inIndia) return <>at list price and today&apos;s exchange rate</>;
  if (region && region.currency !== "USD") return <>at their US-dollar list prices, converted at today&apos;s rate</>;
  return <>at their US-dollar list prices</>;
}
