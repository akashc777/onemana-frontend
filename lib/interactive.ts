import type { CampHue } from "@/lib/campHue"

/**
 * The interaction layer's attributes (INTERACTION_SPEC.md §9.2), the same API
 * as the app's lib/ui/interactive.ts. A component says what kind of thing it
 * is, once, on the element that takes the pointer, and the layer
 * (lib/tailwindAppSystem.ts, interactionCss) draws its hover, press,
 * selected, focus and disabled states:
 *
 * - icon: an icon button (the theme switch, the menu button): the tint, the
 *   icon to ink, .92 under a finger;
 * - row: a row of a list that opens something: the tint at once, a 2px bar
 *   when current, the focus ring inset;
 * - nav: a row of navigation: the tint, and the raised chip when current;
 * - tab: a tab or a segment: the tint, and the raised knob when chosen;
 * - chip: a filter or a choice that turns on: the tint, a ring when on;
 * - card: a card that is a link: the lift, and .99 when pressed;
 * - item: an option in a list: the press tint as the highlight, 44 px under a
 *   finger.
 *
 * Buttons, fields, text links and the checkbox are the classes ui-btn,
 * ui-field, .link/.go and ui-check, built from the same tokens.
 *
 * `hue` tints the element in its object's camp hue instead of the accent.
 * `disabledReason` says why it cannot be used, in a tip; pair it with
 * aria-disabled="true", which keeps it focusable so the reason can be read.
 */
export type InteractiveKind = "icon" | "row" | "nav" | "tab" | "chip" | "card" | "item"

export function ix(kind: InteractiveKind, opts: { hue?: CampHue | "agent"; disabledReason?: string } = {}) {
  return {
    "data-interactive": kind,
    ...(opts.hue ? { "data-hue": opts.hue } : {}),
    ...(opts.disabledReason ? { "data-disabled-reason": opts.disabledReason } : {}),
  }
}
