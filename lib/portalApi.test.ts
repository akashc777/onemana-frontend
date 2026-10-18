import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { portalApi, PortalAuthError } from "./portalApi";

// The backend answers every portal list as {"data": [...], "status": "success"}
// (onemana-backend Controllers/onecamp/instanceController.go). The client must
// hand back the list itself: unwrapped twice, the account page showed a paid
// Cloud customer no workspace to name, and nothing was ever built.
function answer(body: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("the account portal client", () => {
  it("lists the customer's workspaces from the backend's envelope", async () => {
    answer({ status: "success", data: [{ id: "i-1", state: "awaiting_setup", slug: "" }] });
    const got = await portalApi.instances();
    expect(got).toHaveLength(1);
    expect(got[0].id).toBe("i-1");
  });

  it("lists the editions a workspace can be built as", async () => {
    answer({ status: "success", data: [{ name: "v1" }, { name: "v2", default: true }] });
    const got = await portalApi.editions();
    expect(got.map((e) => e.name)).toEqual(["v1", "v2"]);
  });

  it("treats an empty answer as no workspaces, not an error", async () => {
    answer({ status: "success" });
    expect(await portalApi.instances()).toEqual([]);
    expect(await portalApi.editions()).toEqual([]);
  });
});

// Every portal request goes through one place, as every admin request does:
// the session cookie, the JSON header and the 401 that signs the customer out
// are decided there once. Twelve calls used to set them each for themselves.
describe("one place for every portal request", () => {
  function record(body: unknown, status = 200) {
    const seen: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        seen.push({ url, init });
        return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
      }),
    );
    return seen;
  }

  it("calls fetch from one function only", () => {
    const src = readFileSync(join(__dirname, "portalApi.ts"), "utf8");
    expect((src.match(/\bfetch\(/g) ?? []).length).toBe(1);
  });

  it("sends the session cookie, and JSON when there is a body", async () => {
    const seen = record({ msg: "Address set." });
    expect(await portalApi.setAddress("i-1", "acme", "v2")).toBe("Address set.");
    expect(seen[0].init.credentials).toBe("include");
    expect((seen[0].init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(seen[0].init.body).toBe(JSON.stringify({ slug: "acme", edition: "v2" }));
  });

  it("signs the customer out when a change is refused for the session", async () => {
    record({}, 401);
    await expect(portalApi.moveNow("i-1")).rejects.toBeInstanceOf(PortalAuthError);
    await expect(portalApi.cancelSubscription("s-1")).rejects.toBeInstanceOf(PortalAuthError);
    await expect(portalApi.downloadInvoice("inv-1", "a.pdf")).rejects.toBeInstanceOf(PortalAuthError);
  });

  it("shows a wrong code as the backend's words, not as a sign-out", async () => {
    record({ msg: "That code has expired." }, 401);
    const err = await portalApi.verify("a@example.com", "123456").catch((e) => e);
    expect(err).not.toBeInstanceOf(PortalAuthError);
    expect((err as Error).message).toBe("That code has expired.");
  });

  it("answers with the backend's message, or its own when there is none", async () => {
    record({ msg: "Check your inbox." });
    expect(await portalApi.requestCode("a@example.com")).toBe("Check your inbox.");
    record({}, 500);
    await expect(portalApi.setAddress("i-1", "acme", "v2")).rejects.toThrow("Could not set that address.");
    record({ status: "success" });
    await expect(portalApi.addStorage("i-1")).rejects.toThrow("The purchase could not be started.");
  });

  it("never fails a sign-out", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("network down"); }));
    await expect(portalApi.logout()).resolves.toBeUndefined();
  });
});
