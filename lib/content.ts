// Marketing copy extracted from the existing site, refreshed for the AI era.

export const features = [
  { icon: "🤖", title: "OneCamp AI", body: "Your workspace's second brain. Ask across chats, docs, and tasks; get meeting recaps, catch-me-up summaries, and proactive nudges - all on local LLMs, zero data leaving your server." },
  { icon: "💬", title: "Real-time Chat", body: "Channels, group chats, DMs, threads, reactions, and file sharing. Stay connected without switching apps." },
  { icon: "✅", title: "Tasks & Kanban", body: "Visual boards, assignees, due dates, and project tracking. Manage work the way your team thinks." },
  { icon: "📄", title: "Collaborative Docs", body: "Rich-text documents with real-time co-editing. Wikis, meeting notes, and knowledge bases." },
  { icon: "📹", title: "Video Meetings", body: "HD calls, screen sharing, and recording with live transcription - powered by LiveKit. No third-party service." },
  { icon: "📅", title: "Calendar", body: "Shared calendar with two-way Google Calendar sync. Events, invites, and tasks on one timeline." },
  { icon: "👥", title: "Teams & Projects", body: "Organize people into teams and projects with fine-grained, role-based permissions." },
  { icon: "🔒", title: "100% Self-Hosted", body: "Your data lives on your servers. Deploy on AWS, DigitalOcean, or your own hardware. Full control, full privacy." },
];

export const steps = [
  { n: "1", title: "Install", body: "Run our one-line command on any server. Docker handles the rest - including your SSL certificate." },
  { n: "2", title: "Invite", body: "Send invites to your team. They log in on the web or install the PWA on their phone - no app store needed." },
  { n: "3", title: "Collaborate", body: "Chat, create tasks, write docs, and jump on calls - all from one place. Your data never leaves your server." },
];

export const faqs = [
  { q: "What does \"one-time payment\" actually mean?", a: "You pay once and receive a license key. Use OneCamp forever - no renewals, no annual subscriptions, no per-seat charges. Add as many users as you want at no extra cost." },
  { q: "How does OneCamp AI work? Does it send my data to external servers?", a: "OneCamp AI runs entirely on your server using Ollama with local LLMs. Your conversations, documents, and tasks are never sent to a third-party API. It uses permission-aware retrieval, so it can only access what you can see." },
  { q: "Do I need a GPU for OneCamp AI?", a: "No. OneCamp AI works on CPU-only servers; the default 3B model runs well on 4+ cores with 16 GB RAM. A GPU makes responses faster and lets you run larger models." },
  { q: "Can we import Slack or Teams data into OneCamp?", a: "Yes - OneCamp includes a Slack import. Bring your historical channels and messages across when you migrate." },
  { q: "Does each user have to install it?", a: "No - one person installs it on a server you control. Everyone else just logs in via the web or adds the PWA to their phone." },
  { q: "Are native iOS and Android apps available?", a: "OneCamp runs beautifully on the mobile web and as a PWA you launch from your home screen, with push notifications and app badges - no app store required." },
  { q: "Can I run OneCamp on a shared server like DigitalOcean?", a: "Absolutely. Wherever you can host something like WordPress, you can host OneCamp. It's a Docker deploy - connect to your server and run one command." },
  { q: "What are the system requirements?", a: "Small teams (<50): 8 GB RAM, 4 vCPU. 50–200 users: 16 GB RAM. Heavy video/AI usage: 32 GB RAM, 16 CPU. With local-LLM AI, 16 GB RAM is recommended. SSL is set up automatically." },
  { q: "What if I buy it and can't get it installed?", a: "The install script handles Docker, SSL, the database, and AI models. Most installs finish in under 10 minutes. If you hit a snag, open a GitHub issue and we'll help." },
  { q: "What happens if OneMana shuts down?", a: "The frontend is open-source on GitHub, and the backend binary is yours the moment you buy it - it runs on your server with no phone-home. Your instance keeps running indefinitely." },
  { q: "How does it compare to Mattermost or Rocket.Chat?", a: "Those are great chat tools - but they're just chat. OneCamp is a unified workspace: chat, Kanban, docs, video with recording & transcription, calendar, and a local AI assistant, all in one install with no per-seat pricing." },
  { q: "How much does it cost to run?", a: "A ~$12/month droplet (4 vCPU, 8 GB) comfortably runs OneCamp for teams under 50. Compare that to per-seat SaaS that runs into thousands per year." },
];

export const requirements = [
  { team: "Small Team (<50)", ram: "8 GB", cpu: "4 vCPU", ai: "Basic" },
  { team: "Medium (50–200)", ram: "16 GB", cpu: "4 CPU", ai: "✅ Recommended" },
  { team: "Large (200–1000)", ram: "32 GB", cpu: "16 CPU", ai: "✅ + GPU optional" },
  { team: "Enterprise (1000+)", ram: "64 GB", cpu: "32 CPU", ai: "✅ + GPU recommended" },
];

// Tools OneCamp consolidates into one self-hosted deploy.
export const replaces = ["Slack", "Notion", "Asana", "Zoom", "Google Calendar", "Trello", "Confluence"];

export const stats = [
  { value: "8-in-1", label: "tools, one deploy" },
  { value: "∞", label: "users, no per-seat fees" },
  { value: "100%", label: "self-hosted & private" },
  { value: "<10 min", label: "to a running install" },
];

// OneCamp Cloud (managed hosting) selling points.
export const cloudBenefits = [
  "Fully managed hosting on your own subdomain",
  "Automatic backups, updates & monitoring",
  "We handle SSL, scaling, and uptime",
  "Includes a self-host license - switch anytime",
  "We set everything up within 12 hours",
];

export const lifetimeBenefits = [
  "Unlimited users - no per-seat fees",
  "All modules incl. local AI",
  "Open-source frontend, yours forever",
  "Runs on your own server",
  "Free updates within your major version",
];

