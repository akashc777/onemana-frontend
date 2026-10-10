import type { Metadata } from "next";
import Link from "next/link";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { listPublishedDocs, groupDocs } from "@/lib/docs";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { DocsSearch } from "@/components/docs/DocsSearch";

export const metadata: Metadata = {
  title: "Docs - install & run OneCamp",
  description: "Guides to deploy, configure, and operate your self-hosted OneCamp workspace.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: `${site.name} Docs`,
    description: "Install, configure, and run your self-hosted OneCamp workspace.",
    url: `${site.url}/docs`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} Docs`,
    description: "Install, configure, and run your self-hosted OneCamp workspace.",
    images: defaultTwitterImages,
  },
};

export const dynamic = "force-dynamic";

export default async function DocsIndexPage() {
  let docs = [] as Awaited<ReturnType<typeof listPublishedDocs>>;
  try {
    docs = await listPublishedDocs({ fresh: true });
  } catch {
    docs = [];
  }
  const groups = groupDocs(docs);

  return (
    <>
      <PageHeader
        title="Docs"
        subtitle="How to install OneCamp on your server, keep it running, and use what is in it."
        divider
      >
        {docs.length > 0 && <DocsSearch className="mt-8 max-w-md" />}
      </PageHeader>

      {/* The index IS the navigation, so it has no sidebar repeating it. Each
          guide says what it is in its own words (its description in the CMS),
          with the group in the margin: a list somebody scans, not a grid of
          boxes that all said "Read guide". */}
      <div className="container-x pb-16 pt-10">
        {docs.length === 0 ? (
          <div className="mx-auto max-w-md py-10 text-center">
            <h2 className="text-h3 text-foreground">Docs are on the way</h2>
            <p className="mt-2 text-small text-muted-foreground">
              Setup guides will appear here soon. Already purchased? Check the email we sent you.
            </p>
            <ButtonLink href="/free" variant="ghost" className="mt-5">
              Install free
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.category} className="grid gap-4 lg:grid-cols-12 lg:gap-x-8">
                <h2 className="text-h3 text-foreground lg:sticky lg:top-24 lg:col-span-3 lg:h-fit lg:pt-3">
                  {group.category}
                </h2>
                <ul className="divide-y divide-border border-y border-border lg:col-span-9">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        className="group flex items-baseline justify-between gap-6 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium text-foreground transition-colors duration-150 group-hover:text-brand-ink">
                            {item.title}
                          </span>
                          {item.summary && (
                            <span className="mt-1 block max-w-2xl text-small text-muted-foreground">
                              {item.summary}
                            </span>
                          )}
                        </span>
                        <span aria-hidden className="shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <p className="container-x pb-16 text-small text-muted-foreground">
        Need help beyond the docs? Email{" "}
        <a href="mailto:support@onemana.dev" className="link">
          support@onemana.dev
        </a>
        .
      </p>
    </>
  );
}