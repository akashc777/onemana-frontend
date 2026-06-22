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

/** Builds a ?from=&to= query string from optional YYYY-MM-DD dates. */
function rangeQuery(from?: string, to?: string): string {
  const p = new URLSearchParams();
  if (from) p.set("from", from);
  if (to) p.set("to", to);
  const s = p.toString();
  return s ? `?${s}` : "";
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
export interface Subscription {
  id: string;
  customer_id: string;
  razorpay_subscription_id: string;
  plan_code: string;
  seats: number;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  license_id?: string | null;
  created_at: string;
  updated_at: string;
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

export interface AdminBlogPost {  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string;
  content: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostPayload {
  slug?: string;
  title: string;
  excerpt: string;
  cover_image: string;
  content: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
}

export interface AdminDoc {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  order_index: number;
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocPayload {
  slug?: string;
  title: string;
  category: string;
  content: string;
  order_index: number;
  status: "draft" | "published";
  seo_title: string;
  seo_desc: string;
}

export interface VisitDay {
  date: string;
  views: number;
  uniques: number;
}
export interface VisitPath {
  path: string;
  views: number;
}
export interface CountryCount {
  code: string;
  views: number;
  uniques: number;
}
export interface DeviceCount {
  device: string;
  views: number;
  uniques: number;
}
export interface VisitStats {
  total_views: number;
  unique_visitors: number;
  daily: VisitDay[];
  top_paths: VisitPath[];
  by_country: CountryCount[];
  by_device: DeviceCount[];
}

export interface FYEarning {
  financial_year: string;
  gross: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  count: number;
  gst_paid: number;
  gst_outstanding: number;
}
export interface EarningsSummary {
  gross: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  count: number;
  export_count: number;
  refunded_count: number;
  refunded_amount: number;
  total_gst_paid: number;
  by_fy: FYEarning[];
}

export interface TaxPayment {
  id: string;
  financial_year: string;
  amount: number;
  kind: string;
  period: string;
  paid_on: string;
  reference: string;
  note: string;
  created_at: string;
}
export interface TaxPaymentPayload {
  financial_year: string;
  amount: number;
  kind: string;
  period: string;
  paid_on: string;
  reference: string;
  note: string;
}

export interface Announcement {
  id: string;
  title: string;
  preheader: string;
  body: string;
  media_url: string;
  status: string;
  recipient_count: number;
  created_at: string;
  sent_at: string | null;
}
export interface GiftResult {
  email: string;
  license_key: string;
  kind: string;
  months?: number;
}

export interface GSTR1Summary {
  gstin: string;
  period: string;
  fp: string;
  invoice_count: number;
  b2b_count: number;
  b2cl_count: number;
  b2cs_count: number;
  export_count: number;
  credit_note_count: number;
  cdnr_count: number;
  cdnur_count: number;
  exception_count: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  credit_taxable: number;
  credit_total: number;
}
export interface GSTR1Exception {
  invoice_no: string;
  reason: string;
}

export interface CreditNote {
  id: string;
  credit_note_no: string;
  financial_year: string;
  invoice_id: string | null;
  order_id: string | null;
  reason: string;
  ntty: string; // "C" credit | "D" debit
  buyer_name: string;
  buyer_gstin: string;
  buyer_state: string;
  buyer_state_code: string;
  buyer_country: string;
  place_of_supply: string;
  original_invoice_no: string;
  original_invoice_date: string | null;
  is_export: boolean;
  gst_rate: number;
  sac_code: string;
  currency: string;
  gross_amount: number;
  taxable_value: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  note_date: string;
  created_at: string;
}
export interface CreditNotePayload {
  invoice_id: string;
  reason: string;
  amount_paise: number; // 0 = full remaining balance
  ntty: "C" | "D";
}

// GSTR-3B: auto outward + admin-entered ITC/RCM/interest (all amounts shown in
// rupees from the backend). The manual inputs are sent in paise.
export interface GSTR3BSummary {
  gstin: string;
  period: string;
  fp: string;
  outward_taxable: number;
  outward_igst: number;
  outward_cgst: number;
  outward_sgst: number;
  zero_rated_value: number;
  zero_rated_igst: number;
  rcm_taxable: number;
  rcm_igst: number;
  rcm_cgst: number;
  rcm_sgst: number;
  inter_unreg_value: number;
  inter_unreg_igst: number;
  output_igst: number;
  output_cgst: number;
  output_sgst: number;
  itc_igst: number;
  itc_cgst: number;
  itc_sgst: number;
  itc_cess: number;
  cash_igst: number;
  cash_cgst: number;
  cash_sgst: number;
  interest: number;
  late_fee: number;
  cash_this_month: number;
}
export interface GSTR3BRecon {
  gstr1_outward_taxable: number;
  gstr3b_outward_taxable: number;
  matches: boolean;
  gstr1_exception_count: number;
  note: string;
}
// Admin-entered figures (rupees in the UI); converted to paise for the request.
export interface GSTR3BManual {
  rcm_taxable?: number;
  rcm_igst?: number;
  rcm_cgst?: number;
  rcm_sgst?: number;
  itc_igst?: number;
  itc_cgst?: number;
  itc_sgst?: number;
  itc_cess?: number;
  interest?: number;
  late_fee?: number;
}

// gstr3bManualQuery turns rupee inputs into a paise query string.
function gstr3bManualQuery(m: GSTR3BManual): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(m)) {
    if (typeof v === "number" && v > 0) p.set(k, String(Math.round(v * 100)));
  }
  const s = p.toString();
  return s ? `&${s}` : "";
}

// GST filing tracker: which returns are due each month and their filed status.
export interface GSTFilingItem {
  return_type: string;
  description: string;
  year: number;
  month: number;
  period: string; // MMYYYY
  due_date: string; // YYYY-MM-DD
  filed: boolean;
  arn: string;
  filed_on: string;
  note: string;
  overdue: boolean;
  nil_eligible: boolean;
  filing_id: string | null;
}
export interface GSTFilingMonth {
  year: number;
  month: number;
  label: string;
  invoice_count: number;
  credit_note_count: number;
  nil_eligible: boolean;
  returns: GSTFilingItem[];
}
export interface MarkFiledPayload {
  return_type: string;
  year: number;
  month: number;
  arn: string;
  filed_on: string; // YYYY-MM-DD ("" = today)
  note: string;
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
  subscriptions: () => adminGet<{ data: Subscription[] }>("/onecamp/admin/subscriptions").then((d) => d.data ?? []),
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

  // ---- GSTR-1 (Path A: GSTN offline JSON for portal upload) ----
  gstr1Summary: (year: number, month: number) =>
    adminGet<{ data: GSTR1Summary; exceptions: GSTR1Exception[] }>(
      `/onecamp/admin/gstr1/summary?year=${year}&month=${month}`,
    ).then((d) => ({ summary: d.data, exceptions: d.exceptions ?? [] })),
  gstr1JsonUrl: (year: number, month: number) =>
    `${site.backendUrl}/onecamp/admin/gstr1.json?year=${year}&month=${month}`,

  // ---- GSTR-3B (monthly summary-and-pay; outward auto, ITC/RCM entered) ----
  gstr3bSummary: (year: number, month: number, manual: GSTR3BManual = {}) =>
    adminGet<{ data: GSTR3BSummary; reconciliation: GSTR3BRecon }>(
      `/onecamp/admin/gstr3b/summary?year=${year}&month=${month}${gstr3bManualQuery(manual)}`,
    ).then((d) => ({ summary: d.data, recon: d.reconciliation })),
  gstr3bJsonUrl: (year: number, month: number, manual: GSTR3BManual = {}) =>
    `${site.backendUrl}/onecamp/admin/gstr3b.json?year=${year}&month=${month}${gstr3bManualQuery(manual)}`,

  // ---- GST filing tracker (due returns + filed acknowledgements) ----
  gstFilings: (fy?: number) =>
    adminGet<{ fy_start: number; data: GSTFilingMonth[] }>(
      `/onecamp/admin/gst-filings${fy ? `?fy=${fy}` : ""}`,
    ).then((d) => ({ fyStart: d.fy_start, months: d.data ?? [] })),
  async markGSTFiled(payload: MarkFiledPayload): Promise<string> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/gst-filings`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to mark filed");
    return (data as { msg?: string })?.msg || "Marked filed";
  },
  async unmarkGSTFiled(returnType: string, year: number, month: number): Promise<void> {
    const res = await fetch(
      `${site.backendUrl}/onecamp/admin/gst-filings?return_type=${encodeURIComponent(returnType)}&year=${year}&month=${month}`,
      { method: "DELETE", headers: { "X-Admin-Token": getToken() } },
    );
    if (!res.ok) throw new Error("Failed to unmark filing");
  },

  // ---- Credit notes (GST CDN: refunds / cancellations / price revisions) ----
  creditNotes: () =>
    adminGet<{ data: CreditNote[] }>("/onecamp/admin/credit-notes").then((d) => d.data ?? []),
  async createCreditNote(payload: CreditNotePayload): Promise<CreditNote> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/credit-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to issue credit note");
    return (data as { data: CreditNote }).data;
  },
  async deleteCreditNote(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/credit-note/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete credit note");
  },

  // ---- Delete (admin cleanup of test data) ----
  async deleteOrder(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/order/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete order");
  },
  async refundOrder(id: string): Promise<string> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/order/${id}/refund`, {
      method: "POST",
      headers: { "X-Admin-Token": getToken() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to mark refunded");
    return (data as { msg?: string })?.msg || "Marked refunded";
  },
  async revokeOrderLicense(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/order/${id}/revoke-license`, {
      method: "POST",
      headers: { "X-Admin-Token": getToken() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to revoke license");
  },
  async cancelSubscription(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/subscription/${id}/cancel`, {
      method: "POST",
      headers: { "X-Admin-Token": getToken() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to cancel subscription");
  },
  async deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/invoice/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete invoice");
  },
  async deleteCustomer(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/customer/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete customer");
  },
  async updateCustomerName(id: string, name: string): Promise<Customer> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/customer/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to update customer");
    return (data as { data: Customer }).data;
  },

  // ---- Analytics + earnings ----
  visitStats: (from?: string, to?: string) =>
    adminGet<{ data: VisitStats }>(`/onecamp/admin/visits${rangeQuery(from, to)}`).then((d) => d.data),
  earnings: (from?: string, to?: string) =>
    adminGet<{ data: EarningsSummary }>(`/onecamp/admin/earnings${rangeQuery(from, to)}`).then((d) => d.data),
  taxPayments: () => adminGet<{ data: TaxPayment[] }>("/onecamp/admin/tax-payments").then((d) => d.data ?? []),
  async createTaxPayment(payload: TaxPaymentPayload): Promise<TaxPayment> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/tax-payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to add payment");
    return (data as { data: TaxPayment }).data;
  },
  async deleteTaxPayment(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/tax-payments/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete payment");
  },

  // ---- Blog CMS ----
  blogList: () => adminGet<{ data: AdminBlogPost[] }>("/onecamp/admin/blog").then((d) => d.data ?? []),
  blogGet: (id: string) => adminGet<{ data: AdminBlogPost }>(`/onecamp/admin/blog/${id}`).then((d) => d.data),
  async blogCreate(payload: BlogPostPayload): Promise<AdminBlogPost> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/blog`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to create post");
    return (data as { data: AdminBlogPost }).data;
  },
  async blogUpdate(id: string, payload: BlogPostPayload): Promise<AdminBlogPost> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/blog/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to update post");
    return (data as { data: AdminBlogPost }).data;
  },
  async blogDelete(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/blog/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete post");
  },
  async blogUpload(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${site.backendUrl}/onecamp/admin/blog/media`, {
      method: "POST",
      headers: { "X-Admin-Token": getToken() },
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Upload failed");
    return (data as { data: { url: string } }).data;
  },

  // ---- Docs CMS ----
  docList: () => adminGet<{ data: AdminDoc[] }>("/onecamp/admin/docs").then((d) => d.data ?? []),
  docGet: (id: string) => adminGet<{ data: AdminDoc }>(`/onecamp/admin/docs/${id}`).then((d) => d.data),
  async docCreate(payload: DocPayload): Promise<AdminDoc> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to create doc");
    return (data as { data: AdminDoc }).data;
  },
  async docUpdate(id: string, payload: DocPayload): Promise<AdminDoc> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/docs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to update doc");
    return (data as { data: AdminDoc }).data;
  },
  async docDelete(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/docs/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete doc");
  },

  // ---- Announcements (broadcast) ----
  announcements: () => adminGet<{ data: Announcement[] }>("/onecamp/admin/announcements").then((d) => d.data ?? []),
  async createAnnouncement(payload: { title: string; preheader: string; body: string; media_url: string }): Promise<Announcement> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to create");
    return (data as { data: Announcement }).data;
  },
  async updateAnnouncement(id: string, payload: { title: string; preheader: string; body: string; media_url: string }): Promise<Announcement> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to update");
    return (data as { data: Announcement }).data;
  },
  async sendAnnouncement(id: string): Promise<string> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/announcements/${id}/send`, {
      method: "POST",
      headers: { "X-Admin-Token": getToken() },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to send");
    return (data as { msg?: string })?.msg || "Broadcast started";
  },
  async testAnnouncement(id: string, email: string): Promise<string> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/announcements/${id}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to send test");
    return (data as { msg?: string })?.msg || "Test sent";
  },
  async deleteAnnouncement(id: string): Promise<void> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/announcements/${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": getToken() },
    });
    if (!res.ok) throw new Error("Failed to delete");
  },

  // ---- Gift (comp a license or Cloud months) ----
  async gift(payload: { email: string; name: string; kind: "license" | "subscription"; months?: number }): Promise<GiftResult> {
    const res = await fetch(`${site.backendUrl}/onecamp/admin/gift`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Token": getToken() },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { msg?: string })?.msg || "Failed to gift");
    return (data as { data: GiftResult }).data;
  },
};

// Helper for authenticated file downloads (CSV/PDF) - fetch with token then
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
