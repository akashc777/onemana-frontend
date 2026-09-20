import type { Metadata } from "next";
import { VerifyRecord } from "@/components/site/VerifyRecord";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";

const DESCRIPTION =
  "Somebody handed you a record of what an AI agent did. Check it here, in your browser, without OneCamp and without an account. Nothing is uploaded.";

export const metadata: Metadata = {
  title: "Verify a record",
  description: DESCRIPTION,
  alternates: { canonical: "/verify" },
  openGraph: {
    title: "Verify a OneCamp record",
    description: DESCRIPTION,
    url: `${site.url}/verify`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify a OneCamp record",
    description: DESCRIPTION,
    images: defaultTwitterImages,
  },
};

export default function VerifyPage() {
  return (
    <main className="container mx-auto px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Verify a record</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Somebody handed you a file from a OneCamp workspace. Every row in it carries the hash it was
          written with, and this page recomputes them, so you can see whether the file is the one that
          workspace produced or something edited on the way to you.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          You do not need OneCamp, an account, or to trust us: the file is read and hashed in your browser,
          and the steps this page follows are the ones written inside the file itself.
        </p>

        <h2 className="mt-10 text-lg font-semibold">Where the file comes from</h2>
        <dl className="mt-4 space-y-4 text-base text-muted-foreground">
          <div>
            <dt className="font-medium text-foreground">An evidence pack, from an administrator</dt>
            <dd className="mt-1">
              The whole log for a window, exported from admin settings. This is the one an auditor is
              usually given.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">A personal record, from anyone in the workspace</dt>
            <dd className="mt-1">
              What AI agents did in one person&apos;s name, downloaded from their own activity page. No
              administrator needed.
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-base text-muted-foreground">
          Either file works here. If you do not have one and want to see what this is,{" "}
          <a href="/compare" className="underline underline-offset-4 hover:text-foreground">
            the live demo
          </a>{" "}
          will make you one in about a minute.
        </p>
      </div>
      <div className="mt-10">
        <VerifyRecord />
      </div>
    </main>
  );
}
