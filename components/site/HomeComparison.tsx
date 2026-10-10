import Link from "next/link";
import { ProductName } from "@/components/site/ProductName";
import type { ReactNode } from "react";
import { type Pricing } from "@/lib/pricing";
import { PRICES_CHECKED, SEAT_COST_SOURCES, stackYearUsd } from "@/lib/teamCost";
import { Rupees, StackBasis, StackCost } from "@/components/site/RegionalMoney";

/**
 * Facts in rows, four products in columns: the proof that stands in for the
 * customer logos OneCamp does not have yet. OneCamp's column sits on the muted
 * surface, so the eye reads down it first; nothing else on the table is tinted.
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
const COLUMNS = ["OneCamp", "Slack + Notion + Zoom", "Mattermost", "Huly"] as const;

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
      cells: ["Every agent run, with what it did and what it was refused, in a hash-chained log", "Audit logs on top-tier plans (Zoom from Pro)", "Audit logs on Enterprise editions", "Not published"],
    },
    { label: "Guests in a channel", cells: ["Yes", "Yes, on paid plans", "Yes, on Professional and up", "Not published"] },
    { label: "Video calls", cells: ["Yes, on your server", "Yes, in Zoom", "Yes; group calls on paid editions", "Yes"] },
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
  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[44rem] border-collapse text-left text-small">
          <caption className="sr-only">OneCamp compared with Slack, Notion and Zoom together, Mattermost and Huly</caption>
          <thead>
            <tr className="border-b border-border-strong">
              <th scope="col" className="w-[22%] py-3 pr-4 font-medium text-muted-foreground">
                <span className="sr-only">Fact</span>
              </th>
              {COLUMNS.map((c, i) => (
                <th key={c} scope="col" className={`py-3 pr-4 align-bottom font-semibold ${i === 0 ? "rounded-t-md bg-muted pl-4 text-foreground" : "text-muted-foreground"} ${i === 1 ? AFTER_TINT : ""}`}>
                  <ProductName name={c} markId="ocLogoGradHomeTable" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows(pricing).map((r) => (
              <tr key={r.label} className="border-b border-border">
                <th scope="row" className="py-3.5 pr-4 align-top font-normal text-muted-foreground">
                  {r.label}
                  {r.loses && <span className="mt-0.5 block text-caption text-muted-foreground">Where OneCamp loses</span>}
                </th>
                {r.cells.map((cell, i) => (
                  <td key={i} className={`py-3.5 pr-4 align-top ${i === 0 ? "bg-muted pl-4 font-medium text-foreground" : "text-muted-foreground"} ${i === 1 ? AFTER_TINT : ""}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        . The stack is Slack Pro, Notion Plus and Zoom Pro <StackBasis />.{" "}
        <Link href="/compare" className="link">
          The longer comparison
        </Link>
      </p>
    </div>
  );
}
