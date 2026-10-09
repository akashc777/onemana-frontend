import { afterEach, describe, expect, it, vi } from "vitest";
import { portalApi } from "./portalApi";

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
