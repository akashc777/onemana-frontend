// A long page's body, ready to read: the sanitised HTML of a doc, a post or a
// legal page, with what a reader needs added AFTER sanitising.
//
// WHY AFTER, AND WHY THIS IS SAFE. The sanitiser (lib/markdown.ts) allows
// `class` and nothing else that a heading could carry, so an author's own
// <h2 id="..."> never survives, and it must stay that way: opening it to `id`
// would let an article clobber ids the page relies on. Everything here works on
// its output, whose shape sanitize-html fixes (lower-case tags, attributes in
// double quotes, text with & < > escaped), and adds only markup written here:
// ids made from the heading's own text (a-z, 0-9 and hyphens, nothing else),
// the anchor link, the copy button, the table's scroll box, the figure and the
// callout. None of it takes an attribute value from the article.

export interface ArticleHeading {
  id: string;
  /** The heading as plain text, for the "On this page" list. */
  text: string;
  level: 2 | 3;
}

export interface Article {
  html: string;
  headings: ArticleHeading[];
}

/** Ids the page itself uses: the skip link's target, and globals a script reads. */
const RESERVED_IDS = new Set(["main", "next", "top", "content", "search", "nav", "footer", "toc", "docs-nav"]);

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** A fragment of sanitised HTML as the words a person reads. */
export function textOf(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, " ")
    .trim();
}

/** "1. Run the installer, on the server" → "1-run-the-installer-on-the-server". */
export function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/-+$/, "");
}

const escapeAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const HEADING = /<h([1-6])((?:\s+class="[^"]*")?)>([\s\S]*?)<\/h\1>/g;

/**
 * Headings get ids and an anchor, and their levels start at h2.
 *
 * The page's title is its h1, so an article's own top level becomes h2: most
 * docs open their sections at ###, some at ##, which gave the same kind of
 * section two sizes on two pages and skipped a level under the title.
 */
function headings(html: string): Article {
  const levels = [...html.matchAll(HEADING)].map((m) => Number(m[1]));
  const shift = levels.length ? 2 - Math.min(...levels) : 0;
  const taken = new Set<string>();
  const found: ArticleHeading[] = [];

  const out = html.replace(HEADING, (_m, lvl: string, attrs: string, inner: string) => {
    const level = Math.min(6, Math.max(2, Number(lvl) + shift));
    const text = textOf(inner);
    let base = slugify(text) || "section";
    if (RESERVED_IDS.has(base)) base = `${base}-section`;
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    if (level <= 3) found.push({ id, text, level: level as 2 | 3 });
    // The anchor is for a pointer: it is hidden from assistive technology and
    // out of the tab order, because "On this page" links to the same place.
    // Its "#" comes from CSS, so copying the heading copies only its words.
    return `<h${level} id="${id}"${attrs}>${inner}<a class="heading-anchor" href="#${id}" aria-hidden="true" tabindex="-1"></a></h${level}>`;
  });
  return { html: out, headings: found };
}

/**
 * A code block gets a copy button, and can be scrolled from the keyboard.
 * The button only exists here (the sanitiser drops any <button> an article
 * contains), and components/reading/CopyCode.tsx is what makes it copy.
 */
function codeBlocks(html: string): string {
  return html.replace(
    /<pre((?:\s+class="[^"]*")?)><code((?:\s+class="[^"]*")?)>([\s\S]*?)<\/code><\/pre>/g,
    (_m, preAttrs: string, codeAttrs: string, body: string) =>
      `<div class="code-block"><pre${preAttrs} tabindex="0"><code${codeAttrs}>${body}</code></pre>` +
      `<button type="button" class="code-copy" data-copy-code aria-label="Copy code">Copy</button></div>`,
  );
}

/** A wide table scrolls inside its own box, never the page (DESIGN.md, Focus and access). */
function tables(html: string): string {
  return html
    .replace(/<table((?:\s+class="[^"]*")?)>/g, '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table$1>')
    .replace(/<\/table>/g, "</table></div>");
}

/**
 * Images load when they are near, and one that stands alone in its paragraph
 * becomes a figure with its description under it. The posts' alt texts are
 * written as captions ("A project's time report with rates: ..."), so a reader
 * who skims sees them too; the caption is hidden from screen readers, which
 * already read the same words as the alt.
 */
function images(html: string): string {
  const lazy = (tag: string) =>
    tag
      .replace(/\sloading="[^"]*"/, "")
      .replace(/\s*\/?>$/, ' loading="lazy" decoding="async" />');
  const figures = html.replace(/<p>\s*(<img\s[^>]*>)\s*<\/p>/g, (_m, img: string) => {
    const alt = textOf(/\salt="([^"]*)"/.exec(img)?.[1] ?? "");
    const caption = alt.split(/\s+/).length >= 4 ? `<figcaption aria-hidden="true">${escapeAttr(alt)}</figcaption>` : "";
    return `<figure class="article-figure">${lazy(img)}${caption}</figure>`;
  });
  // Images inside text, which the figure pass left alone.
  return figures.replace(/<img\s(?![^>]*\sdecoding=)[^>]*>/g, (img) => lazy(img));
}

const CALLOUTS: Record<string, string> = { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" };

/** Index of the </blockquote> that closes the one opening at `from`. */
function closingBlockquote(html: string, from: number): number {
  const tag = /<(\/?)blockquote\b[^>]*>/g;
  tag.lastIndex = from;
  let depth = 0;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

/**
 * GitHub's alert syntax becomes a callout:
 *
 *   > [!NOTE]
 *   > Backups are taken before every update.
 *
 * A note is not a quotation, so it is an element with role="note" rather than
 * a <blockquote> a screen reader announces as a quote. Plain blockquotes stay.
 */
function callouts(html: string): string {
  const open = /<blockquote>\s*<p>\[!(note|tip|important|warning|caution)\](\s*<\/p>)?\s*/gi;
  let out = "";
  let last = 0;
  for (let m = open.exec(html); m; m = open.exec(html)) {
    const close = closingBlockquote(html, m.index);
    if (close < 0) break;
    const kind = m[1].toLowerCase();
    const body = html.slice(m.index + m[0].length, close);
    out +=
      html.slice(last, m.index) +
      `<div class="callout" data-callout="${kind}" role="note"><p class="callout-title">${CALLOUTS[kind]}</p>` +
      (m[2] ? "" : "<p>") +
      body +
      "</div>";
    last = close + "</blockquote>".length;
    open.lastIndex = last;
  }
  return out + html.slice(last);
}

/** Sanitised HTML (or the site's own legal HTML) made ready to read. */
export function enhanceArticle(html: string): Article {
  const { html: withHeadings, headings: found } = headings(html ?? "");
  return { html: callouts(images(tables(codeBlocks(withHeadings)))), headings: found };
}

/** The "On this page" list is worth showing from this many sections. */
export const TOC_MIN_HEADINGS = 3;

/**
 * An article as text, section by section, for the docs search: each heading
 * with the words under it, up to the next heading of any level.
 */
export function articleSections(html: string): { id: string; heading: string; text: string }[] {
  // The copy buttons are ours, not the article's words.
  const parts = html.replace(/<button\b[^>]*>[\s\S]*?<\/button>/g, "").split(/(?=<h[2-6] id=")/);
  const sections: { id: string; heading: string; text: string }[] = [];
  for (const part of parts) {
    const m = /^<h[2-6] id="([^"]+)"[^>]*>([\s\S]*?)<\/h[2-6]>/.exec(part);
    if (m) sections.push({ id: m[1], heading: textOf(m[2]), text: textOf(part.slice(m[0].length)) });
    else if (textOf(part)) sections.push({ id: "", heading: "", text: textOf(part) });
  }
  return sections;
}
