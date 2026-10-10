/**
 * Where a visitor is, as far as money goes: their country, whether that is
 * India, and the currency the estimate under a rupee price is shown in.
 *
 * WHY. Most buyers are outside India and every charge is in rupees. A buyer
 * in London, Berlin or Singapore was shown a dollar estimate under the rupee
 * price, which is a second conversion to do in their head, and India-only
 * words (GST) that meant nothing to them, or the wrong thing in Singapore.
 *
 * THE SIGNALS are guessCountry's, the same ones the checkout's country field
 * starts from: the time zone, then the language's region, else the United
 * States. A visitor in a country with a display currency (owner decision D1,
 * 11 Oct 2026: the euro, the pound and the Singapore, Australian and Canadian
 * dollars) sees that currency; everyone else sees dollars. The amount is the
 * rupee price over the backend's rupees-per-unit for the day (rates on
 * /onecamp/pricing). No amount and no rate is typed here.
 */
import { countries } from "./countries";
import { guessCountry } from "./guessCountry";

export type DisplayCurrency = "USD" | "EUR" | "GBP" | "SGD" | "AUD" | "CAD";

/** The euro area in 2026 (Bulgaria joined on 1 January 2026). */
const EUROZONE = new Set([
  "AT", "BE", "BG", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES",
]);

const OWN: Record<string, DisplayCurrency> = { GB: "GBP", SG: "SGD", AU: "AUD", CA: "CAD" };

/** The currency a visitor from a country is shown estimates in. */
export function currencyFor(country: string): DisplayCurrency {
  const c = country.toUpperCase();
  if (EUROZONE.has(c)) return "EUR";
  return OWN[c] ?? "USD";
}

export interface Region {
  /** ISO 3166 alpha-2, upper case. */
  country: string;
  inIndia: boolean;
  currency: DisplayCurrency;
  /** The visitor's language, for digit grouping; never en-IN outside India. */
  locale: string;
}

/** A region for a country, formatted in a locale (the browser's, when known). */
export function regionFor(country: string, locale = "en-US"): Region {
  const c = country.toUpperCase();
  const inIndia = c === "IN";
  // A visitor abroad with an Indian English browser still reads 1,460,000:
  // lakh grouping is for readers in India.
  const loc = !inIndia && /-IN$/i.test(locale) ? "en-US" : locale;
  return { country: c, inIndia, currency: currencyFor(c), locale: loc };
}

const KNOWN = new Set(countries.map((c) => c.code));

/** The browser's region. Call only in the browser, after mount. */
export function detectRegion(): Region {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  const country = guessCountry(Intl.DateTimeFormat().resolvedOptions().timeZone, languages, KNOWN);
  return regionFor(country, languages[0] || "en-US");
}

/**
 * How each display currency is written. The symbol is fixed rather than left
 * to the locale, because a locale's own currency is written "$" (en-SG,
 * en-AU, en-CA) and a foreign one "SGD" or "CA$": the owner's list is
 * $, €, £, S$, A$, C$, wherever the reader is.
 */
const SYMBOL: Record<Exclude<DisplayCurrency, "EUR">, string> = { USD: "$", GBP: "£", SGD: "S$", AUD: "A$", CAD: "C$" };

/** A whole amount in a display currency: "$258", "S$336", "224 €" (de) or "€224" (en). */
export function fmtLocal(amount: number, currency: DisplayCurrency, locale = "en-US"): string {
  const n = Math.round(amount || 0);
  if (currency === "EUR") {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
    } catch {
      return `€${n.toLocaleString("en-US")}`;
    }
  }
  let digits: string;
  try {
    digits = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.abs(n));
  } catch {
    digits = Math.abs(n).toLocaleString("en-US");
  }
  return `${n < 0 ? "-" : ""}${SYMBOL[currency]}${digits}`;
}
