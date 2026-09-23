// Dual-currency pricing. Charges always happen in INR (enforced server-side).
//
// THE RUPEE PRICE IS THE PRICE. Every dollar figure is that charge at the
// backend's daily exchange rate (usd_rate), rounded to the dollar. None is
// typed in anywhere: the two that used to be ($299 and $99) were 14% high
// and 5% low against what a US card was actually charged, and yearly,
// Business and storage had none. Shown dollars first, because the buyers are
// mostly in the US, with the rupee charge beside it and currencyNote()
// wherever money is paid. See business/onecamp/usdRate.go in onemana-backend.

import { site } from "./site";

export interface Pricing {
  currency: string;
  /** Rupees to the dollar every *_usd was worked out at, and when it was fetched. */
  usd_rate: number;
  usd_rate_at: string;
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
  cloud_yearly_usd: number;
  cloud_yearly_paise: number;
  cloud_yearly_free_months: number;
  cloud_yearly_configured: boolean;
  /** Extra file storage, bought from the account page for a live workspace. Shown only when configured. */
  storage_addon_inr: number;
  storage_addon_usd: number;
  storage_addon_paise: number;
  storage_addon_gb: number;
  storage_addon_configured: boolean;
  /** Business: a larger machine for up to business_seats people. Shown only when business_configured. */
  business_inr: number;
  business_usd: number;
  business_paise: number;
  business_seats: number;
  business_configured: boolean;
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
/** Rupees to the dollar for the fallback below, until the backend answers. */
export const DEFAULT_USD_RATE = 95;

/** A rupee price in whole dollars at a rate, as the backend works it out. */
export function usdAt(paise: number, rate: number): number {
  return paise > 0 && rate > 0 ? Math.round(paise / 100 / rate) : 0;
}

export const defaultPricing: Pricing = {
  currency: "INR",
  usd_rate: DEFAULT_USD_RATE,
  usd_rate_at: "",
  lifetime_inr: 24999,
  lifetime_usd: usdAt(2499900, DEFAULT_USD_RATE),
  lifetime_paise: 2499900,
  cloud_inr: 9999,
  cloud_usd: usdAt(999900, DEFAULT_USD_RATE),
  cloud_paise: 999900,
  cloud_seats: 30,
  cloud_configured: false,
  cloud_yearly_inr: 0,
  cloud_yearly_usd: 0,
  cloud_yearly_paise: 0,
  cloud_yearly_free_months: 0,
  cloud_yearly_configured: false,
  storage_addon_inr: 2999,
  storage_addon_usd: usdAt(299900, DEFAULT_USD_RATE),
  storage_addon_paise: 299900,
  storage_addon_gb: 500,
  storage_addon_configured: false,
  business_inr: 24999,
  business_usd: usdAt(2499900, DEFAULT_USD_RATE),
  business_paise: 2499900,
  business_seats: 100,
  business_configured: false,
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

/** A price in running text: "$105/mo (₹9,999)", dollars first, the charge beside it. */
export function dual(usdAmount: number, inrAmount: number, per = ""): string {
  return `${fmtUSD(usdAmount)}${per} (${fmtINR(inrAmount)})`;
}

/**
 * The line under every price list and beside every pay button. A card
 * outside India is charged in rupees and converted by the card's issuer, so
 * the dollar figure is close, not exact, and saying so here is cheaper than
 * a buyer finding out on their statement.
 */
export function currencyNote(p: Pricing): string {
  const rate = p.usd_rate > 0 ? ` (₹${p.usd_rate.toFixed(2)} to the dollar)` : "";
  return `You pay in Indian rupees. Dollar amounts are at today's exchange rate${rate}; your card converts at its own rate and may add a small foreign transaction fee.`;
}
