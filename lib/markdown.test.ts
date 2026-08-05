import { describe, it, expect } from "vitest";
import { renderMarkdown, readingTime } from "./markdown";

/**
 * The sanitiser is the highest-value code in this repo: its output goes straight into
 * dangerouslySetInnerHTML on public pages, on the same origin that holds the admin session.
 *
 * Its own doc comment lists the six payloads that defeated the previous regex-based
 * implementation. Those are the first tests here, verbatim, because a regression to
 * pattern-matching would look like a simplification and reopen every one of them.
 */

/** Assertions that hold for any payload: nothing executable survives in any form. */
function expectNoExecutableRemains(html: string) {
  const lower = html.toLowerCase();
  expect(lower).not.toContain("<script");
  expect(lower).not.toContain("<iframe");
  expect(lower).not.toContain("<svg");
  expect(lower).not.toContain("<object");
  expect(lower).not.toContain("<embed");
  expect(lower).not.toContain("javascript:");
  expect(lower).not.toContain("srcdoc");
  // No event handler of any name, quoted or not.
  expect(lower).not.toMatch(/\son[a-z]+\s*=/);
}

describe("renderMarkdown — the six payloads that got through the old regex sanitiser", () => {
  const payloads: Array<{ name: string; input: string; why: string }> = [
    {
      name: "unquoted attribute value",
      input: `<img src=x onerror=alert(1)>`,
      why: "the regex looked for on*=\"…\" with quotes",
    },
    {
      name: "script with no closing tag",
      input: `<script src="//evil/x.js">`,
      why: "the regex matched <script>…</script> as a pair, so an unclosed tag matched nothing",
    },
    {
      name: "svg with an unquoted handler",
      input: `<svg onload=alert(1)>`,
      why: "unquoted, and <svg> was never in the strip list at all",
    },
    {
      name: "javascript: URL in Markdown link syntax",
      input: `[click](javascript:alert(1))`,
      why: "a URL scheme is neither a tag nor an attribute, so no pattern applied",
    },
    {
      name: "entity-encoded iframe srcdoc",
      input: `<iframe srcdoc="&lt;script&gt;alert(1)&lt;/script&gt;">`,
      why: "entity-encoded, so the literal text the regex sought never appeared",
    },
    {
      name: "handler on an allowed tag",
      input: `<details open ontoggle=alert(1)>x</details>`,
      why: "<details> is legitimately allowed, so stripping the tag was never an option",
    },
  ];

  for (const { name, input, why } of payloads) {
    it(`neutralises: ${name}`, () => {
      const out = renderMarkdown(input);
      expectNoExecutableRemains(out);
      expect(out, `payload survived. It defeated the old regex because ${why}`).not.toContain("alert(1)");
    });
  }

  it("neutralises all six at once, in case one sanitises another's remains", () => {
    const out = renderMarkdown(payloads.map((p) => p.input).join("\n\n"));
    expectNoExecutableRemains(out);
    expect(out).not.toContain("alert(1)");
  });
});

describe("renderMarkdown — the allowlist keeps real articles intact", () => {
  it("renders GFM structure an author actually uses", () => {
    const out = renderMarkdown(
      [
        "# Title",
        "",
        "Some **bold** and _italic_ and `code`.",
        "",
        "- one",
        "- two",
        "",
        "| a | b |",
        "| - | - |",
        "| 1 | 2 |",
        "",
        "> quoted",
        "",
        "```js",
        "const x = 1;",
        "```",
      ].join("\n"),
    );

    for (const tag of ["<h1", "<strong", "<em", "<code", "<ul", "<li", "<table", "<blockquote", "<pre"]) {
      expect(out, `${tag} is allowlisted and must survive`).toContain(tag);
    }
  });

  it("keeps http(s) and mailto links, and images", () => {
    const out = renderMarkdown(
      `[a](https://example.com) [b](mailto:x@example.com) ![alt](https://example.com/i.png)`,
    );
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain("mailto:x@example.com");
    expect(out).toContain('<img');
    expect(out).toContain('alt="alt"');
  });

  it("drops a disallowed tag without leaving its body as visible text", () => {
    // nonTextTags: removing <script> must take its contents with it, or the code shows
    // up as prose in a published article.
    const out = renderMarkdown(`<script>alert(1)</script><p>kept</p>`);
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("kept");
  });
});

