// The Cloud workspace's address and edition, chosen before paying.
//
// WHY ON /buy. A buyer used to pay first, then sign in to the account page in a
// second session to name the workspace and choose an edition, and nothing was
// built until they had. Both questions are on the checkout now: the backend
// keeps the answers with the subscription and names the workspace the moment
// the payment arrives (business/onecamp/cloudAddress.go in onemana-backend).
//
// The rules for what a name may be live in the backend (ValidateSlug), which
// answers the live check with the reason in words. This only keeps what is
// typed to the characters an address can have, so the field never shows
// something the check will refuse for its shape alone.

import { site } from "./site";

/** The zone a managed workspace's address is in. */
export const WORKSPACE_ZONE = "onemana.dev";

/** What a name typed into the address field becomes: lower case, and only
 *  letters, digits and hyphens. Spaces and dots become hyphens, so a company
 *  name typed as it is spelled still makes an address. */
export function slugFromInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s._]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 30);
}

/** The backend's answer to "can I have this name?". */
export interface SlugCheck {
  slug: string;
  domain?: string;
  available: boolean;
  /** False when the zone or the records could not be read: not a verdict. */
  checked: boolean;
  reason?: string;
}

/** Asks the backend about a name (GET /onecamp/cloud/slug-available). */
export async function checkSlug(slug: string, signal?: AbortSignal): Promise<SlugCheck> {
  const res = await fetch(`${site.backendUrl}/onecamp/cloud/slug-available?slug=${encodeURIComponent(slug)}`, { signal });
  const data = (await res.json().catch(() => ({}))) as { data?: SlugCheck; msg?: string };
  if (!res.ok || !data.data) {
    return { slug, available: false, checked: false, reason: data.msg };
  }
  return data.data;
}

/** How the field reads after a check: ok (free), bad (refused, with why) or
 *  unknown (nobody could say; the payment goes ahead and the name is checked
 *  again when it arrives). */
export interface SlugVerdict {
  tone: "ok" | "bad" | "unknown";
  text: string;
  /** Whether the checkout may go ahead with this name. */
  canPay: boolean;
}

export function slugVerdict(check: SlugCheck): SlugVerdict {
  const address = check.domain || `${check.slug}.${WORKSPACE_ZONE}`;
  if (check.available) {
    return { tone: "ok", text: `${address} is free.`, canPay: true };
  }
  // A refusal the backend could stand behind: the shape, a reserved word, or a
  // name in use. Its own words, because it knows which.
  if (check.checked || !isLookupFailure(check.reason)) {
    return { tone: "bad", text: sentence(check.reason || `${address} is not available.`), canPay: false };
  }
  return {
    tone: "unknown",
    text: `We could not check ${address} just now. You can still go ahead: we check it again when your payment arrives, and if it is taken you choose another after paying.`,
    canPay: true,
  };
}

/** A reason the lookup failed rather than the name. */
function isLookupFailure(reason?: string): boolean {
  return !reason || /could not check/i.test(reason);
}

/** The backend's reasons are lower-case clauses; on their own they read as a sentence. */
function sentence(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const first = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

/** The AI choice, in plain words. The values are what the backend's
 *  tierForEdition reads; "v1" and "v2" are never shown to a buyer. */
export const EDITION_CHOICES = [
  { value: "ai", label: "With AI features", hint: "AI teammates on a model we run on your workspace's own server, so no key is needed. You can connect your own provider later." },
  { value: "no-ai", label: "Without AI", hint: "No models, no agents, no calls to an AI provider. For teams whose policy does not allow AI on their data." },
] as const;

export type EditionChoice = (typeof EDITION_CHOICES)[number]["value"];

/** An edition in plain words, from whether it has AI. */
export function editionLabel(hasAI: boolean): string {
  return hasAI ? "With AI features" : "Without AI";
}
