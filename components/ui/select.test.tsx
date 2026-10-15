import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { SelectOptions, Select, comboboxAria } from "@/components/ui/Select"
import { PAGE, TYPEAHEAD_MS, closedState, optionId, selectKey, typeaheadIndex, type SelectState } from "@/lib/selectKeys"

/**
 * The site's one select, the checkout's country and state (storefront audit
 * K5, a P1 on the money path): a screen reader never heard the chosen
 * country, because the trigger's aria-label replaced its visible value as
 * its name; arrowing said nothing, with no aria-activedescendant; Tab left
 * the list open; and its options were 36 px under a finger.
 */
const COUNTRIES = ["France", "Germany", "India", "Indonesia", "Ireland", "United Kingdom", "United States"]
const at = (state: Partial<SelectState>): SelectState => ({ ...closedState(), ...state })
const key = (k: string, now = 10_000, altKey = false) => ({ key: k, now, altKey })

describe("the select's keys (a native select's, the APG select-only combobox)", () => {
  it("opens on ↓, ↑, Enter and Space at the chosen option, and on Home and End at the ends", () => {
    for (const k of ["ArrowDown", "ArrowUp", "Enter", " "]) {
      const r = selectKey(closedState(), key(k), COUNTRIES, 2)
      expect(r.state, k).toMatchObject({ open: true, active: 2 })
      expect(r.handled, k).toBe(true)
      expect(r.commit, k).toBeUndefined()
    }
    expect(selectKey(closedState(), key("Home"), COUNTRIES, 2).state).toMatchObject({ open: true, active: 0 })
    expect(selectKey(closedState(), key("End"), COUNTRIES, 2).state).toMatchObject({ open: true, active: 6 })
    // Nothing chosen yet (a state before one is picked): the first option.
    expect(selectKey(closedState(), key("ArrowDown"), COUNTRIES, -1).state.active).toBe(0)
  })

  it("moves with the arrows, Home, End and a page at a time, without wrapping", () => {
    const open = at({ open: true, active: 2 })
    expect(selectKey(open, key("ArrowDown"), COUNTRIES, 2).state.active).toBe(3)
    expect(selectKey(open, key("ArrowUp"), COUNTRIES, 2).state.active).toBe(1)
    expect(selectKey(at({ open: true, active: 6 }), key("ArrowDown"), COUNTRIES, 2).state.active).toBe(6)
    expect(selectKey(at({ open: true, active: 0 }), key("ArrowUp"), COUNTRIES, 2).state.active).toBe(0)
    expect(selectKey(open, key("End"), COUNTRIES, 2).state.active).toBe(6)
    expect(selectKey(open, key("Home"), COUNTRIES, 2).state.active).toBe(0)
    const many = Array.from({ length: 40 }, (_, i) => `Option ${i}`)
    expect(selectKey(at({ open: true, active: 3 }), key("PageDown"), many, 3).state.active).toBe(3 + PAGE)
    expect(selectKey(at({ open: true, active: 3 }), key("PageUp"), many, 3).state.active).toBe(0)
  })

  it("Enter, Space and Alt+↑ choose the option under the keys and close", () => {
    for (const [k, alt] of [["Enter", false], [" ", false], ["ArrowUp", true]] as const) {
      const r = selectKey(at({ open: true, active: 4 }), key(k, 10_000, alt), COUNTRIES, 2)
      expect(r.commit, k).toBe(4)
      expect(r.state.open, k).toBe(false)
      expect(r.handled, k).toBe(true)
    }
  })

  it("Escape closes and keeps the value", () => {
    const r = selectKey(at({ open: true, active: 4 }), key("Escape"), COUNTRIES, 2)
    expect(r.state.open).toBe(false)
    expect(r.commit).toBeUndefined()
    expect(r.handled).toBe(true)
  })

  // The audit's third gap: tabbing away left the list open over the form.
  it("Tab chooses the option, closes the list and lets focus move on", () => {
    const r = selectKey(at({ open: true, active: 5 }), key("Tab"), COUNTRIES, 2)
    expect(r.state.open).toBe(false)
    expect(r.commit).toBe(5)
    expect(r.handled, "Tab's default must run, or focus would stay").toBe(false)
    // Closed, Tab is the page's: nothing happens here.
    expect(selectKey(closedState(), key("Tab"), COUNTRIES, 2)).toEqual({ state: closedState(), handled: false })
  })

  it("finds an option by what is typed, opening the list if it was closed", () => {
    const r = selectKey(closedState(), key("u"), COUNTRIES, 2)
    expect(r.state).toMatchObject({ open: true, active: 5 })
    // "un", "uni"…, then a space inside the search is part of it.
    let s = r.state
    for (const [i, c] of [..."nited "].entries()) s = selectKey(s, key(c, 10_000 + (i + 1) * 100), COUNTRIES, 2).state
    expect(s.open).toBe(true)
    expect(s.active).toBe(5)
    s = selectKey(s, key("S", 10_800), COUNTRIES, 2).state
    expect(COUNTRIES[s.active]).toBe("United States")
    // After a pause the next letter starts a new search.
    expect(COUNTRIES[selectKey(s, key("f", 10_800 + TYPEAHEAD_MS + 1), COUNTRIES, 2).state.active]).toBe("France")
  })

  it("the same letter again cycles through the options it starts", () => {
    expect(COUNTRIES[typeaheadIndex(COUNTRIES, "i", 2)]).toBe("Indonesia")
    expect(COUNTRIES[typeaheadIndex(COUNTRIES, "ii", 3)]).toBe("Ireland")
    expect(COUNTRIES[typeaheadIndex(COUNTRIES, "iii", 4)]).toBe("India")
    expect(typeaheadIndex(COUNTRIES, "z", 2)).toBe(-1)
  })
})

