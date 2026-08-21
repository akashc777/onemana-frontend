"use client";

import { useEffect } from "react";

/** Re-run something on an interval, but only while it is worth doing.
 *
 *  Both views that watch a workspace had their own copy of this, and both had the
 *  same reason for the `active` flag: a live workspace does not change on its own,
 *  so a page that keeps asking keeps costing somebody's battery for no news. */
export function usePoll(active: boolean, everyMs: number, fn: () => void) {
  useEffect(() => {
    if (!active) return;
    const t = setInterval(fn, everyMs);
    return () => clearInterval(t);
  }, [active, everyMs, fn]);
}
