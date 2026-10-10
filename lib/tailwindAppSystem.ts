import plugin from "tailwindcss/plugin"
import type { CSSRuleObject } from "tailwindcss/types/config"

import { APP, CAMP, SHARED, hexToTriple, type TypeStep } from "./appSystem"

/**
 * Builds the site from the one table (lib/appSystem.ts): the colour custom
 * properties, the Tailwind theme values that are the app's, and the shapes of
 * the shared components. tailwind.config.ts loads it; nothing in globals.css
 * or a component writes these numbers again (app/appSystem.test.ts).
 *
 * Relative imports only: Tailwind loads this file outside the app's "@/"
 * path alias.
 */

const px = (n: number) => `${n / 16}rem`
const MD = "@media (min-width: 768px)"

/** A type step as Tailwind's [size, { lineHeight }] pair. */
export function typeStep(step: TypeStep, extra: Record<string, string> = {}): [string, Record<string, string>] {
  const [size, line] = APP.type[step]
  return [px(size), { lineHeight: px(line), ...extra }]
}

/** The colour custom properties, as space-separated sRGB so Tailwind can add alpha. */
export function colourTokens(theme: "light" | "dark"): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, rgb] of Object.entries(SHARED[theme])) out[`--${name}`] = rgb.join(" ")
  for (const [name, hex] of Object.entries(CAMP[theme])) out[`--${name}`] = hexToTriple(hex).join(" ")
  // The focus ring is the accent, in both themes.
  out["--ring"] = out["--brand"]
  return out
}

/** The Tailwind theme values that are the app's. */
export const appTheme = {
  borderRadius: {
    sm: px(APP.radius.sm),
    DEFAULT: px(APP.radius.md),
    md: px(APP.radius.md),
    lg: px(APP.radius.lg),
    xl: px(APP.radius.xl),
    "2xl": px(APP.radius["2xl"]),
  },
  // Shadows only for things that float. Cards, inputs and buttons have none.
  boxShadow: {
    sm: "none",
    card: "none",
    product: "none",
    elevated: APP.shadow.popover,
    popover: APP.shadow.popover,
    dialog: APP.shadow.dialog,
  },
  transitionDuration: { DEFAULT: `${APP.motion.duration}ms`, [APP.motion.duration]: `${APP.motion.duration}ms` },
  transitionTimingFunction: { DEFAULT: APP.motion.ease, spring: APP.motion.spring },
  // The app's steps under the site's names. A heading set at a text size
  // takes the text face (globals.css), at the font's own spacing.
  fontSize: {
    caption: typeStep("xs"),
    small: typeStep("sm"),
    h3: typeStep("xl", { letterSpacing: APP.heading.tracking }),
  },
}

const sizeOf = (step: TypeStep) => ({ fontSize: px(APP.type[step][0]), lineHeight: px(APP.type[step][1]) })

/** The shared components' shapes: the app's Button sizes, Input, Badge and Card. */
export function appComponents(): Record<string, Record<string, unknown>> {
  const b = APP.button
  const out: Record<string, Record<string, unknown>> = {
    ".ui-btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      textAlign: "center",
      borderRadius: px(APP.radius[b.radius]),
      fontWeight: String(b.weight),
      transitionProperty: "color, background-color, border-color, opacity, transform",
      transitionDuration: `${APP.motion.duration}ms`,
      transitionTimingFunction: APP.motion.ease,
      "&:active": { transform: "translateY(1px)" },
      "&:disabled, &[aria-disabled='true']": { pointerEvents: "none", opacity: String(b.disabledOpacity) },
    },
    // A filled button's focus: a thin outline off its fill (the global ring
    // pressed against orange reads as one slab).
    ".ui-btn-filled:focus-visible": {
      outlineWidth: `${b.filledFocus.width}px`,
      outlineOffset: `${b.filledFocus.offset}px`,
      outlineColor: "rgb(var(--ring))",
    },
    ".ui-field": {
      display: "flex",
      width: "100%",
      height: px(APP.field.phoneHeight),
      borderRadius: px(APP.radius[APP.field.radius]),
      border: "1px solid rgb(var(--border-strong))",
      backgroundColor: "transparent",
      paddingLeft: px(APP.field.paddingX),
      paddingRight: px(APP.field.paddingX),
      color: "rgb(var(--foreground))",
      ...sizeOf(APP.field.phoneText),
      transitionProperty: "border-color, box-shadow",
      transitionDuration: `${APP.motion.duration}ms`,
      transitionTimingFunction: APP.motion.ease,
      "&::placeholder": { color: "rgb(var(--muted-foreground))" },
      "&:hover": { borderColor: "rgb(var(--faint))" },
      "&:focus-visible": {
        outline: "none",
        borderColor: "rgb(var(--ring))",
        boxShadow: `0 0 0 2px rgb(var(--ring) / ${APP.field.ringAlpha})`,
      },
      "&:disabled": { cursor: "not-allowed", backgroundColor: "rgb(var(--muted))", opacity: String(APP.field.disabledOpacity) },
      "&:disabled:hover": { borderColor: "rgb(var(--border-strong))" },
      [MD]: { height: px(APP.field.height), ...sizeOf(APP.field.text) },
    },
    ".ui-chip": {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      borderRadius: px(APP.radius[APP.chip.radius]),
      border: "1px solid transparent",
      backgroundColor: "rgb(var(--highlight))",
      color: "rgb(var(--foreground))",
      padding: `${px(APP.chip.paddingY)} ${px(APP.chip.paddingX)}`,
      fontWeight: String(APP.chip.weight),
      ...sizeOf(APP.chip.text),
    },
    ".ui-card": {
      borderRadius: px(APP.radius[APP.card.radius]),
      border: `${APP.card.border}px solid rgb(var(--border))`,
      backgroundColor: "rgb(var(--card))",
    },
  }
  // Each size: its height from md, 44px below it where a finger presses, and
  // a vertical padding that keeps an outlined button (two border pixels) the
  // same height as a filled one.
  for (const [name, s] of Object.entries(b.sizes)) {
    const [, line] = APP.type[s.text]
    const padY = Math.floor((s.height - line - 2) / 2)
    out[`.ui-btn-${name}`] = {
      minHeight: px(s.phoneHeight),
      padding: `${px(padY)} ${px(s.paddingX)}`,
      ...sizeOf(s.text),
      [MD]: { minHeight: px(s.height) },
    }
  }
  return out
}

export default plugin(({ addBase, addComponents }) => {
  addBase({ ":root": colourTokens("light"), ".dark": colourTokens("dark") })
  addComponents(appComponents() as CSSRuleObject)
})
