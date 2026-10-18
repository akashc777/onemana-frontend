import Link from "next/link";
import { ProductName } from "@/components/site/ProductName";
import type { ReactNode } from "react";
import { type Pricing } from "@/lib/pricing";
import { PRICES_CHECKED, SEAT_COST_SOURCES, stackYearUsd } from "@/lib/teamCost";
import { Rupees, StackBasis, StackCost } from "@/components/site/RegionalMoney";
import { LogoRing } from "@/components/ui/v3";
import { RAISED_COLUMN, RAISED_ROW } from "@/components/site/planHues";

/**
 * Facts in rows, four products in columns: the proof that stands in for the
 * customer logos OneCamp does not have yet. OneCamp's answers are raised on the
 * licence's tint, as in the plan table (planHues.ts): its column from sm
 * (RAISED_COLUMN) and its line in each card on a phone (RAISED_ROW), so the
 * eye reads them first; nothing else is tinted.
 *
 * It includes a row OneCamp loses (ready-made integrations), on purpose: a
 * table where one column wins everything is an advert, and readers discount it
 * the way they discount adverts. Claims about the others are structural (what
 * exists, how you pay) and come from their own pages, linked under the table.
 * The figures are worked out, never typed: OneCamp's from the live pricing,
 * in rupees because that is the charge; the per-seat stack from its list
 * prices, in dollars (or the reader's currency at the day's rate) outside
 * India and in rupees in India (RegionalMoney).
 *
 * OneCamp's tinted column keeps 16 px inside its edges, and the column after
 * it starts 16 px past the tint, as every column starts 16 px after the one
 * before: it used to start on the tint's edge, its words touching it.
 */
const AFTER_TINT = "pl-4";
/** The lifted column's cells: the licence's raised column (planHues.ts). */
const LIFT = RAISED_COLUMN;

/** The row OneCamp loses, said with a berry chip. */
function LoseChip() {
  return <span className="mt-1 inline-flex h-[22px] items-center rounded-md bg-hover px-2 text-[12px] font-[510] text-muted-foreground shadow-[inset_0_0_0_1px_var(--line-c)] sm:flex sm:w-fit">We lose this one</span>;
}
// The stack is what a buyer stops paying for (lib/teamCost SEAT_COSTS): Zoom
// left it on 16 Oct 2026, with Zoom's place in /compare's cancels list.
const COLUMNS = ["OneCamp", "Slack + Notion", "Mattermost", "Huly"] as const;

type Row = { label: string; cells: [ReactNode, ReactNode, ReactNode, ReactNode]; loses?: boolean };

function rows(p: Pricing): Row[] {
  const stack = stackYearUsd(40, false);
  return [
    { label: "Runs on your own server", cells: ["Yes", "No, their cloud", "Yes", "Yes"] },
    { label: "Source code you can read", cells: ["Yes, AGPL-3.0", "No", "Yes, open core", "Yes"] },
    {
      label: "40 people, first year",
      cells: [
        <>
          <Rupees inr={p.lifetime_inr} /> once, plus your server
        </>,
        stack > 0 ? <StackCost pricing={p} usd={stack} /> : "Per seat, per tool",
        "Free Team edition; paid editions quoted by sales",
        "Free to self-host (EPL-2.0, community-maintained fork)",
      ],
    },
    {
      label: "What limits an AI agent",
      cells: [
        "The asking person's own permissions, checked on every call",
        "Each tool's own AI, in its own cloud",
        "Deployment settings; bring your own model",
        "AI listed as to be decided",
      ],
    },
    {
      label: "Record of what agents did",
      cells: ["Every agent run, with what it did and what it was refused, in a hash-chained log", "Audit logs on top-tier plans", "Audit logs on Enterprise editions", "Not published"],
    },
    { label: "Guests in a channel", cells: ["Yes", "Yes, on paid plans", "Yes, on Professional and up", "Not published"] },
    // Slack Pro includes huddles: audio and video, with screen sharing (slack.com/pricing, read 16 Oct 2026).
    { label: "Video calls", cells: ["Yes, on your server", "Yes, in Slack huddles", "Yes; group calls on paid editions", "Yes"] },
    {
      label: "Ready-made integrations",
      cells: ["A few: Slack, Gmail, Google Calendar, MCP, webhooks", "Thousands", "A plugin marketplace", "GitHub sync and a few more"],
      loses: true,
    },
  ];
}

