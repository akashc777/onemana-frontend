import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Copy on this site must not read as though a machine wrote it.
 *
 * This is the page that takes payment for a self-hosted product, sold largely to people who are
 * sceptical of AI slop by disposition. An em dash is the single most recognisable tell: it is not a
 * character most people can type without trying, and three of them in a paragraph reads as generated
 * no matter how accurate the sentence is. Sixteen were in rendered copy, including the hero paragraph
 * directly under the headline.
 *
 * WHAT THIS DOES NOT SAY. Em dashes are not bad punctuation. They are correct, and in a blog post
 * written by a person they are fine. The objection is specific to this surface: a visitor deciding
 * whether to trust the product is also, unavoidably, judging whether a human made it.
 *
 * The fix in each case was to re-phrase rather than substitute, because an em dash usually joins two
 * clauses a person would have written as two sentences, or as one with a colon or a comma. Swapping
 * the glyph and leaving the sentence shape produces copy that is still recognisably machine-made.
 *
 * COMMENTS ARE EXEMPT, and that is the point of the distinction rather than a shortcut: a comment is
 * for whoever maintains the file and is never rendered. Only strings a visitor can read are checked,
 * which is also what keeps this test from becoming something people route around.
 */

const root = resolve(__dirname, "..");

/**
 * Directories with no visitor-facing copy in them, or not ours.
 *
 * components/admin is deliberately out of scope. It is internal tooling that only the operator sees,
 * and the one en dash in it is a legitimate date range built from template expressions — which the
 * numeric-range exception below cannot see, because the digits are inside `${...}`. Narrowing the
 * SCOPE is the honest fix there; contorting the pattern to allow it would weaken the rule everywhere
 * else to accommodate a file this rule was never about.
 */
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public", "admin"]);

/**
 * The em dash, always. It is only ever used to join clauses, which is the construction being objected
 * to, so there is no legitimate use of it in copy here.
 */
const EM_DASH = /—/;

/**
 * The en dash ONLY when it is not between numbers.
 *
 * A first version flagged every en dash and immediately caught three that are correct: "50–200 people",
 * "$3,000–8,000", and a date range in the admin panel. An en dash in a numeric range is standard
 * typography and exactly what a person writes, so flagging it would have made this test wrong and,
 * worse, unfixable — which is how a test ends up deleted. Between words it is the same clause-joining
 * habit as the em dash, one keystroke over, so that case is still caught.
 */
const EN_DASH_BETWEEN_WORDS = /(^|[^0-9])–([^0-9]|$)/;

function hasAIPunctuation(line: string): boolean {
  return EM_DASH.test(line) || EN_DASH_BETWEEN_WORDS.test(line);
}

/**
 * Lines that are comments rather than copy.
 *
 * Covers the three shapes this codebase uses: a line comment, a line inside a block comment, and a
 * JSX comment. The JSX form is the one that matters — `{/* ... *\/}` is not rendered, and a checker
 * that missed it would report a handful of permanent failures nobody can fix, which is how a test
 * gets disabled.
 */
function isComment(line: string): boolean {
  const s = line.trim();
  return (
    s.startsWith("//") ||
    s.startsWith("*") ||
    s.startsWith("/*") ||
    s.startsWith("{/*") ||
    // A line wholly inside a JSX comment block.
    (s.endsWith("*/}") && !s.includes("{/*") && !s.includes("<"))
  );
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(resolve(dir, entry.name), out);
    } else if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".test.ts") &&
      !entry.name.endsWith(".test.tsx") &&
      entry.name !== "vitest.config.ts"
    ) {
      out.push(resolve(dir, entry.name));
    }
  }
  return out;
}

describe("marketing copy reads as though a person wrote it", () => {
  it("uses no em or en dashes in anything a visitor reads", () => {
    const offenders: string[] = [];
    let scanned = 0;

    for (const file of walk(root)) {
      const lines = readFileSync(file, "utf8").split("\n");
      scanned++;
      lines.forEach((line, i) => {
        if (isComment(line)) return;
        if (!hasAIPunctuation(line)) return;
        offenders.push(`${file.slice(root.length + 1)}:${i + 1}  ${line.trim().slice(0, 120)}`);
      });
    }

    // A checker that scans nothing passes for the wrong reason.
    expect(scanned, "found no source files to scan; the walk no longer fits the project").toBeGreaterThan(10);

    expect(
      offenders,
      `Em/en dashes in rendered copy:\n${offenders.join("\n")}\n\n` +
        "Re-phrase the sentence rather than swapping the character. Two sentences, a colon, or a " +
        "comma is almost always what a person would have written.",
    ).toEqual([]);
  });
});
