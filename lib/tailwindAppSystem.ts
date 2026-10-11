import plugin from "tailwindcss/plugin"
import type { CSSRuleObject } from "tailwindcss/types/config"

import { ALPHA, APP, AVATAR, CAMP, ELEVATION, GLOW, NIGHT, SHARED, hexToTriple, tracking, type TypeStep } from "./appSystem"

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

/** The night section's tokens (NIGHT): the dark page's ink and surfaces, and the dark camp cuts, in either theme. */
export function nightTokens(theme: "light" | "dark"): Record<string, string> {
  const out: Record<string, string> = { "--background": NIGHT.ground[theme].join(" ") }
  for (const [name, rgb] of Object.entries(NIGHT.tokens)) out[`--${name}`] = rgb.join(" ")
  for (const [name, hex] of Object.entries(CAMP.dark)) out[`--${name}`] = hexToTriple(hex).join(" ")
  out["--line"] = "255 255 255"
  out["--line-a"] = String(NIGHT.line)
  out["--line-c"] = `rgb(255 255 255 / ${NIGHT.line})`
  return out
}

/** A Tailwind colour for an alpha token, multiplying a class's opacity into the token's own. */
export const alphaColour = (name: string, scale = 1) =>
  `rgb(var(--${name}) / calc(var(--${name}-a) * ${scale === 1 ? "<alpha-value>" : `${scale} * <alpha-value>`}))`

