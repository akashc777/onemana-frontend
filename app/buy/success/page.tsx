"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";
import { LicenseInstall } from "@/components/site/LicenseInstall";
import { parseLicenseKey } from "@/lib/installCommand";
import { readPurchase, withoutAddressSecrets } from "@/lib/purchaseHandoff";
import { WORKSPACE_ZONE } from "@/lib/workspaceAddress";
import { fetchPricingClient, setupEstimateFor, type SetupEstimate } from "@/lib/pricing";

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
  // Chosen at checkout: the payment names the workspace, so there is nothing
  // to choose here. See lib/workspaceAddress.
  const address = purchase?.slug ? `${purchase.slug}.${WORKSPACE_ZONE}` : "";

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
            /* WHAT HAPPENS NEXT, AND WHERE TO FOLLOW IT. A buyer who named the
               workspace on /buy has nothing left to do: the payment names it and
               building starts. One who did not is asked for the address, the one
               thing the build waits on. Either way the next place to go is the
               account page, which is the main button below; this page used to
               offer the setup docs and GitHub instead, which are for self-hosting. */
            <>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Thank you for subscribing. We run your workspace for you: set up, backed up and
                kept up to date.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5 text-left">
                {address ? (
                  <>
                    <p className="font-medium text-foreground">We are setting up {address}</p>
                    {estimate && <p className="mt-1 text-sm text-foreground/80">{estimate.sentence}</p>}
                    <p className="mt-1 text-sm text-muted-foreground">
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
                    <p className="mt-1 text-sm text-muted-foreground">
                      Free on <span className="font-medium text-foreground">onemana.dev</span>, for example{" "}
                      <span className="font-mono text-xs">acme.onemana.dev</span>. Want a domain you own
                      instead? Reply to the welcome email and we set it up with you.
                    </p>
                    {estimate && <p className="mt-2 text-sm text-foreground/80">{estimate.sentence}</p>}
                    <p className="mt-2 text-sm text-muted-foreground">
                      The welcome email arriving at <span className="font-medium text-foreground">{email}</span> has
                      a button that signs you straight in, or continue below with a code.
                    </p>
                  </>
                )}
              </div>
              <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                Your GST invoice is on its way to <span className="font-medium text-foreground">{email}</span>.
                Your plan also includes a self-host license, in the same email and on your account page,
                should you ever want to run OneCamp yourself.
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
            {isCloud ? (
              <>
                <ButtonLink href="/account" variant="brandPremium">
                  {address ? "Go to your account" : "Choose your address"}
                </ButtonLink>
                <ButtonLink href="/docs/cloud" variant="ghost">How OneCamp Cloud works</ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink href="/docs" variant="brandPremium">Read the setup docs</ButtonLink>
                <ButtonLink href={site.githubOrgUrl} external variant="ghost">Open-source on GitHub</ButtonLink>
              </>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn&apos;t get the email? Check spam, or contact support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}