import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, listPublishedPosts, mediaUrl } from "@/lib/blog";
import { renderMarkdown, readingTime } from "@/lib/markdown";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { AuroraBackdrop } from "@/components/site/Visuals";

export const revalidate = 120;

// Pre-render published posts at build for speed + SEO; new ones are ISR'd.
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
  const cover = post.cover_image ? mediaUrl(post.cover_image) : undefined;
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
      images: cover ? [{ url: cover }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: cover ? [cover] : undefined },
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
    <article className="relative overflow-hidden">
      <AuroraBackdrop className="!h-[60vh]" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-x max-w-3xl pt-16 sm:pt-24">
        <Link href="/blog" className="text-sm text-slate-400 transition-colors hover:text-white">
          ← Back to blog
        </Link>

        <header className="mt-6">
          {post.tags?.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-brand-light">
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {post.author && <span className="font-medium text-slate-300">{post.author}</span>}
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
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="w-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-invert prose-lg mt-10 max-w-none pb-24
            prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:text-white
            prose-a:text-brand-light prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white prose-code:text-accent-cyan
            prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-canvas-soft
            prose-blockquote:border-l-brand prose-blockquote:text-slate-300
            prose-img:rounded-xl prose-img:border prose-img:border-white/10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </article>
  );
}
