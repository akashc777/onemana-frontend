"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";

/** Persistent CTA while scrolling - demo + buy. Hides near pricing and page footer. */
export function StickyBuyCta() {
  const [visible, setVisible] = useState(false);
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const pricing = document.getElementById("pricing");
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight - 80;
      const pricingRect = pricing?.getBoundingClientRect();
      const nearPricing = pricingRect ? pricingRect.top < window.innerHeight * 0.85 && pricingRect.bottom > 0 : false;
      setVisible(y > 480 && y < max && !nearPricing);

      if (Math.abs(y - lastY.current) > 6) {
        setCompact(y > lastY.current && y > 600);
        lastY.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      } ${compact ? "sticky-cta-compact" : ""}`}
      role="complementary"
      aria-label="Quick actions"
    >
      <div className="border-t border-border bg-background/92 px-4 py-3 shadow-[0_-4px_24px_rgb(0_0_0/0.06)] backdrop-blur-xl dark:shadow-[0_-4px_24px_rgb(0_0_0/0.25)] sm:px-6">
        <div className="container-x flex items-center justify-between gap-3">
          <p className="hidden text-sm text-muted-foreground md:block">
            <span className="font-medium text-foreground">Pay once.</span> Unlimited users on your server.
          </p>
          <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <ButtonLink
              href={site.demoUrl}
              external
              variant="ghost"
              size="sm"
              className="min-w-0 flex-1 sm:flex-initial"
            >
              <span className="sm:hidden">Live demo</span>
              <span className="hidden sm:inline">Try live demo</span>
            </ButtonLink>
            <ButtonLink href="/buy" variant="brandPremium" size="sm" className="min-w-0 flex-1 sm:flex-initial">
              Get OneCamp
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}