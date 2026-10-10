import { readFileSync } from "node:fs"
import { join } from "node:path"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { DocsNav } from "@/components/docs/DocsShell"
import { OnThisPageDisclosure } from "@/components/reading/OnThisPageDisclosure"
import { AboutView } from "@/components/site/AboutView"
import { AudienceView } from "@/components/site/AudienceView"
import { CloudPlanCard } from "@/components/site/CloudPlanCard"
import { FactsStrip } from "@/components/site/FactsStrip"
import { Footer } from "@/components/site/Footer"
import { GovernedDemo } from "@/components/site/GovernedDemo"
import { Nav } from "@/components/site/Nav"
import { PlanComparison } from "@/components/site/PlanComparison"
import { ProductTabs } from "@/components/site/ProductTabs"
import { SubscribeForm } from "@/components/site/SubscribeForm"
import { TemplateView } from "@/components/site/TemplateView"
import { Select } from "@/components/ui/Select"
import { alternatives } from "@/lib/alternatives"
import { defaultPricing } from "@/lib/pricing"
import { templates } from "@/lib/templates"

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
  it("the shared standalone-link class is 44 px below sm", () => {
    const css = readFileSync(join(__dirname, "globals.css"), "utf8")
    expect(css).toMatch(/\.tap-target\s*\{\s*@apply inline-flex min-h-11 min-w-11 items-center sm:min-h-0 sm:min-w-0;\s*\}/)
  })

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
    // Wide as well as tall: a one-word link ("Blog") is the column's width.
    for (const c of links.filter((l) => l.includes("text-small"))) expect(c).toMatch(/(^|\s)w-full(\s|$)/)
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
    // /free's Copy, drawn 28 px tall in the command's header, hits 44.
    const free = readFileSync(join(__dirname, "free/FreeInstall.tsx"), "utf8")
    expect(free).toContain("after:absolute after:-inset-2 after:content-['']")
    const buy = readFileSync(join(__dirname, "../app/buy/BuyCheckout.tsx"), "utf8")
    expect(buy.match(/className=\{`min-h-11 rounded-sm px-3/g) ?? []).toHaveLength(2)
    expect(buy).toContain("className={`flex min-h-11 flex-col")
  })

  it("links that stand alone", () => {
    const tabs = renderToString(<ProductTabs />)
    expectTall(classesOf(tabs, /<a[^>]*class="link[^"]*self-start[^"]*"[^>]*>/g), "Open it in the live demo")
    expectTall(classesOf(renderToString(<PlanComparison pricing={defaultPricing} />), /<a[^>]*class="link[^"]*"[^>]*>/g), "plan table links")
    expectTall(classesOf(renderToString(<AudienceView a={alternatives[0]!} pricing={defaultPricing} />), /<a[^>]*href="\/pricing"[^>]*>(?=See every plan)/g), "See every plan")
    const t = renderToString(<TemplateView t={templates[0]!} />)
    expectTall(classesOf(t, /<a[^>]*href="\/templates(\/[a-z-]+)?"[^>]*>/g), "the templates list")
    const about = renderToString(<AboutView />)
    const founder = about.slice(about.indexOf("Akash Hadagali"))
    expectTall(classesOf(founder, /<a[^>]*>(?=GitHub<|X \(Twitter\)<|The blog<)/g), "the founder's links")
    const guide = readFileSync(join(__dirname, "docs/[slug]/page.tsx"), "utf8")
    expect(guide).toContain('<Link href="/docs" className="tap-target')
    const facts = renderToString(<FactsStrip release={null} />)
    expectTall(classesOf(facts, /<a[^>]*>/g), "the facts strip's link")
  })

  it("the docs: every guide in the list, and 'On this page' folded on a phone", () => {
    const nav = renderToString(<DocsNav groups={[{ category: "Setup", items: [{ slug: "a", title: "A" } as never] }]} activeSlug="a" />)
    expectTall(classesOf(nav, /<a[^>]*>/g), "guides list")
    const toc = renderToString(<OnThisPageDisclosure headings={[{ id: "one", text: "One", level: 2 }]} />)
    expectTall(classesOf(toc, /<a[^>]*href="#one"[^>]*>/g), "On this page")
  })
})
