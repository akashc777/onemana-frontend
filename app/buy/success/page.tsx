"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";
import { ButtonLink } from "@/components/ui/Button";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-muted-foreground">Loading…</div>}>
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const key = params.get("key") || "";
  const pending = params.get("pending") === "1";
  const isCloud = params.get("cloud") === "1";
  const email = params.get("email") || "your email";
  const [copied, setCopied] = useState("");

  const installCmd = key ? `/bin/bash -c "$(curl -fsSL ${site.backendUrl}/onecamp/download/${key})"` : "";

  const copy = async (text: string, which: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

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
            <p className="mx-auto mt-3 max-w-md text-muted-foreground">
              Thanks for subscribing! <span className="font-medium text-foreground">Our team will contact you within 12 hours</span> to provision your managed workspace. We&apos;ve emailed your included self-host license and GST invoice to{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
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

          {key && (
            <div className="mt-7 space-y-5 text-left">
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {isCloud ? "Your included license key" : "Your license key"}
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
                  <span className="flex-1 break-all">{key}</span>
                  <button onClick={() => copy(key, "key")} className="shrink-0 rounded-md bg-background px-2 py-1 text-xs hover:bg-muted">
                    {copied === "key" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Install on your own server</p>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-3 font-mono text-[11px] text-foreground sm:px-4 sm:text-xs">
                  <span className="flex-1 break-all">{installCmd}</span>
                  <button onClick={() => copy(installCmd, "cmd")} className="shrink-0 rounded-md bg-background px-2 py-1 text-xs hover:bg-muted">
                    {copied === "cmd" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Run it on any Docker-capable server. The installer handles Docker, SSL, the database, and AI models.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/docs" variant="brandPremium">Read the setup docs</ButtonLink>
            <ButtonLink href={site.githubUrl} external variant="ghost">Open-source on GitHub</ButtonLink>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Didn&apos;t get the email? Check spam, or contact support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}