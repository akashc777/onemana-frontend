import { describe, expect, it } from "vitest"

import { checkoutFailure, FAILED_BY_BANK, FAILED_GENERIC } from "./checkoutFailure"

/**
 * A failed card abroad gets a next step (plan A8). The payloads are the shape
 * Razorpay's payment.failed handler receives; no card is ever charged here.
 */
const failed = (error: Record<string, string>) => ({ error: { description: "Payment failed", metadata: { order_id: "order_x", payment_id: "pay_x" }, ...error } })

describe("a failed payment", () => {
  it("tells a buyer whose bank refused a payment to India what to do", () => {
    for (const e of [
      { code: "BAD_REQUEST_ERROR", reason: "international_transaction_not_allowed", source: "customer", step: "payment_authorization" },
      { code: "BAD_REQUEST_ERROR", reason: "card_declined", source: "issuer", step: "payment_authorization" },
      { code: "GATEWAY_ERROR", reason: "payment_declined", source: "bank", step: "payment_authorization" },
      { code: "BAD_REQUEST_ERROR", reason: "authentication_failed", source: "customer", step: "payment_authentication" },
      { code: "BAD_REQUEST_ERROR", reason: "incorrect_otp", source: "customer", step: "payment_authentication" },
      { code: "BAD_REQUEST_ERROR", reason: "payment_risk_check_failed", source: "internal", step: "payment_authorization" },
    ]) {
      expect(checkoutFailure(failed(e)).message, e.reason).toBe(FAILED_BY_BANK)
    }
    expect(FAILED_BY_BANK).toContain("You have not been charged")
    expect(FAILED_BY_BANK).toContain("support@onemana.dev")
  })

  it("says what happened for funds, a cancel and a timeout", () => {
    expect(checkoutFailure(failed({ reason: "insufficient_funds" })).message).toMatch(/insufficient funds/)
    expect(checkoutFailure(failed({ reason: "payment_cancelled" })).message).toMatch(/cancelled/)
    expect(checkoutFailure(failed({ reason: "payment_timed_out" })).message).toMatch(/timed out/)
  })

  it("keeps the plain sentence for anything else, or nothing at all", () => {
    expect(checkoutFailure(failed({ code: "SERVER_ERROR", reason: "server_error", source: "internal" })).message).toBe(FAILED_GENERIC)
    expect(checkoutFailure(undefined).message).toBe(FAILED_GENERIC)
    expect(checkoutFailure({}).message).toBe(FAILED_GENERIC)
  })

  it("is counted by its reason alone, cut to safe characters", () => {
    expect(checkoutFailure(failed({ reason: "international_transaction_not_allowed", description: "card 4111 declined" })).code).toBe(
      "international_transaction_not_allowed",
    )
    expect(checkoutFailure(failed({ code: "BAD_REQUEST_ERROR" })).code).toBe("bad_request_error")
    expect(checkoutFailure(failed({ reason: "../../x y?z=<1>" })).code).toBe("x_y_z_1")
    expect(checkoutFailure(failed({ reason: "a".repeat(200) })).code).toHaveLength(48)
    expect(checkoutFailure(null).code).toBe("unknown")
  })

  it("is what both checkout windows show", async () => {
    const { readFileSync } = await import("node:fs")
    expect(readFileSync("hooks/useCheckout.ts", "utf8")).toMatch(/rzp\.on\("payment\.failed", \(resp: unknown\) => failed\(resp\)\)/)
    expect(readFileSync("hooks/useCheckout.ts", "utf8")).toContain("trackEvent(`checkout-failed/${f.code}`)")
    expect(readFileSync("lib/razorpayCheckout.ts", "utf8")).toContain("checkoutFailure(resp).message")
  })
})
