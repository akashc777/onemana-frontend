import type { Pricing } from "@/lib/pricing";
import { FREE_SEATS } from "@/lib/freePlan";

/**
 * One name per plan and one word for its button, read by every page that
 * sells a plan: the cards, the plan table, the rival and audience pages, the
 * checkout, the payment window and the account page (9 Nov 2026). A buyer met
 * the licence under four names and Cloud's button under three, page by page.
 * Code names (`lifetime`, `lifetime_inr`) and plan codes are not copy and
 * stay as they are.
 */
export const PLAN = {
  free: { name: "Free", cta: "Install free", href: "/free" },
  licence: { name: "Licence", cta: "Buy the licence", href: "/buy" },
  cloud: { name: "Cloud", cta: "Start Cloud", href: "/buy?plan=cloud" },
} as const;

/** Cloud's two sizes, by name. */
export const CLOUD_SIZE = { team: "Cloud Team", business: "Cloud Business" } as const;

/**
 * Cloud's three choices (lib/cloudLinks Billing), by name, wherever a buyer
 * picks one: the Cloud card on /pricing and the checkout, at every width,
 * under the group name CLOUD_CHOICE_GROUP. lib/paymentTerms choiceLabel
 * puts what each adds under it, in people. There were three sets: "Team
 * monthly", "Monthly" on a phone, and "Team (30 users)" on the checkout.
 */
export const CLOUD_CHOICE = { monthly: "Team monthly", yearly: "Team yearly", business: "Business" } as const;
export const CLOUD_CHOICE_GROUP = "Cloud plan";

/**
 * How many people a plan takes, said one way wherever a buyer reads it, in
 * people (never users or seats). The licence takes any number. A Cloud
 * plan's number is the people its machine is sized for: nobody past it is
 * turned away and nothing is charged per person, so it is not a cap. "100
 * users" for Business beside "Unlimited users" for the licence read as one.
 */
export const PEOPLE = {
  licence: "Any number of people",
  cloud: (n: number) => `sized for ${n} people`,
} as const;

/**
 * The three plans, side by side, in words a buyer uses.
 *
 * Every plan has the product: chat, docs, tasks, calls and AI teammates. They
 * differ in who installs and updates it, how many people it covers, the licence
 * terms, and (since 3 Oct 2026) the company controls, which the free licence
 * leaves out. Those are the rows.
 * Prices and seat counts come from the live pricing (never typed here), and the
 * free plan's size from FREE_SEATS, so this table cannot disagree with checkout.
 *
 * Building the server from source is not a plan here (9 Nov 2026). As a
 * column it read "free, unlimited people, company controls included" beside
 * the plans that cost money, and it was drawn under the pay button on /buy:
 * the page argued against paying at the moment of paying. It is how the code
 * is licensed, and /open-source says so; the table links there once.
 */
export interface PlanOption {
  key: "free" | "lifetime" | "cloud";
  name: string;
  summary: string;
  price: PlanPrice;
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

/**
 * A plan's price: words ("Free"), or rupees the page writes in the reader's
 * own money with the rupee charge beside it (lib/pricing displayPrice). Not
 * a finished string, because the reader's money is only known in the
 * browser.
 */
export type PlanPrice = string | { inr: number; per?: string; lead?: string };

/** A row of the comparison: every part of a plan but its name, summary and button. */
export type PlanRowKey = keyof Omit<PlanOption, "key" | "name" | "summary" | "cta">;

/**
 * The rows the plans are compared on. A label is short enough for its column
 * on one line; what it covers goes in `note`, a smaller line under it. "Company
 * controls (SSO, LDAP, SCIM, audit export)" as one label was squeezed into
 * four lines of one or two words in a phone's 112 px label column.
 */
export const PLAN_ROWS: { key: PlanRowKey; label: string; note?: string }[] = [
  { key: "price", label: "Price" },
  { key: "runs", label: "Who runs it" },
  { key: "people", label: "People" },
  { key: "install", label: "Install" },
  { key: "updates", label: "Updates" },
  { key: "licence", label: "Licence" },
  { key: "controls", label: "Company controls", note: "SSO, LDAP, SCIM, audit export" },
  { key: "help", label: "Help" },
];

export function planOptions(p: Pricing): PlanOption[] {
  const cloudPeople = p.business_configured
    ? `${p.cloud_seats} (Team) or ${p.business_seats} (Business)`
    : `Up to ${p.cloud_seats}`;
  return [
    {
      key: "free",
      name: PLAN.free.name,
      summary: `The ready-made release with a one-command installer, for teams of up to ${FREE_SEATS}.`,
      price: "Free",
      runs: "You, from our official release",
      people: `Up to ${FREE_SEATS}`,
      install: "One command",
      updates: "One command",
      licence: "AGPL-3.0",
      controls: "Not included",
      help: "Community",
      cta: { label: PLAN.free.cta, href: PLAN.free.href },
    },
    {
      key: "lifetime",
      name: PLAN.licence.name,
      summary: "The ready-made release for any number of people, under a commercial licence. Pay once.",
      price: { inr: p.lifetime_inr, per: " once" },
      runs: "You, from our official release",
      people: "Unlimited",
      install: "One command",
      updates: "One command, free within your major version",
      licence: "Commercial: no AGPL obligations",
      controls: "Included",
      help: "Email support",
      cta: { label: PLAN.licence.cta, href: PLAN.licence.href },
    },
    {
      key: "cloud",
      name: PLAN.cloud.name,
      summary: "We run it for you on a server of your own, with backups and updates.",
      price: { lead: "From ", inr: p.cloud_inr, per: "/mo" },
      runs: "We do",
      people: cloudPeople,
      install: "Nothing to install",
      updates: "Automatic",
      licence: "Commercial, and a self-host licence is included",
      controls: "Included",
      help: "Email support",
      cta: { label: PLAN.cloud.cta, href: PLAN.cloud.href },
    },
  ];
}
