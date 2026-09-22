/**
 * The words around switching a workspace between monthly and yearly.
 *
 * The backend decides whether a switch is offered and what it does; this
 * turns that into the button and the sentence the customer confirms. Money
 * words are exact and match the backend's: up now with the difference
 * charged, down at the end of the paid year, never a refund.
 */
export function switchLabel(to: string, freeMonths: number): string {
  if (to === "yearly") return freeMonths > 0 ? `Switch to yearly, ${freeMonths} months free` : "Switch to yearly";
  if (to === "monthly") return "Switch to monthly when the year ends";
  return "";
}

export function switchConfirm(to: string): string {
  if (to === "yearly") {
    return "Razorpay charges the difference for the rest of this month now, and the yearly price from your next renewal. Payments are final; we do not offer refunds. Switch to yearly?";
  }
  if (to === "monthly") {
    return "Your billing becomes monthly when the paid year ends. Nothing is charged until then, and the year you paid for is not refunded. Schedule the switch?";
  }
  return "";
}
