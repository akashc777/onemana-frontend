import { hueFor, type CampHue } from "@/lib/campHue";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * A group of guides has a colour of its own (the playful layer: every doc
 * gets a stable hue), from its name, so the docs index and the sidebar of
 * every guide agree on it: Deployment is sky, Setup flow is moss.
 */
export function docsGroupHue(category: string): CampHue {
  return hueFor(category);
}

/** An icon for the groups the CMS has; any other group shows its initial. */
function glyph(category: string): IconName | null {
  const name = category.trim().toLowerCase();
  if (/deploy|server|host|install/.test(name)) return "server";
  if (/setup|flow|use|using|feature/.test(name)) return "sliders";
  return null;
}

/** The group's tile on the docs index: its icon on its tint. */
export function DocsGroupTile({ category }: { category: string }) {
  const hue = docsGroupHue(category);
  const icon = glyph(category);
  return icon ? (
    <Tile hue={hue} size="lg">
      <Icon name={icon} />
    </Tile>
  ) : (
    <IdentityMark hue={hue} variant="tile" size={36} label={category} />
  );
}

/** The group's dot in the sidebar, beside its name: identity as a dot (site.md G7). */
export function DocsGroupDot({ category }: { category: string }) {
  return <IdentityMark hue={docsGroupHue(category)} variant="dot" size={7} />;
}
