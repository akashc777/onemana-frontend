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
