"use client";

import { useEffect, useRef, useState } from "react";
import { portalApi } from "@/lib/portalApi";
import { CODE_LENGTH } from "@/lib/oneTimeCode";
import CodeInput from "./CodeInput";
import { CampCanvas, LogoRing } from "@/components/ui/v3";

const inputCls =
  "ui-field";

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

  // THE AUTH CARD (site.md AC1): the one place a centred column is right,
  // on a soft camp canvas so the page around it is a designed ground rather
  // than empty. There is no sign-up: only buyers have accounts.
  return (
    <div className="container-x pb-24 pt-6 sm:pt-10">
      <CampCanvas soft rings={false} className="flex min-h-[560px] items-start justify-center rounded-[20px] px-4 py-10 sm:min-h-[640px] sm:rounded-4xl sm:py-16">
      <div key={step} className="in-lift w-full max-w-[440px] rounded-2xl bg-card p-6 shadow-e2 sm:p-8">
        <LogoRing size={40} stroke={4} />
        <h1 className="mt-5 text-h3 text-foreground">Sign in to your account</h1>
        <p className="mt-2 text-small text-muted-foreground">
          Download invoices, see your licence and manage Cloud.
        </p>

        {step === "email" ? (
          <form onSubmit={sendCode} className="mt-6 space-y-4">
            {notice && (
              <p role="status" className="rounded-md bg-info/10 px-3 py-2 text-small text-info-ink">
                {notice}
              </p>
            )}
            <div>
              <label htmlFor="acc-email" className="mb-1.5 block text-caption font-[510] text-foreground">
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
            <button disabled={busy} className="ui-btn ui-btn-lg ui-btn-primary w-full">
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="fx-slide mt-6 space-y-4">
            {notice && (
              <p role="status" className="rounded-md bg-info/10 px-3 py-2 text-small text-info-ink">
                {notice}
              </p>
            )}
            <div>
              <label htmlFor="acc-code" className="mb-1.5 block text-caption font-[510] text-foreground">
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
                className={`${inputCls} h-12 text-center font-mono text-[20px] font-semibold tracking-[0.5em] sm:h-12 sm:text-[20px]`}
              />
              <p className="mt-1.5 text-caption text-muted-foreground">Sent to {email}. It expires in 10 minutes.</p>
            </div>
            {error && (
              <p role="alert" className="text-small text-danger-ink">
                {error}
              </p>
            )}
            <button disabled={busy || code.length < CODE_LENGTH} className="ui-btn ui-btn-lg ui-btn-primary w-full">
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError("");
              }}
              className="min-h-11 w-full text-center text-small text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
      </CampCanvas>
    </div>
  );
}
