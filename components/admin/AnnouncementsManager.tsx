"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { adminApi, type Announcement } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";
import { AsyncState, StatusPill } from "./ui";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

export function AnnouncementsManager() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setError(null);
    setItems(null);
    adminApi
      .announcements()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function upload(file: File) {
    setUploading(true);
    try {
      const { url } = await adminApi.blogUpload(file);
      setMediaUrl(url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      window.alert("Add a title.");
      return;
    }
    setSaving(true);
    try {
      await adminApi.createAnnouncement({ title: title.trim(), body: body.trim(), media_url: mediaUrl });
      setTitle("");
      setBody("");
      setMediaUrl("");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function send(a: Announcement) {
    if (!window.confirm(`Email "${a.title}" to all customers? This sends a real email to every customer.`)) return;
    setSendingId(a.id);
    try {
      const msg = await adminApi.sendAnnouncement(a.id);
      window.alert(msg);
      load();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSendingId(null);
    }
  }

  async function remove(a: Announcement) {
    if (!window.confirm(`Delete "${a.title}"?`)) return;
    try {
      await adminApi.deleteAnnouncement(a.id);
      load();
    } catch {
      window.alert("Failed to delete");
    }
  }

  return (
    <div className="space-y-8">
      {/* Composer */}
      <form onSubmit={create} className="card space-y-3">
        <h2 className="font-semibold text-white">New product update</h2>
        <p className="-mt-1 text-xs text-slate-500">Write an update, optionally attach an image, then send it to every customer by email.</p>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title - e.g. OneCamp 2.4: faster search & new calendar" className={inputCls} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What's new… (plain text; blank lines start new paragraphs)" rows={6} className={inputCls} />
        <div className="flex flex-wrap items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-xs text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white" />
          {uploading && <span className="text-xs text-slate-500">Uploading…</span>}
          {mediaUrl && (
            <span className="flex items-center gap-2 text-xs text-emerald-300">
              Image attached
              <button type="button" onClick={() => { setMediaUrl(""); if (fileRef.current) fileRef.current.value = ""; }} className="text-slate-400 hover:text-white">remove</button>
            </span>
          )}
          <button type="submit" disabled={saving || !title.trim()} className="btn-primary ml-auto px-4 py-2 text-sm">
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
        {mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploaded image
          <img src={mediaUrl} alt="" className="max-h-48 rounded-lg border border-white/10" />
        )}
      </form>

      {/* History */}
      <AsyncState loading={items === null && !error} error={error} onRetry={load} />
      {items && (
        items.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((a) => (
              <div key={a.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{a.title}</h3>
                      <StatusPill status={a.status} />
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-400">{a.body.slice(0, 240)}{a.body.length > 240 ? "…" : ""}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Created {formatDateTime(a.created_at)}
                      {a.status === "sent" && ` · sent to ${a.recipient_count} customer${a.recipient_count === 1 ? "" : "s"}`}
                      {a.sent_at && ` · ${formatDateTime(a.sent_at)}`}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <button
                      onClick={() => send(a)}
                      disabled={sendingId === a.id || a.status === "sending"}
                      className="btn-primary px-3.5 py-2 text-xs disabled:opacity-50"
                    >
                      {sendingId === a.id || a.status === "sending" ? "Sending…" : a.status === "sent" ? "Resend to all" : "Send to all"}
                    </button>
                    <button onClick={() => remove(a)} className="rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20">Delete</button>
                  </div>
                </div>
                {a.media_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview of arbitrary uploaded image
                  <img src={a.media_url} alt="" className="mt-3 max-h-40 rounded-lg border border-white/10" />
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
