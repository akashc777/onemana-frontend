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
 * The one raised ground of a comparison (site.md S12): it raises the licence
 * in the plan table (PlanComparison), and OneCamp in the home page's
 * comparison (HomeComparison): its column from sm, and its line in each card
 * on a phone.
 *
 * Neutral since design v3.1 (18 Oct 2026): colour names an area of the
 * product, and a plan or a column is none, so the licence's sun tint it wore
 * went. The ground is the press step, ink at 7 % (white at 7 % in dark), a
 * ground of its own on the page and on a card in both themes, so the column
 * never stands white on white (storefront audit §5.2; planTableLift.test.tsx).
 */
export const RAISED_TINT = "bg-press";

/** A raised column's cells: the raised tint between two hairlines. */
export const RAISED_COLUMN = `${RAISED_TINT} shadow-[inset_1px_0_0_var(--line-2-c),inset_-1px_0_0_var(--line-2-c)]`;

/** A raised line inside a card: the raised tint in the same hairline, all round. */
export const RAISED_ROW = `${RAISED_TINT} shadow-[inset_0_0_0_1px_var(--line-2-c)]`;
