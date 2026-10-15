import plugin from "tailwindcss/plugin"
import type { CSSRuleObject } from "tailwindcss/types/config"

import { ALPHA, APP, AVATAR, CAMP, ELEVATION, GLOW, MARK_RING, NIGHT, PAPER, SHARED, hexToTriple, tracking, type TypeStep } from "./appSystem"
import { CAMP_HUES } from "./campHue"

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
/** Hover only where a pointer hovers: on a touch screen a :hover stays on after the tap (storefront audit G19). */
export const HOVER = "@media (hover: hover)"
/** A finger: the phone's stronger press (the app's F2) and 44 px items. */
export const COARSE = "@media (pointer: coarse)"
/** A state a disabled control never shows. */
const ENABLED = ":not(:disabled, [aria-disabled='true'])"

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
  // A card's lift (the interaction layer): e2's drops alone, laid on the
  // card's own e1 and faded in, so e1's ring is not drawn twice.
  out["--e-lift"] = liftShadow(ELEVATION[theme].e2)
  out["--paper"] = PAPER[theme].join(" ")
  if (theme === "light") {
    out["--e-mark"] = MARK_RING
    for (const [name, hex] of Object.entries(AVATAR)) out[`--${name}`] = hexToTriple(hex).join(" ")
    out["--glow"] = GLOW.glow.join(" ")
    out["--glow2"] = GLOW.glow2.join(" ")
  }
  // The focus ring is the accent, in both themes.
  out["--ring"] = out["--brand"]
  return out
}

/** "tipDelay" as "tip-delay": the table's keys under the spec's custom property names. */
const kebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

/**
 * The interaction layer's tints for a theme (APP.interaction.alpha):
 * --ix-hover-a, --ix-press-a, --ix-sel-a and the rest, as percentages for
 * color-mix().
 */
export function interactionAlphas(theme: "light" | "dark"): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [name, pct] of Object.entries(APP.interaction.alpha[theme])) out[`--ix-${kebab(name)}-a`] = `${pct}%`
  return out
}

/**
 * The interaction layer's tokens (INTERACTION_SPEC.md §2) under the app's
 * --ix-* names: on :root the curve, the durations, the scales and the ring
 * with the light tints; on .dark only the tints change.
 */
export function interactionTokens(theme: "light" | "dark"): Record<string, string> {
  if (theme === "dark") return interactionAlphas("dark")
  const ix = APP.interaction
  const out: Record<string, string> = { "--ix-ease": ix.ease, "--ix-spring": ix.spring }
  for (const [name, ms] of Object.entries(ix.ms)) out[`--ix-${kebab(name)}`] = `${ms}ms`
  Object.assign(out, interactionAlphas("light"))
  out["--ix-press-scale"] = String(ix.scale.press)
  out["--ix-press-scale-touch"] = String(ix.scale.pressTouch)
  out["--ix-press-scale-icon"] = String(ix.scale.icon)
  out["--ix-press-scale-card"] = String(ix.scale.card)
  out["--ix-press-scale-card-touch"] = String(ix.scale.cardTouch)
  out["--ix-lift-scale"] = String(ix.scale.lift)
  out["--ix-ring"] = `${ix.ring.width}px`
  out["--ix-ring-offset"] = `${ix.ring.offset}px`
  out["--ix-bar"] = `${ix.ring.bar}px`
  out["--ix-disabled"] = String(ix.disabledOpacity)
  return out
}

/** A step of the ladder without its ring and its top highlight: the drops a lift adds. */
export const liftShadow = (step: string) =>
  step
    .split(/,\s*(?![^()]*\))/)
    .filter((part) => !/^0 0 0 1px/.test(part.trim()) && !/^inset/.test(part.trim()))
    .join(", ")

