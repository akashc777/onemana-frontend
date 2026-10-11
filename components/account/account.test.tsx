import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { AccountLogin } from "@/components/account/AccountLogin";
import type { PortalOverview } from "@/lib/portalApi";

const overview: PortalOverview = {
  customer: {
    id: "c", email: "meera@example.com", name: "Meera Iyer", gstin: "", phone: "", address_line: "", city: "",
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

  // On a wide screen the form had the page to itself, a small card in the
  // top left and the rest empty; the welcome spot sits opposite, as the error
  // spot does on the 404. On a phone "Use a different email" was a 20 px line.
  // Design v3 (site.md AC1): a centred auth card on a soft camp canvas,
  // so the page round the form is a designed ground, not empty space.
  it("sets the form in an auth card on a soft canvas, and keeps its links in reach on a phone", () => {
    const html = renderToString(<AccountLogin onSignedIn={() => {}} />);
    expect(html).toMatch(/class="camp-canvas[^"]*"[^>]*data-soft=""/);
    expect(html).toMatch(/max-w-\[440px\] rounded-2xl bg-card p-6 shadow-e2/);
    expect(html).not.toMatch(/create account|sign up/i);
    expect(source("components/account/AccountLogin.tsx")).toContain('className="min-h-11 w-full text-center text-small');
    // The nav marks Sign in as the page you are on, there as in the phone menu.
    expect(source("components/site/Nav.tsx")).toContain('<NavLink href="/account">Sign in</NavLink>');
  });
});

it("keeps the invoices table's scroll box a containing block, so its hidden header label cannot widen the page", () => {
  // The "Download" column's sr-only label is absolutely positioned; without a
  // positioned ancestor inside the scroll box it escaped it and made the page
  // 429 px wide on a 390 px phone.
  expect(source("components/account/AccountDashboard.tsx")).toContain('className="relative hidden overflow-x-auto rounded-2xl bg-card shadow-e1 sm:block"');
});

it("lists invoices on a phone with each one's download in reach, and keeps the table for wider screens", () => {
  // In the table, a 390 px phone showed three lines a row and the download
  // button off the right edge of the screen.
  const tab = source("components/account/AccountDashboard.tsx");
  const body = tab.slice(tab.indexOf("function InvoicesTab"), tab.indexOf("function planCodeFor"));
  const list = body.slice(body.indexOf("<ul"), body.indexOf("</ul>"));
  expect(list).toContain("sm:hidden");
  for (const piece of ["{inv.invoice_no}", "formatDate(inv.issued_at)", "gst(inv)", "formatINR(inv.gross_amount)", "downloadButton(inv)", "failed(inv)"]) {
    expect(list).toContain(piece);
  }
  // "GST" stays with its figure when the line wraps on a 360 px phone.
  expect(list).toContain('{"\\u00a0· GST\\u00a0"}{gst(inv)}');
  expect(body).toMatch(/className="relative hidden [^"]*sm:block"[\s\S]*<table/);
});