/** The Tailwind theme values that are the app's. */
export const appTheme = {
  borderRadius: {
    xs: px(APP.radius.xs),
    ctl: px(APP.radius.ctl),
    "4xl": px(APP.radius["4xl"]),
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

const SM = "@media (min-width: 640px)"
const LG = "@media (min-width: 1024px)"

/**
 * The marketing scale as responsive utilities (site.md G2): text-hero,
 * text-page, text-h2, text-close, text-title-read, text-lead and
 * text-price, each its phone step, its tablet step from 640px and its
 * desktop step from 1024px.
 */
export function marketingUtilities(): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {}
  for (const name of ["hero", "page", "h2", "close", "title-read", "lead", "price"] as const) {
    const s = APP.marketing[name]
    const step = (at: "desktop" | "tablet" | "phone") => ({ fontSize: px(s[at][0]), lineHeight: px(s[at][1]) })
    out[`.text-${name}`] = {
      ...step("phone"),
      letterSpacing: em(s.tracking),
      ...(s.weight !== 400 ? { fontWeight: String(s.weight) } : {}),
      [SM]: step("tablet"),
      [LG]: step("desktop"),
    }
  }
  return out
}

/**
 * MOTION (site.md G5), in four kinds and nothing else, every duration and
 * curve from the table. The timing is published as custom properties for
 * globals.css (--d-hover, --ease-out...), and the motion classes are built
 * here so no other file writes a millisecond:
 *
 * - load choreography, hero only: in-lift (copy, 8px, transform only, since
 *   the H1, the lead and the image are LCP candidates and an element at
 *   opacity 0 is not painted), in-rise (the window, 24px), in-chip (a
 *   floating chip springs in; decoration, so it may fade), in-pop (a tile),
 *   in-draw (the sun stroke), in-ping (a dot's one ring); at-N delays them;
 * - scroll entrance: reveal, 8px on a view() timeline where the browser has
 *   one, never opacity, so nothing is ever hidden;
 * - ambient: spin-40, spin-60, spin-90r and bob, paused by [data-paused];
 * - response: fx-shake, fx-stamp, fx-fade, fx-slide, fx-spring and lift
 *   (a card's hover, e1 to e2 and a pixel up, on pointers that hover).
 *
 * Under prefers-reduced-motion every one of them is off and the finished
 * state shows, because every keyframe ends at the element's own state.
 */
const MS = APP.motion
const ms = (n: number) => `${n}ms`
/** The stagger steps a class can wait for: 60ms apart, plus the hero's own beats. */
export const MOTION_DELAYS = [60, 120, 180, 240, 300, 340, 380, 420, 480, 540, 600, 700, 900, 1100, 1400, 2200] as const
export const MOTION_TIMES = { lift: 520, rise: 700, chip: 420, pop: 220, draw: 700, ping: 1400, stamp: 360, shake: 180, fade: 160, bob: 1200, ambientFast: 40000, ambient: 60000, ambientSlow: 90000, moment: 280 } as const

export function motionCss(): Record<string, unknown> {
  const t = MOTION_TIMES
  const anim = (name: string, dur: number, ease: string, extra = "both") => `${name} ${ms(dur)} ${ease} ${extra}`
  const classes: Record<string, unknown> = {
    ":root": {
      "--d-press": ms(MS.durations.press),
      "--d-hover": ms(MS.durations.hover),
      "--d-pop": ms(MS.durations.pop),
      "--d-panel": ms(MS.durations.panel),
      "--d-spring": ms(MS.durations.spring),
      "--d-page": ms(MS.durations.page),
      "--d-fade": ms(t.fade),
      "--ease-out": MS.ease,
      "--ease-io": MS.easeInOut,
      "--ease-spring": MS.spring,
      "--lift-y": "6px",
      [SM]: { "--lift-y": "8px" },
    },
    "@keyframes v3-lift": { from: { transform: "translateY(var(--lift-y))" }, to: { transform: "none" } },
    "@keyframes v3-rise": { from: { transform: "translateY(24px)" }, to: { transform: "none" } },
    "@keyframes v3-chip": { from: { opacity: "0", transform: "translateY(6px) scale(0.96)" }, to: { opacity: "1", transform: "none" } },
    "@keyframes v3-pop": { from: { transform: "scale(0.9)" }, to: { transform: "none" } },
    "@keyframes v3-draw": { from: { strokeDashoffset: "240" }, to: { strokeDashoffset: "0" } },
    "@keyframes v3-ping": { "0%": { opacity: "0.9", transform: "scale(0.6)" }, "100%": { opacity: "0", transform: "scale(1.6)" } },
    "@keyframes v3-reveal": { from: { transform: "translateY(var(--lift-y))" }, to: { transform: "none" } },
    "@keyframes v3-spin": { to: { transform: "rotate(360deg)" } },
    "@keyframes v3-spin-r": { to: { transform: "rotate(-360deg)" } },
    "@keyframes v3-bob": { "0%, 60%, 100%": { transform: "none" }, "30%": { transform: "translateY(-3px)" } },
    "@keyframes v3-shake": { "0%, 100%": { transform: "none" }, "25%": { transform: "translateX(-4px)" }, "50%": { transform: "translateX(4px)" }, "75%": { transform: "translateX(-2px)" } },
    "@keyframes v3-stamp": { from: { opacity: "0", transform: "scale(1.25) rotate(-6deg)" }, to: { opacity: "1", transform: "rotate(-6deg)" } },
    "@keyframes v3-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
    "@keyframes v3-slide": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
    "@keyframes v3-spring": { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.1)" }, "100%": { transform: "none" } },
    ".in-lift": { animation: anim("v3-lift", t.lift, MS.ease) },
    ".in-rise": { animation: anim("v3-rise", t.rise, MS.ease) },
    ".in-chip": { animation: anim("v3-chip", t.chip, MS.spring) },
    ".in-pop": { animation: anim("v3-pop", t.pop, MS.spring) },
    ".in-draw": { strokeDasharray: "240", animation: anim("v3-draw", t.draw, MS.ease) },
    ".in-ping": { animation: anim("v3-ping", t.ping, MS.ease) },
    ".spin-40": { animation: `v3-spin ${ms(t.ambientFast)} linear infinite` },
    ".spin-60": { animation: `v3-spin ${ms(t.ambient)} linear infinite` },
    ".spin-90r": { animation: `v3-spin-r ${ms(t.ambientSlow)} linear infinite` },
    ".bob": { animation: `v3-bob ${ms(t.bob)} ${MS.easeInOut} 3` },
    "[data-paused] .spin-40, [data-paused] .spin-60, [data-paused] .spin-90r, [data-paused] .bob": { animationPlayState: "paused" },
    ".fx-shake": { animation: anim("v3-shake", t.shake, MS.easeInOut, "2") },
    ".fx-stamp": { animation: anim("v3-stamp", t.stamp, MS.spring) },
    ".fx-fade": { animation: anim("v3-fade", t.fade, MS.ease) },
    ".fx-slide": { animation: anim("v3-slide", t.moment, MS.ease) },
    ".fx-spring": { animation: anim("v3-spring", t.chip, MS.spring) },
    ".drift": { translate: "calc(var(--px, 0) * 2px) calc(var(--py, 0) * 2px)", transition: `translate ${ms(MS.durations.page)} ${MS.ease}` },
    ".lift, .lift-move": {
      // translate, not transform: a card that has revealed keeps its
      // animation's end state on transform, which would win over a hover.
      transitionProperty: "translate, box-shadow, background-color",
      transitionDuration: ms(MS.durations.hover),
      transitionTimingFunction: MS.ease,
    },
    "@media (hover: hover)": {
      ".lift:hover": { translate: "0 -1px", boxShadow: "var(--e-e2)" },
      ".lift-move:hover": { translate: "0 -1px" },
      ".lift-2:hover": { translate: "0 -2px" },
    },
    "@supports (animation-timeline: view())": {
      ".reveal": { animation: "v3-reveal linear both", animationTimeline: "view()", animationRange: "entry 0% entry 40%" },
    },
    "@media (prefers-reduced-motion: reduce)": {
      ".in-lift, .in-rise, .in-chip, .in-pop, .in-draw, .in-ping, .reveal, .spin-40, .spin-60, .spin-90r, .bob, .fx-shake, .fx-stamp, .fx-fade, .fx-slide, .fx-spring": { animation: "none !important" },
      ".in-ping": { opacity: "0" },
      ".lift:hover, .lift-move:hover, .lift-2:hover": { translate: "none !important" },
    },
  }
  for (const d of MOTION_DELAYS) classes[`.at-${d}`] = { animationDelay: ms(d) }
  return classes
}

export default plugin(({ addBase, addComponents, addUtilities }) => {
  addBase({ ":root": colourTokens("light"), ".dark": colourTokens("dark") })
  addBase({ ".night": nightTokens("light"), ".dark .night": nightTokens("dark") })
  addBase(motionCss() as CSSRuleObject)
  addComponents(appComponents() as CSSRuleObject)
  addUtilities(marketingUtilities() as CSSRuleObject)
})
