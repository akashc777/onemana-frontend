import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DocsGroupDot, DocsGroupTile, docsGroupHue } from "@/components/docs/DocsGroupMark";

/**
 * A group of guides is no area of the product, so its tile on the docs index
 * and its dot in every guide's sidebar are neutral ink (design v3.1).
 */
describe("a docs group's colour", () => {
  it("is neutral ink, however the CMS spells the group", () => {
    expect(docsGroupHue("Deployment")).toBe("ink");
    expect(docsGroupHue(" deployment ")).toBe("ink");
    expect(docsGroupHue("Setup flow")).toBe("ink");
  });

  it("is what the index tile and the sidebar dot both draw, and no camp hue", () => {
    for (const html of [renderToString(<DocsGroupTile category="Deployment" />), renderToString(<DocsGroupDot category="Deployment" />), renderToString(<DocsGroupTile category="Setup flow" />)]) {
      expect(html).not.toMatch(/hue-(sky|moss|sun|lake|dusk|berry)/);
    }
    expect(renderToString(<DocsGroupDot category="Deployment" />)).toContain("bg-ink-4");
  });

  it("gives a group it has no glyph for its initial instead", () => {
    const html = renderToString(<DocsGroupTile category="Billing" />);
    expect(html).toContain(">B<");
  });
});
