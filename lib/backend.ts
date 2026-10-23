import { site } from "./site";

/** BackendError is a backend answer that wasn't a success, with its status. */
export class BackendError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "BackendError";
  }
}

type ReadOptions = { revalidate?: number; noStore?: boolean };

/** How long to wait before each retry of a read that failed in passing: an
 *  answer of 500 or more (Cloudflare's 52x included) or no answer at all. The
 *  backend sits behind Cloudflare, and from Vercel's builders it sometimes
 *  fails a read and answers the next one (lib/backend.test.ts). */
const RETRY_WAITS_MS = [400, 1200];

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
    let res: Response;
    try {
      res = await fetch(`${site.backendUrl}${path}`, init);
    } catch (e) {
      if (!retry) throw e;
      await wait(RETRY_WAITS_MS[attempt]);
      continue;
    }
    const data = await res.json().catch(() => ({}));
    if (res.ok) return (data as { data: T }).data;
    if (res.status >= 500 && retry) {
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
