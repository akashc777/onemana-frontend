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
 * The one raised ground of a comparison (site.md S12): the licence's hue
 * tint, the colour of the licence's dot. It raises the licence in the plan
 * table (PlanComparison), and OneCamp in the home page's comparison
 * (HomeComparison), whose OneCamp answers quote the licence: its column from
 * sm, and its line in each card on a phone.
 *
 * Each was white on white in light mode: the columns stood on the card's
 * surface, which is the page's own white (storefront audit §5.2), and the
 * phone's line on the sunken surface, #F8F9FA inside a white card. The tint is
 * a ground of its own in both themes, and under .dark it takes the dark cut,
 * lighter than the page and the card as the card was (planTableLift.test.tsx).
 */
export const RAISED_TINT = `${HUE_CLASS[PLAN_HUE.lifetime]} bg-hue-tint`;

/** A raised column's cells: the raised tint between two hairlines. */
export const RAISED_COLUMN = `${RAISED_TINT} shadow-[inset_1px_0_0_var(--line-2-c),inset_-1px_0_0_var(--line-2-c)]`;

/** A raised line inside a card: the raised tint in the same hairline, all round. */
export const RAISED_ROW = `${RAISED_TINT} shadow-[inset_0_0_0_1px_var(--line-2-c)]`;
