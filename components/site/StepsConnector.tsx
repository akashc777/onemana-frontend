"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

function useIsDark() {
  const { resolvedTheme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(resolvedTheme === "dark");
  }, [resolvedTheme]);
  return isDark;
}

/**
 * StepsConnector is a self-drawing SVG flow that links the three "how it works"
 * steps. When it scrolls into view the path draws itself once (stroke-dashoffset),
 * the step nodes light up in sequence, and a particle then travels along it.
 * Desktop-only (the steps stack on mobile), and fully drawn with no motion under
 * prefers-reduced-motion. The viewBox stretches (preserveAspectRatio="none") so
 * the three nodes sit centered over the three step columns.
 */
export function StepsConnector() {
  const isDark = useIsDark();
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

  const nodes = [166, 500, 834];
  const path = "M166 40 C 320 -8, 360 88, 500 40 S 700 -8, 834 40";
  const trackStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const nodeFill = isDark ? "rgb(32 32 32)" : "rgb(255 255 255)";

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
          <stop offset="0" stopColor="#FF8A00" />
          <stop offset="0.5" stopColor="#FF4D00" />
          <stop offset="1" stopColor="#E04400" />
        </linearGradient>
      </defs>

      <path d={path} fill="none" stroke={trackStroke} strokeWidth="2" />

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

      {nodes.map((x, i) => (
        <g key={x}>
          <circle
            cx={x}
            cy={40}
            r="6"
            fill={nodeFill}
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

      {drawn && !reduce && (
        <circle r="3.5" fill={isDark ? "#f7f7f5" : "#191919"}>
          <animateMotion dur="2.4s" begin="1.7s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#steps-path" />
          </animateMotion>
          <animate attributeName="opacity" dur="2.4s" begin="1.7s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
        </circle>
      )}
    </svg>
  );
}