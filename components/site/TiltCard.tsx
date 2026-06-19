"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

/**
 * Pointer-reactive 3D tilt with a soft glare, GSAP-eased for a premium feel.
 * Disabled on touch devices and when prefers-reduced-motion is set, so it only
 * enhances mouse/trackpad users and never harms accessibility or mobile.
 */
export function TiltCard({
  children,
  className = "",
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    gsap.set(el, { transformPerspective: 900, transformStyle: "preserve-3d", willChange: "transform" });
    const qX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3.out" });
    const qY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      qY(px * max * 2);
      qX(-py * max * 2);
      el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    };
    const onLeave = () => {
      qX(0);
      qY(0);
      el.style.setProperty("--glare-o", "0");
    };
    const onEnter = () => el.style.setProperty("--glare-o", "1");

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
    };
  }, [max]);

  return (
    <div ref={ref} className={className}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: "var(--glare-o, 0)",
          background:
            "radial-gradient(60% 60% at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,0.14), transparent 60%)",
        }}
      />
    </div>
  );
}
