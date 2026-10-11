import type { CSSProperties, ReactNode } from "react";
import type { CampHue } from "@/lib/campHue";
import { Spark } from "@/components/ui/graphics/motifs";

/**
 * A small celebration around one element (the playful layer, "Celebration"):
 * four camp-hued sparks burst out of it in under half a second and stay as
 * a glint. Only for a moment worth it (a purchase that went through), never
 * for routine actions, and not at all for a visitor who asked for less
 * motion. Pure CSS, so it costs no script.
 */
const SPARKS: { hue: CampHue; size: number; at: string; from: [string, string]; delay: string }[] = [
  { hue: "sun", size: 14, at: "-right-4 -top-3", from: ["-18px", "16px"], delay: "60ms" },
  { hue: "berry", size: 10, at: "-left-3 top-1", from: ["16px", "10px"], delay: "120ms" },
  { hue: "sky", size: 9, at: "-bottom-2 -right-2", from: ["-12px", "-12px"], delay: "160ms" },
  { hue: "moss", size: 8, at: "-bottom-3 left-2", from: ["8px", "-14px"], delay: "200ms" },
];

export function Celebration({ children }: { children: ReactNode }) {
  return (
    // w-fit: inside a column flex box (the receipt's canvas) the wrapper
    // stretched to the full width, and two sparks landed at its far edge.
    <span className="relative inline-flex w-fit">
      <span className="inline-flex motion-safe:animate-spring">{children}</span>
      <span aria-hidden className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {SPARKS.map((s) => (
          <span
            key={s.hue}
            className={`absolute ${s.at} animate-spark-out`}
            style={{ "--spark-x": s.from[0], "--spark-y": s.from[1], animationDelay: s.delay } as CSSProperties}
          >
            <Spark hue={s.hue} size={s.size} />
          </span>
        ))}
      </span>
    </span>
  );
}
