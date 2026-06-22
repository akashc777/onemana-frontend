import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, listPublishedPosts, mediaUrl } from "@/lib/blog";
import { renderMarkdown, readingTime } from "@/lib/markdown";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-x max-w-prose pt-12 sm:pt-16">
        <Link href="/blog" className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
          ← Back to blog
        </Link>

        <header className="mt-6">
          {post.tags?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {post.author && <span className="font-medium text-foreground">{post.author}</span>}
            {post.published_at && (
              <>
                <span aria-hidden>·</span>
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{mins} min read</span>
          </div>
        </header>

        {cover && (
          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="w-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-lg mt-10 max-w-none pb-20
            prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-foreground
            prose-a:text-brand prose-a:no-underline hover:prose-a:underline
            prose-strong:text-foreground
            prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted
            prose-blockquote:border-l-brand prose-blockquote:text-muted-foreground
            prose-img:rounded-xl prose-img:border prose-img:border-border"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </article>
  );
}