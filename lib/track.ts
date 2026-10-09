import { site } from "./site";

/*
 * WHAT THIS STORES, AND WHEN.
 *
 * One random id (om_vid) in localStorage, so a pageview can be joined to a
 * later checkout. The browser never invents it: the server issues it with the
 * first pageview and says whether it may be kept. For a visitor in the EEA, the
 * UK or Switzerland it says no, because storing a non-essential id on their
 * device needs consent there, and we would rather store nothing than show a
 * banner. They are counted for the day without anything on their device.
 *
 * Nothing at all is sent from a browser with Global Privacy Control or Do Not
 * Track switched on, or from the operator's own browsers (om_internal), which
 * the admin panel marks on sign-in. No cookies.
 */

const VID_KEY = "om_vid";
const INTERNAL_KEY = "om_internal";
const VID_SHAPE = /^[A-Za-z0-9-]{8,64}$/;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

/** The visitor id this browser was issued, or "" when it holds none. */
export function getVisitorId(): string {
  try {
    return storage()?.getItem(VID_KEY) ?? "";
  } catch {
    return "";
  }
}

/** The browser asked not to be tracked (Global Privacy Control, Do Not Track). */
export function optedOut(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true || nav.doNotTrack === "1";
}

/** This is one of the operator's own browsers. */
export function isInternal(): boolean {
  try {
    return storage()?.getItem(INTERNAL_KEY) === "1";
  } catch {
    return false;
  }
}

/** Marks this browser as the operator's, so it sends no more pageviews. */
export function markInternal(): void {
  try {
    storage()?.setItem(INTERNAL_KEY, "1");
  } catch {
    /* storage disabled: the server-side exclusion still applies */
  }
}

/**
 * Applies the server's answer to a beacon: keep the id it issued, or delete
 * any id held when it says this browser may keep none. Anything else (an old
 * server's empty reply, a network error) changes nothing. Exported for tests.
 */
export function applyVerdict(body: unknown): void {
  const s = storage();
  if (!s || !body || typeof body !== "object") return;
  const v = body as { store?: unknown; visitor_id?: unknown };
  try {
    if (v.store === true && typeof v.visitor_id === "string" && VID_SHAPE.test(v.visitor_id)) {
      s.setItem(VID_KEY, v.visitor_id);
    } else if (v.store === false) {
      s.removeItem(VID_KEY);
      noStore = true;
    }
  } catch {
    /* ignore */
  }
}

/** The demo reads this to attribute its funnel steps to the same visitor. */
export const VISITOR_PARAM = "vid";

/**
 * Adds the anonymous visitor id to a demo link, so the journey does not end at
 * the domain boundary.
 *
 * The demo is a different origin, so it cannot read the id this site stored: a
 * visitor who clicks through becomes a new, unrelated person, and every question
 * about what they did there has to be answered by guessing. Carrying the id over
 * is what makes "clicked demo" and "reached the task board" the same row.
 *
 * Idempotent, because the same anchor can be clicked more than once and a URL
 * with two vid parameters is a URL with none. Returns the input unchanged when
 * there is no id to add, which is the case in a browser with storage disabled.
 */
export function withVisitorId(href: string): string {
  const id = getVisitorId();
  if (!id) return href;
  try {
    const url = new URL(href);
    url.searchParams.set(VISITOR_PARAM, id);
    return url.toString();
  } catch {
    return href;
  }
}

/**
 * opensDemo says whether a pointer event is one that actually opens a link.
 *
 * A plain click is the obvious case. The middle button is the one that gets
 * missed: it opens a link in a new tab and it does NOT fire `click`, it fires
 * `auxclick`, so a listener bound only to `click` neither counts that visit nor
 * carries the visitor id into it. Those visitors then arrive at the demo as
 * strangers and every one of them widens the gap between "clicked" and
 * "arrived" for a reason that is ours, not theirs.
 *
 * The right button also fires `auxclick` and opens a context menu, not the
 * demo, so it must not be counted. It is still worth tagging the href by then,
 * which is why tagging and counting are separate decisions in the caller.
 */
export function opensDemo(type: string, button: number): boolean {
  if (type === "click") return true; // button 0, and keyboard Enter, which reports 0
  return type === "auxclick" && button === 1;
}

/**
 * demoClickEvent names the click by whether we can follow the visitor.
 *
 * A click made in a browser with site data blocked cannot be carried across the
 * domain boundary: the link goes out untagged and the demo has no way to know
 * the visit came from here. Recording it under the same name as a click we CAN
 * follow puts it in the numerator of a funnel it can never appear in the
 * denominator of, which reads as people leaving when it is really us losing
 * them. Naming it separately keeps the loss visible and keeps it out of the
 * conversion rate.
 */
export function demoClickEvent(tagged: boolean): string {
  return tagged ? "demo-click" : "demo-click-untagged";
}

/** Event paths live under this prefix so they can be told apart from pages.
 *  Counting them as pageviews would inflate traffic with things nobody browsed. */
export const EVENT_PREFIX = "/event/";

/**
 * Records something a visitor did, on the same beacon as pageviews.
 *
 * DELIBERATELY NOT A SECOND PIPELINE. The visits table already carries the
 * visitor id, the referrer and the timestamp, and the whole value of an event is
 * being able to join it to the same person's pageviews. A separate events table
 * would have needed its own endpoint, its own id, and a join written by hand
 * every time somebody asked "did the people who did this go on to buy".
 */
export function trackEvent(name: string): void {
  trackPageview(`${EVENT_PREFIX}${name}`);
}

// Set once the server has said this browser keeps no id, so later beacons
// stop waiting for one.
let noStore = false;
// Beacons sent before this browser has an id wait for the first answer, so
// they all carry the id it brings instead of each being issued a new one.
let first: Promise<void> | null = null;

async function send(path: string, referrer: string): Promise<void> {
  const res = await fetch(`${site.backendUrl}/onecamp/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitor_id: getVisitorId(), path, referrer }),
    keepalive: true,
  });
  applyVerdict(await res.json().catch(() => null));
}

/**
 * The referrer as the visit counter may keep it: no query string, no fragment.
 *
 * A referrer is the full address of whatever page linked here, and a query
 * string is where secrets travel. The purchase receipt once carried the buyer's
 * licence key and email in its address, and a page opened from it in a new tab
 * sent that whole address here as its referrer, to be stored for 13 months.
 * Reports only read the host (ClassifyReferrer in the backend), so nothing they
 * show is lost. Split on the characters rather than parsed as a URL, so
 * android-app:// and anything unparseable are cut the same way.
 */
export function referrerToSend(raw: string): string {
  return raw.split(/[?#]/, 1)[0];
}

/** Fire-and-forget anonymous pageview beacon. Never blocks or throws. */
export function trackPageview(path: string): void {
  try {
    if (optedOut() || isInternal()) return;
    const referrer = typeof document !== "undefined" ? referrerToSend(document.referrer) : "";
    if (getVisitorId() || noStore) {
      void send(path, referrer).catch(() => {});
      return;
    }
    if (!first) {
      first = send(path, referrer).catch(() => {});
      return;
    }
    void first.then(() => send(path, referrer)).catch(() => {});
  } catch {
    /* ignore */
  }
}
