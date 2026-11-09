import Link from "next/link";
import { MONEY_RULE } from "@/lib/paymentTerms";
import { site } from "@/lib/site";

const [BEFORE, REST] = MONEY_RULE.split("live demo");
const [BETWEEN, AFTER] = (REST ?? "").split("free plan");

/**
 * The money rule (lib/paymentTerms MONEY_RULE), with the live demo and the
 * free plan as links: the one sentence under the plan cards, on the checkout
 * and on the rival and audience pages. Its size is the place's own.
 */
export function MoneyRule() {
  return (
    <>
      {BEFORE}
      <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">
        live demo
      </a>
      {BETWEEN}
      <Link href="/free" className="link">
        free plan
      </Link>
      {AFTER}
    </>
  );
}
