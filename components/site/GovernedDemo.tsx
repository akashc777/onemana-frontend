"use client"

// landing-diet: product-mock -- the text below is simulated PRODUCT UI (a channel
// thread, a tool call and an audit row), not marketing copy, and the word budget
// counts prose a visitor reads. The section's own heading and link line are
// counted, and they are what the plan budgets for this section.

/**
 * GovernedDemo — the one path the product is sold on, walked through, on the
 * home page's night section (design v3, site.md H6).
 *
 * WHY. The site sells a refusal on the record, so the page that makes the
 * claim shows it: Priya asks, her agent tries, it is refused, and the
 * decision is written down. The hero already plays this story, so this card
 * is the evidence at rest: it opens on the finished state (the refusal, its
 * audit row, the record's line with Prove it) and never moves by itself.
 * "Replay" plays the four steps once, 1.1s each; under reduced motion it
 * steps through them without movement.
 *
 * THE ROW IS THE PRODUCT'S OWN. `mcp.tool_call.refused` is the action the MCP
 * layer actually writes, one row per decision, carrying the tool, the named
 * agent, the human who authorised it and the reason. "You are not a member of
 * this channel" is the sentence the permission layer produces, quoted rather
 * than written for marketing.
 *
 * IT SAYS WHAT IT IS. "Interactive walkthrough" and not "live app": there is no
 * session behind it. The live demo is one link away and a reader can check.
 *
 * Colour: the agent is indigo, the refusal berry and the chain dusk (G7).
 */

import React from "react"
import Link from "next/link"
import { buttonClasses } from "@/components/ui/Button"
import { AgentSquare, Face } from "@/components/ui/v3"
import { Icon } from "@/components/ui/icons"

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

/** One step's length when the walkthrough plays (site.md H6). */
const STEP_MS = 1100

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

const [PREV, THIS] = AUDIT_ROW.hashes.replace("prev ", "").split(" → this ")

/** The card opens on the last step: the evidence, not the build-up. */
export const OPEN_STEP = STEPS.length - 1

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

/** A hash as a chip (S20); the two that chain share a dusk ring, which pulses once when the row lands. */
function HashChip({ value, chain = false, pulse = false }: { value: string; chain?: boolean; pulse?: boolean }) {
    return (
        <span
            translate="no"
            className={`inline-flex h-5 items-center rounded-[5px] bg-white/[0.06] px-1.5 font-mono text-[11px] text-foreground/85 ${chain ? "ring-1 ring-camp-dusk/70" : ""} ${pulse ? "fx-spring" : ""}`}
        >
            {value}
        </span>
    )
}

