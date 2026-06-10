// Thin client for the onemana-backend storefront endpoints.

import { site } from "./site";

export interface CheckoutInput {
  email: string;
  name?: string;
  gstin?: string;
  phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country?: string;
}

export interface CheckoutOrder {
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount: number;
  currency: string;
  name: string;
  email: string;
}

export interface VerifyResult {
  status: "success" | "pending";
  license_key?: string;
  email?: string;
  message?: string;
}

async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${site.backendUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.msg || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutOrder> {
  const data = await postJSON<{ data: CheckoutOrder }>("/onecamp/checkout/order", input);
  return data.data;
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerifyResult> {
  const data = await postJSON<{ status: string; data?: { license_key?: string; email?: string }; msg?: string }>(
    "/onecamp/checkout/verify",
    payload,
  );
  return {
    status: data.status === "success" ? "success" : "pending",
    license_key: data.data?.license_key,
    email: data.data?.email,
    message: data.msg,
  };
}
