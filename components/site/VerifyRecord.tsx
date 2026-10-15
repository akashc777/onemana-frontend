"use client"

/**
 * VerifyRecord: check a OneCamp record without OneCamp.
 *
 * WHY THIS EXISTS. Every OneCamp workspace can hand somebody a file: the rows
 * recorded against them, each with its hashes, and the recipe for recomputing
 * them. Following that recipe by hand means writing a SHA-256 script, and
 * almost nobody handed such a file ever will. An unchecked proof is a claim,
 * which is the thing the file was produced to stop being.
 *
 * So the recipe runs here, on a page anybody can open, over a file they
 * already have. It needs no account, no workspace, and no trust in us beyond
 * reading the source of one page.
 *
 * NOTHING LEAVES THE BROWSER. The file is read with FileReader and hashed with
 * SubtleCrypto. There is no upload and no request. For a document about one
 * person's own activity, any other design would be indefensible, and saying so
 * is worth less than making it true: this component has no network call in it.
 *
 * IT QUOTES THE DOCUMENT RATHER THAN THE PRODUCT. The steps and the limits
 * shown underneath are read out of the uploaded file, not written here. If a
 * future OneCamp changes what it claims, this page changes with it, and it can
 * never advertise a guarantee the file itself does not make.
 */

import * as React from "react"
import { verifyRecord, type VerifyReport } from "@/lib/verifyRecord"
import { SpotImported } from "@/components/ui/graphics/spots"
import { Icon } from "@/components/ui/icons"
import { useFileDrop } from "@/hooks/useFileDrop"

type State =
    | { kind: "idle" }
    | { kind: "working" }
    | { kind: "done"; report: VerifyReport; filename: string }
    | { kind: "error"; message: string }

export function VerifyRecord() {
    const [state, setState] = React.useState<State>({ kind: "idle" })

    const handleFile = React.useCallback(async (file: File) => {
        setState({ kind: "working" })
        try {
            const text = await file.text()
            const doc = JSON.parse(text)
            const report = await verifyRecord(doc)
            if (report.rows.length === 0) {
                setState({
                    kind: "error",
                    message:
                        "That file has no rows in it. A OneCamp record has an “entries” list; an evidence pack has its rows under “sections.audit_log”.",
                })
                return
            }
            setState({ kind: "done", report, filename: file.name })
        } catch {
            setState({
                kind: "error",
                message: "That file is not JSON this page can read. Use the file OneCamp gave you, unchanged.",
            })
        }
    }, [])

    /**
     * Somebody who arrived without a file.
     *
     * A checker that needs a document the reader does not have yet is a page
     * they leave. This is a real record the public demo produced, served from
     * this site, so the page demonstrates itself in one click and the thing
     * they click is the same file the tests verify.
     */
    const tryTheSample = React.useCallback(async () => {
        setState({ kind: "working" })
        try {
            const res = await fetch("/sample-record.json")
            if (!res.ok) throw new Error("sample unavailable")
            const doc = await res.json()
            setState({ kind: "done", report: await verifyRecord(doc), filename: "sample-record.json" })
        } catch {
            setState({ kind: "error", message: "The sample could not be loaded. Your own file still works." })
        }
    }, [])

    // A file over the zone: counted in and out, so crossing the spot and the
    // words never flickers it (storefront audit V1); the cursor says "copy".
    const { dragging, bind } = useFileDrop((f) => void handleFile(f))

    return (
        <div className="w-full">
            <label
                {...bind}
                className={[
                    // The drop zone (site.md V2): a dashed line-3 card at r16 with
                    // the lake spot for a file coming in. Under a dragged file it
                    // wears the layer's drop look in lake (data-drop), its dashed
                    // edge drawn where the border was.
                    "hue-lake flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed px-6 py-12 text-center transition-colors [--ix-ground:rgb(var(--card))] [--ix-tint:rgb(var(--hue))] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
                    dragging ? "border-transparent" : "border-line-3 bg-card hover:border-hue",
                ].join(" ")}
            >
                <input
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) void handleFile(f)
                    }}
                />
                <SpotImported size={64} hue="lake" className="mb-1" />
                <span className="text-small font-medium">Drop the file here, or choose one</span>
                <span className="text-caption text-muted-foreground">
                    It is read in your browser. Nothing is uploaded.
                </span>
            </label>

            <p className="mt-3 text-caption text-muted-foreground">
                No file yet?{" "}
                <button type="button" onClick={() => void tryTheSample()} className="link tap-target">
                    Try it with a record from the public demo
                </button>
                .
            </p>

            {state.kind === "working" && (
                <p className="mt-6 text-small text-muted-foreground">Recomputing every row.</p>
            )}

            {state.kind === "error" && (
                <p role="alert" className="mt-6 flex gap-2.5 rounded-xl border-l-[3px] border-danger bg-card px-4 py-3 text-small text-foreground shadow-e1">
                    <Icon name="alert" className="mt-0.5 text-danger-ink" />
                    <span>{state.message}</span>
                </p>
            )}

            {state.kind === "done" && <Report report={state.report} filename={state.filename} />}
        </div>
    )
}

