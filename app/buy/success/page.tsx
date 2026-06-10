"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { site } from "@/lib/site";

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
  const email = params.get("email") || "your email";
  const [copied, setCopied] = useState(false);

  const installCmd = key ? `/bin/bash -c "$(curl -fsSL ${site.backendUrl}/onecamp/download/${key})"` : "";

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section className="py-20">
      <div className="container-x mx-auto max-w-2xl">
        <div className="card text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-2xl">🎉</div>
          <h1 className="mt-4 text-2xl font-bold text-ink">Payment successful</h1>

          {pending && !key ? (
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Thanks for your purchase! Your license key and setup instructions are being prepared and will arrive at <span className="font-medium text-ink">{email}</span> within a minute. Your GST invoice is attached.
            </p>
          ) : (
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              Welcome to OneCamp. We&apos;ve also emailed your key, install command, and GST invoice to <span className="font-medium text-ink">{email}</span>.
            </p>
          )}

          {key && (
            <div className="mt-7 space-y-5 text-left">
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Your license key</p>
                <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-3 font-mono text-sm text-slate-100">
                  <span className="flex-1 break-all">{key}</span>
                  <button onClick={() => copy(key)} className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">Copy</button>
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Install on your server</p>
                <div className="flex items-center gap-2 rounded-xl bg-ink px-4 py-3 font-mono text-xs text-slate-100">
                  <span className="flex-1 break-all">{installCmd}</span>
                  <button onClick={() => copy(installCmd)} className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20">{copied ? "Copied" : "Copy"}</button>
                </div>
                <p className="mt-2 text-xs text-slate-400">Run it on any Docker-capable server. The installer handles Docker, SSL, the database, and AI models.</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/docs" className="btn-primary">Read the setup docs</Link>
            <a href={site.githubUrl} target="_blank" rel="noreferrer" className="btn-ghost">Open-source on GitHub</a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Didn&apos;t get the email? Check spam, or contact support@onemana.dev with your payment id.
        </p>
      </div>
    </section>
  );
}
