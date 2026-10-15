"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { portalApi, type PortalInstance } from "@/lib/portalApi";
import { fetchPricingClient, defaultPricing, type Pricing, priceWithEstimate, currencyNote } from "@/lib/pricing";
import { useVisitorRegion } from "@/hooks/useVisitorRegion";
import { paymentTerms, storageOffered } from "@/lib/paymentTerms";
import { storageLine } from "@/lib/storageLine";
import { openSubscriptionCheckout } from "@/lib/razorpayCheckout";

let pricingRequest: Promise<Pricing> | null = null;
let knownPricing: Pricing | null = null;

/**
 * Starts the price read before the card is drawn. The account page calls it
 * beside its own reads, so the offer arrives with the card; asked for only
 * once the card was up, it landed a moment later and pushed the licences
 * below it off the screen. A read that brings no offer (none set up, or the
 * request failed) is asked again next time rather than kept.
 */
export function preloadStoragePricing(): Promise<Pricing> {
  if (!pricingRequest) {
    pricingRequest = fetchPricingClient().then((p) => {
      if (storageOffered(p)) knownPricing = p;
      else pricingRequest = null;
      return p;
    });
  }
  return pricingRequest;
}

/**
 * Extra storage on the workspace card: what the workspace has, or the offer.
 *
 * The offer is shown only for a live workspace with no add-on, and only when
 * the backend says a plan exists to charge it. The purchase is the same
 * Razorpay checkout the workspace was bought with; the state on the card
 * changes when the first charge lands, not when the dialog closes, because
 * the charge is what the backend acts on.
 */
export function StorageAddon({ inst, onChanged }: { inst: PortalInstance; onChanged: () => void }) {
  const [pricing, setPricing] = useState<Pricing>(() => knownPricing ?? defaultPricing);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [paid, setPaid] = useState(false);
  const region = useVisitorRegion();

  useEffect(() => {
    let alive = true;
    preloadStoragePricing().then((p) => { if (alive) setPricing(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const line = storageLine(inst.storage_addon_state, inst.storage_addon_gb, inst.storage_used_gb);
  if (line) return <p className="text-small text-muted-foreground">{line}</p>;
  if (inst.state !== "live" || !storageOffered(pricing)) return null;
  if (paid) {
    return (
      <p className="text-small text-muted-foreground">
        Thank you. Your {pricing.storage_addon_gb} GB is paid for; this card will say so as soon as the payment is confirmed, usually within a minute.
      </p>
    );
  }

  const buy = async () => {
    setErr("");
    setBusy(true);
    try {
      const sub = await portalApi.addStorage(inst.id);
      openSubscriptionCheckout(sub, `Extra storage, ${pricing.storage_addon_gb} GB, monthly`, {
        paid: () => {
          setPaid(true);
          setBusy(false);
          // The webhook marks the workspace; give it a moment, then reload.
          window.setTimeout(onChanged, 8000);
        },
        closed: () => setBusy(false),
        failed: (msg) => {
          setBusy(false);
          setErr(msg);
        },
      });
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "The purchase could not be started.");
    }
  };

  return (
    <div className="rounded-xl bg-muted ring-1 ring-inset ring-border p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <p className="text-small text-foreground">
        Need more room for files and recordings? Add <strong>{pricing.storage_addon_gb} GB</strong> for{" "}
        <strong>{priceWithEstimate(pricing, pricing.storage_addon_inr, region, " a month")}</strong>.
      </p>
      <p className="mt-1 text-caption text-muted-foreground">{paymentTerms("addon")}</p>
      <p className="mt-1 text-caption text-muted-foreground">{currencyNote(pricing, { region })}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void buy()}
          disabled={busy}
          className="btn-brand h-9 px-3.5 py-0"
        >
          {busy ? "Opening checkout…" : `Add ${pricing.storage_addon_gb} GB`}
        </button>
        {err && (
          <span role="alert" className="text-small text-danger-ink">
            {err}
          </span>
        )}
      </div>
    </div>
  );
}
