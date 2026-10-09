"use client";

import { guessCountry } from "@/lib/guessCountry";
import Script from "next/script";
import { PlanComparison } from "@/components/site/PlanComparison";
import { choiceLabel, choicePrice, cloudChoices, cloudPlanCode, paymentTerms, yearlySaving, type Billing, billingFromParams, planFromParams } from "@/lib/paymentTerms";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCheckout } from "@/hooks/useCheckout";
import { indianStates } from "@/lib/states";
import { checkIndianBilling } from "@/lib/gstin";
import { countries } from "@/lib/countries";
import { contactForCheckout, dialPrefix, phoneForCountry } from "@/lib/dialCodes";
import { cloudBenefits, lifetimeBenefits } from "@/lib/content";
import { fetchPricingClient, defaultPricing, fmtUSD, fmtINR, dual, currencyNote, type Pricing } from "@/lib/pricing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { FREE_SEATS } from "@/lib/freePlan";
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
  const initialPlan: Plan = planFromParams(params.get("plan"));

  const { busy, error, setError, start, startCloud } = useCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [pricing, setPricing] = useState<Pricing>(defaultPricing);
  // Monthly unless the buyer chooses otherwise; the choice is only offered
  // once a yearly plan exists to charge it.
  // ?size=business opens on Business (the pricing page and the "outgrowing
  // its machine" email link here); it only sticks once Business is on sale.
  const [billing, setBilling] = useState<Billing>(billingFromParams(params.get("size"), params.get("billing")));

  useEffect(() => {
    fetchPricingClient().then(setPricing);
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  // A first guess from the browser, replaced on mount; see lib/guessCountry.
  const [country, setCountry] = useState("US");
  const [gstin, setGstin] = useState("");
  const [stateName, setStateName] = useState("");
  // Starts with the buyer's calling code; see lib/dialCodes.
  const [phone, setPhone] = useState(dialPrefix("US"));
  const changeCountry = (next: string) => {
    setPhone((current) => phoneForCountry(current, country, next));
    setCountry(next);
  };
  useEffect(() => {
    const guessed = guessCountry(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.languages ?? [navigator.language],
      new Set(countries.map((c) => c.code)),
    );
    setPhone((current) => phoneForCountry(current, "US", guessed));
    setCountry(guessed);
  }, []);

  const isIndia = country === "IN";
  const isCloud = plan === "cloud";
  const choices = cloudChoices(pricing);
  // A choice that is not on sale (a stale link, a plan removed) falls back to
  // Team monthly rather than sending a plan code checkout would refuse.
  const choice: Billing = isCloud && choices.includes(billing) ? billing : "monthly";
  const showChoices = isCloud && choices.length > 1;
  const yearly = choice === "yearly";
  const business = choice === "business";
  const saving = yearlySaving(pricing);
  const price = choicePrice(choice, pricing);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email - your license key is sent there.");
      return;
    }
    // What goes on an Indian tax invoice is checked here, before payment; see lib/gstin.
    const billing = isIndia ? checkIndianBilling(gstin, stateName) : { ok: true as const, gstin: "", state: "", stateCode: "" };
    if (!billing.ok) {
      setError(billing.error);
      return;
    }
    if (isIndia && billing.state !== stateName) setStateName(billing.state);
    if (!scriptReady) {
      setError("Payment library is still loading. Please try again in a moment.");
      return;
    }
    const input = {
      email: email.trim(),
      name: name.trim(),
      country,
      gstin: billing.gstin,
      state: billing.state,
      state_code: billing.stateCode,
      phone: contactForCheckout(phone),
    };
    if (isCloud) await startCloud({ ...input, plan_code: cloudPlanCode(choice) }, contactForCheckout(phone));
    else await start(input, contactForCheckout(phone));
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
            ? "Managed hosting, set up for you. Usually live within a day; we email you the moment it is."
            : "Self-hosted workspace. Lifetime license, unlimited users."
        }
        align="left"
        className="!pb-0"
      />
      <section className="pb-16 sm:pb-20">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-y-4">
          <aside className="lg:col-start-1 lg:row-start-1">

            {/* Plan switch */}
            <div className="grid grid-cols-2 gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setPlan("lifetime")}
                aria-pressed={!isCloud}
                className={`relative rounded-md px-3 py-2 font-medium transition ${!isCloud ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Lifetime · self-host
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

            {/* THE FREE PLAN, WHERE THE PRICE IS. A team of under 25 that reaches
                this page about to pay for something it can run free has been
                failed by us, not saved a sale: it either pays and feels misled
                later, or leaves to think about it and does not come back. The
                same offer used to sit below the form, four screens down on a
                phone. The licence card below says what paying adds. */}
            {!isCloud && (
              <p className="mt-4 rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-sm text-muted-foreground">
                Fewer than {FREE_SEATS} people? OneCamp is free for you.{" "}
                <a href="/free" className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
                  Get the install command
                </a>
                , no card or email needed.
              </p>
            )}

            <div className="card-premium card mt-4 bg-card/90">
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-foreground">{isCloud ? (business ? "OneCamp Cloud Business" : "OneCamp Cloud") : "OneCamp Lifetime"}</span>
                <span className="text-2xl font-semibold text-foreground">
                  {fmtUSD(isCloud ? price.usd : pricing.lifetime_usd)}
                  {isCloud && <span className="text-sm font-normal text-muted-foreground">{" " + price.per}</span>}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {/* The charge itself, beside the dollars above; currencyNote
                    below the pay button says why the two can differ. */}
                {isCloud
                  ? business
                    ? `${fmtINR(pricing.business_inr)}/mo billed in INR · ${pricing.business_seats} users included · a larger machine · includes a self-host license`
                    : yearly
                      ? `${fmtINR(pricing.cloud_yearly_inr)}/yr billed in INR${saving ? ` · ${saving}` : ""} · ${pricing.cloud_seats} users included · includes a self-host license`
                      : `${fmtINR(pricing.cloud_inr)}/mo billed in INR · ${pricing.cloud_seats} users included · includes a self-host license`
                  : pricing.charge_usd && !isIndia
                    ? "Charged in US dollars · one-time · unlimited users"
                    : `${fmtINR(pricing.lifetime_inr)} billed in INR · one-time · all taxes included · unlimited users`}
              </p>
              {showChoices && (
                <div
                  role="radiogroup"
                  aria-label="Plan"
                  className={`mt-4 grid gap-0.5 rounded-lg border border-border bg-muted/50 p-0.5 text-xs ${choices.length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}
                >
                  {choices.map((b) => (
                    <button
                      key={b}
                      type="button"
                      role="radio"
                      aria-checked={choice === b}
                      onClick={() => setBilling(b)}
                      className={`rounded-md px-3 py-1.5 font-medium transition ${choice === b ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {choiceLabel(b, pricing)}
                    </button>
                  ))}
                </div>
              )}
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="card-premium card h-fit space-y-4 bg-card/90 lg:col-start-2 lg:row-span-2 lg:row-start-1" noValidate>
            <Field label="Email" required hint="Your license key & invoice are sent here.">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name or company" autoComplete="name" />
            </Field>
            <Field label="Country">
              <Select
                value={country}
                onChange={changeCountry}
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
            <Field label="Mobile (optional)" hint="The payment window asks for one; give it here and it opens filled in.">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="With country code, e.g. +1 415 555 0100" autoComplete="tel" inputMode="tel" />
            </Field>

            {error && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p>
            )}

            <Button type="submit" disabled={busy} variant="brandPremium" size="lg" className="w-full">
              {busy
                ? "Processing…"
                : isCloud
                  ? // The chosen plan's own price: Business once read Team's here.
                    `Subscribe - ${dual(price.usd, price.inr, price.per)}`
                  : pricing.charge_usd
                    ? `Pay ${isIndia ? fmtINR(pricing.lifetime_inr) : fmtUSD(pricing.lifetime_usd)} & get your key`
                    : `Pay ${dual(pricing.lifetime_usd, pricing.lifetime_inr)} & get your key`}
            </Button>
            {/* The one sentence about money that has to be read before it is
                spent. The policy says it; here is where the buyer is. */}
            <p className="text-center text-xs text-foreground/80">
              {paymentTerms(isCloud ? choice : "lifetime")}
            </p>
            <p className="text-center text-xs text-muted-foreground">{currencyNote(pricing, { inIndia: isIndia, cloud: isCloud })}</p>
            <p className="text-center text-xs text-muted-foreground">
              By {isCloud ? "subscribing" : "purchasing"} you agree to our{" "}
              <a href="/terms-of-service" className="underline hover:text-foreground">Terms</a> and{" "}
              <a href="/refund-policy" className="underline hover:text-foreground">Refund Policy</a>.
            </p>
          </form>

          {/* AFTER THE FORM IN THE PAGE, beside the product on a wide screen. On a
              phone the columns stack in page order, and these used to sit between
              the price and the form: a buyer who had decided scrolled past "Try it
              before you pay" and "Not buying today?" for four screens to find where
              to pay. Now the form follows the price; these follow the form. */}
          <div className="lg:col-start-1 lg:row-start-2">
            {/* THE ONE THING THIS PAGE DID NOT OFFER. Thirty people reached checkout
                in sixty days and none of them bought, and nineteen of them opened
                the refund policy on the way. They are looking for a way to reduce
                the risk of paying first for software they then have to install on
                their own server. The demo already exists and is clicked from every
                other page; it was missing from the only page where the decision is
                actually made. */}
            <div className="card border-brand/30 bg-brand/[0.04]">
              <p className="font-medium text-foreground">Try it before you pay</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The live demo is the real product with sample data. Nothing to install and no
                account needed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href={site.demoStartUrl} external variant="ghost">
                  Open the live demo
                </ButtonLink>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">Secure payment via Razorpay. We never see your card details.</p>

            {/* Only one of the thirty ever came back on another day, so there is no
                consideration cycle to catch them in later. Either we can reach them
                or they are gone. */}
            <div className="card mt-4">
              <p className="font-medium text-foreground">Not buying today?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Leave your address and we will tell you when the price or the license terms
                change, and when something ships that you asked for.
              </p>
              <div className="mt-3">
                <SubscribeForm
                  source="buy"
                  cta="Email me updates"
                  hint="Only product announcements: new releases, and changes to the price or license terms. Unsubscribe in one click."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <PlanComparison pricing={pricing} />
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
