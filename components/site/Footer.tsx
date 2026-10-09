import Link from "next/link";
import { footerLinks, site } from "@/lib/site";
import { OneCampLogo } from "@/components/site/BrandMarks";

/** A plain footer: the mark, one line about the product, and the links in columns. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-foreground">
              <OneCampLogo className="h-6 w-6 rounded-md" />
              {site.name}
            </Link>
            <p className="mt-3 max-w-xs text-small text-muted-foreground">
              Chat, docs, tasks and calls on your own server, with AI agents that answer to you.
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h2 className="font-sans text-small font-medium tracking-normal text-foreground">{group}</h2>
              <ul className="mt-3 space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-small text-muted-foreground transition-colors duration-150 hover:text-foreground"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-small text-muted-foreground transition-colors duration-150 hover:text-foreground">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-border py-6 text-caption text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.company}
          </p>
          <p>Bengaluru, India · CIN U62013KA2024OPC186285</p>
        </div>
      </div>
    </footer>
  );
}
