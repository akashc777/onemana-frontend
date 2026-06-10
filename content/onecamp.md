# OneMana

- page: onecamp
- route: /onemana
- content_type: Page Builder


## Block 1: Spacer

**height:**

0


## Block 2: Spacer

**height:**

0


## Block 3: Hero

**title:**

One workspace. <br/>Yours forever.

**subtitle:**

Replaces Slack, Doc, Asana, Zoom, and Google Calendar in a single Docker deploy. No per-seat fees. No subscriptions. No lock-in. Self-hosted. One-time payment. Your data, your server

**primary_action_label:**

Get OneCamp - $19 One-Time

**primary_action:**

/onecamp-product

**secondary_action_label:**

Try Live Demo →

**secondary_action:**

https://onecamp.onemana.dev/

**align:**

Center


## Block 4: Spacer

**height:**

16


## Block 5: Video

**video_type:**

YouTube

**youtube_id:**

hh5gwvLsAjA

**title:**

OneCamp demo

**autoplay:**

0

**loop:**

0

**max_width:**

800

**align:**

Center


## Block 6: Spacer

**height:**

20


## Block 7: Primary Button

**label:**

Setup Docs 📄

**link:**

/onemana-doc

**align:**

Center


## Block 8: Section with Features

**title:**

Everything Your Team Needs

**subtitle:**

Eight powerful modules, one unified workspace - all self-hosted on your servers.

**columns:**

3

**features:**

[
  {
    "title": "💬  Real-time Chat",
    "content": "Channels, group chats, DMs, threads, reactions, and file sharing. Stay connected without switching apps.",
    "idx": 1,
    "name": "niszxxu3"
  },
  {
    "title": "✅  Tasks & Kanban",
    "content": "Visual boards, assignees, due dates, and project tracking. Manage work the way your team thinks.",
    "idx": 2,
    "name": "0f88kh7u"
  },
  {
    "title": "📄  Collaborative Docs",
    "content": "Rich-text documents with real-time co-editing. Create wikis, meeting notes, and knowledge bases.",
    "idx": 3,
    "name": "x4g7i0x0"
  },
  {
    "title": "📹  Video Meetings",
    "content": "HD video calls, screen sharing, and recording - powered by LiveKit. No third-party service needed.",
    "idx": 4,
    "name": "qycrv2tu"
  },
  {
    "title": "👥  Teams & Projects",
    "content": "Organize people into teams, create projects, and control who sees what with fine-grained permissions.",
    "idx": 5,
    "name": "rnkn65hb"
  },
  {
    "title": "📅 Calendar",
    "content": "Shared calendar with bidirectional Google Calendar sync. Create events, invite participants, and see tasks on your timeline - changes sync instantly both ways.",
    "idx": 6,
    "name": "w46ayhl2"
  },
  {
    "title": "🤖 OneCamp AI",
    "content": "Your workspace's secondary brain. Ask anything across chats, docs, and tasks - powered by local LLMs running entirely on your server. Create tasks, search conversations, and get meeting transcriptions. Zero data leaves your infrastructure.",
    "idx": 7,
    "name": "ai_feature_1"
  },
  {
    "title": "🔒  100% Self-Hosted",
    "content": "Your data lives on your servers. Full control, full privacy. Deploy anywhere - AWS, DigitalOcean, or your own hardware.",
    "idx": 8,
    "name": "68v55rcq"
  }
]


## Block 9: Spacer

**height:**

16


## Block 10: Card Grid

**cards:**

<div class="card-item" style="text-align:center;"><div class="card-icon" style="font-size:2.5rem;">1️⃣</div><h3>Install</h3><p>Run our one-line <code>onemana</code> command on any server. Docker handles the rest - including your SSL certificate.</p></div><div class="card-item" style="text-align:center;"><div class="card-icon" style="font-size:2.5rem;">2️⃣</div><h3>Invite</h3><p>Send invites to your team. They log in via the web or install the PWA on their phone - no app store needed.</p></div><div class="card-item" style="text-align:center;"><div class="card-icon" style="font-size:2.5rem;">3️⃣</div><h3>Collaborate</h3><p>Chat, create tasks, write docs, and jump on calls - all from one place. Your data never leaves your server.</p></div>

**title:**

Up and Running in 3 Steps

**subtitle:**

No complicated setup. One person installs it, everyone else just logs in.

**columns:**

