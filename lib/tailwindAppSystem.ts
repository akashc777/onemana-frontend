import plugin from "tailwindcss/plugin"
import type { CSSRuleObject } from "tailwindcss/types/config"

import { ALPHA, APP, AVATAR, CAMP, ELEVATION, GLOW, SHARED, hexToTriple, tracking, type TypeStep } from "./appSystem"

/**
 * Builds the site from the one table (lib/appSystem.ts): the colour custom
 * properties, the elevation ladder, the Tailwind theme values that are the
 * app's, and the shapes of the shared components. tailwind.config.ts loads
 * it; nothing in globals.css or a component writes these numbers again
 * (app/appSystem.test.tsx).
 *
 * Relative imports only: Tailwind loads this file outside the app's "@/"
 * path alias.
 */

const px = (n: number) => `${n / 16}rem`
const em = (n: number) => `${n}em`
const MD = "@media (min-width: 768px)"

/** A type step as Tailwind's [size, { lineHeight, letterSpacing }] pair, tracking from Inter's metrics. */
export function typeStep(step: TypeStep, extra: Record<string, string> = {}): [string, Record<string, string>] {
  const [size, line] = APP.type[step]
  return [px(size), { lineHeight: px(line), letterSpacing: em(tracking(size)), ...extra }]
}

type MarketingStep = keyof typeof APP.marketing

/** A marketing step at a width: [size, { lineHeight, letterSpacing, fontWeight }]. */
export function marketingStep(step: MarketingStep, at: "desktop" | "phone" = "desktop"): [string, Record<string, string>] {
  const s = APP.marketing[step]
  const [size, line] = s[at]
  return [px(size), { lineHeight: px(line), letterSpacing: em(s.tracking), fontWeight: String(s.weight) }]
}

/**
 * The colour custom properties. Opaque colours are space-separated sRGB so
 * Tailwind can add alpha; an alpha token (--line, --hover...) is its triple,
 * its alpha (--line-a) and the whole colour (--line-c) for plain CSS.
 */
export function colourTokens(theme: "light" | "dark"): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, rgb] of Object.entries(SHARED[theme])) out[`--${name}`] = rgb.join(" ")
  for (const [name, hex] of Object.entries(CAMP[theme])) out[`--${name}`] = hexToTriple(hex).join(" ")
  for (const [name, [rgb, a]] of Object.entries(ALPHA[theme])) {
    out[`--${name}`] = rgb.join(" ")
    out[`--${name}-a`] = String(a)
    out[`--${name}-c`] = `rgb(${rgb.join(" ")} / ${a})`
  }
  for (const [step, value] of Object.entries(ELEVATION[theme])) out[`--e-${step}`] = value
  if (theme === "light") {
    for (const [name, hex] of Object.entries(AVATAR)) out[`--${name}`] = hexToTriple(hex).join(" ")
    out["--glow"] = GLOW.glow.join(" ")
    out["--glow2"] = GLOW.glow2.join(" ")
  }
  // The focus ring is the accent, in both themes.
  out["--ring"] = out["--brand"]
  return out
}

/** A Tailwind colour for an alpha token, multiplying a class's opacity into the token's own. */
export const alphaColour = (name: string, scale = 1) =>
  `rgb(var(--${name}) / calc(var(--${name}-a) * ${scale === 1 ? "<alpha-value>" : `${scale} * <alpha-value>`}))`

/** The Tailwind theme values that are the app's. */
export const appTheme = {
  borderRadius: {
    xs: px(APP.radius.xs),
    sm: px(APP.radius.sm),
    DEFAULT: px(APP.radius.md),
    md: px(APP.radius.md),
    lg: px(APP.radius.lg),
    xl: px(APP.radius.xl),
    "2xl": px(APP.radius["2xl"]),
    "3xl": px(APP.radius["3xl"]),
  },
  // THE ELEVATION LADDER (§3.8), per mode through custom properties. The old
  // names fold onto it: a card rests (e1), a popover floats (e3), a dialog
  // and the product window are modal (e4).
  boxShadow: {
    e1: "var(--e-e1)",
    sel: "var(--e-sel)",
    e2: "var(--e-e2)",
    e3: "var(--e-e3)",
    e4: "var(--e-e4)",
    sheet: "var(--e-sheet)",
    sm: "var(--e-e1)",
    card: "var(--e-e1)",
    elevated: "var(--e-e3)",
    popover: "var(--e-e3)",
    dialog: "var(--e-e4)",
    product: "var(--e-e4)",
  },
  transitionDuration: {
    DEFAULT: `${APP.motion.duration}ms`,
    ...Object.fromEntries(Object.entries(APP.motion.durations).map(([k, v]) => [k, `${v}ms`])),
  },
  transitionTimingFunction: { DEFAULT: APP.motion.ease, out: APP.motion.ease, "in-out": APP.motion.easeInOut, spring: APP.motion.spring },
  // The app's steps under the site's names, each with Inter's tracking.
  fontSize: {
    caption: typeStep("xs"),
    small: typeStep("sm"),
    h3: marketingStep("h3"),
  },
}

