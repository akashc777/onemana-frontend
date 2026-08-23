"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { trackEvent, trackPageview } from "@/lib/track";

/**
 * Sends an anonymous pageview on every route change (skips the admin area).
 * Renders nothing.
 */
export function VisitorTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackPageview(pathname);
  }, [pathname]);

  // ONE LISTENER RATHER THAN SEVEN onClick HANDLERS. The demo is linked from the
  // nav, the hero, the sticky bar, the social proof block and the about page, and
  // an eighth link will be added by somebody who has never read this file. A
  // delegated listener catches every anchor pointing at the demo, including ones
  // that do not exist yet, so the measurement cannot silently lose a placement.
  //
  // The beacon uses keepalive, so it survives the navigation it is reporting.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      const href = anchor?.getAttribute("href");
      if (href && site.demoUrl && href.startsWith(site.demoUrl)) trackEvent("demo-click");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
