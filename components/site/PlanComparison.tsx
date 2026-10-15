import Link from "next/link";
import type { ReactNode } from "react";
import { PLAN_HUE, RAISED_COLUMN } from "@/components/site/planHues";
import { PriceText } from "@/components/site/RegionalMoney";
import { Section, SectionHeading } from "@/components/ui/Section";
import { buttonClasses } from "@/components/ui/Button";
import { Dot } from "@/components/ui/v3";
import type { Pricing } from "@/lib/pricing";
import { PLAN_ROWS, planOptions, type PlanOption, type PlanRowKey } from "@/lib/plans";

/** The lifted column's cells: the licence's raised column (planHues.ts). */
const LIFT = RAISED_COLUMN;

/**
 * "Which OneCamp is for you" (site.md P3): the four ways to have it,
 * compared on the things that actually differ. From md a table with the
 * licence's column lifted under a 2px brand rule, each option's header a
 * hue dot, its name and one line, and buttons on the last row (the licence
 * the one primary). On a phone, one card per option with its rows as a
 * definition list, from the same data, so nothing scrolls sideways.
 */
export function PlanComparison({ pricing }: { pricing: Pricing }) {
  const plans = planOptions(pricing);
  return (
    <Section divider labelledBy="plans-heading">
      <SectionHeading
        id="plans-heading"
        title="Which OneCamp is for you"
        subtitle="Every option has chat, docs, tasks, calls and AI teammates. They differ in who installs and updates it, how many people it covers, the licence, and whether company controls come with it."
      />

      <table className="reveal mt-10 hidden w-full border-collapse text-small md:table">
        <thead>
          <tr>
            <th className="w-36" />
            {plans.map((p) => (
              <th key={p.key} scope="col" className={`px-4 pb-4 pt-5 text-left align-top ${p.key === "lifetime" ? `${LIFT} rounded-t-xl border-t-2 border-brand` : ""}`}>
                <span data-hue={PLAN_HUE[p.key]} className="flex items-center gap-2 text-body font-[590] text-foreground">
                  <Dot hue={PLAN_HUE[p.key]} />
                  {p.name}
                </span>
                <span className="mt-1 block text-caption font-normal text-muted-foreground">{p.summary}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PLAN_ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="border-t border-border py-4 pr-3 text-left align-top font-normal text-muted-foreground">
                {row.label}
                {row.note && <span className="mt-0.5 block text-caption">{row.note}</span>}
              </th>
              {plans.map((p) => (
                <td key={p.key} className={`border-t border-border px-4 py-4 align-top text-foreground ${p.key === "lifetime" ? `${LIFT} font-[510]` : ""}`}>
                  {cell(p, row.key, pricing)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td />
            {plans.map((p) => (
              <td key={p.key} className={`px-4 pb-6 pt-4 ${p.key === "lifetime" ? `${LIFT} rounded-b-xl` : ""}`}>
                <PlanButton cta={p.cta} primary={p.key === "lifetime"} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="mt-8 grid gap-4 md:hidden">
        {plans.map((p) => (
          <div key={p.key} className={`rounded-2xl bg-card p-5 ${p.key === "lifetime" ? "shadow-e3 ring-1 ring-brand/45" : "shadow-e1"}`}>
            <p data-hue={PLAN_HUE[p.key]} className="m-0 flex items-center gap-2 text-body font-[590] text-foreground">
              <Dot hue={PLAN_HUE[p.key]} />
              {p.name}
            </p>
            <p className="mt-1 text-small text-muted-foreground">{p.summary}</p>
            <dl className="mt-4 grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2 border-t border-border pt-4 text-small">
              {PLAN_ROWS.map((row) => (
                <div key={row.key} className="contents">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="m-0 text-foreground">{cell(p, row.key, pricing)}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <PlanButton cta={p.cta} primary={p.key === "lifetime"} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/**
 * What a row says for a plan. A price is written with the reader's estimate
 * beside it, the cards' own (RegionalMoney PriceText); every other row as
 * lib/plans words it.
 */
function cell(p: PlanOption, key: PlanRowKey, pricing: Pricing): ReactNode {
  if (key !== "price") return p[key];
  return typeof p.price === "string" ? p.price : <PriceText pricing={pricing} {...p.price} />;
}

function PlanButton({ cta, primary }: { cta: { label: string; href: string; external?: boolean }; primary: boolean }) {
  const cls = buttonClasses(primary ? "brand" : "ghost", "lg", "w-full");
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
