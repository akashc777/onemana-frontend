import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// A result list changes with every keystroke. Next fetches every link in view
// ahead of a click, so typing "saml cert" fetched seven guides (64 KB) that
// nobody chose. Results are fetched ahead on intent: a pointer over one, or
// the keyboard on one.
describe("docs search results", () => {
  const source = readFileSync("components/docs/DocsSearch.tsx", "utf8");
  const hit = source.slice(source.indexOf("{hits.map("), source.indexOf("</Link>", source.indexOf("{hits.map(")));

  it("are not fetched ahead just for being on screen", () => {
    expect(hit).toContain("prefetch={false}");
  });

  it("fetch the first result ahead once the typing pauses, since Enter opens it", () => {
    expect(source).toMatch(/const first = showing \? hits\[0\]\?\.href : undefined;/);
    expect(source).toMatch(/setTimeout\(\(\) => router\.prefetch\(first\), 300\)/);
  });

  it("are fetched ahead when someone points at one or moves to it", () => {
    expect(hit).toContain("onPointerEnter={() => router.prefetch(h.href)}");
    expect(hit).toContain("onFocus={() => router.prefetch(h.href)}");
  });
});