export function HomeComparison({ pricing }: { pricing: Pricing }) {
  // The two rivals' pages are the same sources /compare cites (lib/compare.ts).
  const sources = [
    ...SEAT_COST_SOURCES,
    { name: "Mattermost", href: "https://mattermost.com/pricing/" },
    { name: "Huly", href: "https://huly.io/pricing" },
  ];
  const all = rows(pricing);
  return (
    <div>
      {/* From sm: the table, with OneCamp's column lifted (site.md S12): the
          raised surface in a hairline frame, standing 8px above and below
          the table, under a 2px brand rule, its header carrying the ring. */}
      <table className="reveal hidden w-full border-collapse text-left text-small sm:table">
        <caption className="sr-only">OneCamp compared with Slack and Notion together, Mattermost and Huly</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[22%] pb-3 pr-4 pt-5 font-[510] text-muted-foreground">
              <span className="sr-only">Fact</span>
            </th>
            {COLUMNS.map((c, i) => (
              <th key={c} scope="col" className={`pb-3 pr-4 align-bottom text-caption font-[510] ${i === 0 ? `${LIFT} rounded-t-xl border-t-2 border-brand pl-4 pt-5 text-foreground` : "pt-5 text-muted-foreground"} ${i === 1 ? AFTER_TINT : ""}`}>
                {i === 0 ? (
                  <span className="text-body font-[590]">
                    <ProductName name={c} />
                  </span>
                ) : (
                  <ProductName name={c} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {all.map((r, ri) => (
            <tr key={r.label} className="group">
              <th scope="row" className="min-h-[52px] border-t border-border py-4 pr-4 align-top font-normal text-muted-foreground">
                {r.label}
                {r.loses && <LoseChip />}
              </th>
              {r.cells.map((cell, i) => (
                <td
                  key={i}
                  className={`py-4 pr-4 align-top ${i === 0 ? `${LIFT} border-t border-border pl-4 font-[510] text-foreground ${ri === all.length - 1 ? "rounded-b-xl pb-6" : ""}` : "border-t border-border text-muted-foreground"} ${i === 1 ? AFTER_TINT : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* A phone: one card per row, OneCamp's answer on the raised line and
          the others in two columns under it. Nothing scrolls sideways. */}
      <ul className="m-0 list-none space-y-3 p-0 sm:hidden">
        {all.map((r) => (
          <li key={r.label} className="rounded-xl bg-card p-4 shadow-e1">
            <p className="m-0 flex flex-wrap items-center gap-2 text-caption font-[510] text-foreground">
              {r.label}
              {r.loses && <LoseChip />}
            </p>
            <p className={`m-0 mt-3 flex gap-2 rounded-lg px-3 py-2 text-small font-[510] text-foreground ${RAISED_ROW}`}>
              <LogoRing size={16} className="mt-0.5 shrink-0" />
              <span className="text-balance">{r.cells[0]}</span>
            </p>
            <dl className="m-0 mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
              {r.cells.slice(1).map((cell, i) => (
                <div key={i}>
                  <dt className="text-[12px] font-[510] leading-4 text-muted-foreground">{COLUMNS[i + 1]}</dt>
                  <dd className="m-0 mt-0.5 text-caption text-muted-foreground">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-caption text-muted-foreground">
        From each product&apos;s own pages, checked {PRICES_CHECKED}:{" "}
        {sources.map((s, i) => (
          <span key={s.name}>
            <a href={s.href} target="_blank" rel="noreferrer" className="underline decoration-border-strong underline-offset-4 hover:text-foreground">
              {s.name}
            </a>
            {i < sources.length - 1 ? ", " : ""}
          </span>
        ))}
        . The stack is Slack Pro and Notion Plus <StackBasis />.{" "}
        <Link href="/compare" className="link">
          The longer comparison
        </Link>
      </p>
    </div>
  );
}
