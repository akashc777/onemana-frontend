"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { BILLED_IN_RUPEES, fmtINRFor, fromUsd, localEstimate, taxWords, type Pricing } from "@/lib/pricing";

/**
 * The money words that depend on where the reader is, for pages the server
 * renders once for everybody (the plan columns, the pricing FAQ). Each is a
 * small client island: the server's HTML has the neutral wording, and the
 * reader's own follows after mount. See hooks/useVisitorRegion.
 */

/**
 * The line under a rupee price (plan A1): "≈ €224 · billed in Indian rupees,
 * your card converts", in the reader's currency, with "billed in Indian
 * rupees" linking to the answer that says why. Nothing in India.
 */
export function PriceEstimate({ pricing, inr, why = "#currency" }: { pricing: Pricing; inr: number; why?: string }) {
  const region = useVisitorRegion();
  const estimate = localEstimate(pricing, inr, region);
  if (!estimate) return null;
  const [billed, converts] = BILLED_IN_RUPEES.split(", ");
  return (
    <>
      <span className="font-medium tabular-nums">{estimate}</span>
      {" · "}
      <a href={why} className="link">
        {billed}
      </a>
      , {converts}
    </>
  );
}

/** One of taxWords' phrases, for the reader's region. */
export function TaxText({ kind }: { kind: "priceLine" | "invoice" }) {
  const region = useVisitorRegion();
  return <>{taxWords(region?.inIndia)[kind]}</>;
}

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
      No tax added at checkout: the price shown is the total charged, in Indian rupees, and your card converts it.{" "}
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
 * The Slack + Notion + Zoom stack's first year for a team, in the reader's
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

/** A rupee amount in the reader's grouping: ₹1,460,000 abroad, ₹14,60,000 in India. */
export function Rupees({ inr }: { inr: number }) {
  const region = useVisitorRegion();
  return <>{fmtINRFor(inr, region)}</>;
}
