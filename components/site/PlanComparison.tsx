import Link from "next/link";
import { PLAN_HUE } from "@/components/site/planHues";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";
import type { Pricing } from "@/lib/pricing";
import { PLAN_ROWS, planOptions } from "@/lib/plans";

/**
 * "Which OneCamp is for you": the four ways to have it, compared on the things
 * that actually differ. A table where there is room, one card per option on a
 * phone, from the same data. Each option's name carries its plan's hue, the
 * one its card has above.
 */
export function PlanComparison({ pricing }: { pricing: Pricing }) {
  const plans = planOptions(pricing);
  return (
    <section aria-labelledby="plans-heading" className="container-x py-16 sm:py-20">
      <h2 id="plans-heading" className="text-h2 text-foreground">
        Which OneCamp is for you
      </h2>
      <p className="mt-3 max-w-2xl text-body text-muted-foreground">
        Every option has chat, docs, tasks, calls and AI teammates. They differ in who installs and updates it, how
        many people it covers, the licence, and whether company controls come with it.
      </p>

      <div className="mt-8 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-small">
          <thead>
            <tr>
              <th className="w-36" />
              {plans.map((p) => (
                <th key={p.key} scope="col" className="px-3 pb-3 text-left align-top">
                  <span className="flex items-center gap-2 font-semibold text-foreground">
                    <IdentityMark hue={PLAN_HUE[p.key]} variant="square" />
                    {p.name}
                  </span>
                  <span className="mt-1 block text-caption font-normal text-muted-foreground">{p.summary}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_ROWS.map((row) => (
              <tr key={row.key} className="border-t border-border">
                <th scope="row" className="py-3 pr-3 text-left align-top font-normal text-muted-foreground">
                  {row.label}
                  {row.note && <span className="mt-0.5 block text-caption">{row.note}</span>}
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

      <div className="mt-8 grid gap-8 md:hidden">
        {plans.map((p) => (
          <div key={p.key} className="border-t border-border pt-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <IdentityMark hue={PLAN_HUE[p.key]} variant="square" />
              {p.name}
            </p>
            <p className="mt-1 text-small text-muted-foreground">{p.summary}</p>
            <dl className="mt-3 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1.5 text-small">
              {PLAN_ROWS.map((row) => (
                <div key={row.key} className="contents">
                  <dt className="text-muted-foreground">
                    {row.label}
                    {row.note && <span className="mt-0.5 block text-caption">{row.note}</span>}
                  </dt>
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
  const cls = "link tap-target text-small font-medium";
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
