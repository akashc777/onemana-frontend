// Client for the OneMana customer portal (onemana-backend /onecamp/portal/*).
// Auth is a passwordless email code that mints an httpOnly session cookie, so
// every request is sent with credentials. There is no token in JS.

import { site } from "./site";
import type { Order, Invoice } from "./adminApi";

export type { Order, Invoice };

export interface PortalCustomer {
  id: string;
  email: string;
  name: string;
  gstin: string;
  phone: string;
  address_line: string;
  city: string;
  state: string;
  state_code: string;
  country: string;
  created_at: string;
}

export interface PortalLicense {
  key: string;
  product_type: string;
  plan_code: string;
  install_cmd: string;
  issued_at: string;
}

export interface PortalSubscription {
  id: string;
  plan_code: string;
  status: string;
  seats: number;
  next_due_date: string | null;
  cancel_at_period_end: boolean;
  can_cancel: boolean;
  created_at: string;
}

export interface PortalOverview {
  customer: PortalCustomer;
  licenses: PortalLicense[];
  order_count: number;
  invoice_count: number;
  subscriptions: PortalSubscription[];
}

const base = `${site.backendUrl}/onecamp/portal`;

/** Thrown when the portal session is missing or expired (HTTP 401). */
export class PortalAuthError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "PortalAuthError";
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });
  if (res.status === 401) throw new PortalAuthError();
  const data = (await res.json().catch(() => ({}))) as { data?: T; msg?: string };
  if (!res.ok) throw new Error(data?.msg || `Request failed (${res.status})`);
  return data.data as T;
}

export const portalApi = {
  async requestCode(email: string): Promise<string> {
    const res = await fetch(`${base}/request-code`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "Could not send code");
    return data?.msg || "Code sent.";
  },

  async verify(email: string, code: string): Promise<void> {
    const res = await fetch(`${base}/verify`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "That code is invalid or has expired.");
  },

  async logout(): Promise<void> {
    await fetch(`${base}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  },

  me: () => req<PortalOverview>("/me"),
  orders: () => req<Order[]>("/orders").then((d) => d ?? []),
  invoices: () => req<Invoice[]>("/invoices").then((d) => d ?? []),
  subscriptions: () => req<PortalSubscription[]>("/subscriptions").then((d) => d ?? []),

  async cancelSubscription(id: string): Promise<void> {
    const res = await fetch(`${base}/subscription/${id}/cancel`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "Failed to cancel subscription");
  },

  invoicePdfUrl: (id: string) => `${base}/invoice/${id}/pdf`,

  /** Downloads an invoice PDF using the session cookie. */
  async downloadInvoice(id: string, filename: string): Promise<void> {
    const res = await fetch(`${base}/invoice/${id}/pdf`, { credentials: "include" });
    if (res.status === 401) throw new PortalAuthError();
    if (!res.ok) throw new Error("Download failed");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  },
};
