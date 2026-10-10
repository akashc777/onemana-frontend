import { hueFor, type CampHue } from "@/lib/campHue";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
import { Tile } from "@/components/ui/graphics/Tile";

/**
 * A group of guides has a colour of its own (the playful layer: every doc
 * gets a stable hue), from its name, so the docs index and the sidebar of
 * every guide agree on it: Deployment is sky, Setup flow is moss.
 */
export function docsGroupHue(category: string): CampHue {
  return hueFor(category);
}

/** A glyph for the groups the CMS has; any other group shows its initial. */
function glyph(category: string) {
  const name = category.trim().toLowerCase();
  if (/deploy|server|host|install/.test(name)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round">
        <rect x="2.75" y="2.75" width="10.5" height="4.5" rx="1.25" />
        <rect x="2.75" y="8.75" width="10.5" height="4.5" rx="1.25" />
        <circle cx="5.25" cy="5" r="0.75" fill="currentColor" stroke="none" />
        <circle cx="5.25" cy="11" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (/setup|flow|use|using|feature/.test(name)) {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.17" strokeLinecap="round">
        <path d="M2.75 4.5h10.5M2.75 11.5h10.5" />
        <circle cx="10.5" cy="4.5" r="1.75" fill="rgb(var(--hue-tint))" />
        <circle cx="5.5" cy="11.5" r="1.75" fill="rgb(var(--hue-tint))" />
      </svg>
    );
  }
  return null;
}

/** The group's tile on the docs index: its glyph on its tint. */
export function DocsGroupTile({ category }: { category: string }) {
  const hue = docsGroupHue(category);
  const icon = glyph(category);
  return icon ? (
    <Tile hue={hue} size="lg">
      {icon}
    </Tile>
  ) : (
    <IdentityMark hue={hue} variant="tile" size={40} label={category} />
  );
}

/** The group's square in the sidebar, beside its name. */
export function DocsGroupDot({ category }: { category: string }) {
  return <IdentityMark hue={docsGroupHue(category)} variant="square" size={8} />;
}
