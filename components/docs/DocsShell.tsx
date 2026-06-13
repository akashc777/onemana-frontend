import type { ReactNode } from "react";
import Link from "next/link";
import type { DocNavGroup } from "@/lib/docs";

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
    <div className="container-x flex flex-col gap-8 py-10 sm:gap-10 sm:py-12 lg:flex-row lg:gap-14 lg:py-16">
      <aside className="lg:sticky lg:top-20 lg:h-fit lg:w-64 lg:flex-shrink-0">
        <nav className="max-h-[min(50vh,20rem)] overflow-y-auto rounded-xl border border-border bg-muted/30 p-4 lg:max-h-none lg:overflow-visible" aria-label="Documentation">
          <Link
            href="/docs"
            className={`mb-4 block text-sm font-medium ${activeSlug ? "text-muted-foreground hover:text-foreground" : "text-foreground"}`}
          >
            Overview
          </Link>
          {groups.map((group) => (
            <div key={group.category} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-xs font-medium text-muted-foreground">{group.category}</h3>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = item.slug === activeSlug;
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-md px-2.5 py-1.5 text-sm transition-colors duration-150 ${
                          active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
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