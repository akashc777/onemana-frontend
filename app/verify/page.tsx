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
          A OneCamp workspace can hand anyone a file listing what an AI agent did in their name, with the
          hash each row was written with. This page recomputes those hashes so you can see whether the file
          is the one that workspace produced.
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          You do not need OneCamp, an account, or to trust us: the file is read and hashed in your browser,
          and the steps this page follows are the ones written inside the file itself.
        </p>
      </div>
      <div className="mt-10">
        <VerifyRecord />
      </div>
    </main>
  );
}
