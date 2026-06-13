// Marketing copy — company voice, uneven on purpose.

export type FeatureIconKey = "ai" | "chat" | "tasks" | "docs" | "video" | "calendar" | "teams" | "lock";

export const features: { icon: FeatureIconKey; title: string; body: string }[] = [
  {
    icon: "ai",
    title: "Local AI",
    body: "Ollama on your box, not someone else's API. Recap a channel, catch up on a thread, nudge about a stale task. Chats and docs stay on your server.",
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
    icon: "video",
    title: "Video",
    body: "LiveKit runs on your hardware. Calls, screen share, recordings. Transcription stays local too.",
  },
  {
    icon: "calendar",
    title: "Calendar",
    body: "Google sync works both ways. Task due dates can show up on the team calendar without another tool.",
  },
  {
    icon: "teams",
    title: "Teams",
    body: "Roles, projects, the usual permission model. The AI only sees what the logged-in user can see.",
  },
  {
    icon: "lock",
    title: "Your server",
    body: "One Docker command, SSL included, open-source frontend on GitHub. No phone home. No per-seat invoice.",
  },
];

export const steps = [
  { n: "1", title: "Run one command", body: "SSH into any Docker-capable server and run the installer. It pulls images, wires SSL, and sets up the database." },
  { n: "2", title: "Invite your team", body: "Send email invites. People open the web app or add the PWA to their home screen. No app store, no IT ticket." },
  { n: "3", title: "Stop switching tabs", body: "Chat, docs, tasks, calls, and calendar in one place. Import from Slack when you're ready to migrate." },
];

export const faqs = [
  {
    q: "I pay once and that's it?",
    a: "Yes. One license key, unlimited users, no annual renewal. Add the whole company without watching the bill climb.",
  },
  {
    q: "Where does the AI run?",
    a: "On your server via Ollama. Not our cloud, not OpenAI. It can only read what the logged-in user already has access to.",
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

export const replaces = ["Slack", "Notion", "Asana", "Zoom", "Google Calendar", "Trello", "Confluence"];

export const stats = [
  { value: "8-in-1", label: "things in one install" },
  { value: "∞", label: "people, no seat tax" },
  { value: "100%", label: "on your server" },
  { value: "<10 min", label: "to get running" },
];

/** Company story for the “Why we built it” section. */
export const whyBuilt = {
  eyebrow: "Why we built it",
  title: "Teams are tired of renting five tools",
  subtitle: "Not a pitch deck problem. A Tuesday morning problem.",
  story:
    "Most teams do not wake up wanting to map out eight modules. They wake up with Slack, Notion, and a task board already open, another renewal email in the inbox, and the sense that nothing talks to anything else. OneCamp is one workspace on a server you control. OneMana runs the company on it, and the product still changes every week.",
};

/** Builder-authentic proof (not fabricated customer quotes). */
export const socialProof = {
  quote:
    "One payment. No renewals. It runs on your server until you decide otherwise, not until we decide to raise prices.",
  author: "Akash",
  role: "Founder, OneMana",
  signals: [
    { label: "Runs in production", detail: "Same app OneMana ships from" },
    { label: "Live demo", detail: "Kick the tires first" },
    { label: "Open-source frontend", detail: "Read the code on GitHub" },
  ],
};

export const trustPoints = [
  { label: "No per-seat fees", detail: "Add your whole company" },
  { label: "Data stays yours", detail: "Runs on your server" },
  { label: "License in minutes", detail: "GST invoice included" },
  { label: "Open-source frontend", detail: "Audit the code" },
];

export const savingsPitch = {
  eyebrow: "The math",
  title: "One payment beats five subscriptions",
  body: "A 20-person team often spends $3,000 to $8,000 per year on Slack, Notion, Asana, Zoom, and calendar tools. OneCamp replaces the stack with a single install and unlimited users.",
  highlight: "Pay once. Own it forever.",
};

/** Side-by-side billing comparison — static, no animation. Shown once in #pricing. */
export const pricingComparison = {
  typical: {
    eyebrow: "What teams pay today",
    title: "Five separate subscriptions",
    rows: [
      { label: "Stack", value: "Slack, Notion, Asana, Zoom, calendar" },
      { label: "Annual spend", value: "$3,000–8,000 for ~20 people" },
      { label: "Billing", value: "Per seat, per tool, every year" },
    ],
  },
  onecamp: {
    eyebrow: "With OneCamp",
    title: "One workspace, flat pricing",
    rows: [
      { label: "Stack", value: "Chat, docs, tasks, video, calendar, AI" },
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
  "All modules incl. local AI",
  "Open-source frontend, yours forever",
  "Runs on your own server",
  "Free updates within your major version",
];