"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { ThemeToggle } from "@/components/site/ThemeToggle";

/**
 * The nav: five links, then "Live demo" as a text link and one outline button,
 * "Install free". It used to end in a filled "Get OneCamp" that dropped cold
 * visitors into a GST checkout form; the demo and the free plan are the two
 * ways in that need no money, so they are the two the nav offers.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A link to a page is current on that page; a link to a home-page section never is.
  const current = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav className="container-x flex h-14 items-center justify-between gap-6" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
          <OneCampLogo className="h-6 w-6 rounded-md" />
          {site.name}
        </Link>

        <div className="hidden flex-1 items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={current(l.href) ? "page" : undefined}
              className={`rounded-md px-2.5 py-1.5 text-small transition-colors duration-150 ${
                current(l.href) ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
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

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <div className="container-x flex flex-col py-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={current(l.href) ? "page" : undefined}
                className="border-b border-border py-3 text-body text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/account" onClick={() => setOpen(false)} className="border-b border-border py-3 text-body text-foreground">
              Sign in
            </Link>
            <div className="flex items-center justify-between py-3">
              <span className="text-small text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="grid grid-cols-2 gap-2 pb-3">
              <ButtonLink href={site.demoStartUrl} external variant="brand">
                Live demo
              </ButtonLink>
              <ButtonLink href="/free" variant="ghost">
                Install free
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
