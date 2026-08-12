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
      body: "Every action is checked against the live permission graph of the human who authorised it: channel, project, and document membership, read at the moment of the call rather than cached at setup. Remove someone from a channel and the agents acting on their behalf lose it on the next request, not at the next token rotation.",
    },
    {
      icon: "audit" as FeatureIconKey,
      title: "If it can't be recorded, it doesn't happen",
      body: "The audit entry is written before the action runs, and a failure to write it aborts the call. That ordering is the point: a decision that was made and never recorded is worse than one recorded and abandoned, because only the second is discoverable afterwards.",
    },
    {
      icon: "lock" as FeatureIconKey,
      title: "Refusals are logged too",
      body: "A denied call leaves a row with the reason it was denied, the credential, the named agent, and the human behind it. An access review can therefore answer what an agent tried and was stopped from doing, which is the question that actually matters after an incident.",
    },
    {
      icon: "shield" as FeatureIconKey,
      title: "History that can't be quietly edited",
      body: "Each audit entry hashes its own contents plus the previous entry's hash. Any later insertion, edit, or deletion breaks the chain, and a verify endpoint recomputes it and reports the first divergence. Exports carry the per-row hashes so an auditor can check them without trusting the UI.",
    },
    {
      icon: "ai" as FeatureIconKey,
      title: "The model can stay in the building",
      body: "Local inference through Ollama by default. Turn on local-only mode and the server refuses to activate a cloud provider at all, rather than warning you and allowing it. Point it at OpenAI or Anthropic when you want to, with PII redaction on the way out.",
    },
    {
      icon: "teams" as FeatureIconKey,
      title: "Offboarding reaches the agents",
      body: "Deactivating someone is re-evaluated live at every authorisation surface, so their agents and API tokens stop working immediately without anyone hunting for credentials to revoke. Bots and attribution-only identities can never be the authority for a call in the first place.",
    },
  ],
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

export const features: { icon: FeatureIconKey; title: string; body: string }[] = [
  {
    icon: "agent",
    title: "AI agents",
    body: "Build a teammate, not just a chatbot. @mention it in a channel or DM and it answers in-thread as its own badged member, or let it run on a schedule to triage, file tasks, and post recaps. You choose whether it acts on its own or proposes and waits for your OK. It can only ever do what its owner could, every call is checked live, and every call is recorded before it runs.",
  },
  {
    icon: "ai",
    title: "Local AI",
    body: "Runs locally via Ollama by default, so chats and docs never leave your box. Point it at OpenAI, Anthropic, or your own endpoint when you want; local-only mode and built-in PII redaction keep you in control. Ask once and get a cited answer from your channels, docs, tasks, and connected Gmail or GitHub. Daily token budgets included.",
  },
  {
    icon: "audit",
    title: "Audit trail",
    body: "Every admin change and every agent tool call, allowed or refused, with the reason and the human accountable for it. Hash-chained so edits to history are detectable, verifiable on demand, and exportable as CSV or JSON with the row hashes intact.",
  },
  {
    icon: "shield",
    title: "SSO and provisioning",
    body: "SAML, OIDC, and LDAP for sign-in, SCIM 2.0 for joiners and leavers, TOTP two-factor with recovery codes for everyone else. Directory-provisioned accounts authenticate at your IdP and cannot be given a local password that routes around it.",
  },
  {
    icon: "table",
    title: "Tables",
    body: "Notion-style databases with grid, board, calendar, and chart views. Typed columns, rows that link to real tasks and projects, and an AI that builds the whole table from one sentence, fills a column row by row, or answers a question straight from your data with a chart. Replaces Airtable.",
  },
  {
    icon: "automation",
    title: "Automations",
    body: "Slack-class \"when this, do that\" without the bot zoo. New message with 'bug:' in #support, auto-file a triage task. Describe the rule in plain English and it runs on your server, forever.",
  },
  {
    icon: "chat",
    title: "Chat",
    body: "Channels, threads, DMs, reactions, files. Real-time over MQTT. We built this first and still dogfood it daily at OneMana.",
  },
  {
    icon: "tasks",
    title: "Tasks",
    body: "Kanban in the same app as your channels. No Zapier keeping Asana in sync with Slack.",
  },
  {
    icon: "docs",
    title: "Docs",
    body: "Block editor, slash commands, live cursors when two people land on the same page. Good enough that we cancelled Notion.",
  },
  {
    icon: "board",
    title: "Whiteboard",
    body: "An infinite canvas for diagrams, flows, and mind maps with live cursors. Ask the AI to draft a flowchart or UI mockup, then edit it together. Replaces Miro and FigJam.",
  },
  {
    icon: "video",
    title: "Video",
    body: "LiveKit runs on your hardware. Calls, screen share, recordings, and an AI recap posted to the channel after the call. Transcription stays local too.",
  },
  {
    icon: "calendar",
    title: "Calendar",
    body: "Google sync works both ways. Task due dates show on the team calendar, and the AI finds a meeting time and preps you before it. Without another tool.",
  },
  {
    icon: "teams",
    title: "Teams",
    body: "Roles, projects, the usual permission model. The AI only sees what the logged-in user can see, and so does anything acting on their behalf.",
  },
  {
    icon: "api",
    title: "Programmable",
    body: "A scoped public API, an official TypeScript SDK, and an MCP server so any AI client can drive your workspace, plus shareable templates for agents, automations, and tables. Tokens never exceed what their owner could do by hand, and calls made through them are audited like any other.",
  },
  {
    icon: "lock",
    title: "Your server",
    body: "One Docker command, SSL included, open-source frontend on GitHub. No phone home, no per-seat invoice, no vendor lock-in. Share a doc, board, or table as a read-only link with people outside your org when you need to.",
  },
];

