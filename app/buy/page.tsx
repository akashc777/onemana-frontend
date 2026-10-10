import { BuyCheckout } from "./BuyCheckout";
import { PlanComparison } from "@/components/site/PlanComparison";
import { billingFromParams, planFromParams } from "@/lib/paymentTerms";
import { getPricing } from "@/lib/pricing";

type SearchParams = Record<string, string | string[] | undefined>;

/** A query value as one string: the first when a link repeats the key. */
function one(v: string | string[] | undefined): string | null {
  return (Array.isArray(v) ? v[0] : v) ?? null;
}

/**
 * /buy, rendered on the server for the plan the link names.
 *
 * It was one client component that read the query with useSearchParams, which
 * made Next render the whole page in the browser: the HTML said "Loading…",
 * and the price, the form and the footer arrived after the JavaScript, moving
 * the page by most of a screen (a layout shift of 0.74 on a phone). Reading
 * the query here, with the price from the same /onecamp/pricing the checkout
 * refreshes from, sends the finished page in the first response.
 *
 * Reading the query makes the page dynamic, which is right for a checkout: it
 * is rendered for the link it was opened with, and pricing stays cached for
 * five minutes inside getPricing.
 */
export default async function BuyPage({ searchParams }: { searchParams: SearchParams }) {
  const pricing = await getPricing();
  return (
    <>
      <BuyCheckout
        initialPlan={planFromParams(one(searchParams.plan))}
        // ?size=business opens on Business and ?billing=yearly on Team yearly
        // (cloudBuyHref writes them); BuyCheckout falls back to Team monthly
        // when the link names a plan that is not on sale.
        initialBilling={billingFromParams(one(searchParams.size), one(searchParams.billing))}
        initialPricing={pricing}
      />
      <PlanComparison pricing={pricing} />
    </>
  );
}
