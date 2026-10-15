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
import { defaultPricing, fetchPricingClient, fmtUSD, fmtINR, currencyNote, priceWithEstimate, setupEstimateFor, type Pricing } from "@/lib/pricing";
import { regionFor } from "@/lib/visitorCurrency";
import { taxIdLabel } from "@/lib/invoiceFields";
import { RegionProvider } from "@/hooks/useVisitorRegion";
import { PriceEstimate } from "@/components/site/RegionalMoney";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SECTION_END } from "@/components/ui/Section";
import { FREE_SEATS } from "@/lib/freePlan";
import { Select } from "@/components/ui/Select";
import { FIELD_LABEL, Field } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { WorkspaceAddressField } from "@/components/site/WorkspaceAddressField";
import { EDITION_CHOICES, type EditionChoice, type SlugVerdict } from "@/lib/workspaceAddress";
import { CloudGlyph, KeyGlyph } from "@/components/site/Glyphs";
import { PlanBenefit } from "@/components/site/PlanCard";
import { PLAN_HUE } from "@/components/site/planHues";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Dot } from "@/components/ui/v3";
import { Icon } from "@/components/ui/icons";

export type Plan = "lifetime" | "cloud";
const PLANS: readonly Plan[] = ["lifetime", "cloud"];

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
  initialCountry,
}: {
  initialPlan: Plan;
  initialBilling: Billing;
  initialPricing: Pricing;
  /** The country to open on, instead of guessing it in the browser (tests render each region with it). */
  initialCountry?: string;
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
  // The field a failed check points at (site.md S10): it takes the danger
  // ring and shakes once, or flashes for reduced motion. Display only.
  const [invalid, setInvalid] = useState<"" | "email">("");
  const [name, setName] = useState("");
  // Cloud: the workspace's address and whether it has AI, chosen before paying
  // so building starts from the payment itself. See lib/workspaceAddress.
  const [slug, setSlug] = useState("");
  // A submit refused because of the address: the field shakes once, until the
  // address changes. The live check alone never shakes it (K7).
  const [addressRefused, setAddressRefused] = useState(false);
  const changeSlug = (next: string) => {
    setSlug(next);
    setAddressRefused(false);
  };
  const [addressVerdict, setAddressVerdict] = useState<SlugVerdict | null>(null);
  const [edition, setEdition] = useState<EditionChoice>("ai");
  // A first guess from the browser, replaced on mount; see lib/guessCountry.
  const [country, setCountry] = useState(initialCountry ?? "US");
  const [gstin, setGstin] = useState("");
  const [stateName, setStateName] = useState("");
  // Starts with the buyer's calling code; see lib/dialCodes.
  const [phone, setPhone] = useState(dialPrefix(initialCountry ?? "US"));
  // Outside India, optional, for the invoice (lib/invoiceFields).
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  // The reader's language, for digit grouping in the estimate; set on mount.
  const [locale, setLocale] = useState("en-US");
  const changeCountry = (next: string) => {
    setPhone((current) => phoneForCountry(current, country, next));
    setCountry(next);
  };
  useEffect(() => {
    setLocale(navigator.languages?.[0] || navigator.language || "en-US");
    if (initialCountry) return;
    const guessed = guessCountry(
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.languages ?? [navigator.language],
      new Set(countries.map((c) => c.code)),
    );
    setPhone((current) => phoneForCountry(current, "US", guessed));
    setCountry(guessed);
  }, [initialCountry]);

  const isIndia = country === "IN";
  // The money words follow the country chosen here, not a guess: the
  // estimate's currency, and GST only for India (lib/pricing taxWords).
  const region = regionFor(country, locale);
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
      setInvalid("email");
      return;
    }
    setInvalid("");
    // A name the check refused is said here, before the payment window opens.
    // One still being checked goes ahead: the backend checks it again before
    // the window opens, and once more when the payment arrives.
    if (isCloud && slug.length < 3) {
      setError("Choose an address for your workspace: at least 3 letters or numbers.");
      setAddressRefused(true);
      return;
    }
    if (isCloud && addressVerdict && !addressVerdict.canPay) {
      setError(addressVerdict.text);
      setAddressRefused(true);
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
      // Abroad only; the backend keeps none of them for India.
      ...(isIndia ? {} : { company: company.trim(), address_line: address.trim(), tax_id: taxId.trim() }),
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
        compact
        title="Buy OneCamp"
        subtitle={
          isCloud
            ? // How long, from the backend's one estimate in its short form
              // (site.md B1); the whole sentence sits under the pay button.
              `Managed hosting, set up for you. ${setupEstimateFor(pricing, business)?.short ? `Live ${setupEstimateFor(pricing, business)?.short}.` : "We email you the moment it is live."}`
            : "A licence for your own server. Pay once, for any number of people."
        }
      />
      {/* Two rows on a wide screen: the plan, then "Try it before you pay"
          under it, with the form beside both. The first row is the plan's
          own height and the second takes what the form needs beyond it:
          with two equal rows the form's height split between them, and on
          Cloud "Try it before you pay" sat 146 px below the plan. */}
      <section className={SECTION_END}>
        <div className="container-x grid grid-cols-1 gap-10 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-y-4">
          <aside className="min-w-0 lg:col-start-1 lg:row-start-1">

            {/* Plan switch: a radiogroup, one Tab stop with the arrows
                (storefront audit K1), each segment in its plan's hue. Below
                380 px the two labels do not fit side by side, and one wrapped
                while the other did not: the qualifier is then read but not
                shown. */}
            <Segmented
              label="Licence or Cloud"
              options={PLANS}
              value={plan}
              onChange={setPlan}
              hue={(p) => PLAN_HUE[p]}
              className="relative grid grid-cols-2 gap-1 rounded-ctl bg-muted p-1 text-small ring-1 ring-inset ring-border"
              itemClass="min-h-11 rounded-sm px-3 py-2 max-sm:px-1.5 font-[510] text-muted-foreground sm:min-h-8 inline-flex items-center justify-center gap-2"
              option={(p) => (
                <>
                  <Dot hue={PLAN_HUE[p]} className="max-sm:hidden" />
                  {p === "lifetime" ? (
                    <span>Licence<span className="sr-only min-[380px]:not-sr-only">, self-hosted</span></span>
                  ) : (
                    <span>Cloud<span className="sr-only min-[380px]:not-sr-only">, run by us</span></span>
                  )}
                </>
              )}
            />

            {/* THE FREE PLAN, WHERE THE PRICE IS. A team of under 25 that reaches
                this page about to pay for something it can run free has been
                failed by us, not saved a sale: it either pays and feels misled
                later, or leaves to think about it and does not come back. The
                same offer used to sit below the form, four screens down on a
                phone. The licence card below says what paying adds. */}
            {!isCloud && (
              <p className="mt-4 border-l-2 border-camp-moss/50 pl-4 text-small text-muted-foreground">
                Up to {FREE_SEATS} people? OneCamp is free for you.{" "}
                <a href="/free" className="link font-medium">
                  Get the install command
                </a>
                , no card or email needed.
              </p>
            )}

            {/* The plan in its hue, the one its card has on /pricing: sun for
                the licence, sky for Cloud. */}
            {/* No rings behind the price: a faint ring cut by the card's edge
                crossed the figure and read as a stray line, not a drawing
                (design/site-polish/AUDIT.md, D2). The plan's hue is its dot
                and its glyph. */}
            <div className={`${HUE_CLASS[isCloud ? PLAN_HUE.cloud : PLAN_HUE.lifetime]} relative isolate mt-6 overflow-hidden rounded-2xl bg-card shadow-e1`}>
              <div className="p-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="flex items-center gap-2 self-center text-body font-[590] text-foreground">
                  {isCloud ? <CloudGlyph className="size-4 shrink-0 text-hue" /> : <KeyGlyph className="size-4 shrink-0 text-hue" />}
                  {isCloud ? (business ? "OneCamp Cloud Business" : "OneCamp Cloud") : "OneCamp licence"}
                </span>
                {/* Rupees are the price: they are what is charged. The licence
                    abroad is the one exception, once the backend charges dollars. */}
                <span key={isCloud ? "c" : "l"} className="fx-fade text-right font-display text-price tabular-nums text-foreground">
                  {!isCloud && pricing.charge_usd && !isIndia ? fmtUSD(pricing.lifetime_usd) : fmtINR(isCloud ? price.inr : pricing.lifetime_inr)}
                  {isCloud && <span className="font-sans text-body font-normal text-muted-foreground">{" " + price.per}</span>}
                </span>
              </div>
              {/* Under the rupee price, the estimate in the buyer's own money
                  and that the charge is in rupees (plan A1), in the text
                  colour; nothing in India. The licence abroad is the one
                  exception, once the backend charges dollars (charge_usd). */}
              {!(pricing.charge_usd && !isCloud) && (
                <RegionProvider region={region}>
                  <p className="mt-1 text-small text-foreground empty:hidden">
                    <PriceEstimate pricing={pricing} inr={isCloud ? price.inr : pricing.lifetime_inr} why="/pricing#currency" />
                  </p>
                </RegionProvider>
              )}
              <p className="mt-1 text-caption text-muted-foreground">
                {isCloud
                  ? business
                    ? `${pricing.business_seats} users, a larger machine and a self-host licence included`
                    : yearly
                      ? `${saving ? `${saving}, ` : ""}${pricing.cloud_seats} users and a self-host licence included`
                      : `${pricing.cloud_seats} users and a self-host licence included`
                  : pricing.charge_usd && !isIndia
                    ? "Charged in US dollars, one-time, unlimited users"
                    : isIndia
                      ? "One-time, GST included, unlimited users"
                      : "One-time, no tax added at checkout, unlimited users"}
              </p>
              {showChoices && (
                /* Each choice is its name over what it adds, the three alike:
                   as one line, "Team yearly · 2 months free" wrapped beside
                   one-line neighbours. One Tab stop with the arrows (storefront
                   audit K2: a radiogroup that did not act like one). */
                <Segmented
                  label="Cloud plan"
                  options={choices}
                  value={choice}
                  onChange={setBilling}
                  className={`mt-4 grid gap-1 rounded-ctl bg-muted p-1 text-caption ring-1 ring-inset ring-border ${choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
                  itemClass="flex min-h-11 flex-col items-center justify-center rounded-sm px-2 py-1.5 text-muted-foreground"
                  option={(b) => {
                    const [name, detail] = choiceLabel(b, pricing).split(" · ");
                    return (
                      <>
                        <span className="font-medium">{name}</span>
                        {detail && <span className="font-normal">{detail}</span>}
                      </>
                    );
                  }}
                />
              )}
              <ul className="mt-5 space-y-2.5 border-t border-border pt-5 text-small text-foreground">
                {benefits.map((b) => (
                  <PlanBenefit key={b}>{b}</PlanBenefit>
                ))}
              </ul>
              </div>
              {/* THE MONEY RULE, BEFORE THE FORM. No trials and no refunds is a
                  standing decision; said here, on the card's sunken foot, as the
                  reason the demo and the free plan exist (B2). */}
              <div className="flex flex-col gap-3 bg-muted px-6 py-4 shadow-[inset_0_1px_0_var(--line-c)] sm:flex-row sm:items-center sm:justify-between">
                <p className="m-0 text-small text-foreground">
                  No trials or refunds: try the{" "}
                  <a href={site.demoStartUrl} target="_blank" rel="noreferrer" className="link">live demo</a>{" "}
                  and the <a href="/free" className="link">free plan</a> first.
                </p>
                <ButtonLink href={site.demoStartUrl} external variant="ghost" size="sm" className="shrink-0 max-md:min-h-11">
                  Open the live demo
                </ButtonLink>
              </div>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="pay-form h-fit space-y-5 rounded-2xl bg-card p-6 shadow-e2 sm:p-7 lg:sticky lg:top-[88px] lg:col-start-2 lg:row-span-2 lg:row-start-1" noValidate>
            {isCloud && (
              <>
                <Field label="Workspace address" required>
                  <WorkspaceAddressField value={slug} onChange={changeSlug} onVerdict={setAddressVerdict} inputClassName={inputCls} refused={addressRefused} />
                </Field>
                <fieldset>
                  <legend className={FIELD_LABEL}>AI features</legend>
                  {/* Two choice cards, the chosen one tinted, ringed and
                      ticked: chosen by more than colour (storefront audit K3,
                      a brand border and fill alone), one Tab stop with the
                      arrows. */}
                  <Segmented
                    kind="chip"
                    label="AI features"
                    options={EDITION_CHOICES.map((c) => c.value)}
                    value={edition}
                    onChange={setEdition}
                    className="grid gap-2 sm:grid-cols-2"
                    itemClass={(_, on) => `relative flex flex-col justify-start rounded-md px-3.5 py-2.5 pr-9 text-left [--ix-ground:rgb(var(--card))] ${on ? "" : "shadow-e1"}`}
                    option={(value, on) => {
                      const c = EDITION_CHOICES.find((e) => e.value === value)!;
                      return (
                        <>
                          <span className="block text-small font-medium text-foreground">{c.label}</span>
                          <span className="mt-0.5 block text-caption text-muted-foreground">{c.hint}</span>
                          {on && <Icon name="check" className="absolute right-3 top-3 text-brand-ink" />}
                        </>
                      );
                    }}
                  />
                </fieldset>
              </>
            )}
            <Field
              label="Email"
              required
              hint={isCloud ? "You sign in to your workspace with it, and your invoices are sent here." : "Your licence key and invoice are sent here."}
            >
              <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setInvalid(""); }} aria-invalid={invalid === "email" || undefined} data-shake={invalid === "email" || undefined} className={inputCls} placeholder="you@company.com" autoComplete="email" />
            </Field>
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name or company…" autoComplete="name" />
            </Field>
            <Select label="Country" value={country} onChange={changeCountry} options={COUNTRY_OPTIONS} />
            {isIndia && (
              <>
                <Select
                  label="State"
                  hint="For your GST invoice (place of supply)."
                  value={stateName}
                  onChange={setStateName}
                  placeholder="Select state"
                  options={STATE_OPTIONS}
                />
                <Field label="GSTIN (optional)" hint="Add to claim input tax credit (B2B).">
                  <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} className={inputCls} placeholder="29ABCDE1234F1Z5" maxLength={15} />
                </Field>
              </>
            )}
            {!isIndia && (
              /* Optional, folded away: most buyers pay as themselves. A
                 company abroad needs its name, address and tax number on the
                 invoice to expense it (owner decision D2). */
              <details className="group rounded-ctl bg-muted px-3.5 py-2.5 ring-1 ring-inset ring-border" open={Boolean(company || address || taxId)}>
                <summary className="-my-2.5 flex min-h-11 cursor-pointer list-none items-center justify-between text-small font-[510] text-foreground [&::-webkit-details-marker]:hidden">
                  Add company details for the invoice
                  <Icon name="plus" className="text-muted-foreground transition-transform duration-pop group-open:rotate-45" />
                </summary>
                <div className="mt-3 space-y-4">
                  <Field label="Company name">
                    <input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} maxLength={120} autoComplete="organization" />
                  </Field>
                  <Field label="Billing address">
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} maxLength={300} autoComplete="street-address" />
                  </Field>
                  <Field label={`${taxIdLabel(country)} (optional)`}>
                    <input value={taxId} onChange={(e) => setTaxId(e.target.value.toUpperCase())} className={inputCls} maxLength={32} />
                  </Field>
                </div>
              </details>
            )}
            <Field label="Mobile (optional)" hint="The payment window asks for one; give it here and it opens filled in.">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="With country code, e.g. +1 415 555 0100" autoComplete="tel" inputMode="tel" />
            </Field>

            {/* What the payment window will show, said before it opens (plan
                A7): the rupee amount, and a bank that may ask to approve a
                payment to an Indian company. Both stop a buyer abroad when
                they come as a surprise. */}
            {!isIndia && !(pricing.charge_usd && !isCloud) && (
              <p key={country} className="fx-fade flex gap-2.5 rounded-ctl bg-muted px-3.5 py-3 text-small text-foreground ring-1 ring-inset ring-border">
                <Icon name="info" className="mt-0.5 text-camp-sky" />
                <span>
                Razorpay shows the amount in rupees ({fmtINR(isCloud ? price.inr : pricing.lifetime_inr)}). Your bank may ask you to
                approve a payment to an Indian company; that&apos;s expected.
                </span>
              </p>
            )}

            {error && (
              <p role="alert" className="fx-slide flex gap-2.5 rounded-xl border-l-[3px] border-danger bg-card px-4 py-3 text-small text-foreground shadow-e1">
                <Icon name="alert" className="mt-0.5 text-danger-ink" />
                <span>{error}</span>
              </p>
            )}

            {/* On a phone the button stays in reach while the form is in view
                (site.md B4): sticky at the foot, on the page at 90% with an e3
                edge. Its width never changes, busy or not. */}
            {/* .pay-bar (globals.css): it lets go of the foot while a field
                has focus, so a keyboard that resizes the page never puts the
                bar over the field being typed into (storefront audit K8). */}
            <div className="pay-bar sticky bottom-3 z-20 -mx-2 rounded-ctl bg-background/95 p-2 shadow-e3 md:static md:mx-0 md:bg-transparent md:p-0 md:shadow-none">
            <Button type="submit" disabled={busy} variant="brand" size="xl" className="w-full">
              <Icon name="lock" />
              {busy
                ? "Processing…"
                : isCloud
                  ? // The chosen plan's own price: Business once read Team's here.
                    // The rupees first, the figure on Razorpay's window (plan A6).
                    `Subscribe for ${priceWithEstimate(pricing, price.inr, region, price.per)}`
                  : pricing.charge_usd
                    ? `Pay ${isIndia ? fmtINR(pricing.lifetime_inr) : fmtUSD(pricing.lifetime_usd)} & get your key`
                    : `Pay ${priceWithEstimate(pricing, pricing.lifetime_inr, region)} and get your key`}
            </Button>
            </div>
            {/* The one sentence about money that has to be read before it is
                spent. The policy says it; here is where the buyer is. */}
            {/* Under the button, where they reassure at the moment of paying (B4). */}
            <ul className="m-0 list-none space-y-2 p-0 text-caption">
              <li className="flex gap-2 text-muted-foreground">
                <Icon name="lock" size={14} className="mt-0.5" />
                Secure payment via Razorpay. We never see your card details.
              </li>
              <li className="flex gap-2 text-foreground">
                <Icon name="info" size={14} className="mt-0.5 text-muted-foreground" />
                {paymentTerms(isCloud ? choice : "lifetime")}
              </li>
              <li className="flex gap-2 text-muted-foreground">
                <Icon name="globe" size={14} className="mt-0.5" />
                {currencyNote(pricing, { cloud: isCloud, region })}
              </li>
              {isCloud && setupEstimateFor(pricing, business) && <li className="pl-[22px] text-muted-foreground">{setupEstimateFor(pricing, business)?.sentence}</li>}
            </ul>
            {/* 13 px, with the site's link: it was 12 px with a third link look (K9). */}
            <p className="text-caption text-muted-foreground">
              By {isCloud ? "subscribing" : "purchasing"} you agree to our{" "}
              <a href="/terms-of-service" className="link">terms of service</a> and{" "}
              <a href="/refund-policy" className="link">refund policy</a>.
            </p>
          </form>

          {/* AFTER THE FORM IN THE PAGE, beside the product on a wide screen. On a
              phone the columns stack in page order, and these used to sit between
              the price and the form: a buyer who had decided scrolled past "Try it
              before you pay" and "Not buying today?" for four screens to find where
              to pay. Now the form follows the price; these follow the form. */}
          <div className="lg:col-start-1 lg:row-start-2">
            {/* The demo, the one thing this page once did not offer, is on the
                summary card's foot now (B2), beside the money rule. */}
            {/* Only one of the thirty ever came back on another day, so there is no
                consideration cycle to catch them in later. Either we can reach them
                or they are gone. */}
            <div className="border-t border-border pt-6 lg:mt-2">
              <p className="font-[590] text-foreground">Not buying today?</p>
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
  "ui-field";

/** The select's options, built once rather than on every keystroke in the form. */
const COUNTRY_OPTIONS = countries.map((c) => ({ value: c.code, label: c.name }));
const STATE_OPTIONS = indianStates.map((s) => ({ value: s.name, label: s.name }));