describe("the select's markup", () => {
  const options = COUNTRIES.map((label, i) => ({ value: `c${i}`, label }))

  it("is a combobox named by its visible label, whose value is the chosen option", () => {
    const html = renderToString(<Select label="Country" value="c2" onChange={() => {}} options={options} hint="Sets the tax on your invoice." />)
    const combo = /<div[^>]*role="combobox"[^>]*>/.exec(html)?.[0] ?? ""
    expect(combo, "no combobox").not.toBe("")
    expect(combo, "an aria-label hides the chosen value from a screen reader").not.toMatch(/aria-label=/)
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(combo)?.[1]
    expect(html).toMatch(new RegExp(`<span id="${labelledBy}"[^>]*>Country`))
    // The value is the combobox's own text, read after its name.
    expect(html.slice(html.indexOf(combo))).toMatch(/^<div[^>]*role="combobox"[^>]*><span[^>]*>India<\/span>/)
    const controls = /aria-controls="([^"]+)"/.exec(combo)?.[1]
    expect(html).toContain(`id="${controls}" role="listbox"`)
    expect(combo).toContain('aria-expanded="false"')
    expect(combo).toContain('aria-haspopup="listbox"')
    expect(combo).toContain('tabindex="0"')
    expect(combo).toContain("ui-field")
    const described = /aria-describedby="([^"]+)"/.exec(combo)?.[1]
    expect(html).toMatch(new RegExp(`<span id="${described}"[^>]*>Sets the tax on your invoice.`))
  })

  it("while open, points at the option under the keys, and closed points nowhere", () => {
    const ids = { labelId: "s-label", listId: "s-list" }
    expect(comboboxAria({ open: true, active: 4, ...ids })).toMatchObject({ "aria-expanded": true, "aria-activedescendant": optionId("s-list", 4) })
    expect(comboboxAria({ open: false, active: 4, ...ids })["aria-activedescendant"]).toBeUndefined()
  })

  it("gives every option the id the combobox points at; the chosen one is selected and ticked", () => {
    const html = renderToString(
      <ul>
        <SelectOptions listId="s-list" options={options} chosen={2} active={4} onActive={() => {}} onPick={() => {}} />
      </ul>,
    )
    const rows = html.match(/<li[^>]*>/g) ?? []
    expect(rows).toHaveLength(options.length)
    rows.forEach((row, i) => {
      expect(row).toContain(`id="${optionId("s-list", i)}"`)
      expect(row).toContain('role="option"')
      expect(row).toContain(`aria-selected="${i === 2}"`)
      expect(row.includes("data-active"), `row ${i}`).toBe(i === 4)
      // The layer's item: its highlight is the press tint, and it is 44 px
      // under a finger (the audit measured 36; app/interaction.test.ts reads
      // the rule from the compiled CSS).
      expect(row).toContain('data-interactive="item"')
      expect(row).not.toMatch(/\bbg-/)
    })
    // The tick is on the chosen option alone.
    const ticked = (html.split("</li>")).map((li) => li.includes("<svg"))
    expect(ticked.slice(0, options.length)).toEqual(options.map((_, i) => i === 2))
  })

  it("/buy names its country and state by their labels", async () => {
    const { readFileSync } = await import("node:fs")
    const src = readFileSync(new URL("../../app/buy/BuyCheckout.tsx", import.meta.url), "utf8")
    expect(src).toContain('<Select label="Country"')
    expect(src).toMatch(/<Select\s+label="State"/)
    expect(src).not.toMatch(/ariaLabel=/)
  })
})
