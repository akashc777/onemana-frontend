"use client";

import Script from "next/script";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCheckout } from "@/hooks/useCheckout";
import { indianStates } from "@/lib/states";
import { cloudBenefits, lifetimeBenefits } from "@/lib/content";
import { fetchPricingClient, defaultPricing, fmtUSD, fmtINR, type Pricing } from "@/lib/pricing";
import { AuroraBackdrop } from "@/components/site/Visuals";
import { Button } from "@/components/ui/Button";

type Plan = "lifetime" | "cloud";

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-slate-500">Loading…</div>}>
      <BuyInner />
    </Suspense>
  );
}

function BuyInner() {
  const params = useSearchParams();
  const initialPlan: Plan = params.get("plan") === "cloud" ? "cloud" : "lifetime";

  const { busy, error, setError, start, startCloud } = useCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [pricing, setPricing] = useState<Pricing>(defaultPricing);

  useEffect(() => {
    fetchPricingClient().then(setPricing);
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("IN");
  const [gstin, setGstin] = useState("");
  const [stateName, setStateName] = useState("");
  const [phone, setPhone] = useState("");

  const isIndia = country === "IN";
  const isCloud = plan === "cloud";
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
    const input = {
      email: email.trim(),
      name: name.trim(),
      country,
      gstin: isIndia ? gstin.trim() : "",
      state: isIndia ? stateName : "",
      state_code: stateCode,
      phone: phone.trim(),
    };
    if (isCloud) await startCloud(input, phone.trim());
    else await start(input, phone.trim());
  }

  const benefits = isCloud ? cloudBenefits : lifetimeBenefits;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <section className="relative overflow-hidden py-16 sm:py-20">
        <AuroraBackdrop className="!h-[50vh]" />
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <aside>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get OneCamp</h1>
            <p className="mt-2 text-slate-400">
              {isCloud ? "Managed hosting, set up for you within 12 hours." : "Self-hosted unified workspace — lifetime license."}
            </p>

            {/* Plan switch */}
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-sm">
              <button
                type="button"
                onClick={() => setPlan("lifetime")}
                aria-pressed={!isCloud}
                className={`rounded-lg px-3 py-2 font-medium transition ${!isCloud ? "bg-brand text-white" : "text-slate-400 hover:text-white"}`}
              >
                Lifetime · {fmtUSD(pricing.lifetime_usd)}
              </button>
              <button
                type="button"
                onClick={() => setPlan("cloud")}
                aria-pressed={isCloud}
                className={`rounded-lg px-3 py-2 font-medium transition ${isCloud ? "bg-brand text-white" : "text-slate-400 hover:text-white"}`}
              >
                Cloud · {fmtUSD(pricing.cloud_usd)}/mo
              </button>
            </div>

            <div className="card mt-6">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-white">{isCloud ? "OneCamp Cloud" : "OneCamp Lifetime"}</span>
                <span className="text-2xl font-bold text-white">
                  {isCloud ? fmtUSD(pricing.cloud_usd) : fmtUSD(pricing.lifetime_usd)}
                  {isCloud && <span className="text-sm font-normal text-slate-400"> /mo</span>}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {isCloud
                  ? `${fmtINR(pricing.cloud_inr)}/mo billed in INR · up to ${pricing.cloud_seats} users · includes a self-host license`
                  : `${fmtINR(pricing.lifetime_inr)} billed in INR · one-time · all taxes included · unlimited users`}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-300">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent-cyan">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs text-slate-500">Secure payment via Razorpay. We never see your card details.</p>
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
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <Button type="submit" disabled={busy} size="lg" className="w-full">
              {busy
                ? "Processing…"
                : isCloud
                  ? `Subscribe — ${fmtUSD(pricing.cloud_usd)}/mo (${fmtINR(pricing.cloud_inr)})`
                  : `Pay ${fmtUSD(pricing.lifetime_usd)} (${fmtINR(pricing.lifetime_inr)}) & get your key`}
            </Button>
            <p className="text-center text-xs text-slate-500">
              By {isCloud ? "subscribing" : "purchasing"} you agree to our{" "}
              <a href="/terms-of-service" className="underline hover:text-slate-300">Terms</a> and{" "}
              <a href="/refund-policy" className="underline hover:text-slate-300">Refund Policy</a>.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-2 focus:ring-brand/30";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
