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
 * from the public repository, so it cannot claim a version that is not
 * there, and it says "Released in the open" when GitHub does not answer.
 * The release dot pings once after load; nothing loops.
 */
export function FactsStrip({ release }: { release: ReleaseFacts | null }) {
  const facts: { key: string; detail: React.ReactNode }[] = [
    {
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
    release
      ? { key: `${release.last30} releases in 30 days`, detail: `The latest shipped on ${release.date}.` }
      : { key: "Released in the open", detail: "Every release is on GitHub." },
    { key: "Runs on 4 GB", detail: "One install command, 10 to 20 minutes." },
    { key: "Your data stays put", detail: "No telemetry. Backups you hold." },
  ];
  return (
    <div>
      <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-5 lg:grid-cols-4 lg:gap-x-8">
        {facts.map((f, i) => (
          <div key={f.key}>
            <dt className="flex items-center gap-2 text-body font-[590] text-foreground">
              <span aria-hidden="true" className={`${HUE_CLASS[FACT_HUES[i]!]} relative inline-flex size-2 shrink-0`}>
                <span className="size-2 rounded-full bg-hue" />
                {i === 1 && <span className="in-ping at-900 absolute -inset-1 rounded-full ring-[1.5px] ring-hue" />}
              </span>
              {f.key}
            </dt>
            <dd className="m-0 mt-1 pl-4 text-[13.5px] leading-5 text-muted-foreground">{f.detail}</dd>
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
