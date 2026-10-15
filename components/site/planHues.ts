import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

/**
 * Each way to have OneCamp keeps one camp hue wherever it appears: the plan
 * cards' headers, the plan table and the Cloud card. A colour that follows a
 * thing is identity; a different colour on every page would be decoration.
 *
 *   free      moss  (go: nothing to pay)
 *   lifetime  sun   (the key you keep)
 *   cloud     sky
 *   source    lake  (the code on GitHub)
 */
export const PLAN_HUE = {
  free: "moss",
  lifetime: "sun",
  cloud: "sky",
  source: "lake",
} as const satisfies Record<string, CampHue>;

/**
 * The raised column of a comparison table (site.md S12): the licence's, in
 * the plan table (PlanComparison) and in the home page's comparison
 * (HomeComparison), whose OneCamp column quotes the licence. Its hue's tint,
 * the colour of the licence's dot, between two hairlines.
 *
 * It was the card's surface, which in light mode is the page's own white, so
 * the column stood out by its hairlines alone (storefront audit §5.2). The
 * tint is a ground of its own in both themes, and under .dark it takes the
 * dark cut, lighter than the page as the card was (planTableLift.test.tsx).
 */
export const RAISED_COLUMN = `${HUE_CLASS[PLAN_HUE.lifetime]} bg-hue-tint shadow-[inset_1px_0_0_var(--line-2-c),inset_-1px_0_0_var(--line-2-c)]`;
