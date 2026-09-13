import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The homepage's prose may fall and must not rise.
 *
 * The redesign plan sets a hard ceiling of 1,800 visible words and an aim of
 * 1,150-1,600, and its gate is "paste into a counter". That gate was never run
 * twice: a number nobody measures is a number the page drifts past, which is how
 * it reached four thousand words while every individual addition looked
 * reasonable.
 *
 * WHAT THIS TEST IS, AND IS NOT. It is a RATCHET on a source-side proxy, not a
 * measurement of the plan's 1,800. The true measure is the rendered page, and it
 * cannot be taken here: the homepage is an async server component that fetches
 * live pricing. So this counts the prose in the source that produces it, which
 * is deterministic and reviewable but systematically LOW -- a sentence broken by
 * an interpolated value (`{n}x less`) reaches the extractor as fragments under
 * the word floor. Treating this number as the plan's ceiling would be a gate that
 * can never fire.
 *
 * It is calibrated instead against a rendered measurement taken by hand on
 * 13 September 2026, immediately after the cuts that introduced this file:
 *
 *   prose sentences (>= 12 words), <main>   1,042   aim 1,150-1,600
 *   every prose block incl. bullets         1,803
 *   whole page incl. nav and footer         2,091
 *
 * Which of those the plan's "1,800 visible words" means decides whether the page
 * passes, so the number is stated three ways rather than once. The prose a visitor
 * reads is 1,042 and inside the aim. The broadest reading, every visible word
 * including the nav and the footer, is 2,091 and cannot reach 1,800 without
 * deleting prices, sizing tiers and plan bullets -- which is the opposite of what
 * the critique asked for, so it is not the operative number.
 *
 * The proxy read 858 at that same moment. BASELINE is that figure plus twelve --
 * deliberately less than one sentence, because the first attempt allowed forty and
 * a whole added paragraph slipped under it. Headroom wide enough to hide the thing
 * the ratchet exists to catch is not headroom. A rise means somebody added prose; redo the rendered
 * measurement, and if the page is genuinely still inside the plan's budget, lower
 * BASELINE to the new proxy reading and say so here.
 *
 * WHAT COUNTS AS PROSE. Sentences a visitor reads. Not the page's index content:
 * plan bullets, sizing cells, module rows, procurement items. The plan's own
 * table budgets those separately ("labels + items; already index form", "+ UI"),
 * and they are scanned rather than read. Counting them would make the honest fix
 * "delete facts buyers need", which is the opposite of what the critique asked
 * for. Twelve words is the floor because it is the shortest real sentence here.
 *
 * The mock workspace and the audit receipt are PRODUCT UI drawn in markup, not
 * copy, so their text is excluded. Marked at the file level, where a reader will
 * see it, rather than listed here where the next mock component will not be
 * added.
 */
const PRODUCT_MOCK_MARKER = "landing-diet: product-mock";

/**
 * The proxy's high-water mark: its reading when the rendered page last measured
 * inside the plan's budget, plus room for formatting churn. See the note above
 * for why this is not 1,800.
 */
const BASELINE = 870;
/** The proxy reading that corresponded to the plan's 1,150-1,600 aim. */
const AIM_PROXY = 860;
/** Shortest real sentence on the page. Below this a block is a label, not prose. */
const PROSE_MIN_WORDS = 12;

const root = process.cwd();

