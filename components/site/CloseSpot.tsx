"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CAMP_HUES } from "@/lib/campHue";
import { Spark } from "@/components/ui/graphics/motifs";
import { Ambient } from "@/components/ui/Ambient";
import { LogoRing, SparkMark } from "@/components/ui/v3";
import { CloseOrbit } from "@/components/ui/graphics/v3marks";

/** Fourteen camp-hued sparks leaving the spot (G11), their way out set by --spark-x and --spark-y. */
const SPARKS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const d = 90 + (i % 3) * 22;
  return { hue: CAMP_HUES[i % 6]!, x: `${Math.round(Math.cos(a) * -d)}px`, y: `${Math.round(Math.sin(a) * -d)}px`, left: 140 + Math.cos(a) * d, top: 140 + Math.sin(a) * d, size: 8 + (i % 3) * 3 };
});

const SEEN = "onecamp-close-burst";

/**
 * The close's welcome spot (site.md H11): a raised 128px disc holding the
 * gradient ring, two rings round it (one dashed), and the six camp hues
 * orbiting at 122px in 40s, with the brand spark at the top right. The
 * first time it is half on screen, once a session, it bursts into fourteen
 * sparks (G11's one burst on this page). Never under reduced motion; the
 * orbit pauses off screen and stops for reduced motion. 160px on a phone.
 */
export function CloseSpot() {
  const ref = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (sessionStorage.getItem(SEEN)) return;
    } catch {
      /* storage blocked: burst anyway, once for this page */
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setBurst(true);
        try {
          sessionStorage.setItem(SEEN, "1");
        } catch {
          /* nothing to remember it in */
        }
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className="relative size-40 shrink-0 sm:size-[280px]">
      <Ambient as="span" className="absolute left-0 top-0 block origin-top-left scale-[0.5714] sm:scale-100" style={{ width: 280, height: 280 }}>
        <CloseOrbit />
        <span className="absolute left-[76px] top-[76px] flex size-32 items-center justify-center rounded-full bg-card shadow-e2">
          <LogoRing size={72} stroke={4} />
        </span>
        <SparkMark size={18} className="absolute right-[64px] top-[48px]" />
        {burst &&
          SPARKS.map((s, i) => (
            <span key={i} className="absolute animate-spark-out" style={{ left: s.left, top: s.top, "--spark-x": s.x, "--spark-y": s.y } as CSSProperties}>
              <Spark hue={s.hue} size={s.size} />
            </span>
          ))}
      </Ambient>
    </div>
  );
}
