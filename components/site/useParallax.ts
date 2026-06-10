"use client";

import { useEffect, useRef } from "react";

/**
 * useParallax translates an element on the Y axis as it scrolls through the
 * viewport, producing a subtle depth effect. It is GPU-only (transform), rAF
 * coalesced, observer-gated so off-screen elements do no work, and a no-op
 * under prefers-reduced-motion.
 *
 * @param speed Fraction of scroll distance to offset by. Positive moves the
 *              element slower than the page (drifts down); keep it small
 *              (0.05 - 0.2) for a tasteful effect.
 */
export function useParallax<T extends HTMLElement>(speed = 0.12) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let inView = false;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      // Distance of the element centre from the viewport centre.
      const fromCentre = rect.top + rect.height / 2 - window.innerHeight / 2;
      const offset = -fromCentre * speed;
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (raf || !inView) return;
      raf = window.requestAnimationFrame(update);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? false;
        if (inView) onScroll();
      },
      { threshold: 0 },
    );
    obs.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return ref;
}
