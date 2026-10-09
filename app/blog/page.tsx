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
        subtitle="What we shipped, why, and what we learned on the way. Written by the people who build it."
      />

      <div className="container-x pb-20">
        {posts.length === 0 ? (
          <p className="border-t border-border py-10 text-body text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <ul className="border-t border-border">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}