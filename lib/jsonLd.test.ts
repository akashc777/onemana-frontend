import { describe, it, expect } from "vitest";
import { jsonLdScript } from "./jsonLd";

/**
 * jsonLdScript's output goes inside <script type="application/ld+json"> on public pages —
 * the same origin that holds the admin session token. Inside a <script> element the browser
 * looks for the closing tag BEFORE parsing anything as JSON, and JSON.stringify escapes
 * neither "<" nor "/". So one admin-authored title can end the block early and run script.
 *
 * These tests pin both halves of the contract: nothing can break out, and the escaping is
 * value-preserving so consumers (Google, validators) still read the same data.
 */

describe("jsonLdScript — no breakout from the script element", () => {
  it("neutralises a closing-tag breakout in a string value", () => {
    const out = jsonLdScript({ headline: `</script><script>alert(1)</script>` });
    expect(out).not.toContain("</script");
    expect(out).not.toContain("<script");
    expect(out).toContain("\\u003c");
  });

  it("escapes every character that changes meaning when embedded", () => {
    const out = jsonLdScript({ v: `<>&` });
    expect(out).toContain("\\u003c");
    expect(out).toContain("\\u003e");
    expect(out).toContain("\\u0026");
    expect(out).not.toMatch(/[<>&]/);
  });

  it("escapes U+2028 and U+2029, which are legal in JSON but terminate a JS line", () => {
    const out = jsonLdScript({ v: "a\u2028b\u2029c" });
    expect(out).toContain("\\u2028");
    expect(out).toContain("\\u2029");
    // The raw characters must be gone: unescaped, they are a syntax error in the emitted
    // script, which breaks the page rather than merely the metadata.
    expect(out).not.toMatch(/[\u2028\u2029]/);
  });

  it("escapes inside nested structures and arrays, not just top-level strings", () => {
    const out = jsonLdScript({
      author: { name: `</script>x` },
      tags: [`</script>y`],
    });
    expect(out).not.toContain("</script");
    expect(out.match(/\\u003c/g)?.length).toBe(2);
  });

  it("escapes a dangerous KEY as well as a value", () => {
    const out = jsonLdScript({ [`</script>`]: "v" });
    expect(out).not.toContain("</script");
  });
});

describe("jsonLdScript — the escaping is value-preserving", () => {
  it("round-trips to exactly the input, so consumers see the same data", () => {
    const value = {
      headline: `Tables & "quotes" <tags> and a </script> attempt`,
      author: { "@type": "Person", name: "A < B" },
      keywords: ["a&b", "c<d"],
      count: 42,
      nested: { deep: { deeper: "x>y" } },
    };
    expect(JSON.parse(jsonLdScript(value))).toEqual(value);
  });

  it.each([
    ["null", null],
    ["a number", 42],
    ["a bare string", "hello"],
    ["an empty object", {}],
    ["an empty array", []],
    ["unicode", { v: "日本語 — em dash — emoji 🎉" }],
  ])("round-trips %s", (_label, value) => {
    expect(JSON.parse(jsonLdScript(value))).toEqual(value);
  });

  it("produces output containing no raw < > or &, whatever the input", () => {
    // The property the <script> context actually needs, asserted independently of which
    // characters the implementation chooses to escape.
    const nasty = `<<>>&&</script></SCRIPT><!--<script>`;
    const out = jsonLdScript({ a: nasty, b: [nasty], c: { d: nasty } });
    expect(out).not.toMatch(/[<>&]/);
    expect(JSON.parse(out).a).toBe(nasty);
  });
});
