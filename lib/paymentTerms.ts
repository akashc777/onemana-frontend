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

/** What a Cloud buyer chooses: Team monthly, Team yearly, or Business (monthly). */
export type Billing = "monthly" | "yearly" | "business";

/** The plan code the backend expects. Monthly is the default and sends nothing, as every older client did. */
export function cloudPlanCode(billing: Billing): string | undefined {
  if (billing === "yearly") return "onecamp_cloud_team_yearly";
  if (billing === "business") return "onecamp_cloud_business";
  return undefined;
}

/** Whether Business is on sale: only once a plan exists to charge it. */
export function businessOffered(p: Pricing): boolean {
  return Boolean(p.business_configured) && p.business_paise > 0;
}

/** The Cloud choices on sale, Team monthly first, in the order the page shows them. */
export function cloudChoices(p: Pricing): Billing[] {
  const out: Billing[] = ["monthly"];
  if (yearlyOffered(p)) out.push("yearly");
  if (businessOffered(p)) out.push("business");
  return out;
}

/** A choice's price and period, as the header shows it. */
export function choicePrice(b: Billing, p: Pricing): { inr: number; usd: number; per: "/mo" | "/yr" } {
  if (b === "yearly") return { inr: p.cloud_yearly_inr, usd: p.cloud_yearly_usd, per: "/yr" };
  if (b === "business") return { inr: p.business_inr, usd: p.business_usd, per: "/mo" };
  return { inr: p.cloud_inr, usd: p.cloud_usd, per: "/mo" };
}

/** A choice's name on its button. */
export function choiceLabel(b: Billing, p: Pricing): string {
  if (b === "business") return `Business · ${p.business_seats} users`;
  const saving = yearlySaving(p);
  if (b === "yearly") return saving ? `Team yearly · ${saving}` : "Team yearly";
  return `Team · ${p.cloud_seats} users`;
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
export function paymentTerms(kind: "lifetime" | "addon" | Billing): string {
  switch (kind) {
    case "lifetime":
      return "Payments are final. We do not offer refunds.";
    case "addon":
      return "Billed monthly alongside your workspace. Cancel any time and it runs to the end of the paid month. Payments are final; we do not offer refunds.";
    case "business":
      return "Billed monthly. Cancel any time and the workspace runs to the end of the paid month; you can move down to Team at a renewal. Payments are final; we do not offer refunds.";
    case "monthly":
      return "Billed monthly. Cancel any time and the workspace runs to the end of the paid month. Payments are final; we do not offer refunds.";
    case "yearly":
      return "Billed once a year. Cancel any time and the workspace runs to the end of the paid year; the remaining months are not refunded. Payments are final; we do not offer refunds.";
  }
}

/** Whether extra storage can be bought: a plan exists and a price is set. */
export function storageOffered(p: Pricing): boolean {
  return Boolean(p.storage_addon_configured) && p.storage_addon_paise > 0 && p.storage_addon_gb > 0;
}

/** What the Razorpay window says is being bought, for each Cloud plan. */
export function cloudCheckoutDescription(planCode?: string): string {
  switch (planCode) {
    case "onecamp_cloud_team_yearly":
      return "Managed hosting, Team, yearly (includes a self-host license)";
    case "onecamp_cloud_business":
      return "Managed hosting, Business, monthly (includes a self-host license)";
  }
  return "Managed hosting, Team, monthly (includes a self-host license)";
}
