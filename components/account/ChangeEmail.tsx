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
      <button type="button" onClick={() => setOpen(true)} className="text-small font-medium text-brand-ink underline decoration-brand-ink/35 underline-offset-[3px] transition-colors hover:decoration-brand-ink">
        Change email
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2.5 rounded-lg border border-border bg-muted p-3 sm:p-4">
      {!sent ? (
        <>
          <label htmlFor="new-email" className="block text-caption text-muted-foreground">
            New email for this account (now {current})
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="new-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 min-w-0 flex-1 rounded-md border border-border-strong bg-card px-3 text-base text-foreground placeholder:text-faint sm:text-small"
              placeholder="billing@yourcompany.com"
              spellCheck={false}
            />
            <button type="button" onClick={send} disabled={busy || !email.trim()} className="btn-primary h-9 px-3.5 py-0 disabled:opacity-50">
              {busy ? "Sending…" : "Send code"}
            </button>
          </div>
        </>
      ) : (
        <>
          <label htmlFor="change-code" className="block text-caption text-muted-foreground">
            Enter the 6-digit code we sent to {email.trim()}. Your workspaces move to the new address too.
          </label>
          <div className="flex flex-wrap gap-2">
            <CodeInput
              id="change-code"
              value={code}
              onChange={setCode}
              className="h-9 w-32 rounded-md border border-border-strong bg-card px-3 font-mono text-base tracking-widest text-foreground sm:text-small"
              placeholder="000000"
            />
            <button type="button" onClick={confirm} disabled={busy || code.length !== CODE_LENGTH} className="btn-primary h-9 px-3.5 py-0 disabled:opacity-50">
              {busy ? "Checking…" : "Confirm"}
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="text-caption text-danger-ink">
          {error}
        </p>
      )}
      <button type="button" onClick={reset} className="text-caption text-muted-foreground transition-colors hover:text-foreground">
        Cancel
      </button>
    </div>
  );
}
