import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The purchase receipt (/buy/success) in each of its states. It renders only
 * in the browser (it reads this tab's checkout), so these read its source.
 */
const page = readFileSync("app/buy/success/page.tsx", "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/[^\n]*/g, "$1");

describe("the receipt", () => {
  it("claims no payment when this tab made none: opened from a bookmark it says where the receipt is", () => {
    expect(page).toContain("const direct = !purchase && !pending && !isCloud;");
    expect(page).toContain('"Your receipt is in your email"');
    expect(page).not.toContain("Payment successful");
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
