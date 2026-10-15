"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copying a value somebody pastes somewhere else (a licence key, an install
 * command), and what the button says afterwards.
 *
 * ONE COPY, BECAUSE THE FAILURE MATTERS. The clipboard can refuse: an http
 * page, a browser that blocks it, a permission declined. /free's Copy caught
 * the refusal and said nothing, so its button went on reading "Copy" and a
 * paste into the server's shell gave whatever the clipboard held before. The
 * account page's copy said "Select it". Both buttons copy through here now,
 * and both say so when it did not work.
 */
export type CopyState = "" | "copied" | "failed";

/** Writes text to the clipboard: "copied", or "failed" where it cannot be written. */
export async function copyText(text: string): Promise<Exclude<CopyState, "">> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}

/** The last copy's outcome, back to "" after a moment, and the copy itself. */
export function useCopy(ms = 1600): [CopyState, (text: string) => Promise<void>] {
  const [state, setState] = useState<CopyState>("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(
    async (text: string) => {
      setState(await copyText(text));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState(""), ms);
    },
    [ms],
  );
  return [state, copy];
}
