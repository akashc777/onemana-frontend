import type { ReactNode } from "react";
import Link from "next/link";
import type { DocNavGroup } from "@/lib/docs";
import { DocsSearch } from "./DocsSearch";
import { ActiveInView } from "./ActiveInView";
import { DocsGroupDot } from "./DocsGroupMark";
import { Icon } from "@/components/ui/icons";
import { ix } from "@/lib/interactive";

/**
 * Every guide, grouped, with the open one marked. The same list sits in the
 * sidebar on a wide screen and in "Browse the docs" on a narrow one.
 */
export function DocsNav({ groups, activeSlug }: { groups: DocNavGroup[]; activeSlug?: string }) {
  return (
    // Text lines up with the search field and the page's edge; the hover and
    // the current guide's background reach 10 px past it.
    <nav aria-label="Docs" className="-mx-2.5 text-small">
      {/* Nav rows of the interaction layer: the accent's tint under the
          pointer, and the open guide the raised chip at 510, its width held
          (storefront audit D4). */}
      <Link
        href="/docs"
        aria-current={activeSlug ? undefined : "page"}
        {...ix("nav")}
        className="mb-4 flex min-h-11 items-center rounded-md px-2.5 text-muted-foreground lg:min-h-8"
      >
        <span data-label="All guides">All guides</span>
      </Link>
      {groups.map((group) => (
        <div key={group.category} className="mb-5 last:mb-0">
          <p className="mb-1 flex items-center gap-2 px-2.5 text-caption font-medium text-muted-foreground">
            <DocsGroupDot category={group.category} />
            {group.category}
          </p>
          <ul className="space-y-px">
            {group.items.map((item) => {
              const active = item.slug === activeSlug;
              return (
                <li key={item.slug}>
                  <Link
                    href={`/docs/${item.slug}`}
                    aria-current={active ? "page" : undefined}
                    {...ix("nav")}
                    className="flex min-h-11 items-center text-balance rounded-md px-2.5 py-1 leading-5 text-muted-foreground lg:min-h-8"
                  >
                    <span data-label={item.title}>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * The docs' frame. On a wide screen: the guides on the left in a column that
 * scrolls on its own (so the last guide is reachable on a long page), the
 * article in the middle at a reading measure, and "On this page" on the right.
 * On a narrow one the guides fold into "Browse the docs" above the article.
 * The columns sit inside the site's 1120 px container, so the sidebar's left
 * edge is the logo's.
 */
export function DocsShell({
  groups,
  activeSlug,
  aside,
  children,
}: {
  groups: DocNavGroup[];
  activeSlug: string;
  /** Beside the article on an extra-wide screen: "On this page". */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`container-x lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:gap-x-10 ${
        aside ? "xl:grid-cols-[13.5rem_minmax(0,36rem)_minmax(0,1fr)]" : ""
      }`}
    >
      {/* The key closes the menu when a guide is chosen from it: the page
          re-renders with the same structure, and a <details> keeps "open". */}
      <details key={activeSlug} className="group border-b border-border lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-small font-medium text-foreground [&::-webkit-details-marker]:hidden">
          Browse the docs
          <Icon name="chevron-down" className="text-muted-foreground transition-transform group-open:rotate-180" />
        </summary>
        <div className="pb-5">
          <DocsSearch className="mb-5" />
          <DocsNav groups={groups} activeSlug={activeSlug} />
        </div>
      </details>

      {/* The search stays put and only the list scrolls, so the search's
          results can open over the article instead of inside the list. */}
      <aside className="hidden lg:sticky lg:top-14 lg:flex lg:h-[calc(100dvh-3.5rem)] lg:flex-col lg:pt-10">
        <DocsSearch className="mb-4 flex-none" />
        <div id="docs-nav" className="-mx-2.5 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-10 pt-2">
          <DocsNav groups={groups} activeSlug={activeSlug} />
        </div>
        <ActiveInView containerId="docs-nav" />
      </aside>

      <div className="min-w-0 pb-24 pt-8 lg:pt-10">{children}</div>

      {aside ? (
        <div className="hidden xl:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain pb-10 pl-2 pt-10">{aside}</div>
        </div>
      ) : null}
    </div>
  );
}

/** The guide before and after this one, in the sidebar's order. */
export function DocsPager({
  prev,
  next,
}: {
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
}) {
  if (!prev && !next) return null;
  const card = "group flex min-h-[4.5rem] flex-col justify-start rounded-xl bg-card px-4 py-3 shadow-e1";
  return (
    <nav aria-label="More guides" className="mt-14 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={`/docs/${prev.slug}`} rel="prev" {...ix("card")} className={card}>
          <span className="text-[12px] font-[510] leading-4 text-muted-foreground">Previous</span>
          <span className="mt-1 text-body font-[590] text-foreground">{prev.title}</span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link href={`/docs/${next.slug}`} rel="next" {...ix("card")} className={`${card} sm:items-end sm:text-right`}>
          <span className="text-[12px] font-[510] leading-4 text-muted-foreground">Next</span>
          <span className="mt-1 text-body font-[590] text-foreground">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
