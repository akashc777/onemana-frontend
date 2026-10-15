import { execFileSync, spawnSync } from "node:child_process"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterAll, describe, expect, it } from "vitest"

// Vercel's Ignored Build Step decides whether a push builds, on the free plan's
// budget. An inline `git diff` against the last deploy broke in two ways: after
// a long push that commit is outside Vercel's shallow clone, so git exits 128
// ("bad object") and Vercel fails the deployment; and a guard written inline
// makes the command longer than the 256 characters Vercel accepts.

const ROOT = path.resolve(__dirname, "..")
const SCRIPT = path.join(ROOT, "scripts/vercel-ignore.sh")

describe("vercel.json's ignore command", () => {
  it("fits Vercel's 256-character limit and runs the script", () => {
    const { ignoreCommand } = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"))
    expect(ignoreCommand.length).toBeLessThanOrEqual(256)
    expect(ignoreCommand).toBe("bash scripts/vercel-ignore.sh")
  })
})

describe("scripts/vercel-ignore.sh", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "vercel-ignore-"))
  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  const git = (...args: string[]) =>
    execFileSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args], { cwd: dir }).toString().trim()
  const commit = (file: string, text: string) => {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    writeFileSync(path.join(dir, file), text)
    git("add", "-A")
    git("commit", "-q", "-m", file)
    return git("rev-parse", "HEAD")
  }
  // 0 skips the build, 1 builds; anything else would fail the deployment.
  const decide = (previous?: string) => {
    const env = { ...process.env }
    delete env.VERCEL_GIT_PREVIOUS_SHA
    if (previous) env.VERCEL_GIT_PREVIOUS_SHA = previous
    return spawnSync("bash", ["scripts/vercel-ignore.sh"], { cwd: dir, env }).status
  }

  git("init", "-q")
  mkdirSync(path.join(dir, "scripts"))
  copyFileSync(SCRIPT, path.join(dir, "scripts/vercel-ignore.sh"))
  const first = commit("components/site/Hero.tsx", "export const a = 1\n")

  it("builds the first commit, which has no parent to compare with", () => {
    expect(decide()).toBe(1)
  })

  it("skips a push that changes only tests, e2e, design, scripts and Markdown", () => {
    commit("app/sitePolish.test.ts", "test\n")
    commit("components/site/hero.test.tsx", "test\n")
    commit("e2e/buy.spec.ts", "spec\n")
    commit("design/notes.md", "notes\n")
    commit("scripts/tool.mjs", "tool\n")
    commit("README.md", "readme\n")
    expect(decide(first)).toBe(0)
  })

  it("builds a push that changes the site", () => {
    commit("app/globals.css", "body {}\n")
    expect(decide(first)).toBe(1)
  })

  it("builds a push that changes only a legal page's Markdown, which the site builds in", () => {
    const deployed = commit("docs/notes.md", "notes\n")
    commit("content/legal/refund-policy.md", "words\n")
    expect(decide(deployed)).toBe(1)
  })

  it("builds when the last deploy's commit isn't in the clone", () => {
    expect(decide("85249c0fd33d3c12115fc48e691ac393acdfbafa")).toBe(1)
  })
})
