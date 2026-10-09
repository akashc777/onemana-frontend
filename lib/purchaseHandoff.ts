/**
 * What the checkout hands to the purchase receipt, kept out of the address bar.
 *
 * The licence key and the buyer's email used to travel in the receipt's URL
 * (/buy/success?email=...&key=...). A URL is the worst place for either: it
 * goes into browser history and history sync, into the request log of the host
 * serving the page (a client-side navigation fetches the URL, query string
 * included), and into the Referer of the next page opened from it. And it let
 * anyone craft a link that made the receipt print a command of their choosing.
 *
 * The checkout and the receipt run in the same tab, one navigation apart, so
 * the result is held here instead: in memory for that navigation, and in this
 * tab's sessionStorage so a reload still shows it. Neither leaves the tab.
 * Nothing read back is trusted for its shape; the receipt validates the key
 * before it builds anything from it (lib/installCommand).
 */
export interface PurchaseResult {
  email: string;
  key?: string;
}

const STORE = "om_purchase";

// undefined until first read; then the result, or null when there is none.
// Kept as one object so repeated reads return the same reference, which is
// what useSyncExternalStore requires of a snapshot.
let held: PurchaseResult | null | undefined;

function shape(v: unknown): PurchaseResult | null {
  if (!v || typeof v !== "object") return null;
  const { email, key } = v as { email?: unknown; key?: unknown };
  if (typeof email !== "string") return null;
  return typeof key === "string" && key ? { email, key } : { email };
}

/** Called by the checkout just before it opens the receipt. */
export function savePurchase(result: PurchaseResult): void {
  held = shape(result);
  try {
    sessionStorage.setItem(STORE, JSON.stringify(held));
  } catch {
    /* storage blocked: the copy in memory still serves this navigation */
  }
}

/** The result this tab's checkout left, or null (a direct visit, another tab). */
export function readPurchase(): PurchaseResult | null {
  if (held !== undefined) return held;
  held = null;
  try {
    held = shape(JSON.parse(sessionStorage.getItem(STORE) ?? "null"));
  } catch {
    /* no storage here, or a value that is not ours */
  }
  return held;
}
