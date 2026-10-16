import { hueFor, type CampHue } from "@/lib/campHue";

/**
 * The order a categorical series takes the six hues in: the charts' and
 * timelines' order (PLAYFUL_LAYER.md, "Charts and timelines"; the app's
 * components/table/tableChartPalette.ts). Neighbours differ by at least
 * ΔE 8 under the common colour-blindness simulations. It changed from sky,
 * moss, sun, dusk, berry, lake (which reached only 6) during the wave 2
 * integration; the identity hash (lib/campHue CAMP_HUES) did not change.
 */
export const SERIES_HUES: readonly CampHue[] = ["sky", "berry", "sun", "lake", "dusk", "moss"];

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
 * The products are a categorical series, so each list takes the series
 * order above (sky, berry, sun, lake, dusk, moss; PLAYFUL_LAYER.md).
 * Neighbours never match, and any six in a row are six hues. Hashing the
 * name, as the app does for people and channels, put Slack, Notion, ClickUp,
 * Asana and Toggl Track all on lake, and the table's first two rows, Huly and
 * Nextcloud, both on sun. A name in neither list (the "Slack + Notion"
 * stack on the home page) keeps its hash.
 */
const PRODUCT_HUE: ReadonlyMap<string, CampHue> = new Map(
  PRODUCT_SERIES.flatMap((names) => names.map((name, i) => [name, SERIES_HUES[i % SERIES_HUES.length]!] as const)),
);

export function productHue(name: string): CampHue {
  return PRODUCT_HUE.get(name) ?? hueFor(name);
}
