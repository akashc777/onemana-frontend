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
  /** The plan in words; falls back to plan_code on older backends. */
  label?: string;
  /** Set on an add-on: the workspace it extends. */
  instance_id?: string;
  /** The plans the customer may change to from here ("monthly", "yearly", "business"); see billingSwitch. */
  switch_options?: string[];
  /** A switch already scheduled for the end of the cycle, in words. */
  pending_label?: string;
  status: string;
  seats: number;
  next_due_date: string | null;
  cancel_at_period_end: boolean;
  can_cancel: boolean;
  /** Offers "Keep my workspace": cancelled, and the workspace still exists. */
  can_keep?: boolean;
  /** Offers a new card or payment method for the next renewal. */
  can_change_card?: boolean;
  created_at: string;
}

/** A managed workspace: the thing a Cloud subscription actually buys. */
export interface PortalInstance {
  id: string;
  address: string;
  state: string;
  /** Customer-facing wording for `state`, from the backend. */
  status: string;
  /** True while the customer still has to choose an address. */
  needs_name: boolean;
  region: string;
  tier: string;
  edition: string;
  has_ai: boolean;
  live_at?: string;
  /** Keep polling while true. */
  working: boolean;
  /** Nothing more will happen. */
  terminal: boolean;
  /** Safe progress text; absent unless there is something useful to say. */
  detail?: string;
  /** People in the workspace at the last daily count; absent until counted. */
  seats_used?: number;
  /** What the plan is sold for. Not enforced by the product; see seatsLine. */
  seats_included: number;
  /** When seats_used was taken. */
  seats_as_of?: string;
  /** Disk used on the machine, 0..100, from the same daily check; absent until measured. */
  disk_used_pct?: number;
  /** True for every running managed workspace; see backupLine. */
  backups_nightly: boolean;
  /** Whether an off-site store is set up at all; false means no copy is promised. */
  offsite_configured: boolean;
  /** When the newest backup was last copied off the machine; absent until the first copy. */
  offsite_backup_at?: string;
  /** Extra storage bought for this workspace and how far attaching it has got; see storageLine. */
  storage_addon_gb: number;
  storage_addon_state: string;
  // What the files bucket holds, from the daily reading; absent before it.
  storage_used_gb?: number;
  /** From the daily reading; see capacityLine. Absent until the first reading. */
  mem_used_pct?: number;
  capacity_verdict?: string;
  capacity_reason?: string;
  /** "team" or "business": what the workspace is sold as and runs on. */
  size?: string;
  /** Set while the workspace is moving between machines; see moveLine. */
  move?: PortalMove;
}

export type PortalMove = { to_size: string; label: string; when?: string; can_move_now: boolean };

export type PortalCheckout = { subscription_id: string; razorpay_key_id: string; name: string; email: string };

export type PortalBackupLink = { url: string; backup: string; expires_at: string };

export interface PortalEdition {
  name: string;
  has_ai: boolean;
  default: boolean;
}

/** One record a customer must create in their own DNS for a custom domain. */
export interface PortalDNSRecord {
  host: string;
  type: string;
  value: string;
  proxied: boolean;
  purpose: string;
}

export interface PortalDomainPlan {
  kind: string;
  from_domain: string;
  to_domain: string;
  verify_token?: string;
  dns_records?: PortalDNSRecord[];
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

  // The customer moves the account to a new address: a code goes there first.
  async requestEmailChange(email: string): Promise<void> {
    await req<unknown>("/email/request", { method: "POST", body: JSON.stringify({ email }) });
  },

  async confirmEmailChange(email: string, code: string): Promise<void> {
    await req<unknown>("/email/confirm", { method: "POST", body: JSON.stringify({ email, code }) });
  },

