"use client";

import { useRef, useState } from "react";
import { adminApi, type AdminBlogPost, type BlogPostPayload } from "@/lib/adminApi";
import { renderMarkdown } from "@/lib/markdown";
import { Button } from "@/components/ui/Button";

interface Props {
  post: AdminBlogPost | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

/** Markdown-based post editor with a formatting toolbar, media upload, and a
 *  live preview. Trusted (admin-only) authoring. */
export function BlogEditor({ post, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [author, setAuthor] = useState(post?.author ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).join(", "));
  const [content, setContent] = useState(post?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(post?.seo_desc ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Wrap or insert markdown around the current selection.
  function surround(before: string, after = before, placeholder = "") {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + before.length;
      ta.selectionEnd = start + before.length + selected.length;
    });
  }

  function prefixLine(prefix: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const next = content.slice(0, lineStart) + prefix + content.slice(lineStart);
    setContent(next);
    requestAnimationFrame(() => ta.focus());
  }

  async function handleMediaUpload(file: File, asCover: boolean) {
    setError("");
    setUploading(true);
    try {
      const { url } = await adminApi.blogUpload(file);
      if (asCover) {
        setCoverImage(url);
      } else {
        const isVideo = file.type.startsWith("video/");
        const snippet = isVideo
          ? `\n<video src="${url}" controls style="max-width:100%"></video>\n`
          : `\n![${file.name}](${url})\n`;
        setContent((c) => c + snippet);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setError("");
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    const payload: BlogPostPayload = {
      slug: slug.trim(),
      title: title.trim(),
      excerpt: excerpt.trim(),
      cover_image: coverImage.trim(),
      content,
      author: author.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
      seo_title: seoTitle.trim(),
      seo_desc: seoDesc.trim(),
    };
    try {
      if (post) await adminApi.blogUpdate(post.id, payload);
      else await adminApi.blogCreate(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const toolbar: { label: string; title: string; action: () => void }[] = [
    { label: "B", title: "Bold", action: () => surround("**", "**", "bold text") },
    { label: "I", title: "Italic", action: () => surround("_", "_", "italic text") },
    { label: "H2", title: "Heading", action: () => prefixLine("## ") },
    { label: "H3", title: "Subheading", action: () => prefixLine("### ") },
    { label: "“ ”", title: "Quote", action: () => prefixLine("> ") },
    { label: "• List", title: "Bullet list", action: () => prefixLine("- ") },
    { label: "1.", title: "Numbered list", action: () => prefixLine("1. ") },
    { label: "</>", title: "Code", action: () => surround("`", "`", "code") },
    { label: "Link", title: "Link", action: () => surround("[", "](https://)", "text") },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
          ← Back to posts
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          >
            {showPreview ? "Edit" : "Preview"}
          </button>
          <Button onClick={save} disabled={saving} size="sm">
            {saving ? "Saving…" : status === "published" ? "Publish" : "Save draft"}
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main editor */}
        <div className="space-y-4 lg:col-span-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold text-white outline-none placeholder:text-slate-600 focus:border-brand"
          />

          {showPreview ? (
            <div
              className="prose prose-invert min-h-[24rem] max-w-none rounded-xl border border-white/10 bg-white/[0.02] p-6"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1.5">
                {toolbar.map((b) => (
                  <button
                    key={b.title}
                    type="button"
                    title={b.title}
                    onClick={b.action}
                    className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/10"
                  >
                    {b.label}
                  </button>
                ))}
                <button
                  type="button"
                  title="Insert image / video"
                  onClick={() => mediaInputRef.current?.click()}
                  disabled={uploading}
                  className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-light hover:bg-white/10"
                >
                  {uploading ? "Uploading…" : "+ Media"}
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleMediaUpload(f, false);
                    e.target.value = "";
                  }}
                />
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post in Markdown… Use the toolbar, or paste images via + Media."
                className="min-h-[24rem] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-brand"
              />
            </>
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Slug" hint="Leave blank to auto-generate from the title.">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-post-slug" className={inputCls} />
          </Field>
          <Field label="Author">
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Akash" className={inputCls} />
          </Field>
          <Field label="Tags" hint="Comma-separated.">
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="AI, product, guide" className={inputCls} />
          </Field>
          <Field label="Excerpt" hint="Shown on cards & social previews.">
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={inputCls} />
          </Field>
          <Field label="Cover image">
            <div className="space-y-2">
              {coverImage && <p className="truncate text-xs text-slate-500">{coverImage}</p>}
              <div className="flex gap-2">
                <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/onecamp/blog/media/…" className={inputCls} />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-slate-300 hover:bg-white/10"
                >
                  Upload
                </button>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleMediaUpload(f, true);
                  e.target.value = "";
                }}
              />
            </div>
          </Field>
          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">SEO (optional)</p>
            <Field label="SEO title">
              <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={inputCls} />
            </Field>
            <div className="mt-3">
              <Field label="SEO description">
                <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} className={inputCls} />
              </Field>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
