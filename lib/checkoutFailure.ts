/**
 * What to tell a buyer whose payment failed, from Razorpay's payment.failed
 * answer (plan A8).
 *
 * WHY. Most buyers are outside India, and an issuer in the US or Europe may
 * decline a card payment to an Indian merchant, or hold it for an extra check
 * the buyer never completes. The page said only "Payment failed or was
 * cancelled", which leaves somebody who wanted to pay with nothing to do. The
 * answer carries why (error.reason, error.code, error.source, error.step); the
 * common reasons now get a sentence saying what to do next, and everything
 * else keeps the plain one.
 *
 * TRACKED ANONYMOUSLY. `code` is the reason alone, cut to safe characters, for
 * the funnel (checkout-failed/<code>): no card data, no description, nothing
 * the buyer typed.
 */

export const FAILED_GENERIC = "Payment failed or was cancelled. You have not been charged.";

export const FAILED_BY_BANK =
  "Your bank declined a payment to an Indian merchant. This is common and quick to fix: approve international online payments in your bank's app, or try another card. You have not been charged. Stuck? Write to support@onemana.dev and we'll help.";

const FAILED_FUNDS = "Your card was declined for insufficient funds. Try another card. You have not been charged.";
const FAILED_CANCELLED = "The payment was cancelled. You have not been charged.";
const FAILED_TIMEOUT = "The payment timed out before your bank answered. You have not been charged, so you can try again.";

interface RazorpayFailure {
  error?: { code?: unknown; reason?: unknown; source?: unknown; step?: unknown };
}

const text = (v: unknown) => (typeof v === "string" ? v.trim().toLowerCase() : "");

/** The reason as a short, safe tracking code: "international_transaction_not_allowed". */
function codeOf(reason: string, code: string): string {
  const raw = reason || code || "unknown";
  return raw.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "unknown";
}

export function checkoutFailure(resp: unknown): { message: string; code: string } {
  const e = (resp && typeof resp === "object" ? (resp as RazorpayFailure).error : undefined) ?? {};
  const reason = text(e.reason);
  const code = codeOf(reason, text(e.code));
  const source = text(e.source);
  const step = text(e.step);

  if (/insufficient/.test(reason)) return { message: FAILED_FUNDS, code };
  if (/cancel/.test(reason)) return { message: FAILED_CANCELLED, code };
  if (/time_?out|timed_out/.test(reason)) return { message: FAILED_TIMEOUT, code };
  if (
    /international|cross_border|declin|issuer|do_not_honou?r|card_blocked|risk|authenticat|3ds|otp|pin/.test(reason) ||
    step === "payment_authentication" ||
    ((source === "bank" || source === "issuer") && reason !== "")
  ) {
    return { message: FAILED_BY_BANK, code };
  }
  return { message: FAILED_GENERIC, code };
}
