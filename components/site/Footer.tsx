import Link from "next/link";
import { footerLinks, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-slate-50/60">
      <div className="container-x grid grid-cols-2 gap-8 py-12 md:grid-cols-5">
        <div className="col-span-2">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-white">◎</span>
            {site.name}
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            The self-hosted, all-in-one workspace for the AI era. Your data, your server, one-time payment.
          </p>
        </div>

        {Object.entries(footerLinks).map(([group, links]) => (
          <div key={group}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</h4>
            <ul className="mt-3 space-y-2">
              {links.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="text-sm text-slate-600 hover:text-ink">
                      {l.label}
                    </a>
                  ) : (
                    <Link href={l.href} className="text-sm text-slate-600 hover:text-ink">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-400 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.company}. All rights reserved.</p>
          <p>Bengaluru, India · CIN U62013KA2024OPC186285</p>
        </div>
      </div>
    </footer>
  );
}
