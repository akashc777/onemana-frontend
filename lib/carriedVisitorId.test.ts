import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The return trip from the demo. Its "No server? We host it" link opens the
// checkout here carrying the visitor id (?vid=), the way this site's demo
// links carry it there, so a purchase can be joined to the demo visit that
// led to it. Node environment, as every test here: the browser is stubbed.

type Track = typeof import("@/lib/track");

let store: Map<string, string>;
let bodies: { visitor_id: string; path: string }[];
let replaced: string[];

function stubBrowser(href: string, nav: Record<string, unknown> = {}) {
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true });
  (globalThis as { window?: unknown }).window = {
    location: { href },
    history: { replaceState: (_s: unknown, _t: string, url: string) => void replaced.push(url) },
  };
}

/** The tracker as a fresh page load has it, with the server answering `verdict`. */
async function load(verdict: (sent: string) => unknown): Promise<Track> {
  vi.resetModules();
  vi.stubGlobal("fetch", async (_url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    bodies.push(body);
    return new Response(JSON.stringify(verdict(body.visitor_id)), { status: 200 });
  });
  return await import("@/lib/track");
}

const keepWhatWasSent = (sent: string) => ({ store: true, visitor_id: sent || "6f1c2a9e-1111-4222-8333-944455556666" });
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  store = new Map();
  bodies = [];
  replaced = [];
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (globalThis as { localStorage?: unknown }).localStorage;
  delete (globalThis as { navigator?: unknown }).navigator;
  delete (globalThis as { window?: unknown }).window;
});

describe("carriedVisitorId", () => {
  it("finds the id and the address without it", async () => {
    const { carriedVisitorId } = await import("@/lib/track");
    expect(carriedVisitorId("https://onemana.dev/buy?plan=cloud&vid=visitor-123")).toEqual({ vid: "visitor-123", rest: "/buy?plan=cloud" });
    expect(carriedVisitorId("https://onemana.dev/buy?vid=visitor-123#form")).toEqual({ vid: "visitor-123", rest: "/buy#form" });
  });

  it("takes an id in a shape the server never issues out of the address, and uses none", async () => {
    const { carriedVisitorId } = await import("@/lib/track");
    expect(carriedVisitorId("https://onemana.dev/buy?plan=cloud&vid=%3Cscript%3E")).toEqual({ vid: "", rest: "/buy?plan=cloud" });
  });

  it("is nothing for a link that carries none, or isn't one", async () => {
    const { carriedVisitorId } = await import("@/lib/track");
    expect(carriedVisitorId("https://onemana.dev/buy?plan=cloud")).toBeNull();
    expect(carriedVisitorId("not a url")).toBeNull();
  });
});

describe("arriving from the demo's Cloud link", () => {
  it("sends the carried id with the first pageview, and keeps it once the server allows", async () => {
    stubBrowser("https://onemana.dev/buy?plan=cloud&vid=visitor-123");
    const t = await load(keepWhatWasSent);
    t.adoptCarriedVisitorId();
    t.trackPageview("/buy");
    await flush();
    expect(bodies[0]).toMatchObject({ visitor_id: "visitor-123", path: "/buy" });
    expect(store.get("om_vid")).toBe("visitor-123");
    // Out of the address, plan kept: the checkout still opens on Cloud.
    expect(replaced).toEqual(["/buy?plan=cloud"]);
  });

  it("never replaces the id this browser already has", async () => {
    store.set("om_vid", "own-visitor-id");
    stubBrowser("https://onemana.dev/buy?plan=cloud&vid=visitor-123");
    const t = await load(keepWhatWasSent);
    t.adoptCarriedVisitorId();
    t.trackPageview("/buy");
    await flush();
    expect(bodies[0].visitor_id).toBe("own-visitor-id");
    expect(replaced).toEqual(["/buy?plan=cloud"]);
  });

  it("keeps nothing where the server says nothing may be kept (EEA, UK)", async () => {
    stubBrowser("https://onemana.dev/buy?plan=cloud&vid=visitor-123");
    const t = await load(() => ({ store: false }));
    t.adoptCarriedVisitorId();
    t.trackPageview("/buy");
    await flush();
    expect(store.has("om_vid")).toBe(false);
    // And it stops being sent.
    t.trackPageview("/buy/success");
    await flush();
    expect(bodies[1].visitor_id).toBe("");
  });

  it("sends nothing at all from a browser that opted out, and still cleans the address", async () => {
    stubBrowser("https://onemana.dev/buy?plan=cloud&vid=visitor-123", { globalPrivacyControl: true });
    const t = await load(keepWhatWasSent);
    t.adoptCarriedVisitorId();
    t.trackPageview("/buy");
    await flush();
    expect(bodies).toEqual([]);
    expect(replaced).toEqual(["/buy?plan=cloud"]);
  });

  it("is taken before the first pageview", () => {
    const tracker = readFileSync(join(__dirname, "..", "components/site/VisitorTracker.tsx"), "utf8");
    const adopt = tracker.indexOf("adoptCarriedVisitorId();");
    const pageview = tracker.indexOf("trackPageview(pathname);");
    expect(adopt, "the tracker never adopts a carried id").toBeGreaterThan(-1);
    // Effects run in the order they are declared.
    expect(adopt).toBeLessThan(pageview);
  });
});

describe("the checkout a Cloud link opens", () => {
  it("opens on Cloud when the link asks for it, and on the licence otherwise", async () => {
    const { planFromParams } = await import("@/lib/paymentTerms");
    expect(planFromParams("cloud")).toBe("cloud");
    for (const v of [null, "", "lifetime", "Cloud", "free"]) expect(planFromParams(v)).toBe("lifetime");
    const buy = readFileSync(join(__dirname, "..", "app/buy/page.tsx"), "utf8");
    expect(buy).toContain('planFromParams(params.get("plan"))');
  });

  it("is where the free page sends someone with no server", () => {
    // It linked to /buy, which opens on the lifetime licence: the visitor who
    // had just said they have no server was shown the self-hosted price.
    const free = readFileSync(join(__dirname, "..", "app/free/page.tsx"), "utf8");
    const line = free.slice(free.indexOf("No server?"), free.indexOf("runs it for you"));
    expect(line).toContain('cloudBuyHref("monthly")');
    expect(line).not.toContain('href="/buy"');
  });
});
