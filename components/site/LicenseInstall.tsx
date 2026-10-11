"use client";

import { installCommand } from "@/lib/installCommand";
import { installerAsks } from "@/lib/content";
import { CopyField } from "@/components/account/AccountParts";

/**
 * The licence key and the one-line installer, on the purchase receipt.
 *
 * The command is built here and nowhere else on the page, by installCommand,
 * which refuses anything but a key in the form the backend issues. So whatever
 * reaches this component, the buyer is never shown a command that runs anything
 * but our installer. A key that fails renders nothing, rather than a command
 * with something else in it; the same key and command are in their email.
 *
 * Both values copy with the account page's field, so the receipt and the
 * account show a key the same way.
 */
export function LicenseInstall({ licenseKey, isCloud }: { licenseKey: string; isCloud: boolean }) {
  const installCmd = installCommand(licenseKey);
  if (!installCmd) return null;

  return (
    <div className="mt-8 space-y-6 rounded-2xl bg-card p-5 shadow-e1 sm:p-6">
      <div>
        <p className="mb-1.5 text-caption text-muted-foreground">{isCloud ? "Your included licence key" : "Your licence key"}</p>
        <CopyField value={licenseKey} label="licence key" />
      </div>
      <div>
        <p className="mb-1.5 text-caption text-muted-foreground">Install on your own server</p>
        <CopyField value={installCmd} label="install command" wrap />
        <p className="mt-3 text-caption text-muted-foreground">
          Run it on an Ubuntu or Debian server with 4 GB of RAM. It asks for {installerAsks}. The installer handles Docker, SSL and the database, plus the AI models if you pick the AI edition, and serves the web app your team opens from the same server.
        </p>
        <p className="mt-2 text-caption text-muted-foreground">
          <span className="font-medium text-foreground">Both editions come with this key.</span> The installer asks which you want: v2 with AI teammates, or v1 with no AI at all for teams whose policy does not allow it. You can move up to v2 later with the same key.
        </p>
      </div>
    </div>
  );
}
