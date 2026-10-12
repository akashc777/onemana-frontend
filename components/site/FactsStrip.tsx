import Link from "next/link";
import { site } from "@/lib/site";
import type { ReleaseFacts } from "@/lib/releases";
import type { CampHue } from "@/lib/campHue";
import { HUE_CLASS } from "@/components/ui/graphics/hues";
import { Arrow } from "@/components/ui/v3";
import { Icon } from "@/components/ui/icons";

/** The strip's four hues, in chart order: the palette introduced as a system (site.md H3). */
export const FACT_HUES: CampHue[] = ["moss", "sky", "sun", "berry"];

/**
 * Plain facts where a logo wall would go (site.md H3): four columns, each a
 * key after a hue dot and one line of detail. No star count: until it reads
 * in the hundreds, a small number is anti-proof. The release line is read
 * from the public repository, so it cannot claim a release that is not
 * there, and it says "Released in the open" when GitHub does not answer.
 * The release dot pings once after load; nothing loops.
 *
 * The release count is the changelog's (RELEASES.md): feature releases, with
 * patches folded in, so the number is the number of entries the link opens.
 * A pace that high reads as "I'll be updating all the time" to someone who
 * runs their own server, so its detail is the answer: update when you like,
 * in one command, which takes a backup first (make update).
 */
export function FactsStrip({ release }: { release: ReleaseFacts | null }) {
  const facts: { id: string; key: React.ReactNode; detail: React.ReactNode }[] = [
    {
      id: "licence",
      key: "AGPL-3.0",
      detail: (
        <>
          The whole product, both editions,{" "}
          <a href={site.serverGithubUrl} target="_blank" rel="noopener noreferrer" className="tap-target underline decoration-line-3 underline-offset-[3px] transition-colors hover:text-foreground">
            on GitHub
          </a>
          .
        </>
      ),
    },
    release && release.last30 >= 2
      ? {
          id: "releases",
          key: (
            <Link href="/changelog" className="tap-target underline decoration-line-3 underline-offset-[3px] transition-colors hover:decoration-current">
              {`${release.last30} releases in 30 days`}
            </Link>
          ),
          detail: "Update when you like: one command, backup first.",
        }
      : { id: "releases", key: "Released in the open", detail: "Every release is on GitHub." },
    { id: "size", key: "Runs on 4 GB", detail: "One install command, 10 to 20 minutes." },
    { id: "data", key: "Your data stays put", detail: "No telemetry. Backups you hold." },
  ];
  return (
    <div>
      <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-5 lg:grid-cols-4 lg:gap-x-8">
        {facts.map((f, i) => (
          <div key={f.id}>
            {/* The dot sits on the key's first line ((26 - 8) / 2 = 9 px down), so
                a key that wraps on a phone keeps it beside its first words. */}
            <dt className="flex items-start gap-2 text-body font-[590] text-foreground">
              <span aria-hidden="true" className={`${HUE_CLASS[FACT_HUES[i]!]} relative mt-[9px] inline-flex size-2 shrink-0`}>
                <span className="size-2 rounded-full bg-hue" />
                {i === 1 && <span className="in-ping at-900 absolute -inset-1 rounded-full ring-[1.5px] ring-hue" />}
              </span>
              {f.key}
            </dt>
            <dd className="m-0 mt-1 pl-4 text-[13.5px] leading-5 tracking-[-0.004em] text-muted-foreground">{f.detail}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 sm:justify-end">
        <a href={site.serverGithubUrl} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn-sm ui-btn-secondary max-md:min-h-11">
          <Icon name="star" size={14} />
          Star on GitHub
        </a>
        <Link href="/pricing" className="go tap-target">
          See pricing <Arrow size={14} />
        </Link>
      </div>
    </div>
  );
}
