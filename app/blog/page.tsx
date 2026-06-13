import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog - product, AI & the future of work",
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
        eyebrow="Blog"
        title="Ideas for the future of work"
        subtitle="Product updates, engineering deep dives, and practical guides on building a calmer, self-hosted, AI-native workspace."
        divider
      />

      <div className="container-x pb-20 pt-2">
        {posts.length === 0 ? (
          <div className="card mx-auto max-w-md bg-muted/30 p-10 text-center">
            <h2 className="text-lg font-medium text-foreground">No posts yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">We&apos;re writing the first stories. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} featured={i === 0} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}