3

**gap:**

24

**max_width:**

900

**align:**

Center


## Block 11: Spacer

**height:**

16


## Block 12: Highlight Box

**content:**

OneCamp runs beautifully on desktop, tablet, and mobile - as a web app or a PWA you launch right from your home screen. Get push notifications, app badges, and a native-like experience without downloading from any app store.

**title:**

📱 Works on Every Device

**bg_color:**

#f0f9ff

**accent_color:**

#2563eb

**font_size:**

15

**color:**

#475569

**max_width:**

720


## Block 13: Spacer

**height:**

16


## Block 14: FAQ Accordion

**items:**

<details><summary>Are native iOS and Android apps available?</summary><div class="faq-answer">OneCamp is designed to work beautifully on the mobile web - either as a tab in your browser or as a PWA (Progressive Web App) you can launch from your home screen like any other app. You get badges on your icon and push notifications, just like native apps.</div></details><details><summary>Can I run OneCamp on a shared server like DigitalOcean?</summary><div class="faq-answer">Absolutely. Wherever you can host something like WordPress, you can host OneCamp. It is packaged as a Docker container - just connect to your server and run a single command. Works on your own hardware, AWS, DigitalOcean, or any cloud provider.</div></details><details><summary>Can we import Slack or Teams data into OneCamp?</summary><div class="faq-answer">Not at this time. OneCamp is a fresh start - a clean, unified workspace without legacy baggage.</div></details><details><summary>Does each user have to download and install it?</summary><div class="faq-answer">Nope - one person installs it on a server you control (remote or local). Once it is running, just invite your co-workers and they log in via the web or add the PWA to their mobile devices.</div></details><details><summary>What are the system requirements?</summary><div class="faq-answer">OneCamp runs as a set of Docker containers. For a small team (under 50 users): 8 GB RAM and 4 vCPUs minimum. For 50-200 users: 16 GB RAM and 4 CPUs. For large teams with heavy video and AI usage: 32 GB RAM and 16 CPUs. If you enable OneCamp AI with local LLMs, we recommend at least 16 GB RAM. We automatically set up an SSL certificate for your domain during installation.</div></details><details><summary>How does OneCamp AI work? Does it send my data to external servers?</summary><div class="faq-answer">OneCamp AI runs entirely on your server using Ollama with local LLMs. Your conversations, documents, and tasks are never sent to any third-party API. The AI uses permission-aware RAG (Retrieval-Augmented Generation) to search across your workspace data - it can only access what you have permission to see. It can also create tasks, search messages, and transcribe meeting recordings.</div></details><details><summary>What AI models does OneCamp use?</summary><div class="faq-answer">By default, OneCamp uses Llama 3.2 (3B) for chat and reasoning, and nomic-embed-text for semantic search embeddings. Both models run locally via Ollama. You can swap in any Ollama-compatible model - including larger models like Llama 3.1 (8B or 70B) if you have a GPU. No API keys or external subscriptions needed.</div></details><details><summary>Do I need a GPU for OneCamp AI?</summary><div class="faq-answer">No, OneCamp AI works on CPU-only servers. The default 3B model runs well on 4+ CPU cores with 16 GB RAM. However, if you want faster responses or want to run larger models, an NVIDIA GPU is recommended. OneCamp includes NVIDIA GPU passthrough configuration in its Docker setup.</div></details><details><summary>What does "one-time payment" actually mean?</summary><div class="faq-answer">You pay $19 once and receive a license key. You use OneCamp forever — no renewal fees, no annual subscriptions, no per-seat charges. Add as many users as you want at no extra cost. The software is yours permanently.</div></details><details><summary>What if I buy it and can't get it installed?</summary><div class="faq-answer">Our install script handles everything — Docker setup, SSL certificates, database initialization, and AI model downloads. Most installs complete in under 10 minutes. If you run into any issues, open a GitHub issue and we'll help you get running.</div></details><details><summary>How much does it cost to run OneCamp? What server do I need?</summary><div class="faq-answer">A $12/month DigitalOcean droplet (4 vCPU, 8 GB RAM) comfortably runs OneCamp for teams under 50 people. Compare that to Slack Pro ($8.75/user/month) + Notion ($10/user/month) + Zoom ($13/user/month) — for a 20-person team, that's over $7,500/year in SaaS fees vs roughly $144/year for your server. OneCamp pays for itself in the first week.</div></details><details><summary>What happens if OneMana shuts down?</summary><div class="faq-answer">The frontend is fully open-source (MIT licensed) on GitHub. The backend binary is yours the moment you purchase it — it runs on your server with no phone-home requirement. Even if OneMana disappeared tomorrow, your OneCamp instance would keep running indefinitely.</div></details><details><summary>How does OneCamp compare to Mattermost or Rocket.Chat?</summary><div class="faq-answer">Mattermost and Rocket.Chat are excellent chat tools — but they're just chat. OneCamp is a unified workspace: real-time chat, Kanban task management, collaborative documents, video meetings with recording &amp; transcription, calendar with Google sync, and a local AI assistant. All in one install. No plugin marketplace. No integration setup. And no per-seat pricing — Mattermost Professional costs $10/user/month.</div></details>

