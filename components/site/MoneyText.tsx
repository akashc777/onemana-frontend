"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { displayPrice, type Pricing } from "@/lib/pricing";

/**
 * A price in running text, in one currency with whatever it sits beside
 * (lib/pricing displayPrice): "≈ $258 once (charged ₹24,999)" abroad,
 * "₹24,999 once" in India. For a row that compares it with a rival's bill in
 * the reader's money; PriceText is for a price read on its own. The "≈" is
 * read as "about". It cross-fades in place when the reader's own money
 * arrives after mount. A module of its own, so a page that says one price
 * in a sentence does not load every regional money island
 * (components/site/RegionalMoney).
 */
export function MoneyText({ pricing, inr, per = "", licence }: { pricing: Pricing; inr: number; per?: string; licence?: boolean }) {
  const region = useVisitorRegion();
  const { figure, approx, charge } = displayPrice(pricing, inr, region, { licence });
  return (
    <span key={figure} className={region ? "tabular-nums fx-fade" : "tabular-nums"}>
      {approx && (
        <>
          <span aria-hidden="true">≈ </span>
          <span className="sr-only">about </span>
        </>
      )}
      {figure}
      {per}
      {charge && ` (charged ${charge})`}
    </span>
  );
}
