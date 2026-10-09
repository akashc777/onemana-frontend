import type { Metadata } from "next";
import { HeroProductVideo } from "@/components/site/HeroProductVideo";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";

const DESCRIPTION = "OneCamp's 92-second launch film: an AI agent stopped from overstepping, then chat, docs and tasks on your own server.";

export const metadata: Metadata = {
  title: "Launch film",
  description: DESCRIPTION,
  alternates: { canonical: "/tour" },
  openGraph: { title: `${site.name} launch film`, description: DESCRIPTION, url: `${site.url}/tour`, type: "website", images: defaultOgImages },
  twitter: { card: "summary_large_image", title: `${site.name} launch film`, description: DESCRIPTION, images: defaultTwitterImages },
};

/** The launch film, moved off the home page so the home page can be short. */
export default function TourPage() {
  return (
    <>
      <PageHeader title="The launch film" subtitle="An AI agent stopped from overstepping, then the app: chat, docs and tasks, on your server." />
      <section className="pb-20">
        <div className="container-x max-w-4xl">
          <HeroProductVideo />
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={site.demoStartUrl} external variant="brand" size="lg">
              Try the live demo
            </ButtonLink>
            <ButtonLink href="/free" variant="ghost" size="lg">
              Install free
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
