"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Tilt gives its child a tactile 3D tilt toward the pointer plus a soft sheen
 * that tracks the cursor. Transform-only (GPU). It disables itself on touch
 * devices and under prefers-reduced-motion, rendering a plain wrapper so the
 * card still looks and behaves correctly.
 */
export function Tilt({
  children,
  className = "",
  max = 7,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!reduce && !coarse);
  }, []);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 2 * max;
    const rx = -(py - 0.5) * 2 * max;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`tilt-card relative transition-transform duration-200 ease-out [transform-style:preserve-3d] ${className}`}
      style={{ willChange: "transform" }}
    >
      {children}
      <span aria-hidden className="tilt-sheen pointer-events-none absolute inset-0 rounded-2xl" />
    </div>
  );
}
