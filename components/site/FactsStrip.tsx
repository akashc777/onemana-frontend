import Link from "next/link";
import { site } from "@/lib/site";
import type { ReleaseFacts } from "@/lib/releases";
import type { Pricing } from "@/lib/pricing";
import { FREE_SEATS } from "@/lib/freePlan";
import { PriceText } from "@/components/site/RegionalMoney";
import { Arrow, Dot } from "@/components/ui/v3";
import { Icon, type IconName } from "@/components/ui/icons";

/**
 * Plain facts where a logo wall would go (site.md H3): four columns, each a
 * key after a glyph that says what kind of fact it is, and one line of
 * detail. No star count: until it reads in the hundreds, a small number is
 * anti-proof. The release line is read from the public repository, so it
 * cannot claim a release that is not there, and it says "Released in the
 * open" when GitHub does not answer.
 *
 * The glyphs are neutral ink (design v3.1): colour names an area of the
 * product, and a licence, a release pace, a server size and a privacy rule
 * are none. The dots they replaced cycled through the palette and named
 * nothing.
 *
 * The release count is the changelog's (RELEASES.md): feature releases, with
 * patches folded in, so the number is the number of entries the link opens.
 * A pace that high reads as "I'll be updating all the time" to someone who
 * runs their own server, so its detail is the answer: update when you like,
 * in one command, which takes a backup first (make update).
 *
 * Under the facts, the price (the coordinator's ask of 18 Oct 2026): a phone
 * reader met the first price twelve screens down, and the loss is between
 * the demo and paying. So the two prices a team chooses between stand here,
 * under the product, each after a neutral dot (no plan is an area): free up to 25 people, and the
 * licence's rupees with the reader's estimate (PriceText, the one way a
 * sentence writes a price). The estimate ends its line, so when the reader's
 * currency arrives after mount nothing after it moves.
 */
const GLYPH: Record<"licence" | "releases" | "size" | "data", IconName> = {
  licence: "branch",
  releases: "megaphone",
  size: "server",
  data: "lock",
};

export function FactsStrip({ release, pricing }: { release: ReleaseFacts | null; pricing: Pricing }) {
  const facts: { id: keyof typeof GLYPH; key: React.ReactNode; detail: React.ReactNode }[] = [
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
        {facts.map((f) => (
          <div key={f.id}>
            {/* The glyph sits on the key's first line ((26 - 16) / 2 = 5 px
                down), so a key that wraps on a phone keeps it beside its
                first words. */}
            <dt className="flex items-start gap-2 text-body font-[590] text-foreground">
              <Icon name={GLYPH[f.id]} size={16} className="mt-[5px] text-muted-foreground" />
              {f.key}
            </dt>
            <dd className="m-0 mt-1 pl-6 text-[13.5px] leading-5 tracking-[-0.004em] text-muted-foreground">{f.detail}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <p className="m-0 flex flex-col gap-1.5 text-small text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          <span className="flex items-center gap-2">
            <Dot hue="ink" size={7} />
            <span>
              <b className="font-[590] text-foreground">Free</b> for up to {FREE_SEATS} people
            </span>
          </span>
          <span className="flex items-center gap-2">
            <Dot hue="ink" size={7} />
            <span>
              Any number of people:{" "}
              <b className="font-[590] tabular-nums text-foreground">
                <PriceText pricing={pricing} inr={pricing.lifetime_inr} per=" once" />
              </b>
            </span>
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={site.serverGithubUrl} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn-sm ui-btn-secondary max-md:min-h-11">
            <Icon name="star" size={14} />
            Star on GitHub
          </a>
          <Link href="/pricing" className="go tap-target">
            See pricing <Arrow size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
