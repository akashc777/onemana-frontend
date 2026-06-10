"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminBlogPost } from "@/lib/adminApi";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { BlogEditor } from "@/components/admin/BlogEditor";

type View = { mode: "list" } | { mode: "new" } | { mode: "edit"; post: AdminBlogPost };

export function BlogManager() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    adminApi
      .blogList()
      .then(setPosts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view.mode === "list") load();
  }, [view.mode, load]);

  async function openEdit(id: string) {
    setError(null);
    try {
      const post = await adminApi.blogGet(id);
      setView({ mode: "edit", post });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open post");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      await adminApi.blogDelete(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  if (view.mode === "new") {
    return <BlogEditor post={null} onClose={() => setView({ mode: "list" })} onSaved={() => setView({ mode: "list" })} />;
  }
  if (view.mode === "edit") {
    return <BlogEditor post={view.post} onClose={() => setView({ mode: "list" })} onSaved={() => setView({ mode: "list" })} />;
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-400">{posts.length} post{posts.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={() => setView({ mode: "new" })}>
          + New post
        </Button>
      </div>

      {loading && <p className="py-8 text-center text-sm text-slate-500">Loading…</p>}
      {error && (
        <div className="py-8 text-center text-sm">
          <p className="text-red-400">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 px-4 py-2 text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="py-12 text-center text-sm text-slate-500">No posts yet. Create your first one.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-white">{p.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  /{p.slug} · updated {formatDate(p.updated_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {p.status === "published" && (
                  <a
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => openEdit(p.id)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
