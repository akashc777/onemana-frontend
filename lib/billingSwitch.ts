import type { Pricing } from "./pricing";
import { fmtINR } from "./pricing";

/**
 * The words around changing plan: Team monthly, Team yearly, Business.
 *
 * The backend decides which changes are offered and when each takes effect;
 * this turns that into the button and the sentence confirmed before it. The
 * rule behind every sentence is the backend's: paying more, sooner (monthly to
 * yearly, Team monthly to Business) happens now with the difference charged;
 * everything else waits for the paid period, and nothing is refunded.
 */
const TEAM_MONTHLY = "onecamp_cloud_team";

/** Whether a change happens now (true) or at the end of the paid period. */
export function changesNow(to: string, fromPlanCode: string): boolean {
  return fromPlanCode === TEAM_MONTHLY && (to === "yearly" || to === "business");
}

export function switchLabel(to: string, fromPlanCode: string, p: Pricing): string {
  const now = changesNow(to, fromPlanCode);
  switch (to) {
    case "business":
      return now ? `Upgrade to Business, ${p.business_seats} users` : "Upgrade to Business when the year ends";
    case "yearly": {
      const free = p.cloud_yearly_free_months > 0 ? `, ${p.cloud_yearly_free_months} months free` : "";
      return now ? `Switch to yearly${free}` : `Switch to Team yearly when this month ends${free}`;
    }
    case "monthly":
      return fromPlanCode === "onecamp_cloud_business" ? "Move down to Team when this month ends" : "Switch to monthly when the year ends";
  }
  return "";
}

export function switchConfirm(to: string, fromPlanCode: string, p: Pricing): string {
  if (changesNow(to, fromPlanCode)) {
    const what =
      to === "business"
        ? `Business is ${fmtINR(p.business_inr)} a month for ${p.business_seats} users on a larger machine. Your workspace moves to it in the next quiet hours, or at once if you choose Move now.`
        : "The yearly price applies from your next renewal.";
    return `Razorpay charges the difference for the rest of this month now. ${what} Payments are final; we do not offer refunds. Go ahead?`;
  }
  const when = fromPlanCode === "onecamp_cloud_team_yearly" ? "the paid year ends" : "this paid month ends";
  return `This takes effect when ${when}. Nothing is charged until then, and what you have paid for is not refunded. Schedule it?`;
}
