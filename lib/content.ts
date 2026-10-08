import { FREE_SEATS } from "./freePlan";
// Marketing copy - company voice, uneven on purpose.
//
// POSITIONING: governed AI, not all-in-one.
//
// This file used to lead with "12-in-1, replaces Slack/Notion/Asana". That argument loses on its own
// terms. A buyer comparing modules compares each one against a category leader they already use for
// free, and OneCamp does not win nine of those fights — nor does it need to. It wins a fight nobody
// else is having: an AI agent here cannot exceed the live permissions of the person who authorised it,
// and it cannot act at all unless the action was written to a tamper-evident log first.
//
// Every governance claim below was checked against the implementation before it was written here,
// because these are the claims an enterprise buyer will actually test:
//
//   business/MCPServer/authorize.go     the permission ladder, evaluated per call
//   controllers/MCP/governed.go         audit-before-act; a failed write ABORTS the call
//   business/MCPServer/audit.go         what each row records, including refusals
//   migrations/106_audit_hash_chain     the chain that makes edits to history detectable
//   business/Principal/principal.go     deactivated, bot and ghost identities cannot authorise
//   business/AI/aiConfigBusiness.go     local-only mode refuses cloud providers outright
//
// Nothing here describes a roadmap. If a sentence in this file cannot be traced to one of those, it
// should be deleted rather than softened.

export type FeatureIconKey = "ai" | "chat" | "tasks" | "docs" | "board" | "video" | "calendar" | "teams" | "lock" | "table" | "agent" | "automation" | "api" | "shield" | "audit";

/**
 * The governance thesis. This is the site's lead argument.
 *
 * Each proof point is phrased as a mechanism rather than a benefit, on purpose: "your data is safe" is
 * what every competitor says, and "the call is refused if it cannot be logged" is something a buyer can
 * go and verify. The second one is worth more precisely because it is falsifiable.
 */
export const governance = {
  eyebrow: "Safe AI agents",
  title: "AI that can't go behind your back",
  subtitle:
    "Most AI tools ask you to trust them. OneCamp is built so its agents cannot quietly overstep.",
  points: [
    {
      icon: "shield" as FeatureIconKey,
      title: "An agent can only do what you can do",
      body: "Before every action, OneCamp checks what the person who set up the agent is allowed to do right now. Remove someone from a channel and their agents lose it at once.",
    },
    {
      icon: "audit" as FeatureIconKey,
      title: "Nothing happens off the record",
      body: "Every action is written to a log before it runs. If it cannot be written down, it does not run.",
    },
    {
      icon: "lock" as FeatureIconKey,
      title: "You can see what was blocked",
      body: "When an agent is stopped, the log says what it tried, why it was stopped, and who it was working for. Nobody can quietly edit the log afterwards.",
    },
  ],
  // What used to be governance points 4 through 7. One line on the homepage;
  // the detail lives in the docs. Seven essays of equal weight flattened the
  // three that carry the argument.
  alsoShipped: "Also: keep AI entirely on your server, transcribe calls without sending audio out, and cut agents off the moment their person leaves.",
  alsoShippedHref: "/docs",
};

/**
 * The controls an enterprise buyer looks for before they will take a demo. All shipped; none of this was
 * mentioned anywhere on the site before, which was costing deals silently.
 */
export const enterpriseControls = {
  eyebrow: "For companies",
  title: "What your IT team will ask about",
  subtitle: "Included with a licence or Cloud. No separate enterprise tier.",
  groups: [
    {
      label: "Identity",
      items: [
        "SAML 2.0 single sign-on",
        "OIDC, for anything modern",
        "LDAP / Active Directory",
        "Two-factor auth with recovery codes",
      ],
    },
    {
      label: "Lifecycle",
      items: [
        "SCIM 2.0 provisioning",
        "Automatic deprovisioning on offboard",
        "IdP-managed accounts can't add a local password",
        "Role and project permission model",
      ],
    },
    {
      label: "Evidence",
      items: [
        "Tamper-evident admin audit log",
        "Chain verification endpoint",
        "CSV and JSON export with row hashes",
        "Named actor: human, integration, or agent",
      ],
    },
    {
      label: "Data",
      items: [
        "Runs entirely on your infrastructure",
        "Residency follows your server",
        "Local-only AI mode",
        "PII redaction before any outbound call",
      ],
    },
  ],
};

