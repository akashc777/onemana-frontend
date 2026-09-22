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
  eyebrow: "Governed AI",
  title: "Permissions, not promises",
  subtitle:
    "Most AI workspaces ask you to trust that the assistant will behave. This one is built so it cannot misbehave quietly.",
  points: [
    {
      icon: "shield" as FeatureIconKey,
      title: "An agent can only do what its author could",
      body: "Every action is checked against the live permission graph of the human who authorised it: channel, project, and document membership, read at the moment of the call. Remove someone from a channel and their agents lose it on the next request, not at the next token rotation.",
    },
    {
      icon: "audit" as FeatureIconKey,
      title: "If it can't be recorded, it doesn't happen",
      body: "The audit entry is written before the tool call. A failed write refuses the call. A decision that was made and never recorded is worse than one recorded and abandoned, because only the second is discoverable afterwards.",
    },
    {
      icon: "lock" as FeatureIconKey,
      title: "Refusals are on the record",
      body: "A denied call leaves a row with the reason, the credential, the named agent, and the human behind it. Each entry hashes the one before it, so quiet edits to history break the chain.",
    },
  ],
  // What used to be governance points 4 through 7. One line on the homepage;
  // the detail lives in the docs. Seven essays of equal weight flattened the
  // three that carry the argument.
  alsoShipped: "Local-only AI that refuses cloud providers · on-server Whisper for calls · SCIM offboarding that reaches agents. Details in the docs.",
  alsoShippedHref: "/docs",
};

/**
 * The controls an enterprise buyer looks for before they will take a demo. All shipped; none of this was
 * mentioned anywhere on the site before, which was costing deals silently.
 */
export const enterpriseControls = {
  eyebrow: "Enterprise controls",
  title: "The boxes procurement makes you tick",
  subtitle: "Already in the box. No enterprise tier, no add-on SKU.",
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
  {
    icon: "agent",
    title: "AI agents",
    body: "Badged teammates that act or propose, bounded by their owner.",
  },
  {
    icon: "ai",
    title: "Local AI",
    body: "Ollama by default. Cited answers from your own data.",
  },
  {
    icon: "audit",
    title: "Audit trail",
    body: "Every call, allowed or refused, hash-chained and exportable.",
  },
  {
    icon: "shield",
    title: "SSO and provisioning",
    body: "SAML, OIDC, LDAP, SCIM 2.0, TOTP. No enterprise tier.",
  },
  {
    icon: "chat",
    title: "Chat",
    body: "Channels, threads, DMs, files. Real-time over MQTT.",
  },
  {
    icon: "docs",
    title: "Docs",
    body: "Block editor with live cursors. We cancelled Notion.",
  },
  {
    icon: "tasks",
    title: "Tasks",
    body: "Kanban beside your channels. Nothing to keep in sync.",
  },
  {
    icon: "table",
    title: "Tables",
    body: "Typed databases with grid, board, calendar and chart views.",
  },
  {
    icon: "video",
    title: "Video",
    body: "LiveKit and transcription on your hardware. AI recap after.",
  },
  {
    icon: "lock",
    title: "Your server",
    body: "One Docker command, SSL included. No phone home.",
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
  {
    icon: "api",
    title: "Programmable",
    body: "Scoped API, TypeScript SDK and an MCP server.",
  },
];

export const steps = [
  // THE SECOND DEPLOY IS NAMED HERE, before anyone pays. The installer prints it
  // when it finishes, which is a fine place to repeat it and the wrong place to
  // learn it: a buyer whose model was "run one command" meets an unexpected step
  // at the moment they expected to be done. The frontend is a separate,
  // open-source deployment, and saying so costs less than the support thread.
  { n: "1", title: "Run one command", body: "SSH into any Docker-capable server and run the installer. It pulls images, wires SSL, and sets up the database. The workspace people open is a second deploy, from the open-source frontend, and the installer prints that command too." },
  { n: "2", title: "Connect your directory", body: "Point SAML, OIDC, or LDAP at it and switch on SCIM so joiners and leavers handle themselves. Or just send email invites and skip this." },
  { n: "3", title: "Give the AI a job", body: "Build an agent, decide whether it acts or asks first, and watch what it does in the audit log." },
];

export const faqs = [
  {
    q: "Where does the model run?",
    a: "On infrastructure you choose. Ollama locally by default; OpenAI, Anthropic, or any OpenAI-compatible endpoint when you want. Local-only mode refuses cloud providers outright rather than warning and allowing them. PII redaction runs before anything outbound. OneCamp Cloud does not resell inference: you bring your own key.",
  },
  {
    q: "What happens when someone leaves?",
    a: "Deactivate them in OneCamp, or let SCIM do it from your directory. Eligibility is re-checked on every call, so their sessions, API tokens, and agents stop immediately. You do not hunt for credentials to revoke.",
  },
  {
    q: "Do you support SSO and SCIM?",
    a: "SAML 2.0, OIDC, and LDAP for sign-in; SCIM 2.0 for provisioning; TOTP with recovery codes for password accounts. Directory-provisioned accounts authenticate at your IdP and cannot be given a local password that routes around it. No enterprise tier unlock.",
  },
  {
    q: "I pay once. What is included?",
    a: "One licence key, unlimited users, no annual renewal. Agents, local AI, SSO, SCIM, MFA, and the audit log are included. Cloud plans include a self-host licence so you can switch later.",
  },
  {
    q: "Can we import Slack?",
    a: "Yes: channels and messages via the built-in importer, with a plan shown before anything is written and a rollback afterwards. What it will not bring is listed in Switching above. Plan a weekend cutover; do not expect a magic mirror.",
  },
  {
    q: "What if OneMana shuts down?",
    a: "You already have the backend binary and an open-source frontend. Your instance does not phone home. It keeps running on your hardware.",
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
    { label: "Open-source frontend", detail: "Read the code on GitHub" },
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

export const savingsPitch = {
  eyebrow: "The math",
  title: "One payment beats six subscriptions",
  // The number moved to the calculator below, where the visitor supplies their
  // own headcount. Two statements of one argument is worse than either, and the
  // vague range was the weaker of the two: a precise figure somebody typed the
  // input to is evidence, a range is a claim. What stays here is the part the
  // arithmetic cannot say, which is what you get rather than what you save.
  body: "Elsewhere the AI is a per-seat add-on on top of the seat. Here it is in the licence. Put your team size in below.",
  highlight: "Pay once. Own it forever.",
};

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
  "AI teammates included. Bring your own model key",
  "Includes a self-host license. Switch anytime",
  "We set everything up, usually within a day",
];

export const lifetimeBenefits = [
  "Unlimited users. No per-seat fees",
  "All modules incl. local AI and agents",
  "SSO, SCIM, MFA, and the audit log included",
  "Open-source frontend, yours forever",
  "Runs on your own server",
  "Free updates within your major version",
];
