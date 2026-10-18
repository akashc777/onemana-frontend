import { Dot } from "@/components/ui/v3";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * A group of guides (Deployment, Setup flow) is no area of the product, so
 * its mark is neutral ink (design v3.1): a hue hashed from its name named
 * nothing, and borrowed an area's colour besides.
 */
export function docsGroupHue(_category: string): "ink" {
  return "ink";
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
    <Tile hue={hue} size="lg">
      <span className="text-small font-[590]">{category.trim().slice(0, 1).toUpperCase()}</span>
    </Tile>
  );
}

/** The group's dot in the sidebar, beside its name: identity as a dot (site.md G7). */
export function DocsGroupDot({ category }: { category: string }) {
  return <Dot hue="ink" size={7} />;
}
