import { createHmac } from "node:crypto"
import { afterEach, describe, expect, it, vi } from "vitest"

const revalidated: string[] = []
vi.mock("next/cache", () => ({
  revalidateTag: (tag: string) => revalidated.push(`tag ${tag}`),
  revalidatePath: (path: string) => revalidated.push(`path ${path}`),
}))

import { POST } from "./route"
import { signatureValid } from "@/lib/releaseWebhook"
import { RELEASES_TAG } from "@/lib/releases"
import { GITHUB_TAG } from "@/lib/github"

/**
 * GitHub's release webhook (RELEASES.md): a published release refreshes the
 * changelog and the home page's pill now instead of within the hour. It is
 * off without its secret, and it acts only on a delivery GitHub signed with
 * that secret, about the server's own repository.
 */

const SECRET = "a-long-random-secret"
const sign = (body: string, secret = SECRET) => `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`
const release = JSON.stringify({ action: "published", release: { tag_name: "v2.72.0" }, repository: { full_name: "OneMana-Soft/OneCamp" } })
const post = (body: string, headers: Record<string, string>) =>
  POST(new Request("https://onemana.dev/api/revalidate/releases", { method: "POST", body, headers: { "content-type": "application/json", ...headers } }))

afterEach(() => {
  revalidated.length = 0
  delete process.env.RELEASES_WEBHOOK_SECRET
})

describe("the release webhook", () => {
  it("is not there until its secret is set", async () => {
    const res = await post(release, { "x-github-event": "release", "x-hub-signature-256": sign(release) })
    expect(res.status).toBe(404)
    expect(revalidated).toEqual([])
  })

  it("refuses a delivery that GitHub did not sign with the secret", async () => {
    process.env.RELEASES_WEBHOOK_SECRET = SECRET
    for (const signature of [undefined, sign(release, "another-secret"), sign(`${release} `), "sha1=abc", `sha256=${"0".repeat(64)}`]) {
      const res = await post(release, { "x-github-event": "release", ...(signature ? { "x-hub-signature-256": signature } : {}) })
      expect(res.status).toBe(401)
    }
    expect(revalidated).toEqual([])
  })

  it("refreshes the changelog, the home page and the open-source cards when the server's repository publishes a release", async () => {
    process.env.RELEASES_WEBHOOK_SECRET = SECRET
    const res = await post(release, { "x-github-event": "release", "x-hub-signature-256": sign(release) })
    expect(res.status).toBe(200)
    expect(revalidated).toEqual([`tag ${RELEASES_TAG}`, `tag ${GITHUB_TAG}`, "path /", "path /changelog", "path /changelog/[slug]", "path /open-source"])
  })

  it("answers GitHub's ping, and leaves other events and other repositories alone", async () => {
    process.env.RELEASES_WEBHOOK_SECRET = SECRET
    const ping = JSON.stringify({ zen: "Keep it logically awesome." })
    expect((await post(ping, { "x-github-event": "ping", "x-hub-signature-256": sign(ping) })).status).toBe(200)
    const push = JSON.stringify({ repository: { full_name: "OneMana-Soft/OneCamp" } })
    expect((await post(push, { "x-github-event": "push", "x-hub-signature-256": sign(push) })).status).toBe(200)
    const other = JSON.stringify({ action: "published", repository: { full_name: "someone/else" } })
    expect((await post(other, { "x-github-event": "release", "x-hub-signature-256": sign(other) })).status).toBe(200)
    expect(revalidated).toEqual([])
  })

  it("checks the signature in constant time, over the exact bytes received", () => {
    expect(signatureValid(SECRET, release, sign(release))).toBe(true)
    expect(signatureValid(SECRET, release, sign(release).toUpperCase())).toBe(false)
    expect(signatureValid(undefined, release, sign(release))).toBe(false)
    expect(signatureValid("", release, sign(release, ""))).toBe(false)
  })
})
