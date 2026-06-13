/**
 * Semantic category colors synced with OneCamp FE (onecamp-fe/lib/colors.ts).
 * Use for marketing showcases and feature cards so the site matches the product.
 */

export interface CategoryColorSet {
  bg: string;
  text: string;
  solid: string;
  solidText: string;
}

export const categoryColors = {
  chat: {
    bg: "bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    solid: "bg-sky-500",
    solidText: "text-white",
  },
  channel: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    solid: "bg-emerald-500",
    solidText: "text-white",
  },
  doc: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    solid: "bg-amber-500",
    solidText: "text-white",
  },
  task: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    solid: "bg-rose-500",
    solidText: "text-white",
  },
  ai: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    solid: "bg-violet-500",
    solidText: "text-white",
  },
  team: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    solid: "bg-orange-500",
    solidText: "text-white",
  },
  project: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    solid: "bg-cyan-500",
    solidText: "text-white",
  },
  calendar: {
    bg: "bg-teal-500/10",
    text: "text-teal-600 dark:text-teal-400",
    solid: "bg-teal-500",
    solidText: "text-white",
  },
  video: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    solid: "bg-blue-500",
    solidText: "text-white",
  },
  lock: {
    bg: "bg-muted",
    text: "text-foreground",
    solid: "bg-foreground",
    solidText: "text-background",
  },
} as const satisfies Record<string, CategoryColorSet>;

export type CategoryKey = keyof typeof categoryColors;