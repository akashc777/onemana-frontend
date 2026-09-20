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

type State =
    | { kind: "idle" }
    | { kind: "working" }
    | { kind: "done"; report: VerifyReport; filename: string }
    | { kind: "error"; message: string }

export function VerifyRecord() {
    const [state, setState] = React.useState<State>({ kind: "idle" })
    const [dragging, setDragging] = React.useState(false)

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

    const onDrop = React.useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files?.[0]
            if (f) void handleFile(f)
        },
        [handleFile],
    )

    return (
        <div className="mx-auto w-full max-w-3xl">
            <label
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={[
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                    dragging ? "border-foreground/50 bg-foreground/5" : "border-border hover:border-foreground/30",
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
                <span className="text-sm font-medium">Drop the file here, or choose one</span>
                <span className="text-xs text-muted-foreground">
                    It is read in your browser. Nothing is uploaded.
                </span>
            </label>

            {state.kind === "working" && (
                <p className="mt-6 text-sm text-muted-foreground">Recomputing every row.</p>
            )}

            {state.kind === "error" && (
                <p className="mt-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                    {state.message}
                </p>
            )}

            {state.kind === "done" && <Report report={state.report} filename={state.filename} />}
        </div>
    )
}

function Report({ report, filename }: { report: VerifyReport; filename: string }) {
    const clean = report.mismatched === 0
    return (
        <div className="mt-6 space-y-6">
            <div
                className={[
                    "rounded-2xl border p-5",
                    clean ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/50 bg-destructive/5",
                ].join(" ")}
            >
                <p className="text-base font-semibold">
                    {clean
                        ? `${report.verified} of ${report.rows.length} rows are exactly as they were written.`
                        : `${report.mismatched} of ${report.rows.length} rows do not match their own hash.`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    {filename}
                    {report.subject ? ` · recorded against ${report.subject}` : ""}
                    {report.redacted > 0
                        ? ` · ${report.redacted} cleared by retention, so their content cannot be recomputed`
                        : ""}
                    {report.unhashed > 0 ? ` · ${report.unhashed} written before the chain existed` : ""}
                </p>
                {report.truncated && (
                    <p className="mt-2 text-sm text-muted-foreground">
                        This file is a recent slice, not the whole record. It says so itself.
                    </p>
                )}
                {!clean && (
                    <p className="mt-2 text-sm">
                        A row that does not produce its own hash was changed after it was written, or the file
                        was edited on its way here.
                    </p>
                )}
            </div>

            <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                            <th className="px-3 py-2 font-medium">Seq</th>
                            <th className="px-3 py-2 font-medium">Action</th>
                            <th className="px-3 py-2 font-medium">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {report.rows.map((r, i) => (
                            <tr key={i} className="border-b last:border-0">
                                <td className="px-3 py-2 tabular-nums text-muted-foreground">
                                    {r.seq ?? "not recorded"}
                                </td>
                                <td className="px-3 py-2 font-mono text-xs">{r.action ?? "not recorded"}</td>
                                <td className="px-3 py-2">
                                    <Verdict verdict={r.verdict} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* The document's own words. Not ours: if OneCamp ever claims less,
                this page claims less, and it cannot advertise a guarantee the
                file does not make. */}
            {report.howToVerify.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold">What this page just did</h2>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        {report.howToVerify.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </section>
            )}

            {report.limits.length > 0 && (
                <section>
                    <h2 className="text-sm font-semibold">What it does not prove</h2>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
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
        verified: "text-emerald-600 dark:text-emerald-400",
        mismatch: "text-destructive font-medium",
        redacted: "text-muted-foreground",
        unhashed: "text-muted-foreground",
    }[verdict]
    return <span className={`text-xs ${tone}`}>{label}</span>
}
