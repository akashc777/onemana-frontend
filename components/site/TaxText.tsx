"use client";

import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { taxWords } from "@/lib/pricing";

/**
 * One of taxWords' phrases, for the reader's region. A module of its own, so
 * a page that only says what the invoice is (/about) does not load every
 * regional money island (components/site/RegionalMoney).
 */
export function TaxText({ kind }: { kind: "priceLine" | "invoice" }) {
  const region = useVisitorRegion();
  return <>{taxWords(region?.inIndia)[kind]}</>;
}
