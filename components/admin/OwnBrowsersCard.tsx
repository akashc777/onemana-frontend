"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type ExcludedBrowser } from "@/lib/adminApi";
import { getVisitorId } from "@/lib/track";

/**
 * The operator's own browsers. Every browser that signs in to this admin panel
 * is added here, and its visits (past ones and demo visits included) are left
 * out of every number on this page. Removing one counts it again.
 */
export function OwnBrowsersCard({ onChange }: { onChange?: () => void }) {
  const [list, setList] = useState<ExcludedBrowser[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const thisBrowser = getVisitorId();

  const load = useCallback(async () => {
    try {
      setList(await adminApi.excludedBrowsers());
      setError("");
    } catch {
      setError("Couldn't load your browsers.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countAgain = async (id: string) => {
    setBusy(id);
    try {
      setList(await adminApi.includeBrowser(id));
      onChange?.();
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
      <p className="text-sm font-semibold text-foreground">Your own visits</p>
      <p className="mb-3 mt-1 text-[11px] text-muted-foreground">
        Any browser you sign in to this panel from is left out of every number here, including its earlier
        visits and its demo visits. To leave out your phone too, sign in here from it once.
      </p>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {list && list.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
      {list && list.length > 0 && (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {list.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="min-w-0 truncate text-foreground/80">
                {b.label || "Browser"}
                {b.id === thisBrowser && <span className="ml-2 text-xs text-muted-foreground">(this browser)</span>}
                <span className="ml-2 text-xs text-muted-foreground">
                  since {new Date(b.added_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </span>
              <button
                onClick={() => void countAgain(b.id)}
                disabled={busy === b.id}
                className="btn-ghost shrink-0 px-3 py-1 text-xs"
              >
                {busy === b.id ? "Saving…" : "Count again"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
