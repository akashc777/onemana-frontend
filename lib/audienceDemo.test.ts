import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

import { audiences } from "@/lib/audiences";
import { alternatives } from "@/lib/alternatives";
import { defaultPricing } from "@/lib/pricing";
import { DEMO_PLACES, site } from "@/lib/site";
import { AudienceView } from "@/components/site/AudienceView";

// Every audience and "alternative to" page started the demo on the home
// screen, so somebody leaving Slack, Asana or Toggl met a generic Home rather
// than the part of OneCamp the page had just described. Each page now names
// its place, and the demo lands them there.

const pages = [...audiences, ...alternatives];
const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));

describe("where each page's visitors land in the demo", () => {
  it("is a place the demo knows, for every page that names one", () => {
    for (const p of pages) {
      if (p.demo) expect(DEMO_PLACES, `${p.slug} names ${p.demo}`).toContain(p.demo);
    }
  });

  it("is the part of OneCamp the page talks about", () => {
    expect(bySlug.slack.demo).toBe("engineering");
    for (const slug of ["asana", "monday", "clickup"]) expect(bySlug[slug].demo, slug).toBe("board");
    expect(bySlug.notion.demo).toBe("docs");
    expect(bySlug.toggl.demo).toBe("time");
    expect(bySlug.agencies.demo).toBe("client");
    expect(bySlug.compliance.demo).toBe("drill");
  });

  it("is what the page's demo button opens", () => {
    for (const p of pages) {
      const html = renderToString(createElement(AudienceView, { a: p, pricing: defaultPricing }));
      const want = p.demo ? site.demoUrlTo(p.demo) : site.demoStartUrl;
      expect(html, p.slug).toContain(`href="${want.replace(/&/g, "&amp;")}"`);
    }
  });

  it("still starts the demo, on its home screen, for a page that names none", () => {
    const india = renderToString(createElement(AudienceView, { a: bySlug.india, pricing: defaultPricing }));
    expect(bySlug.india.demo).toBeUndefined();
    expect(india).toContain("start_demo=1");
  });
});
