"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  status: AsyncStatus;
  /** true while the first (or any) load is in flight. */
  loading: boolean;
  /** Re-run the async function. */
  reload: () => void;
}

/**
 * useAsync runs an async function on mount (and on `reload`), tracking
 * loading/error/data with race-safety: a stale resolution from a superseded
 * run is ignored. The function is referenced via a ref so callers can pass an
 * inline closure without retriggering on every render.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<AsyncStatus>("idle");

  const fnRef = useRef(fn);
  fnRef.current = fn;
  const runId = useRef(0);

  const reload = useCallback(() => {
    const id = ++runId.current;
    setStatus("loading");
    setError(null);
    fnRef.current()
      .then((result) => {
        if (id !== runId.current) return; // superseded
        setData(result);
        setStatus("success");
      })
      .catch((e: unknown) => {
        if (id !== runId.current) return;
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, status, loading: status === "loading", reload };
}
