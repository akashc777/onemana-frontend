"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { portalApi, type PortalInstance } from "@/lib/portalApi";
import { fetchPricingClient, defaultPricing, fmtINR, type Pricing } from "@/lib/pricing";
import { paymentTerms, storageOffered } from "@/lib/paymentTerms";
import { storageLine } from "@/lib/storageLine";

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
  const [pricing, setPricing] = useState<Pricing>(defaultPricing);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchPricingClient().then((p) => { if (alive) setPricing(p); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const line = storageLine(inst.storage_addon_state, inst.storage_addon_gb);
  if (line) return <p className="text-sm text-muted-foreground">{line}</p>;
  if (inst.state !== "live" || !storageOffered(pricing)) return null;
  if (paid) {
    return (
      <p className="text-sm text-muted-foreground">
        Thank you. Your {pricing.storage_addon_gb} GB is paid for; this card will say so as soon as the payment is confirmed, usually within a minute.
      </p>
    );
  }

  const buy = async () => {
    setErr("");
    if (typeof window === "undefined" || !window.Razorpay) {
      setErr("The payment library is still loading. Try again in a moment.");
      return;
    }
    setBusy(true);
    try {
      const sub = await portalApi.addStorage(inst.id);
      const rzp = new window.Razorpay({
        key: sub.razorpay_key_id,
        subscription_id: sub.subscription_id,
        name: "OneCamp Cloud",
        description: `Extra storage, ${pricing.storage_addon_gb} GB, monthly`,
        prefill: { email: sub.email, name: sub.name },
        theme: { color: "#6d5efc" },
        handler: () => {
          setPaid(true);
          setBusy(false);
          // The webhook marks the workspace; give it a moment, then reload.
          window.setTimeout(onChanged, 8000);
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => {
        setBusy(false);
        setErr("Payment failed or was cancelled. You have not been charged.");
      });
      rzp.open();
    } catch (e) {
      setBusy(false);
      setErr(e instanceof Error ? e.message : "The purchase could not be started.");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <p className="text-sm text-foreground">
        Need more room for files and recordings? Add <strong>{pricing.storage_addon_gb} GB</strong> for{" "}
        <strong>{fmtINR(pricing.storage_addon_inr)} a month</strong>.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{paymentTerms("addon")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void buy()}
          disabled={busy}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Opening checkout…" : `Add ${pricing.storage_addon_gb} GB`}
        </button>
        {err && <span className="text-sm text-destructive">{err}</span>}
      </div>
    </div>
  );
}
