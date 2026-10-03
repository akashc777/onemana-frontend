import { dual, type Pricing } from "@/lib/pricing";
import { FREE_SEATS } from "@/lib/freePlan";
import { site } from "@/lib/site";

/**
 * The four ways to have OneCamp, side by side, in words a buyer uses.
 *
 * Every option has the product: chat, docs, tasks, calls and AI teammates. They
 * differ in who installs and updates it, how many people it covers, the licence
 * terms, and (since 3 Oct 2026) the company controls, which the free licence
 * leaves out. Those are the rows.
 * Prices and seat counts come from the live pricing (never typed here), and the
 * free plan's size from FREE_SEATS, so this table cannot disagree with checkout.
 */
export interface PlanOption {
  key: "source" | "free" | "lifetime" | "cloud";
  name: string;
  summary: string;
  price: string;
  runs: string;
  people: string;
  install: string;
  updates: string;
  licence: string;
  help: string;
  /** SSO, LDAP, SCIM and audit export: what the free licence leaves out. */
  controls: string;
  cta: { label: string; href: string; external?: boolean };
}

export const PLAN_ROWS: { key: keyof Omit<PlanOption, "key" | "name" | "summary" | "cta">; label: string }[] = [
  { key: "price", label: "Price" },
  { key: "runs", label: "Who runs it" },
  { key: "people", label: "People" },
  { key: "install", label: "Install" },
  { key: "updates", label: "Updates" },
  { key: "licence", label: "Licence" },
  { key: "controls", label: "Company controls (SSO, LDAP, SCIM, audit export)" },
  { key: "help", label: "Help" },
];

export function planOptions(p: Pricing): PlanOption[] {
  const cloudPeople = p.business_configured
    ? `${p.cloud_seats} (Team) or ${p.business_seats} (Business)`
    : `Up to ${p.cloud_seats}`;
  return [
    {
      key: "source",
      name: "Open source",
      summary: "The code, free for any number of people. You build and run it.",
      price: "Free",
      runs: "You, built from GitHub",
      people: "Unlimited",
      install: "Build it yourself with Docker",
      updates: "Pull and rebuild",
      licence: "AGPL-3.0: share your changes if you offer them to others",
      controls: "Included",
      help: "Community, on GitHub",
      cta: { label: "View on GitHub", href: site.serverGithubUrl, external: true },
    },
    {
      key: "free",
      name: "Free licence",
      summary: `The ready-made release with a one-command installer, for teams of up to ${FREE_SEATS}.`,
      price: "Free",
      runs: "You, from our official release",
      people: `Up to ${FREE_SEATS}`,
      install: "One command",
      updates: "One command",
      licence: "AGPL-3.0",
      controls: "Not included",
      help: "Community",
      cta: { label: "Get a free key", href: "/free" },
    },
    {
      key: "lifetime",
      name: "Lifetime licence",
      summary: "The ready-made release for any number of people, under a commercial licence. Pay once.",
      price: `${dual(p.lifetime_usd, p.lifetime_inr)} once`,
      runs: "You, from our official release",
      people: "Unlimited",
      install: "One command",
      updates: "One command, free within your major version",
      licence: "Commercial: no AGPL obligations",
      controls: "Included",
      help: "Email support",
      cta: { label: "Buy once", href: "/buy?plan=lifetime" },
    },
    {
      key: "cloud",
      name: "OneCamp Cloud",
      summary: "We run it for you on a server of your own, with backups and updates.",
      price: `From ${dual(p.cloud_usd, p.cloud_inr, "/mo")}`,
      runs: "We do",
      people: cloudPeople,
      install: "Nothing to install",
      updates: "Automatic",
      licence: "Commercial, and a self-host licence is included",
      controls: "Included",
      help: "Email support",
      cta: { label: "Start with Cloud", href: "/buy?plan=cloud" },
    },
  ];
}
