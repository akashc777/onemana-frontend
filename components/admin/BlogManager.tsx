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
        <p className="text-sm text-muted-foreground">{posts.length} post{posts.length === 1 ? "" : "s"}</p>
        <Button size="sm" onClick={() => setView({ mode: "new" })}>
          + New post
        </Button>
      </div>

      {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>}
      {error && (
        <div className="py-8 text-center text-sm">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={load} className="btn-ghost mt-3 px-4 py-2 text-xs">Retry</button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No posts yet. Create your first one.</p>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-foreground">{p.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.status === "published"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  /{p.slug} · updated {formatDate(p.updated_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {p.status === "published" && (
                  <a
                    href={`/blog/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted"
                  >
                    View
                  </a>
                )}
                <button
                  onClick={() => openEdit(p.id)}
                  className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-foreground/80 hover:bg-muted"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-700 hover:bg-red-500/20 dark:text-red-300"
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
