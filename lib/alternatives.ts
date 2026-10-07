/**
 * "Alternative to X" pages: people shopping for a tool search for the one
 * they want to leave. Same template as the audience pages (app/alternatives
 * renders through AudienceView), with two extra parts: where the rival is
 * genuinely better, and how to move.
 *
 * The rules of lib/compare.ts apply. Every claim about a rival is structural
 * (how it is billed, whether something exists), carries its pricing page as
 * the source, and was read on ALTERNATIVES_CHECKED. Prices themselves move in
 * weeks, so none are quoted. Every claim about OneCamp is a shipped feature,
 * and every "how to move" step is something the importer or app does today.
 */
import type { Audience } from "@/lib/audiences";

/** The day each rival's `source` was read. Update when the claims are rechecked. */
export const ALTERNATIVES_CHECKED = "October 2026";

export const alternatives: Audience[] = [
  {
    slug: "slack",
    label: "Slack",
    eyebrow: "A self-hosted alternative to Slack",
    title: "Your team's chat, on a server you own",
    subtitle:
      "Channels, threads, DMs, calls and search, plus tasks, docs and a calendar in the same place. Bring your Slack history, or keep both running while people move.",
    seoTitle: "Self-hosted Slack alternative: OneCamp, open source and free for 25 people",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to Slack: channels, threads, calls and search, with tasks, docs and calendar built in. Import your Slack history or bridge channels both ways.",
    points: [
      { icon: "chat", title: "Everything you use in Slack", body: "Channels, threads, DMs, mentions, reactions, scheduled messages, calls with screen sharing, and search across all of it." },
      { icon: "lock", title: "Your history stays yours", body: "Messages live on your server with no age limit, and nothing leaves it unless you connect something that sends it." },
      { icon: "tasks", title: "Work next to the talk", body: "Turn a message into a task, keep docs and whiteboards beside the channel, and see the calendar in the same app." },
      { icon: "teams", title: "No per-seat bill", body: "Free for up to 25 people. Past that, one licence covers everyone on your server, and AI agents never take a seat." },
      { icon: "agent", title: "Agents that can't overstep", body: "AI agents act only where the person behind them can, and every action is logged before it runs." },
      { icon: "automation", title: "Guests from other companies", body: "Share one channel with a client or partner from a link, with no account, and they see nothing else." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people. A licence is paid once, not every month per person.",
    faqs: [
      { q: "Can we bring our Slack history?", a: "Yes. Import a Slack export (channels, threads, files and who said what) from Admin → Import. It can be rolled back if you change your mind." },
      { q: "Do we have to switch everyone at once?", a: "No. The Slack bridge links a Slack channel and a OneCamp channel so both carry one conversation, both ways, while people move over." },
      { q: "Is there an app for phones and desktops?", a: "Yes: the web app installs on phones, and there's a desktop app for macOS, Windows and Linux." },
    ],
    proof: { label: "Installation guide", href: "/docs/installation" },
    rival: {
      name: "Slack",
      billing: "Per active user, per month. The free plan hides messages older than 90 days.",
      theyWin: [
        "Thousands of ready-made integrations and a huge app directory.",
        "Slack Connect with other companies that already use Slack.",
        "Nothing to run yourself: no server to keep updated.",
      ],
      source: "https://slack.com/pricing",
    },
    move: {
      title: "Moving from Slack",
      steps: [
        "Install OneCamp on a server (one command; onemana.dev/free gives it to you).",
        "In Slack, export your workspace; in OneCamp, upload it under Admin → Import.",
        "Link the channels people still use with the Slack bridge, so nothing is missed during the move.",
        "Invite your team, then turn the bridge off when the last person has moved.",
      ],
    },
  },
  {
    slug: "basecamp",
    label: "Basecamp",
    eyebrow: "A self-hosted alternative to Basecamp",
    title: "Projects, chat and clients, with nothing per seat",
    subtitle:
      "Projects with boards and repeating tasks, channels for the team, and a link that lets a client follow their project. On your own server, free for up to 25 people.",
    seoTitle: "Self-hosted Basecamp alternative: OneCamp, with client links and time tracking",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to Basecamp: projects, chat, docs and a client link to follow their project, plus time tracking, booking pages and intake forms.",
    points: [
      { icon: "tasks", title: "Projects your way", body: "Lists, boards, a timeline, cycles, repeating tasks and saved views, with statuses you name yourself." },
      { icon: "docs", title: "Clients follow their project", body: "Send a client a link to their project: status, dates and comments if you allow them. No account needed." },
      { icon: "table", title: "Time you can bill", body: "Timers and time added by hand on any task, with a report and CSV export per project." },
      { icon: "calendar", title: "Booking pages and forms", body: "Clients book calls in your free time and send requests through forms that become tasks." },
      { icon: "chat", title: "Real-time chat", body: "Channels, threads, DMs and calls for the team, with guests from outside when you want them." },
      { icon: "lock", title: "On your server", body: "Open source, self-hosted, and paid once if you grow past the free plan." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Do clients need an account?", a: "No. A client link opens one project (or one channel) and nothing else in the workspace." },
      { q: "Can we import from Basecamp?", a: "Not directly yet. Projects from Trello, Asana, Jira, Linear, ClickUp, Todoist and Notion task databases import from Admin → Import." },
    ],
    proof: { label: "Share a project with a client", href: "/docs/share-a-project-with-a-client" },
    rival: {
      name: "Basecamp",
      billing: "Per user, or a flat monthly price for unlimited users. Clients and guests are free.",
      theyWin: [
        "A calm, opinionated product with twenty years of polish.",
        "Hill charts and automatic check-ins built into every project.",
        "Hosted for you, with nothing to install.",
      ],
      source: "https://basecamp.com/pricing",
    },
    move: {
      title: "Moving from Basecamp",
      steps: [
        "Install OneCamp and create a team for each group of projects.",
        "Recreate active projects (or import them if you keep a copy in Trello, Asana or another supported tool).",
        "Share each project with its client from the globe button, and turn on comments if they used Basecamp's.",
      ],
    },
  },
  {
    slug: "notion",
    label: "Notion",
    eyebrow: "A self-hosted alternative to Notion",
    title: "Docs and tasks, with the chat in the same place",
    subtitle:
      "Collaborative docs, task projects and tables, plus channels, calls and a calendar, so the decision and the discussion live together. On your own server.",
    seoTitle: "Self-hosted Notion alternative: OneCamp docs, tasks and chat in one app",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to Notion: real-time docs, tables and task projects, with chat, calls and calendar built in, and AI that runs on your own model.",
    points: [
      { icon: "docs", title: "Docs you write together", body: "Real-time editing, comments, mentions and templates, with history kept on your server." },
      { icon: "table", title: "Tables and projects", body: "Tables for structured data and projects with lists, boards and cycles for the work itself." },
      { icon: "chat", title: "The conversation next door", body: "Channels and threads for the team, so a doc's discussion doesn't move to another app." },
      { icon: "ai", title: "AI on your terms", body: "Use your own model provider or run one locally; agents only reach what their person can." },
      { icon: "teams", title: "No per-member bill", body: "Free for up to 25 people, then one licence for everyone, paid once." },
      { icon: "lock", title: "Self-hosted and open source", body: "AGPL-licensed source, on a server you choose." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from Notion?", a: "Task databases come across as projects, with each row a task. Pages and wikis are copied over by hand for now." },
      { q: "Does the AI need an API key?", a: "No: run a local model on the same server, or bring a key from the provider you prefer." },
    ],
    proof: { label: "Installation guide", href: "/docs/installation" },
    rival: {
      name: "Notion",
      billing: "Per member, per month. Its full AI is part of the Business plan and above.",
      theyWin: [
        "A deeper page builder: databases with many views, relations and formulas.",
        "A huge template gallery and a large community.",
        "Hosted for you, with offline apps on every platform.",
      ],
      source: "https://www.notion.com/pricing",
    },
    move: {
      title: "Moving from Notion",
      steps: [
        "Create a Notion integration and share your task databases with it.",
        "In OneCamp, Admin → Import → Notion: each database becomes a project.",
        "Recreate key pages as docs; link them from the project they belong to.",
      ],
    },
  },
  {
    slug: "clickup",
    label: "ClickUp",
    eyebrow: "A self-hosted alternative to ClickUp",
    title: "Tasks, chat and time tracking, without the per-seat bill",
    subtitle:
      "Projects with lists, boards, a timeline, cycles and saved views; channels and calls; time on tasks with an invoice-ready export. On a server you own.",
    seoTitle: "Self-hosted ClickUp alternative: OneCamp, free for up to 25 people",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to ClickUp: tasks with boards and cycles, chat and calls, docs, time tracking and client links. Import your ClickUp workspace.",
    points: [
      { icon: "tasks", title: "Tasks that fit the team", body: "Lists, boards, a timeline, cycles, repeating tasks, custom statuses and saved views per person." },
      { icon: "table", title: "Time on tasks", body: "Timers and manual time, billable or not, with a report by person and task and a CSV export." },
      { icon: "chat", title: "Chat built in", body: "Channels, threads, DMs and calls, so status updates don't need a separate tool." },
      { icon: "docs", title: "Clients without accounts", body: "Share one project or channel with a client from a link, and take forms and bookings from them." },
      { icon: "teams", title: "Everyone included", body: "Free for up to 25 people, then one licence for everyone on your server." },
      { icon: "lock", title: "On your server", body: "Open source and self-hosted: your tasks and time never sit with a vendor." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from ClickUp?", a: "Yes. Admin → Import → ClickUp brings spaces and lists across as projects, with tasks, statuses, assignees and comments." },
      { q: "Is there time tracking?", a: "Yes, on every task, with a project report and CSV export for invoices." },
    ],
    proof: { label: "Time tracking", href: "/docs/time-tracking" },
    rival: {
      name: "ClickUp",
      billing: "Per user, per month, with AI sold on top of the plan.",
      theyWin: [
        "More views (workload, mind maps), task dependencies on the Gantt chart, and deeper dashboards.",
        "Goals and portfolio reporting across many teams.",
        "Hosted for you, with nothing to run.",
      ],
      source: "https://clickup.com/pricing",
    },
    move: {
      title: "Moving from ClickUp",
      steps: [
        "Make a ClickUp API token (Settings → Apps).",
        "In OneCamp, Admin → Import → ClickUp, and pick the spaces to bring.",
        "Invite the team; people who were assigned tasks keep them.",
      ],
    },
  },
  {
    slug: "toggl",
    label: "Toggl",
    eyebrow: "A self-hosted alternative to Toggl Track",
    title: "Track time where the work already is",
    subtitle:
      "Start a timer on the task you're doing, or add time by hand, and export a project's billable hours for the invoice. No separate app, no separate bill.",
    seoTitle: "Toggl Track alternative with tasks built in: OneCamp time tracking",
    seoDescription:
      "OneCamp tracks time on tasks: timers, manual entries, billable or not, and a per-project report with CSV export. Open source, self-hosted, free for up to 25 people.",
    points: [
      { icon: "table", title: "Time on the task", body: "Start a timer from the task itself, so every hour is already tied to the work and the project." },
      { icon: "automation", title: "A timer you can't lose", body: "The running timer follows you around the app; starting another stops the first." },
      { icon: "docs", title: "Invoice-ready export", body: "Billable totals and hours to two decimals, by person and by task, as a CSV in your time zone." },
      { icon: "tasks", title: "And the rest of the work", body: "Projects, chat, docs and a calendar in the same app, so the timer isn't another tool." },
      { icon: "teams", title: "Every tracker included", body: "Free for up to 25 people, so contractors log time without a seat each." },
      { icon: "lock", title: "Your hours on your server", body: "Time data never sits with a vendor." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can I set billable rates?", a: "Each entry is billable or not; the export gives billable hours per person and task, ready to multiply by your rate." },
      { q: "Is there a desktop timer?", a: "The timer runs in the web and desktop apps, and keeps running if you close the task." },
    ],
    proof: { label: "Time tracking", href: "/docs/time-tracking" },
    rival: {
      name: "Toggl Track",
      billing: "Per user, per month. Billable rates need a paid plan.",
      theyWin: [
        "Rates per person and project, with money totals in the reports.",
        "Browser extensions that add a timer to dozens of other apps.",
        "Idle detection and reminders to track.",
      ],
      source: "https://toggl.com/track/pricing/",
    },
    move: {
      title: "Moving from Toggl",
      steps: [
        "Export your Toggl reports as CSV for your records.",
        "Create projects in OneCamp (or import them from your task tool).",
        "Start timers from tasks from now on; the project report replaces the Toggl one.",
      ],
    },
  },
];

export const alternativeBySlug = (slug: string) => alternatives.find((a) => a.slug === slug);