/** How many modules the homepage lists before deferring to the docs.
 *
 * The index answers "does it have X" and a reader scanning fifteen rows of
 * prose stops reading before the price. Ten rows plus a line naming the other
 * five is the same answer in a third of the words, and nothing appears missing
 * because the remaining five are named rather than hidden. */
export const MODULES_ON_HOMEPAGE = 10;

export const features: { icon: FeatureIconKey; title: string; body: string }[] = [
  // What a team does in it first, then what makes it different. Plain words:
  // a body here is read by someone deciding what the app is (3 Oct 2026).
  { icon: "chat", title: "Chat", body: "Channels, threads, direct messages and files, updated live, with check-ins that ask a channel a question on a schedule." },
  { icon: "docs", title: "Docs", body: "Write together, with everyone's cursor on the page." },
  { icon: "tasks", title: "Tasks", body: "Boards, timelines, workload and goals, beside your conversations." },
  { icon: "video", title: "Video", body: "Calls on your own server, with an AI recap after." },
  { icon: "agent", title: "AI agents", body: "AI teammates that do the work, or ask first." },
  { icon: "ai", title: "Any AI model", body: "Your own API key, or a model on your server." },
  { icon: "audit", title: "Audit trail", body: "A record of everything every agent did or tried." },
  { icon: "lock", title: "Your server", body: "One install command. Nothing is sent to us." },
  { icon: "api", title: "Bring your assistant", body: "Use ChatGPT or Claude inside OneCamp, limited to you." },
  { icon: "shield", title: "Company sign-in", body: "Single sign-on and automatic accounts, with a licence." },
  {
    icon: "table",
    title: "Tables",
    body: "Typed databases with grid, board, calendar and chart views.",
  },
  {
    icon: "automation",
    title: "Automations",
    body: "Plain-English rules that run on your server.",
  },
  {
    icon: "board",
    title: "Whiteboard",
    body: "Infinite canvas with live cursors. Replaces Miro.",
  },
  {
    icon: "calendar",
    title: "Calendar",
    body: "Two-way Google sync. Task due dates included.",
  },
  {
    icon: "teams",
    title: "Teams",
    body: "Roles and projects. The AI sees only what you see.",
  },
];

/**
 * What running OneCamp yourself takes, said before anyone pays or claims a key.
 * The floor is the one the managed service checks a machine against (docs:
 * scale-self-hosted); change both together.
 */
export const selfHostNeeds = [
  "A Linux server with Docker, 4 GB of RAM and 40 GB of disk",
  "No domain needed: it starts on a free address; add yours later",
  "One command to install. It serves the web app too, so there is nothing else to deploy",
];

export const steps = [
  // The machine is named here, before anyone pays or claims a key: someone who
  // learns the floor after installing has already lost an evening. 4 GB since
  // virus scanning, the one 2 GB service, became optional by RAM. Since
  // the installer started serving the web app itself (v2.34.0), there is no
  // second deploy to warn about, and saying there is one costs a buyer for
  // nothing. Kept in step with selfHostNeeds below and pinned by
  // installExpectation.test.ts.
  { n: "1", title: "Run one command", body: "SSH into a server with 4 GB of RAM and run the installer. It asks one email, then sets up SSL, the database and your team's web app. No domain needed." },
  { n: "2", title: "Invite your team", body: "Send email invites. With a licence, connect your company sign-in instead." },
  { n: "3", title: "Give the AI a job", body: "Connect a model, build an agent, and read its audit log." },
];

