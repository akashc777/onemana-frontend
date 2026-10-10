import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AccountLogin } from "@/components/account/AccountLogin";
import type { PortalOverview } from "@/lib/portalApi";

const overview: PortalOverview = {
  customer: {
    id: "c", email: "meera@kestrel-labs.in", name: "Meera Iyer", gstin: "", phone: "", address_line: "", city: "",
    state: "", state_code: "", country: "India", created_at: "2026-07-14T09:12:00Z",
  },
  licenses: [{ key: "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b", product_type: "license", plan_code: "onecamp_lifetime", install_cmd: "/bin/bash -c x", issued_at: "2026-07-14T09:20:00Z" }],
  order_count: 1,
  invoice_count: 1,
  subscriptions: [],
};

const source = (f: string) => readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1");

describe("the account page", () => {
  it("arrives in one piece: the frame holds the window while the overview and the workspaces load together", () => {
    const page = source("app/account/page.tsx");
    expect(page).toContain("min-h-[calc(100dvh-3.5rem)]");
    // The workspaces are asked for before the overview is awaited, not after it has drawn.
    expect(page.indexOf("portalApi.instances()")).toBeGreaterThan(-1);
    expect(page.indexOf("portalApi.instances()")).toBeLessThan(page.indexOf("await portalApi.me()"));
    expect(page).toContain("instances={state.instances}");
  });

  it("has real tabs, kept in the address", () => {
    const html = renderToString(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    expect(html).toContain('role="tablist"');
    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('role="tabpanel"');
    expect(source("components/account/AccountDashboard.tsx")).toContain('url.searchParams.set("tab", next)');
  });

  it("opens on three hued tiles: licences, invoices and Cloud", () => {
    const html = renderToString(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    for (const hue of ["hue-sun", "hue-sky", "hue-lake"]) expect(html).toContain(hue);
    expect(html).toContain("1 licence");
    expect(html).toContain("Not subscribed");
  });

  it("shows a licence key in the text colour, not the accent, which marks only what can be pressed", () => {
    const html = renderToString(<AccountDashboard overview={overview} instances={[]} onLogout={() => {}} onReload={() => {}} />);
    const key = html.slice(html.lastIndexOf("<code", html.indexOf("3f2b8c1e")), html.indexOf("3f2b8c1e"));
    expect(key).not.toContain("brand");
  });

  it("says what went wrong beside it, never in a browser alert, and shows a status as a dot and its word", () => {
    const dir = "components/account";
    for (const f of readdirSync(dir).filter((n) => n.endsWith(".tsx") && !n.includes(".test."))) {
      const src = source(join(dir, f));
      expect(src, f).not.toContain("window.alert");
      // Pills are gone: rounded-full is for the status dot alone.
      for (const m of src.matchAll(/className=\{?[`"][^`"]*rounded-full[^`"]*[`"]/g)) expect(m[0], f).toContain("size-2");
    }
  });

  it("lets the sign-in button be pressed with an empty field, and puts the cursor in it only on a computer", () => {
    const html = renderToString(<AccountLogin onSignedIn={() => {}} />);
    expect(html).not.toContain("autofocus");
    expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Email me a code/);
    expect(source("components/account/AccountLogin.tsx")).toContain('matchMedia("(pointer: fine)")');
  });
});
