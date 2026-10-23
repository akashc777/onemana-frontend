import { site } from "./site";

/** BackendError is a backend answer that wasn't a success, with its status. */
export class BackendError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "BackendError";
  }
}

type ReadOptions = { revalidate?: number; noStore?: boolean };

/** How long to wait before each retry of a read that failed in passing: a 429
 *  from the backend's per-address limit (a burst of 120, then 4 a second, and
 *  Vercel's server-side reads share a few addresses), an answer of 500 or more
 *  (Cloudflare's 52x included), or no answer at all (lib/backend.test.ts). The
 *  429's Retry-After of 60 s is ignored: the bucket refills a read in 0.25 s. */
const RETRY_WAITS_MS = [400, 1200];

/** How long one attempt may take, answer and body, before it's abandoned and
 *  counts as unreached. A backend that never answers then costs a page at most
 *  3 × 10 s plus the waits, 31.6 s: inside Next's 60 s limit on building a
 *  page and the render check's 45 s, and shorter for a visitor (CR-18's SF). */
const READ_TIMEOUT_MS = 10_000;

const passing = (status: number) => status === 429 || status >= 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** backendJSON reads `data` from a public backend endpoint, cached for
 *  `revalidate` seconds (default 300), or past every cache with `noStore`.
 *  The one reader docs and blog share; each had an identical copy. */
export async function backendJSON<T>(path: string, opts: ReadOptions = {}): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = opts.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: opts.revalidate ?? 300 } };
  for (let attempt = 0; ; attempt++) {
    const retry = attempt < RETRY_WAITS_MS.length;
    // Each attempt carries a signal of its own. In a server render React
    // memoizes fetch by URL and init, failures included, and would hand a
    // retry the first attempt's answer; it skips a fetch with its own signal.
    // Next drops the signal when it revalidates, so its data cache still works.
    const attemptCtl = new AbortController();
    const timer = setTimeout(() => attemptCtl.abort(), READ_TIMEOUT_MS);
    let res: Response;
    let data: unknown;
    try {
      res = await fetch(`${site.backendUrl}${path}`, { ...init, signal: attemptCtl.signal });
      // A good answer must parse: a body cut off or garbled is a failed read,
      // never "no data", which a page would take for a missing guide.
      data = res.ok ? await res.json() : await res.json().catch(() => ({}));
    } catch (e) {
      if (!retry) throw e;
      await wait(RETRY_WAITS_MS[attempt]);
      continue;
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) return (data as { data: T }).data;
    if (passing(res.status) && retry) {
      await wait(RETRY_WAITS_MS[attempt]);
      continue;
    }
    throw new BackendError((data as { msg?: string })?.msg || `Request failed (${res.status})`, res.status);
  }
}

/** backendJSONOrNull reads one item that may not exist: null when the backend
 *  answers 404, and a throw for any other failure. A page that regenerates on a
 *  timer then keeps the copy it last built when a read fails, instead of
 *  caching "not found" for a guide or post that is still published. */
export async function backendJSONOrNull<T>(path: string, opts: ReadOptions = {}): Promise<T | null> {
  try {
    return await backendJSON<T>(path, opts);
  } catch (e) {
    if (e instanceof BackendError && e.status === 404) return null;
    throw e;
  }
}
