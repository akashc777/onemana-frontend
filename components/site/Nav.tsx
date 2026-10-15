import Link from "next/link";
import { navLinks, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { LogoRing } from "@/components/ui/v3";
import { ThemeToggle, ThemeSegments } from "@/components/site/ThemeToggle";
import { MobileMenu, NavBar, NavLink } from "@/components/site/NavParts";
import { NewTabMark } from "@/components/ui/icons";
import { ix } from "@/lib/interactive";

/**
 * The nav (design v3, site.md S1): 64px, transparent at the top and the page
 * under a blur once you scroll. The gradient ring and "OneCamp", five links,
 * then the theme, Sign in, "Live demo" as a text link and one secondary
 * button, "Install free". The demo and the free plan are the two ways in that
 * need no money, so they are the two the nav offers; nothing in it is filled
 * in the brand.
 *
 * Drawn on the server. Only the scroll state (NavBar), the current-page mark
 * (NavLink) and the phone menu's open state (MobileMenu) are client parts.
 * On a phone, Pricing stays beside the menu button, so the way to buy is one
 * tap from every page.
 */
export function Nav() {
  return (
    <NavBar>
      <nav className="container-x flex h-14 items-center justify-between gap-6 lg:h-16" aria-label="Primary">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-[16px] font-[620] tracking-[-0.015em] text-foreground">
          <LogoRing size={24} />
          {site.name}
        </Link>

        <div className="hidden flex-1 items-center gap-0.5 lg:flex">
          {navLinks.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-0.5 lg:flex">
          <ThemeToggle />
          {/* Marked as the page you are on, on /account, as it is in the phone menu. */}
          <NavLink href="/account">Sign in</NavLink>
          {/* It leaves the site in a new tab, and says so (storefront audit G4). */}
          <a href={site.demoStartUrl} target="_blank" rel="noreferrer" {...ix("tab")} className="nav-link inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-small [@media(pointer:coarse)]:min-h-11">
            Live demo
            <NewTabMark />
          </a>
          <ButtonLink href="/free" size="md" variant="ghost" className="ml-2">
            Install free
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <NavLink href="/pricing" look="compact">
            Pricing
          </NavLink>
          <MobileMenu>
            {/* Nav rows, the current page on the raised chip, then the theme
                under a hairline, then the two ways in. */}
            <div className="container-x flex flex-col gap-0.5 pb-5 pt-2">
              {navLinks.map((l) => (
                <NavLink key={l.href} href={l.href} look="menu">
                  {l.label}
                </NavLink>
              ))}
              <NavLink href="/account" look="menu">
                Sign in
              </NavLink>
              <div className="mt-2 flex min-h-14 items-center justify-between border-t border-border pt-2">
                <span className="text-body font-[510] text-foreground">Theme</span>
                <ThemeSegments />
              </div>
              <div className="mt-5 grid gap-2">
                <ButtonLink href={site.demoStartUrl} external variant="brand" size="xl" arrow>
                  Try the live demo
                </ButtonLink>
                <ButtonLink href="/free" variant="ghost" size="xl">
                  Install free
                </ButtonLink>
              </div>
            </div>
          </MobileMenu>
        </div>
      </nav>
    </NavBar>
  );
}
