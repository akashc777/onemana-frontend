"use client";

import { useEffect, useRef, useState } from "react";
import { portalApi } from "@/lib/portalApi";
import { CODE_LENGTH } from "@/lib/oneTimeCode";
import CodeInput from "./CodeInput";

const inputCls =
  "h-11 w-full rounded-md border border-border-strong bg-card px-3.5 text-base text-foreground placeholder:text-faint sm:h-10 sm:text-small";

/**
 * AccountLogin runs the passwordless flow: enter email -> receive a 6-digit
 * code -> verify. On success it calls onSignedIn so the parent can load the
 * dashboard. The code step is enumeration-safe (the server always responds the
 * same way), so we always advance to the code screen.
 *
 * The field takes the cursor on a computer, not on a phone, where focusing it
 * would throw the keyboard up over the page before anyone asked. The button
 * stays enabled: an empty or malformed address is the browser's to point out.
 */
export function AccountLogin({
  onSignedIn,
  initialEmail = "",
  initialNotice = "",
}: {
  onSignedIn: () => void;
  initialEmail?: string;
  initialNotice?: string;
}) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState(initialNotice);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const emailField = useRef<HTMLInputElement>(null);
  const codeField = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    (step === "email" ? emailField : codeField).current?.focus();
  }, [step]);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const msg = await portalApi.requestCode(email.trim());
      setNotice(msg);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await portalApi.verify(email.trim(), code.trim());
      onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is invalid or has expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-x min-h-[calc(100dvh-3.5rem)] pb-24 pt-10 sm:pt-14">
      <div className="max-w-sm">
        <h1 className="text-[1.875rem] leading-[2.25rem] tracking-[-0.022em] text-foreground sm:text-[2.25rem] sm:leading-[2.625rem]">
          Your OneCamp account
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Sign in to download invoices, view your licence, and manage your subscription.
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
            {notice && (
              <p role="status" className="rounded-md bg-brand-soft px-3 py-2 text-small text-foreground">
                {notice}
              </p>
            )}
            <div>
              <label htmlFor="acc-email" className="mb-1.5 block text-small font-medium text-foreground">
                Email address
              </label>
              <input
                ref={emailField}
                id="acc-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                className={inputCls}
              />
              <p className="mt-1.5 text-caption text-muted-foreground">Use the email you bought with.</p>
            </div>
            {error && (
              <p role="alert" className="text-small text-danger-ink">
                {error}
              </p>
            )}
            <button disabled={busy} className="btn-brand h-11 w-full py-0 sm:h-10">
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
            {notice && (
              <p role="status" className="rounded-md bg-brand-soft px-3 py-2 text-small text-foreground">
                {notice}
              </p>
            )}
            <div>
              <label htmlFor="acc-code" className="mb-1.5 block text-small font-medium text-foreground">
                6-digit code
              </label>
              <CodeInput
                ref={codeField}
                id="acc-code"
                name="code"
                required
                value={code}
                onChange={setCode}
                placeholder="123456"
                className={`${inputCls} text-center font-mono tracking-[0.5em] sm:text-base`}
              />
              <p className="mt-1.5 text-caption text-muted-foreground">Sent to {email}. It expires in 10 minutes.</p>
            </div>
            {error && (
              <p role="alert" className="text-small text-danger-ink">
                {error}
              </p>
            )}
            <button disabled={busy || code.length < CODE_LENGTH} className="btn-brand h-11 w-full py-0 sm:h-10">
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              className="w-full text-center text-small text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