export const faqs = [
  {
    q: "Where does the model run?",
    a: "OneCamp ships no model. Connect OpenAI, Anthropic or any compatible endpoint with your key, or run Ollama on your own server (about 8 GB more memory). Local-only mode refuses cloud providers, and PII is redacted before anything leaves. Cloud runs one for you.",
  },
  // Personal agents (ChatGPT, Claude, Grok Bot, Meta's Muse) now reach work tools
  // by signing in as the person, with everything the account can open. This is
  // the answer OneCamp gives instead, and each clause is a server rule:
  //   acts as you                 agent-bound token capped by live permissions
  //   deleting waits for approval business/MCPServer/write.go
  //   disconnect ends it at once  business/MCPServer/oauth Disconnect
  {
    q: "Can the assistant I already use work in OneCamp?",
    a: "Yes. Connect ChatGPT, Claude, Grok Bot or any MCP client by URL and approve it once. It acts as you and never more: deleting waits for a person's approval, every call is on the record, and disconnecting stops it at once.",
  },
  {
    q: "Do you support SSO and SCIM?",
    a: "SAML 2.0, OIDC, and LDAP for sign-in; SCIM 2.0 for provisioning; TOTP with recovery codes for password accounts. Directory-provisioned accounts authenticate at your IdP and cannot be given a local password that routes around it. No enterprise tier unlock.",
  },
  {
    q: "I pay once. What is included?",
    a: "One license key, unlimited users, no annual renewal. Everything is included: agents, local AI, SSO, LDAP, SCIM and audit export. Cloud plans include a self-host license so you can switch later.",
  },
  {
    q: "Can we import Slack?",
    a: "Yes: channels and messages via the built-in importer, with a plan shown before anything is written and a rollback afterwards. What it will not bring is listed in Switching above. Plan a weekend cutover; do not expect a magic mirror.",
  },
  {
    q: "What if OneMana shuts down?",
    a: "The code is open source: server AGPL-3.0, web app MIT. Your instance does not phone home. It keeps running on your hardware.",
  },
];

export const requirementsIntro =
  "Starting points from real droplets, not lab benchmarks.";

export const requirements = [
  {
    label: "Under ~50 people",
    spec: "8 GB RAM · 4 vCPU",
    note: "What we run OneMana on. Chat, docs, tasks, and CPU AI are fine here.",
  },
  {
    label: "50–200 people",
    spec: "16 GB RAM · 4+ CPU",
    note: "Add headroom if local AI is on all day or video is heavy.",
  },
  {
    label: "200+ people",
    spec: "32 GB RAM and up",
    note: "Treat this as a conversation, not a formula. We'll help you size it.",
  },
];

export const replaces = ["Slack", "Notion", "Asana", "Zoom", "Google Calendar", "Trello", "Miro", "Airtable", "Confluence"];

/**
 * Headline numbers.
 *
 * The lead stat used to be "12-in-1 tools in one install", which argued the case this positioning
 * abandons — and invited the comparison OneCamp loses, module against category leader. "0 agent actions
 * that run unaudited" argues the case it wins, and it is a literal description of the code path: the
 * audit write precedes the action and a failure to write it refuses the call.
 * That holds for an agent's tool calls. Administrative changes are logged
 * best-effort on a detached goroutine, so the copy says which is which rather
 * than claiming the strong guarantee for both.
 */
export const stats = [
  { value: "0", label: "agent actions that run unaudited" },
  { value: "∞", label: "people, no seat tax" },
  { value: "100%", label: "on your infrastructure" },
  { value: "<10 min", label: "to get running" },
];

/** Company story for the “Why we built it” section. */
export const whyBuilt = {
  eyebrow: "Why we built it",
  title: "AI got access before anyone agreed to it",
  subtitle: "Not a compliance problem. A Tuesday morning problem.",
  story:
    "An assistant gets wired into the wiki, the tickets, and the chat, and within a week it can reach more than most of the people who work there. Nobody decided that. Ask who authorised a particular action and the answer is usually a shrug and a log line with a token id in it. OneCamp starts from the other end. OneMana runs the company on it.",
};

/**
 * Real reviews from actual buyers. Trimmed for length, NEVER reworded: clauses are
 * dropped whole and no word is changed, because a review you have edited is not a
 * review and a buyer who finds the original will know which it was.
 */
export const testimonials = [
  {
    quote:
      "I purchased OneCamp, tried it out, and still use it. The quick video chat works, chat between users works, and it's easy to invite a colleague with an email request. You can easily ask the AI box questions, which is useful. It's truly an all-in-one build. Worth it, with a responsive, friendly developer.",
    author: "herehere4242here",
    role: "Verified buyer · Reddit",
  },
  {
    quote:
      "Something really sweet if you like to self-host for your team. Chat, tasks, docs, and video meetings, all in one workspace you own. One payment, and it replaces four subscriptions.",
    author: "Terry Carson",
    role: "Self-hosting community",
  },
];

/** Trust signals shown alongside real reviews. */
export const socialProof = {
  signals: [
    { label: "Runs in production", detail: "Same app OneMana ships from" },
    { label: "Live demo", detail: "Kick the tires first" },
    { label: "Open source", detail: "Read the code on GitHub (AGPL-3.0)" },
  ],
};

