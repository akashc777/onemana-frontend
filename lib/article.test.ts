import { describe, expect, it } from "vitest";
import { articleSections, enhanceArticle, slugify, textOf } from "./article";
import { renderMarkdown } from "./markdown";

const article = (md: string) => enhanceArticle(renderMarkdown(md));

describe("headings: ids, anchors and levels", () => {
  it("gives every heading an id from its own words, and an anchor to it", () => {
    const { html, headings } = article("## 1. Run the installer, on the server\n\ntext");
    expect(html).toContain('<h2 id="1-run-the-installer-on-the-server">');
    expect(html).toContain('<a class="heading-anchor" href="#1-run-the-installer-on-the-server" aria-hidden="true" tabindex="-1"></a></h2>');
    expect(headings).toEqual([{ id: "1-run-the-installer-on-the-server", text: "1. Run the installer, on the server", level: 2 }]);
  });

  it("keeps ids unique, even against a heading that spells the suffix out", () => {
    const { headings } = article("## Updating\n\n## Updating\n\n## Updating 2\n\n## Updating");
    expect(headings.map((h) => h.id)).toEqual(["updating", "updating-2", "updating-2-2", "updating-3"]);
  });

  it("never takes an id the page itself uses", () => {
    // <main id="main"> is the skip link's target.
    expect(article("## Main\n\nx").headings[0].id).toBe("main-section");
  });

  it("starts the article at h2 under the page's h1, whatever level the author began at", () => {
    const fromH3 = article("### Setting up\n\n#### Detail\n\nx");
    expect(fromH3.html).toMatch(/<h2 id="setting-up">/);
    expect(fromH3.html).toMatch(/<h3 id="detail">/);
    const fromH1 = article("# Title\n\n## Section\n\nx");
    expect(fromH1.html).toMatch(/<h2 id="title">/);
    expect(fromH1.html).toMatch(/<h3 id="section">/);
    expect(fromH1.html).not.toContain("<h1");
  });

  it("lists h2 and h3 for 'On this page', with plain text and no anchor", () => {
    const { headings } = article("## Install `make` &amp; run\n\n### Then\n\n#### Too deep\n\nx");
    expect(headings).toEqual([
      { id: "install-make-run", text: "Install make & run", level: 2 },
      { id: "then", text: "Then", level: 3 },
    ]);
  });

  it("cannot be steered by the article: an author's own id is gone, and an id is only a-z, 0-9 and hyphens", () => {
    const { html } = article(`<h2 id="next" onclick="alert(1)">Hi "there" <img src=x onerror=alert(1)></h2>\n\n## a"><script>alert(1)</script>`);
    expect(html).not.toMatch(/onclick|onerror|<script/i);
    for (const [, id] of html.matchAll(/ id="([^"]*)"/g)) expect(id).toMatch(/^[a-z0-9-]+$/);
    expect(html).toContain('<h2 id="hi-there">');
  });
});

describe("code blocks", () => {
  it("get a copy button and can be scrolled from the keyboard, with the code untouched", () => {
    const { html } = article('```bash\necho "<hi>" & make install\n```');
    expect(html).toContain('<div class="code-block"><pre tabindex="0"><code class="language-bash">echo "&lt;hi&gt;" &amp; make install\n</code></pre>');
    expect(html).toContain('<button type="button" class="code-copy" data-copy-code aria-label="Copy code">Copy</button></div>');
  });

  it("the only copy button is one this module wrote: an article's <button> never survives", () => {
    const { html } = article("<button data-copy-code onclick=x>Copy</button>\n\nplain");
    expect(html).not.toContain("<button");
  });
});

describe("tables, images and callouts", () => {
  it("puts a table in a box that scrolls on its own", () => {
    const { html } = article("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toMatch(/^<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>/);
    expect(html.trim()).toMatch(/<\/table><\/div>$/);
  });

  it("makes an image that stands alone a figure, captioned with its description", () => {
    const { html } = article("![A project's time report with rates](/onecamp/blog/media/x)");
    expect(html).toMatch(/^<figure class="article-figure"><img src="[^"]+\/onecamp\/blog\/media\/x" alt="A project's time report with rates" loading="lazy" decoding="async" \/>/);
    expect(html).toContain(`<figcaption aria-hidden="true">A project's time report with rates</figcaption></figure>`);
  });

  it("leaves a short alt as alt only, and loads inline images lazily too", () => {
    const { html } = article("![Logo](/a.png)\n\nText with ![icon](/b.png) inside.");
    expect(html).not.toContain("figcaption");
    expect(html).toContain('<img src="/b.png" alt="icon" loading="lazy" decoding="async" />');
  });

  it("turns GitHub's alert syntax into a note, in both of its shapes", () => {
    const one = article("> [!NOTE]\n> Backups are taken first.").html.trim();
    expect(one).toBe('<div class="callout" data-callout="note" role="note"><p class="callout-title">Note</p><p>Backups are taken first.</p>\n</div>');
    const two = article("> [!WARNING]\n>\n> Back up first.\n>\n> Then update.").html;
    expect(two).toContain('<div class="callout" data-callout="warning" role="note"><p class="callout-title">Warning</p>');
    expect(two).toContain("<p>Back up first.</p>");
    expect(two).toContain("<p>Then update.</p>");
    expect(two).not.toContain("blockquote");
  });

  it("leaves a quotation a quotation", () => {
    expect(article("> Somebody said this.").html).toContain("<blockquote>");
  });
});

describe("search text", () => {
  it("splits an article into its sections, without the copy buttons", () => {
    const { html } = article("Intro words.\n\n## Install\n\nRun it.\n\n```\nmake install\n```\n\n### Check\n\nmake verify");
    expect(articleSections(html)).toEqual([
      { id: "", heading: "", text: "Intro words." },
      { id: "install", heading: "Install", text: "Run it. make install" },
      { id: "check", heading: "Check", text: "make verify" },
    ]);
  });

  it("reads entities as the characters they stand for", () => {
    expect(textOf("A &amp; B &lt;c&gt; &#39;d&#39; &#x27;e&#x27;")).toBe("A & B <c> 'd' 'e'");
    expect(slugify("Café & “quotes”")).toBe("cafe-quotes");
  });
});
