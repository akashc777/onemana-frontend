import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";

// The admin screens for what was curl-only (REPORT-2026-10-18, OM10): settling
// a machine order whose checkout did not answer (until it is settled nothing
// more is bought), resuming installs a restart left mid-flight, reading the
// daily journey, and erasing a workspace now, which needs its address typed.

afterEach(() => vi.unstubAllGlobals());

function stubFetch() {
  const calls: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), init });
    return new Response(JSON.stringify({ status: "success", data: { recovered: 2 } }), { status: 200 });
  }));
  return calls;
}

describe("which machine orders need a person", () => {
  it("is the attempts still ordering", async () => {
    const { needsSettling } = await import("./adminGaps");
    expect(needsSettling({ state: "ordering" })).toBe(true);
    for (const state of ["placed", "delivered", "failed", "void", "preview"]) expect(needsSettling({ state })).toBe(false);
  });
});

describe("the typed confirm for erasing a workspace", () => {
  it("is the workspace's own address, nothing less", async () => {
    const { terminateConfirmed } = await import("./adminGaps");
    expect(terminateConfirmed("acme", "acme")).toBe(true);
    expect(terminateConfirmed(" ACME ", "acme")).toBe(true);
    for (const typed of ["", "acm", "acme2", "yes"]) expect(terminateConfirmed(typed, "acme")).toBe(false);
    expect(terminateConfirmed("", "")).toBe(false);
  });
});

describe("the daily journey", () => {
  it("says when it ran and what failed", async () => {
    const { journeySummary } = await import("./adminGaps");
    expect(journeySummary(null)).toMatch(/not run/i);
    const ok = journeySummary({ ran_at: "2026-10-18T05:00:00Z", steps: [{ name: "pricing", ok: true, ms: 120 }] });
    expect(ok).toMatch(/passed/i);
    const bad = journeySummary({ ran_at: "2026-10-18T05:00:00Z", steps: [{ name: "pricing", ok: true, ms: 1 }, { name: "checkout", ok: false, ms: 9 }] });
    expect(bad).toMatch(/checkout/);
  });
});

describe("the admin calls", () => {
  it("settles an attempt as bought, or as nothing bought", async () => {
    const calls = stubFetch();
    const { adminApi } = await import("./adminApi");
    await adminApi.resolveServerOrder("a1", "123456");
    await adminApi.resolveServerOrder("a1", "");
    expect(calls[0].url).toContain("/onecamp/admin/servers/orders/a1/resolve");
    expect(calls[0].init.body).toBe(JSON.stringify({ order_id: "123456" }));
    expect(calls[1].init.body).toBe(JSON.stringify({ order_id: "" }));
  });
  it("resumes stuck installs and says how many", async () => {
    const calls = stubFetch();
    const { adminApi } = await import("./adminApi");
    expect(await adminApi.recoverInstances()).toEqual({ recovered: 2 });
    expect(calls[0].url).toContain("/onecamp/admin/instances/recover");
    expect(calls[0].init.method).toBe("POST");
  });
  it("reads the last journey", async () => {
    const calls = stubFetch();
    const { adminApi } = await import("./adminApi");
    await adminApi.lastJourney();
    expect(calls[0].url).toContain("/onecamp/admin/journey");
  });
  it("erases a workspace with its address as the confirmation", async () => {
    const calls = stubFetch();
    const { adminApi } = await import("./adminApi");
    await adminApi.terminateInstance("i1", "acme");
    expect(calls[0].url).toContain("/onecamp/admin/instance/i1/terminate");
    expect(calls[0].init.body).toBe(JSON.stringify({ confirm: "acme" }));
  });
});

describe("the erase panel", () => {
  it("names the workspace and starts with its button disabled", async () => {
    const { TerminateWorkspace } = await import("@/components/admin/TerminateWorkspace");
    const html = renderToString(<TerminateWorkspace id="i1" address="acme" onDone={() => {}} startOpen />);
    expect(html).toContain("acme");
    expect(html).toMatch(/cannot be undone/i);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*Erase/);
  });
});
