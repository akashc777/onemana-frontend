import sample from "@/public/sample-record.json";

/**
 * Rows from the demo's real record, for pages that show the record rather
 * than describe it.
 *
 * Read from public/sample-record.json, the same file /verify offers as "a
 * record from the public demo", so the rows a visitor sees on a page are rows
 * they can drop on the verifier and check. Nothing here is composed for
 * marketing: the summary, the action, the time and both hashes are the file's.
 */
export interface RecordRow {
  seq: number;
  action: string;
  /** The row's own sentence, as the workspace wrote it. */
  summary: string;
  /** ISO time the row was written. */
  at: string;
  prev: string;
  hash: string;
  refused: boolean;
}

/** A hash as people read one: the first and last four characters. */
export function shortHash(h: string): string {
  return h.length > 12 ? `${h.slice(0, 4)}…${h.slice(-4)}` : h;
}

/** UTC clock time with seconds, which is what a record row is read for. */
export function recordTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** The day the rows were written, for a caption. */
export function recordDay(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

const rows: RecordRow[] = sample.entries
  .map((e) => ({
    seq: e.seq,
    action: e.action,
    summary: e.summary,
    at: e.created_at,
    prev: e.prev_hash,
    hash: e.entry_hash,
    refused: e.action.endsWith(".refused"),
  }))
  .sort((a, b) => a.seq - b.seq);

/**
 * The attempt and its refusal: the last two rows, oldest first. The second
 * row's prev is the first row's hash, which is the chain a reader can see.
 */
export const attemptAndRefusal: RecordRow[] = rows.slice(-2);
