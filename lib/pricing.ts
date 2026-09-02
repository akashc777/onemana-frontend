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
}

/**
 * The licence costs exactly one month of the managed plan. That is the whole
 * pricing story in one line, and it is why these two numbers are equal rather
 * than merely close: one month of cloud, or own it forever.
 */
export const defaultPricing: Pricing = {
  currency: "INR",
  lifetime_inr: 9999,
  lifetime_usd: 99,
  lifetime_paise: 999900,
  cloud_inr: 9999,
  cloud_usd: 99,
  cloud_paise: 999900,
  cloud_seats: 30,
  cloud_configured: false,
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
