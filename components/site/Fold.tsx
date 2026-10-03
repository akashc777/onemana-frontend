"use client"

/**
 * Fold — detail that a phone reader opens and a desktop reader just sees.
 *
 * The homepage measured 19 screens on a phone, and most of the length was
 * detail set beside its summary on a laptop but stacked under it on a phone:
 * the Slack import's lists, the five operations, the cost calculator. The detail
 * stays on the page (it is the honest part: what will not import, who runs the
 * server), but behind one tap on a narrow screen.
 *
 * A native <details>, so it works before hydration and without JavaScript. It
 * renders closed, and opens itself on wide screens after mount; the sections it
 * is used in sit far below the fold, so that change is never a visible shift.
 */

import React, { useEffect, useState } from "react"

const WIDE = "(min-width: 640px)"

export const Fold: React.FC<{
    /** The tap target on a phone, saying what is inside. Hidden on wide screens. */
    summary: string
    children: React.ReactNode
    className?: string
}> = ({ summary, children, className = "" }) => {
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia(WIDE)
        if (mq.matches) setOpen(true)
        // Widening a phone-sized window (rotation, a resized browser) shows the
        // detail; narrowing leaves it as the reader last had it.
        const onChange = (e: MediaQueryListEvent) => { if (e.matches) setOpen(true) }
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    return (
        <details
            open={open}
            onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
            className={`group ${className}`}
        >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md py-2 text-sm font-medium text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:hidden [&::-webkit-details-marker]:hidden">
                {summary}
                <span aria-hidden className="text-foreground/40 transition-transform duration-150 group-open:rotate-45">+</span>
            </summary>
            {children}
        </details>
    )
}

export default Fold
