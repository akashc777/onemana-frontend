import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { site } from "@/lib/site";
import { AuroraBackdrop } from "@/components/site/Visuals";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/site/Reveal";
import { PostCard } from "@/components/blog/PostCard";

export const metadata: Metadata = {
  title: "Blog — product, AI & the future of work",
  description: `News, deep dives, and guides from the ${site.name} team on self-hosted, AI-native collaboration.`,
  alternates: { canonical: "/blog" },
  openGraph: { title: `${site.name} Blog`, url: `${site.url}/blog`, type: "website" },
};

// Revalidate the index periodically so new posts appear without a redeploy.
export const revalidate = 300;

export default async function BlogIndexPage() {
  let posts = [] as Awaited<ReturnType<typeof listPublishedPosts>>;
  try {
    posts = await listPublishedPosts();
  } catch {
    posts = [];
  }

  return (
    <>
      <section className="relative overflow-hidden pt-20 sm:pt-28">
        <AuroraBackdrop />
        <div className="container-x pb-12 text-center">
          <Reveal>
            <Badge>The OneCamp Blog</Badge>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ideas for the <span className="text-gradient">AI era</span> of work
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
              Product updates, engineering deep dives, and practical guides on building a calmer, self-hosted, AI-native workspace.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="container-x pb-24">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-4xl">✍️</p>
            <h2 className="mt-4 text-lg font-semibold text-white">No posts yet</h2>
            <p className="mt-2 text-sm text-slate-400">We&apos;re writing the first stories. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} featured={i === 0} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
