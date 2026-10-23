import { site } from "./site";

/** BackendError is a backend answer that wasn't a success, with its status. */
export class BackendError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "BackendError";
  }
}

type ReadOptions = { revalidate?: number; noStore?: boolean };

/** backendJSON reads `data` from a public backend endpoint, cached for
 *  `revalidate` seconds (default 300), or past every cache with `noStore`.
 *  The one reader docs and blog share; each had an identical copy. */
export async function backendJSON<T>(path: string, opts: ReadOptions = {}): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = opts.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: opts.revalidate ?? 300 } };
  const res = await fetch(`${site.backendUrl}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new BackendError((data as { msg?: string })?.msg || `Request failed (${res.status})`, res.status);
  return (data as { data: T }).data;
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
