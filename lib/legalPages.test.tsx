import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
  "privacy-policy": { updated: "2026-10-15", words: "937949c1380e" },
  "refund-policy": { updated: "2026-06-10", words: "ba704d7017ce" },
  "terms-of-service": { updated: "2026-10-15", words: "2309ccfd9251" },
  "taxes-on-services": { updated: "2026-10-15", words: "3ae2e71c30b3" },
  "account-ownership-policy": { updated: "2026-10-15", words: "53e7fc083c6a" },
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

/** The site's own source files: code under app, components, lib and hooks, and the policies' Markdown. */
function siteSources(): string[] {
  const walk = (dir: string, out: string[] = []): string[] => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p, out);
      else if (/\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p)) out.push(p);
    }
    return out;
  };
  return [
    ...["app", "components", "lib", "hooks"].flatMap((d) => walk(join(process.cwd(), d))),
    ...readdirSync(LEGAL).map((name) => join(LEGAL, name)),
  ];
}

/**
 * Every link to a legal page in the site's sources, with the words it shows:
 * an <a> or <Link> to the page's address, a { label, href } entry (the footer,
 * the audience pages) and a Markdown link (the policies).
 */
function legalLinks(): { at: string; slug: string; text: string }[] {
  const found: { at: string; slug: string; text: string }[] = [];
  const add = (at: string, slug: string, text: string) => {
    if (!legalPages[slug]) return;
    found.push({ at, slug, text: text.replace(/\{" "\}/g, " ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() });
  };
  for (const file of siteSources()) {
    const at = file.slice(process.cwd().length + 1);
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/<(a|Link)\b[^>]*?\bhref=\{?"\/([a-z-]+)(?:#[^"]*)?"\}?[^>]*>([\s\S]*?)<\/\1>/g)) add(at, m[2]!, m[3]!);
    for (const m of src.matchAll(/label:\s*"([^"]+)",\s*href:\s*"\/([a-z-]+)"/g)) add(at, m[2]!, m[1]!);
    for (const m of src.matchAll(/href:\s*"\/([a-z-]+)",\s*label:\s*"([^"]+)"/g)) add(at, m[1]!, m[2]!);
    for (const m of src.matchAll(/\[([^\]]+)\]\(\/([a-z-]+)(?:#[^)]*)?\)/g)) add(at, m[2]!, m[1]!);
  }
  return found;
}

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
  it("are named in the site's sentence case", () => {
    for (const [slug, p] of Object.entries(legalPages)) {
      const [first, ...rest] = p.title.split(" ");
      expect(first![0], slug).toBe(first![0]!.toUpperCase());
      for (const word of rest) expect(word, `${slug}: "${p.title}"`).toBe(word.toLowerCase());
    }
  });

  // Storefront audit P3 #17, one name per page. The taxes page was "Taxes on
  // services" in its H1, "Tax and invoices" in the footer, "Taxes on our
  // services" on the India page and "Taxes Policy" in the terms; the checkout
  // linked the terms as "Terms", and the footer the ownership policy as
  // "Account ownership".
  it.each(Object.keys(PINS))("%s: has one name, in its H1, its tab and every link to it", async (slug) => {
    const { title } = legalPages[slug]!;
    expect(renderToString(<LegalPageView slug={slug} />)).toMatch(new RegExp(`<h1[^>]*>${title}</h1>`));
    const route = (await import(`@/app/${slug}/page`)) as { metadata: { title?: unknown } };
    expect(route.metadata.title, `the tab of /${slug}`).toBe(title);
    const links = legalLinks().filter((l) => l.slug === slug);
    expect(links.some((l) => l.at === "lib/site.ts"), `the footer links /${slug}`).toBe(true);
    for (const link of links) expect(link.text.toLowerCase(), `${link.at} links /${slug}`).toBe(title.toLowerCase());
  });

  it("find every link to a legal page that the site has", () => {
    const links = legalLinks();
    // The footer's five, the India page's, the checkout's two, /free's and the terms' three.
    expect(links.length).toBeGreaterThanOrEqual(12);
    expect(new Set(links.map((l) => l.at))).toEqual(
      new Set(["lib/site.ts", "lib/audiences.ts", "app/buy/BuyCheckout.tsx", "app/free/FreeInstall.tsx", "content/legal/terms-of-service.md"]),
    );
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

  // The policy said "name, email, billing address, country and state, and
  // GSTIN", while the checkout also keeps a mobile number, a Cloud workspace's
  // address and, from a buyer outside India, a company name, street address
  // and tax number (lib/invoiceFields.ts), all but the mobile number printed
  // on the invoice. Every field the checkout sends is named here with the
  // words the policy uses for it, so a new field fails until the policy says
  // what it keeps.
  it("privacy policy: names everything the checkout keeps", () => {
    const POLICY_WORDS: Record<string, string | null> = {
      email: "email address",
      name: "your name",
      country: "country",
      state: "your state",
      state_code: "your state",
      gstin: "GSTIN",
      phone: "mobile number",
      company: "company name",
      address_line: "street address",
      tax_id: "tax number",
      slug: "workspace address",
      // What is bought, not who buys it.
      plan_code: null,
      edition: null,
    };
    const checkout = readFileSync(join(process.cwd(), "app", "buy", "BuyCheckout.tsx"), "utf8");
    const input = checkout.slice(checkout.indexOf("const input = {"), checkout.indexOf("};", checkout.indexOf("const input = {")));
    const cloud = checkout.match(/startCloud\(\{([^}]*)\}/)![1]!;
    const fields = new Set([...`${input} ${cloud}`.matchAll(/(?:^|[{,\s])([a-z_]+)(?=\s*[:,}]|\s*$)/g)].map((m) => m[1]!).filter((k) => k !== "const" && k !== "input"));
    expect(fields.size).toBeGreaterThanOrEqual(12);
    const buying = legalPages["privacy-policy"]!.source.split("### Buying OneCamp")[1]!.split("###")[0]!;
    for (const field of fields) {
      expect(field in POLICY_WORDS, `the checkout sends "${field}": say in the privacy policy what is kept, then name it here`).toBe(true);
      const words = POLICY_WORDS[field];
      if (words) expect(buying, field).toContain(words);
    }
    expect(buying).toContain("printed on your invoice");
  });

  // The site writes British English; the terms said "organizations" and
  // "unauthorized", and the ownership policy "organization".
  it("spell the British way", () => {
    const AMERICAN = /\b[a-z]*?(?:iz|yz)(?:e|es|ed|ing|ation|ations)\b/gi;
    const FINE = new Set(["size", "sizes", "sized", "prize", "prizes", "seize", "seized"]);
    for (const [slug, p] of Object.entries(legalPages)) {
      const found = [...`${p.title} ${p.subtitle} ${p.source}`.matchAll(AMERICAN)].map((m) => m[0]).filter((w) => !FINE.has(w.toLowerCase()));
      expect(found, slug).toEqual([]);
    }
  });

  // Storefront audit P3 #17: straight quotes ("Company", "OneCamp").
  it("set their quotes and apostrophes curly", () => {
    for (const [slug, p] of Object.entries(legalPages)) {
      const words = p.bodyHtml.replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'");
      expect(words, slug).not.toMatch(/["']/);
    }
  });

  it("carry no inline styles: the note's link was blue, off the palette", () => {
    for (const p of Object.values(legalPages)) expect(`${p.bodyHtml}${p.note}`).not.toMatch(/style=/);
  });

  it("show their date, and sections a link can reach", () => {
    const html = renderToString(<LegalPageView slug="privacy-policy" />);
    expect(html).toContain('Last updated <time dateTime="2026-10-15">15 Oct 2026</time>');
    expect(html).toContain('<h2 id="the-short-version">');
    expect(html).toContain('href="#your-rights"');
    expect(html).toContain("On this page");
  });
});
