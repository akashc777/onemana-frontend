"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCheckoutOrder,
  createCloudSubscription,
  verifyPayment,
  type CheckoutInput,
} from "@/lib/api";

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (resp: unknown) => void) => void;
    };
  }
}

export interface CheckoutController {
  busy: boolean;
  error: string;
  setError: (msg: string) => void;
  start: (input: CheckoutInput, contact?: string) => Promise<void>;
  startCloud: (input: CheckoutInput, contact?: string) => Promise<void>;
}

/**
 * useCheckout encapsulates the full Razorpay flow: create order → open
 * Checkout → verify → route to success. The verify step is best-effort for
 * instant UX; the backend webhook remains the authoritative fulfillment, so a
 * verify failure still routes to a reassuring "pending" success page.
 */
export function useCheckout(): CheckoutController {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = useCallback(
    async (input: CheckoutInput, contact?: string) => {
      setError("");
      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Payment library is still loading. Please try again in a moment.");
        return;
      }
      setBusy(true);
      try {
        const order = await createCheckoutOrder(input);
        const rzp = new window.Razorpay({
          key: order.razorpay_key_id,
          order_id: order.razorpay_order_id,
          amount: order.amount,
          currency: order.currency,
          name: "OneCamp",
          description: "Self-Hosted Unified Workspace, Lifetime License",
          prefill: { email: order.email, name: order.name, contact: contact ?? "" },
          theme: { color: "#6d5efc" },
          handler: async (resp: unknown) => {
            const r = resp as RazorpaySuccess;
            const params = new URLSearchParams({ email: input.email });
            try {
              const result = await verifyPayment({
                razorpay_order_id: r.razorpay_order_id,
                razorpay_payment_id: r.razorpay_payment_id,
                razorpay_signature: r.razorpay_signature,
              });
              if (result.license_key) params.set("key", result.license_key);
              if (result.status === "pending") params.set("pending", "1");
            } catch {
              params.set("pending", "1");
            }
            router.push(`/buy/success?${params.toString()}`);
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.on("payment.failed", () => {
          setBusy(false);
          setError("Payment failed or was cancelled. You have not been charged.");
        });
        rzp.open();
      } catch (err) {
        setBusy(false);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    },
    [router],
  );

  const startCloud = useCallback(
    async (input: CheckoutInput, contact?: string) => {
      setError("");
      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Payment library is still loading. Please try again in a moment.");
        return;
      }
      setBusy(true);
      try {
        const sub = await createCloudSubscription(input);
        const rzp = new window.Razorpay({
          key: sub.razorpay_key_id,
          subscription_id: sub.subscription_id,
          name: "OneCamp Cloud",
          description: "Managed Hosting, Monthly (includes a self-host license)",
          prefill: { email: sub.email, name: sub.name, contact: contact ?? "" },
          theme: { color: "#6d5efc" },
          handler: () => {
            // Subscription activation + fulfillment is webhook-driven. Route to
            // a reassuring success page; the welcome email carries the license.
            const params = new URLSearchParams({ email: input.email, cloud: "1" });
            router.push(`/buy/success?${params.toString()}`);
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.on("payment.failed", () => {
          setBusy(false);
          setError("Payment failed or was cancelled. You have not been charged.");
        });
        rzp.open();
      } catch (err) {
        setBusy(false);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    },
    [router],
  );

  return { busy, error, setError, start, startCloud };
}
