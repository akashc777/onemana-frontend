"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ArticleHeading } from "@/lib/article";

/**
 * "On this page", beside a long article on a wide screen, marking the section
 * being read. The headings come from lib/article.ts, so every link has a
 * target. Which section is current is worked out by an IntersectionObserver
 * (no scroll listener): a heading becomes current as it passes the top third
 * of the window, and the one before it does again when it goes back down.
 */
export function OnThisPage({ headings }: { headings: ArticleHeading[] }) {
  const [current, setCurrent] = useState(headings[0]?.id ?? "");
  // The brand bar slides to the current item (site.md D2): it moves by
  // transform alone, and takes the item's height at once, so nothing is laid
  // out again as it moves.
  const list = useRef<HTMLUListElement>(null);
  const [bar, setBar] = useState<{ y: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const a = list.current?.querySelector<HTMLElement>(`a[href="#${CSS.escape(current)}"]`);
    if (a) setBar({ y: a.offsetTop, h: a.offsetHeight });
  }, [current]);

  useEffect(() => {
    const ids = headings.map((h) => h.id);
    const targets = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    // The observer reports every heading once when it starts; only a heading
    // that later leaves the band downwards (the reader going back up) hands
    // "current" to the one before it.
    const seen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const first = !seen.has(entry.target);
          seen.add(entry.target);
          if (entry.isIntersecting) setCurrent(entry.target.id);
          else if (!first && entry.rootBounds && entry.boundingClientRect.top >= entry.rootBounds.bottom) {
            const i = ids.indexOf(entry.target.id);
            if (i > 0) setCurrent(ids[i - 1]);
          }
        }
      },
      // The band a heading is "current" in: below the 56 px nav, above the lower two thirds.
      { rootMargin: "-72px 0px -66% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-labelledby="on-this-page" className="text-caption">
      <p id="on-this-page" className="mb-3 font-medium text-foreground">
        On this page
      </p>
      <ul ref={list} className="relative border-l border-border">
        {bar && (
          <li aria-hidden="true" className="pointer-events-none absolute -left-px top-0 w-0.5 rounded-full bg-brand transition-transform duration-panel ease-in-out" style={{ height: bar.h, transform: `translateY(${bar.y}px)` }} />
        )}
        {headings.map((h) => {
          const active = h.id === current;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => setCurrent(h.id)}
                aria-current={active ? "location" : undefined}
                className={`-ml-px block text-balance border-l py-1.5 pr-2 transition-colors ${h.level === 3 ? "pl-6" : "pl-3"} ${
                  active ? "border-transparent font-[510] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
