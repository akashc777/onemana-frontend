import { ButtonLink } from "@/components/ui/Button";
import { FREE_SEATS } from "@/lib/freePlan";
import { site } from "@/lib/site";

/**
 * The end of a post, before the email form: what the post is about, and the
 * two ways in.
 *
 * Read from the visits on 15 Oct 2026: in 30 days, 321 visitors began on a
 * post and not one opened a second page. A post ended on the email form and
 * more posts, with no way to the product the post was written about. Most of
 * those visits came with no referrer, so many may not be people; the ones
 * who are had nowhere to go.
 */
export function PostNextStep() {
  return (
    <section aria-labelledby="post-product" className="mt-10 border-t border-border pt-8">
      <h2 id="post-product" className="text-small text-foreground">
        The product behind these posts
      </h2>
      <p className="mb-4 mt-1 text-small text-muted-foreground">
        OneCamp is your team&apos;s chat, docs, tasks and calls in one open-source app on your own server, with AI agents that can only do what you can.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLink href={site.demoStartUrl} external variant="brand" size="md" arrow>
          Try the live demo
        </ButtonLink>
        <ButtonLink href="/free" variant="ghost" size="md">
          Install free
        </ButtonLink>
      </div>
      <p className="mb-0 mt-3 text-caption text-muted-foreground">No sign-up · Free for up to {FREE_SEATS} people</p>
    </section>
  );
}
