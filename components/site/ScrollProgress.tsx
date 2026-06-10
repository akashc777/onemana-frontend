"use client";

import { useEffect, useRef } from "react";

/**
 * A slim reading-progress bar fixed to the top of the viewport. It writes the
 * scroll fraction into a CSS variable (--scroll-progress) and the bar scales
 * on the X axis only, so the work stays on the GPU compositor. Updates are
 * coalesced through requestAnimationFrame and it stays static when the user
 * prefers reduced motion.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const frac = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty("--scroll-progress", frac.toFixed(4));
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden>
      <div
        ref={ref}
        className="scroll-progress h-full bg-gradient-to-r from-brand via-accent-cyan to-accent-pink"
      />
    </div>
  );
}
