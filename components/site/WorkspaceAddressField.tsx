"use client";

import { useEffect, useRef, useState } from "react";
import { WORKSPACE_ZONE, checkSlug, slugFromInput, slugVerdict, type SlugVerdict } from "@/lib/workspaceAddress";

// The address a Cloud workspace will have, checked as it is typed.
//
// A taken name is said here, before the payment window opens, and not after
// paying. Each keystroke cancels the check before it, so a slow answer for an
// old spelling can never overwrite the answer for what is in the field now.

const CHECK_DELAY_MS = 350;

export function WorkspaceAddressField({
  value,
  onChange,
  onVerdict,
  inputClassName,
}: {
  value: string;
  onChange: (slug: string) => void;
  /** The verdict for what is in the field now, or null while it is unknown. */
  onVerdict: (v: SlugVerdict | null) => void;
  inputClassName: string;
}) {
  const [verdict, setVerdict] = useState<SlugVerdict | null>(null);
  const [checking, setChecking] = useState(false);
  // Kept in a ref so the effect below does not re-run when the parent passes a
  // new function on every render.
  const report = useRef(onVerdict);
  report.current = onVerdict;

  useEffect(() => {
    setVerdict(null);
    report.current(null);
    if (value.length < 3) {
      setChecking(false);
      return;
    }
    const ctl = new AbortController();
    setChecking(true);
    const t = window.setTimeout(() => {
      checkSlug(value, ctl.signal)
        .then((c) => {
          const v = slugVerdict(c);
          setVerdict(v);
          report.current(v);
        })
        .catch(() => {
          // Aborted by the next keystroke, or the network: neither is a verdict.
        })
        .finally(() => {
          if (!ctl.signal.aborted) setChecking(false);
        });
    }, CHECK_DELAY_MS);
    return () => {
      ctl.abort();
      window.clearTimeout(t);
    };
  }, [value]);

  const tone =
    verdict?.tone === "ok"
      ? "text-emerald-700 dark:text-emerald-300"
      : verdict?.tone === "bad"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          id="workspace-address"
          value={value}
          onChange={(e) => onChange(slugFromInput(e.target.value))}
          className={inputClassName}
          placeholder="your-company"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby="workspace-address-status"
          aria-invalid={verdict?.tone === "bad" || undefined}
        />
        <span className="shrink-0 text-sm text-muted-foreground">.{WORKSPACE_ZONE}</span>
      </div>
      <span id="workspace-address-status" role="status" className={`mt-1 block text-xs ${tone}`}>
        {checking
          ? "Checking…"
          : verdict
            ? verdict.text
            : value.length > 0 && value.length < 3
              ? "At least 3 letters or numbers."
              : "Letters, numbers and hyphens. This is where your team signs in."}
      </span>
    </div>
  );
}
