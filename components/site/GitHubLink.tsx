import { formatStars, starsInWords } from "@/lib/github";
import { site } from "@/lib/site";
import { ix } from "@/lib/interactive";
import { Tile } from "@/components/ui/graphics/Tile";
import { Icon } from "@/components/ui/icons";

/**
 * What the link is, said in full for a screen reader: whose code it is, the
 * stars when GitHub answered, and that it opens a new tab. It holds the words
 * the link shows ("GitHub", or the count), as a visible label must.
 */
export function githubLabel(stars: number | null): string {
  return `OneCamp on GitHub${stars === null ? "" : `, ${starsInWords(stars)}`} (opens in a new tab)`;
}

/**
 * The nav's way to the code (the owner's ask, 15 Oct 2026): GitHub's mark
 * and the stars of OneCamp's four repositories, added up in lib/github.ts,
 * opening the organisation, where all four are. With no answer from GitHub
 * it says "GitHub" and shows no number rather than a wrong one.
 *
 * Two looks: `bar`, a subtle button beside "Install free" in the desktop bar,
 * quiet so the bar's one button stays the way in; and `menu`, a row of the
 * phone menu like the rows above it, the count at its end.
 */
export function GitHubLink({ stars, look = "bar" }: { stars: number | null; look?: "bar" | "menu" }) {
  const count = stars === null ? null : formatStars(stars);
  if (look === "menu") {
    return (
      <a
        href={site.githubOrgUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={githubLabel(stars)}
        {...ix("nav")}
        className="-mx-2 flex min-h-12 items-center gap-3 rounded-lg px-2 text-body font-[510] text-foreground/90"
      >
        {/* A neutral tile, as the menu's other rows lead with. */}
        <Tile hue="ink" size="sm">
          <Icon name="github" />
        </Tile>
        GitHub
        <span className="ml-auto inline-flex items-center gap-1.5 text-small font-normal tabular-nums text-muted-foreground">
          {count !== null && (
            <>
              <Icon name="star" size={14} />
              {count}
            </>
          )}
          <Icon name="arrow-up-right" size={14} className="opacity-70" />
        </span>
      </a>
    );
  }
  return (
    <a
      href={site.githubOrgUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={githubLabel(stars)}
      className="ui-btn ui-btn-subtle ui-btn-md ml-1 tabular-nums"
    >
      <Icon name="github" size={16} />
      {count === null ? (
        "GitHub"
      ) : (
        <span className="inline-flex items-center gap-1">
          <Icon name="star" size={14} />
          {count}
        </span>
      )}
    </a>
  );
}
