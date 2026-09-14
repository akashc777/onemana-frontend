"use client"

// landing-diet: product-mock -- the text below is simulated PRODUCT UI (a channel
// thread, a tool call and an audit row), not marketing copy, and the word budget
// counts prose a visitor reads. The section's own heading and link line are
// counted, and they are what the plan budgets for this section.

/**
 * GovernedDemo — the one path the product is sold on, walked through.
 *
 * WHY. The critique's finding was a mismatch: the site sells a refusal on the
 * record, and the demo it linked to opened on a chatbot panel. A visitor was
 * asked to believe the wedge in prose and then shown something else. This is
 * the wedge itself, four steps, on the page that makes the claim.
 *
 * THE ROW IS THE PRODUCT'S OWN. `mcp.tool_call.refused` is the action the MCP
 * layer actually writes, one row per decision rather than an attempt followed by
 * an outcome, carrying the tool, the named agent, the human who authorised it
 * and the reason. "You are not a member of this channel" is the sentence the
 * permission layer produces, quoted rather than written for marketing. A
 * walkthrough that showed a shape the product does not produce would be the
 * exact failure it exists to answer.
 *
 * IT SAYS WHAT IT IS. "Interactive walkthrough" and not "live app": there is no
 * session behind it. The live demo is one link away and a reader can check.
 *
 * Motion explains the state change and nothing else: no loop, no autoplay for
 * anyone who asked for less, and the reduced-motion reader gets the finished
 * state rather than a control they have to operate to see the point.
 */

import React from "react"

interface Step {
    /** What this step is, in the reader's terms. */
    label: string
    /** The line the thread gains at this step, if any. */
    said?: { who: string; text: string; agent?: boolean }
    /** The tool call's state at this step. */
    call?: "pending" | "refused"
}

export const STEPS: Step[] = [
    {
        label: "Priya asks",
        said: { who: "Priya N.", text: "@Release Captain post the Q3 numbers in #finance" },
    },
    {
        label: "The agent calls a tool",
        said: { who: "Release Captain", text: "Posting to #finance", agent: true },
        call: "pending",
    },
    { label: "It is refused", call: "refused" },
    { label: "The decision is on the record", call: "refused" },
]

/** Steps at which the audit row is visible. */
const AUDIT_FROM = 3

/**
 * The row the MCP layer actually writes, quoted rather than composed for
 * marketing. One row per decision, not an attempt followed by an outcome, and
 * it carries the tool, the named agent, the human who authorised it and the
 * reason. Exported so a test can hold the page to the product's own shape.
 */
export const AUDIT_ROW = {
    action: "mcp.tool_call.refused",
    seq: "#1412",
    fields: [
        ["tool", "channel.post"],
        ["agent", "Release Captain"],
        ["authorised by", "Priya N."],
        ["reason", "not a member of #finance"],
    ] as const,
    hashes: "prev 9f2c…41ab → this 7d10…c8e5",
}

/**
 * Which step to open on.
 *
 * Someone who asked for less motion gets the finished state rather than a
 * control they must operate to see the point, and a sales link can hand
 * somebody the answer directly.
 */
export function initialStep({ reduced, deepLinked }: { reduced: boolean; deepLinked: boolean }): number {
    return reduced || deepLinked ? STEPS.length - 1 : 0
}

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = React.useState(false)
    React.useEffect(() => {
        const q = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduced(q.matches)
        const onChange = () => setReduced(q.matches)
        q.addEventListener("change", onChange)
        return () => q.removeEventListener("change", onChange)
    }, [])
    return reduced
}

