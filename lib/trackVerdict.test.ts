import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { applyVerdict, getVisitorId, isInternal, markInternal, optedOut } from "@/lib/track";

// What the browser keeps is decided by the server's answer to each pageview,
// and these are the only ways that answer may change storage.

let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
});

afterEach(() => {
  delete (globalThis as { localStorage?: unknown }).localStorage;
  delete (globalThis as { navigator?: unknown }).navigator;
});

describe("applyVerdict", () => {
  it("keeps the id the server issued", () => {
    applyVerdict({ store: true, visitor_id: "6f1c2a9e-1111-4222-8333-944455556666" });
    expect(getVisitorId()).toBe("6f1c2a9e-1111-4222-8333-944455556666");
  });

  it("deletes the id a visitor already held when told to keep none (EEA, UK)", () => {
    store.set("om_vid", "old-visitor-id");
    applyVerdict({ store: false });
    expect(getVisitorId()).toBe("");
  });

  it("changes nothing on an empty or malformed answer, and never stores a bad id", () => {
    store.set("om_vid", "kept-visitor-id");
    for (const body of [null, undefined, "", {}, { store: true }, { store: true, visitor_id: "<script>" }]) {
      applyVerdict(body);
    }
    expect(getVisitorId()).toBe("kept-visitor-id");
  });
});

describe("who is not tracked", () => {
  it("the operator's own browser, once marked", () => {
    expect(isInternal()).toBe(false);
    markInternal();
    expect(isInternal()).toBe(true);
  });

  it("a browser sending Global Privacy Control or Do Not Track", () => {
    for (const nav of [{ globalPrivacyControl: true }, { doNotTrack: "1" }]) {
      Object.defineProperty(globalThis, "navigator", { value: nav, configurable: true });
      expect(optedOut()).toBe(true);
    }
    Object.defineProperty(globalThis, "navigator", { value: { doNotTrack: "0" }, configurable: true });
    expect(optedOut()).toBe(false);
  });
});