export const GovernedDemo: React.FC = () => {
    const reduced = usePrefersReducedMotion()
    const [step, setStep] = React.useState(OPEN_STEP)
    const [playing, setPlaying] = React.useState(false)
    // Motion only after Replay: the still figure draws nothing in on load.
    const [moved, setMoved] = React.useState(false)
    const fx = (cls: string) => (moved ? cls : "")

    React.useEffect(() => {
        if (!playing) return
        if (step >= STEPS.length - 1) {
            setPlaying(false)
            return
        }
        const t = setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), STEP_MS)
        return () => clearTimeout(t)
    }, [playing, step])

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, STEPS.length - 1))
        if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0))
    }

    const said = STEPS.slice(0, step + 1).flatMap((s) => (s.said ? [s.said] : []))
    const call = STEPS[step].call
    const done = step >= STEPS.length - 1

    return (
        <figure
            className="night m-0 overflow-hidden rounded-2xl bg-card text-foreground shadow-e3 ring-1 ring-white/[0.08]"
            onKeyDown={onKeyDown}
        >
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-white/[0.08] px-5 py-3">
                <span className="text-caption font-[510] text-foreground">Interactive walkthrough</span>
                <span className="text-caption text-muted-foreground">Same permission rules as production</span>
            </figcaption>

            <div className="grid md:grid-cols-2">
                {/* The conversation. */}
                <div className="min-w-0 p-5 md:min-h-[300px] md:border-r md:border-white/[0.08]">
                    <p className="m-0 font-mono text-caption text-muted-foreground">#finance</p>
                    <ol className="m-0 mt-4 list-none space-y-4 p-0">
                        {said.map((s, i) => (
                            <li key={i} className={`${fx("fx-slide")} flex min-w-0 gap-3`}>
                                {s.agent ? <AgentSquare size={32} dim={call === "refused"} /> : <Face initials="PN" hue="berry" size={32} />}
                                <span className="min-w-0">
                                    <span className="flex flex-wrap items-center gap-x-2">
                                        <span className="text-small font-[590] text-foreground">{s.who}</span>
                                        {s.agent && (
                                            <span className="rounded-[5px] bg-agent-muted px-1.5 text-[11px] font-[510] leading-[18px] text-agent-ink">
                                                Agent
                                            </span>
                                        )}
                                    </span>
                                    <span className="mt-0.5 block text-small text-muted-foreground">{s.text}</span>
                                </span>
                            </li>
                        ))}
                    </ol>

                    {call && (
                        <div key={call} className={`relative mt-5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.08] ${call === "refused" && step === 2 ? fx("fx-shake") : fx("fx-slide")}`}>
                            <span className="flex flex-wrap items-center gap-x-2">
                                <span className="font-mono text-caption text-foreground">channel.post</span>
                                {call === "refused" ? (
                                    <span className={`${fx("fx-stamp")} inline-block rounded-[5px] px-1.5 text-[11px] font-[590] uppercase leading-[18px] tracking-[0.04em] text-camp-berry-ink ring-1 ring-camp-berry/70 bg-camp-berry-tint`}>
                                        Refused
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-[5px] bg-agent-muted px-1.5 text-[11px] font-[510] leading-[18px] text-agent-ink">
                                        Checking
                                        <span className="inline-flex gap-[2px]" aria-hidden="true">
                                            {[0, 1, 2].map((d) => (
                                                <span key={d} className={`bob size-[3px] rounded-full bg-current ${d === 1 ? "at-120" : d === 2 ? "at-240" : ""}`} />
                                            ))}
                                        </span>
                                    </span>
                                )}
                            </span>
                            <span className="mt-1 block text-caption text-muted-foreground">
                                {call === "refused"
                                    ? "You are not a member of this channel."
                                    : "Checking Priya's membership, now, not when the agent was set up."}
                            </span>
                        </div>
                    )}
                </div>

                {/* The record. */}
                <div className="min-w-0 border-t border-white/[0.08] p-5 md:border-t-0">
                    <p className="m-0 font-mono text-caption text-muted-foreground">Audit log</p>
                    <ol className="m-0 mt-4 list-none space-y-3 p-0">
                        <li className="border-l-[3px] border-white/20 pl-3 font-mono text-[12px] leading-[18px] text-muted-foreground">
                            <span className="text-foreground">message.posted</span> #1411
                            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                this <HashChip value={PREV!} chain={step >= AUDIT_FROM} pulse={moved && step >= AUDIT_FROM} />
                            </span>
                        </li>
                        {step >= AUDIT_FROM ? (
                            <li className={`${fx("fx-slide")} border-l-[3px] border-camp-berry pl-3 font-mono text-[12px] leading-[18px] text-muted-foreground`}>
                                <span className="flex flex-wrap items-baseline gap-x-2">
                                    <span className="text-camp-berry-ink">{AUDIT_ROW.action}</span>
                                    <span className="tabular-nums">{AUDIT_ROW.seq}</span>
                                </span>
                                <dl className="m-0 mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                                    {AUDIT_ROW.fields.map(([k, v]) => (
                                        <React.Fragment key={k}>
                                            <dt className="text-faint">{k}</dt>
                                            <dd className="m-0 min-w-0 truncate font-sans text-caption text-foreground">{v}</dd>
                                        </React.Fragment>
                                    ))}
                                </dl>
                                <span className="mt-2 flex flex-wrap items-center gap-1.5">
                                    prev <HashChip value={PREV!} chain pulse={moved} /> this <HashChip value={THIS!} />
                                </span>
                            </li>
                        ) : (
                            <li className="pl-[15px] text-caption text-muted-foreground">
                                The decision is written here before the tool runs. If it cannot be written, the call does not happen.
                            </li>
                        )}
                    </ol>

                    {/* The record's own line, as the agent record shows it: the
                        chain, and Prove it, which /verify really does. */}
                    {step >= AUDIT_FROM && (
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-3">
                            <span className="min-w-0 text-caption text-muted-foreground">Agent record · chained to the entry before</span>
                            <Link
                                href="/verify"
                                className={buttonClasses("subtle", "sm", "shrink-0 text-foreground hover:bg-white/[0.06] max-md:min-h-11")}
                            >
                                <Icon name="shield" />
                                Prove it
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls: the step dots, the active one a 24px indigo pill, and Replay. */}
            <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.08] px-3 py-1.5 sm:px-4">
                {/* Each step is a 44 px target on a phone and 24 px from sm
                    (WCAG 2.2, target size) round the drawn dot. */}
                <ol className="my-0 flex list-none flex-wrap items-center p-0">
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
                                className="group flex h-11 min-w-11 items-center justify-center rounded-full sm:h-6 sm:w-6 sm:min-w-6"
                            >
                                <span
                                    aria-hidden
                                    className={`h-2 rounded-full transition-colors duration-pop ${
                                        i === step ? "w-6 bg-agent" : i < step ? "w-2 bg-white/60" : "w-2 bg-white/20 group-hover:bg-white/40"
                                    }`}
                                />
                            </button>
                        </li>
                    ))}
                </ol>

                {/* The step's name, announced as it changes rather than only drawn. */}
                <p aria-live="polite" className="m-0 text-caption text-muted-foreground">
                    {STEPS[step].label}
                </p>

                <button
                    type="button"
                    onClick={() => {
                        if (reduced) {
                            setStep((s) => (s >= STEPS.length - 1 ? 0 : s + 1))
                            return
                        }
                        setMoved(true)
                        setStep(0)
                        setPlaying(true)
                    }}
                    className={buttonClasses("subtle", "sm", "ml-auto text-muted-foreground hover:bg-white/[0.06] hover:text-foreground max-md:min-h-11")}
                >
                    {playing ? "Playing" : reduced && !done ? "Next step" : "Replay"}
                </button>
            </div>
        </figure>
    )
}

export default GovernedDemo
