import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { CloudPlanCard } from "@/components/site/CloudPlanCard"
import { Footer } from "@/components/site/Footer"
import { GovernedDemo } from "@/components/site/GovernedDemo"
import { Nav } from "@/components/site/Nav"
import { ProductTabs } from "@/components/site/ProductTabs"
import { SubscribeForm } from "@/components/site/SubscribeForm"
import { Select } from "@/components/ui/Select"
import { defaultPricing } from "@/lib/pricing"

/**
 * Everything a finger presses on a phone is a 44 px target: the nav, every
 * footer link, the fields and switches, and every link that stands on its
 * own line ("See every plan", the templates list, the guides list). The
 * measured site had footer links 17 px tall, the menu button and fields at
 * 40, the plan switches at 30 and the walkthrough's steps at 24.
 *
 * A link inside a sentence keeps its line (WCAG's inline exception), so this
 * reads the controls that stand alone, by name, in the HTML a phone gets.
 * "Tall" is a class that makes the box 44 px at the base breakpoint:
 * min-h-11, h-11, or the shared .tap-target.
 */
const TALL = /(^|\s)(min-h-11|h-11|w-11 h-11|tap-target)(\s|$)/

/** The class attribute of each opening tag that matches. */
function classesOf(html: string, tag: RegExp): string[] {
  return [...html.matchAll(tag)].map((m) => /class="([^"]*)"/.exec(m[0])?.[1] ?? "")
}

function expectTall(classes: string[], what: string) {
  expect(classes.length, `${what}: none found`).toBeGreaterThan(0)
  for (const c of classes) expect(c, what).toMatch(TALL)
}

describe("a phone's targets", () => {
  it("the nav: the logo, Pricing, the menu button and the theme switch", () => {
    const html = renderToString(<Nav />)
    // The bar a phone shows: from the last lg:hidden block to the menu panel.
    const menuStart = html.indexOf('id="mobile-menu"')
    const phoneBar = html.slice(html.lastIndexOf('lg:hidden"', menuStart), menuStart)
    expectTall(classesOf(html, /<a[^>]*href="\/"[^>]*>/g), "logo")
    expectTall(classesOf(phoneBar, /<a[^>]*href="\/pricing"[^>]*>(?=Pricing)/g), "Pricing")
    expectTall(classesOf(html, /<button[^>]*aria-controls="mobile-menu"[^>]*>/g), "menu button")
    expectTall(classesOf(html, /<button[^>]*type="button"[^>]*class="[^"]*rounded-md text-muted-foreground[^"]*"[^>]*>/g), "theme switch")
  })

  it("every footer link", () => {
    const html = renderToString(<Footer />)
    const links = classesOf(html, /<a [^>]*>/g).filter((c) => !c.includes("link"))
    expectTall(links, "footer links")
  })

  it("fields: the update form's address and a select", () => {
    expectTall(classesOf(renderToString(<SubscribeForm source="t" cta="Go" hint="" />), /<input[^>]*type="email"[^>]*>/g), "email field")
    expectTall(classesOf(renderToString(<Select value="" onChange={() => {}} options={[]} ariaLabel="State" />), /<button[^>]*>/g), "select")
    for (const file of ["../app/buy/BuyCheckout.tsx", "../app/free/FreeInstall.tsx"]) {
      const src = readFileSync(join(__dirname, file), "utf8")
      expect(src, file).toMatch(/const inputCls =\s*"h-11 [^"]*sm:h-10/)
    }
  })

  it("switches: the plan tabs, the Cloud sizes and the walkthrough's controls", () => {
    expectTall(classesOf(renderToString(<ProductTabs />), /<button[^>]*role="tab"[^>]*>/g), "product tabs")
    const onSale = { ...defaultPricing, cloud_yearly_configured: true, business_configured: true }
    expectTall(classesOf(renderToString(<CloudPlanCard pricing={onSale} />), /<button[^>]*role="radio"[^>]*>/g), "Cloud sizes")
    const demo = renderToString(<GovernedDemo />)
    expectTall(classesOf(demo, /<button[^>]*aria-label="Step[^>]*>/g), "walkthrough steps")
    expectTall(classesOf(demo, /<button type="button" class="[^"]*border-border-strong[^"]*"[^>]*>/g), "walkthrough play")
    const buy = readFileSync(join(__dirname, "../app/buy/BuyCheckout.tsx"), "utf8")
    expect(buy.match(/className=\{`min-h-11 rounded-sm px-3/g) ?? []).toHaveLength(3)
  })
})
