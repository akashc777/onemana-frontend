"use client";

import { guessCountry } from "@/lib/guessCountry";
import Script from "next/script";
import { choiceLabel, choicePrice, cloudChoices, cloudPlanCode, paymentTerms, yearlySaving, type Billing } from "@/lib/paymentTerms";
import { useEffect, useState } from "react";
import { useCheckout } from "@/hooks/useCheckout";
import { indianStates } from "@/lib/states";
import { checkIndianBilling } from "@/lib/gstin";
import { countries } from "@/lib/countries";
import { contactForCheckout, dialPrefix, phoneForCountry } from "@/lib/dialCodes";
import { cloudBenefits, lifetimeBenefits } from "@/lib/content";
import { defaultPricing, fetchPricingClient, fmtUSD, fmtINR, dual, currencyNote, setupEstimateFor, usdEstimate, type Pricing } from "@/lib/pricing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SECTION_END } from "@/components/ui/Section";
import { FREE_SEATS } from "@/lib/freePlan";
import { Select } from "@/components/ui/Select";
import { WorkspaceAddressField } from "@/components/site/WorkspaceAddressField";
import { EDITION_CHOICES, type EditionChoice, type SlugVerdict } from "@/lib/workspaceAddress";
import { CloudGlyph, KeyGlyph } from "@/components/site/Glyphs";
import { PlanBenefit } from "@/components/site/PlanCard";
import { PLAN_HUE } from "@/components/site/planHues";
import { HUE_CLASS } from "@/components/ui/graphics/hues";

export type Plan = "lifetime" | "cloud";

/**
 * The checkout: the plan, its price, and the form that opens Razorpay.
 *
 * The page (app/buy/page.tsx) is a server component that reads the link's
 * plan and the live pricing and hands them in, so the first HTML a buyer gets
 * is this page and not a "Loading…" line: reading the query with
 * useSearchParams made the whole page render in the browser, after its
 * JavaScript, and the footer jumped down the screen when it did. The plan
 * table under the form is drawn by the page, outside this component, so
 * typing in a field no longer redraws it.
 *
 * Payment behaviour is unchanged: the same checks, the same useCheckout
 * calls and the same Razorpay script, and pricing is still fetched again
 * once the page is open.
 */
