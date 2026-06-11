"use client";

import { useEffect, useRef } from "react";

/**
 * Spotlight is a soft radial glow that follows the pointer within its parent
 * section (the hero). It writes the pointer position into CSS vars and the glow
 * is painted by a radial-gradient - no layout work, rAF coalesced. It is a
 * no-op on touch devices and under prefers-reduced-motion.
 */
export function Spotlight({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (inside) {
        el.style.setProperty("--mx", `${x - rect.left}px`);
        el.style.setProperty("--my", `${y - rect.top}px`);
        el.style.opacity = "1";
      } else {
        el.style.opacity = "0";
      }
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={`spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 ${className}`}
    />
  );
}
