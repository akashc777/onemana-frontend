"use client";

import Script from "next/script";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCheckout } from "@/hooks/useCheckout";
import { indianStates } from "@/lib/states";
import { countries } from "@/lib/countries";
import { cloudBenefits, lifetimeBenefits } from "@/lib/content";
import { fetchPricingClient, defaultPricing, fmtUSD, fmtINR, type Pricing } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/site/PageHeader";
import { Select } from "@/components/ui/Select";

type Plan = "lifetime" | "cloud";

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-muted-foreground">Loading…</div>}>
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
      setError("Please enter your email - your license key is sent there.");
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
      <PageHeader
        eyebrow="Checkout"
        title="Get OneCamp"
        subtitle={
          isCloud
            ? "Managed hosting, set up for you within 12 hours."
            : "Self-hosted workspace. Lifetime license, unlimited users."
        }
        align="left"
        className="!pb-6"
      />
      <section className="pb-16 sm:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-start">
          <aside>

            {/* Plan switch */}
            <div className="mt-6 grid grid-cols-2 gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setPlan("lifetime")}
                aria-pressed={!isCloud}
                className={`relative rounded-md px-3 py-2 font-medium transition ${!isCloud ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className="flex flex-col items-center gap-0.5 sm:flex-row sm:gap-1.5">
                  <span>Lifetime · self-host</span>
                  <span className="rounded border border-brand/30 bg-brand/[0.08] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-brand">
                    Popular
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPlan("cloud")}
                aria-pressed={isCloud}
                className={`rounded-md px-3 py-2 font-medium transition ${isCloud ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Cloud · managed
              </button>
            </div>

            <div className="card-premium card mt-6 bg-card/90">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-foreground">{isCloud ? "OneCamp Cloud" : "OneCamp Lifetime"}</span>
                <span className="text-2xl font-semibold text-foreground">
                  {isCloud ? fmtUSD(pricing.cloud_usd) : fmtUSD(pricing.lifetime_usd)}
                  {isCloud && <span className="text-sm font-normal text-muted-foreground"> /mo</span>}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {isCloud
                  ? `${fmtINR(pricing.cloud_inr)}/mo billed in INR · up to ${pricing.cloud_seats} users · includes a self-host license`
                  : `${fmtINR(pricing.lifetime_inr)} billed in INR · one-time · all taxes included · unlimited users`}
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Secure payment via Razorpay. We never see your card details.</p>
          </aside>

          <form onSubmit={handleSubmit} className="card-premium card h-fit space-y-4 bg-card/90" noValidate>
            <Field label="Email" required hint="Your license key & invoice are sent here.">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name or company" autoComplete="name" />
            </Field>
            <Field label="Country">
              <Select
                value={country}
                onChange={setCountry}
                ariaLabel="Country"
                options={countries.map((c) => ({ value: c.code, label: c.name }))}
              />
            </Field>
            {isIndia && (
              <>
                <Field label="State" hint="For your GST invoice (place of supply).">
                  <Select
                    value={stateName}
                    onChange={setStateName}
                    ariaLabel="State"
                    placeholder="Select state"
                    options={indianStates.map((s) => ({ value: s.name, label: s.name }))}
                  />
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
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>
            )}

            <Button type="submit" disabled={busy} variant="brandPremium" size="lg" className="w-full">
              {busy
                ? "Processing…"
                : isCloud
                  ? `Subscribe - ${fmtUSD(pricing.cloud_usd)}/mo (${fmtINR(pricing.cloud_inr)})`
                  : `Pay ${fmtUSD(pricing.lifetime_usd)} (${fmtINR(pricing.lifetime_inr)}) & get your key`}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By {isCloud ? "subscribing" : "purchasing"} you agree to our{" "}
              <a href="/terms-of-service" className="underline hover:text-foreground">Terms</a> and{" "}
              <a href="/refund-policy" className="underline hover:text-foreground">Refund Policy</a>.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base text-foreground outline-none transition placeholder:text-muted-foreground focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10 sm:text-sm";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label} {required && <span className="text-red-600 dark:text-red-400">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
