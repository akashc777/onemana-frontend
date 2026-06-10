"use client";

import type { ReactNode } from "react";
import { useParallax } from "./useParallax";

/**
 * ParallaxBox applies a subtle scroll-linked translateY to its children. It is
 * a thin client wrapper around useParallax so server components (like the home
 * page) can opt into the effect without becoming client components themselves.
 */
export function ParallaxBox({
  children,
  speed = 0.12,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useParallax<HTMLDivElement>(speed);
  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