export const steps = [
  { n: "1", title: "Run one command", body: "SSH into any Docker-capable server and run the installer. It pulls images, wires SSL, and sets up the database." },
  { n: "2", title: "Connect your directory", body: "Point SAML, OIDC, or LDAP at it and switch on SCIM so joiners and leavers handle themselves. Or just send email invites and skip this." },
  { n: "3", title: "Give the AI a job", body: "Build an agent, decide whether it acts or asks first, and watch what it does in the audit log. It inherits the permissions of whoever authorised it." },
];

export const faqs = [
  {
    q: "Can the AI see things it shouldn't?",
    a: "It checks your channel, project, and document membership at the moment of the call, so it can only read what you can already open. The same check governs anything acting on your behalf: an agent, an API token, an external MCP client. Nothing is cached at setup time, so a permission you lose is a permission it loses on the next request.",
  },
  {
    q: "Is there an audit trail for what the AI did?",
    a: "Yes, and refusals are in it too. Each row names the tool, the decision, the reason, the credential, the agent if there was one, and the human accountable. The entry is written before the action runs, and if it cannot be written the action does not happen. Entries are hash-chained so later edits to history are detectable, and you can verify the chain or export it with the hashes.",
  },
  {
    q: "What happens when someone leaves?",
    a: "Deactivate them in OneCamp, or let SCIM do it from your directory. Eligibility is re-checked at every authorisation surface on every call, so their sessions, API tokens, and any agent acting on their authority stop working immediately. You don't have to go looking for credentials to revoke.",
  },
  {
    q: "Do you support SSO and SCIM?",
    a: "SAML 2.0, OIDC, and LDAP for sign-in; SCIM 2.0 for provisioning and deprovisioning; TOTP two-factor with recovery codes for accounts that sign in with a password. Accounts your directory creates must authenticate at your directory, so nobody can give them a local password that bypasses it.",
  },
  {
    q: "Where does the AI run?",
    a: "On your server via Ollama by default, not our cloud. You can point it at OpenAI, Anthropic, or your own endpoint if you prefer. Turn on local-only mode and the server refuses to activate a cloud provider at all rather than warning you and letting it through, and PII redaction runs before anything outbound.",
  },
  {
    q: "I pay once and that's it?",
    a: "Yes. One license key, unlimited users, no annual renewal. The AI, the agents, the SSO, and the audit log are all included. None of it is an enterprise tier you unlock later.",
  },
  {
    q: "Can I share a doc/board with someone outside the org?",
    a: "Yes. Share a doc, board, or table as a read-only link with people outside your team, and create guest links for calls. Guests see only what you shared, nothing else, and every open is audited for you.",
  },
  {
    q: "Do I need a GPU?",
    a: "No for getting started. The default small model is fine on CPU with 16 GB RAM. A GPU just makes replies faster if you want bigger models.",
  },
  {
    q: "Can we import Slack history?",
    a: "There's a Slack import built in. Bring channels and messages over when you're ready to switch, not before.",
  },
  {
    q: "Does everyone need to install something?",
    a: "One person runs the installer on a server you control. Everyone else opens a browser or adds the PWA to their phone.",
  },
  {
    q: "What about phones?",
    a: "Mobile web and PWA work well, push included. We don't ship App Store builds. Most teams don't miss them.",
  },
  {
    q: "Install broke. What now?",
    a: "Open a GitHub issue with the log. Most installs finish in under ten minutes on a normal VPS. We'll help you untangle it.",
  },
  {
    q: "What if OneMana shuts down?",
    a: "You already have the backend binary and an open-source frontend. Your instance does not phone home. It keeps running.",
  },
];

