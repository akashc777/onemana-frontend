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
      { icon: "chat", title: "Everything you use in Slack", body: "Channels, threads, DMs, mentions, reactions, scheduled messages, voice, video and screen clips, calls with screen sharing, check-ins that ask a channel a question on a schedule, and search across all of it. Plus read receipts in DMs, which Slack never added." },
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
      { icon: "tasks", title: "Projects your way", body: "Lists, boards, a timeline with dependencies, cycles, repeating tasks and saved views, with statuses you name yourself." },
      { icon: "docs", title: "Clients follow their project", body: "Send a client a link to their project: status, dates and comments if you allow them. No account needed." },
      { icon: "table", title: "Time you can bill", body: "Timers or time added by hand on any task, hourly rates per person, and a report that says what the time comes to, with CSV and invoices." },
      { icon: "calendar", title: "Booking pages and forms", body: "Clients book calls in your free time and send requests through forms that become tasks." },
      { icon: "chat", title: "Real-time chat", body: "Channels, threads, DMs and calls for the team, check-ins that ask a question on a schedule, and guests from outside when you want them." },
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
        "Hill charts, which show where each piece of work stands by feel, in every project.",
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
      { icon: "table", title: "Tables and projects", body: "Tables with formulas, sorting and filters, whose rows link to other tables' rows, with rollups that add them up, and to tasks, docs and people; and projects with lists, boards and cycles for the work itself." },
      { icon: "chat", title: "The conversation next door", body: "Channels and threads for the team, so a doc's discussion doesn't move to another app." },
      { icon: "ai", title: "AI on your terms", body: "Use your own model provider or run one locally; agents only reach what their person can." },
      { icon: "teams", title: "No per-member bill", body: "Free for up to 25 people, then one licence for everyone, paid once." },
      { icon: "lock", title: "Self-hosted and open source", body: "AGPL-licensed source, on a server you choose." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from Notion?", a: "Task databases come across as projects, with each row a task and the database's other properties as custom fields. Pages and wikis are copied over by hand for now." },
      { q: "Does the AI need an API key?", a: "No: run a local model on the same server, or bring a key from the provider you prefer." },
    ],
    proof: { label: "Installation guide", href: "/docs/installation" },
    rival: {
      name: "Notion",
      billing: "Per member, per month. Its full AI is part of the Business plan and above.",
      theyWin: [
        "A deeper page builder: nested pages, and databases with more views, such as gallery and timeline.",
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
      "Projects with lists, boards, a timeline with dependencies, a workload by person and week, cycles, saved views and goals; channels and calls; time on tasks with an invoice-ready export. On a server you own.",
    seoTitle: "Self-hosted ClickUp alternative: OneCamp, free for up to 25 people",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to ClickUp: tasks with boards and cycles, chat and calls, docs, time tracking and client links. Import your ClickUp workspace.",
    points: [
      { icon: "tasks", title: "Tasks that fit the team", body: "Lists, boards, a timeline where tasks wait on each other, a workload by week, cycles with burndown, repeating tasks, statuses and fields of your own, saved views, goals, and reports with the flow of work on every plan." },
      { icon: "table", title: "Time on tasks", body: "Timers and manual time, billable or not, with a report by person and task and a CSV export." },
      { icon: "chat", title: "Chat built in", body: "Channels, threads, DMs and calls, so status updates don't need a separate tool." },
      { icon: "docs", title: "Clients without accounts", body: "Share one project or channel with a client from a link, and take forms and bookings from them." },
      { icon: "teams", title: "Everyone included", body: "Free for up to 25 people, then one licence for everyone on your server." },
      { icon: "lock", title: "On your server", body: "Open source and self-hosted: your tasks and time never sit with a vendor." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from ClickUp?", a: "Yes. Admin → Import → ClickUp brings spaces and lists across as projects, with tasks, statuses, assignees, comments and custom fields." },
      { q: "Is there time tracking?", a: "Yes, on every task, with a project report, CSV export, and invoices you save, send and mark paid." },
    ],
    proof: { label: "Time tracking", href: "/docs/time-tracking" },
    rival: {
      name: "ClickUp",
      billing: "Per user, per month, with AI sold on top of the plan.",
      theyWin: [
        "Mind maps, workload in story points, and dashboards you build widget by widget.",
        "Thousands of integrations, and a template for almost any process.",
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
    slug: "asana",
    label: "Asana",
    eyebrow: "A self-hosted alternative to Asana",
    title: "Goals, timelines and workload, without a plan to unlock them",
    subtitle:
      "Goals whose progress fills in from the work, projects with a timeline where tasks wait on each other, and a workload that shows who has room each week, plus chat, docs and calls. On your own server, free for up to 25 people.",
    seoTitle: "Self-hosted Asana alternative: OneCamp, with goals, timeline and workload free",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to Asana: goals with progress from their projects, timelines with dependencies, team workload with time off, and chat, docs and calls built in. Import your Asana projects.",
    points: [
      { icon: "tasks", title: "A timeline that moves with you", body: "Drag a task and the tasks waiting on it move along, just far enough, keeping any lag you set. Arrows turn red when a plan can't hold." },
      { icon: "teams", title: "Who has room this week", body: "Each person's week in tasks or estimated hours against what they take on, less their time off. Hand a task to whoever has room." },
      { icon: "board", title: "Goals that fill in by themselves", body: "Progress from the projects serving a goal, its sub-goals or a number, with check-ins drafted for the owner. And a report across every project, week by week." },
      { icon: "chat", title: "The conversation in the same place", body: "Channels, threads and calls beside the work, so status doesn't live in another app." },
      { icon: "docs", title: "Clients follow along", body: "Share a project with a client from a link, as a board or a timeline. No account needed." },
      { icon: "lock", title: "On your server", body: "Open source and self-hosted, free for up to 25 people, then one licence for everyone." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from Asana?", a: "Yes. Admin → Import → Asana brings projects across with their tasks, subtasks, sections as statuses, assignees, dates, comments and custom fields." },
      { q: "Are goals, the timeline or the workload on a paid plan?", a: "No. Goals, timelines, dependencies, the projects overview and the workload are in every edition, the free one included." },
    ],
    proof: { label: "Workload", href: "/docs/workload" },
    rival: {
      name: "Asana",
      billing: "Per seat, per month, with a minimum number of seats and seats added in blocks above five. Timeline is on Starter; workload, goals and portfolios are on Advanced.",
      theyWin: [
        "Portfolios with custom fields, and charts you design, for reporting across hundreds of projects.",
        "A large library of rules, integrations and approval flows.",
        "Hosted for you, with mature mobile apps.",
      ],
      source: "https://asana.com/pricing",
    },
    move: {
      title: "Moving from Asana",
      steps: [
        "Make an Asana personal access token in its developer console (app.asana.com/0/my-apps).",
        "In OneCamp, Admin → Import → Asana, and pick the projects to bring.",
        "Invite the team; people who were assigned tasks keep them.",
      ],
    },
  },
  {
    slug: "monday",
    label: "monday.com",
    eyebrow: "A self-hosted alternative to monday.com",
    title: "Boards, timelines and workload, with no seat buckets",
    subtitle:
      "Boards and lists, a timeline where tasks wait on each other, a workload that counts time off, and chat, docs and calls in the same app. On your own server, free for up to 25 people.",
    seoTitle: "Self-hosted monday.com alternative: OneCamp, free for up to 25 people",
    seoDescription:
      "OneCamp is an open-source, self-hosted alternative to monday.com: boards, timelines with dependencies, team workload with time off, client links, chat and calls. Import your monday.com boards.",
    points: [
      { icon: "tasks", title: "Boards your way", body: "Boards and lists with statuses and fields you name, cycles, repeating tasks, saved views and weekly reports." },
      { icon: "board", title: "Dependencies on the timeline", body: "Draw an arrow from one task to the next, finish to start or any of the other three kinds, with a lag if you need one; move one and the rest follow, just far enough." },
      { icon: "teams", title: "Workload with time off", body: "Each person's week in tasks or estimated hours, less the days they're away. No higher plan needed." },
      { icon: "chat", title: "Chat built in", body: "Channels, threads, DMs and calls, so updates don't need another tool." },
      { icon: "teams", title: "Every person included", body: "No seat buckets: add the sixth person without paying for ten. Free for up to 25." },
      { icon: "lock", title: "On your server", body: "Open source and self-hosted; your boards never sit with a vendor." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can we import from monday.com?", a: "Yes. Admin → Import → monday.com brings boards across as projects, with items, subitems, statuses, people, dates and updates, and your other columns as custom fields." },
      { q: "Are dependencies or workload on a higher plan?", a: "No. Every edition has them, the free one included." },
    ],
    proof: { label: "Timeline and dependencies", href: "/docs/project-timeline" },
    rival: {
      name: "monday.com",
      billing: "Per seat, per month, sold in seat buckets with a three-seat minimum. Timeline is on Standard; the dependency column and workload are on Pro.",
      theyWin: [
        "Many column types and board layouts to model almost any process.",
        "A large automation and integration library, and dashboards you build from widgets.",
        "Hosted for you, with nothing to run.",
      ],
      source: "https://monday.com/pricing",
    },
    move: {
      title: "Moving from monday.com",
      steps: [
        "Copy your monday.com API token (your avatar → Developers → My access tokens).",
        "In OneCamp, Admin → Import → monday.com, and pick the boards to bring.",
        "Invite the team; people who were assigned items keep them.",
      ],
    },
  },
  {
    slug: "toggl",
    label: "Toggl",
    eyebrow: "A self-hosted alternative to Toggl Track",
    title: "Track time where the work already is",
    subtitle:
      "Start a timer on the task you're doing, or add time by hand, set rates per project and per person, and invoice what the billable time comes to. No separate app, no separate bill.",
    seoTitle: "Toggl Track alternative with tasks built in: OneCamp time tracking",
    seoDescription:
      "OneCamp tracks time on tasks: timers, manual entries, billable or not, rates per project and per person, and a per-project report with money totals, CSV and invoices. Open source, self-hosted, free for up to 25 people.",
    points: [
      { icon: "table", title: "Time on the task", body: "Start a timer from the task itself, so every hour is already tied to the work and the project." },
      { icon: "automation", title: "A timer you can't lose", body: "The running timer follows you around the app; starting another stops the first." },
      { icon: "docs", title: "Rates and invoices", body: "An hourly rate for the project and for anyone who differs; the report says what the time comes to, and the invoice starts from it. Saved invoices are numbered and followed to paid." },
      { icon: "tasks", title: "And the rest of the work", body: "Projects, chat, docs and a calendar in the same app, so the timer isn't another tool." },
      { icon: "teams", title: "Every tracker included", body: "Free for up to 25 people, so contractors log time without a seat each." },
      { icon: "lock", title: "Your hours on your server", body: "Time data never sits with a vendor." },
    ],
    prices: "dual",
    priceNote: "Free for up to 25 people; one licence after that, paid once.",
    faqs: [
      { q: "Can I set billable rates?", a: "Yes. A project's admins set an hourly rate for everyone and one for anyone who differs; the report, the CSV and the invoice show what the billable time comes to. Only admins see money." },
      { q: "Is there a desktop timer?", a: "The timer runs in the web and desktop apps, and keeps running if you close the task." },
    ],
    proof: { label: "Time tracking", href: "/docs/time-tracking" },
    rival: {
      name: "Toggl Track",
      billing: "Per user, per month. Billable rates need a paid plan.",
      theyWin: [
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
