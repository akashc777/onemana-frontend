"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { OneCampLogo } from "@/components/site/BrandMarks";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useScrollSpy } from "@/hooks/useScrollSpy";

const HOME_SECTIONS = ["tour", "pricing"] as const;

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const activeSection = useScrollSpy([...HOME_SECTIONS], onHome);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (!onHome) return false;
    const hash = href.includes("#") ? href.split("#")[1] : null;
    return hash ? activeSection === hash : false;
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${
        scrolled ? "glass-nav border-border" : "border-border/0 bg-background/80"
      }`}
    >
      <nav className="container-x flex h-14 items-center justify-between" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
          <OneCampLogo className="h-7 w-7 rounded-md" />
          {site.name}
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((l) => {
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative text-sm transition-colors duration-150 ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
                {active && (
                  <span className="nav-active-indicator absolute -bottom-[17px] left-0 right-0 h-0.5 bg-brand" aria-hidden />
                )}
              </Link>
            );
          })}
          <a
            href={site.demoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Live Demo
          </a>
          <ThemeToggle />
          <Link href="/account" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
            Sign in
          </Link>
          <ButtonLink href="/buy" size="sm" variant="brandPremium">
            Get {site.name}
          </ButtonLink>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-md p-2 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container-x flex flex-col gap-0.5 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2.5 text-sm font-medium hover:bg-muted ${
                  isActive(l.href) ? "bg-muted text-foreground" : "text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={site.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Live Demo
            </a>
            <div className="px-2 py-2">
              <ThemeToggle />
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Sign in
            </Link>
            <ButtonLink href="/buy" size="md" variant="brandPremium" className="mt-2 w-full">
              Get {site.name}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}