export const requirementsIntro =
  "Starting points from real droplets, not lab benchmarks. Your mileage varies if everyone is on video calls while the AI summarizes docs.";

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
 * audit write precedes the action and a failure to write it aborts the call.
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
    "An assistant gets wired into the wiki, the tickets, and the chat, and within a week it can reach more than most of the people who work there. Nobody decided that. Ask who authorised a particular action and the honest answer is usually a shrug and a log line with a token id in it. OneCamp starts from the other end: an agent inherits one person's permissions, re-checked on every call, and nothing it does happens without a record naming who stood behind it. OneMana runs the company on this, and the product still changes every week.",
};

/** Real reviews from actual buyers. Lightly trimmed for length, not reworded. */
export const testimonials = [
  {
    quote:
      "I purchased OneCamp, tried it out, and still use it. The quick video chat works, chat between users works, I can make multiple files to share with anyone, and it's easy to invite a colleague with an email request. You can easily ask the AI box questions, which is useful. It's truly an all-in-one build. Worth it, with a responsive, friendly developer. I'm satisfied.",
    author: "herehere4242here",
    role: "Verified buyer · Reddit",
  },
  {
    quote:
      "Something really sweet if you like to self-host for your team. Your team's self-hosted command center: chat, tasks, docs, and video meetings, all in one workspace you own. No per-seat pricing. No vendor lock-in. Just install, invite your team, and start collaborating. A $19 no-brainer.",
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
  body: "A 20-person team often spends $3,000 to $8,000 per year on Slack, Notion, Asana, Zoom, Airtable, and calendar tools, and the AI in those is usually a per-seat add-on on top. OneCamp includes the agents, the local AI, the SSO, and the audit log in one install with unlimited users.",
  highlight: "Pay once. Own it forever.",
};

/** Side-by-side billing comparison - static, no animation. Shown once in #pricing. */
export const pricingComparison = {
  typical: {
    eyebrow: "What teams pay today",
    title: "Five separate subscriptions",
    rows: [
      { label: "Stack", value: "Slack, Notion, Asana, Zoom, calendar" },
      { label: "Annual spend", value: "$3,000–8,000 for ~20 people" },
      { label: "AI", value: "Per-seat add-on, in someone else's cloud" },
      { label: "Billing", value: "Per seat, per tool, every year" },
    ],
  },
  onecamp: {
    eyebrow: "With OneCamp",
    title: "One workspace, flat pricing",
    rows: [
      { label: "Stack", value: "Chat, docs, tasks, tables, video, calendar, AI" },
      { label: "AI", value: "Included, governed, runs on your hardware" },
      { label: "Billing", value: "Unlimited users, no per-seat fees" },
      { label: "Choice", value: "Lifetime self-host or managed cloud" },
    ],
  },
};

export const cloudBenefits = [
  "Fully managed hosting on your own subdomain",
  "Automatic backups, updates & monitoring",
  "We handle SSL, scaling, and uptime",
  "Includes a self-host license. Switch anytime",
  "We set everything up within 12 hours",
];

export const lifetimeBenefits = [
  "Unlimited users. No per-seat fees",
  "All modules incl. local AI and agents",
  "SSO, SCIM, MFA, and the audit log included",
  "Open-source frontend, yours forever",
  "Runs on your own server",
  "Free updates within your major version",
];