  async logout(): Promise<void> {
    await fetch(`${base}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  },

  me: () => req<PortalOverview>("/me"),
  orders: () => req<Order[]>("/orders").then((d) => d ?? []),
  invoices: () => req<Invoice[]>("/invoices").then((d) => d ?? []),
  subscriptions: () => req<PortalSubscription[]>("/subscriptions").then((d) => d ?? []),

  /** The managed workspaces behind this customer's subscriptions. */
  async instances(): Promise<PortalInstance[]> {
    const data = await req<{ data?: PortalInstance[] }>("/instances");
    return data?.data ?? [];
  },

  /** The editions a workspace can be built as. Served from the same table the
   *  provisioner builds from, so the choice can never be one that cannot be made. */
  async editions(): Promise<PortalEdition[]> {
    const data = await req<{ data?: PortalEdition[] }>("/editions");
    return data?.data ?? [];
  },

  /** Name a workspace and choose its edition. The single action that turns a paid
   *  subscription into something being built. */
  async setAddress(id: string, slug: string, edition: string): Promise<string> {
    const res = await fetch(`${base}/instance/${id}/address`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, edition }),
    });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "Could not set that address.");
    return data?.msg || "Address set.";
  },

  /** Start buying extra storage for a live workspace; the browser then opens checkout. */
  async addStorage(id: string): Promise<PortalCheckout> {
    const res = await fetch(`${base}/instance/${id}/storage`, { method: "POST", credentials: "include" });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string; data?: PortalCheckout };
    if (!res.ok || !data?.data?.subscription_id) throw new Error(data?.msg || "The purchase could not be started.");
    return data.data;
  },

  /** Start a move that is ready now, instead of in quiet hours. */
  async moveNow(id: string): Promise<string> {
    const res = await fetch(`${base}/instance/${id}/move-now`, { method: "POST", credentials: "include" });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "The move could not be started.");
    return data?.msg || "Moving now.";
  },

  /** A short-lived download of the newest off-site backup copy. */
  async backupLink(id: string): Promise<PortalBackupLink> {
    const res = await fetch(`${base}/instance/${id}/backup`, { credentials: "include" });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string; data?: PortalBackupLink };
    if (!res.ok || !data?.data?.url) throw new Error(data?.msg || "The download could not be prepared.");
    return data.data;
  },

  /** Describe what moving to a domain would involve, without starting it. */
  async planDomain(id: string, kind: string, domain: string, preview = true): Promise<PortalDomainPlan> {
    const res = await fetch(`${base}/instance/${id}/domain`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, domain, preview }),
    });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string; data?: PortalDomainPlan };
    if (!res.ok) throw new Error(data?.msg || "Could not plan that change.");
    return (data?.data ?? {}) as PortalDomainPlan;
  },

  /** "I have added the records, look now". A customer cannot otherwise tell us. */
  async checkDomain(id: string): Promise<{ msg: string }> {
    const res = await fetch(`${base}/instance/${id}/domain/check`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string };
    if (!res.ok) throw new Error(data?.msg || "Could not check those records.");
    return { msg: data?.msg || "Checked." };
  },

  /** Change a subscription's plan; returns what was done, and a checkout when the
   *  customer must confirm a replacement (UPI Autopay, eMandate). */
  async changePlan(id: string, to: string): Promise<{ detail: string; checkout?: PortalCheckout }> {
    const res = await fetch(`${base}/subscription/${id}/billing`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to }),
    });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string; data?: { detail?: string; checkout?: PortalCheckout } };
    if (!res.ok) throw new Error(data?.msg || "The change could not be made.");
    return { detail: data?.data?.detail || "Plan changed.", checkout: data?.data?.checkout };
  },

  /** A payment window for a subscription that takes over this one: "keep"
   *  takes back a cancellation, "card" moves the renewal to a new card. */
  async replacement(id: string, kind: "keep" | "card"): Promise<PortalCheckout> {
    const res = await fetch(`${base}/subscription/${id}/${kind}`, { method: "POST", credentials: "include" });
    if (res.status === 401) throw new PortalAuthError();
    const data = (await res.json().catch(() => ({}))) as { msg?: string; data?: PortalCheckout };
    if (!res.ok || !data?.data) throw new Error(data?.msg || "That did not work just now; try again in a minute.");
    return data.data;
  },

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
