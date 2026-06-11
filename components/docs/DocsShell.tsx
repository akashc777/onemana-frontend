import type { ReactNode } from "react";
import Link from "next/link";
import type { DocNavGroup } from "@/lib/docs";

/**
 * Two-column docs layout: a sticky, category-grouped sidebar of doc links and
 * the content area. The active doc is highlighted. Distinct from the blog
 * layout. Server component.
 */
export function DocsShell({
  groups,
  activeSlug,
  children,
}: {
  groups: DocNavGroup[];
  activeSlug?: string;
  children: ReactNode;
}) {
  return (
    <div className="container-x flex flex-col gap-10 py-12 lg:flex-row lg:gap-14 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:flex-shrink-0">
        <nav className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-label="Documentation">
          <Link href="/docs" className={`mb-4 block text-sm font-semibold ${activeSlug ? "text-slate-400 hover:text-white" : "text-white"}`}>
            Overview
          </Link>
          {groups.map((group) => (
            <div key={group.category} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.category}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = item.slug === activeSlug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                          active ? "bg-brand/15 text-brand-light" : "text-slate-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 pb-16">{children}</div>
    </div>
  );
}
