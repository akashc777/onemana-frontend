import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DocsGroupDot, DocsGroupTile, docsGroupHue } from "@/components/docs/DocsGroupMark";

/**
 * A group of guides keeps one colour wherever it appears: its tile on the
 * docs index and its square in every guide's sidebar come from the same hue.
 */
describe("a docs group's colour", () => {
  it("is stable, and the same however the CMS spells the group", () => {
    expect(docsGroupHue("Deployment")).toBe("sky");
    expect(docsGroupHue(" deployment ")).toBe("sky");
    expect(docsGroupHue("Setup flow")).toBe("moss");
  });

  it("is what the index tile and the sidebar square both draw", () => {
    expect(renderToString(<DocsGroupTile category="Deployment" />)).toContain("hue-sky");
    expect(renderToString(<DocsGroupDot category="Deployment" />)).toContain("hue-sky");
    expect(renderToString(<DocsGroupTile category="Setup flow" />)).toContain("hue-moss");
  });

  it("gives a group it has no glyph for its initial instead", () => {
    const html = renderToString(<DocsGroupTile category="Billing" />);
    expect(html).toContain(">B<");
  });
});
