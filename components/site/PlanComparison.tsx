import Link from "next/link";
import type { Pricing } from "@/lib/pricing";
import { PLAN_ROWS, planOptions } from "@/lib/plans";

/**
 * "Which OneCamp is for you": the four ways to have it, compared on the things
 * that actually differ. A table where there is room, one card per option on a
 * phone, from the same data.
 */
export function PlanComparison({ pricing }: { pricing: Pricing }) {
  const plans = planOptions(pricing);
  return (
    <section aria-labelledby="plans-heading" className="container-x py-12 sm:py-16">
      <h2 id="plans-heading" className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
        Which OneCamp is for you
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every option has chat, docs, tasks, calls and AI teammates. They differ in who installs and updates it, how
        many people it covers, the licence, and whether company controls come with it.
      </p>

      <div className="mt-8 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36" />
              {plans.map((p) => (
                <th key={p.key} scope="col" className="px-3 pb-3 text-left align-top">
                  <span className="block font-semibold text-foreground">{p.name}</span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">{p.summary}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <th scope="row" className="py-3 pr-3 text-left font-medium text-muted-foreground">
                  {row.label}
                </th>
                {plans.map((p) => (
                  <td key={p.key} className="px-3 py-3 align-top text-foreground">
                    {p[row.key]}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td />
              {plans.map((p) => (
                <td key={p.key} className="px-3 pt-4">
                  <PlanLink cta={p.cta} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:hidden">
        {plans.map((p) => (
          <div key={p.key} className="card">
            <p className="font-semibold text-foreground">{p.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
            <dl className="mt-3 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1.5 text-sm">
              {PLAN_ROWS.map((row) => (
                <div key={row.key} className="contents">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="text-foreground">{p[row.key]}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4">
              <PlanLink cta={p.cta} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanLink({ cta }: { cta: { label: string; href: string; external?: boolean } }) {
  const cls = "text-sm font-medium text-brand underline underline-offset-4";
  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {cta.label}
    </a>
  ) : (
    <Link href={cta.href} className={cls}>
      {cta.label}
    </Link>
  );
}
