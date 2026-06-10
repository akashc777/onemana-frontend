import type { ReactNode } from "react";

export interface DocsNavItem {
  href: string;
  label: string;
}
export interface DocsNavGroup {
  title: string;
  items: DocsNavItem[];
}

/** Two-column docs layout: sticky sidebar nav + content. Distinct from blog. */
export function DocsShell({ nav, children }: { nav: DocsNavGroup[]; children: ReactNode }) {
  return (
    <div className="container-x flex flex-col gap-10 py-12 lg:flex-row lg:gap-14 lg:py-16">
      <aside className="lg:sticky lg:top-24 lg:h-fit lg:w-64 lg:flex-shrink-0">
        <nav className="rounded-2xl border border-white/10 bg-white/[0.03] p-5" aria-label="Documentation">
          {nav.map((group) => (
            <div key={group.title} className="mb-5 last:mb-0">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{group.title}</h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 pb-16">{children}</div>
    </div>
  );
}
