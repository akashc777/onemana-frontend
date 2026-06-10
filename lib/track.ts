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
