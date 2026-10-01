import { adminApi } from "./adminApi";
import { getVisitorId, markInternal } from "./track";

/**
 * A short name for a browser, so the operator can tell their laptop from their
 * phone in the exclusion list. Pure, so it is tested without a browser.
 */
export function browserLabel(ua: string): string {
  const u = ua || "";
  const browser = /Edg\//.test(u)
    ? "Edge"
    : /OPR\//.test(u)
      ? "Opera"
      : /Firefox\//.test(u)
        ? "Firefox"
        : /Chrome\//.test(u)
          ? "Chrome"
          : /Safari\//.test(u)
            ? "Safari"
            : "Browser";
  const os = /iPhone/.test(u)
    ? "iPhone"
    : /iPad/.test(u)
      ? "iPad"
      : /Android/.test(u)
        ? "Android"
        : /Mac OS X/.test(u)
          ? "Mac"
          : /Windows/.test(u)
            ? "Windows"
            : /Linux/.test(u)
              ? "Linux"
              : "";
  return os ? `${browser} on ${os}` : browser;
}

/**
 * Called once the admin is signed in. This browser stops sending pageviews,
 * and its id goes on the server's exclusion list, which also takes its past
 * visits (and its demo visits) out of every report. Best effort: a failure
 * leaves the visits counted, never the admin stuck.
 */
export async function rememberOwnBrowser(): Promise<void> {
  markInternal();
  const id = getVisitorId();
  if (!id) return;
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  try {
    await adminApi.excludeBrowser(id, browserLabel(ua));
  } catch {
    /* counted until the next sign-in tries again */
  }
}
