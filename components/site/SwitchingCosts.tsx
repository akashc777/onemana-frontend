"use client"

/**
 * SwitchingCosts — the two objections that actually stop the purchase.
 *
 * Neither is price. Research on this market is consistent that what stops a
 * team leaving Slack is "we would lose our history" and "who runs it when it
 * breaks", and OneCamp has real answers to both that were nowhere on the site.
 *
 * The importer was worse than absent: the FAQ said it did not exist, while the
 * product shipped nineteen backend files of it. This section is the correction,
 * placed where the objection actually arises rather than twelve items into an
 * accordion.
 */

import React from "react"

const MIGRATION = [
    "Channels, messages and threads, in order",
    "Direct messages and group conversations",
    "Files, and the reactions on everything",
    "People matched to their new accounts, avatars included",
]

/** The honest half. A buyer asks this immediately after "can you import". */
const NOT_MIGRATED = [
    "Microsoft Teams exports, not yet",
    "Slack apps, workflows and integrations",
    "Huddles, and anything Slack does not put in an export",
]

const OPERATIONS = [
    { k: "Install", v: "One command. SSL, database and models included, usually under ten minutes." },
    { k: "Updates", v: "One command, and it refuses to start against a schema it does not match rather than corrupting anything." },
    { k: "Backups", v: "Scheduled at install and watched like storage, with an honest warning that a backup on the same machine is an undo buffer, not disaster recovery." },
    { k: "Restore", v: "Brings the schema forward, restarts in place, and never leaves the application stopped." },
    { k: "Health", v: "One command tells you what a new workspace still needs, including whether it can actually send email." },
]

export const SwitchingCosts: React.FC = () => (
    <div className="container-x grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-canvas-raised p-6">
            <h3 className="text-lg font-semibold">Bring your Slack history with you</h3>
            <p className="mt-2 text-sm text-foreground/70">
                Export your workspace from Slack, upload the archive, and OneCamp imports it.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground/70">
                {MIGRATION.map((m) => (
                    <li key={m} className="flex gap-2">
                        <span aria-hidden className="text-brand">·</span>
                        {m}
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-sm text-foreground/70">
                It shows you a plan before it writes anything, de-duplicates so a second attempt cannot double-post
                your history, and can be rolled back if you change your mind.
            </p>

            <h4 className="mt-5 text-sm font-medium text-foreground/90">What it will not bring</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/60">
                {NOT_MIGRATED.map((m) => (
                    <li key={m} className="flex gap-2">
                        <span aria-hidden className="text-foreground/30">·</span>
                        {m}
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-foreground/50">
                Said here rather than discovered afterwards. An import that oversells itself costs more trust than the
                features it was hiding were worth.
            </p>
        </div>

        <div className="rounded-lg border border-border bg-canvas-raised p-6">
            <h3 className="text-lg font-semibold">And someone has to run it</h3>
            <p className="mt-2 text-sm text-foreground/70">
                That is the real question about self-hosting, so here is the honest version of the answer.
            </p>
            <dl className="mt-4 space-y-2.5">
                {OPERATIONS.map((o) => (
                    <div key={o.k} className="text-sm">
                        <dt className="font-medium text-foreground/90">{o.k}</dt>
                        <dd className="text-foreground/60">{o.v}</dd>
                    </div>
                ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-foreground/50">
                It is still your server. If nobody on the team wants that job, a subscription is the right answer,
                and we would rather you heard that here.
            </p>
        </div>
    </div>
)

export default SwitchingCosts
