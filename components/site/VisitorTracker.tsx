"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import {
  demoClickEvent,
  getVisitorId,
  opensDemo,
  trackEvent,
  trackPageview,
  withVisitorId,
} from "@/lib/track";

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
  //
  // TAGGING AND COUNTING ARE SEPARATE, on purpose and not for tidiness.
  // Tagging has to happen before anything can start a navigation, which is
  // pointerdown: a middle click, a right click into "open in new tab" and a
  // drag to another window all begin there and some of them never fire `click`
  // at all. Counting has to happen only when the demo is really being opened,
  // which a right click is not. Doing both in one handler meant either missing
  // the tag or inventing the visit.
  useEffect(() => {
    const demoAnchor = (e: Event): HTMLAnchorElement | null => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!href || !site.demoUrl || !href.startsWith(site.demoUrl)) return null;
      return a as HTMLAnchorElement;
    };

    // Carry the visitor id across the domain boundary. Rewriting here rather
    // than in site.demoStartUrl means the links in static nav config get it
    // too, including the ones nobody has written yet.
    const tag = (a: HTMLAnchorElement) => {
      const href = a.getAttribute("href");
      if (href) a.setAttribute("href", withVisitorId(href));
    };

    const onDown = (e: Event) => {
      const a = demoAnchor(e);
      if (a) tag(a);
    };

    const onOpen = (e: MouseEvent) => {
      if (!opensDemo(e.type, e.button)) return;
      const a = demoAnchor(e);
      if (!a) return;
      tag(a); // a keyboard Enter sends no pointerdown, so this is its only tag
      trackEvent(demoClickEvent(Boolean(getVisitorId())));
    };

    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("click", onOpen, true);
    document.addEventListener("auxclick", onOpen, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("click", onOpen, true);
      document.removeEventListener("auxclick", onOpen, true);
    };
  }, []);

  return null;
}
