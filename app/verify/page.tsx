import type { Metadata } from "next";
import { VerifyRecord } from "@/components/site/VerifyRecord";
import { PageHeader } from "@/components/site/PageHeader";
import { SECTION_END } from "@/components/ui/Section";
import { RecordRows } from "@/components/site/RecordRows";
import { attemptAndRefusal } from "@/lib/recordExcerpt";
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

/**
 * The verifier. The drop zone comes first, because somebody who arrives here
 * has a file in hand; where files come from, and what a row looks like, sit
 * underneath on the margin grid.
 */
export default function VerifyPage() {
  return (
    <>
      <PageHeader
        title="Verify a record"
        subtitle="Somebody handed you a file from a OneCamp workspace. Every row in it carries the hash it was written with. This page recomputes them, so you can see whether the file is the one the workspace produced or something edited on the way to you."
      />

      <div className={`container-x ${SECTION_END}`}>
        <div className="max-w-3xl">
          <VerifyRecord />
          <p className="mt-6 text-small text-muted-foreground">
            You do not need OneCamp, an account, or to trust us: the file is read and hashed in your browser, and the
            steps this page follows are the ones written inside the file itself.
          </p>
        </div>

        <section className="mt-20 grid gap-8 border-t border-border pt-16 sm:mt-28 sm:pt-24 lg:grid-cols-12 lg:gap-x-8">
          <h2 className="text-h3 text-foreground lg:col-span-4">Where the file comes from</h2>
          <div className="lg:col-span-8">
            {/* Side by side, each kind takes two rows of one subgrid, so the
                second's two-line name moves the first's description down
                with its own and the two start on one line. */}
            <dl className="grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0">
              <div className="sm:row-span-2 sm:grid sm:grid-rows-subgrid">
                <dt className="font-medium text-foreground">An evidence pack, from an administrator</dt>
                <dd className="mt-1 text-small text-muted-foreground">
                  The whole log for a window, exported from admin settings. This is the one an auditor is usually given.
                </dd>
              </div>
              <div className="sm:row-span-2 sm:grid sm:grid-rows-subgrid">
                <dt className="font-medium text-foreground">A personal record, from anyone in the workspace</dt>
                <dd className="mt-1 text-small text-muted-foreground">
                  What AI agents did in one person&apos;s name, downloaded from their own activity page. No administrator
                  needed.
                </dd>
              </div>
            </dl>
            <p className="mt-8 text-small text-muted-foreground">
              Either file works here. Without one,{" "}
              <a href={site.demoDrillUrl()} target="_blank" rel="noreferrer" className="link">
                the live demo
              </a>{" "}
              will make you one in about a minute. This is what two of its rows look like:
            </p>
            <RecordRows rows={attemptAndRefusal} className="mt-5" />
          </div>
        </section>
      </div>
    </>
  );
}
