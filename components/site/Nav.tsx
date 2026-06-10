"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { GitHubStars } from "@/components/site/GitHubStars";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-white/10 bg-canvas/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between" aria-label="Primary">
        <Link href="/" className="flex items-center gap-2 font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent-cyan text-white">◎</span>
          {site.name}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
          <a href={site.demoUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
            Live Demo
          </a>
          <GitHubStars compact />
          <ButtonLink href="/buy" size="sm">
            Get {site.name}
          </ButtonLink>
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-lg p-2 text-slate-300 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-canvas/95 backdrop-blur-xl md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={site.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Live Demo
            </a>
            <div className="px-2 py-2">
              <GitHubStars />
            </div>
            <ButtonLink href="/buy" size="md" className="mt-2 w-full">
              Get {site.name}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
