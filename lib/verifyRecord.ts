/**
 * Checking a OneCamp record without OneCamp.
 *
 * A workspace hands somebody a file: the rows recorded against them, each with
 * its hashes, and the recipe for recomputing them. Following that recipe by
 * hand means writing a SHA-256 script, which is a barrier that stops most
 * people who were handed the file from ever checking it. An unchecked proof is
 * a claim.
 *
 * So this is the recipe, in the browser, over a file the reader already has.
 * It takes nothing from the network and sends nothing to it: the file never
 * leaves the machine it was opened on, which for a document about somebody's
 * own activity is the only acceptable design.
 *
 * WHAT IT CHECKS is one row at a time: the hash a row carries is the hash its
 * own contents produce. That proves the row is exactly as it was written.
 * It cannot prove that no row was removed, and this file does not pretend to:
 * completeness needs the whole chain, and the document says so in its own
 * limits, which the page shows rather than paraphrasing.
 */

/** One row of a OneCamp audit export, in the document's own shape. */
export interface RecordEntry {
    id?: string;
    seq?: number;
    actor_id?: string;
    actor_email?: string;
    actor_kind?: string;
    action?: string;
    category?: string;
    summary?: string;
    metadata?: string;
    created_at?: string;
    entry_hash?: string;
    prev_hash?: string;
    redacted_at?: string;
}

/** The document as a whole, in either shape OneCamp produces. */
export interface RecordFile {
    entries?: RecordEntry[];
    sections?: { audit_log?: RecordEntry[] };
    how_to_verify?: string[];
    limits?: string[];
    proof?: { subject?: string; rows?: number; truncated?: boolean; generated_at?: string };
    pack?: { from?: string; to?: string; generated_at?: string };
}

export type RowVerdict = "verified" | "mismatch" | "redacted" | "unhashed";

export interface RowResult {
    seq?: number;
    action?: string;
    created_at?: string;
    verdict: RowVerdict;
    expected?: string;
    recomputed?: string;
}

export interface VerifyReport {
    rows: RowResult[];
    verified: number;
    mismatched: number;
    redacted: number;
    unhashed: number;
    /** The document's own words, shown rather than restated. */
    howToVerify: string[];
    limits: string[];
    subject?: string;
    truncated: boolean;
}

/**
 * canonicalJson renders a JSON document the one way the hash was taken over:
 * object keys sorted, no insignificant whitespace. A row's metadata is stored
 * as jsonb, which re-renders what it was given, so the bytes on the way out are
 * not the bytes that went in and only a canonical form can agree.
 */
export function canonicalJson(value: unknown): string {
    if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
    if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`).join(",")}}`;
}

/**
 * hashInput joins the fields exactly as the recipe describes: newline
 * separated, in order, with actor_kind appended only when the row carries one.
 *
 * created_at is used as the document spells it rather than reformatted. The
 * exporter writes the same string it hashed, and a reader who reformats a
 * timestamp is the likeliest way to produce a false mismatch.
 */
export function hashInput(e: RecordEntry): string {
    const meta = e.metadata ? canonicalJson(JSON.parse(e.metadata)) : "";
    const parts = [
        e.prev_hash ?? "",
        e.id ?? "",
        e.created_at ?? "",
        e.actor_id ?? "",
        e.actor_email ?? "",
        e.action ?? "",
        e.category ?? "",
        e.summary ?? "",
        meta,
    ];
    let s = parts.join("\n");
    if (e.actor_kind) s += `\n${e.actor_kind}`;
    return s;
}

async function sha256Hex(s: string): Promise<string> {
    const bytes = new TextEncoder().encode(s);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/** entriesOf reads the rows out of either document shape. */
export function entriesOf(doc: RecordFile): RecordEntry[] {
    if (Array.isArray(doc.entries)) return doc.entries;
    if (Array.isArray(doc.sections?.audit_log)) return doc.sections.audit_log;
    return [];
}

/**
 * verifyRecord recomputes every row's hash and reports what it found.
 *
 * A redacted row is reported as redacted rather than as a mismatch: retention
 * cleared its content on purpose, so its hash cannot be recomputed and calling
 * that tampering would be wrong. A row with no hash at all predates the chain.
 */
export async function verifyRecord(doc: RecordFile): Promise<VerifyReport> {
    const rows: RowResult[] = [];
    let verified = 0;
    let mismatched = 0;
    let redacted = 0;
    let unhashed = 0;

    for (const e of entriesOf(doc)) {
        const base = { seq: e.seq, action: e.action, created_at: e.created_at };
        if (e.redacted_at) {
            redacted++;
            rows.push({ ...base, verdict: "redacted" });
            continue;
        }
        if (!e.entry_hash) {
            unhashed++;
            rows.push({ ...base, verdict: "unhashed" });
            continue;
        }
        let recomputed: string;
        try {
            recomputed = await sha256Hex(hashInput(e));
        } catch {
            // Unreadable metadata is a mismatch, not a crash: the row does not
            // produce the hash it claims, whatever the reason.
            mismatched++;
            rows.push({ ...base, verdict: "mismatch", expected: e.entry_hash });
            continue;
        }
        if (recomputed === e.entry_hash) {
            verified++;
            rows.push({ ...base, verdict: "verified", expected: e.entry_hash, recomputed });
        } else {
            mismatched++;
            rows.push({ ...base, verdict: "mismatch", expected: e.entry_hash, recomputed });
        }
    }

    return {
        rows,
        verified,
        mismatched,
        redacted,
        unhashed,
        howToVerify: doc.how_to_verify ?? [],
        limits: doc.limits ?? [],
        subject: doc.proof?.subject,
        truncated: Boolean(doc.proof?.truncated),
    };
}
