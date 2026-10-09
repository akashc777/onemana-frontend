import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Every capture placement must name what the visitor gets.
 *
 * SubscribeForm has always accepted per-placement copy, and its own comment says
 * "a few emails a year is not a reason to hand over an address". Every call site
 * then used the default anyway. The form was live on the home page, the buy page,
 * every blog post and inside the demo, and across 1,290 visitors it captured
 * nothing.
 *
 * So this checks the thing that was actually wrong: not that the mechanism
 * exists, but that the call sites use it. A prop that exists and is never passed
 * is the same as a prop that does not exist.
 */
const files = [
  "app/page.tsx",
  "app/buy/page.tsx",
  "app/blog/[slug]/page.tsx",
];

function subscribeCalls(src: string): string[] {
  // Both shapes: self-closing one-liner and a multi-line element.
  return [...src.matchAll(/<SubscribeForm[\s\S]*?\/>/g)].map((m) => m[0]);
}

describe("every capture placement makes an offer", () => {
  for (const rel of files) {
    it(`${rel} tells the visitor what they get`, () => {
      const src = readFileSync(join(process.cwd(), rel), "utf8");
      const calls = subscribeCalls(src);
      expect(calls.length, `no SubscribeForm found in ${rel}`).toBeGreaterThan(0);

      for (const call of calls) {
        expect(
          call,
          `${rel} renders SubscribeForm without a cta, so it falls back to the generic ask ` +
            `that captured nothing across 1,290 visitors`,
        ).toMatch(/cta=/);
        expect(call, `${rel} renders SubscribeForm without a hint`).toMatch(/hint=/);
      }
    });
  }

  it("no placement still asks with the wording that never worked", () => {
    for (const rel of files) {
      const src = readFileSync(join(process.cwd(), rel), "utf8");
      expect(src, `${rel} still uses the old ask`).not.toContain("Keep me posted");
    }
  });

  // The offer must also be one we keep. Every placement said "Send me the setup
  // guide" and promised "one email", but POST /onecamp/subscribe only records the
  // address (Subscribe in onemana-backend unsubscribeBusiness.go): nothing is sent
  // in reply, and what the list gets is the occasional product announcement.
  // Promising a guide that never arrives loses the reader at the one moment they
  // trusted us with an address. Wire the endpoint to send one before asking again.
  it("no placement, and not the default, promises something the form does not send", () => {
    const sources = [...files, "components/site/SubscribeForm.tsx"].map((rel) =>
      readFileSync(join(process.cwd(), rel), "utf8"),
    );
    for (const src of sources) {
      for (const call of [...subscribeCalls(src), src.match(/cta = [^\n]*\n\s*hint = [^\n]*/)?.[0] ?? ""]) {
        expect(call).not.toMatch(/setup guide|send me|one email/i);
      }
    }
  });
});
