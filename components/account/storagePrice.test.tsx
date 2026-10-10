import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PortalInstance } from "@/lib/portalApi";

// The storage offer sits in the middle of the workspace card. Its price used
// to be read only once the card was drawn, so the offer landed a moment later
// and pushed everything under it down the screen.

const live = {
  id: "i1",
  state: "live",
  address: "kestrel.onemana.dev",
  storage_addon_gb: 0,
  storage_addon_state: "",
} as unknown as PortalInstance;

const priced = { data: { storage_addon_configured: true, storage_addon_paise: 299900, storage_addon_inr: 2999, storage_addon_gb: 500 } };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("the storage offer's price", () => {
  it("is asked for beside the account's own reads, before the overview is awaited", () => {
    const page = readFileSync("app/account/page.tsx", "utf8");
    expect(page.indexOf("preloadStoragePricing()")).toBeGreaterThan(-1);
    expect(page.indexOf("preloadStoragePricing()")).toBeLessThan(page.indexOf("await portalApi.me()"));
  });

  it("is read once, and a card drawn after it arrives shows the offer on its first paint", async () => {
    const fetch = vi.fn(async () => new Response(JSON.stringify(priced), { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const { preloadStoragePricing, StorageAddon } = await import("@/components/account/StorageAddon");

    await Promise.all([preloadStoragePricing(), preloadStoragePricing()]);
    expect(fetch).toHaveBeenCalledTimes(1);

    const html = renderToString(<StorageAddon inst={live} onChanged={() => {}} />);
    expect(html).toContain("500 GB");
  });

  it("asks again next time when a read brought no offer", async () => {
    const fetch = vi.fn(async () => new Response("{}", { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    const { preloadStoragePricing, StorageAddon } = await import("@/components/account/StorageAddon");

    await preloadStoragePricing();
    await preloadStoragePricing();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(renderToString(<StorageAddon inst={live} onChanged={() => {}} />)).toBe("");
  });
});