/**
 * Icons for the hero trust strip.
 *
 * A CLOSED UNION, and the trust points below carry a key from it rather than being looked up by their
 * label. They used to be keyed on the label prose against a `Record<string, ReactNode>`, which type-checks
 * against anything: rewording a label silently produced an empty icon box, and tsc, eslint and next build
 * all passed while three of the four icons disappeared. Caught by rendering the page, which is not a
 * dependable way to catch things.
 *
 * With a union, a new trust point cannot be added without either reusing an icon or adding one, because
 * the Record in PremiumVisuals stops compiling.
 */
export type TrustIconKey = "bounded" | "audited" | "server" | "identity";

export const trustPoints: { icon: TrustIconKey; label: string; detail: string }[] = [
  { icon: "bounded", label: "Agents can't exceed you", detail: "Checked live, every call" },
  { icon: "audited", label: "Audited before it acts", detail: "Refusals recorded too" },
  { icon: "server", label: "Data stays yours", detail: "Runs on your server" },
  { icon: "identity", label: "SSO, SCIM, MFA", detail: "No enterprise tier" },
];

/** Side-by-side billing comparison - static, no animation. Shown once in #pricing. */
export const pricingComparison = {
  typical: {
    eyebrow: "What teams pay today",
    title: "Five separate subscriptions",
    rows: [
      { label: "Stack", value: "Slack, Notion, Asana, Zoom, calendar" },
      { label: "Annual spend", value: "Per seat, per tool, growing with headcount" },
      { label: "AI", value: "Per-seat add-on, in someone else's cloud" },
      { label: "Meetings", value: "Transcribed by a vendor, billed per minute" },
      { label: "Billing", value: "Per seat, per tool, every year" },
    ],
  },
  onecamp: {
    eyebrow: "With OneCamp",
    title: "One workspace, flat pricing",
    rows: [
      { label: "Stack", value: "Chat, docs, tasks, tables, video, calendar, AI" },
      { label: "AI", value: "Included, governed, runs on your hardware" },
      { label: "Meetings", value: "Transcribed on your server, no per-minute bill" },
      { label: "Billing", value: "Unlimited users, no per-seat fees" },
      { label: "Choice", value: "Lifetime self-host or managed cloud" },
    ],
  },
};

export const cloudBenefits = [
  // "your own subdomain" read as though the customer had to supply one, and the
  // custom-domain move was never mentioned anywhere before purchase even though
  // the portal has supported it for a while. Both are things a buyer weighs.
  "Free address on onemana.dev, or bring your own domain",
  "Your own server. No database shared with anyone",
  "We handle SSL, monitoring, and uptime",
  "AI teammates with a model on your server: no key needed",
  "Includes a self-host license. Switch anytime",
  "We set everything up, usually within a day",
];

/**
 * Before you pay: the trust a $259 card from an unknown company has to clear,
 * answered with facts a buyer can check rather than quotes we do not have
 * (buyer review, 4 Oct 2026: "the trust gap is the part that still matters").
 *   Run it first     the free plan is the same app (helpers/seatLimit.go)
 *   Read the code    github.com/OneMana-Soft/OneCamp, AGPL-3.0
 *   Nothing to stop  no licence server: a paid build has no cap stamped in
 *   Who you pay      the registered company, Razorpay, GST invoice
 */
export const beforeYouPay = [
  { title: "Run it first", body: `The free plan is the same app for up to ${FREE_SEATS} people. Pay when you outgrow it.` },
  { title: "Read the code", body: "Every line is public under AGPL-3.0.", href: "https://github.com/OneMana-Soft/OneCamp", link: "See it on GitHub" },
  { title: "Nothing to switch off", body: "No licence server and no phone-home. A paid build has no cap, so it keeps running if we stop." },
  { title: "Who you pay", body: "OneMana Solutions (OPC) Private Limited, Bangalore. Razorpay takes the card; you get a GST invoice.", href: "mailto:support@onemana.dev", link: "Ask first" },
] as const;

export const lifetimeBenefits = [
  "Unlimited users. No per-seat fees",
  "All modules incl. local AI and agents",
  "SSO, LDAP, SCIM and audit export: the company controls",
  "Commercial licence: no AGPL obligations",
  "Runs on your own server",
  "Free updates within your major version",
];
