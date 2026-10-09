import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { readingTime } from "@/lib/markdown";

/**
 * One post in the blog index: the date in the margin, then the title, the
 * excerpt and how long it takes to read. A list rather than a grid of image
 * cards: the posts are read for what they say, and most have no cover worth
 * the space.
 */
export function PostCard({ post }: { post: BlogPost }) {
  const mins = post.content ? readingTime(post.content) : 0;
  return (
    <li className="border-b border-border">
      <Link href={`/blog/${post.slug}`} className="group grid gap-1 py-6 md:grid-cols-[10rem_1fr] md:gap-10">
        <span className="text-small text-muted-foreground">
          {post.published_at ? <time dateTime={post.published_at}>{formatDate(post.published_at)}</time> : null}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-h3 font-semibold text-foreground transition-colors duration-150 group-hover:text-brand-ink">
            {post.title}
          </span>
          {post.excerpt && <span className="mt-2 block max-w-2xl text-body text-muted-foreground">{post.excerpt}</span>}
          <span className="mt-2 block text-caption text-muted-foreground">
            {[post.author, mins ? `${mins} min read` : ""].filter(Boolean).join(" · ")}
          </span>
        </span>
      </Link>
    </li>
  );
}
