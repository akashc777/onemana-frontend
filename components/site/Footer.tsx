import Link from "next/link";
import { footerLinks, site } from "@/lib/site";
import { OneCampLogo, OneManaLogo } from "@/components/site/BrandMarks";

export function Footer() {
  return (
    <footer className="relative mt-4 overflow-hidden bg-muted/40 sm:mt-8">
      <div aria-hidden className="cf-footer-grid pointer-events-none absolute inset-0" />
      <div className="container-x relative">
        <div className="section-divider" role="separator" aria-hidden />
        <div className="grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2.5 font-semibold text-foreground">
                <OneCampLogo className="h-7 w-7 rounded-md" />
                {site.name}
              </div>
              <span className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                v{site.version}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The self-hosted, all-in-one workspace. Chat, tasks, docs, video, calendar, and local AI on your server.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <OneManaLogo className="h-5 w-5 rounded" />
              <span>A product by {site.company}</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground">
                {group}
              </h4>
              <ul className="mt-3 space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-muted-foreground transition-colors duration-150 hover:text-brand"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground transition-colors duration-150 hover:text-brand"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider" role="separator" aria-hidden />
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {site.company}. All rights reserved.</p>
          <p>Bengaluru, India · CIN U62013KA2024OPC186285</p>
        </div>
      </div>
    </footer>
  );
}