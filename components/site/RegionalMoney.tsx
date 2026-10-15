"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { BILLED_IN_RUPEES, fmtINRFor, fromUsd, localEstimate, priceWithEstimate, taxWords, type Pricing } from "@/lib/pricing";

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

/**
 * THE PRICE BLOCK'S TWO FIXED LINES (site.md S14). A 36px block reserved on
 * every card, Free's included, so the currency swap after mount never moves
 * anything (CLS 0):
 *
 *   ≈ $258                                    (13, ink, the figure at 590)
 *   Billed in Indian rupees, your card converts (13, ink-2, linking to why)
 *
 * India sees "GST included" and no estimate; Free carries its own line.
 * The figure sits in a 7ch tabular span, so dollars, euros or pounds never
 * reflow, and it cross-fades in place (opacity only) when the reader's own
 * currency arrives. No count-up: a number that moves reads as a deal timer.
 */
export function PriceLines({ pricing, inr, why = "#currency", free }: { pricing: Pricing; inr: number; why?: string; free?: string }) {
  const region = useVisitorRegion();
  if (free) {
    return (
      <span className="block h-9 text-caption text-muted-foreground">
        <span className="block">{free}</span>
      </span>
    );
  }
  const estimate = localEstimate(pricing, inr, region);
  const [billed, converts] = BILLED_IN_RUPEES.split(", ");
  return (
    <span className="block h-9 text-caption">
      {region?.inIndia ? (
        <>
          <span className="block">&nbsp;</span>
          <span className="block text-muted-foreground">GST included</span>
        </>
      ) : (
        <>
          <span key={estimate} className={`inline-block min-w-[7ch] font-[590] tabular-nums text-foreground ${region ? "fx-fade" : ""}`}>
            {estimate}
          </span>
          <span className="sr-only"> · </span>
          <span className="block text-muted-foreground first-letter:uppercase">
            <a href={why} className="link text-muted-foreground decoration-current/40">
              {billed}
            </a>
            , {converts}
          </span>
        </>
      )}
    </span>
  );
}

/**
 * A rupee price in running text with the estimate beside it, in the reader's
 * money (lib/pricing priceWithEstimate): "From ₹9,999/mo (≈ £77)". The plan
 * table's prices, so a reader meets the cards' own estimate there too.
 */
export function PriceText({ pricing, inr, per, lead = "" }: { pricing: Pricing; inr: number; per?: string; lead?: string }) {
  const region = useVisitorRegion();
  return (
    <>
      {lead}
      {priceWithEstimate(pricing, inr, region, per)}
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
