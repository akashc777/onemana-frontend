import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VISITOR_PARAM, withVisitorId } from "@/lib/track";

// The whole funnel rests on this one function: get it wrong and every demo
// visitor arrives at the demo as a stranger, which is the state this replaced.
//
// A minimal localStorage stub rather than pulling jsdom in for one file. Every
// other test in this repo runs in the node environment and the function touches
// exactly two storage methods, so a real DOM would be a dependency bought to
// exercise nothing extra.

function stubStorage(store: Map<string, string>, broken = false) {
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => {
      if (broken) throw new Error("storage disabled");
      return store.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (broken) throw new Error("storage disabled");
      store.set(k, v);
    },
  };
}

let store: Map<string, string>;

beforeEach(() => {
  store = new Map();
  stubStorage(store);
});

afterEach(() => {
  delete (globalThis as { localStorage?: unknown }).localStorage;
});

describe("withVisitorId", () => {
  it("carries the id the site already uses for its own pageviews", () => {
    store.set("om_vid", "visitor-123");
    const out = new URL(withVisitorId("https://onecamp.example.com/?start_demo=1"));
    expect(out.searchParams.get(VISITOR_PARAM)).toBe("visitor-123");
    // The demo link's own parameters must survive, or auto-start breaks and the
    // measurement takes the thing it was measuring with it.
    expect(out.searchParams.get("start_demo")).toBe("1");
  });

  it("is idempotent, because one anchor can be clicked twice", () => {
    store.set("om_vid", "visitor-123");
    const once = withVisitorId("https://onecamp.example.com/?start_demo=1");
    const twice = withVisitorId(once);
    expect(twice).toBe(once);
    // Two vid parameters is as good as none: a reader takes the first and the
    // second belongs to somebody else.
    expect(twice.match(/vid=/g)?.length).toBe(1);
  });

  it("returns the link untouched when storage is unavailable", () => {
    // A browser with site data blocked. The demo must still open; it is simply
    // unattributed, and that is the correct trade.
    stubStorage(store, true);
    const href = "https://onecamp.example.com/?start_demo=1";
    expect(withVisitorId(href)).toBe(href);
  });

  it("returns a malformed link untouched rather than throwing into a click handler", () => {
    store.set("om_vid", "visitor-123");
    // This runs inside a capture-phase click listener. A throw here would take
    // the navigation with it, so a bad href must cost the measurement and
    // nothing else.
    expect(withVisitorId("not a url")).toBe("not a url");
  });
});
