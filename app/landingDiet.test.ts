import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { governance, faqs } from "@/lib/content";

/**
 * The homepage may only get shorter and quieter.
 *
 * The landing critique of 13 September 2026 found ~4,000 words, twelve equal
 * sections, seven governance essays, fourteen FAQs, a WebGL particle sphere, and
 * shine/halo chrome on every card, and named the result "AI slop" despite the
 * copy itself being good. DESIGN.md already banned most of it. The bans were not
 * enforced, so the page grew back the same shapes each time something was
 * added.
 *
 * These are ratchets, in the same spirit as the product repo's guards: each
 * number may fall freely and any rise fails. The specific components are named
 * because they were the specific offenders, and because a decorative component
 * that is deleted and later re-added is exactly the regression nobody notices in
 * review.
 */
const root = process.cwd();
const page = readFileSync(join(root, "app/page.tsx"), "utf8");

describe("landing diet", () => {
  it("makes at most three governance arguments on the homepage", () => {
    // Seven of equal weight flattened the three that carry the thesis. The rest
    // is one "also shipped" line and a link to the docs.
    expect(governance.points.length).toBeLessThanOrEqual(3);
    expect(governance.alsoShipped, "the removed points must still be mentioned somewhere").toBeTruthy();
  });

  it("answers at most six FAQs on the homepage", () => {
    expect(faqs.length).toBeLessThanOrEqual(6);
  });

  it("does not mount the WebGL hero or the scroll parallax", () => {
    for (const banned of ["HeroThree", "ScrollParallax", "TiltCard"]) {
      expect(page, `${banned} is decorative motion the critique removed`).not.toContain(banned);
      expect(existsSync(join(root, `components/site/${banned}.tsx`)), `${banned}.tsx should not exist`).toBe(false);
    }
  });

  it("does not ship three or gsap", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    for (const dep of ["three", "gsap", "@types/three"]) {
      expect(pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep], `${dep} is back in package.json`).toBeUndefined();
    }
  });

  it("does not re-open the 'replaces Slack, Notion, Zoom' fight on the homepage", () => {
    expect(page).not.toContain("<StackConvergence");
  });

  it("does not claim 'no mockups'", () => {
    // Only true if every surface is literally the live app. It was not, and
    // DESIGN.md's own rule is to say what is not true too.
    const sources = ["app/page.tsx", "lib/content.ts", "components/site/HeroProductVideo.tsx"]
      .map((f) => readFileSync(join(root, f), "utf8"))
      .join("\n");
    expect(sources.toLowerCase()).not.toMatch(/no (slick )?mockups/);
  });

  it("does not put shine or halo chrome on the marketing cards", () => {
    const marketing = readFileSync(join(root, "components/site/marketing.tsx"), "utf8");
    for (const cls of ["card-shine", "feature-halo", "card-premium"]) {
      expect(marketing, `${cls} is the AI-SaaS card kit the critique named`).not.toContain(cls);
    }
  });
});
