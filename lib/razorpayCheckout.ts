/**
 * Opening Razorpay's window for a subscription the backend has created.
 *
 * One place, because the account page opens it for two things (extra storage,
 * and a plan change a UPI or eMandate subscription must confirm) and each copy
 * of this used to be a chance to get the failure cases wrong. The backend acts
 * on Razorpay's webhook, not on this window closing, so onPaid is a courtesy:
 * the page says "thank you" and reloads a little later.
 */
export type SubscriptionCheckout = { subscription_id: string; razorpay_key_id: string; name: string; email: string };

export function openSubscriptionCheckout(
  c: SubscriptionCheckout,
  description: string,
  on: { paid: () => void; closed: () => void; failed: (msg: string) => void },
): void {
  if (typeof window === "undefined" || !window.Razorpay) {
    on.failed("The payment library is still loading. Try again in a moment.");
    return;
  }
  const rzp = new window.Razorpay({
    key: c.razorpay_key_id,
    subscription_id: c.subscription_id,
    name: "OneCamp Cloud",
    description,
    prefill: { email: c.email, name: c.name },
    theme: { color: CHECKOUT_THEME },
    handler: on.paid,
    modal: { ondismiss: on.closed },
  });
  rzp.on("payment.failed", () => on.failed("Payment failed or was cancelled. You have not been charged."));
  rzp.open();
}
/** The brand orange (DESIGN.md), so every payment window looks like ours. */
export const CHECKOUT_THEME = "#b94a00";

