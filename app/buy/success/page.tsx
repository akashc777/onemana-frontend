"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";
import { AuroraBackdrop } from "@/components/site/Visuals";
import { ButtonLink } from "@/components/ui/Button";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="container-x py-24 text-center text-slate-500">Loading…</div>}>
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
    <section className="relative overflow-hidden py-20">
      <AuroraBackdrop className="!h-[55vh]" />
      <div className="container-x mx-auto max-w-2xl">
        <div className="card text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-2xl">
            {isCloud ? "☁️" : "🎉"}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            {isCloud ? "You're all set - welcome to OneCamp Cloud" : "Payment successful"}
          </h1>

          {isCloud ? (
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Thanks for subscribing! <span className="font-medium text-white">Our team will contact you within 12 hours</span> to provision your managed workspace. We&apos;ve emailed your included self-host license and GST invoice to{" "}
              <span className="font-medium text-white">{email}</span>.
            </p>
          ) : pending && !key ? (
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Thanks for your purchase! Your license key and setup instructions are being prepared and will arrive at{" "}
              <span className="font-medium text-white">{email}</span> within a minute. Your GST invoice is attached.
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Welcome to OneCamp. We&apos;ve also emailed your key, install command, and GST invoice to{" "}
              <span className="font-medium text-white">{email}</span>.
            </p>
          )}

          {key && (
            <div className="mt-7 space-y-5 text-left">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {isCloud ? "Your included license key" : "Your license key"}
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-canvas-soft px-4 py-3 font-mono text-sm text-slate-100">
                  <span className="flex-1 break-all">{key}</span>
                  <button onClick={() => copy(key, "key")} className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
                    {copied === "key" ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Install on your own server</p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-canvas-soft px-4 py-3 font-mono text-xs text-slate-100">
                  <span className="flex-1 break-all">{installCmd}</span>
                  <button onClick={() => copy(installCmd, "cmd")} className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">
                    {copied === "cmd" ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">Run it on any Docker-capable server. The installer handles Docker, SSL, the database, and AI models.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/docs">Read the setup docs</ButtonLink>
            <ButtonLink href={site.githubUrl} external variant="ghost">Open-source on GitHub</ButtonLink>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Didn&apos;t get the email? Check spam, or contact support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}
