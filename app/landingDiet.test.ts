import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { governance, faqs, features, MODULES_ON_HOMEPAGE } from "@/lib/content";

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

  it("keeps the wedge modules above the fold, not in the overflow line", () => {
    // The slice took the array's historical order on the first attempt, which
    // demoted "Your server" (the entire self-host pitch) and "Video" (LiveKit on
    // your own hardware) into the "also" line while keeping Whiteboard and
    // Automations visible. The order of this array is now load-bearing.
    const visible = features.slice(0, MODULES_ON_HOMEPAGE).map((f) => f.title);
    for (const must of ["AI agents", "Local AI", "Audit trail", "Your server", "Video", "Chat"]) {
      expect(visible, `${must} must be listed on the homepage, not deferred to the docs`).toContain(must);
    }
  });

  it("keeps every module body to one line", () => {
    // Fifteen bodies averaging 36 words were the bulk of this section. The index
    // answers "does it have X"; it is not the place to argue.
    for (const f of features) {
      expect(f.body.split(/\s+/).length, `"${f.title}" is back to a paragraph: ${f.body}`).toBeLessThanOrEqual(10);
    }
  });

  it("does not auto-rotate the workspace showcase", () => {
    // It advanced every 8 seconds. DESIGN.md bans infinite decorative loops and
    // the redesign plan's motion allowlist forbids anything that runs forever;
    // a reader also experiences it as the surface changing while they are still
    // reading the one they chose.
    const showcase = readFileSync(join(root, "components/site/showcase/WorkspaceShowcase.tsx"), "utf8");
    expect(showcase, "setInterval is an auto-advancing carousel").not.toMatch(/setInterval/);
  });

  it("renders only the active showcase panel", () => {
    // All five rendered at once with the inactive ones at opacity-0. That put
    // five surfaces of simulated UI into the server HTML, mounted five
    // showcases on the client, and left four invisible workspaces in the
    // keyboard tab order.
    const showcase = readFileSync(join(root, "components/site/showcase/WorkspaceShowcase.tsx"), "utf8");
    const panelRegion = showcase.slice(showcase.indexOf("min-h-[min(420px"));
    expect(
      panelRegion,
      "the panel region maps over every tab, so all of them render",
    ).not.toMatch(/TABS\.map/);
    expect(panelRegion).toMatch(/TABS\[active\]/);
  });

  it("does not put shine or halo chrome on the marketing cards", () => {
    const marketing = readFileSync(join(root, "components/site/marketing.tsx"), "utf8");
    for (const cls of ["card-shine", "feature-halo", "card-premium"]) {
      expect(marketing, `${cls} is the AI-SaaS card kit the critique named`).not.toContain(cls);
    }
  });
});

/**
 * Copy the redesign plan specifies verbatim must survive the word budget.
 *
 * The diet and the brief can pull in opposite directions, and when they did, the
 * diet won and was wrong: the final CTA's sub-line is written out in the plan's
 * §3.4 and was cut anyway as "the thesis a fourth time". A reader who scrolled
 * past the hero without reading it meets the claim once, at the close, which is
 * the whole reason the plan puts it there.
 *
 * So the budget may take anything EXCEPT the lines the brief dictates. Those are
 * pinned here, and shortening one is now a decision about the brief rather than a
 * side effect of counting words.
 */
describe("copy the plan specifies", () => {
  const required: [string, string][] = [
    ["final CTA headline", "If you can&apos;t say what your AI is allowed to do, this is for you."],
    ["final CTA sub-line", "Bounded by your permissions. Audited before it acts. On hardware you own."],
  ];
  for (const [what, text] of required) {
    it(`keeps the ${what}`, () => {
      expect(
        page.includes(text),
        `The ${what} is gone from app/page.tsx. It is written out in §3.4 of the ` +
          `redesign plan, so removing it is a change to the brief, not a trim.`,
      ).toBe(true);
    });
  }
});
