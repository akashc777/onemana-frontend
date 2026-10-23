import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDoc } from "./docs";
import { getPost } from "./blog";

// A guide or post page shows "not found" only when the backend says so. On
// 23 Oct /docs/passkeys answered 404 for most of an hour while the guide was
// published: a failed read was taken for a missing guide, and the 404 was
// cached until the page regenerated. A read that fails has to throw, so the
// page keeps the copy it last built.
//
// The backend sits behind Cloudflare, and from Vercel's builders it sometimes
// answers 525 (the edge's handshake with it failed) or not at all, then answers
// a moment later. Such a read is tried again before it counts as a failure.

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const found = { data: { slug: "passkeys", title: "Passkeys" }, status: "success" };

/** Answers each read with the next step; the last step repeats. */
function answers(...steps: Array<{ body: unknown; status: number } | Error>) {
  let i = 0;
  const fetchMock = vi.fn(async () => {
    const step = steps[Math.min(i++, steps.length - 1)];
    if (step instanceof Error) throw step;
    return json(step.body, step.status);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/** Settles a read while its retry waits run on fake timers. */
async function settled(read: Promise<unknown>) {
  const out = read.then(
    (value) => ({ value, error: undefined as unknown }),
    (error: unknown) => ({ value: undefined as unknown, error }),
  );
  await vi.runAllTimersAsync();
  return out;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe.each([
  ["a guide", getDoc],
  ["a post", getPost],
])("%s by its slug", (_, read) => {
  it("is the backend's answer when it has one", async () => {
    answers({ body: found, status: 200 });
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
  });

  it("is null only when the backend says there is none, without asking again", async () => {
    const fetchMock = answers({ body: { msg: "not found", status: "error" }, status: 404 });
    expect((await settled(read("no-such-page"))).value).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws when the backend keeps failing, rather than calling the page missing", async () => {
    const fetchMock = answers({ body: { msg: "internal error", status: "error" }, status: 500 });
    expect((await settled(read("passkeys"))).error).toBeInstanceOf(Error);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("throws when the backend can't be reached at all", async () => {
    answers(new TypeError("fetch failed"));
    expect((await settled(read("passkeys"))).error).toBeInstanceOf(Error);
  });

  it("asks again when the edge's handshake with the backend fails once", async () => {
    const fetchMock = answers({ body: {}, status: 525 }, { body: found, status: 200 });
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // The backend limits each address to a burst of 120 reads, then 4 a second
  // (onemana-backend router.go, generalLimiter), and Vercel's server-side reads
  // share a few addresses. A short wait lets the bucket refill.
  it("asks again when the backend says to slow down", async () => {
    const fetchMock = answers({ body: { msg: "too many requests, please slow down" }, status: 429 }, { body: found, status: 200 });
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("asks again when a read doesn't reach the backend once", async () => {
    answers(new TypeError("fetch failed"), { body: found, status: 200 });
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
  });

  // In a server render React memoizes fetch by URL and init, failures included,
  // so a retry with the same init would get the first attempt's answer back
  // without reaching the backend. It skips a fetch carrying a signal of its own.
  it("gives each attempt a signal of its own", async () => {
    const signals: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        signals.push(init?.signal);
        return json({ msg: "internal error" }, 500);
      }),
    );
    await settled(read("passkeys"));
    expect(signals).toHaveLength(3);
    for (const s of signals) expect(s).toBeInstanceOf(AbortSignal);
    expect(new Set(signals).size).toBe(3);
  });

  it("gives up on a read that never answers, and asks again", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, init?: RequestInit) => {
        calls++;
        if (calls > 1) return Promise.resolve(json(found, 200));
        return new Promise<Response>((_, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("The read timed out", "AbortError")));
        });
      }),
    );
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
    expect(calls).toBe(2);
  });

  it("asks again when a good answer's body can't be read, rather than calling the page missing", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => (++calls === 1 ? new Response("{not json", { status: 200 }) : json(found, 200))),
    );
    expect((await settled(read("passkeys"))).value).toMatchObject({ slug: "passkeys" });
    expect(calls).toBe(2);
  });
});
