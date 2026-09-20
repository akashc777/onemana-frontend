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
