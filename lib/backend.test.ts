import { afterEach, describe, expect, it, vi } from "vitest";
import { getDoc } from "./docs";
import { getPost } from "./blog";

// A guide or post page shows "not found" only when the backend says so. On
// 23 Oct /docs/passkeys answered 404 for most of an hour while the guide was
// published: a failed read was taken for a missing guide, and the 404 was
// cached until the page regenerated. A read that fails has to throw, so the
// page keeps the copy it last built.
function answer(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe.each([
  ["a guide", getDoc],
  ["a post", getPost],
])("%s by its slug", (_, read) => {
  it("is the backend's answer when it has one", async () => {
    answer({ data: { slug: "passkeys", title: "Passkeys" }, status: "success" });
    await expect(read("passkeys")).resolves.toMatchObject({ slug: "passkeys" });
  });

  it("is null only when the backend says there is none", async () => {
    answer({ msg: "not found", status: "error" }, 404);
    await expect(read("no-such-page")).resolves.toBeNull();
  });

  it("throws when the backend fails, rather than calling the page missing", async () => {
    answer({ msg: "internal error", status: "error" }, 500);
    await expect(read("passkeys")).rejects.toThrow();
  });

  it("throws when the backend can't be reached", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    await expect(read("passkeys")).rejects.toThrow();
  });
});