describe("renderMarkdown — URL schemes", () => {
  it.each([
    ["javascript:", `[x](javascript:alert(1))`],
    ["vbscript:", `[x](vbscript:msgbox(1))`],
    ["file:", `[x](file:///etc/passwd)`],
    ["data: (excluded on purpose — images belong in the media table)", `![x](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)`],
  ])("refuses %s", (_label, input) => {
    const out = renderMarkdown(input);
    expect(out).not.toMatch(/javascript:|vbscript:|file:|data:/i);
  });
});

describe("renderMarkdown — attributes", () => {
  it("drops style, which can overlay the page or leak through background-image", () => {
    const out = renderMarkdown(`<p style="position:fixed;top:0;left:0;width:100vw">x</p>`);
    expect(out).not.toContain("style=");
    expect(out).toContain("x");
  });

  it("keeps class, which is needed for presentation", () => {
    const out = renderMarkdown(`<p class="lead">x</p>`);
    expect(out).toContain('class="lead"');
  });

  it("forces safe link behaviour on external links rather than trusting the author", () => {
    const out = renderMarkdown(`[x](https://evil.example)`);
    expect(out).toContain('target="_blank"');
    expect(out).toContain("noopener");
    expect(out).toContain("noreferrer");
  });

  it("leaves relative links alone — target=_blank on an internal link is just annoying", () => {
    const out = renderMarkdown(`[x](/pricing)`);
    expect(out).toContain('href="/pricing"');
    expect(out).not.toContain('target="_blank"');
  });
});

describe("renderMarkdown — asset absolutization runs after sanitising", () => {
  it("absolutizes a surviving /onecamp/ path", () => {
    const out = renderMarkdown(`![x](/onecamp/media/a.png)`);
    expect(out).toContain("/onecamp/media/a.png");
    expect(out).toMatch(/src="https?:\/\/[^"]*\/onecamp\/media\/a\.png"/);
  });

  it("cannot reintroduce anything, because it only rewrites paths that survived", () => {
    // The rewrite is anchored at /onecamp/ and runs on already-clean HTML. A payload
    // shaped like the pattern must still be gone.
    const out = renderMarkdown(`<img src="/onecamp/x.png" onerror=alert(1)>`);
    expect(out).not.toMatch(/\son[a-z]+\s*=/i);
    expect(out).not.toContain("alert(1)");
  });

  it("leaves other paths untouched", () => {
    const out = renderMarkdown(`![x](/static/a.png)`);
    expect(out).toContain('src="/static/a.png"');
  });
});

describe("renderMarkdown — degenerate input must not throw", () => {
  // These render on a public page; a throw here is a 500 on the blog.
  it.each([
    ["empty string", ""],
    ["whitespace", "   \n\t "],
    ["unclosed tag", "<p>x"],
    ["lone angle bracket", "a < b"],
    ["nul-ish control chars", "a\u0000b"],
    ["very deep nesting", "> ".repeat(200) + "x"],
  ])("survives %s", (_label, input) => {
    expect(() => renderMarkdown(input)).not.toThrow();
  });

  it("treats null and undefined as empty", () => {
    // The signature says string, but this is called with values from an API response.
    expect(() => renderMarkdown(undefined as unknown as string)).not.toThrow();
    expect(() => renderMarkdown(null as unknown as string)).not.toThrow();
  });
});

describe("readingTime", () => {
  it("never returns less than a minute, so a short post does not read as 0 min", () => {
    expect(readingTime("")).toBe(1);
    expect(readingTime("one two three")).toBe(1);
  });

  it("scales at roughly 200 words per minute", () => {
    expect(readingTime(Array(400).fill("word").join(" "))).toBe(2);
    expect(readingTime(Array(1000).fill("word").join(" "))).toBe(5);
  });

  it("does not throw on null input", () => {
    expect(() => readingTime(undefined as unknown as string)).not.toThrow();
  });
});
