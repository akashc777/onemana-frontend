import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { legalPages } from "./legalPages";
import { renderMarkdown } from "./markdown";
import { LegalPageView } from "@/components/site/LegalPageView";

/**
 * The date at the top of a legal page moves when its words do. The privacy
 * policy promises it ("If we change this policy, we update the date at the
 * top"), so each page's words are pinned here to its date: change the words,
 * and this fails until `updated` in lib/legalPages.ts and the pin below move
 * together.
 *
 * The words are the policy's: its subtitle and its body, read as words. Case,
 * quote marks and markup are how they are set, not what they say, so setting
 * them (sentence case, curly quotes, storefront audit P3 #17) moves no date.
 * The page's title is its name, held to the site's sentence case below.
 */
const PINS: Record<string, { updated: string; words: string }> = {
  "privacy-policy": { updated: "2026-10-01", words: "380342bfd4d7" },
  "refund-policy": { updated: "2026-06-10", words: "ba704d7017ce" },
  "terms-of-service": { updated: "2026-10-15", words: "7bf84c069f7f" },
  "taxes-on-services": { updated: "2026-10-15", words: "3ae2e71c30b3" },
  "account-ownership-policy": { updated: "2026-06-10", words: "1bfe451740aa" },
};

const ENTITIES: Record<string, string> = { "&amp;": "&", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

/** What a page says, as words: no markup, one case, one kind of quote mark. */
function legalWords(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|quot|#39|#x27|lt|gt|nbsp);/g, (e) => ENTITIES[e]!)
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const fingerprint = (slug: string) => {
  const p = legalPages[slug]!;
  return createHash("sha256").update(`${legalWords(p.subtitle)}\n${legalWords(p.bodyHtml)}`).digest("hex").slice(0, 12);
};

/** The text of every element of one kind in a page's body. */
const texts = (html: string, tag: string) => [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => m[1]!.replace(/<[^>]+>/g, ""));

const LEGAL = join(process.cwd(), "content", "legal");

describe("legal pages", () => {
  it("are the pages the site links to, and no others", () => {
    expect(Object.keys(legalPages).sort()).toEqual(Object.keys(PINS).sort());
  });

  it.each(Object.keys(PINS))("%s: its date moves when its words do", (slug) => {
    expect(legalPages[slug]!.updated).toBe(PINS[slug]!.updated);
    expect(
      fingerprint(slug),
      `${slug} changed. Set its "updated" to today in lib/legalPages.ts, then pin the new date and words here.`,
    ).toBe(PINS[slug]!.words);
  });

  // The words lived twice: as HTML typed into lib/legalPages.ts, and in a
  // Page Builder export in content/ that nothing read and that had drifted
  // (it said prices exclude tax). Now there is one copy, and it is what the
  // page shows.
  it("each say what one file says, content/legal/<page>.md, and nothing else holds their words", () => {
    expect(readdirSync(LEGAL).sort()).toEqual(Object.keys(legalPages).map((slug) => `${slug}.md`).sort());
    for (const [slug, p] of Object.entries(legalPages)) {
      expect(p.source, slug).toBe(readFileSync(join(LEGAL, `${slug}.md`), "utf8"));
      expect(p.bodyHtml, slug).toBe(renderMarkdown(p.source));
      expect(existsSync(join(process.cwd(), "content", `${slug}.md`)), `content/${slug}.md is a second copy`).toBe(false);
    }
    expect(readFileSync(join(process.cwd(), "lib", "legalPages.ts"), "utf8")).not.toMatch(/<(p|h[1-6]|li)>/);
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

  // Storefront audit P3 #17: the terms' headings were in title case ("Account
  // Terms"). A word after the first is lower case unless it is a name.
  it("set their headings in sentence case", () => {
    const NAMES = new Set(["OneCamp", "OneMana", "Cloud", "India"]);
    let headings = 0;
    for (const [slug, p] of Object.entries(legalPages)) {
      for (const heading of texts(p.bodyHtml, "h3")) {
        headings++;
        const [first, ...rest] = heading.split(" ");
        expect(first![0], `${slug}: "${heading}"`).toBe(first![0]!.toUpperCase());
        for (const word of rest) if (!NAMES.has(word)) expect(word, `${slug}: "${heading}"`).toBe(word.toLowerCase());
      }
    }
    expect(headings).toBeGreaterThan(10);
  });

  // Storefront audit P3 #17: straight quotes ("Company", "OneCamp").
  it("set their quotes and apostrophes curly", () => {
    for (const [slug, p] of Object.entries(legalPages)) {
      const words = p.bodyHtml.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
      expect(words, slug).not.toMatch(/["']/);
    }
  });

  // Storefront audit P3 #17: the terms linked "Taxes Policy" for the page
  // called "Taxes on services". One page, one name.
  it("call a legal page by its own name when they link to it", () => {
    let links = 0;
    for (const p of Object.values(legalPages)) {
      for (const [, href, text] of p.bodyHtml.matchAll(/<a href="\/([^"#]+)"[^>]*>([^<]+)<\/a>/g)) {
        const target = legalPages[href!];
        if (!target) continue;
        links++;
        expect(text!.toLowerCase(), href).toBe(target.title.toLowerCase());
      }
    }
    expect(links).toBe(3);
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
