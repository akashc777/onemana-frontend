import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { mediaUrl } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/site/Reveal";

export function PostCard({ post, index = 0, featured = false }: { post: BlogPost; index?: number; featured?: boolean }) {
  const cover = mediaUrl(post.cover_image);
  return (
    <Reveal delay={(index % 3) * 60} className={featured ? "sm:col-span-2 lg:col-span-3" : ""}>
      <Link
        href={`/blog/${post.slug}`}
        className="card card-hover group block h-full overflow-hidden bg-card/90 transition-colors duration-150"
      >
        <div className={`flex h-full ${featured ? "flex-col md:flex-row" : "flex-col"}`}>
          <div className={`relative overflow-hidden bg-muted ${featured ? "md:w-1/2" : ""}`}>
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${
                  featured ? "h-56 md:h-full" : "h-44"
                }`}
              />
            ) : (
              <div className={`grid place-items-center ${featured ? "h-56 md:h-full" : "h-44"}`}>
                <span className="text-3xl text-muted-foreground/40">◎</span>
              </div>
            )}
          </div>
          <div className={`flex flex-1 flex-col p-6 ${featured ? "md:justify-center" : ""}`}>
            {post.tags?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <h3 className={`font-medium text-foreground transition-colors group-hover:text-brand ${featured ? "text-2xl" : "text-lg"}`}>
              {post.title}
            </h3>
            {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              {post.author && <span>{post.author}</span>}
              {post.author && post.published_at && <span aria-hidden>·</span>}
              {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}