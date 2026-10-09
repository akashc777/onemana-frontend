"use client";

import { useState } from "react";
import { installCommand } from "@/lib/installCommand";
import { installerAsks } from "@/lib/content";

/**
 * The licence key and the one-line installer, on the purchase receipt.
 *
 * The command is built here and nowhere else on the page, by installCommand,
 * which refuses anything but a key in the form the backend issues. So whatever
 * reaches this component, the buyer is never shown a command that runs anything
 * but our installer. A key that fails renders nothing, rather than a command
 * with something else in it; the same key and command are in their email.
 */
export function LicenseInstall({ licenseKey, isCloud }: { licenseKey: string; isCloud: boolean }) {
  const [copied, setCopied] = useState("");
  const installCmd = installCommand(licenseKey);
  if (!installCmd) return null;

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
    <div className="mt-7 space-y-5 text-left">
      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">
          {isCloud ? "Your included license key" : "Your license key"}
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3 font-mono text-sm text-foreground">
          <span className="flex-1 break-all">{licenseKey}</span>
          <button onClick={() => copy(licenseKey, "key")} className="shrink-0 rounded-md bg-background px-2 py-1 text-xs hover:bg-muted">
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
        <p className="mt-2 text-xs text-muted-foreground">Run it on a Linux server with 4 GB of RAM. It asks for {installerAsks}. The installer handles Docker, SSL and the database, plus the AI models if you pick the AI edition, and serves the web app your team opens from the same server.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Both editions come with this key.</span> The installer asks which you want: v2 with AI teammates, or v1 with no AI at all for teams whose policy does not allow it. You can move up to v2 later with the same key.
        </p>
      </div>
    </div>
  );
}
