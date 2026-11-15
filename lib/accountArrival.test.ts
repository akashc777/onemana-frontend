import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

/**
 * Arriving at the account page from the Cloud receipt.
 *
 * The receipt's main button is the account page, where a buyer signs in with a
 * code sent to the email they typed at checkout a minute ago. The field starts
 * with it (from this tab's checkout, lib/purchaseHandoff), and a workspace the
 * payment has not created yet is said to be on its way rather than shown as
 * nothing.
 */
describe("the account page after a purchase", () => {
  it("starts the sign-in with the email typed at checkout", () => {
    const page = readFileSync("app/account/page.tsx", "utf8")
    expect(page).toContain('initialEmail={linkEmail || readPurchase()?.email || ""}')
  })

  it("tells the workspace section about the subscriptions, so it can say one is coming", () => {
    const dashboard = readFileSync("components/account/AccountDashboard.tsx", "utf8")
    // The props that matter, whatever else the tag carries.
    const tag = dashboard.match(/<WorkspaceSection\s[\s\S]*?\/>/)?.[0] ?? ""
    expect(tag).toContain("subscriptions={overview.subscriptions}")
    expect(tag).toContain("initial={instances}")
    const section = readFileSync("components/account/WorkspaceSection.tsx", "utf8")
    expect(section).toContain("paidWithoutWorkspace(subscriptions, instances.length)")
    expect(section).toContain("usePoll((instances ?? []).some((i) => i.working) || onItsWay, POLL_MS, load)")
  })

  it("tells a Cloud buyer on /buy that the email is their sign-in", () => {
    const buy = readFileSync("app/buy/BuyCheckout.tsx", "utf8")
    expect(buy).toContain("You sign in to your workspace with it")
  })
})
