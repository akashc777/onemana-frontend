import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { MobileMenu, NavLink } from "@/components/site/NavParts";

/**
 * The nav: five links, then "Live demo" as a text link and one outline button,
 * "Install free". It used to end in a filled "Get OneCamp" that dropped cold
 * visitors into a GST checkout form; the demo and the free plan are the two
 * ways in that need no money, so they are the two the nav offers.
 *
 * Drawn on the server. Only the current-page mark (NavLink) and the phone
 * menu's open state (MobileMenu) are client parts. On a phone, Pricing stays
 * beside the menu button, so the way to buy is one tap from every page.
 */
export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav className="container-x flex h-14 items-center justify-between gap-6" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
          <OneCampLogo className="h-6 w-6 rounded-md" />
          {site.name}
        </Link>

        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          <ThemeToggle />
          <Link href="/account" className="rounded-md px-2.5 py-1.5 text-small text-muted-foreground transition-colors duration-150 hover:text-foreground">
            Sign in
          </Link>
          <a
            href={site.demoStartUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-2.5 py-1.5 text-small font-medium text-foreground transition-colors duration-150 hover:text-brand-ink"
          >
            Live demo
          </a>
          <ButtonLink href="/free" size="sm" variant="ghost" className="ml-1">
            Install free
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <NavLink href="/pricing" look="compact">
            Pricing
          </NavLink>
          <MobileMenu>
            <div className="container-x flex flex-col pb-4 pt-1">
              {navLinks.map((l) => (
                <NavLink key={l.href} href={l.href} look="menu">
                  {l.label}
                </NavLink>
              ))}
              <NavLink href="/account" look="menu">
                Sign in
              </NavLink>
              <div className="flex min-h-12 items-center justify-between border-b border-border">
                <span className="text-small text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <ButtonLink href={site.demoStartUrl} external variant="brand">
                  Live demo
                </ButtonLink>
                <ButtonLink href="/free" variant="ghost">
                  Install free
                </ButtonLink>
              </div>
            </div>
          </MobileMenu>
        </div>
      </nav>
    </header>
  );
}
