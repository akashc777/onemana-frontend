"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { LicenseInstall } from "@/components/site/LicenseInstall";
import { parseLicenseKey } from "@/lib/installCommand";
import { readPurchase, withoutAddressSecrets } from "@/lib/purchaseHandoff";
import { WORKSPACE_ZONE } from "@/lib/workspaceAddress";
import { fetchPricingClient, setupEstimateFor, taxWords, type SetupEstimate } from "@/lib/pricing";
import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { Tile } from "@/components/ui/graphics/Tile";
import { glyphs } from "@/components/account/AccountParts";
import { Celebration } from "@/components/site/Celebration";

export default function SuccessPage() {
  return (
    // The receipt reads this tab's checkout, so it only renders in the
    // browser; the frame holds the window meanwhile, so nothing jumps when it does.
    <Suspense fallback={<div className="min-h-[calc(100dvh-3.5rem)]" role="status" aria-label="Loading your receipt…" />}>
      <SuccessInner />
    </Suspense>
  );
}

// The checkout's result never changes while this page shows it, so there is
// nothing to subscribe to; and the server has no result at all.
const noUpdates = () => () => {};
const noResultOnServer = () => null;

function SuccessInner() {
  const params = useSearchParams();
  const pending = params.get("pending") === "1";
  const isCloud = params.get("cloud") === "1";
  // The key and email come from the checkout in this tab, never from the
  // address: a ?key= in a link is ignored. See lib/purchaseHandoff.
  const purchase = useSyncExternalStore(noUpdates, readPurchase, noResultOnServer);
  const key = parseLicenseKey(purchase?.key);
  const email = purchase?.email || "your email";
  // Chosen at checkout: the payment names the workspace, so there is nothing
  // to choose here. See lib/workspaceAddress.
  const address = purchase?.slug ? `${purchase.slug}.${WORKSPACE_ZONE}` : "";
  // Opened from a bookmark, another tab or a link: there is no purchase here
  // to show, so the page says where the receipt is instead of claiming a
  // payment it knows nothing about.
  const direct = !purchase && !pending && !isCloud;
  // The invoice is named for where the buyer is: the country they chose at
  // checkout, else the browser's guess. GST is for India only.
  const region = useVisitorRegion();
  const invoice = taxWords(purchase?.country ? purchase.country === "IN" : region?.inIndia).invoice;
  const Invoice = invoice.charAt(0).toUpperCase() + invoice.slice(1);

  // An older link still carries the key and email: take them out of the
  // address bar, as the account page does with its sign-in link.
  useEffect(() => {
    const clean = withoutAddressSecrets(window.location.href);
    if (clean) window.history.replaceState(null, "", clean);
  }, []);

  // How long, from the backend's one estimate for the size bought.
  const [estimate, setEstimate] = useState<SetupEstimate | null>(null);
  useEffect(() => {
    if (!isCloud) return;
    let alive = true;
    fetchPricingClient().then((p) => {
      if (alive) setEstimate(setupEstimateFor(p, purchase?.size === "business"));
    });
    return () => {
      alive = false;
    };
  }, [isCloud, purchase?.size]);

  const mark = isCloud
    ? { hue: "lake" as const, glyph: glyphs.cloud }
    : direct
      ? { hue: "sky" as const, glyph: glyphs.receipt }
      : pending && !key
        ? { hue: "sun" as const, glyph: glyphs.clock }
        : { hue: "moss" as const, glyph: glyphs.check };
  const title = isCloud
    ? "Welcome to OneCamp Cloud"
    : direct
      ? "Your receipt is in your email"
      : pending && !key
        ? "Payment received"
        : "Your licence is ready";

  return (
    <section className="container-x min-h-[calc(100dvh-3.5rem)] pb-24 pt-10 sm:pt-16">
      <div className="max-w-2xl">
        {direct ? (
          <Tile hue={mark.hue} size="lg">
            {mark.glyph}
          </Tile>
        ) : (
          // A purchase that just went through gets its moment; a receipt
          // opened from a bookmark does not.
          <Celebration>
            <Tile hue={mark.hue} size="lg">
              {mark.glyph}
            </Tile>
          </Celebration>
        )}
        <h1 className="mt-5 text-balance text-title-read text-foreground">
          {title}
        </h1>

        {isCloud ? (
          /* WHAT HAPPENS NEXT, AND WHERE TO FOLLOW IT. A buyer who named the
             workspace on /buy has nothing left to do: the payment names it and
             building starts. One who did not is asked for the address, the one
             thing the build waits on. Either way the next place to go is the
             account page, which is the main button below; this page used to
             offer the setup docs and GitHub instead, which are for self-hosting. */
          <>
            <p className="mt-3 text-body-lg text-muted-foreground">
              Thank you for subscribing. We run your workspace for you: set up, backed up and kept up to date.
            </p>
            <div className="mt-8 rounded-lg border border-border bg-card p-4 sm:p-5">
              {address ? (
                <>
                  <p className="font-medium text-foreground">We are setting up {address}</p>
                  {estimate && <p className="mt-1 text-small text-foreground/80">{estimate.sentence}</p>}
                  <p className="mt-2 text-small text-muted-foreground">
                    Nothing more is needed from you. We email{" "}
                    <span className="font-medium text-foreground">{email}</span> the moment it is ready,
                    with a link to choose your password; you sign in with that address. If someone
                    took the name in the minutes before your payment, the welcome email says so and
                    you choose another.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-foreground">Choose your workspace address</p>
                  <p className="mt-1 text-small text-muted-foreground">
                    Free on <span className="font-medium text-foreground">onemana.dev</span>, for example{" "}
                    <span className="font-mono text-caption">acme.onemana.dev</span>. Want a domain you own
                    instead? Reply to the welcome email and we set it up with you.
                  </p>
                  {estimate && <p className="mt-2 text-small text-foreground/80">{estimate.sentence}</p>}
                  <p className="mt-2 text-small text-muted-foreground">
                    The welcome email arriving at <span className="font-medium text-foreground">{email}</span> has
                    a button that signs you straight in, or continue below with a code.
                  </p>
                </>
              )}
            </div>
            <p className="mt-4 text-small text-muted-foreground">
              {Invoice} is on its way to <span className="font-medium text-foreground">{email}</span>.
              Your plan also includes a self-host licence, in the same email and on your account page,
              should you ever want to run OneCamp yourself.
            </p>
          </>
        ) : pending && !key ? (
          <p className="mt-3 text-body-lg text-muted-foreground">
            Thank you for your purchase. Your licence key and setup instructions are being prepared and arrive at{" "}
            <span className="font-medium text-foreground">{email}</span> within a minute, with {invoice}.
          </p>
        ) : direct ? (
          <p className="mt-3 text-body-lg text-muted-foreground">
            This page shows a purchase made in this browser tab, and there is none here. Your licence key, install
            command and {invoice} are in the email you paid with, and on your account page.
          </p>
        ) : (
          <p className="mt-3 text-body-lg text-muted-foreground">
            Welcome to OneCamp. We&apos;ve also emailed your key, install command, and {invoice} to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        )}

        {key && <LicenseInstall licenseKey={key} isCloud={isCloud} />}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {isCloud ? (
            <>
              <ButtonLink href="/account" variant="brand">
                {address ? "Go to your account" : "Choose your address"}
              </ButtonLink>
              <ButtonLink href="/docs/cloud" variant="ghost">How OneCamp Cloud works</ButtonLink>
            </>
          ) : direct ? (
            <>
              <ButtonLink href="/account" variant="brand">Go to your account</ButtonLink>
              <ButtonLink href="/docs/installation" variant="ghost">Read the install guide</ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/docs/installation" variant="brand">Read the install guide</ButtonLink>
              <ButtonLink href={site.githubOrgUrl} external variant="ghost">Open-source on GitHub</ButtonLink>
            </>
          )}
        </div>
        <p className="mt-8 border-t border-border pt-6 text-small text-muted-foreground">
          Didn&apos;t get the email? Check spam, or write to support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}
