import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * The checkout's result reaches the receipt through the tab, not the URL.
 *
 * Each test loads the module fresh, because what it holds in memory is exactly
 * the thing under test.
 */

const KEY = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"

let store: Map<string, string>

function fakeSessionStorage(blocked = false) {
  store = new Map()
  ;(globalThis as { sessionStorage?: unknown }).sessionStorage = {
    getItem: (k: string) => {
      if (blocked) throw new Error("SecurityError")
      return store.get(k) ?? null
    },
    setItem: (k: string, v: string) => {
      if (blocked) throw new Error("QuotaExceededError")
      store.set(k, v)
    },
  }
}

async function load() {
  vi.resetModules()
  return import("./purchaseHandoff")
}

beforeEach(() => fakeSessionStorage())
afterEach(() => {
  delete (globalThis as { sessionStorage?: unknown }).sessionStorage
})

describe("the purchase hand-off", () => {
  it("gives the receipt what the checkout saved, and the same object each time", async () => {
    const { readPurchase, savePurchase } = await load()
    savePurchase({ email: "buyer@example.com", key: KEY })
    expect(readPurchase()).toEqual({ email: "buyer@example.com", key: KEY })
    expect(readPurchase()).toBe(readPurchase())
  })

  it("survives a reload of the same tab", async () => {
    const first = await load()
    first.savePurchase({ email: "buyer@example.com", key: KEY })
    const afterReload = await load() // memory gone, sessionStorage kept
    expect(afterReload.readPurchase()).toEqual({ email: "buyer@example.com", key: KEY })
  })

  it("still works for this navigation when storage is blocked", async () => {
    fakeSessionStorage(true)
    const { readPurchase, savePurchase } = await load()
    savePurchase({ email: "buyer@example.com" })
    expect(readPurchase()).toEqual({ email: "buyer@example.com" })
  })

  it("has nothing for a direct visit, or for something that is not ours", async () => {
    expect((await load()).readPurchase()).toBeNull()
    for (const raw of ["not json", "42", '{"key":"x"}', '{"email":7}']) {
      store.set("om_purchase", raw)
      expect((await load()).readPurchase(), raw).toBeNull()
    }
  })
})
