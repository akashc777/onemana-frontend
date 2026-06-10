"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageview } from "@/lib/track";

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
  return null;
}
