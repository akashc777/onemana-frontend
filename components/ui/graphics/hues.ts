import type { CampHue } from "@/lib/campHue"

/**
 * The class that makes a camp hue the current one (the .hue-* classes in
 * app/globals.css), by name. Inside it, bg-hue-tint, text-hue-ink, fill-hue
 * and stroke-hue draw in that hue, so a component picks its hue with one
 * class and its parts never name it. The workspace has the same map.
 *
 * Literal strings, so Tailwind keeps every one of them: a class built as
 * `hue-${name}` is invisible to it and would silently draw nothing. That is
 * also why this lives in components/ (Tailwind reads app/ and components/,
 * not lib/).
 */
export const HUE_CLASS: Record<CampHue, string> = {
  sky: "hue-sky",
  moss: "hue-moss",
  sun: "hue-sun",
  dusk: "hue-dusk",
  berry: "hue-berry",
  lake: "hue-lake",
}

/**
 * The agent's indigo as the current hue (G7: agents are indigo, never dusk),
 * for a part that takes a hue where an agent stands in for a camp hue.
 */
export const AGENT_HUE_CLASS = "[--hue:var(--agent)] [--hue-tint:var(--agent-muted)] [--hue-ink:var(--agent-ink)]"

/**
 * OneCamp's own orange as the current hue, for the one tile that stands for
 * the product itself (the 404's "home page"): the accent's soft ground under
 * the logo, never a camp hue.
 */
export const BRAND_HUE_CLASS = "[--hue:var(--brand)] [--hue-tint:var(--brand-soft)] [--hue-ink:var(--brand-ink)]"

/**
 * Neutral ink as the current hue (design v3.1): for a tile that names no
 * area of the product (installing, updating, backups, sign-in), whose glyph
 * draws in ink-2 on the sunken surface. Colour names an area; this names none.
 */
export const INK_HUE_CLASS = "[--hue:var(--muted-foreground)] [--hue-tint:var(--muted)] [--hue-ink:var(--foreground)]"

/** The class for a camp hue, the agent's indigo, the brand, or neutral ink. */
export function hueOrAgent(hue: CampHue | "agent" | "brand" | "ink"): string {
  return hue === "agent" ? AGENT_HUE_CLASS : hue === "brand" ? BRAND_HUE_CLASS : hue === "ink" ? INK_HUE_CLASS : HUE_CLASS[hue]
}

/**
 * A face without a photo: the hue's tint behind its ink initials, inside a
 * hairline of its strong cut. Ink on its tint is 5.9:1 or more in light and
 * 10.4:1 or more in dark (app/paletteContrast.test.ts).
 */
export function avatarHueClass(hue: CampHue): string {
  return `${HUE_CLASS[hue]} bg-hue-tint text-hue-ink ring-1 ring-inset ring-hue/40`
}

/** Joins class names, skipping the empty ones (this site carries no clsx). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}
