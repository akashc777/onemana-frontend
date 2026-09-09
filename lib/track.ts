import { site } from "./site";

const VID_KEY = "om_vid";

/** Returns a stable anonymous visitor id (localStorage), creating one if needed. */
export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(VID_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(VID_KEY, id);
    }
    return id;
  } catch {
    return "";
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

/** Fire-and-forget anonymous pageview beacon. Never blocks or throws. */
export function trackPageview(path: string): void {
  try {
    const body = JSON.stringify({
      visitor_id: getVisitorId(),
      path,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });
    void fetch(`${site.backendUrl}/onecamp/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}
