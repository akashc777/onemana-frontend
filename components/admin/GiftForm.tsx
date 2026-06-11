"use client";

import { useState } from "react";
import { adminApi } from "@/lib/adminApi";

const inputCls =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

/**
 * GiftForm lets an admin grant a free lifetime license or N months of Cloud to
 * any email (existing or new customer). The recipient gets an email with their
 * key. Shown above the customers table.
 */
export function GiftForm({ onGifted }: { onGifted?: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"license" | "subscription">("license");
  const [months, setMonths] = useState("3");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!email.trim()) {
      setErr("Enter the recipient's email.");
      return;
    }
    const m = parseInt(months, 10);
    if (kind === "subscription" && (Number.isNaN(m) || m < 1)) {
      setErr("Enter a valid number of months.");
      return;
    }
    if (!window.confirm(kind === "license"
      ? `Gift a free lifetime license to ${email.trim()}?`
      : `Gift ${m} month(s) of OneCamp Cloud to ${email.trim()}?`)) return;
    setBusy(true);
    try {
      const res = await adminApi.gift({ email: email.trim(), name: name.trim(), kind, months: m });
      setMsg(`Gifted to ${res.email}. Key: ${res.license_key}`);
      setEmail("");
      setName("");
      onGifted?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to gift.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mb-6 space-y-3">
      <div>
        <h2 className="font-semibold text-white">Gift access</h2>
        <p className="mt-0.5 text-xs text-slate-500">Grant a free lifetime license or a few months of Cloud to any email. They&apos;ll get their key by email.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Recipient email" className={`${inputCls} lg:col-span-2`} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" className={inputCls} />
        <select value={kind} onChange={(e) => setKind(e.target.value as "license" | "subscription")} className={inputCls}>
          <option value="license">Lifetime license</option>
          <option value="subscription">Cloud months</option>
        </select>
        {kind === "subscription" ? (
          <input value={months} onChange={(e) => setMonths(e.target.value.replace(/\D/g, ""))} placeholder="Months" inputMode="numeric" className={inputCls} />
        ) : (
          <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-sm">{busy ? "Gifting…" : "Gift"}</button>
        )}
      </div>
      {kind === "subscription" && (
        <button type="submit" disabled={busy} className="btn-primary px-4 py-2 text-sm">{busy ? "Gifting…" : "Gift"}</button>
      )}
      {msg && <p className="break-all text-xs text-emerald-300">{msg}</p>}
      {err && <p className="text-xs text-red-400">{err}</p>}
    </form>
  );
}
