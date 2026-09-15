/**
 * The comparison page's data.
 *
 * WHY A SEPARATE PAGE, AND WHY THIS SHAPE
 * ---------------------------------------
 * "Replaces Slack, Notion, Asana, Zoom" used to sit in the middle of the
 * homepage's "why we built it" section, where it re-opened the all-in-one fight
 * the positioning had already stopped fighting, and invited the one comparison
 * OneCamp loses: module against category leader. The landing plan's answer was
 * to move it to a page of its own, where somebody arrives already asking the
 * comparison question, and where an answer can be long enough to be honest.
 *
 * Honest is the whole design here. A page that says only "we win" is the sound
 * every competitor page makes, and a buyer discounts all of it. So each rival
 * carries a `theyWin` line taken from what they genuinely do better, and the
 * page leads with the concession rather than burying it.
 *
 * EVERY FACT ABOUT SOMEONE ELSE CARRIES A SOURCE AND A DATE. Rival pricing
 * moves, and a stale claim about a competitor is the kind of error that costs
 * more than the sale it was written to win. `checked` is the day the linked page
 * was read; `source` is where a reader goes to check it themselves. The claims
 * chosen are structural — how you are billed, whether a thing exists at all —
 * because those age in years, where a price ages in weeks.
 */

/** The day every `source` below was read. Update it when the claims are rechecked. */
export const CLAIMS_CHECKED = "September 2026"

export interface Rival {
    /** Product name, as its makers write it. */
    name: string
    /** What it is, in the words its own site would recognise. */
    what: string
    /** How a buyer pays. Structural, not a price that moves. */
    billing: string
    /** The state of governed agents there, stated without adjectives. */
    agents: string
    /** What that product genuinely does better than OneCamp. */
    theyWin: string
    /** Where the billing and agent claims can be checked. */
    source: string
}

export const rivals: Rival[] = [
    {
        name: "Huly",
        what: "Open-source everything-app: tracker, docs, chat, virtual office",
        billing: "Free to self-host. Cloud tiers from free to $399.99 a month",
        agents: "Pricing page lists AI as TBD on every tier",
        theyWin: "Far more users, first-class GitHub issue sync, and no licence gate at all",
        source: "https://huly.io/pricing",
    },
    {
        name: "Nextcloud",
        what: "Sovereignty suite: files, Talk, groupware, Assistant",
        billing: "Per user, per year, from 100 users up",
        agents: "Assistant with local models; no published pre-action audit chain",
        theyWin: "Years of public-sector deployment, an app ecosystem, and air-gap credibility OneCamp has not earned yet",
        source: "https://nextcloud.com/pricing/",
    },
    {
        name: "Mattermost",
        what: "Hardened team chat with an agents framework",
        billing: "Annual seat licences, quoted by sales",
        agents: "Bring your own model and MCP tools; governance framed as deployment control",
        theyWin: "A decade of hardening, FIPS and STIG compliance, and the deepest security review record in this list",
        source: "https://mattermost.com/pricing/",
    },
    {
        name: "Plane",
        what: "Project management, self-hostable, with local model support",
        billing: "Per user, per month, from $6 a seat",
        agents: "AI inside project management; no chat or video to govern",
        theyWin: "A sharper issue tracker than OneCamp's, and native mobile apps",
        source: "https://plane.so/pricing",
    },
]

/**
 * The line OneCamp occupies in the same table. Kept in the same shape as a
 * rival, so the page cannot describe itself in terms it does not also apply to
 * everybody else.
 */
export const onecampRow: Omit<Rival, "theyWin" | "source"> & { theyWin?: never } = {
    name: "OneCamp",
    what: "Chat, docs, tasks, tables, video, calendar and agents in one workspace",
    billing: "One licence, unlimited users, or a flat monthly cloud",
    agents: "Agents inherit the live permissions of the person they act for, and refusals are written to a hash chain before the action",
}

/**
 * The question worth asking all five, including us.
 *
 * It is phrased so that "yes" is checkable in five minutes rather than
 * believable in principle, which is the only kind of claim this page is for.
 */
export const killQuestion =
    "When an agent tries something the person it acts for is not allowed to do, is the refusal written to an exportable chain before the side effect?"

/** The subscriptions a buyer is usually cancelling, kept for the search that brings them here. */
export const cancels = [
    { tool: "Slack", surface: "Channels, DMs, threads, and the Slack export you import from" },
    { tool: "Notion", surface: "Docs, wikis, and collaborative editing" },
    { tool: "Asana or Trello", surface: "Tasks, boards, and sprints" },
    { tool: "Zoom", surface: "Calls and recordings, on your own LiveKit" },
    { tool: "Airtable", surface: "Tables with typed columns and views" },
    { tool: "Miro", surface: "Whiteboards" },
    { tool: "Google Calendar", surface: "Scheduling, tied to the same accounts" },
    { tool: "Otter or a per-minute transcriber", surface: "Meeting transcription, on your server" },
]
