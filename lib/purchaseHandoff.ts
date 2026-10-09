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
  /** Cloud: the workspace address chosen at checkout, without its zone. */
  slug?: string;
}

const STORE = "om_purchase";

// undefined until first read; then the result, or null when there is none.
// Kept as one object so repeated reads return the same reference, which is
// what useSyncExternalStore requires of a snapshot.
let held: PurchaseResult | null | undefined;

function shape(v: unknown): PurchaseResult | null {
  if (!v || typeof v !== "object") return null;
  const { email, key, slug } = v as { email?: unknown; key?: unknown; slug?: unknown };
  if (typeof email !== "string") return null;
  const out: PurchaseResult = { email };
  if (typeof key === "string" && key) out.key = key;
  // Only the characters an address can have: the receipt prints it.
  if (typeof slug === "string" && /^[a-z0-9-]{3,30}$/.test(slug)) out.slug = slug;
  return out;
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

/** What older receipt links carried in the address, and must not stay there. */
const ADDRESS_SECRETS = ["key", "email"];

/**
 * The receipt's address without the key or email an older link carried (path,
 * remaining query and hash), or null when there is nothing to take out.
 *
 * Links made before the hand-off above, and crafted ones, still put them in the
 * address. The receipt ignores them, and removes them so they are neither kept
 * in history nor sent as the referrer of the next page opened from it.
 */
export function withoutAddressSecrets(href: string): string | null {
  const url = new URL(href);
  if (!ADDRESS_SECRETS.some((p) => url.searchParams.has(p))) return null;
  for (const p of ADDRESS_SECRETS) url.searchParams.delete(p);
  return url.pathname + url.search + url.hash;
}
