import Link from "next/link";
import { footerLinks, site } from "@/lib/site";
import { OneCampLogo } from "@/components/site/BrandMarks";

/**
 * A plain footer: the mark, one line about the product, a way to reach a
 * person, and four groups of links. It was six columns, the "link farm" the
 * redesign skill names; the policies now sit with the company that wrote them.
 */
export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pb-14 pt-16 sm:grid-cols-4 lg:grid-cols-12 lg:gap-x-8">
          <div className="col-span-2 sm:col-span-4 lg:col-span-4 lg:pr-8">
            <Link href="/" className="flex w-fit min-h-11 items-center gap-2 text-sm font-semibold text-foreground sm:min-h-0">
              <OneCampLogo className="h-6 w-6" />
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

          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="lg:col-span-2">
              <h2 className="font-sans text-small font-medium tracking-normal text-foreground">{group}</h2>
              <ul className="mt-1 sm:mt-3 sm:space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-h-11 w-full items-center text-small text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-fit"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="flex min-h-11 w-full items-center text-small text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-fit">
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
