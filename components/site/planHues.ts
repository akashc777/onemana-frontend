import type { CampHue } from "@/lib/campHue";

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