function Report({ report, filename }: { report: VerifyReport; filename: string }) {
    const clean = report.mismatched === 0
    // Depth, not lines (storefront audit V3: the one block on the site drawn
    // with 1 px boxes and a bordered table). The verdict is a raised card with
    // its colour as a leading bar and an icon, and the rows sit on one card,
    // set as the record sets its own rows: the sequence, the action, the result.
    return (
        <div className="mt-6 space-y-6">
            <div className={`flex gap-3 rounded-2xl border-l-[3px] bg-card p-5 shadow-e1 ${clean ? "border-success" : "border-danger"}`}>
                <Icon name={clean ? "check" : "alert"} size={20} className={`mt-0.5 ${clean ? "text-success-ink" : "text-danger-ink"}`} />
                <div className="min-w-0">
                    <p className="m-0 text-body font-semibold text-foreground">
                        {clean
                            ? `${report.verified} of ${report.rows.length} rows are exactly as they were written.`
                            : `${report.mismatched} of ${report.rows.length} rows do not match their own hash.`}
                    </p>
                    <p className="m-0 mt-1 text-small text-muted-foreground">
                        {filename}
                        {report.subject ? ` · recorded against ${report.subject}` : ""}
                        {report.redacted > 0
                            ? ` · ${report.redacted} cleared by retention, so their content cannot be recomputed`
                            : ""}
                        {report.unhashed > 0 ? ` · ${report.unhashed} written before the chain existed` : ""}
                    </p>
                    {report.truncated && (
                        <p className="m-0 mt-2 text-small text-muted-foreground">
                            This file is a recent slice, not the whole record. It says so itself.
                        </p>
                    )}
                    {!clean && (
                        <p className="m-0 mt-2 text-small text-foreground">
                            A row that does not produce its own hash was changed after it was written, or the file
                            was edited on its way here.
                        </p>
                    )}
                </div>
            </div>

            <ol aria-label="Each row, recomputed" className="m-0 list-none divide-y divide-border rounded-2xl bg-card p-0 px-5 shadow-e1">
                {report.rows.map((r, i) => (
                    <li key={i} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 py-3 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
                        <span className="font-mono text-caption tabular-nums text-muted-foreground">
                            {r.seq !== undefined && r.seq !== null ? `#${r.seq}` : "not recorded"}
                        </span>
                        <span className="min-w-0 break-words font-mono text-caption text-foreground">{r.action ?? "not recorded"}</span>
                        <span className="col-start-2 sm:col-start-auto sm:text-right">
                            <Verdict verdict={r.verdict} />
                        </span>
                    </li>
                ))}
            </ol>

            {/* The document's own words. Not ours: if OneCamp ever claims less,
                this page claims less, and it cannot advertise a guarantee the
                file does not make. */}
            {report.howToVerify.length > 0 && (
                <section>
                    <h2 className="text-small font-semibold">What this page just did</h2>
                    <ul className="mt-2 space-y-1.5 text-small text-muted-foreground">
                        {report.howToVerify.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </section>
            )}

            {report.limits.length > 0 && (
                <section>
                    <h2 className="text-small font-semibold">What it does not prove</h2>
                    <ul className="mt-2 space-y-1.5 text-small text-muted-foreground">
                        {report.limits.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

function Verdict({ verdict }: { verdict: VerifyReport["rows"][number]["verdict"] }) {
    const label = {
        verified: "matches its hash",
        mismatch: "does not match",
        redacted: "content cleared by retention",
        unhashed: "no hash on this row",
    }[verdict]
    const tone = {
        verified: "text-success-ink",
        mismatch: "text-danger-ink font-medium",
        redacted: "text-muted-foreground",
        unhashed: "text-muted-foreground",
    }[verdict]
    return <span className={`text-caption ${tone}`}>{label}</span>
}
