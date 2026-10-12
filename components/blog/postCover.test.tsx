import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PostCover } from "@/components/blog/PostCover";
import { site } from "@/lib/site";

/**
 * A post's cover: a box of a fixed shape that the cover fills, so the text
 * under it cannot jump when it loads, shown as published (never resized).
 * It used to reserve 1200 by 630 for covers that are mostly 1440 by 900.
 */
describe("a post's cover", () => {
  const media = `${site.backendUrl}/onecamp/blog/media/05fbc1a3-7547-4e3e-914e-e1682631bb6e`;

  it("keeps a 16:10 box, filled, on its topic's tint, and loads first", () => {
    const html = renderToString(<PostCover src={media} hue="sun" />);
    expect(html).toContain("hue-sun");
    // No tinted frame since design v3: the cover sits at e2 on the page.
    expect(html).toContain("shadow-e2");
    expect(html).not.toContain("bg-hue-tint");
    expect(html).toContain("aspect-[16/10]");
    expect(html).toContain("object-cover");
    // next/image with priority: eager and fetched early, but never through the
    // optimiser, whose every resize counts against Vercel's free plan.
    expect(html).toContain('fetchpriority="high"');
    expect(html).not.toContain('loading="lazy"');
    expect(html).not.toContain("/_next/image");
    expect(html).toContain(`src="${media}"`);
  });

  it("no image is resized by the optimiser, a cover from anywhere is shown as it is", () => {
    const html = renderToString(<PostCover src="https://example.com/cover.png" hue="sky" />);
    expect(html).toContain('src="https://example.com/cover.png"');
    const config = readFileSync("next.config.mjs", "utf8");
    expect(config).toContain("images: { unoptimized: true }");
    expect(config).not.toContain("remotePatterns");
  });

  it("is no longer an <img> the page sizes by hand", () => {
    const page = readFileSync("app/blog/[slug]/page.tsx", "utf8");
    expect(page).not.toContain("<img");
    expect(page).not.toContain("eslint-disable");
    expect(page).toContain("<PostCover");
    expect(page).toContain("<Prose");
  });
});