/** Words, meaning actual words: letters only, so coordinates and ids are not prose. */
function words(text: string): number {
  return (text.match(/[A-Za-z][A-Za-z'’-]+/g) || []).length;
}

/**
 * Is this block a sentence a visitor reads?
 *
 * The first version asked only for punctuation and length, and counted SVG path
 * data as prose -- "M4 6.5A2.5 2.5 0 0 1 6.5 4h11" has periods and plenty of
 * tokens. An over-counting budget is worse than none: it fails for reasons nobody
 * can act on, and then somebody deletes the test.
 */
function looksLikeProse(block: string): boolean {
  if (/[{};=]|=>/.test(block)) return false;                 // code, not copy
  if (!/[.?!]/.test(block)) return false;                    // labels have no full stop
  const tokens = (block.match(/\S+/g) || []).length;
  const real = words(block);
  return real >= PROSE_MIN_WORDS && real / Math.max(tokens, 1) >= 0.7;
}

/**
 * Pull the prose blocks out of a source file: JSX text nodes and the string
 * literals that read as sentences. Deliberately approximate at the edges and
 * exact where it counts -- a paragraph added to the page is caught either way.
 */
function proseBlocks(src: string): string[] {
  const stripped = src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    // Rejoin sentences the markup splits. A line like
    //   that is <strong>{n}× less</strong>, and the gap widens
    // is one sentence to a reader and three fragments to a text extractor, and
    // each fragment falls under the twelve-word floor -- so the heaviest prose on
    // the page was the prose this counter could not see. Inline tags and the JSX
    // space escape come out; block tags stay, because they DO separate blocks.
    .replace(/\{" "\}/g, " ")
    .replace(/<\/?(?:strong|em|b|i|span|code|a|br|sup|small)\b[^>]*>/g, " ");

  const jsxText = [...stripped.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]);
  const literals = [...stripped.matchAll(/"((?:[^"\\]|\\.){24,})"/g)].map((m) => m[1]);

  return [...jsxText, ...literals]
    .map((t) => t.replace(/\s+/g, " ").trim())
    .filter(looksLikeProse);
}

/**
 * The files whose prose reaches the homepage, found by following the imports
 * from the page itself.
 *
 * Walking components/site wholesale was the first attempt and it was wrong by a
 * factor of three: that directory also holds the about page, the legal pages and
 * components nothing mounts any more. A budget computed over files the visitor
 * never loads is not a budget, and it would have failed for prose on a page this
 * ceiling says nothing about.
 */
function homepageSources(): string[] {
  const seen = new Set<string>();
  const queue = [join(root, "app/page.tsx")];

  while (queue.length) {
    const path = queue.shift() as string;
    if (seen.has(path)) continue;
    seen.add(path);

    const src = readFileSync(path, "utf8");
    for (const m of src.matchAll(/from "@\/((?:components|lib)\/[^"]+)"/g)) {
      for (const candidate of [`${m[1]}.tsx`, `${m[1]}.ts`, join(m[1], "index.tsx")]) {
        const resolved = join(root, candidate);
        if (existsSync(resolved) && !seen.has(resolved)) queue.push(resolved);
      }
    }
  }
  return [...seen];
}

function countProse(): { total: number; byFile: [string, number][] } {
  const byFile: [string, number][] = [];
  let total = 0;
  for (const path of homepageSources()) {
    const src = readFileSync(path, "utf8");
    if (src.includes(PRODUCT_MOCK_MARKER)) continue;
    const n = proseBlocks(src).reduce((sum, b) => sum + words(b), 0);
    if (n > 0) byFile.push([path.replace(root + "/", ""), n]);
    total += n;
  }
  byFile.sort((a, b) => b[1] - a[1]);
  return { total, byFile };
}

describe("homepage word budget", () => {
  it("never carries more prose than the last measured page", () => {
    const { total, byFile } = countProse();
    const worst = byFile.slice(0, 5).map(([f, n]) => `  ${n.toString().padStart(4)}  ${f}`).join("\n");
    expect(
      total,
      `The homepage's prose proxy reads ${total}; the recorded baseline is ${BASELINE}.\n` +
        `Heaviest sources:\n${worst}\n` +
        `Cut prose, not facts: the usual cause is a sentence that restates something the ` +
        `page already says, which is how every one of these sections grew. If the addition ` +
        `is genuinely needed, re-measure the rendered page against the plan's 1,800 and ` +
        `update the baseline in this file with the new figures.`,
    ).toBeLessThanOrEqual(BASELINE);
  });

  it("reports when it drifts past the aim, before it reaches the baseline", () => {
    const { total } = countProse();
    // Not a second gate: this exists so the number is printed on every run and a
    // slow climb is visible while it is still cheap to reverse.
    if (total > AIM_PROXY) {
      console.warn(`homepage prose proxy is ${total}, past the ${AIM_PROXY} aim (baseline ${BASELINE})`);
    }
    expect(total).toBeGreaterThan(0);
  });

  it("counts the prose the page actually shows", () => {
    // Without this, an empty matcher would satisfy the ceiling forever.
    const { total, byFile } = countProse();
    expect(total, "the counter found no prose at all, so the ratchet above is vacuous").toBeGreaterThan(600);
    expect(byFile.some(([f]) => f === "lib/content.ts")).toBe(true);
    expect(byFile.some(([f]) => f === "app/page.tsx")).toBe(true);
  });
});
