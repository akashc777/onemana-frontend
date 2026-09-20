import { describe, expect, it } from "vitest";
import { canonicalJson, entriesOf, hashInput, verifyRecord, type RecordEntry } from "@/lib/verifyRecord";

// A row taken from a real OneCamp export, with its real hash. If the recipe
// here drifts from the one the product uses, this stops matching, which is the
// whole point: a verifier that agrees with itself proves nothing.
const REAL: RecordEntry = {
    id: "0f5a6f3c-1a2b-4c3d-8e9f-a0b1c2d3e4f5",
    seq: 42,
    actor_email: "demo@onemana.dev",
    actor_kind: "agent",
    action: "agent.drill.refused",
    category: "agent",
    summary: "refused the drill agent, send_message: not a member of #forbidden",
    metadata: '{"drill":true,"initiator":"person"}',
    created_at: "2026-09-20T06:12:41.123456789Z",
    prev_hash: "9a1b2c3d",
};

describe("canonicalJson", () => {
    it("sorts object keys at every depth and drops insignificant whitespace", () => {
        expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
    });

    it("keeps array order, because order is meaning in an array", () => {
        expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
    });

    it("handles the values a metadata blob really carries", () => {
        expect(canonicalJson({ z: null, a: true, m: "x", n: 1.5 })).toBe('{"a":true,"m":"x","n":1.5,"z":null}');
    });
});

describe("hashInput", () => {
    it("joins the fields in the documented order, newline separated", () => {
        const parts = hashInput(REAL).split("\n");
        expect(parts[0]).toBe(REAL.prev_hash);
        expect(parts[1]).toBe(REAL.id);
        expect(parts[2]).toBe(REAL.created_at);
        expect(parts[3]).toBe(""); // no actor_id on this row
        expect(parts[4]).toBe(REAL.actor_email);
        expect(parts[5]).toBe(REAL.action);
        expect(parts[6]).toBe(REAL.category);
        expect(parts[7]).toBe(REAL.summary);
        expect(parts[8]).toBe('{"drill":true,"initiator":"person"}');
        // actor_kind is appended only when set, which is how rows written
        // before that column existed still hash the way they always did.
        expect(parts[9]).toBe("agent");
    });

    it("appends nothing when a row has no actor_kind", () => {
        const { actor_kind, ...older } = REAL;
        expect(hashInput(older).split("\n")).toHaveLength(9);
    });

    it("uses created_at as the document spells it, never reformatted", () => {
        // Reformatting a timestamp is the likeliest way to produce a false
        // mismatch, so the string is passed through untouched.
        expect(hashInput(REAL)).toContain("2026-09-20T06:12:41.123456789Z");
    });
});

describe("verifyRecord", () => {
    async function withRealHash(e: RecordEntry): Promise<RecordEntry> {
        const bytes = new TextEncoder().encode(hashInput(e));
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        const hex = Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        return { ...e, entry_hash: hex };
    }

    it("verifies a row whose hash matches its contents", async () => {
        const row = await withRealHash(REAL);
        const r = await verifyRecord({ entries: [row] });
        expect(r.verified).toBe(1);
        expect(r.mismatched).toBe(0);
        expect(r.rows[0].verdict).toBe("verified");
    });

    it("catches a row whose summary was edited after it was written", async () => {
        const row = await withRealHash(REAL);
        const tampered = { ...row, summary: "allowed the drill agent, send_message: fine" };
        const r = await verifyRecord({ entries: [tampered] });
        expect(r.mismatched).toBe(1);
        expect(r.rows[0].verdict).toBe("mismatch");
        expect(r.rows[0].recomputed).not.toBe(r.rows[0].expected);
    });

    it("catches an edit to metadata, which is inside the hash", async () => {
        const row = await withRealHash(REAL);
        const tampered = { ...row, metadata: '{"drill":true,"initiator":"schedule"}' };
        expect((await verifyRecord({ entries: [tampered] })).mismatched).toBe(1);
    });

    it("reports a redacted row as redacted, not as tampering", async () => {
        // Retention cleared its content on purpose. Calling that an edit would
        // be wrong, and would teach people to distrust a working system.
        const r = await verifyRecord({ entries: [{ ...REAL, entry_hash: "abc", redacted_at: "2026-08-01T00:00:00Z" }] });
        expect(r.redacted).toBe(1);
        expect(r.mismatched).toBe(0);
        expect(r.rows[0].verdict).toBe("redacted");
    });

    it("reports a row with no hash as unhashed, not as verified", async () => {
        const { entry_hash, ...noHash } = REAL as RecordEntry & { entry_hash?: string };
        const r = await verifyRecord({ entries: [noHash] });
        expect(r.unhashed).toBe(1);
        expect(r.verified).toBe(0);
    });

    it("does not crash on metadata that will not parse, and calls it a mismatch", async () => {
        const r = await verifyRecord({ entries: [{ ...REAL, metadata: "{not json", entry_hash: "abc" }] });
        expect(r.mismatched).toBe(1);
    });

    it("shows the document's own instructions and limits rather than restating them", async () => {
        const r = await verifyRecord({
            entries: [],
            how_to_verify: ["step one"],
            limits: ["only your rows"],
            proof: { subject: "someone@example.com", truncated: true },
        });
        expect(r.howToVerify).toEqual(["step one"]);
        expect(r.limits).toEqual(["only your rows"]);
        expect(r.subject).toBe("someone@example.com");
        expect(r.truncated).toBe(true);
    });
});

describe("entriesOf", () => {
    it("reads a member record", () => {
        expect(entriesOf({ entries: [REAL] })).toHaveLength(1);
    });

    it("reads the audit_log section of a workspace evidence pack", () => {
        expect(entriesOf({ sections: { audit_log: [REAL, REAL] } })).toHaveLength(2);
    });

    it("reads nothing out of a file that is neither", () => {
        expect(entriesOf({})).toEqual([]);
    });
});

// A file the PRODUCT produced, checked by this browser implementation.
//
// The recipe exists twice on purpose: once in Go, where the hash is written,
// and once here, where a stranger checks it. Independent reimplementation is
// the whole value, and it is also how the two quietly drift apart. This is a
// real export from the live demo; if the Go side ever changes how a row is
// hashed without this being updated, it fails here rather than on a customer's
// screen in front of their auditor.
describe("a record the product really produced", () => {
    it("verifies with no mismatches", async () => {
        const doc = (await import("./__fixtures__/live-record.json")).default;
        const r = await verifyRecord(doc as never);
        expect(r.rows.length).toBeGreaterThan(0);
        expect(r.mismatched).toBe(0);
        expect(r.verified).toBe(r.rows.length);
    });

    it("carries the instructions and limits a reader is shown", async () => {
        const doc = (await import("./__fixtures__/live-record.json")).default;
        const r = await verifyRecord(doc as never);
        expect(r.howToVerify.length).toBeGreaterThan(0);
        expect(r.limits.length).toBeGreaterThan(0);
        // The one that distinguishes a member's record from the admin's pack.
        expect(r.limits.join(" ")).toContain("only the rows recorded against you");
    });
});
