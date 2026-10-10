import type { Metadata } from "next";
import { SubscribeForm } from "@/components/site/SubscribeForm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, listPublishedPosts, mediaUrl } from "@/lib/blog";
import { renderMarkdown, readingTime } from "@/lib/markdown";
import { jsonLdScript } from "@/lib/jsonLd";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";

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
  const post = await getPost(params.slug);
  if (!post) notFound();

  const html = renderMarkdown(post.content);
  const cover = mediaUrl(post.cover_image);
  const mins = readingTime(post.content);

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

      <div className="container-x max-w-prose pt-12 sm:pt-20">
        <Link href="/blog" className="text-small text-muted-foreground transition-colors duration-150 hover:text-foreground">
          ← All posts
        </Link>

        <header className="mt-6">
          <h1 className="text-balance text-[2.25rem] leading-[2.625rem] tracking-[-0.024em] text-foreground sm:text-h1">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted-foreground">
            {post.author && <span className="font-medium text-foreground">{post.author}</span>}
            {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
            <span>{mins} min read</span>
          </div>
        </header>

        {cover && (
          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {/* Covers are drawn at the 1200 by 630 share-card size; the attributes reserve
                that shape before the image loads, so the text below does not jump. */}
            <img src={cover} alt="" width={1200} height={630} decoding="async" className="h-auto w-full object-cover" />
          </div>
        )}

        <div
          className="prose mt-10 max-w-none pb-16 sm:prose-lg
            prose-headings:scroll-mt-24 prose-headings:text-foreground
            prose-strong:text-foreground
            prose-pre:rounded-lg prose-pre:border prose-pre:border-border prose-pre:bg-muted
            prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-muted-foreground
            prose-img:rounded-lg prose-img:border prose-img:border-border"
          dangerouslySetInnerHTML={{ __html: html }}
        />

          {/* AT THE END OF A POST, not in front of it. Somebody who has read to
              the bottom of a technical write-up is the warmest reader this site
              gets, and organic search sends more people here than to any other
              page. Until now they left with no way to hear from us again. */}
          {/* Tags at the end, as words: as pills above the title they were the
              first thing a reader met, ahead of the headline. */}
          {post.tags?.length > 0 && (
            <p className="mb-8 text-small text-muted-foreground">
              Filed under {post.tags.join(", ")}.
            </p>
          )}

          <div className="mb-20 border-t border-border pt-8">
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
      </div>
    </article>
  );
}