/** The night section's tokens (NIGHT): the dark page's ink and surfaces, and the dark camp cuts, in either theme. */
export function nightTokens(theme: "light" | "dark"): Record<string, string> {
  const out: Record<string, string> = { "--background": NIGHT.ground[theme].join(" ") }
  for (const [name, rgb] of Object.entries(NIGHT.tokens)) out[`--${name}`] = rgb.join(" ")
  for (const [name, hex] of Object.entries(CAMP.dark)) out[`--${name}`] = hexToTriple(hex).join(" ")
  out["--line"] = "255 255 255"
  out["--line-a"] = String(NIGHT.line)
  out["--line-c"] = `rgb(255 255 255 / ${NIGHT.line})`
  // A night ground is dark in either theme, so its tints are the dark ones.
  Object.assign(out, interactionAlphas("dark"))
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
    // The rings a filled mark wears (§3.9): an avatar, an agent's square, a project tile.
    mark: "var(--e-mark)",
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

/**
 * A field's focus ring (INTERACTION_SPEC.md §2.4, D5): the colour at full
 * strength as a 1px ring, so the indicator clears 3:1, and a 4px halo of it
 * at --ix-halo-a (18% light, 22% dark). The danger ring of a field a check
 * refused has the same shape.
 */
export const fieldHalo = (colour: "brand" | "danger") =>
  `0 0 0 1px rgb(var(--${colour})), 0 0 0 ${APP.field.halo}px color-mix(in srgb, rgb(var(--${colour})) var(--ix-halo-a), transparent)`

/** A switch, checkbox or radio under the pointer: a 4px halo of the hover tint (INTERACTION_SPEC.md §4, Toggle). */
const TOGGLE_HALO = "0 0 0 4px color-mix(in srgb, rgb(var(--brand)) var(--ix-hover-a), transparent)"

/** The checkbox's white tick, the icon set's check on its 24 grid. */
const CHECK_TICK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E\")"

/** The shared components' shapes: the app's Button sizes, Input, Chip and Card. */
export function appComponents(): Record<string, Record<string, unknown>> {
  const b = APP.button
  const out: Record<string, Record<string, unknown>> = {
    // THE BUTTON KIND (INTERACTION_SPEC.md §4): the tint's alpha (--ix-a)
    // rises to the hover step under a pointer and the press step while held;
    // a variant paints with it. A press scales the button (.98, .96 under a
    // finger) and comes back over the settle step. Disabled stays hoverable
    // and focusable, so a reason can be shown (data-disabled-reason).
    ".ui-btn": {
      "--ix-a": "0%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.375rem",
      textAlign: "center",
      whiteSpace: "nowrap",
      borderRadius: px(APP.radius[b.radius]),
      fontWeight: String(b.weight),
      transitionProperty: "color, background-color, box-shadow, opacity, scale",
      transitionDuration: "var(--ix-colour), var(--ix-colour), var(--ix-colour), var(--ix-colour), var(--ix-settle)",
      transitionTimingFunction: "var(--ix-ease)",
      WebkitTapHighlightColor: "transparent",
      [HOVER]: { [`&:hover${ENABLED}`]: { "--ix-a": "var(--ix-hover-a)" } },
      [`&:active${ENABLED}`]: { "--ix-a": "var(--ix-press-a)", scale: "var(--ix-press-scale)", transitionDuration: "var(--ix-press)" },
      [COARSE]: { [`&:active${ENABLED}`]: { scale: "var(--ix-press-scale-touch)" } },
      "&:disabled, &[aria-disabled='true']": { cursor: "not-allowed", opacity: String(b.disabledOpacity) },
      "&:focus-visible": { outline: `${b.focus.width}px solid rgb(var(--ring))`, outlineOffset: `${b.focus.offset}px` },
    },
    // The primary: the accent with an inner highlight and a tinted drop; it
    // darkens under the pointer and a step more while pressed.
    ".ui-btn-primary": {
      backgroundColor: "rgb(var(--brand))",
      color: "rgb(var(--brand-foreground))",
      boxShadow: b.primaryShadow.light,
      [HOVER]: { [`&:hover${ENABLED}`]: { backgroundColor: `color-mix(in oklab, rgb(var(--brand)) ${b.hoverMix}%, black)` } },
      [`&:active${ENABLED}`]: { backgroundColor: `color-mix(in oklab, rgb(var(--brand)) ${b.pressMix}%, black)` },
    },
    ".dark .ui-btn-primary": { boxShadow: b.primaryShadow.dark },
    // The secondary: the raised surface at e1, tinted in the accent and
    // raised to e2 under the cursor, back to e1 while pressed.
    ".ui-btn-secondary": {
      backgroundColor: "color-mix(in srgb, rgb(var(--brand)) var(--ix-a), rgb(var(--card)))",
      color: "rgb(var(--foreground))",
      boxShadow: "var(--e-e1)",
      [HOVER]: { [`&:hover${ENABLED}`]: { boxShadow: "var(--e-e2)" } },
      [`&:active${ENABLED}`]: { boxShadow: "var(--e-e1)" },
    },
    // The app's ghost (the site calls it subtle): ink-2 on nothing, the tint
    // and ink under the pointer.
    ".ui-btn-subtle": {
      backgroundColor: "color-mix(in srgb, rgb(var(--brand)) var(--ix-a), transparent)",
      color: "rgb(var(--muted-foreground))",
      [HOVER]: { [`&:hover${ENABLED}`]: { color: "rgb(var(--foreground))" } },
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
      // THE FIELD KIND's hover (§4): the hairline ring, mixed a quarter
      // toward the accent.
      [HOVER]: { "&:hover": { boxShadow: "0 0 0 1px color-mix(in srgb, rgb(var(--brand)) 25%, var(--line-3-c)), 0 1px 2px rgb(16 18 26 / 0.05)" } },
      // Focused, or a select that is open: the spec's D5 halo (fieldHalo).
      "&:focus-visible, &[aria-expanded='true']": { outline: "none", boxShadow: fieldHalo("brand") },
      "&[aria-invalid='true']": { boxShadow: fieldHalo("danger") },
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
    // A key on the keyboard ("/", "⌘ K"): the sheet in a line-2 ring with a
    // 1px bottom inset, so it reads as a key and not as a chip.
    ".ui-kbd": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: px(APP.kbd.height),
      height: px(APP.kbd.height),
      padding: `0 ${px(APP.kbd.paddingX)}`,
      borderRadius: px(APP.radius[APP.kbd.radius]),
      backgroundColor: "rgb(var(--background))",
      boxShadow: "inset 0 0 0 1px var(--line-2-c), inset 0 -1px 0 var(--line-2-c)",
      color: "rgb(var(--muted-foreground))",
      fontWeight: String(APP.kbd.weight),
      ...sizeOf(APP.kbd.text),
    },
    // THE CHECKBOX (§3.10): 16px r5 in an inset 1.5px line-3 ring; checked,
    // it fills moss with a white tick and springs. A native checkbox wears it
    // (appearance: none), and so does a drawn one (a span) in a list of steps.
    ".ui-check": {
      appearance: "none",
      display: "inline-block",
      flex: "none",
      width: px(APP.check.size),
      height: px(APP.check.size),
      margin: "0",
      borderRadius: px(APP.check.radius),
      backgroundColor: "rgb(var(--card))",
      boxShadow: `inset 0 0 0 ${APP.check.ring}px var(--line-3-c)`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: px(12),
      transitionProperty: "background-color, box-shadow",
      transitionDuration: `${APP.motion.duration}ms`,
      transitionTimingFunction: APP.motion.ease,
      "&:checked, &[data-checked]": {
        backgroundColor: "rgb(var(--camp-moss))",
        boxShadow: "none",
        backgroundImage: CHECK_TICK,
        animation: `v3-check ${APP.motion.durations.spring}ms ${APP.motion.spring}`,
      },
      // THE TOGGLE KIND (§4): under the pointer, on the box or its label, a
      // 4px halo of the hover tint round the box (a shadow, so nothing
      // moves), and the empty box's ring a step darker.
      [HOVER]: {
        "label:hover > &:not(:checked, [data-checked]), &:hover:not(:checked, [data-checked])": {
          boxShadow: `inset 0 0 0 ${APP.check.ring}px rgb(var(--faint)), ${TOGGLE_HALO}`,
        },
        "label:hover > &:is(:checked, [data-checked]), &:hover:is(:checked, [data-checked])": { boxShadow: TOGGLE_HALO },
      },
      "&:focus-visible": { outline: `${b.focus.width}px solid rgb(var(--ring))`, outlineOffset: `${b.focus.offset}px` },
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
  for (const name of ["hero", "page", "h2", "close", "title-read", "lead", "price", "price-sm"] as const) {
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
 * - response: fx-shake, fx-stamp, fx-fade, fx-slide and fx-spring. A card's
 *   lift is the interaction layer's card kind (interactionCss), not a class.
 *
 * Under prefers-reduced-motion every one of them is off and the finished
 * state shows, because every keyframe ends at the element's own state.
 */
const MS = APP.motion
const ms = (n: number) => `${n}ms`
/** The stagger steps a class can wait for: 60ms apart, plus the hero's own beats. */
export const MOTION_DELAYS = [60, 120, 180, 240, 300, 340, 380, 420, 480, 540, 600, 700, 900, 1100, 1400, 2200] as const
export const MOTION_TIMES = { lift: 520, rise: 700, chip: 420, pop: 220, draw: 700, ping: 1400, stamp: 360, shake: 180, fade: 160, bob: 1200, ambientFast: 40000, ambient: 60000, ambientSlow: 90000, moment: APP.interaction.ms.panel } as const

export function motionCss(): Record<string, unknown> {
  const t = MOTION_TIMES
  const anim = (name: string, dur: number, ease: string, extra = "both") => `${name} ${ms(dur)} ${ease} ${extra}`
  const classes: Record<string, unknown> = {
    ":root": {
      "--d-press": ms(MS.durations.press),
      // The colour step is the interaction layer's (--ix-colour, 120 ms);
      // --d-hover stays one release as its alias for anything still using it.
      "--d-hover": "var(--ix-colour)",
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
    // A field a failed check points at shakes once (S10); for reduced motion
    // its ring flashes instead.
    "@keyframes v3-flash": { "0%, 100%": { backgroundColor: "rgb(var(--card))" }, "40%": { backgroundColor: "rgb(var(--danger) / 0.12)" } },
    ".ui-field[aria-invalid='true']": { animation: anim("v3-shake", t.shake, MS.easeInOut, "2") },
    "@keyframes v3-fade": { from: { opacity: "0" }, to: { opacity: "1" } },
    "@keyframes v3-slide": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
    "@keyframes v3-spring": { "0%": { transform: "scale(0.6)" }, "60%": { transform: "scale(1.1)" }, "100%": { transform: "none" } },
    // A box being ticked (§3.10): 1, 1.12, 1 on the spring.
    "@keyframes v3-check": { "0%, 100%": { scale: "1" }, "45%": { scale: "1.12" } },
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
    // A post's reading progress (site.md BL2): a 2px brand bar scaling with
    // the page's scroll, decoration only, and absent without scroll timelines.
    "@keyframes v3-progress": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
    ".read-progress": { display: "none" },
    "@supports (animation-timeline: scroll())": {
      ".read-progress": { display: "block", transformOrigin: "0 50%", animation: "v3-progress linear both", animationTimeline: "scroll(root)" },
    },
    "@supports (animation-timeline: view())": {
      ".reveal": { animation: "v3-reveal linear both", animationTimeline: "view()", animationRange: "entry 0% entry 40%" },
    },
    "@media (prefers-reduced-motion: reduce)": {
      ".in-lift, .in-rise, .in-chip, .in-pop, .in-draw, .in-ping, .reveal, .spin-40, .spin-60, .spin-90r, .bob, .fx-shake, .fx-stamp, .fx-fade, .fx-slide, .fx-spring": { animation: "none !important" },
      ".ui-field[aria-invalid='true']": { animation: `v3-flash ${ms(MS.durations.page)} ${MS.ease} 1 !important` },
      ".read-progress": { display: "none !important" },
      ".in-ping": { opacity: "0" },
    },
  }
  for (const d of MOTION_DELAYS) classes[`.at-${d}`] = { animationDelay: ms(d) }
  return classes
}

/** The kinds that answer with a tint (a card lifts instead). */
const TINTED = ["icon", "row", "nav", "tab", "chip", "item"] as const
/** Every kind that tints, as one selector of one attribute's specificity. */
export const TINT_SELECTOR = `:is(${TINTED.map((k) => `[data-interactive="${k}"]`).join(", ")})`
/** One kind, or several, as a selector. */
const kind = (...k: string[]) => (k.length === 1 ? `[data-interactive="${k[0]}"]` : `:is(${k.map((x) => `[data-interactive="${x}"]`).join(", ")})`)
/** What ARIA says is on: a tab chosen, a radio checked, a toggle pressed. */
const ON = `:is([aria-selected="true"], [aria-checked="true"], [aria-pressed="true"])`
/** The current page, for a nav row or a row. */
const CURRENT = `:is([aria-current="page"], [aria-current="true"])`

/**
 * THE INTERACTION LAYER (INTERACTION_SPEC.md §9.3), the app's attribute API on
 * this site. A component says what kind of thing it is, once, on the element
 * that takes the pointer (data-interactive, written by lib/interactive.ts's
 * ix()), and whose colour it is (data-hue); these rules draw every state from
 * the --ix tokens, so a component carries no hover, press or selected classes
 * of its own (app/interaction.test.ts holds that).
 *
 * - The tint is the accent, or the object's hue: --ix-tint at --ix-a. Hover
 *   raises --ix-a to the hover step, only where a pointer hovers; a press to
 *   the press step; never on a parent while a nested control is the one under
 *   the pointer.
 * - The press answers a finger as the app's F2 does: a chip .98 (.96 under a
 *   finger), an icon button .92 under a finger, a card .99 (.985) and back to
 *   e1, a row, a tab and a nav row their press tint at once; the browser's
 *   grey tap flash is off, so the press is the one answer.
 * - Selected is a tint plus a cue that is not colour: the raised knob for a
 *   segmented tab, the raised chip for a nav row, a 1.5px ring for a chip, the
 *   2px bar for a row, the highlight for a list option. A label that turns 510
 *   when current reserves that width (data-label), so nothing moves.
 * - Focus is the global ring, outside; inset for a row and a nav row.
 * - A card lifts to e2 a pixel up, its e2 drawn on ::before and faded in, so
 *   the lift never transitions a box-shadow.
 * - Disabled stays focusable and says why (data-disabled-reason).
 * - Reduced motion: no transform anywhere, and colour changes at once.
 *
 * An ordered list of blocks, because the cascade's order is part of the
 * design: hover, then press, then what is on, then what is on under the
 * pointer.
 */
export function interactionCss(): Record<string, unknown>[] {
  const hues: Record<string, unknown> = {}
  for (const hue of [...CAMP_HUES, "agent"] as const) {
    const strong = hue === "agent" ? "--agent" : `--camp-${hue}`
    hues[`[data-interactive][data-hue="${hue}"]`] = { "--ix-tint": `rgb(var(${strong}))`, "--ix-mark": `rgb(var(${strong}-a2))` }
    // Light marks use the avatar's deep stop (a2), which holds 3:1 on its own
    // tint; dark ones the strong cut (spec D2).
    hues[`:is(.dark, .night) [data-interactive][data-hue="${hue}"]`] = { "--ix-mark": `rgb(var(${strong}))` }
  }
  return [
    {
      // The tint's source, declared on the element, so it sees the theme on body.
      "[data-interactive]": {
        "--ix-tint": "rgb(var(--brand))",
        "--ix-mark": "rgb(var(--brand))",
        "--ix-a": "0%",
        WebkitTapHighlightColor: "transparent",
      },
      ...hues,
      // One attribute's weight: above the reset's button { background-color:
      // transparent } (a :where() here lost to it, and no button ever
      // tinted), below any utility, so a component's own ground (a raised
      // chip, a card) still wins over the tint.
      [TINT_SELECTOR]: {
        // Over the element's own ground when it has one (--ix-ground: a choice
        // card's raised surface), else over whatever is under it.
        backgroundColor: "color-mix(in srgb, var(--ix-tint) var(--ix-a), var(--ix-ground, transparent))",
        transitionProperty: "background-color, color, box-shadow, scale",
        transitionDuration: "var(--ix-colour), var(--ix-colour), var(--ix-colour), var(--ix-settle)",
        transitionTimingFunction: "var(--ix-ease)",
      },
      // THE CARD: e1 at rest; e2 under the pointer, drawn on ::before.
      [kind("card")]: {
        position: "relative",
        transitionProperty: "translate, scale",
        transitionDuration: "var(--ix-lift), var(--ix-settle)",
        transitionTimingFunction: "var(--ix-ease)",
      },
      [`${kind("card")}::before`]: {
        content: '""',
        position: "absolute",
        inset: "0",
        borderRadius: "inherit",
        boxShadow: "var(--e-lift)",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity var(--ix-lift) var(--ix-ease)",
      },
    },
    {
      // HOVER: devices that hover; the nested control answers, not its parent.
      [HOVER]: {
        [`[data-interactive]:hover${ENABLED}`]: { "--ix-a": "var(--ix-hover-a)" },
        // A large row (two lines and more) hovers at the quiet step (spec D10).
        [`[data-interactive="row"][data-quiet]:hover${ENABLED}`]: { "--ix-a": "var(--ix-hover-quiet-a)" },
        "[data-interactive]:hover:has([data-interactive]:hover)": { "--ix-a": "0%" },
        // Labels go to ink; dense lists answer at once and let go over 120ms.
        [`${kind("icon", "nav", "tab", "chip")}:hover${ENABLED}`]: { color: "rgb(var(--foreground))" },
        [`${kind("row", "nav", "item")}:hover`]: { transitionDuration: "0ms" },
        [`${kind("card")}:hover${ENABLED}`]: { translate: "0 -1px" },
        [`${kind("card")}:hover${ENABLED}::before`]: { opacity: "1" },
        "[data-disabled-reason]:hover::after": { opacity: "1", translate: "-50% 0", transitionDelay: "var(--ix-tip-delay)" },
      },
    },
    {
      // PRESSED: the press tint in 90ms; chips and icon buttons scale too, and a
      // card goes back to e1 at .99.
      [`[data-interactive]:active${ENABLED}`]: { "--ix-a": "var(--ix-press-a)", transitionDuration: "var(--ix-press)" },
      [`${kind("chip", "icon")}:active${ENABLED}`]: { scale: "var(--ix-press-scale)" },
      [`${kind("card")}:active${ENABLED}`]: { translate: "0 0", scale: "var(--ix-press-scale-card)" },
      [`${kind("card")}:active::before`]: { opacity: "0" },
      // A finger hides what it presses: the stronger press, and a row's tint
      // at once (the app's F2).
      [COARSE]: {
        [`${kind("chip")}:active${ENABLED}`]: { scale: "var(--ix-press-scale-touch)" },
        [`${kind("icon")}:active${ENABLED}`]: { scale: "var(--ix-press-scale-icon)" },
        [`${kind("card")}:active${ENABLED}`]: { scale: "var(--ix-press-scale-card-touch)" },
        [`${kind("row", "nav", "tab", "item")}:active${ENABLED}`]: { transitionDuration: "0ms" },
        // A list option is 44 px tall under a finger (spec §6.6).
        [kind("item")]: { minHeight: "2.75rem" },
      },
    },
    {
      // SELECTED: the tint plus a cue that is not colour.
      // A segmented tab: the raised knob, unless a sliding thumb draws it (data-thumb).
      [`[data-interactive="tab"]:not([data-thumb])${ON}`]: {
        backgroundColor: "rgb(var(--card))",
        boxShadow: "var(--ix-knob, var(--e-e1))",
      },
      [`[data-interactive="tab"]${ON}`]: { color: "rgb(var(--foreground))" },
      // A nav row: the raised chip at e-sel, the sidebar's form (spec D3).
      [`[data-interactive="nav"]${CURRENT}`]: {
        backgroundColor: "rgb(var(--card))",
        boxShadow: "var(--e-sel)",
        color: "rgb(var(--foreground))",
        fontWeight: "510",
      },
      [`${kind("tab", "nav")}:is(${CURRENT}, ${ON}) .icon`]: { color: "var(--ix-mark)" },
      // A chip that is on: the selected tint and a 1.5px ring in the mark.
      [`[data-interactive="chip"]${ON}`]: {
        "--ix-a": "var(--ix-sel-a)",
        boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--ix-mark) 60%, transparent)",
        color: "rgb(var(--foreground))",
      },
      // A row: the selected tint and the 2px bar on its leading edge.
      [`[data-interactive="row"]:is(${CURRENT}, [aria-selected="true"])`]: {
        "--ix-a": "var(--ix-sel-a)",
        boxShadow: "inset var(--ix-bar) 0 0 0 var(--ix-mark)",
      },
      // A list option under the keys or the pointer: the press tint, no ring
      // (the highlight is the focus, spec §2.4).
      [`[data-interactive="item"][data-active]`]: { "--ix-a": "var(--ix-press-a)", color: "rgb(var(--foreground))" },
      // Weight never moves layout (spec D8): a label that turns 510 when
      // current reserves that width, wherever it is.
      "[data-label]": { display: "inline-flex", flexDirection: "column" },
      "[data-label]::after": {
        content: "attr(data-label)",
        height: "0",
        overflow: "hidden",
        visibility: "hidden",
        fontWeight: "510",
        userSelect: "none",
        pointerEvents: "none",
      },
    },
    {
      // What is on, under the pointer: a step stronger than either.
      [HOVER]: {
        [`${kind("chip", "row")}:is(${ON}, ${CURRENT}):hover`]: { "--ix-a": "var(--ix-sel-hover-a)" },
      },
      // FOCUS: the global ring, outside; inset for a full-bleed row.
      [`${kind("row", "nav")}:focus-visible`]: { outlineOffset: "calc(var(--ix-ring) * -1)" },
      [`${kind("item")}:focus-visible`]: { outline: "none" },
      // DISABLED, with its reason in a tip: on hover after the tip's wait, on focus at once.
      "[data-interactive][aria-disabled='true']": { opacity: "var(--ix-disabled)", cursor: "not-allowed" },
      "[data-disabled-reason]": { position: "relative" },
      "[data-disabled-reason]::after": {
        content: "attr(data-disabled-reason)",
        position: "absolute",
        left: "50%",
        bottom: "calc(100% + 6px)",
        zIndex: "60",
        padding: "4px 8px",
        borderRadius: "6px",
        backgroundColor: "rgb(var(--foreground))",
        color: "rgb(var(--background))",
        font: "510 12px/16px var(--font-sans), ui-sans-serif, system-ui, sans-serif",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: "0",
        translate: "-50% 4px",
        transition: "opacity var(--ix-pop) var(--ix-ease), translate var(--ix-pop) var(--ix-ease)",
      },
      "[data-disabled-reason]:focus-visible::after": { opacity: "1", translate: "-50% 0" },
      // REDUCED MOTION: no transform anywhere in the layer; colour at once.
      "@media (prefers-reduced-motion: reduce)": {
        "[data-interactive], [data-interactive]::before, .ui-btn, .go-arrow": { scale: "none !important", translate: "none !important", rotate: "none !important" },
      },
    },
  ]
}

export default plugin(({ addBase, addComponents, addUtilities }) => {
  addBase({ ":root": { ...colourTokens("light"), ...interactionTokens("light") }, ".dark": { ...colourTokens("dark"), ...interactionTokens("dark") } })
  addBase({ ".night": nightTokens("light"), ".dark .night": nightTokens("dark") })
  addBase(motionCss() as CSSRuleObject)
  addBase(interactionCss() as CSSRuleObject[])
  addComponents(appComponents() as CSSRuleObject)
  addUtilities(marketingUtilities() as CSSRuleObject)
})
