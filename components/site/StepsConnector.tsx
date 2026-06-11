"use client";

import { useEffect, useRef, useState } from "react";

/**
 * StepsConnector is a self-drawing SVG flow that links the three "how it works"
 * steps. When it scrolls into view the path draws itself once (stroke-dashoffset),
 * the step nodes light up in sequence, and a particle then travels along it.
 * Desktop-only (the steps stack on mobile), and fully drawn with no motion under
 * prefers-reduced-motion. The viewBox stretches (preserveAspectRatio="none") so
 * the three nodes sit centered over the three step columns.
 */
export function StepsConnector() {
  const ref = useRef<SVGSVGElement | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduce(true);
      setDrawn(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Node x positions (column centers) in the stretched 1000-wide viewBox.
  const nodes = [166, 500, 834];
  const path = "M166 40 C 320 -8, 360 88, 500 40 S 700 -8, 834 40";

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 80"
      preserveAspectRatio="none"
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-8 hidden h-16 w-full md:block"
    >
      <defs>
        <linearGradient id="steps-flow" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34e3e3" />
          <stop offset="0.5" stopColor="#6d5efc" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
      </defs>

      {/* faint base track */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

      {/* drawing line */}
      <path
        d={path}
        fill="none"
        stroke="url(#steps-flow)"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: drawn ? 0 : 1,
          transition: "stroke-dashoffset 1.6s cubic-bezier(0.65,0,0.35,1)",
        }}
        id="steps-path"
      />

      {/* nodes */}
      {nodes.map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={40}
            r="6"
            fill="#0b0b12"
            stroke="url(#steps-flow)"
            strokeWidth="2"
            style={{
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.4s ease ${reduce ? 0 : 0.4 + i * 0.5}s`,
            }}
          />
          <circle
            cx={x}
            cy={40}
            r="2.5"
            fill="url(#steps-flow)"
            style={{
              opacity: drawn ? 1 : 0,
              transition: `opacity 0.4s ease ${reduce ? 0 : 0.5 + i * 0.5}s`,
            }}
          />
        </g>
      ))}

      {/* particle traveling the flow after it is drawn */}
      {drawn && !reduce && (
        <circle r="3.5" fill="#fff">
          <animateMotion dur="2.4s" begin="1.7s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#steps-path" />
          </animateMotion>
          <animate attributeName="opacity" dur="2.4s" begin="1.7s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
        </circle>
      )}
    </svg>
  );
}
