"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { displayPrice, type Pricing } from "@/lib/pricing";

/** "≈", read as "about": an estimate at the day's rate, not the charge. */
export function About({ className }: { className?: string }) {
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
 * A price in running text, in one currency with whatever it sits beside
 * (lib/pricing displayPrice): "≈ $258 once (charged ₹24,999)" abroad,
 * "₹24,999 once" in India: a price in a sentence, a table cell or a row that
 * compares it with a rival's bill in the reader's money (PlanPrice in
 * components/site/RegionalMoney is the block on a plan's card). The "≈" is
 * read as "about". It cross-fades in place when the reader's own money
 * arrives after mount. A module of its own, so a page that says one price
 * in a sentence does not load every regional money island.
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
