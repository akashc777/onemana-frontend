// Client for the OneMana admin API (onemana-backend /onecamp/admin/*).
// Auth is the admin token sent as X-Admin-Token. The token is held only in
// the browser (sessionStorage) for this self-hosted single-admin tool.

import { site } from "./site";

const TOKEN_KEY = "onemana_admin_token";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(TOKEN_KEY) || "";
}
export function setToken(t: string) {
  window.sessionStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  window.sessionStorage.removeItem(TOKEN_KEY);
}

async function adminGet<T>(path: string): Promise<T> {
  const res = await fetch(`${site.backendUrl}${path}`, {
    headers: { "X-Admin-Token": getToken() },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return (await res.json()) as T;
}

export interface Order {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  product_type: string;
  plan_code: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  license_id?: string | null;
  created_at: string;
  paid_at?: string | null;
}
export interface Customer {
  id: string;
  email: string;
  name: string;
  gstin: string;
  state: string;
  country: string;
  created_at: string;
}
export interface Invoice {
  id: string;
  invoice_no: string;
  financial_year: string;
  buyer_name: string;
  buyer_email: string;
  buyer_gstin: string;
  place_of_supply: string;
  buyer_country: string;
  currency: string;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  gst_rate: number;
  gross_amount: number;
  is_export: boolean;
  issued_at: string;
}

export const adminApi = {
  async verify(token: string): Promise<boolean> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/config`, {
      headers: { "X-Admin-Token": token },
    });
    return res.ok;
  },
  orders: () => adminGet<{ data: Order[] }>("/onecamp/admin/orders").then((d) => d.data ?? []),
  customers: () => adminGet<{ data: Customer[] }>("/onecamp/admin/customers").then((d) => d.data ?? []),
  invoices: () => adminGet<{ data: Invoice[] }>("/onecamp/admin/invoices").then((d) => d.data ?? []),
  config: () => adminGet<{ data: Record<string, string> }>("/onecamp/admin/config").then((d) => d.data ?? {}),
  async setConfig(key: string, value: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error(`Failed to save ${key}`);
  },
  invoiceCsvUrl: () => `${site.backendUrl}/onecamp/admin/invoices.csv`,
  invoicePdfUrl: (id: string) => `${site.backendUrl}/onecamp/admin/invoice/${id}/pdf`,
};

// Helper for authenticated file downloads (CSV/PDF) — fetch with token then
// trigger a blob download (the endpoints require the X-Admin-Token header).
export async function downloadWithToken(url: string, filename: string) {
  const res = await fetch(url, { headers: { "X-Admin-Token": getToken() } });
  if (!res.ok) throw new Error("download failed");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}
