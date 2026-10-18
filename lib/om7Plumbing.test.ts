import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The frontend half of the backend's OM7: a token check that reads nothing,
// one JSON reader for docs and blog, the docs search index in one request,
// and subscriptions that carry their customer's email. Each falls back to the
// old call when the backend is older, so this can ship in either order.

type Answer = { status: number; body: unknown };
function stubFetch(answer: (url: string) => Answer) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      calls.push(String(url));
      const a = answer(String(url));
      return new Response(JSON.stringify(a.body), { status: a.status, headers: { "Content-Type": "application/json" } });
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("the admin token check", () => {
  it("asks /admin/whoami, which reads nothing", async () => {
    const calls = stubFetch(() => ({ status: 200, body: { status: "success" } }));
    const { adminApi } = await import("./adminApi");
    expect(await adminApi.verify("t")).toBe(true);
    expect(calls.some((u) => u.endsWith("/onecamp/admin/whoami"))).toBe(true);
    expect(calls.some((u) => u.endsWith("/onecamp/admin/config"))).toBe(false);
  });
  it("falls back to /admin/config on a backend without whoami", async () => {
    const calls = stubFetch((u) => (u.endsWith("/whoami") ? { status: 404, body: {} } : { status: 200, body: { data: {} } }));
    const { adminApi } = await import("./adminApi");
    expect(await adminApi.verify("t")).toBe(true);
    expect(calls.some((u) => u.endsWith("/onecamp/admin/config"))).toBe(true);
  });
  it("refuses a wrong token", async () => {
    stubFetch(() => ({ status: 401, body: {} }));
    const { adminApi } = await import("./adminApi");
    expect(await adminApi.verify("wrong")).toBe(false);
  });
});

describe("docs and blog read the backend one way", () => {
  it("has one backendJSON, not a getJSON per module", () => {
    for (const f of ["docs.ts", "blog.ts"]) {
      const src = readFileSync(join(__dirname, f), "utf8");
      expect(src).not.toMatch(/function getJSON/);
      expect(src).toMatch(/backendJSON/);
    }
  });
});

describe("the docs search index", () => {
  it("reads every guide with its body in one request", async () => {
    const calls = stubFetch(() => ({
      status: 200,
      body: { data: [{ slug: "a", title: "A", category: "G", content: "body a" }, { slug: "b", title: "B", category: "G", content: "body b" }] },
    }));
    const { publishedDocsWithContent } = await import("./docs");
    const docs = await publishedDocsWithContent();
    expect(docs.map((d) => d.content)).toEqual(["body a", "body b"]);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toContain("/onecamp/docs?include=content");
  });
  it("fetches a guide by itself only when an older backend left its body out", async () => {
    const calls = stubFetch((u) =>
      u.includes("include=content")
        ? { status: 200, body: { data: [{ slug: "a", title: "A", category: "G", content: "" }] } }
        : { status: 200, body: { data: { slug: "a", title: "A", category: "G", content: "body a" } } },
    );
    const { publishedDocsWithContent } = await import("./docs");
    const docs = await publishedDocsWithContent();
    expect(docs[0].content).toBe("body a");
    expect(calls).toHaveLength(2);
  });
});

describe("the subscriptions table", () => {
  it("takes each customer's email from the list, not from every customer", async () => {
    const calls = stubFetch(() => ({ status: 200, body: { data: [{ id: "s1", customer_id: "c1", customer_email: "a@x.com" }] } }));
    const { adminApi } = await import("./adminApi");
    const rows = await adminApi.subscriptionsWithEmails();
    expect(rows[0].customer_email).toBe("a@x.com");
    expect(calls.some((u) => u.endsWith("/admin/customers"))).toBe(false);
  });
  it("looks the customers up only on a backend that does not send the email", async () => {
    const calls = stubFetch((u) =>
      u.endsWith("/admin/customers")
        ? { status: 200, body: { data: [{ id: "c1", email: "a@x.com" }] } }
        : { status: 200, body: { data: [{ id: "s1", customer_id: "c1" }] } },
    );
    const { adminApi } = await import("./adminApi");
    const rows = await adminApi.subscriptionsWithEmails();
    expect(rows[0].customer_email).toBe("a@x.com");
    expect(calls.some((u) => u.endsWith("/admin/customers"))).toBe(true);
  });
});
