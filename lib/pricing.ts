// Dual-currency pricing. Charges always happen in INR (enforced server-side);
// USD figures are display-only and shown prominently. Values are admin-editable
// and fetched live from the backend, with safe static fallbacks.

import { site } from "./site";

export interface Pricing {
  currency: string;
  lifetime_inr: number;
  lifetime_usd: number;
  lifetime_paise: number;
  cloud_inr: number;
  cloud_usd: number;
  cloud_paise: number;
  cloud_seats: number;
  cloud_configured: boolean;
  /** Yearly. Shown only when cloud_yearly_configured; the backend derives the free months from the two prices. */
  cloud_yearly_inr: number;
  cloud_yearly_paise: number;
  cloud_yearly_free_months: number;
  cloud_yearly_configured: boolean;
  /** Extra file storage, bought from the account page for a live workspace. Shown only when configured. */
  storage_addon_inr: number;
  storage_addon_paise: number;
  storage_addon_gb: number;
  storage_addon_configured: boolean;
}

/**
 * Pay once and own it, or pay monthly and we run it.
 *
 * The licence USED to be exactly one month of the managed plan, and the copy
 * leaned on that equality. It stopped being true on 14 September 2026 when the
 * licence went to $299 / Rs 24,999 and cloud stayed where it was.
 *
 * The line was not restated as "about three months of cloud", because the
 * multiple is not the same in both currencies — 299/99 is almost exactly three,
 * 24,999/9,999 is two and a half — and a claim that only holds in dollars is not
 * a claim this page can make. So the frame is the choice itself rather than an
 * arithmetic relationship between two numbers that are now free to move
 * independently.
 */
export const defaultPricing: Pricing = {
  currency: "INR",
  lifetime_inr: 24999,
  lifetime_usd: 299,
  lifetime_paise: 2499900,
  cloud_inr: 9999,
  cloud_usd: 99,
  cloud_paise: 999900,
  cloud_seats: 30,
  cloud_configured: false,
  cloud_yearly_inr: 0,
  cloud_yearly_paise: 0,
  cloud_yearly_free_months: 0,
  cloud_yearly_configured: false,
  storage_addon_inr: 2999,
  storage_addon_paise: 299900,
  storage_addon_gb: 500,
  storage_addon_configured: false,
};

/** Fetches live pricing from the backend (revalidated), falling back safely. */
export async function getPricing(): Promise<Pricing> {
  try {
    const res = await fetch(`${site.backendUrl}/onecamp/pricing`, { next: { revalidate: 300 } });
    if (!res.ok) return defaultPricing;
    const json = (await res.json()) as { data?: Partial<Pricing> };
    return { ...defaultPricing, ...(json.data ?? {}) };
  } catch {
    return defaultPricing;
  }
}

/** Client-side pricing fetch (no Next cache options). */
export async function fetchPricingClient(): Promise<Pricing> {
  try {
    const res = await fetch(`${site.backendUrl}/onecamp/pricing`);
    if (!res.ok) return defaultPricing;
    const json = (await res.json()) as { data?: Partial<Pricing> };
    return { ...defaultPricing, ...(json.data ?? {}) };
  } catch {
    return defaultPricing;
  }
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function fmtUSD(n: number): string {
  return usd.format(n || 0);
}
export function fmtINR(n: number): string {
  return inr.format(n || 0);
}
