"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { LicenseInstall } from "@/components/site/LicenseInstall";
import { parseLicenseKey } from "@/lib/installCommand";
import { readPurchase, withoutAddressSecrets } from "@/lib/purchaseHandoff";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-muted-foreground">Loading…</div>}>
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

  // An older link still carries the key and email: take them out of the
  // address bar, as the account page does with its sign-in link.
  useEffect(() => {
    const clean = withoutAddressSecrets(window.location.href);
    if (clean) window.history.replaceState(null, "", clean);
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="container-x mx-auto max-w-2xl">
        <div className="card-premium card bg-card/90 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/10 text-xl">
            {isCloud ? "☁️" : "✓"}
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            {isCloud ? "You're all set. Welcome to OneCamp Cloud" : "Payment successful"}
          </h1>

          {isCloud ? (
            /* THE FLOW WAITS HERE, ON THE CUSTOMER. A subscription creates the
               instance in awaiting_setup and nothing is provisioned until an
               address is chosen. This page used to say only that we would contact
               them within 12 hours, and linked to the docs and GitHub but never to
               the one page that unblocks it, so a paying subscriber had no reason
               to go there and no idea anything was waiting. */
            <>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Thanks for subscribing! Your workspace is fully managed. One quick step from
                you and we start building it right away.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-left">
                <p className="font-medium text-foreground">Choose your workspace address</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Free on <span className="font-medium text-foreground">onemana.dev</span>, for example{" "}
                  <span className="font-mono text-xs">acme.onemana.dev</span>. You can move to a domain
                  you own later, from the same page, at no extra cost.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  The welcome email arriving at <span className="font-medium text-foreground">{email}</span> has
                  a button that signs you straight in. Or continue here with a code:
                </p>
                <ButtonLink href="/account" variant="brandPremium" className="mt-4">
                  Choose your address
                </ButtonLink>
              </div>
              <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                We&apos;ve emailed your included self-host license and GST invoice to{" "}
                <span className="font-medium text-foreground">{email}</span>. Prefer us to set it up with
                you? Reply to that email and we will.
              </p>
            </>
          ) : pending && !key ? (
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Thanks for your purchase! Your license key and setup instructions are being prepared and will arrive at{" "}
              <span className="font-medium text-foreground">{email}</span> within a minute. Your GST invoice is attached.
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Welcome to OneCamp. We&apos;ve also emailed your key, install command, and GST invoice to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
          )}

          {key && <LicenseInstall licenseKey={key} isCloud={isCloud} />}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/docs" variant="brandPremium">Read the setup docs</ButtonLink>
            <ButtonLink href={site.githubOrgUrl} external variant="ghost">Open-source on GitHub</ButtonLink>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn&apos;t get the email? Check spam, or contact support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}