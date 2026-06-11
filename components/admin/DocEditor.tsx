"use client";

import { useRef, useState } from "react";
import { adminApi, type AdminDoc, type DocPayload } from "@/lib/adminApi";
import { renderMarkdown } from "@/lib/markdown";
import { Button } from "@/components/ui/Button";

interface Props {
  doc: AdminDoc | null;
  categories?: string[];
  onClose: () => void;
  onSaved: () => void;
}

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

/** Markdown-based doc editor with a formatting toolbar, media upload, and a
 *  live preview. Docs use a category + order index for sidebar grouping.
 *  Trusted (admin-only) authoring. */
export function DocEditor({ doc, categories = [], onClose, onSaved }: Props) {
  const [title, setTitle] = useState(doc?.title ?? "");
  const [slug, setSlug] = useState(doc?.slug ?? "");
  const [category, setCategory] = useState(doc?.category ?? "");
  const [orderIndex, setOrderIndex] = useState(String(doc?.order_index ?? 0));
  const [content, setContent] = useState(doc?.content ?? "");
  const [seoTitle, setSeoTitle] = useState(doc?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(doc?.seo_desc ?? "");
  const [status, setStatus] = useState<"draft" | "published">(doc?.status ?? "draft");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  async function handleMediaUpload(file: File) {
    setError("");
    setUploading(true);
    try {
      const { url } = await adminApi.blogUpload(file);
      const isVideo = file.type.startsWith("video/");
      const snippet = isVideo
        ? `\n<video src="${url}" controls style="max-width:100%"></video>\n`
        : `\n![${file.name}](${url})\n`;
      setContent((c) => c + snippet);
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
    const order = parseInt(orderIndex, 10);
    setSaving(true);
    const payload: DocPayload = {
      slug: slug.trim(),
      title: title.trim(),
      category: category.trim(),
      content,
      order_index: Number.isFinite(order) ? order : 0,
      status,
      seo_title: seoTitle.trim(),
      seo_desc: seoDesc.trim(),
    };
    try {
      if (doc) await adminApi.docUpdate(doc.id, payload);
      else await adminApi.docCreate(payload);
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
    { label: "</>", title: "Inline code", action: () => surround("`", "`", "code") },
    { label: "{ }", title: "Code block", action: () => surround("\n```\n", "\n```\n", "code") },
    { label: "Link", title: "Link", action: () => surround("[", "](https://)", "text") },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
          ← Back to docs
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
            placeholder="Doc title"
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
                    if (f) handleMediaUpload(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your doc in Markdown… Use the toolbar, or paste images via + Media."
                className="min-h-[24rem] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-brand"
              />
            </>
          )}
        </div>

        {/* Sidebar settings */}
        <div className="space-y-4">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <Field label="Category" hint="Groups docs in the sidebar. Pick an existing one or type a new name.">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Getting started"
              list="doc-category-options"
              className={inputCls}
            />
            {categories.length > 0 && (
              <datalist id="doc-category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            )}
          </Field>
          <Field label="Order" hint="Lower numbers appear first within a category.">
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>
          <Field label="Slug" hint="Leave blank to auto-generate from the title.">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-doc-slug" className={inputCls} />
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