const sizeOf = (step: TypeStep) => ({ fontSize: px(APP.type[step][0]), lineHeight: px(APP.type[step][1]), letterSpacing: em(tracking(APP.type[step][0])) })

/** The shared components' shapes: the app's Button sizes, Input, Chip and Card. */
export function appComponents(): Record<string, Record<string, unknown>> {
  const b = APP.button
  const out: Record<string, Record<string, unknown>> = {
    ".ui-btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.375rem",
      textAlign: "center",
      whiteSpace: "nowrap",
      borderRadius: px(APP.radius[b.radius]),
      fontWeight: String(b.weight),
      transitionProperty: "color, background-color, box-shadow, opacity, transform",
      transitionDuration: `${APP.motion.duration}ms`,
      transitionTimingFunction: APP.motion.ease,
      "&:active": { transform: `translateY(${b.press.y}px)`, transitionDuration: `${b.press.ms}ms` },
      "&:disabled, &[aria-disabled='true']": { pointerEvents: "none", opacity: String(b.disabledOpacity) },
      "&:focus-visible": { outline: `${b.focus.width}px solid rgb(var(--ring))`, outlineOffset: `${b.focus.offset}px` },
    },
    // The primary: the accent with an inner highlight and a tinted drop.
    ".ui-btn-primary": {
      backgroundColor: "rgb(var(--brand))",
      color: "rgb(var(--brand-foreground))",
      boxShadow: b.primaryShadow.light,
      "&:hover": { backgroundColor: `color-mix(in oklab, rgb(var(--brand)) ${b.hoverMix}%, black)` },
    },
    ".dark .ui-btn-primary": { boxShadow: b.primaryShadow.dark },
    // The secondary: the raised surface at e1, e2 under the cursor.
    ".ui-btn-secondary": {
      backgroundColor: "rgb(var(--card))",
      color: "rgb(var(--foreground))",
      boxShadow: "var(--e-e1)",
      "&:hover": { boxShadow: "var(--e-e2)" },
    },
    ".ui-field": {
      display: "flex",
      width: "100%",
      height: px(APP.field.phoneHeight),
      borderRadius: px(APP.radius[APP.field.radius]),
      border: "0",
      backgroundColor: "rgb(var(--card))",
      boxShadow: "var(--e-e1)",
      paddingLeft: px(APP.field.paddingX),
      paddingRight: px(APP.field.paddingX),
      color: "rgb(var(--foreground))",
      ...sizeOf(APP.field.phoneText),
      transitionProperty: "box-shadow, background-color",
      transitionDuration: `${APP.motion.duration}ms`,
      transitionTimingFunction: APP.motion.ease,
      "&::placeholder": { color: "rgb(var(--faint))" },
      "&:hover": { boxShadow: "0 0 0 1px var(--line-3-c), 0 1px 2px rgb(16 18 26 / 0.05)" },
      "&:focus-visible": {
        outline: "none",
        boxShadow: `0 0 0 1px color-mix(in oklab, rgb(var(--brand)) ${APP.field.ringMix}%, transparent), 0 0 0 3px color-mix(in oklab, rgb(var(--brand)) ${APP.field.haloMix}%, transparent)`,
      },
      "&[aria-invalid='true']": {
        boxShadow: `0 0 0 1px color-mix(in oklab, rgb(var(--danger)) ${APP.field.ringMix}%, transparent), 0 0 0 3px color-mix(in oklab, rgb(var(--danger)) ${APP.field.haloMix}%, transparent)`,
      },
      "&:disabled": { cursor: "not-allowed", backgroundColor: "rgb(var(--muted))", opacity: String(APP.field.disabledOpacity) },
      [MD]: { height: px(APP.field.height), ...sizeOf(APP.field.text) },
    },
    ".ui-chip": {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      height: px(APP.chip.height),
      borderRadius: px(APP.radius[APP.chip.radius]),
      backgroundColor: "var(--hover-c)",
      boxShadow: "inset 0 0 0 1px var(--line-c)",
      color: "rgb(var(--muted-foreground))",
      padding: `0 ${px(APP.chip.paddingX)}`,
      fontWeight: String(APP.chip.weight),
      ...sizeOf(APP.chip.text),
    },
    ".ui-card": {
      borderRadius: px(APP.radius[APP.card.radius]),
      backgroundColor: "rgb(var(--card))",
      boxShadow: "var(--e-e1)",
    },
  }
  // Each size: its height from md, 44px below it where a finger presses.
  for (const [name, s] of Object.entries(b.sizes)) {
    const [, line] = APP.type[s.text]
    const padY = Math.floor((s.height - line) / 2)
    out[`.ui-btn-${name}`] = {
      minHeight: px(s.phoneHeight),
      padding: `${px(padY)} ${px(s.paddingX)}`,
      ...sizeOf(s.text),
      ...(name === "xl" ? { borderRadius: px(b.xlRadius) } : {}),
      [MD]: { minHeight: px(s.height) },
    }
  }
  return out
}

export default plugin(({ addBase, addComponents }) => {
  addBase({ ":root": colourTokens("light"), ".dark": colourTokens("dark") })
  addComponents(appComponents() as CSSRuleObject)
})
