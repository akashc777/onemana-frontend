import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import DocNotFound from "@/app/docs/[slug]/not-found";

// The docs search navigates with the app router, which a string render has not mounted.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { WorkspaceSection } from "@/components/account/WorkspaceSection";
import { Celebration } from "@/components/site/Celebration";
import { DocsPager } from "@/components/docs/DocsShell";
import type { PortalOverview, PortalSubscription } from "@/lib/portalApi";

/**
 * The playful layer's moments on the reading and account surfaces: spot
 * illustrations where something is empty or missing, a celebration where a
 * purchase went through, and lift on the cards that open something.
 */
const nothing: PortalOverview = {
  customer: { id: "c", email: "a@b.in", name: "", gstin: "", phone: "", address_line: "", city: "", state: "", state_code: "", country: "", created_at: "" },
  licenses: [],
  order_count: 0,
  invoice_count: 0,
  subscriptions: [],
};

describe("spot illustrations", () => {
  it("an empty docs search shows the search spot beside its words", () => {
    expect(readFileSync("components/docs/DocsSearch.tsx", "utf8")).toMatch(/hits\.length === 0 \? \([\s\S]*<SpotSearch/);
  });

  it("a docs address with no guide says so, with the error spot, the docs' search and the way to every guide", () => {
    const html = renderToString(<DocNotFound />);
    expect(html).toContain("There is no guide at this address");
    expect(html).toContain("hue-dusk");
    expect(html).toContain('type="search"');
    expect(html).toContain('href="/docs"');
  });

  it("an account with nothing in it yet welcomes, with its one action", () => {
    const html = renderToString(<AccountDashboard overview={nothing} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    expect(html).toContain("Nothing here yet");
    expect(html).toContain("stroke-brand");
    // One action, and the only accent fill on the view.
    expect(html.match(/btn-brand|bg-brand /g)).toHaveLength(1);
    expect(html).toContain('href="/free"');
  });

  it("a paid workspace not created yet is on its way, with the welcome spot", () => {
    const sub = { id: "s", plan_code: "onecamp_cloud_team", status: "active", seats: 30, next_due_date: null, cancel_at_period_end: false, can_cancel: true, created_at: "" } as PortalSubscription;
    const html = renderToString(<WorkspaceSection onReload={() => {}} subscriptions={[sub]} initial={[]} />);
    expect(html).toContain("Your workspace is on its way");
    expect(html).toContain("stroke-brand");
  });
});

describe("the receipt's celebration", () => {
  it("is four camp-hued sparks bursting from the mark, gone for reduced motion", () => {
    const html = renderToString(
      <Celebration>
        <span>mark</span>
      </Celebration>,
    );
    expect(html.match(/animate-spark-out/g)).toHaveLength(4);
    expect(html).toContain("motion-reduce:hidden");
    expect(html).toContain("motion-safe:animate-spring");
    for (const hue of ["hue-sun", "hue-berry", "hue-sky", "hue-moss"]) expect(html).toContain(hue);
  });

  it("is only for a purchase that went through, not a receipt opened from a bookmark", () => {
    expect(readFileSync("app/buy/success/page.tsx", "utf8")).toMatch(/\{direct \? \(\s*<Tile[\s\S]*?\) : \([\s\S]*?<Celebration>/);
  });
});

it("the cards that open the next guide lift under a pointer", () => {
  expect(renderToString(<DocsPager next={{ slug: "b", title: "B" }} />)).toContain("hover-lift");
});
