import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { legalPages } from "./legalPages";
import { LegalPageView } from "@/components/site/LegalPageView";

/**
 * The date at the top of a legal page moves when its words do. The privacy
 * policy promises it ("If we change this policy, we update the date at the
 * top"), so each page's text is pinned here to its date: change the words,
 * and this fails until `updated` in lib/legalPages.ts and the pin below move
 * together.
 *
 * The words are the policy's: its subtitle and its body. The page's title
 * is its name, held to the site's sentence case below; putting a title into
 * sentence case changes no term, so it does not move the date (the titles
 * were set in title case until 15 Oct 2026, storefront audit P3 #17).
 */
const PINS: Record<string, { updated: string; text: string }> = {
  "privacy-policy": { updated: "2026-10-01", text: "ea33ea60735b" },
  "refund-policy": { updated: "2026-06-10", text: "f523355170d5" },
  "terms-of-service": { updated: "2026-10-10", text: "2f944e84d5f4" },
  "taxes-on-services": { updated: "2026-10-09", text: "8d423cb592b0" },
  "account-ownership-policy": { updated: "2026-06-10", text: "e0df08219c42" },
};

const fingerprint = (slug: string) => {
  const p = legalPages[slug];
  return createHash("sha256").update(`${p.subtitle}\n${p.bodyHtml}`).digest("hex").slice(0, 12);
};

describe("legal pages", () => {
  it("are the pages the site links to, and no others", () => {
    expect(Object.keys(legalPages).sort()).toEqual(Object.keys(PINS).sort());
  });

  it.each(Object.keys(PINS))("%s: its date moves when its words do", (slug) => {
    expect(legalPages[slug].updated).toBe(PINS[slug].updated);
    expect(
      fingerprint(slug),
      `${slug} changed. Set its "updated" to today in lib/legalPages.ts, then pin the new date and text here.`,
    ).toBe(PINS[slug].text);
  });

  // The footer said "Privacy policy" and the page "Privacy Policy".
  it("are named in the site's sentence case, as the footer and the tab name them", () => {
    for (const [slug, p] of Object.entries(legalPages)) {
      const [first, ...rest] = p.title.split(" ");
      expect(first![0], slug).toBe(first![0]!.toUpperCase());
      for (const word of rest) expect(word, `${slug}: "${p.title}"`).toBe(word.toLowerCase());
      const page = readFileSync(join(process.cwd(), "app", slug, "page.tsx"), "utf8");
      expect(page, slug).toContain(`title: "${p.title}"`);
    }
  });

  it("carry no inline styles: the note's link was blue, off the palette", () => {
    for (const p of Object.values(legalPages)) expect(`${p.bodyHtml}${p.note}`).not.toMatch(/style=/);
  });

  it("show their date, and sections a link can reach", () => {
    const html = renderToString(<LegalPageView slug="privacy-policy" />);
    expect(html).toContain('Last updated <time dateTime="2026-10-01">1 Oct 2026</time>');
    expect(html).toContain('<h2 id="the-short-version">');
    expect(html).toContain('href="#your-rights"');
    expect(html).toContain("On this page");
  });
});
