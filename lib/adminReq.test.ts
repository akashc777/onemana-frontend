import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every admin request goes through one place: the token is added there, and a
// 401 there signs the admin out, for reads and changes alike. Before, 44
// requests each set their own headers, and a change refused for an expired
// token showed "Failed to ..." with the page still looking signed in.

afterEach(() => vi.unstubAllGlobals());

describe("adminFetch", () => {
  it("adds the token and sends JSON", async () => {
    const seen: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      seen.push({ url, init });
      return new Response(JSON.stringify({ data: { ok: 1 } }), { status: 200 });
    }));
    const { adminReq } = await import("./adminApi");
    const out = await adminReq<{ ok: number }>("/onecamp/admin/x", { method: "POST", json: { a: 1 } });
    expect(out).toEqual({ ok: 1 });
    const h = seen[0].init.headers as Record<string, string>;
    expect(h["Content-Type"]).toBe("application/json");
    expect("X-Admin-Token" in h).toBe(true);
    expect(seen[0].init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("signs the admin out on a 401, for a change as for a read", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 401 })));
    const { adminApi, AdminAuthError, onAdminSignedOut } = await import("./adminApi");
    let told = 0;
    const stop = onAdminSignedOut(() => told++);
    await expect(adminApi.deleteOrder("o1")).rejects.toBeInstanceOf(AdminAuthError);
    expect(told).toBe(1);
    stop();
  });

  it("gives the backend's reason for a refusal", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ msg: "an invoice was issued" }), { status: 409 })));
    const { adminReq } = await import("./adminApi");
    await expect(adminReq("/onecamp/admin/order/o1", { method: "DELETE" })).rejects.toThrow("an invoice was issued");
  });
});

describe("the admin client", () => {
  it("calls fetch only from adminFetch, the token check and the file download", () => {
    const src = readFileSync(join(__dirname, "adminApi.ts"), "utf8");
    expect((src.match(/await fetch\(/g) ?? []).length).toBeLessThanOrEqual(4);
  });
});
