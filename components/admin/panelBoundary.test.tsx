import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ADMIN_TABS, AdminPanel } from "./AdminPanel"
import { isChunkError, PanelBoundary } from "./PanelBoundary"

// One section's failure must stay in that section. The Visitors tab is the
// only one that fetches code after the page loads (the map); with no boundary,
// that chunk failing (a tab left open across a deploy, a dropped connection)
// replaced the whole admin with "Application error: a client-side exception
// has occurred". Reproduced 15 Oct 2026 by failing chunks 1427 and 9109.

/** What the boundary draws once `error` has reached it. */
function fallback(error: unknown, name = "visitors"): string {
  const b = new PanelBoundary({ name, children: <p>section</p> })
  b.state = PanelBoundary.getDerivedStateFromError(error)
  return renderToString(<>{b.render()}</>)
}

describe("isChunkError", () => {
  it("knows a chunk a deploy took away", () => {
    const webpack = new Error("Loading chunk 9109 failed.\n(error: https://onemana.dev/_next/static/chunks/9109.f531c774374a0815.js)")
    webpack.name = "ChunkLoadError"
    expect(isChunkError(webpack)).toBe(true)
    expect(isChunkError(new Error("Loading CSS chunk 512 failed."))).toBe(true)
    expect(isChunkError(new TypeError("Failed to fetch dynamically imported module: https://onemana.dev/x.js"))).toBe(true)
    expect(isChunkError(new TypeError("Importing a module script failed."))).toBe(true)
  })

  it("does not mistake an ordinary error for one", () => {
    expect(isChunkError(new TypeError("Cannot read properties of null (reading 'size')"))).toBe(false)
    expect(isChunkError("Loading chunk 1 failed")).toBe(false)
    expect(isChunkError(null)).toBe(false)
  })
})

describe("PanelBoundary", () => {
  it("draws its section, marked, while nothing is wrong", () => {
    const html = renderToString(
      <PanelBoundary name="visitors">
        <p>section</p>
      </PanelBoundary>,
    )
    expect(html).toBe('<div data-panel="visitors"><p>section</p></div>')
  })

  it("asks for a reload when the section's code is gone", () => {
    const chunk = new Error("Loading chunk 9109 failed.")
    chunk.name = "ChunkLoadError"
    const html = fallback(chunk)
    expect(html).toContain('role="alert"')
    expect(html).toContain('data-failed="stale"')
    expect(html).toContain("The site was updated after this page opened.")
    expect(html).toContain(">Reload<")
    // Trying again would ask for the same missing file.
    expect(html).not.toContain("Try again")
  })

  it("names the section and the error otherwise, and offers another go", () => {
    const html = fallback(new TypeError("Cannot read properties of null (reading 'size')"), "workspaces")
    expect(html).toContain('data-failed="error"')
    expect(html).toContain("This part of the admin (workspaces) hit an error.")
    expect(html).toContain("Cannot read properties of null (reading &#x27;size&#x27;)")
    expect(html).toContain(">Try again<")
    expect(html).toContain(">Reload<")
  })

  it("holds a thrown non-Error too", () => {
    expect(fallback("plain string thrown")).toContain("plain string thrown")
  })
})

describe("AdminPanel", () => {
  it("puts every tab's section inside its own boundary", () => {
    for (const tab of ADMIN_TABS) {
      const html = renderToString(<AdminPanel tab={tab} />)
      expect(html, tab).toMatch(new RegExp(`^<div data-panel="${tab}">`))
    }
  })
})
