"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  /** Entrance direction. Defaults to "up". */
  direction?: "up" | "down" | "left" | "right" | "scale";
  className?: string;
  as?: ElementType;
}

function isInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  return rect.top < vh * 0.92 && rect.bottom > vh * 0.08;
}

/**
 * Reveal animates its children into view on first scroll-intersection using a
 * single IntersectionObserver - no animation library, and a no-op when
 * prefers-reduced-motion is set. The entrance is GPU-only (transform/opacity).
 *
 * Content is visible until proven otherwise. It used to render at opacity 0 and
 * wait for the observer, so without JavaScript (crawlers, link previews, reader
 * mode, a full-page capture) whole sections of the page were blank. Now only a
 * block that starts below the fold is held back, after hydration, and only
 * until it is reached; printing releases everything.
 */
export function Reveal({ children, delay = 0, direction = "up", className = "", as }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || isInViewport(el)) return;
    setPending(true);
    const release = () => setPending(false);
    window.addEventListener("beforeprint", release);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPending(false);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      window.removeEventListener("beforeprint", release);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal reveal-${direction} ${pending ? "is-pending" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}