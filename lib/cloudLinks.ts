/**
 * A Cloud choice and the link that opens the checkout on it. Apart from the
 * payment terms (lib/paymentTerms), so a page that only links to a Cloud
 * plan, like the cost calculator, loads these few lines and not every
 * plan's terms and names.
 */

/** What a Cloud buyer chooses: Team monthly, Team yearly, or Business (monthly). */
export type Billing = "monthly" | "yearly" | "business";

/** The checkout link for a Cloud choice, so every page opens it on that choice. */
export function cloudBuyHref(b: Billing): string {
  if (b === "business") return "/buy?plan=cloud&size=business";
  if (b === "yearly") return "/buy?plan=cloud&billing=yearly";
  return "/buy?plan=cloud";
}
