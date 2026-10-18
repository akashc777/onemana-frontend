import Link from "next/link";
import type { ReactNode } from "react";
import { footerLinks, site } from "@/lib/site";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { AREA, AREAS, type Area } from "@/lib/areas";
import type { CampHue } from "@/lib/campHue";
import { LogoRing } from "@/components/ui/v3";
import { Icon } from "@/components/ui/icons";

/**
 * The camp flag's six segments (site.md S16): the six areas' hues, in the
 * areas' order (lib/areas.ts), so the flag is the key the hero opens with:
 * chat, calls, docs, projects, calendar, tables.
 */
export const FLAG = AREAS.filter((a): a is Exclude<Area, "agents"> => a !== "agents").map((a) => AREA[a].hue as CampHue);

type FooterLink = { label: string; href: string; external?: boolean };

function FooterAnchor({ l, className }: { l: FooterLink; className: string }) {
  return l.external ? (
    <a href={l.href} target="_blank" rel="noreferrer" className={className}>
      {l.label}
    </a>
  ) : (
    <Link href={l.href} className={className}>
      {l.label}
    </Link>
  );
}

function Group({ title, links, children }: { title: string; links: readonly FooterLink[]; children?: ReactNode }) {
  const row = "flex min-h-12 w-full items-center text-body text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-fit sm:text-caption";
  const list = (
    <ul className="m-0 list-none p-0 pb-2 sm:mt-3 sm:space-y-2 sm:pb-0">
      {links.map((l) => (
        <li key={l.label}>
          <FooterAnchor l={l} className={row} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="lg:col-span-2">
      {/* A phone folds each group behind its name (48px), so the footer is
          about one screen, not two; from sm the columns stand open. */}
      <details className="group border-b border-border sm:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-body font-[590] text-foreground [&::-webkit-details-marker]:hidden">
          {title}
          <Icon name="plus" className="text-faint transition-transform duration-pop group-open:rotate-45" />
        </summary>
        {list}
      </details>
      <div className="hidden sm:block">
        <h2 className="font-sans text-caption font-[590] text-foreground">{title}</h2>
        {list}
      </div>
      {children}
    </div>
  );
}

/**
 * The footer (site.md S16): the camp flag across the top, the brand block,
 * four groups of links in ink-2, and the legal line. The flag is the only
 * colour; the close above it hands its hues on. No ring in the corner: a
 * thick grey ring at 10% ink, cropped by the page's edge, was the lone grey
 * ring DESIGN_V3 §3.13 rules out, and read as a loading spinner on every
 * page (design/site-polish/AUDIT.md, D4).
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <div aria-hidden="true" className="flex h-1">
        {FLAG.map((h) => (
          <span key={h} className={`${HUE_CLASS[h]} flex-1 bg-hue`} />
        ))}
      </div>
      <div className="container-x relative">
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pb-10 pt-12 sm:grid-cols-4 sm:gap-y-10 sm:pb-14 sm:pt-16 lg:grid-cols-12 lg:gap-x-8">
          <div className="sm:col-span-4 lg:col-span-4 lg:pr-8">
            <Link href="/" className="flex min-h-11 w-fit items-center gap-2 text-[16px] font-[620] tracking-[-0.015em] text-foreground sm:min-h-0">
              <LogoRing size={22} />
              {site.name}
            </Link>
            <p className="mt-3 max-w-xs text-small text-muted-foreground">
              Chat, docs, tasks and calls on your own server, with AI agents that answer to you.
            </p>
            <p className="mt-4 text-small text-muted-foreground">
              Questions before you buy?{" "}
              <a href="mailto:support@onemana.dev" className="link">
                support@onemana.dev
              </a>
            </p>
          </div>

          <div className="sm:col-span-4 sm:grid sm:grid-cols-4 sm:gap-x-6 lg:col-span-8 lg:grid-cols-8 lg:gap-x-8">
            {Object.entries(footerLinks).map(([group, links]) => (
              <Group key={group} title={group} links={links as readonly FooterLink[]} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-border py-6 text-[12px] leading-4 text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company}
          </p>
          <p>Bengaluru, India · CIN U62013KA2024OPC186285</p>
        </div>
      </div>
    </footer>
  );
}
