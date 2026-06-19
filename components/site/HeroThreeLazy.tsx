"use client";

import dynamic from "next/dynamic";

// Client-only, lazy boundary for the WebGL hero backdrop so three.js + gsap
// never run during SSR and load only after hydration. ssr:false dynamic
// imports are only permitted inside Client Components, hence this wrapper.
const HeroThree = dynamic(() => import("./HeroThree").then((m) => m.HeroThree), {
  ssr: false,
});

export function HeroThreeLazy() {
  return <HeroThree />;
}
