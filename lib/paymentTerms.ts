import type { Pricing } from "./pricing";

/**
 * The sentence next to the pay button, and the plan code behind it.
 *
 * WHY A SENTENCE HERE AT ALL. The refund policy's first line is "We do not
 * provide refunds", and the checkout used to say only "you agree to our Refund
 * Policy" with a link. A buyer had to click through to learn there are none,
 * and the ones who did not learned it afterwards, which is the worst moment.
 * The fact belongs where the money is, in one plain sentence, for every way of
 * paying. It matters most for a year paid up front.
 *
 * Kept pure so the three cases can be tested, and so the refund guard
 * (lib/refundClaims.test.ts) has one place to read.
 */

export type Billing = "monthly" | "yearly";

/** The plan code the backend expects. Monthly is the default and sends nothing, as every older client did. */
export function cloudPlanCode(billing: Billing): string | undefined {
  return billing === "yearly" ? "onecamp_cloud_team_yearly" : undefined;
}

/** Whether the page may offer yearly at all: only once a plan exists to charge it. */
export function yearlyOffered(p: Pricing): boolean {
  return Boolean(p.cloud_yearly_configured) && p.cloud_yearly_paise > 0;
}

/** "two months free", or nothing when the yearly price does not earn the claim. */
export function yearlySaving(p: Pricing): string {
  const n = p.cloud_yearly_free_months;
  if (!yearlyOffered(p) || !n || n <= 0) return "";
  return n === 1 ? "one month free" : `${n} months free`;
}

/** What the buyer is agreeing to, stated once, plainly. */
export function paymentTerms(kind: "lifetime" | Billing): string {
  switch (kind) {
    case "lifetime":
      return "Payments are final. We do not offer refunds.";
    case "monthly":
      return "Billed monthly. Cancel any time and the workspace runs to the end of the paid month. Payments are final; we do not offer refunds.";
    case "yearly":
      return "Billed once a year. Cancel any time and the workspace runs to the end of the paid year; the remaining months are not refunded. Payments are final; we do not offer refunds.";
  }
}