export function BuyCheckout({
  initialPlan,
  initialBilling,
  initialPricing,
}: {
  initialPlan: Plan;
  initialBilling: Billing;
  initialPricing: Pricing;
}) {
  const { busy, error, setError, start, startCloud } = useCheckout();
  const [scriptReady, setScriptReady] = useState(false);
  const [plan, setPlan] = useState<Plan>(initialPlan);
  const [pricing, setPricing] = useState<Pricing>(initialPricing);
  // Monthly unless the buyer chooses otherwise; the choice is only offered
  // once a yearly plan exists to charge it.
  // ?size=business opens on Business (the pricing page and the "outgrowing
  // its machine" email link here); it only sticks once Business is on sale.
  const [billing, setBilling] = useState<Billing>(initialBilling);

  useEffect(() => {
    // A refresh that fails hands back the built-in fallback (the same object,
    // defaultPricing); the page already has the live prices from the server,
    // so a failed refresh must not replace them with the fallback's.
    fetchPricingClient().then((fresh) => {
      if (fresh !== defaultPricing) setPricing(fresh);
    });
  }, []);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  // Cloud: the workspace's address and whether it has AI, chosen before paying
  // so building starts from the payment itself. See lib/workspaceAddress.
  const [slug, setSlug] = useState("");
  const [addressVerdict, setAddressVerdict] = useState<SlugVerdict | null>(null);
  const [edition, setEdition] = useState<EditionChoice>("ai");
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
      setError("Please enter your email: your licence key is sent there.");
      return;
    }
    // A name the check refused is said here, before the payment window opens.
    // One still being checked goes ahead: the backend checks it again before
    // the window opens, and once more when the payment arrives.
    if (isCloud && slug.length < 3) {
      setError("Choose an address for your workspace: at least 3 letters or numbers.");
      return;
    }
    if (isCloud && addressVerdict && !addressVerdict.canPay) {
      setError(addressVerdict.text);
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
    if (isCloud) await startCloud({ ...input, plan_code: cloudPlanCode(choice), slug, edition }, contactForCheckout(phone));
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
        title="Buy OneCamp"
        subtitle={
          isCloud
            ? // How long, from the backend's one estimate; nothing of its own here.
              `Managed hosting, set up for you. ${setupEstimateFor(pricing, business)?.sentence ?? "We email you the moment it is live."}`
            : "A licence for your own server. Pay once, for any number of people."
        }
      />
      {/* Two rows on a wide screen: the plan, then "Try it before you pay"
          under it, with the form beside both. The first row is the plan's
          own height and the second takes what the form needs beyond it:
          with two equal rows the form's height split between them, and on
          Cloud "Try it before you pay" sat 146 px below the plan. */}
      <section className={SECTION_END}>
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-y-4">
          <aside className="lg:col-start-1 lg:row-start-1">

            {/* Plan switch */}
            <div className="grid grid-cols-2 gap-0.5 rounded-md border border-border bg-muted p-0.5 text-small">
              <button
                type="button"
                onClick={() => setPlan("lifetime")}
                aria-pressed={!isCloud}
                className={`min-h-11 rounded-sm px-3 py-2 font-medium transition-colors sm:min-h-0 ${!isCloud ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {/* Below 380 px the two labels do not fit side by side, and one
                    wrapped while the other did not: the qualifier is then read
                    but not shown. */}
                Licence<span className="sr-only min-[380px]:not-sr-only">, self-hosted</span>
              </button>
              <button
                type="button"
                onClick={() => setPlan("cloud")}
                aria-pressed={isCloud}
                className={`min-h-11 rounded-sm px-3 py-2 font-medium transition-colors sm:min-h-0 ${isCloud ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Cloud<span className="sr-only min-[380px]:not-sr-only">, run by us</span>
              </button>
            </div>

            {/* THE FREE PLAN, WHERE THE PRICE IS. A team of under 25 that reaches
                this page about to pay for something it can run free has been
                failed by us, not saved a sale: it either pays and feels misled
                later, or leaves to think about it and does not come back. The
                same offer used to sit below the form, four screens down on a
                phone. The licence card below says what paying adds. */}
            {!isCloud && (
              <p className="mt-4 border-l-2 border-border-strong pl-4 text-small text-muted-foreground">
                Up to {FREE_SEATS} people? OneCamp is free for you.{" "}
                <a href="/free" className="link font-medium">
                  Get the install command
                </a>
                , no card or email needed.
              </p>
            )}

            {/* The plan in its hue, the one its card has on /pricing: sun for
                the licence, sky for Cloud. */}
            <div className={`${HUE_CLASS[isCloud ? PLAN_HUE.cloud : PLAN_HUE.lifetime]} mt-6 border-t border-border pt-6`}>
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-2 self-center font-medium text-foreground">
                  {isCloud ? <CloudGlyph className="size-4 shrink-0 text-hue" /> : <KeyGlyph className="size-4 shrink-0 text-hue" />}
                  {isCloud ? (business ? "OneCamp Cloud Business" : "OneCamp Cloud") : "OneCamp licence"}
                </span>
                {/* Rupees are the price: they are what is charged. The licence
                    abroad is the one exception, once the backend charges dollars. */}
                <span className="font-display text-h3 font-semibold text-foreground">
                  {!isCloud && pricing.charge_usd && !isIndia ? fmtUSD(pricing.lifetime_usd) : fmtINR(isCloud ? price.inr : pricing.lifetime_inr)}
                  {isCloud && <span className="font-sans text-small font-normal text-muted-foreground">{" " + price.per}</span>}
                </span>
              </div>
              <p className="mt-1 text-caption text-muted-foreground">
                {/* A dollar estimate only for buyers outside India; currencyNote
                    under the pay button says why it can differ from the card.
                    One middle dot at most, after the estimate; the terms
                    themselves are a list with commas. */}
                {!isIndia && !(pricing.charge_usd && !isCloud) && usdEstimate(isCloud ? price.usd : pricing.lifetime_usd)
                  ? `${usdEstimate(isCloud ? price.usd : pricing.lifetime_usd)} · `
                  : ""}
                {isCloud
                  ? business
                    ? `${pricing.business_seats} users, a larger machine and a self-host licence included`
                    : yearly
                      ? `${saving ? `${saving}, ` : ""}${pricing.cloud_seats} users and a self-host licence included`
                      : `${pricing.cloud_seats} users and a self-host licence included`
                  : pricing.charge_usd && !isIndia
                    ? "Charged in US dollars, one-time, unlimited users"
                    : "One-time, GST included, unlimited users"}
              </p>
              {showChoices && (
                <div
                  role="radiogroup"
                  aria-label="Plan"
                  className={`mt-4 grid gap-0.5 rounded-md border border-border bg-muted p-0.5 text-caption ${choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
                >
                  {/* Each choice is its name over what it adds, the three
                      alike: as one line, "Team yearly · 2 months free"
                      wrapped beside one-line neighbours. */}
                  {choices.map((b) => {
                    const [name, detail] = choiceLabel(b, pricing).split(" · ");
                    return (
                      <button
                        key={b}
                        type="button"
                        role="radio"
                        aria-checked={choice === b}
                        onClick={() => setBilling(b)}
                        className={`flex min-h-11 flex-col items-center justify-center rounded-sm px-2 py-1.5 transition-colors ${choice === b ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className="font-medium">{name}</span>
                        {detail && <span className="font-normal">{detail}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <ul className="mt-5 space-y-2.5 text-small text-foreground">
                {benefits.map((b) => (
                  <PlanBenefit key={b}>{b}</PlanBenefit>
                ))}
              </ul>
            </div>
            {/* THE MONEY RULE, BEFORE THE FORM. No trials and no refunds is a
                standing decision; said here, as the reason the demo and the free
                plan exist, rather than as small print under the pay button. */}
            <p className="mt-4 text-small text-foreground">
              No trials or refunds: try the{" "}
              <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">live demo</a>{" "}
              and the <a href="/free" className="link">free plan</a> first.
            </p>
          </aside>

          <form onSubmit={handleSubmit} className="h-fit space-y-4 rounded-lg border border-border bg-card p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1" noValidate>
            {isCloud && (
              <>
                <Field label="Workspace address" required>
                  <WorkspaceAddressField value={slug} onChange={setSlug} onVerdict={setAddressVerdict} inputClassName={inputCls} />
                </Field>
                <fieldset>
                  <legend className="mb-1.5 block text-small font-medium text-foreground">AI features</legend>
                  <div role="radiogroup" aria-label="AI features" className="grid gap-2 sm:grid-cols-2">
                    {EDITION_CHOICES.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        role="radio"
                        aria-checked={edition === c.value}
                        onClick={() => setEdition(c.value)}
                        className={`flex flex-col justify-start rounded-md border px-3.5 py-2.5 text-left transition-colors ${edition === c.value ? "border-brand bg-brand-soft" : "border-border-strong bg-card hover:bg-muted"}`}
                      >
                        <span className="block text-small font-medium text-foreground">{c.label}</span>
                        <span className="mt-0.5 block text-caption text-muted-foreground">{c.hint}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
            <Field
              label="Email"
              required
              hint={isCloud ? "You sign in to your workspace with it, and your invoices are sent here." : "Your licence key and invoice are sent here."}
            >
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name or company…" autoComplete="name" />
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
              <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-small text-danger-ink">{error}</p>
            )}

            <Button type="submit" disabled={busy} variant="brand" size="lg" className="w-full">
              {busy
                ? "Processing…"
                : isCloud
                  ? // The chosen plan's own price: Business once read Team's here.
                    `Subscribe for ${dual(price.usd, price.inr, price.per)}`
                  : pricing.charge_usd
                    ? `Pay ${isIndia ? fmtINR(pricing.lifetime_inr) : fmtUSD(pricing.lifetime_usd)} & get your key`
                    : `Pay ${isIndia ? fmtINR(pricing.lifetime_inr) : dual(pricing.lifetime_usd, pricing.lifetime_inr)} & get your key`}
            </Button>
            {/* The one sentence about money that has to be read before it is
                spent. The policy says it; here is where the buyer is. */}
            <p className="text-caption text-foreground">
              {paymentTerms(isCloud ? choice : "lifetime")}
            </p>
            <p className="text-caption text-muted-foreground">{currencyNote(pricing, { inIndia: isIndia, cloud: isCloud })}</p>
            <p className="text-caption text-muted-foreground">
              By {isCloud ? "subscribing" : "purchasing"} you agree to our{" "}
              <a href="/terms-of-service" className="underline underline-offset-2 hover:text-foreground">Terms</a> and{" "}
              <a href="/refund-policy" className="underline underline-offset-2 hover:text-foreground">Refund policy</a>.
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
            <div className="border-t border-border pt-6">
              <p className="font-medium text-foreground">Try it before you pay</p>
              <p className="mt-1 text-small text-muted-foreground">
                The live demo is the real product with sample data. Nothing to install and no
                account needed.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <ButtonLink href={site.demoStartUrl} external variant="ghost">
                  Open the live demo
                </ButtonLink>
              </div>
            </div>

            <p className="mt-4 text-caption text-muted-foreground">Secure payment via Razorpay. We never see your card details.</p>

            {/* Only one of the thirty ever came back on another day, so there is no
                consideration cycle to catch them in later. Either we can reach them
                or they are gone. */}
            <div className="mt-8 border-t border-border pt-6">
              <p className="font-medium text-foreground">Not buying today?</p>
              <p className="mt-1 text-small text-muted-foreground">
                Leave your address and we will tell you when the price or the licence terms
                change, and when something ships that you asked for.
              </p>
              <div className="mt-3">
                <SubscribeForm
                  source="buy"
                  cta="Email me updates"
                  hint="Only product announcements: new releases, and changes to the price or licence terms. Unsubscribe in one click."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const inputCls =
  "h-11 w-full rounded-md border border-border-strong bg-card px-3 text-base text-foreground transition-colors placeholder:text-faint focus:border-brand sm:h-10 sm:text-sm";

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-small font-medium text-foreground">
        {label} {required && <span className="text-danger-ink">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-caption text-muted-foreground">{hint}</span>}
    </label>
  );
}
