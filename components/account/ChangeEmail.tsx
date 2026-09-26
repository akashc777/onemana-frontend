"use client";

import { useState } from "react";
import { portalApi } from "@/lib/portalApi";
import { CODE_LENGTH } from "@/lib/oneTimeCode";
import CodeInput from "./CodeInput";

// Moving the account to a new address, proven by a code sent there.
//
// Only an operator could do this before, so a team whose billing contact left
// had to write in. Two steps on one small form: the new address, then the code.
// On success the account reloads, so every place showing the address updates.
export function ChangeEmail({ current, onChanged }: { current: string; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setOpen(false);
    setEmail("");
    setCode("");
    setSent(false);
    setError("");
  };

  const send = async () => {
    setBusy(true);
    setError("");
    try {
      await portalApi.requestEmailChange(email.trim());
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      await portalApi.confirmEmailChange(email.trim(), code.trim());
      reset();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That code is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs font-medium text-brand hover:underline">
        Change email
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-border bg-background p-3">
      {!sent ? (
        <>
          <label htmlFor="new-email" className="block text-xs text-muted-foreground">
            New email for this account (now {current})
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="billing@yourcompany.com"
            />
            <button type="button" onClick={send} disabled={busy || !email.trim()} className="btn-primary px-3 py-2 text-sm disabled:opacity-50">
              {busy ? "Sending…" : "Send code"}
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="change-code" className="block text-xs text-muted-foreground">
            Enter the 6-digit code we sent to {email.trim()}. Your workspaces move to the new address too.
          </label>
          <div className="flex flex-wrap gap-2">
            <CodeInput
              id="change-code"
              value={code}
              onChange={setCode}
              className="w-32 rounded-md border border-border bg-background px-3 py-2 text-sm tracking-widest"
              placeholder="000000"
            />
            <button type="button" onClick={confirm} disabled={busy || code.length !== CODE_LENGTH} className="btn-primary px-3 py-2 text-sm disabled:opacity-50">
              {busy ? "Checking…" : "Confirm"}
            </button>
          </div>
        </>
      )}
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
        Cancel
      </button>
    </div>
  );
}
