import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog: notes from building OneCamp",
  description: `News, deep dives, and guides from the ${site.name} team on self-hosted, AI-native collaboration.`,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${site.name} Blog`,
    description: `News, deep dives, and guides from the ${site.name} team on self-hosted, AI-native collaboration.`,
    url: `${site.url}/blog`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} Blog`,
    description: `News and guides on self-hosted, AI-native team collaboration.`,
    images: defaultTwitterImages,
  },
};

export const dynamic = "force-dynamic";

/** How many of the newest posts show their excerpt; the rest are one line each. */
const FEATURED = 5;

export default async function BlogIndexPage() {
  let posts = [] as Awaited<ReturnType<typeof listPublishedPosts>>;
  try {
    posts = await listPublishedPosts();
  } catch {
    posts = [];
  }

  return (
    <>
      <PageHeader
        title="Notes from building OneCamp"
        subtitle="What shipped, what broke, and what changed because of it, written by the person who builds it."
      />

      <div className="container-x pb-24">
        {posts.length === 0 ? (
          <p className="border-t border-border py-10 text-body text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <div className="border-t border-border">
            {byMonth(posts).map(([month, items]) => (
              <section key={month} className="grid gap-0 border-b border-border py-2 lg:grid-cols-12 lg:gap-x-8">
                <h2 className="pt-6 font-sans text-small font-medium tracking-normal text-muted-foreground lg:sticky lg:top-24 lg:col-span-3 lg:h-fit">
                  {month}
                </h2>
                <ul className="lg:col-span-9">
                  {items.map((p) => (
                    <PostCard key={p.id} post={p} compact={posts.indexOf(p) >= FEATURED} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

type Post = Awaited<ReturnType<typeof listPublishedPosts>>[number];

/** Posts grouped by the month they were published, newest first, keeping the API's order inside a month. */
function byMonth(posts: Post[]): [string, Post[]][] {
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const groups = new Map<string, Post[]>();
  for (const p of posts) {
    const d = p.published_at ? new Date(p.published_at) : null;
    const key = d && !Number.isNaN(d.getTime()) ? fmt.format(d) : "Undated";
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.entries()];
}
