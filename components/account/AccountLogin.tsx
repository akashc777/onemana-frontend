"use client";

import { useState } from "react";
import { portalApi } from "@/lib/portalApi";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

/**
 * AccountLogin runs the passwordless flow: enter email -> receive a 6-digit
 * code -> verify. On success it calls onSignedIn so the parent can load the
 * dashboard. The code step is enumeration-safe (the server always responds the
 * same way), so we always advance to the code screen.
 */
export function AccountLogin({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="grid min-h-[70vh] place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white">Your OneCamp account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to download invoices, view your license, and manage your subscription.
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={sendCode} className="card space-y-4">
            <div>
              <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email address
              </label>
              <input
                id="acc-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={inputCls}
              />
              <p className="mt-1.5 text-xs text-slate-500">Use the email you purchased with.</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button disabled={busy || !email.trim()} className="btn-primary w-full">
              {busy ? "Sending…" : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verify} className="card space-y-4">
            {notice && <p className="rounded-lg border border-brand/20 bg-brand/10 px-3 py-2 text-xs text-slate-300">{notice}</p>}
            <div>
              <label htmlFor="acc-code" className="mb-1.5 block text-sm font-medium text-slate-300">
                6-digit code
              </label>
              <input
                id="acc-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className={`${inputCls} text-center text-lg tracking-[0.5em]`}
              />
              <p className="mt-1.5 text-xs text-slate-500">Sent to {email}. It expires in 10 minutes.</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button disabled={busy || code.length < 6} className="btn-primary w-full">
              {busy ? "Verifying…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(""); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
