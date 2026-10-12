"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icons";

/**
 * The two parts of the nav that need the browser: which page is current, and
 * the phone menu's open state. Everything else in the nav is drawn on the
 * server (components/site/Nav.tsx).
 */

const LOOKS = {
  /** A link in the desktop bar: ink-2, the hover overlay, and the current page in ink with a brand mark under it (globals.css .nav-link). */
  bar: {
    base: "nav-link rounded-md px-2.5 py-1.5 text-small",
    current: "",
    other: "",
  },
  /** A 48px row in the phone menu, 16/510. */
  menu: {
    base: "flex min-h-12 items-center border-b border-border text-body font-[510] transition-colors",
    current: "text-foreground",
    other: "text-foreground/90 hover:text-foreground",
  },
  /** Pricing, beside the menu button on a phone. */
  compact: {
    base: "nav-link inline-flex min-h-11 items-center rounded-md px-2.5 text-small",
    current: "",
    other: "",
  },
} as const;

/**
 * The header: transparent at the top of the page, and once the page has
 * moved 40px the page at 85% under a blur with a hairline (globals.css
 * .nav-bar[data-scrolled]). The blur is a class toggle, never there at the top.
 */
export function NavBar({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header data-scrolled={scrolled ? "" : undefined} className="nav-bar sticky top-0 z-50">
      {children}
    </header>
  );
}

/**
 * A nav link that knows whether it is the page you are on. A link to a page is
 * current on that page and its children; a link to a home-page section never
 * is. Current is said in weight as well as colour, not colour alone.
 */
export function NavLink({ href, look = "bar", children }: { href: string; look?: keyof typeof LOOKS; children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const current = !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  const l = LOOKS[look];
  return (
    <Link href={href} aria-current={current ? "page" : undefined} className={`${l.base} ${current ? l.current : l.other}`}>
      {children}
    </Link>
  );
}

/**
 * The phone menu: a button and a panel that fills the screen under the
 * header, so opening it does not push the page down, and the page under it
 * holds still while it is open (it used to float as a card over a page that
 * still scrolled behind it). The panel's contents come from the server as
 * children. It closes on a link, on another page, on Escape (focus goes back
 * to the button) and on a tap outside the header.
 */
export function MobileMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      const header = button.current?.closest("header");
      if (header && !header.contains(e.target as Node)) setOpen(false);
    };
    // The page holds still under the open menu. Where the browser draws a
    // scrollbar that takes room, its width is given back as padding, so the
    // header does not jump sideways as the scrollbar goes.
    const root = document.documentElement;
    const was = { overflow: root.style.overflow, paddingRight: root.style.paddingRight };
    const bar = window.innerWidth - root.clientWidth;
    root.style.overflow = "hidden";
    if (bar > 0) root.style.paddingRight = `${bar}px`;
    // The menu exists only under lg: a tablet turned to landscape, or a window
    // made wider, closes it, or the page would stay held with no menu shown.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = was.overflow;
      root.style.paddingRight = was.paddingRight;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="-mr-2.5 inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name={open ? "close" : "menu"} size={20} />
      </button>
      {/* A link inside closes it, including one to a section of this page,
          which changes no pathname. */}
      <div
        id="mobile-menu"
        hidden={!open}
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
        className="fx-slide absolute inset-x-0 top-full h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain bg-background shadow-[inset_0_1px_0_var(--line-c)] lg:hidden"
      >
        {children}
      </div>
    </>
  );
}
