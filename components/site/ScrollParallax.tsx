"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Gentle scroll-linked vertical parallax (transform only, no scroll hijacking).
 * Triggers on an outer wrapper and moves an inner element a few percent as the
 * block passes through the viewport, adding depth. Skipped for
 * prefers-reduced-motion. The inner transform is independent of any entrance
 * animation applied to a parent, so it never fights a one-time reveal.
 */
export function ScrollParallax({
  children,
  className = "",
  amount = 5,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.fromTo(
      inner,
      { yPercent: amount },
      {
        yPercent: -amount,
        ease: "none",
        scrollTrigger: { trigger: outer, start: "top bottom", end: "bottom top", scrub: 0.5 },
      },
    );
    // Recompute positions once layout/images settle.
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 200);

    return () => {
      window.clearTimeout(t);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [amount]);

  return (
    <div ref={outerRef} className={className}>
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
