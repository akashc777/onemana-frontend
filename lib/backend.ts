import { site } from "./site";

/** backendJSON reads `data` from a public backend endpoint, cached for
 *  `revalidate` seconds (default 300), or past every cache with `noStore`.
 *  The one reader docs and blog share; each had an identical copy. */
export async function backendJSON<T>(path: string, opts: { revalidate?: number; noStore?: boolean } = {}): Promise<T> {
  const init: RequestInit & { next?: { revalidate: number } } = opts.noStore
    ? { cache: "no-store" }
    : { next: { revalidate: opts.revalidate ?? 300 } };
  const res = await fetch(`${site.backendUrl}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { msg?: string })?.msg || `Request failed (${res.status})`);
  return (data as { data: T }).data;
}
