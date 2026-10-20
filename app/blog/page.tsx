import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { defaultOgImages, defaultTwitterImages } from "@/lib/og-card";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { PostCard } from "@/components/blog/PostCard";
import { PostCover } from "@/components/blog/PostCover";
import { TopicChip } from "@/components/blog/Topic";
import { TopicFilter } from "@/components/blog/TopicFilter";
import { Rings } from "@/components/ui/graphics/motifs";
import { SparkMark } from "@/components/ui/v3";
import { BLOG_TOPICS, blogTopic } from "@/lib/blogTopics";
import { mediaUrl } from "@/lib/blog";
import { formatDayMonth } from "@/lib/format";
import Link from "next/link";
import { ix } from "@/lib/interactive";

/** One CSS rule a topic: while a topic is chosen, the other topics' posts are hidden (TopicFilter). */
const FILTER_CSS = BLOG_TOPICS.map((t) => `#posts[data-topic-filter="${t.key}"] [data-topic]:not([data-topic="${t.key}"]){display:none}`).join("");

// Said plainly, as the page header says it. "From the OneCamp team" described
// a team that does not exist: OneMana is one person (see /about).
const DESCRIPTION = `Notes from building ${site.name}, written by the person who builds it: what shipped, what broke, and what changed because of it.`;

export const metadata: Metadata = {
  title: "Blog: notes from building OneCamp",
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `${site.name} Blog`,
    description: DESCRIPTION,
    url: `${site.url}/blog`,
    type: "website",
    images: defaultOgImages,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} Blog`,
    description: DESCRIPTION,
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
        art={
          <span className="relative flex size-40 items-center justify-center">
            <Rings size={160} count={3} core={false} className="absolute inset-0 text-muted-foreground" />
            <SparkMark size={44} />
          </span>
        }
        artOnPhone={false}
      />

      <div className="container-x pb-24">
        {posts.length === 0 ? (
          <p className="border-t border-border py-10 text-body text-muted-foreground">No posts yet. Check back soon.</p>
        ) : (
          <>
          {/* The newest post, featured (site.md BL1). */}
          <Featured post={posts[0]!} />
          <div className="mt-12">
            <TopicFilter target="posts" />
          </div>
          <style dangerouslySetInnerHTML={{ __html: FILTER_CSS }} />
          <div id="posts" className="mt-6 border-t border-border">
            {byMonth(posts.slice(1)).map(([month, items]) => (
              <section key={month} className="grid gap-0 border-b border-border py-2 grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
                <h2 className="pt-6 font-sans text-small font-medium tracking-normal text-muted-foreground lg:sticky lg:top-24 lg:col-span-3 lg:h-fit">
                  {month}
                </h2>
                <ul className="lg:col-span-9">
                  {items.map(({ post, index }) => (
                    <PostCard key={post.id} post={post} compact={index >= FEATURED - 1} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
          </>
        )}
      </div>
    </>
  );
}

type Post = Awaited<ReturnType<typeof listPublishedPosts>>[number];

/**
 * Posts grouped by the month they were published, newest first, keeping the
 * API's order inside a month, each with its place in the whole list (the
 * newest few show their excerpt). One pass: it was indexOf per post.
 */
function byMonth(posts: Post[]): [string, { post: Post; index: number }[]][] {
  const fmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const groups = new Map<string, { post: Post; index: number }[]>();
  posts.forEach((post, index) => {
    const d = post.published_at ? new Date(post.published_at) : null;
    const key = d && !Number.isNaN(d.getTime()) ? fmt.format(d) : "Undated";
    const list = groups.get(key);
    if (list) list.push({ post, index });
    else groups.set(key, [{ post, index }]);
  });
  return [...groups.entries()];
}

/**
 * The featured post (site.md BL1): a 2-column card, the cover at 16:10 on
 * the left and its topic, title, excerpt and date on the right. Its cover
 * scales a little inside its mask under the pointer.
 */
function Featured({ post }: { post: Post }) {
  const topic = blogTopic(post.tags, post.title);
  const cover = mediaUrl(post.cover_image);
  return (
    <Link href={`/blog/${post.slug}`} data-topic={topic.key} {...ix("card")} className="group grid grid-cols-1 gap-6 rounded-[20px] bg-card p-4 shadow-e1 sm:p-5 lg:grid-cols-2 lg:items-center lg:gap-10">
      {cover ? (
        <div className="overflow-hidden rounded-xl">
          <PostCover src={cover} hue={topic.hue} />
        </div>
      ) : (
        <div className="hidden lg:block" />
      )}
      <div className="lg:pr-6">
        <TopicChip topic={topic} />
        <span className="mt-4 block text-balance text-[28px] font-semibold leading-[34px] tracking-[-0.021em] text-foreground [font-variation-settings:'opsz'_32]">{post.title}</span>
        {post.excerpt && <span className="mt-3 line-clamp-3 block text-body text-muted-foreground">{post.excerpt}</span>}
        <span className="mt-5 flex items-center gap-3 text-caption text-muted-foreground">
          <span className="font-[510] text-foreground">{post.author || "Akash Hadagali"}</span>
          {post.published_at && <time dateTime={post.published_at} className="tabular-nums">{formatDayMonth(post.published_at)}</time>}
        </span>
      </div>
    </Link>
  );
}
