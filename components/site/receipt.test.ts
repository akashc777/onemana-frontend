import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// The receipt reads its query with the app router, which a string render has
// not mounted. A string render is also the one state a test can be sure of:
// the server has no purchase (its snapshot is null), as a tab that made none.
let query = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => query }));

import SuccessPage from "@/app/buy/success/page";

/**
 * The purchase receipt (/buy/success) in each of its states. It renders only
 * in the browser (it reads this tab's checkout), so these read its source.
 */
const page = readFileSync("app/buy/success/page.tsx", "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1");

describe("the receipt", () => {
  it("claims no payment when this tab made none: opened from a bookmark it says where the receipt is", () => {
    expect(page).toContain('"Your receipt is in your email"');
    expect(page).not.toContain("Payment successful");
  });

  // The checkout leaves the receipt on /buy/success?cloud=1 or ?pending=1, so
  // those are the addresses a bookmark, another tab or a shared link carries.
  // Without this tab's purchase they are direct visits like any other: no
  // thanks, no celebration, and no "Payment received" for a payment never seen.
  it("claims no payment for the checkout's own addresses either, when this tab made no purchase", () => {
    for (const q of ["", "pending=1", "cloud=1", "cloud=1&pending=1"]) {
      query = new URLSearchParams(q);
      const html = renderToString(createElement(SuccessPage));
      const text = html.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/\s+/g, " ");
      expect(text, q).toContain("Your receipt is in your email");
      expect(text, q).not.toMatch(/Welcome to OneCamp Cloud|Payment received|Your licence is ready|Thank you for/);
      expect(html, q).not.toContain("animate-spark-out");
    }
    query = new URLSearchParams();
  });

  it("names each state for what it is", () => {
    for (const title of ['"Welcome to OneCamp Cloud"', '"Payment received"', '"Your licence is ready"']) expect(page).toContain(title);
  });

  it("draws its mark from the camp hues, with no emoji and no exclamation marks", () => {
    expect(page).toContain("<Tile hue={mark.hue}");
    expect(page).not.toMatch(/[\u{1F300}-\u{1FAFF}☁✓]/u);
    expect(page).not.toMatch(/[a-z]!\s/i);
  });

  it("holds the window while it loads, so the footer does not jump when it appears", () => {
    expect(page).toContain('<Suspense fallback={<div className="min-h-[calc(100dvh-3.5rem)]"');
  });
});
