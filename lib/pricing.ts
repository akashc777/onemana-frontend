// Dual-currency pricing. Charges always happen in INR (enforced server-side).
//
// THE RUPEE PRICE IS THE PRICE. Every dollar figure is that charge at the
// backend's daily exchange rate (usd_rate), rounded to the dollar. None is
// typed in anywhere: the two that used to be ($299 and $99) were 14% high
// and 5% low against what a US card was actually charged, and yearly,
// Business and storage had none. Rupees first since 10 Oct 2026: the charge
// is in rupees, so showing dollars large and rupees small put the estimate
// above the fact. currencyNote() goes wherever money is paid. See
// business/onecamp/usdRate.go in onemana-backend.

import { site } from "./site";
import { fmtLocal, type DisplayCurrency, type Region } from "./visitorCurrency";

export interface Pricing {
  currency: string;
  /** Rupees to the dollar every *_usd was worked out at, and when it was fetched. */
  usd_rate: number;
  usd_rate_at: string;
  /** Rupees to one unit of the dollar and of each display currency (EUR,
   *  GBP, SGD, AUD, CAD), from the same daily fetch, and when. Absent from an
   *  older backend: estimates are then in dollars. See lib/visitorCurrency. */
  rates?: Partial<Record<DisplayCurrency, number>>;
  rates_at?: string;
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
  /** Buyers outside India are charged the dollar price for the licence (the backend's charge_usd). */
  charge_usd: boolean;
  /** How long a new workspace of each size takes, from the backend's one estimate
   *  (business/onecamp/setupEstimate.go). Absent until the backend answers: the
   *  pages then say no time at all rather than a guess of their own. */
  cloud_setup?: SetupEstimate;
  business_setup?: SetupEstimate;
}

/** How long a new Cloud workspace takes; see setupEstimateFor. */
export interface SetupEstimate {
  /** A free machine of the size is in the pool now. */
  spare: boolean;
  /** Fits in a phrase: "about an hour", "usually within a day". */
  short: string;
  /** Says it whole. */
  sentence: string;
}

/** The estimate for the plan being bought, or null when the backend has not said. */
export function setupEstimateFor(p: Pricing, business: boolean): SetupEstimate | null {
  const e = business ? p.business_setup : p.cloud_setup;
  return e && e.sentence ? e : null;
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
  charge_usd: false,
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

/**
 * The line under every price list and beside every pay button. A card
 * outside India is charged in rupees and converted by the card's issuer, so
 * the dollar figure is close, not exact, and saying so here is cheaper than
 * a buyer finding out on their statement.
 */
export function currencyNote(p: Pricing, ctx: { inIndia?: boolean; cloud?: boolean } = {}): string {
  const rate = p.usd_rate > 0 ? ` (₹${p.usd_rate.toFixed(2)} to the dollar)` : "";
  const rupees = `Dollar amounts are at today's exchange rate${rate}; your card converts at its own rate and may add a small foreign transaction fee.`;
  if (!p.charge_usd) return `You pay in Indian rupees. ${rupees}`;
  // The licence is charged in dollars outside India; Cloud is still a rupee
  // subscription. Say which applies to what this note sits under.
  if (ctx.cloud) return `OneCamp Cloud is billed in Indian rupees. ${rupees}`;
  if (ctx.inIndia === true) return "You pay in Indian rupees, with a GST invoice.";
  if (ctx.inIndia === false) return "Charged in US dollars: the price shown is the amount on your card.";
  return `The licence is charged in US dollars outside India and in rupees in India. OneCamp Cloud is billed in rupees: ${rupees.charAt(0).toLowerCase()}${rupees.slice(1)}`;
}

/**
 * Rupees in a reader's grouping: en-IN ("₹14,60,000") for India and the
 * international grouping ("₹1,460,000") for everyone else, who would read a
 * lakh comma as a typo. The amount is the same.
 */
const inrIntl = new Intl.NumberFormat("en-US", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export function fmtINRFor(n: number, region: Region | null): string {
  return region?.inIndia ? fmtINR(n) : inrIntl.format(n || 0);
}

/** Rupees to one unit of a currency today, or 0 when the backend has not said. */
function rupeesPer(p: Pricing, currency: DisplayCurrency): number {
  if (currency === "USD") return p.rates?.USD || p.usd_rate || 0;
  return p.rates?.[currency] || 0;
}

/**
 * A rupee amount in the reader's own currency, at the day's rate: "≈ €224".
 * Dollars when the region is not known yet (the server's HTML) or its
 * currency has no rate. "" in India, where the rupee is home, and when there
 * is no amount or no rate at all. Worked out, never typed.
 */
export function localEstimate(p: Pricing, inr: number, region: Region | null): string {
  if (region?.inIndia || !(inr > 0)) return "";
  let currency: DisplayCurrency = region?.currency ?? "USD";
  if (!rupeesPer(p, currency)) currency = "USD";
  const rate = rupeesPer(p, currency);
  if (!rate) return "";
  return `≈ ${fmtLocal(inr / rate, currency, region?.locale ?? "en-US")}`;
}

/**
 * A rupee price in running text, with localEstimate beside it: "₹24,999
 * (≈ £194)", "₹9,999/mo (≈ $103)". The rupees alone in India, and when there
 * is no rate to estimate with. The one way a sentence or a button writes a
 * price; a plan card gives the same estimate on a line of its own
 * (components/site/RegionalMoney).
 */
export function priceWithEstimate(p: Pricing, inr: number, region: Region | null, per = ""): string {
  const estimate = localEstimate(p, inr, region);
  const rupees = `${fmtINRFor(inr, region)}${per}`;
  return estimate ? `${rupees} (${estimate})` : rupees;
}

/**
 * A US-dollar amount (a rival's list price) in the reader's currency, through
 * the day's rupee rates: the dollar figure itself when the reader is in a
 * dollar country or their currency has no rate. Rupees for India.
 */
export function fromUsd(p: Pricing, usd: number, region: Region | null): string {
  // Round as a reader would say it: a year of a stack to the hundred (the
  // thousand in rupees), a server's month to the unit.
  const round = (n: number, step: number) => (n >= step * 10 ? Math.round(n / step) * step : Math.round(n));
  if (region?.inIndia) return fmtINR(round(usd * (p.usd_rate || DEFAULT_USD_RATE), 1000));
  const currency = region?.currency ?? "USD";
  const usdRate = rupeesPer(p, "USD");
  const target = rupeesPer(p, currency);
  if (currency === "USD" || !usdRate || !target) return fmtLocal(round(usd, 100), "USD", region?.locale);
  return fmtLocal(round((usd * usdRate) / target, 100), currency, region?.locale);
}

/** What the line under a rupee price says beside the estimate (A1). */
export const BILLED_IN_RUPEES = "billed in Indian rupees, your card converts";

/**
 * The words about tax that depend on where the buyer is. India's are about
 * GST. Elsewhere, and on the server before the visitor is known, they make no
 * claim about the buyer's own country's tax at all: the price is the total
 * charged, and the invoice comes from an Indian company. Never a VAT claim.
 */
export function taxWords(inIndia: boolean | undefined) {
  return inIndia
    ? {
        priceLine: "GST included",
        invoice: "a GST invoice",
        faqQ: "Do prices include GST?",
        faqA: "Yes. The price you see is the price you pay, and the GST invoice splits the tax out of it.",
      }
    : {
        priceLine: "No tax added at checkout",
        invoice: "an invoice from our Indian company",
        faqQ: "Is tax added at checkout?",
        faqA: "No. The price shown is the total charged. The invoice comes from OneMana Solutions in India, in rupees.",
      };
}
