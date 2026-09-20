import { renderToString } from "react-dom/server"
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { VerifyRecord } from "@/components/site/VerifyRecord"

// The logic this page runs is covered in lib/verifyRecord.test.ts, including
// against a file the live product produced. What is asserted here is the part
// a visitor is promised and the part that would quietly become untrue.

describe("the verify page", () => {
  it("offers a file and says what happens to it", () => {
    const html = renderToString(<VerifyRecord />)
    expect(html).toContain("Drop the file here")
    expect(html).toContain("Nothing is uploaded")
    expect(html).toContain('type="file"')
  })

  it("makes no network call, which is the promise it prints", () => {
    // Source-level, because the promise is about something that does NOT
    // happen, and a render cannot show the absence of a request. If somebody
    // later adds an upload for convenience, the printed promise becomes a lie
    // and this fails first.
    const src = readFileSync("components/site/VerifyRecord.tsx", "utf8")
    const code = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
    for (const call of ["fetch(", "XMLHttpRequest", "axios", "navigator.sendBeacon"]) {
      expect(code).not.toContain(call)
    }
  })

  it("shows the document's own wording rather than a claim of its own", () => {
    // The steps and limits come from the uploaded file. The component must not
    // carry its own copy, or it could advertise a guarantee the file does not
    // make.
    const src = readFileSync("components/site/VerifyRecord.tsx", "utf8")
    expect(src).toContain("report.howToVerify.map")
    expect(src).toContain("report.limits.map")
    expect(src).not.toMatch(/SHA-256 over these fields/)
  })
})
