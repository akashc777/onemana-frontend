"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminDoc } from "@/lib/adminApi";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { DocEditor } from "@/components/admin/DocEditor";

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; doc: AdminDoc };

/** Groups admin docs by category, preserving first-seen order. */
function groupByCategory(docs: AdminDoc[]): { category: string; items: AdminDoc[] }[] {
  const order: string[] = [];
  const map = new Map<string, AdminDoc[]>();
  for (const d of docs) {
    const cat = d.category.trim() || "General";
    if (!map.has(cat)) {
      map.set(cat, []);
      order.push(cat);
    }
    map.get(cat)!.push(d);
  }
  return order.map((category) => ({ category, items: map.get(category)! }));
}

export function DocsManager() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [docs, setDocs] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .docList()
      .then(setDocs)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load docs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view.mode === "list") load();
  }, [view.mode, load]);

  async function openEdit(id: string) {
    setError(null);
    try {
      const doc = await adminApi.docGet(id);
      setView({ mode: "edit", doc });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open doc");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this doc permanently?")) return;
    try {
      await adminApi.docDelete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (view.mode === "new") {
    return <DocEditor doc={null} onClose={() => setView({ mode: "list" })} onSaved={() => setView({ mode: "list" })} />;
  }
  if (view.mode === "edit") {
    return <DocEditor doc={view.doc} onClose={() => setView({ mode: "list" })} onSaved={() => setView({ mode: "list" })} />;
  }

  const groups = groupByCategory(docs);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {docs.length} doc{docs.length === 1 ? "" : "s"}
        </p>
        <Button size="sm" onClick={() => setView({ mode: "new" })}>
          + New doc
        </Button>
      </div>

      {loading && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
      {error && (
        <div className="py-8 text-center text-sm">
          <p className="text-red-400">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 px-4 py-2 text-xs">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && docs.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">No docs yet. Create your first one.</p>
      )}

      {!loading && !error && docs.length > 0 && (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.category}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{g.category}</h3>
              <div className="space-y-2">
                {g.items.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-slate-400">
                          #{d.order_index}
                        </span>
                        <span className="truncate font-medium text-white">{d.title}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            d.status === "published"
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        /docs/{d.slug} · updated {formatDate(d.updated_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {d.status === "published" && (
                        <a
                          href={`/docs/${d.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                        >
                          View
                        </a>
                      )}
                      <button
                        onClick={() => openEdit(d.id)}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(d.id)}
                        className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
