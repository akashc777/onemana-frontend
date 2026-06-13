// Marketing copy in builder voice, aligned with akash.page blog tone.

export type FeatureIconKey = "ai" | "chat" | "tasks" | "docs" | "video" | "calendar" | "teams" | "lock";

export const features: { icon: FeatureIconKey; title: string; body: string }[] = [
  {
    icon: "ai",
    title: "Local AI assistant",
    body: "Runs on Ollama on your server. Ask across chats, docs, and tasks: meeting recaps, catch-me-up, proactive nudges. Nothing leaves your infrastructure.",
  },
  {
    icon: "chat",
    title: "Chat & channels",
    body: "Channels, DMs, threads, reactions, file sharing. MQTT-backed real-time delivery, the same stack OneMana runs in production every day.",
  },
  {
    icon: "tasks",
    title: "Tasks & kanban",
    body: "Boards, assignees, due dates, project views. Not a bolt-on. Tasks live inside the same workspace as your conversations.",
  },
  {
    icon: "docs",
    title: "Collaborative docs",
    body: "Notion-style editor with real-time co-editing, block handles, and slash commands. Wikis and meeting notes without a second tab.",
  },
  {
    icon: "video",
    title: "Video meetings",
    body: "HD calls, screen share, recording, live transcription via LiveKit on your server. No Zoom bill, no third-party relay.",
  },
  {
    icon: "calendar",
    title: "Team calendar",
    body: "Shared events with two-way Google Calendar sync. Invites and deadlines on one timeline instead of five apps.",
  },
  {
    icon: "teams",
    title: "Teams & permissions",
    body: "Organize people into teams and projects with role-based access. The AI respects the same boundaries you set.",
  },
  {
    icon: "lock",
    title: "Self-hosted by default",
    body: "Your data on your server. Docker deploy, one command, SSL included. Open-source frontend. No phone-home, no per-seat tax.",
  },
];

export const steps = [
  { n: "1", title: "Run one command", body: "SSH into any Docker-capable server and run the installer. It pulls images, wires SSL, and sets up the database." },
  { n: "2", title: "Invite your team", body: "Send email invites. People open the web app or add the PWA to their home screen. No app store, no IT ticket." },
  { n: "3", title: "Stop switching tabs", body: "Chat, docs, tasks, calls, and calendar in one place. Import from Slack when you're ready to migrate." },
];

export const faqs = [
  { q: "What does \"one-time payment\" actually mean?", a: "You pay once and receive a license key. Use OneCamp forever. No renewals, no annual subscriptions, no per-seat charges. Add as many users as you want at no extra cost." },
  { q: "How does OneCamp AI work? Does it send my data to external servers?", a: "OneCamp AI runs entirely on your server using Ollama with local LLMs. Your conversations, documents, and tasks are never sent to a third-party API. It uses permission-aware retrieval, so it can only access what you can see." },
  { q: "Do I need a GPU for OneCamp AI?", a: "No. OneCamp AI works on CPU-only servers; the default 3B model runs well on 4+ cores with 16 GB RAM. A GPU makes responses faster and lets you run larger models." },
  { q: "Can we import Slack or Teams data into OneCamp?", a: "Yes. OneCamp includes a Slack import. Bring your historical channels and messages across when you migrate." },
  { q: "Does each user have to install it?", a: "No. One person installs it on a server you control. Everyone else just logs in via the web or adds the PWA to their phone." },
  { q: "Are native iOS and Android apps available?", a: "OneCamp runs beautifully on the mobile web and as a PWA you launch from your home screen, with push notifications and app badges. No app store required." },
  { q: "Can I run OneCamp on a shared server like DigitalOcean?", a: "Absolutely. Wherever you can host something like WordPress, you can host OneCamp. It's a Docker deploy. Connect to your server and run one command." },
  { q: "What are the system requirements?", a: "Small teams (<50): 8 GB RAM, 4 vCPU. 50–200 users: 16 GB RAM. Heavy video/AI usage: 32 GB RAM, 16 CPU. With local-LLM AI, 16 GB RAM is recommended. SSL is set up automatically." },
  { q: "What if I buy it and can't get it installed?", a: "The install script handles Docker, SSL, the database, and AI models. Most installs finish in under 10 minutes. If you hit a snag, open a GitHub issue and we'll help." },
  { q: "What happens if OneMana shuts down?", a: "The frontend is open-source on GitHub, and the backend binary is yours the moment you buy it. It runs on your server with no phone-home. Your instance keeps running indefinitely." },
  { q: "How does it compare to Mattermost or Rocket.Chat?", a: "Those are great chat tools, but they're just chat. OneCamp is a unified workspace: chat, Kanban, docs, video with recording & transcription, calendar, and a local AI assistant, all in one install with no per-seat pricing." },
  { q: "How much does it cost to run?", a: "A ~$12/month droplet (4 vCPU, 8 GB) comfortably runs OneCamp for teams under 50. Compare that to per-seat SaaS that runs into thousands per year." },
];

export const requirements = [
  { team: "Small Team (<50)", ram: "8 GB", cpu: "4 vCPU", ai: "Basic" },
  { team: "Medium (50–200)", ram: "16 GB", cpu: "4 CPU", ai: "Recommended" },
  { team: "Large (200–1000)", ram: "32 GB", cpu: "16 CPU", ai: "+ GPU optional" },
  { team: "Enterprise (1000+)", ram: "64 GB", cpu: "32 CPU", ai: "+ GPU recommended" },
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
    "Mornings at OneMana used to start with Slack, Notion, and a task board open before anyone had finished their coffee. OneCamp exists because the team wanted one place on a server they control. OneMana runs on it every day. It is not perfect, but it is theirs, and that matters.",
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