import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"

import { checkVerdict, verificationTxtHost, workspaceHost } from "./domainMove"
import { portalApi } from "./portalApi"

/**
 * "Use my own domain" could never finish from the account page. Three of the
 * reasons were in this site rather than the API, and are pinned here: the TXT
 * record was shown under the wrong name, every check said "Checked." in green,
 * and each action reloaded the page around the panel so its answer vanished.
 * The backend's share (a new verification token on every start, no cancel) is
 * reported separately.
 */

describe("the ownership record", () => {
  it("goes under the whole domain entered, which is where the backend looks", () => {
    // VerificationTXTName in onemana-backend: "_onecamp-verify." + the domain.
    expect(verificationTxtHost("acme.com")).toBe("_onecamp-verify.acme.com")
    expect(verificationTxtHost("team.acme.com")).toBe("_onecamp-verify.team.acme.com")
    expect(verificationTxtHost("acme.co.uk")).toBe("_onecamp-verify.acme.co.uk")
    expect(verificationTxtHost(" Acme.COM ")).toBe("_onecamp-verify.acme.com")
  })
})

describe("the address the panel promises", () => {
  it("is the workspace record's host, not the bare domain", () => {
    const records = [{ host: "onecamp.acme.com", type: "CNAME", value: "cname.example", proxied: false, purpose: "Workspace" }]
    expect(workspaceHost({ to_domain: "acme.com", dns_records: records })).toBe("onecamp.acme.com")
    expect(workspaceHost({ to_domain: "acme.com", dns_records: [] })).toBe("acme.com")
  })
})

describe("what a check found", () => {
  it("is not good news while records are missing, and says which", () => {
    const owner = checkVerdict({ state: "pending_dns", state_detail: "no TXT record found at _onecamp-verify.acme.com yet" })
    expect(owner.tone).toBe("waiting")
    expect(owner.text).toContain("No TXT record found at _onecamp-verify.acme.com yet.")

    const records = checkVerdict({ state: "pending_dns", state_detail: "still waiting for: onecamp.acme.com, onecamp-turn.acme.com" })
    expect(records.tone).toBe("waiting")
    expect(records.text).toContain("onecamp-turn.acme.com")
    expect(checkVerdict({ state: "verifying", state_detail: "" }).tone).toBe("waiting")
  })

  it("is good news only once the records check out", () => {
    expect(checkVerdict({ state: "applying", state_detail: "records verified" }).tone).toBe("done")
    expect(checkVerdict({ state: "applied", state_detail: "" }).tone).toBe("done")
  })

  it("does not show a failed move's raw error to the customer", () => {
    const v = checkVerdict({ state: "failed", state_detail: "reconfigure the server for acme.com: ssh: handshake failed" })
    expect(v.tone).toBe("failed")
    expect(v.text).not.toContain("ssh")
    expect(v.text).toContain("current address still works")
  })

  it("claims nothing when the answer did not come back", () => {
    expect(checkVerdict({ state: "", state_detail: "" }).tone).toBe("waiting")
  })
})

describe("the check call", () => {
  afterEach(() => vi.unstubAllGlobals())

  it("reads the change the endpoint returns, which carries no message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ status: "success", data: { to_domain: "acme.com", state: "pending_dns", state_detail: "still waiting for: onecamp.acme.com" } }),
          { status: 200 },
        ),
      ),
    )
    await expect(portalApi.checkDomain("i-1")).resolves.toEqual({
      to_domain: "acme.com",
      state: "pending_dns",
      state_detail: "still waiting for: onecamp.acme.com",
    })
  })
})

describe("the panel", () => {
  const src = readFileSync("components/account/WorkspaceSection.tsx", "utf8")

  it("shows the record name and the check result worked out above", () => {
    expect(src).toContain("verificationTxtHost(plan.to_domain)")
    expect(src).not.toMatch(/slice\(-2\)/)
    expect(src).toContain("checkVerdict(change)")
  })

  it("does not reload the account page after starting or checking a move", () => {
    // That reload unmounts the panel: the answer was never seen.
    const start = src.slice(src.indexOf("async function start()"), src.indexOf("async function check()"))
    const check = src.slice(src.indexOf("async function check()"), src.indexOf("if (!open)"))
    expect(start).not.toMatch(/^\s*onChanged\(\)/m)
    expect(check).toContain('if (change.state === "applied") onChanged();')
  })
})
