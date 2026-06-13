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
          <h1 className="text-lg font-semibold text-foreground">OneMana Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter your admin token to continue.</p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setTokenValue(e.target.value)}
          placeholder="Admin token"
          autoFocus
          autoComplete="off"
          className="w-full rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button disabled={busy || !token.trim()} className="btn-primary w-full">
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
