"use client";

import type { ReactNode } from "react";
import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { displayPrice, fromUsd, taxWords, type Pricing } from "@/lib/pricing";

/**
 * The money words that depend on where the reader is, for pages the server
 * renders once for everybody (the plan columns, the pricing FAQ). Each is a
 * small client island: the server's HTML has the neutral wording, and the
 * reader's own follows after mount. See hooks/useVisitorRegion.
 */

/** How a price's cadence is said to a screen reader, where it is drawn short. */
const CADENCE_SAID: Record<Cadence, string> = { "one-time": "one-time", "/mo": "a month", "/yr": "a year" };
type Cadence = "one-time" | "/mo" | "/yr";

/** "≈", read as "about": an estimate at the day's rate, not the charge. */
function About({ className }: { className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={className}>
        {"≈ "}
      </span>
      <span className="sr-only">about </span>
    </>
  );
}

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
 * its own line. Every figure is lib/pricing displayPrice's.
 *
 * The server's HTML is in dollars, before the reader is known; their own
 * money arrives after mount and cross-fades in place (opacity only). Each
 * line keeps its height through the swap (one line each, reserved), so it
 * moves nothing. `children` goes under the lines and outside the fade: the
 * Cloud size control, which must keep its focus while the price changes.
 */
export function PlanPrice({
  pricing,
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

/**
 * A price in running text, in one currency with whatever it sits beside
 * (lib/pricing displayPrice): "≈ $258 once (charged ₹24,999)" abroad,
 * "₹24,999 once" in India: a price in a sentence, a table cell or a row that
 * compares it with a rival's bill in the reader's money (PlanPrice is the
 * block on a plan's card). The "≈" is read as "about". It cross-fades in
 * place when the reader's own money arrives after mount.
 */
export function MoneyText({ pricing, inr, per = "", licence }: { pricing: Pricing; inr: number; per?: string; licence?: boolean }) {
  const region = useVisitorRegion();
  const { figure, approx, charge } = displayPrice(pricing, inr, region, { licence });
  return (
    <span key={figure} className={region ? "tabular-nums fx-fade" : "tabular-nums"}>
      {approx && <About />}
      {figure}
      {per}
      {charge && ` (charged ${charge})`}
    </span>
  );
}

/**
 * How many times less OneCamp's first year is than the per-seat stack's
 * (lib/teamCost multiple), as the moss chip the calculator and the home
 * comparison share. Nothing below twice: a small gap is said in words.
 * A line of its own in running text; an item like any other in a flex row.
 */
export function SavingChip({ multiple, className = "" }: { multiple: number; className?: string }) {
  if (!(multiple >= 2)) return null;
  return (
    <span className={`hue-moss flex h-7 w-fit items-center rounded-full bg-hue-tint px-3 text-caption font-[590] text-hue-ink ${className}`}>
      {Math.round(multiple)}× less in the first year
    </span>
  );
}
