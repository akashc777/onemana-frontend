import { describe, expect, it } from "vitest"

import { rovingIndex } from "@/lib/roving"

/**
 * One rule for every group that is one Tab stop: the product tabs, the Cloud
 * size, the plan and billing choices, the AI choice and the phone's theme
 * segments. Before it, the billing and theme radios had no arrow keys at all
 * and the Cloud size had no ↑↓, Home or End (storefront audit K2, G11, P1).
 */
describe("a roving group's keys", () => {
  it("move with all four arrows and wrap round", () => {
    expect(rovingIndex("ArrowRight", 0, 3)).toBe(1)
    expect(rovingIndex("ArrowDown", 2, 3)).toBe(0)
    expect(rovingIndex("ArrowLeft", 0, 3)).toBe(2)
    expect(rovingIndex("ArrowUp", 1, 3)).toBe(0)
  })

  it("jump to the ends with Home and End", () => {
    expect(rovingIndex("Home", 2, 3)).toBe(0)
    expect(rovingIndex("End", 0, 3)).toBe(2)
  })

  it("leave every other key to the page", () => {
    for (const key of ["Tab", "Enter", " ", "a", "Escape", "PageDown"]) expect(rovingIndex(key, 1, 3), key).toBeNull()
    expect(rovingIndex("ArrowRight", 0, 0)).toBeNull()
  })
})
