import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"

import { EDITION_CHOICES, checkSlug, editionLabel, slugFromInput, slugVerdict } from "./workspaceAddress"

/**
 * The workspace is named, and its AI chosen, before paying.
 *
 * WHY. A Cloud buyer used to pay, then sign in to the account page in a second
 * session to name the workspace, and nothing was built until they had. The
 * checkout asks now, and the payment names the workspace. These hold the parts
 * a buyer reads: what the field turns their typing into, what each answer of
 * the live check says, and that the AI choice is in plain words.
 */

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("what the address field keeps of what is typed", () => {
  it("keeps only what an address can have", () => {
    expect(slugFromInput("Acme Labs")).toBe("acme-labs")
    expect(slugFromInput("acme.io")).toBe("acme-io")
    expect(slugFromInput("ÄCME!!_team")).toBe("cme-team")
    expect(slugFromInput("a".repeat(40))).toHaveLength(30)
  })
})

describe("what the live check says", () => {
  it("says a free name is free, by its full address", () => {
    const v = slugVerdict({ slug: "acme", domain: "acme.onemana.dev", available: true, checked: true })
    expect(v).toEqual({ tone: "ok", text: "acme.onemana.dev is free.", canPay: true })
  })

  it("says why a name is refused, in the backend's words, and stops the payment", () => {
    const taken = slugVerdict({ slug: "acme", available: false, checked: true, reason: '"acme" is already taken' })
    expect(taken.tone).toBe("bad")
    expect(taken.text).toBe('"acme" is already taken.')
    expect(taken.canPay).toBe(false)
    // A rule about the name's shape is a refusal too, though no lookup was made.
    const reserved = slugVerdict({ slug: "www", available: false, checked: false, reason: '"www" is reserved, please choose another address' })
    expect(reserved.canPay).toBe(false)
    expect(reserved.text).toBe('"www" is reserved, please choose another address.')
  })

  it("does not call a name taken when nobody could check, and lets the buyer go ahead", () => {
    const v = slugVerdict({ slug: "acme", available: false, checked: false, reason: "could not check existing DNS records" })
    expect(v.tone).toBe("unknown")
    expect(v.canPay).toBe(true)
    expect(v.text).toContain("check it again when your payment arrives")
  })

  it("asks the backend, and treats an answer it cannot read as unknown", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "success", data: { slug: "acme", domain: "acme.onemana.dev", available: true, checked: true } }),
    })
    vi.stubGlobal("fetch", fetchMock)
    const c = await checkSlug("acme")
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/onecamp\/cloud\/slug-available\?slug=acme$/)
    expect(c.available).toBe(true)

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ msg: "boom" }) }))
    const down = await checkSlug("acme")
    expect(down.checked).toBe(false)
    expect(down.available).toBe(false)
  })
})

describe("the AI choice", () => {
  it("is offered in plain words, never as version numbers", () => {
    expect(EDITION_CHOICES.map((c) => c.label)).toEqual(["With AI features", "Without AI"])
    // The values are what the backend's tierForEdition reads.
    expect(EDITION_CHOICES.map((c) => c.value)).toEqual(["ai", "no-ai"])
    for (const c of EDITION_CHOICES) {
      expect(`${c.label} ${c.hint}`).not.toMatch(/\bv[12]\b/i)
    }
    expect(editionLabel(true)).toBe("With AI features")
    expect(editionLabel(false)).toBe("Without AI")
  })

  it("is never shown as v1 or v2 on the account page either", () => {
    const section = readFileSync("components/account/WorkspaceSection.tsx", "utf8")
    expect(section).toContain("editionLabel(inst.has_ai)")
    expect(section).toContain("editionLabel(e.has_ai)")
    expect(section).not.toMatch(/\{inst\.edition\} ·|\{e\.name\}<\/span>/)
  })
})

describe("the checkout asks for both before paying", () => {
  const buy = readFileSync("app/buy/page.tsx", "utf8")
  const form = buy.slice(buy.indexOf("<form onSubmit={handleSubmit}"), buy.indexOf("</form>"))

  it("puts the address field and the AI choice in the Cloud form", () => {
    expect(form).toContain("<WorkspaceAddressField")
    expect(form).toContain("EDITION_CHOICES.map")
    expect(form.indexOf("{isCloud && (")).toBeLessThan(form.indexOf("<WorkspaceAddressField"))
  })

  it("sends both with the Cloud checkout, and stops on a refused name", () => {
    expect(buy).toContain("plan_code: cloudPlanCode(choice), slug, edition")
    expect(buy).toContain("addressVerdict && !addressVerdict.canPay")
  })

  it("hands the chosen address to the receipt", () => {
    const checkout = readFileSync("hooks/useCheckout.ts", "utf8")
    expect(checkout).toContain("savePurchase({ email: input.email, slug: input.slug,")
  })
})

describe("the account page, for a name chosen at checkout it could not use", () => {
  const section = readFileSync("components/account/WorkspaceSection.tsx", "utf8")

  it("starts filled in with the chosen name and edition, and says why it asks", () => {
    expect(section).toContain('useState(inst.chosen_slug ?? "")')
    expect(section).toContain("e.name === inst.chosen_edition")
    expect(section).toContain("{inst.choice_note}")
  })
})
