import { CAMP_HUES, hueFor, type CampHue } from "@/lib/campHue";

/**
 * The products the site names in lists, each list in the order it is shown:
 * /compare's table (lib/compare.ts) and the /alternatives pages in the
 * footer's order (lib/alternatives.ts). Written out rather than read from
 * those files, so the home page, which shows two of these marks, does not
 * import every rival's copy; productName.test.tsx holds them to those files.
 */
export const PRODUCT_SERIES: readonly (readonly string[])[] = [
  ["Huly", "Nextcloud", "Mattermost", "Buzz", "Ando", "Plane"],
  ["Slack", "Basecamp", "Notion", "ClickUp", "Asana", "monday.com", "Toggl Track"],
];

/**
 * The hue a product wears on the site: its square in every comparison, and
 * the band on its /alternatives page.
 *
 * The products are a categorical series, so each list takes the palette's
 * fixed order (sky, moss, sun, dusk, berry, lake; PLAYFUL_LAYER.md).
 * Neighbours never match, and any six in a row are six hues. Hashing the
 * name, as the app does for people and channels, put Slack, Notion, ClickUp,
 * Asana and Toggl Track all on lake, and the table's first two rows, Huly and
 * Nextcloud, both on sun. A name in neither list (the "Slack + Notion + Zoom"
 * stack on the home page) keeps its hash.
 */
const PRODUCT_HUE: ReadonlyMap<string, CampHue> = new Map(
  PRODUCT_SERIES.flatMap((names) => names.map((name, i) => [name, CAMP_HUES[i % CAMP_HUES.length]] as const)),
);

export function productHue(name: string): CampHue {
  return PRODUCT_HUE.get(name) ?? hueFor(name);
}
