import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import { getPost, listPublishedPosts, mediaUrl, type BlogPost } from "@/lib/blog";
import { renderMarkdown, readingTime } from "@/lib/markdown";
import { enhanceArticle } from "@/lib/article";
import { blogTopic, relatedPosts } from "@/lib/blogTopics";
import { jsonLdScript } from "@/lib/jsonLd";
import { formatDay } from "@/lib/format";
import { site } from "@/lib/site";
import { Prose } from "@/components/reading/Prose";
import { PostCover } from "@/components/blog/PostCover";
import { TopicChip, TopicLabel } from "@/components/blog/Topic";
import { IdentityMark } from "@/components/ui/graphics/IdentityMark";

export const revalidate = 120;

export async function generateStaticParams() {
  try {
    const posts = await listPublishedPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found" };
  const title = post.seo_title || post.title;
  const description = post.seo_desc || post.excerpt;
  const url = `${site.url}/blog/${post.slug}`;
  // Social share image is the dynamic title card from
  // app/blog/[slug]/opengraph-image.tsx (and twitter-image.tsx); Next wires the
  // og:image / twitter:image meta automatically, so we don't set images here.
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, all] = await Promise.all([
    getPost(params.slug),
    listPublishedPosts({ cached: true }).catch((): BlogPost[] => []),
  ]);
  if (!post) notFound();

  const { html } = enhanceArticle(renderMarkdown(post.content));
  const cover = mediaUrl(post.cover_image);
  const mins = readingTime(post.content);
  const topic = blogTopic(post.tags, post.title);
  const next = relatedPosts(all, post);
  const author = post.author?.trim();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: cover || undefined,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { "@type": "Organization", name: post.author || site.company },
    publisher: { "@type": "Organization", name: site.company },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site.url}/blog/${post.slug}` },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <div className="container-x max-w-prose pt-10 sm:pt-16">
        <Link href="/blog" className="tap-target text-small text-muted-foreground transition-colors duration-150 hover:text-foreground">
          ← All posts
        </Link>

        <header className="mt-8">
          <TopicChip topic={topic} />
          <h1 className="mt-4 text-balance text-title text-foreground sm:text-h1">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-muted-foreground">
            {author && (
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <IdentityMark id={author} label={author} variant="avatar" size={24} />
                {author}
              </span>
            )}
            {post.published_at && <time dateTime={post.published_at}>{formatDay(post.published_at)}</time>}
            <span>{mins} min read</span>
          </div>
        </header>

        {cover && (
          <div className="mt-8">
            <PostCover src={cover} hue={topic.hue} />
          </div>
        )}

        <Prose html={html} kind="post" className="mt-10" />

        {/* Tags at the end, as words: as pills above the title they were the
            first thing a reader met, ahead of the headline. */}
        {post.tags?.length > 0 && (
          <p className="mt-10 text-small text-muted-foreground">Filed under {post.tags.join(", ")}.</p>
        )}

        {/* AT THE END OF A POST, not in front of it. Somebody who has read to
            the bottom of a technical write-up is the warmest reader this site
            gets, and organic search sends more people here than to any other
            page. Until now they left with no way to hear from us again. */}
        <div className="mt-10 border-t border-border pt-8">
          <p className="text-small font-medium text-foreground">Get the next one</p>
          <p className="mb-4 mt-1 text-small text-muted-foreground">
            I write these as I build OneCamp: what broke, what it cost, and what I changed.
          </p>
          <SubscribeForm
            source="blog-post"
            cta="Email me updates"
            hint="Occasional emails when something ships or is worth reading. Unsubscribe in one click."
          />
        </div>

        {next.length > 0 && (
          <nav aria-labelledby="read-next" className="mb-24 mt-14">
            <h2 id="read-next" className="text-small font-medium text-foreground">
              Read next
            </h2>
            <ul className="mt-3 border-t border-border">
              {next.map((p) => (
                <li key={p.slug} className="border-b border-border">
                  <Link href={`/blog/${p.slug}`} className="group flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <span className="min-w-0 text-body text-foreground transition-colors duration-150 group-hover:text-brand-ink">{p.title}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <TopicLabel topic={blogTopic(p.tags, p.title)} />
                      {p.published_at ? (
                        <time dateTime={p.published_at} className="text-caption tabular-nums text-muted-foreground">
                          {formatDay(p.published_at)}
                        </time>
                      ) : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {next.length === 0 && <div className="mb-24" />}
      </div>
    </article>
  );
}
