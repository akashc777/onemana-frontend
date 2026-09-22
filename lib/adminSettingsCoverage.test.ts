import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Every setting the backend reads has a field in the admin form.
 *
 * THE GAP THIS CLOSES. A yearly Razorpay plan was added to the backend, read
 * from the setting cloud_plan_id_yearly, and there was nowhere in the admin
 * panel to type it. The operator held a plan id and could not find the box.
 * Four older keys had the same problem and nobody had noticed because nothing
 * checked. The backend's config reads are the source of truth; this reads
 * them and asks the form for each one.
 *
 * The backend is a sibling checkout on the developer's machine, not part of
 * this repo, so when it is absent the test skips rather than fails: it is a
 * guard for the people who have both, which is the people who add settings.
 */

const BACKEND = resolve(__dirname, "..", "..", "onemana-backend")
const READS = /Config(?:String|Int|Bool)\((Cfg[A-Za-z0-9]+|"[a-z0-9_]+")/g
const CONSTS = /\b(Cfg[A-Za-z0-9]+)\s*=\s*"([a-z0-9_]+)"/g

/** Keys the backend reads that are deliberately NOT operator-editable. Each one says why. */
const NOT_IN_FORM = new Set<string>([
  // (none yet: everything the backend reads today is an operator's decision)
])

function goFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) goFiles(p, out)
    else if (p.endsWith(".go") && !p.endsWith("_test.go")) out.push(p)
  }
  return out
}

describe("admin settings cover every backend config key", () => {
  it("has a form field for each key the backend reads", () => {
    if (!existsSync(join(BACKEND, "business", "onecamp"))) return
    const sources = [...goFiles(join(BACKEND, "business")), ...goFiles(join(BACKEND, "Controllers"))].map((f) =>
      readFileSync(f, "utf8"),
    )
    const consts = new Map<string, string>()
    for (const src of sources) for (const m of src.matchAll(CONSTS)) consts.set(m[1], m[2])
    const keys = new Set<string>()
    for (const src of sources) {
      for (const m of src.matchAll(READS)) {
        const ref = m[1]
        if (ref.startsWith('"')) keys.add(ref.slice(1, -1))
        else if (consts.has(ref)) keys.add(consts.get(ref) as string)
      }
    }
    expect(keys.size, "the backend reads no settings at all, so this guard is reading the wrong thing").toBeGreaterThan(20)

    const form = readFileSync(resolve(__dirname, "..", "components", "admin", "SettingsForm.tsx"), "utf8")
    const fields = new Set([...form.matchAll(/key:\s*"([a-z0-9_]+)"/g)].map((m) => m[1]))
    const missing = [...keys].filter((k) => !fields.has(k) && !NOT_IN_FORM.has(k)).sort()
    expect(
      missing,
      `The backend reads these settings and the admin form has no field for them, so an operator ` +
        `cannot set them without a database client. Add a field in components/admin/SettingsForm.tsx, ` +
        `or list the key in NOT_IN_FORM with the reason it is not the operator's to set.`,
    ).toEqual([])
  })
})
