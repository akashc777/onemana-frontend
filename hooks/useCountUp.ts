"use client";

import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Animates a number once when the element enters the viewport. */
export function useCountUp(target: number, { duration = 1400, enabled = true } = {}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  // START AT THE TARGET, NOT ZERO. The initial state is what the server renders,
  // and the server-rendered HTML is what every crawler, link preview and
  // slow-connection visitor sees before hydration. Starting at zero shipped
  // "<0 min to get running" and "0% on your infrastructure" to exactly those
  // readers, which is worse than no statistic: it looks broken and fake.
  //
  // The count-up still runs for a person who scrolls to it: the first frame
  // after intersection computes from p=0 and climbs, so the animation is
  // unchanged. Only the resting value before it starts is now correct.
  const [value, setValue] = useState(target);
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }

    const start = () => {
      if (ran.current) return;
      ran.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setValue(Math.round(easeOutCubic(p) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          obs.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, enabled]);

  return { ref, value };
}