export const GovernedDemo: React.FC = () => {
    const reduced = usePrefersReducedMotion()
    const [step, setStep] = React.useState(0)
    const [playing, setPlaying] = React.useState(false)

    // Reduced motion, or a sales link that wants the answer: start at the end.
    // Reading the query off window rather than useSearchParams keeps a Suspense
    // boundary off the whole page for one optional parameter.
    React.useEffect(() => {
        const deepLinked =
            typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("demo") === "refusal"
        setStep((s) => Math.max(s, initialStep({ reduced, deepLinked })))
    }, [reduced])

    React.useEffect(() => {
        if (!playing) return
        if (step >= STEPS.length - 1) {
            setPlaying(false)
            return
        }
        const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400)
        return () => clearTimeout(t)
    }, [playing, step])

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1))
        if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0))
    }

    const said = STEPS.slice(0, step + 1).flatMap((s) => (s.said ? [s.said] : []))
    const call = STEPS[step].call

    return (
        <figure
            className="m-0 overflow-hidden rounded-lg border border-border bg-canvas-raised"
            onKeyDown={onKeyDown}
        >
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-border px-4 py-2.5">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground/45">
                    Interactive walkthrough
                </span>
                <span className="font-mono text-[0.65rem] text-foreground/35">
                    same permission rules as production
                </span>
            </figcaption>

            <div className="grid gap-px bg-border md:grid-cols-2">
                {/* The conversation. */}
                <div className="min-w-0 bg-canvas-raised p-4">
                    <p className="m-0 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground/40">
                        #finance
                    </p>
                    <ol className="m-0 mt-3 list-none space-y-3 p-0">
                        {said.map((s, i) => (
                            <li key={i} className="min-w-0">
                                <span className="flex flex-wrap items-baseline gap-x-2">
                                    <span className="text-[0.78rem] font-medium text-foreground/80">{s.who}</span>
                                    {s.agent && (
                                        <span className="rounded-sm bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-foreground/45">
                                            agent
                                        </span>
                                    )}
                                </span>
                                <span className="mt-0.5 block text-[0.82rem] leading-snug text-foreground/60">
                                    {s.text}
                                </span>
                            </li>
                        ))}
                    </ol>

                    {call && (
                        <div className="mt-4 rounded-md border border-border/70 px-3 py-2.5">
                            <span className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-mono text-[0.72rem] text-foreground/80">channel.post</span>
                                <span
                                    className={
                                        call === "refused"
                                            ? "rounded-sm bg-brand/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-brand"
                                            : "rounded-sm bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-foreground/45"
                                    }
                                >
                                    {call === "refused" ? "refused" : "checking"}
                                </span>
                            </span>
                            <span className="mt-1 block text-[0.75rem] leading-snug text-foreground/55">
                                {call === "refused"
                                    ? "You are not a member of this channel."
                                    : "Checking Priya's membership, now, not when the agent was set up."}
                            </span>
                        </div>
                    )}
                </div>

                {/* The record. */}
                <div className="min-w-0 bg-canvas-raised p-4">
                    <p className="m-0 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-foreground/40">
                        Audit log
                    </p>
                    {step >= AUDIT_FROM ? (
                        <div className="mt-3 min-w-0">
                            <span className="flex flex-wrap items-baseline gap-x-2">
                                <span className="font-mono text-[0.72rem] text-foreground/80">
                                    {AUDIT_ROW.action}
                                </span>
                                <span className="font-mono text-[0.65rem] tabular-nums text-foreground/40">
                                    {AUDIT_ROW.seq}
                                </span>
                            </span>
                            <dl className="m-0 mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                                {AUDIT_ROW.fields.map(([k, v]) => (
                                    <React.Fragment key={k}>
                                        <dt className="font-mono text-[0.65rem] text-foreground/35">{k}</dt>
                                        <dd className="m-0 min-w-0 truncate text-[0.75rem] text-foreground/60">{v}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                            <p className="m-0 mt-2.5 font-mono text-[0.65rem] leading-relaxed text-foreground/35">
                                {AUDIT_ROW.hashes}
                            </p>
                        </div>
                    ) : (
                        <p className="m-0 mt-3 text-[0.75rem] leading-snug text-foreground/40">
                            The decision is written here before the tool runs. If it cannot be
                            written, the call does not happen.
                        </p>
                    )}
                </div>
            </div>

            {/* Controls. */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border px-4 py-2.5">
                <button
                    type="button"
                    onClick={() => {
                        if (step >= STEPS.length - 1) setStep(0)
                        setPlaying((p) => !p)
                    }}
                    className="rounded-md border border-border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-wider text-foreground/60 transition-colors hover:border-brand/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                    {playing ? "Pause" : step >= STEPS.length - 1 ? "Replay" : "Play"}
                </button>

                <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
                    {STEPS.map((s, i) => (
                        <li key={s.label}>
                            <button
                                type="button"
                                aria-label={`Step ${i + 1}: ${s.label}`}
                                aria-current={i === step ? "step" : undefined}
                                onClick={() => {
                                    setPlaying(false)
                                    setStep(i)
                                }}
                                className={`h-2.5 w-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                                    i <= step ? "bg-brand" : "bg-foreground/15 hover:bg-foreground/30"
                                }`}
                            />
                        </li>
                    ))}
                </ol>

                {/* The step's name, announced as it changes rather than only drawn. */}
                <p aria-live="polite" className="m-0 text-[0.72rem] text-foreground/45">
                    {STEPS[step].label}
                </p>
            </div>
        </figure>
    )
}

export default GovernedDemo