**title:**

Frequently Asked Questions

**max_width:**

800

**align:**

Center


## Block 15: Spacer

**height:**

16


## Block 16: Rich Text Block

**content:**

<div style="max-width:720px; margin:0 auto;"><h2 style="text-align:center; font-size:24px; font-weight:700; color:#1e293b; margin-bottom:8px;">System Requirements</h2><p style="text-align:center; color:#64748b; margin-bottom:24px;">OneCamp is packaged as Docker containers. Run our <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:14px;">onemana</code> command and we handle the rest - docker deploy, SSL certificates, and AI model setup.</p><table style="width:100%; border-collapse:collapse; text-align:center; font-size:15px;"><thead><tr style="border-bottom:2px solid #e2e8f0;"><th style="padding:12px 16px; color:#64748b; font-weight:600;">Team Size</th><th style="padding:12px 16px; color:#64748b; font-weight:600;">RAM</th><th style="padding:12px 16px; color:#64748b; font-weight:600;">CPU</th><th style="padding:12px 16px; color:#64748b; font-weight:600;">AI Ready</th></tr></thead><tbody><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:12px 16px; font-weight:600; color:#1e293b;">Small Team (&lt;50)</td><td style="padding:12px 16px; color:#334155;">8 GB</td><td style="padding:12px 16px; color:#334155;">4 vCPU</td><td style="padding:12px 16px; color:#334155;">Basic</td></tr><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:12px 16px; font-weight:600; color:#1e293b;">Medium (50-200)</td><td style="padding:12px 16px; color:#334155;">16 GB</td><td style="padding:12px 16px; color:#334155;">4 CPU</td><td style="padding:12px 16px; color:#334155;">✅ Recommended</td></tr><tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:12px 16px; font-weight:600; color:#1e293b;">Large (200-1000)</td><td style="padding:12px 16px; color:#334155;">32 GB</td><td style="padding:12px 16px; color:#334155;">16 CPU</td><td style="padding:12px 16px; color:#334155;">✅ + GPU optional</td></tr><tr><td style="padding:12px 16px; font-weight:600; color:#1e293b;">Enterprise (1000+)</td><td style="padding:12px 16px; color:#334155;">64 GB</td><td style="padding:12px 16px; color:#334155;">32 CPU</td><td style="padding:12px 16px; color:#334155;">✅ + GPU recommended</td></tr></tbody></table><p style="text-align:center; color:#94a3b8; margin-top:16px; font-size:13px;">OneCamp AI uses Ollama with local LLMs. The default 3B model runs on CPU; larger models benefit from NVIDIA GPU.</p></div>

**font_size:**

16

**color:**

#475569

**max_width:**

800

**padding_top:**

16

**padding_bottom:**

16


## Block 17: Spacer

**height:**

16


## Block 18: Section with CTA

**title:**

Ready to Own Your Workspace?

**subtitle:**

Get OneCamp for just ₹2,000 ($19). Deploy your own self-hosted workspace in minutes. No per-seat fees. No vendor lock-in. Own your data forever.

**cta_label:**

Get OneCamp →

**cta_url:**

/onecamp-product

**cta_description:**



**show_confetti:**

0


## Block 19: Spacer

**height:**

16


## Block 20: Twitter Testimonials

**title:**

What People Are Saying

**subtitle:**

Join teams who have already made the switch to self-hosted collaboration

**tweet_list:**

[
  {
    "url": "https://twitter.com/mrterrycarson/status/2031081627053326510",
    "name": "hqvzqis75v",
    "idx": 1
  }
]

