"use client";

import { useState } from "react";

export function AdminLogin({ onSignIn }: { onSignIn: (token: string) => Promise<boolean> }) {
  const [token, setTokenValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const ok = await onSignIn(token);
    setBusy(false);
    if (!ok) setError("Invalid admin token.");
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-white">OneMana Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Enter your admin token to continue.</p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setTokenValue(e.target.value)}
          placeholder="Admin token"
          autoFocus
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={busy || !token.trim()} className="btn-primary w-full">
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
