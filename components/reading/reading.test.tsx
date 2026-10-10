import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Prose } from "@/components/reading/Prose";
import { formatDay } from "@/lib/format";

/**
 * The reading system: every long page renders its body through one Prose
 * component, with one set of rules in globals.css, so a doc, a post and a
 * legal page read the same way and a change to reading is made once.
 */
const css = readFileSync("app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("the reading system", () => {
  it("renders an article with its reading size", () => {
    const html = renderToString(<Prose html="<p>Words.</p>" kind="docs" />);
    expect(html).toContain('class="prose reading reading-docs ');
    expect(html).toContain("<p>Words.</p>");
  });

  it("loads the copy script only for a page with code on it", () => {
    expect(renderToString(<Prose html="<p>No code.</p>" kind="post" />)).not.toContain('role="status"');
    const withCode = renderToString(<Prose html={'<div class="code-block"><pre><code>x</code></pre><button data-copy-code>Copy</button></div>'} kind="post" />);
    expect(withCode).toContain('role="status"');
  });

  it("keeps text to a measure of about 70 characters, while code and tables use the column", () => {
    expect(css).toMatch(/\.reading \{[^}]*--reading-measure: 36em/);
    expect(css).toMatch(/\.reading :where\(p, ul, ol, blockquote, \.callout, dl\) \{[^}]*max-width: var\(--reading-measure\)/);
  });

  it("styles everything lib/article.ts adds", () => {
    for (const rule of [".reading .heading-anchor::before", ".reading .code-block", ".reading .code-copy", ".reading .table-scroll", ".reading .callout", ".reading .article-figure figcaption"]) {
      expect(css, rule).toContain(rule);
    }
  });

  it("reserves an image's box while it loads, so the text under it does not jump", () => {
    expect(css).toMatch(/\.reading :where\(img:not\(\[width\]\)\) \{[^}]*aspect-ratio: auto 16 \/ 10/);
  });

  it("dates running text without a leading zero", () => {
    expect(formatDay("2026-10-09T06:30:00Z")).toBe("9 Oct 2026");
    expect(formatDay(null)).toBe("-");
  });
});
