import Link from "next/link";
import { footerLinks, site } from "@/lib/site";
import { OneCampLogo, OneManaLogo } from "@/components/site/BrandMarks";

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/10">
      <div className="container-x grid grid-cols-2 gap-8 py-14 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <OneCampLogo className="h-7 w-7" />
            {site.name}
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            The self-hosted, all-in-one workspace for the AI era. Your data, your server - own it forever or let us manage it.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <OneManaLogo className="h-5 w-5" />
            <span>A product by {site.company}</span>
          </div>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{group}</h4>
            <ul className="mt-3 space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.company}. All rights reserved.</p>
          <p>Bengaluru, India · CIN U62013KA2024OPC186285</p>
        </div>
      </div>
    </footer>
  );
}
