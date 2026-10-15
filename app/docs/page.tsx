import type { Metadata } from "next";
import Link from "next/link";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { listPublishedDocs, groupDocs } from "@/lib/docs";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SpotDocs, SpotError } from "@/components/ui/graphics/spots";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { DocsSearch } from "@/components/docs/DocsSearch";
import { DocsGroupTile } from "@/components/docs/DocsGroupMark";
import { ix } from "@/lib/interactive";

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

/** Where most readers start (site.md D1): each a card with its tile. */
const START_HERE = [
  { slug: "installation", title: "Installation", line: "One command on a 4 GB server, 10 to 20 minutes.", hue: "sun", d: "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" },
  { slug: "scale-self-hosted", title: "Scaling", line: "What one machine runs, and when to grow it.", hue: "lake", d: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { slug: "slack-bridge", title: "Moving from Slack", line: "Run both in one conversation while people move.", hue: "berry", d: "M7 8h10a3 3 0 0 1 0 6H7M10 5 7 8l3 3M14 17l3-3" },
] as const;

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
        art={<SpotDocs size={160} />}
        artOnPhone={false}
        divider
      >
        {docs.length > 0 && (
          <div id="search">
            <DocsSearch className="mt-8 max-w-[560px]" />
          </div>
        )}
      </PageHeader>

      {/* The index IS the navigation, so it has no sidebar repeating it. Each
          guide says what it is in its own words (its description in the CMS),
          with the group in the margin: a list somebody scans, not a grid of
          boxes that all said "Read guide". */}
      <div className="container-x pb-16 pt-10">
        {docs.length === 0 ? (
          <div className="max-w-md py-10">
            <SpotError size={96} className="mb-5" />
            <h2 className="text-h3 text-foreground">The guides could not be loaded</h2>
            <p className="mt-2 text-small text-muted-foreground">
              Try again in a minute. Your licence email has the install command, and support@onemana.dev answers
              anything in the meantime.
            </p>
            <ButtonLink href="/free" variant="ghost" className="mt-5">
              Install free
            </ButtonLink>
          </div>
        ) : (
          <div className="space-y-12">
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3">
              {START_HERE.map((c) => (
                <li key={c.slug}>
                  <Link href={`/docs/${c.slug}`} className="lift flex h-full flex-col gap-3 rounded-xl bg-card p-5 shadow-e1">
                    <Tile hue={c.hue} size="lg">
                      <Icon d={c.d} />
                    </Tile>
                    <span>
                      <span className="block text-body font-[590] text-foreground">{c.title}</span>
                      <span className="mt-1 block text-balance text-small text-muted-foreground">{c.line}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {groups.map((group) => (
              <section key={group.category} className="grid gap-4 lg:grid-cols-12 lg:gap-x-8">
                {/* The group in the margin: its tile (its colour, which its
                    guides' sidebar repeats), its name and how many guides. */}
                <div className="flex items-center gap-3 lg:sticky lg:top-24 lg:col-span-3 lg:h-fit lg:flex-col lg:items-start lg:gap-0 lg:pt-4">
                  <DocsGroupTile category={group.category} />
                  <div className="lg:mt-3">
                    <h2 className="text-h3 text-foreground">{group.category}</h2>
                    <p className="text-caption text-muted-foreground">
                      {group.items.length} {group.items.length === 1 ? "guide" : "guides"}
                    </p>
                  </div>
                </div>
                <ul className="divide-y divide-border border-y border-border lg:col-span-9">
                  {group.items.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/docs/${item.slug}`}
                        {...ix("row", { quiet: true })}
                        className="group -mx-3 flex min-h-14 items-baseline justify-between gap-6 rounded-lg px-3 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block text-body font-[590] text-foreground">
                            {item.title}
                          </span>
                          {item.summary && (
                            <span className="mt-1 block max-w-2xl text-balance text-small text-muted-foreground">
                              {item.summary}
                            </span>
                          )}
                        </span>
                        <Icon name="arrow-right" className="self-center text-faint transition-[transform,color] group-hover:text-foreground motion-safe:group-hover:translate-x-0.5" />
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