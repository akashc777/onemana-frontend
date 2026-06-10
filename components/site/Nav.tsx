"use client";

import Link from "next/link";
import { useState } from "react";
import { navLinks, site } from "@/lib/site";

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">◎</span>
          {site.name}
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-ink">
              {l.label}
            </Link>
          ))}
          <a href={site.demoUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-slate-600 hover:text-ink">
            Live Demo
          </a>
          <Link href="/buy" className="btn-primary px-4 py-2">
            Get {site.name}
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                {l.label}
              </Link>
            ))}
            <a href={site.demoUrl} target="_blank" rel="noreferrer" className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Live Demo
            </a>
            <Link href="/buy" onClick={() => setOpen(false)} className="btn-primary mt-1">
              Get {site.name}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
