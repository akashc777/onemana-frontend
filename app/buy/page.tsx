"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { indianStates } from "@/lib/states";
import { site } from "@/lib/site";

const BENEFITS = [
  "Unlimited users, no per-seat fees",
  "All modules incl. local AI",
  "Runs on your own server",
  "GST invoice emailed instantly",
  "Install command emailed with your key",
];

export default function BuyPage() {
  const { busy, error, setError, start } = useCheckout();
  const [scriptReady, setScriptReady] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [gstin, setGstin] = useState("");
  const [stateName, setStateName] = useState("");
  const [phone, setPhone] = useState("");

  const isIndia = country === "IN";
  const stateCode = useMemo(
    () => (isIndia ? indianStates.find((s) => s.name === stateName)?.code ?? "" : ""),
    [isIndia, stateName],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email — your license key is sent there.");
      return;
    }
    if (!scriptReady) {
      setError("Payment library is still loading. Please try again in a moment.");
      return;
    }
    await start(
      {
        email: email.trim(),
        name: name.trim(),
        country,
        gstin: isIndia ? gstin.trim() : "",
        state: isIndia ? stateName : "",
        state_code: stateCode,
        phone: phone.trim(),
      },
      phone.trim(),
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <section className="py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <aside>
            <h1 className="text-3xl font-bold tracking-tight text-ink">Get OneCamp</h1>
            <p className="mt-2 text-slate-600">Self-Hosted Unified Workspace — Lifetime License.</p>
            <div className="card mt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink">OneCamp Lifetime</span>
                <span className="text-2xl font-bold text-ink">₹{site.priceInr}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">One-time · all taxes included · unlimited users</p>
              <ul className="mt-5 space-y-2 text-sm text-slate-700">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs text-slate-400">Secure payment via Razorpay. We never see your card details.</p>
          </aside>

          <form onSubmit={handleSubmit} className="card h-fit space-y-4" noValidate>
            <Field label="Email" required hint="Your license key & invoice are sent here.">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name or company" autoComplete="name" />
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                <option value="IN">India</option>
                <option value="OTHER">Outside India</option>
              </select>
            </Field>
            {isIndia && (
              <>
                <Field label="State" hint="For your GST invoice (place of supply).">
                  <select value={stateName} onChange={(e) => setStateName(e.target.value)} className={inputCls}>
                    <option value="">Select state</option>
                    {indianStates.map((s) => (
                      <option key={s.code} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="GSTIN (optional)" hint="Add to claim input tax credit (B2B).">
                  <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} className={inputCls} placeholder="29ABCDE1234F1Z5" maxLength={15} />
                </Field>
              </>
            )}
            <Field label="Phone (optional)">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+91 …" autoComplete="tel" />
            </Field>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 text-base">
              {busy ? "Processing…" : `Pay ₹${site.priceInr} & get your key`}
            </button>
            <p className="text-center text-xs text-slate-400">
              By purchasing you agree to our <a href="/terms-of-service" className="underline">Terms</a> and{" "}
              <a href="/refund-policy" className="underline">Refund Policy</a>.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
