import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { blogTopic } from "@/lib/blogTopics";
import { formatDayMonth } from "@/lib/format";
import { readingTime } from "@/lib/markdown";
import { TopicLabel } from "./Topic";

/**
 * One post in the blog index: the title, two lines of its excerpt, then the
 * date and how long it takes to read. The month is in the margin of the list
 * (app/blog/page.tsx), so a post does not repeat it: its date is the day and
 * the month ("9 Oct"), where "09 Oct 2026" once ran down a busy month a dozen
 * times. The <time> keeps the full timestamp for anything that reads it.
 * Two lines, not the whole excerpt, and only for the newest few: the index
 * was 20,000 px tall when all eighty-odd posts ran their excerpts in full.
 * Each post carries its topic (lib/blogTopics.ts): a square in the topic's
 * hue and its name, so the list can be read by colour down its length.
 */
export function PostCard({ post, compact = false }: { post: BlogPost; compact?: boolean }) {
  const mins = post.content ? readingTime(post.content) : 0;
  const topic = blogTopic(post.tags, post.title);
  const date = post.published_at ? (
    <time dateTime={post.published_at} className="text-caption tabular-nums text-muted-foreground">
      {formatDayMonth(post.published_at)}
    </time>
  ) : null;
  // Older posts are one line each on a wide screen: the title, then its topic and day.
  if (compact) {
    return (
      <li className="border-b border-border last:border-b-0">
        <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
          <span className="min-w-0 text-body text-foreground transition-colors group-hover:text-brand-ink">{post.title}</span>
          <span className="flex shrink-0 items-center gap-3">
            <TopicLabel topic={topic} />
            {date}
          </span>
        </Link>
      </li>
    );
  }
  return (
    <li className="border-b border-border last:border-b-0">
      <Link href={`/blog/${post.slug}`} className="group block py-6">
        <span className="block text-balance font-display text-h3 font-semibold text-foreground transition-colors group-hover:text-brand-ink">
          {post.title}
        </span>
        {post.excerpt && <span className="mt-2 line-clamp-2 max-w-2xl text-body text-muted-foreground">{post.excerpt}</span>}
        <span className="mt-3 flex items-center gap-3">
          <TopicLabel topic={topic} />
          {date}
          {mins ? <span className="text-caption text-muted-foreground">{mins} min read</span> : null}
        </span>
      </Link>
    </li>
  );
}
