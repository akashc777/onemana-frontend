"use client";

/**
 * Import posts from the configured Jekyll repository.
 *
 * The blog was built here and filled nowhere. This is the path from an archive
 * that lives somewhere else to posts that live here, chosen one at a time
 * rather than in bulk, because the operator is the only one who knows which of
 * their old writing belongs on a product site.
 *
 * Images are pulled into our own media store by default. Leaving them at the
 * origin renders today and breaks the day that repository is renamed or made
 * private, which is most of the reason for importing at all.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  adminApi,
  type BlogImportCandidate,
  type BlogImportOutcome,
  type BlogImportSource,
} from "@/lib/adminApi";
import { Button } from "@/components/ui/Button";

/** Statuses that mean "nothing more to do here", so the row can be dimmed. */
const DONE: Record<string, string> = {
  created: "text-emerald-700 dark:text-emerald-300",
  skipped: "text-muted-foreground",
  deferred: "text-amber-700 dark:text-amber-300",
  failed: "text-red-600 dark:text-red-400",
};

export function BlogImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [candidates, setCandidates] = useState<BlogImportCandidate[]>([]);
  const [source, setSource] = useState<BlogImportSource | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [outcomes, setOutcomes] = useState<BlogImportOutcome[] | null>(null);
  const [publish, setPublish] = useState(false);
  const [withImages, setWithImages] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.blogImportAvailable();
      setCandidates(res.data ?? []);
      setSource(res.source ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read the repository");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Only rows that can actually be imported are selectable, so the count on the
  // button is the number of posts that will be attempted, not a number that
  // quietly shrinks when the run starts.
  const importable = useMemo(
    () => candidates.filter((c) => !c.imported && !c.problem),
    [candidates],
  );

  const toggle = (path: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const run = async () => {
    if (selected.size === 0 || running) return;
    setRunning(true);
    setError(null);
    try {
      const res = await adminApi.blogImportRun({
        paths: [...selected],
        publish,
        with_images: withImages,
      });
      setOutcomes(res.results);
      setSelected(new Set());
      // The list behind this dialog is now stale whatever happened, because a
      // skip still means somebody should see what is already there.
      onImported();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setRunning(false);
    }
  };

  const summary = useMemo(() => {
    if (!outcomes) return null;
    const counts: Record<string, number> = {};
    for (const o of outcomes) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [outcomes]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-canvas p-5 shadow-xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Import posts</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {source?.repo ? `${source.repo} · ${source.branch} · ${source.dir}` : "No repository configured"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            {error}
            {!source?.repo && (
              <p className="mt-1 text-muted-foreground">
                Set <code>blog_import_repo</code> in Settings, for example{" "}
                <code>owner/name</code>.
              </p>
            )}
          </div>
        )}

        {loading && <p className="py-8 text-center text-sm text-muted-foreground">Reading the repository…</p>}

        {!loading && candidates.length > 0 && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={withImages}
                  onChange={(e) => setWithImages(e.target.checked)}
                />
                Copy images here
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                Publish immediately, keeping the original date
              </label>
              <button
                type="button"
                className="ml-auto text-xs text-muted-foreground underline"
                onClick={() =>
                  setSelected((prev) =>
                    prev.size === importable.length ? new Set() : new Set(importable.map((c) => c.path)),
                  )
                }
              >
                {selected.size === importable.length ? "Select none" : `Select all ${importable.length}`}
              </button>
            </div>

            <div className="max-h-[45vh] space-y-1 overflow-y-auto rounded-xl border border-border p-2">
              {candidates.map((c) => {
                const blocked = c.imported || Boolean(c.problem);
                return (
                  <label
                    key={c.path}
                    className={`flex items-start gap-3 rounded-lg px-2 py-2 text-sm ${
                      blocked ? "opacity-60" : "cursor-pointer hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4"
                      disabled={blocked}
                      checked={selected.has(c.path)}
                      onChange={() => toggle(c.path)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{c.slug}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.date ? new Date(c.date).toLocaleDateString() : "no date"}
                        {c.imported && " · already imported"}
                        {c.problem && ` · ${c.problem}`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}

        {!loading && !error && candidates.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No Jekyll posts found in that directory.
          </p>
        )}

        {summary && (
          <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-sm">
            <p className="font-medium text-foreground">
              {Object.entries(summary)
                .map(([k, n]) => `${n} ${k}`)
                .join(", ")}
            </p>
            <ul className="mt-2 max-h-32 space-y-0.5 overflow-y-auto text-xs">
              {outcomes
                ?.filter((o) => o.status !== "created")
                .map((o) => (
                  <li key={o.path} className={DONE[o.status]}>
                    {o.slug || o.path}: {o.detail || o.status}
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={running}>
            Done
          </Button>
          <Button size="sm" onClick={run} disabled={running || selected.size === 0}>
            {running ? "Importing…" : `Import ${selected.size || ""}`.trim()}
          </Button>
        </div>
      </div>
    </div>
  );
}
