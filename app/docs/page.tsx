import type { Metadata } from "next";
import Link from "next/link";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { listPublishedDocs, groupDocs } from "@/lib/docs";
import { site } from "@/lib/site";
import { DocsShell } from "@/components/docs/DocsShell";
import { PageHeader } from "@/components/site/PageHeader";
import { ButtonLink } from "@/components/ui/Button";

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
    docs = await listPublishedDocs();
  } catch {
    docs = [];
  }
  const groups = groupDocs(docs);

  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="OneCamp docs"
        subtitle="Everything you need to deploy, configure, and run your self-hosted workspace."
        align="left"
        divider
      />

      <DocsShell groups={groups}>
        {docs.length === 0 ? (
          <div className="card mx-auto max-w-md bg-muted/30 p-10 text-center">
            <h2 className="text-lg font-medium text-foreground">Docs are on the way</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Setup guides will appear here soon. Already purchased? Check the email we sent you.
            </p>
            <ButtonLink href="/buy" variant="brandPremium" size="md" className="mt-5">
              Get OneCamp
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-10">
            <p className="text-muted-foreground">Browse the guides below or pick a topic from the sidebar.</p>
            {groups.map((group) => (
              <div key={group.category}>
                <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.category}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/docs/${item.slug}`}
                      className="card card-hover group bg-card/90 p-5 transition-colors duration-150"
                    >
                      <h3 className="font-medium text-foreground transition-colors group-hover:text-brand">{item.title}</h3>
                      <span className="mt-2 inline-block text-sm text-muted-foreground">Read guide →</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DocsShell>

      <p className="container-x pb-14 text-center text-xs text-muted-foreground">
        Need help beyond the docs? Email{" "}
        <a href="mailto:support@onemana.dev" className="text-brand hover:underline">
          support@onemana.dev
        </a>
        .
      </p>
    </>
  );
}