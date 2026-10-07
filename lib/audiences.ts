/**
 * Pages for the people OneCamp fits best, one template with this content
 * (app/for/[audience]). Every claim here is a shipped feature; the compliance
 * page offers records and controls and never claims a regulation is met.
 */
import type { FeatureIconKey } from "@/lib/content";

export interface AudiencePoint {
  icon: FeatureIconKey;
  title: string;
  body: string;
}

export interface Audience {
  slug: string;
  /** Short name for links and the footer. */
  label: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  points: AudiencePoint[];
  /** Which prices to show: rupees only, or both currencies. */
  prices: "inr" | "dual";
  /** One line under the prices. */
  priceNote: string;
  faqs: { q: string; a: string }[];
  /** A doc or page that backs the argument up. */
  proof?: { label: string; href: string };
  /** On an "alternative to" page: the rival, honestly. */
  rival?: {
    name: string;
    /** How it is billed: structural, never a price that moves. */
    billing: string;
    /** What it genuinely does better. */
    theyWin: string[];
    /** Its pricing page, where `billing` can be checked. */
    source: string;
  };
  /** On an "alternative to" page: the steps that move a team across. */
  move?: { title: string; steps: string[] };
}

export const audiences: Audience[] = [
  {
    slug: "agencies",
    label: "Agencies",
    eyebrow: "For agencies and studios",
    title: "One workspace for your team and your clients",
    subtitle:
      "Client channels, project links, request forms, booking links and billable hours, on a server you own. Add every contractor without a per-seat bill.",
    seoTitle: "OneCamp for agencies: client channels, request forms and booking links",
    seoDescription:
      "Invite clients into a shared channel with no account, turn their requests into tasks, let them book calls, and run sprints. Self-hosted, pay once, unlimited people.",
    points: [
      {
        icon: "chat",
        title: "Clients in the channel, not in your workspace",
        body: "Invite a client into one channel from a link. They read and reply without an account, and see nothing else: not your other clients, not your files.",
      },
      {
        icon: "tasks",
        title: "Requests arrive as tasks",
        body: "Share a form for briefs, bug reports or change requests. Every answer lands as a task in the right project, with all the details in it.",
      },
      {
        icon: "calendar",
        title: "Kickoffs without the back-and-forth",
        body: "A booking link shows only your free time, in the client's time zone, and puts the call on your calendar and on Google's.",
      },
      {
        icon: "board",
        title: "Sprints and workshops",
        body: "Cycles that roll unfinished work forward, repeating tasks for the monthly report, and a whiteboard with a timer and dot voting for workshops.",
      },
      {
        icon: "teams",
        title: "Every freelancer, no seat tax",
        body: "A lifetime licence covers everyone on your server. Bring in contractors for a project and take them off after, without a bill that moves.",
      },
      {
        icon: "docs",
        title: "Clients follow their project",
        body: "Send a client a link to their project: what's in progress, what's done, what's due, the plan on a timeline, and the update you post each week, drafted from the tasks in a minute. No status emails, no account.",
      },
      {
        icon: "table",
        title: "Hours you can invoice",
        body: "Run a timer on a task or add time by hand, mark it billable or not, and download a project's hours as a CSV for the invoice.",
      },
    ],
    prices: "dual",
    priceNote: "One licence for your whole agency, or Cloud if you'd rather we run it.",
    faqs: [
      {
        q: "Do clients need an account?",
        a: "No. A guest link opens one channel. They give a name, read it, and reply if you allow it. You can turn the link off any time.",
      },
      {
        q: "Can one client see another client's work?",
        a: "No. A guest link reaches only the channel it was made for: not other channels, not people's profiles, not search, not files.",
      },
      {
        q: "Can clients see how their project is going?",
        a: "Yes. A project link shows its tasks by status or on a timeline, with dates and assignees, without an account, and the updates you choose to show them: where the project stands and what changed, drafted from its tasks. Turn comments on and they can ask about a task right where the work is.",
      },
      {
        q: "Can we see who has room for a new client?",
        a: "Yes. Projects → Workload shows each person's open tasks week by week, across every client project, against how many they take on. Open a week to move a task a week later or hand it to someone with room.",
      },
      {
        q: "Can we try it with a real client first?",
        a: "Yes. The free plan covers up to 25 people on your own server, with guest channels, forms and booking links included.",
      },
    ],
    proof: { label: "How channel guests work", href: "/docs/channel-guests" },
  },
  {
    slug: "india",
    label: "India",
    eyebrow: "For teams in India",
    title: "Priced in rupees, invoiced with GST",
    subtitle:
      "Buy OneCamp in rupees with a GST invoice, pay for Cloud with UPI Autopay, and keep your team's data on a server you choose.",
    seoTitle: "OneCamp in India: rupee pricing, GST invoices and UPI Autopay",
    seoDescription:
      "A self-hosted Slack, Notion and Zoom alternative billed in rupees, with GST invoices for input tax credit and UPI Autopay for Cloud. Built in Bengaluru.",
    points: [
      {
        icon: "lock",
        title: "Rupee prices",
        body: "You pay in rupees, so there is no currency conversion on your card and no foreign transaction fee.",
      },
      {
        icon: "docs",
        title: "A GST invoice with your GSTIN",
        body: "Add your GSTIN at checkout and the invoice lets you claim input tax credit.",
      },
      {
        icon: "automation",
        title: "UPI Autopay for Cloud",
        body: "Pay for Cloud monthly with UPI Autopay or an eMandate, or by card, and manage it from your account page.",
      },
      {
        icon: "shield",
        title: "Your data where you put it",
        body: "Run it on a server in India, at your office or with any host you like. Nothing leaves it unless you connect something that sends it.",
      },
      {
        icon: "teams",
        title: "Free for up to 25 people",
        body: "Install it on your own server and use it for real. Pay when your team grows past 25 or needs single sign-on.",
      },
      {
        icon: "ai",
        title: "Made in Bengaluru",
        body: "Support comes from the person who wrote it, in your time zone, at support@onemana.dev.",
      },
    ],
    prices: "inr",
    priceNote: "Prices exclude GST, which is shown on your invoice.",
    faqs: [
      {
        q: "Do I get a proper tax invoice?",
        a: "Yes. Every purchase has an invoice with GST shown separately. Add your GSTIN at checkout to claim input tax credit.",
      },
      {
        q: "Can I pay for Cloud with UPI?",
        a: "Yes. Cloud subscriptions take UPI Autopay, eMandate or a card. A UPI or eMandate subscription asks you to approve any change of plan.",
      },
      {
        q: "Where is my data stored?",
        a: "On the server you install it on. With Cloud, on a server we run for you; ask us where before you buy if it matters to you.",
      },
    ],
    proof: { label: "Taxes on our services", href: "/taxes-on-services" },
  },
  {
    slug: "compliance",
    label: "Compliance",
    eyebrow: "For privacy-minded and regulated teams",
    title: "AI agents you can account for",
    subtitle:
      "OneCamp's agents cannot go past the permissions of the person behind them, and every action is written down before it runs. On your own servers, in the country you choose.",
    seoTitle: "OneCamp for regulated teams: governed AI agents and audit trails",
    seoDescription:
      "Self-hosted chat, docs and tasks with AI agents bound to their user's permissions, a tamper-evident log of every action, approvals and a kill switch.",
    points: [
      {
        icon: "shield",
        title: "Bound to a person's permissions",
        body: "Before every action, OneCamp checks what the person who set up the agent may do right now. Remove their access and the agent loses it at once.",
      },
      {
        icon: "audit",
        title: "Written down before it runs",
        body: "Every agent action is logged first, in a hash-chained log that shows if anything was changed. If it cannot be logged, it does not run.",
      },
      {
        icon: "lock",
        title: "Approvals and a kill switch",
        body: "Make agents ask before they act, see every agent in one inventory, and stop any of them at once.",
      },
      {
        icon: "ai",
        title: "AI that stays on your server",
        body: "Run models locally and switch on local-only mode, which refuses cloud providers. Personal data is redacted before anything leaves.",
      },
      {
        icon: "teams",
        title: "Company sign-in and offboarding",
        body: "Single sign-on (SAML, OIDC), LDAP and SCIM come with a licence, so people and their agents leave when they leave.",
      },
      {
        icon: "docs",
        title: "Records an auditor can check",
        body: "Export the audit trail, and give an outside party a way to verify that a record has not been altered.",
      },
    ],
    prices: "dual",
    priceNote: "Company controls (single sign-on, LDAP, SCIM, audit export) come with a licence or Cloud.",
    faqs: [
      {
        q: "Does OneCamp make us compliant?",
        a: "No software can. OneCamp gives you controls and records; whether they meet a regulation for your use is for you and your advisers to decide.",
      },
      {
        q: "Can we keep everything inside our own network?",
        a: "Yes. Self-host it, run models locally and turn on local-only mode. Nothing has to leave your servers.",
      },
      {
        q: "How long are agent records kept?",
        a: "Agent action records are kept for at least 190 days, and the log is hash-chained so a gap or an edit shows.",
      },
    ],
    proof: { label: "Verifying a record", href: "/docs/verify-a-record" },
  },
];

export const audienceBySlug = (slug: string) => audiences.find((a) => a.slug === slug);
