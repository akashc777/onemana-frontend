import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Reveal } from "@/components/site/Reveal";

/**
 * Every reveal on the homepage used to be server-rendered at opacity 0 and only
 * shown by an IntersectionObserver, so without JavaScript all 49 sections of
 * onemana.dev were blank: crawlers, link previews, reader mode. The server
 * render must be visible, and the stylesheet may only hide a pending block.
 */
describe("Reveal", () => {
  it("renders visible on the server", () => {
    const html = renderToString(<Reveal>hello</Reveal>);
    expect(html).toContain("hello");
    expect(html).not.toContain("is-pending");
  });

  it("hides only a pending block in CSS", () => {
    const css = readFileSync(resolve(__dirname, "../../app/globals.css"), "utf8");
    const rule = css.match(/\n\s*\.reveal\s*\{([^}]*)\}/);
    expect(rule, ".reveal rule").toBeTruthy();
    expect(rule![1]).not.toMatch(/opacity:\s*0/);
    expect(css).toMatch(/\.reveal\.is-pending\s*\{\s*opacity:\s*0/);
  });
});
