import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { cloudBenefits } from "./content"

/**
 * A cloud subscriber must be sent to the page the whole flow waits on.
 *
 * WHY THIS EXISTS. It already went wrong, and silently. Paying for OneCamp Cloud
 * creates an instance in `awaiting_setup`, and the backend provisions nothing
 * until an address is chosen. WorkspaceSection.tsx says so in its own header:
 * "A subscription is charged, an instance is created, and nothing else happens
 * until somebody chooses an address."
 *
 * Yet the success page said only that we would contact them within 12 hours, and
 * linked to the docs and to GitHub. The welcome email went further and said
 * "There's nothing you need to do right now." So the customer was told twice to
 * wait, by the two surfaces that could have told them otherwise, while the system
 * waited for them. The first reminder is a day later.
 *
 * That is worse than a broken page. A failure gets reported; this looked to
 * everyone involved like a system with nothing to do.
 */

const ROOT = join(__dirname, "..")
const SUCCESS_PAGE = readFileSync(join(ROOT, "app/buy/success/page.tsx"), "utf8")

/**
 * Collapse whitespace before matching.
 *
 * JSX wraps prose across lines wherever the formatter decides, so a phrase that
 * reads as one sentence on screen is not contiguous in the file. Matching the raw
 * source would make this test fail on a reflow and pass on a reworded promise,
 * which is exactly backwards.
 */
function flat(s: string): string {
  return s.replace(/\s+/g, " ").toLowerCase()
}

/** The cloud branch of the success page, which is the only part under test. */
function cloudBranch(): string {
  const start = SUCCESS_PAGE.indexOf("{isCloud ? (")
  expect(start, "the success page no longer branches on isCloud").toBeGreaterThan(-1)
  const end = SUCCESS_PAGE.indexOf(") : pending", start)
  expect(end, "the isCloud branch no longer ends where it did").toBeGreaterThan(start)
  return SUCCESS_PAGE.slice(start, end)
}

describe("cloud purchase hand-off", () => {
  it("links a new subscriber to their account, where the address is chosen", () => {
    expect(
      cloudBranch(),
      "nothing provisions until the customer picks an address, and /account is the only place to do it",
    ).toContain('href="/account"')
  })

  it("asks for the address rather than only promising contact", () => {
    expect(flat(cloudBranch())).toContain("choose your address")
  })

  it("never tells a subscriber there is nothing to do", () => {
    // The exact sentence that shipped, plus the shape of it, so a reword is caught.
    for (const claim of ["nothing you need to do", "nothing to do right now"]) {
      expect(
        flat(SUCCESS_PAGE),
        `the success page still says "${claim}" while provisioning waits on the customer`,
      ).not.toContain(claim)
    }
  })

  it("says the address is free on onemana.dev and that a custom domain is possible", () => {
    // Both are true, both are paid for, and neither was mentioned anywhere a buyer
    // would see before this. The portal has supported the custom-domain move for a
    // while and it was never sold.
    const branch = flat(cloudBranch())
    expect(branch).toContain("onemana.dev")
    expect(branch).toContain("domain you own")
  })

  it("advertises both domain options before purchase, not only after", () => {
    const benefits = flat(cloudBenefits.join(" "))
    expect(benefits).toContain("onemana.dev")
    expect(benefits, "a buyer weighing the plan should know they can use their own domain").toContain(
      "your own domain",
    )
  })
})
